import "server-only";
import type { PricePoint } from "./types";

/*
  Prix historiques journaliers via l'API publique Coinbase Exchange.
  Avantages : gratuit, SANS clé, cotations en EUR, plusieurs années d'historique,
  et accessible depuis les serveurs cloud (contrairement à Binance qui géo-bloque).
  Limite : 300 bougies par requête -> pagination par fenêtres de 300 jours.
  Couverture : actifs cotés sur Coinbase en paire EUR (les principales cryptos).
*/

const BASE = "https://api.exchange.coinbase.com";
const DAY_MS = 86_400_000;
const WINDOW = 300; // max bougies par requête

export async function getPriceHistory(
  symbol: string,
  fromIso: string,
  toIso: string
): Promise<PricePoint[]> {
  const product = `${symbol.toUpperCase()}-EUR`;
  const fromMs = new Date(fromIso + "T00:00:00Z").getTime();
  const toMs = new Date(toIso + "T23:59:59Z").getTime();

  const closes = new Map<number, number>(); // time(s) -> close
  let winStart = fromMs;

  for (let i = 0; i < 12 && winStart <= toMs; i++) {
    const winEnd = Math.min(winStart + (WINDOW - 1) * DAY_MS, toMs);
    const url =
      `${BASE}/products/${product}/candles?granularity=86400` +
      `&start=${new Date(winStart).toISOString()}` +
      `&end=${new Date(winEnd).toISOString()}`;

    const res = await fetch(url, {
      headers: { "User-Agent": "sinvestir-simulateur" },
      next: { revalidate: 21600 },
    });
    if (res.status === 404) {
      throw new Error(`Pas de marché EUR pour ${symbol.toUpperCase()} sur Coinbase.`);
    }
    if (!res.ok) throw new Error(`Coinbase ${res.status}`);

    // chaque bougie : [time, low, high, open, close, volume]
    const rows = (await res.json()) as number[][];
    for (const r of rows) closes.set(r[0], r[4]);

    winStart = winEnd + DAY_MS;
  }

  return [...closes.entries()]
    .filter(([t, c]) => c > 0 && t * 1000 >= fromMs && t * 1000 <= toMs)
    .sort((a, b) => a[0] - b[0])
    .map(([t, c]) => [t * 1000, c] as PricePoint);
}
