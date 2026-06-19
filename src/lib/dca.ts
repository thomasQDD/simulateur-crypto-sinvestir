import type {
  Frequency,
  PricePoint,
  Purchase,
  SimulationResult,
  TimelinePoint,
} from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;

function toIso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function parseIso(iso: string): Date {
  return new Date(iso + "T00:00:00Z");
}

/**
 * Génère la liste des dates d'achat (ISO) entre start et end selon la fréquence.
 * - once    : uniquement la date de début
 * - daily   : chaque jour
 * - weekly  : tous les 7 jours à partir du début
 * - monthly : même quantième chaque mois (clampé en fin de mois)
 */
export function buildPurchaseDates(
  startIso: string,
  endIso: string,
  frequency: Frequency
): string[] {
  const start = parseIso(startIso);
  const end = parseIso(endIso);
  if (end < start) return [];
  if (frequency === "once") return [startIso];

  const dates: string[] = [];

  if (frequency === "monthly") {
    const day = start.getUTCDate();
    const cursor = new Date(start);
    while (cursor <= end) {
      dates.push(toIso(cursor));
      const targetMonth = cursor.getUTCMonth() + 1;
      const year = cursor.getUTCFullYear() + Math.floor(targetMonth / 12);
      const month = targetMonth % 12;
      // clamp le quantième pour les mois plus courts (ex. 31 -> 28/30)
      const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
      cursor.setUTCFullYear(year, month, Math.min(day, daysInMonth));
    }
    return dates;
  }

  const step = frequency === "weekly" ? 7 : 1;
  for (let t = start.getTime(); t <= end.getTime(); t += step * DAY_MS) {
    dates.push(toIso(new Date(t)));
  }
  return dates;
}

/**
 * Renvoie le prix le plus proche (en date) d'un timestamp cible.
 * prices doit être trié par timestamp croissant.
 */
export function priceAt(prices: PricePoint[], targetMs: number): number | null {
  if (prices.length === 0) return null;
  let lo = 0;
  let hi = prices.length - 1;
  if (targetMs <= prices[0][0]) return prices[0][1];
  if (targetMs >= prices[hi][0]) return prices[hi][1];
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (prices[mid][0] === targetMs) return prices[mid][1];
    if (prices[mid][0] < targetMs) lo = mid + 1;
    else hi = mid - 1;
  }
  // lo = premier > target, hi = dernier < target -> on prend le plus proche
  const before = prices[hi];
  const after = prices[lo];
  return targetMs - before[0] <= after[0] - targetMs ? before[1] : after[1];
}

/** Sous-échantillonne une série pour limiter le nombre de points du graphe. */
function downsample<T>(arr: T[], maxPoints: number): T[] {
  if (arr.length <= maxPoints) return arr;
  const step = (arr.length - 1) / (maxPoints - 1);
  const out: T[] = [];
  for (let i = 0; i < maxPoints; i++) out.push(arr[Math.round(i * step)]);
  return out;
}

export interface SimulateArgs {
  amount: number;
  frequency: Frequency;
  startDate: string;
  endDate: string;
  prices: PricePoint[];
  maxTimelinePoints?: number;
}

/**
 * Cœur de la simulation : calcule investi, quantité acquise, prix moyen,
 * capital final, performance + la série temporelle pour le graphe.
 * Fonction pure : aucune dépendance réseau, entièrement testable.
 */
export function simulate({
  amount,
  frequency,
  startDate,
  endDate,
  prices,
  maxTimelinePoints = 400,
}: SimulateArgs): SimulationResult {
  const empty: SimulationResult = {
    invested: 0,
    periods: 0,
    units: 0,
    averagePrice: 0,
    finalPrice: 0,
    finalValue: 0,
    gain: 0,
    performance: 0,
    purchases: [],
    timeline: [],
  };

  if (!Number.isFinite(amount) || amount <= 0 || prices.length === 0) {
    return empty;
  }

  const purchaseDates = buildPurchaseDates(startDate, endDate, frequency);
  if (purchaseDates.length === 0) return empty;

  const purchases: Purchase[] = [];
  let runningUnits = 0;
  for (const date of purchaseDates) {
    const price = priceAt(prices, parseIso(date).getTime());
    if (price == null || price <= 0) continue;
    const units = amount / price;
    runningUnits += units;
    purchases.push({
      date,
      price,
      invested: amount,
      units,
      cumulativeUnits: runningUnits,
    });
  }
  if (purchases.length === 0) return empty;

  const invested = purchases.reduce((s, p) => s + p.invested, 0);
  const units = purchases.reduce((s, p) => s + p.units, 0);
  const averagePrice = units > 0 ? invested / units : 0;

  const finalPrice =
    priceAt(prices, parseIso(endDate).getTime()) ??
    prices[prices.length - 1][1];
  const finalValue = units * finalPrice;
  const gain = finalValue - invested;
  const performance = invested > 0 ? (gain / invested) * 100 : 0;

  // Timeline : à chaque point de prix dans [start, end], valeur du portefeuille
  // = unités cumulées (achats <= date) * prix du jour, vs investi cumulé.
  const startMs = parseIso(startDate).getTime();
  const endMs = parseIso(endDate).getTime();
  const windowPrices = prices.filter(([t]) => t >= startMs && t <= endMs);
  const series = windowPrices.length > 0 ? windowPrices : prices;

  const sortedPurchases = [...purchases].sort(
    (a, b) => parseIso(a.date).getTime() - parseIso(b.date).getTime()
  );

  const timelineFull: TimelinePoint[] = [];
  let pIdx = 0;
  let cumUnits = 0;
  let cumInvested = 0;
  for (const [ts, price] of series) {
    while (
      pIdx < sortedPurchases.length &&
      parseIso(sortedPurchases[pIdx].date).getTime() <= ts
    ) {
      cumUnits += sortedPurchases[pIdx].units;
      cumInvested += sortedPurchases[pIdx].invested;
      pIdx++;
    }
    timelineFull.push({
      date: toIso(new Date(ts)),
      invested: cumInvested,
      value: cumUnits * price,
    });
  }

  return {
    invested,
    periods: purchases.length,
    units,
    averagePrice,
    finalPrice,
    finalValue,
    gain,
    performance,
    purchases,
    timeline: downsample(timelineFull, maxTimelinePoints),
  };
}
