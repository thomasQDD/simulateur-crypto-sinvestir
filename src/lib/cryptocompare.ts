import "server-only";
import type { PricePoint } from "./types";

/*
  Prix historiques via CryptoCompare (histoday).
  Pourquoi CryptoCompare et pas CoinGecko pour l'historique ?
  Le plan CoinGecko Demo (gratuit) plafonne l'historique à 365 jours.
  CryptoCompare fournit gratuitement plusieurs années de données journalières
  (jusqu'à 2000 points par appel), en EUR — indispensable pour un simulateur DCA.
  La clé est optionnelle (quota plus élevé si fournie).
*/

const BASE = "https://min-api.cryptocompare.com/data/v2/histoday";
const API_KEY = process.env.CRYPTOCOMPARE_API_KEY;
const MAX_LIMIT = 2000;
const DAY = 86400;

interface CcDay {
  time: number;
  close: number;
}
interface CcResponse {
  Response: string;
  Message?: string;
  Data?: { Data?: CcDay[] };
}

async function fetchChunk(
  symbol: string,
  toTs: number,
  limit: number
): Promise<CcDay[]> {
  const url = `${BASE}?fsym=${encodeURIComponent(
    symbol
  )}&tsym=EUR&limit=${limit}&toTs=${toTs}`;
  const headers: Record<string, string> = {};
  if (API_KEY) headers["authorization"] = `Apikey ${API_KEY}`;

  const res = await fetch(url, { headers, next: { revalidate: 21600 } });
  if (!res.ok) throw new Error(`CryptoCompare ${res.status}`);
  const json = (await res.json()) as CcResponse;
  if (json.Response === "Error") {
    throw new Error(json.Message || "CryptoCompare error");
  }
  return json.Data?.Data ?? [];
}

/**
 * Série de prix journaliers (EUR) entre deux dates (ISO), via pagination
 * par tranches de 2000 jours. Filtre les points sans cotation (close = 0,
 * antérieurs à la cotation de l'actif).
 */
export async function getPriceHistory(
  symbol: string,
  fromIso: string,
  toIso: string
): Promise<PricePoint[]> {
  const fromTs = Math.floor(new Date(fromIso + "T00:00:00Z").getTime() / 1000);
  const toTs = Math.floor(new Date(toIso + "T23:59:59Z").getTime() / 1000);

  const sym = symbol.toUpperCase();
  let cursor = toTs;
  let collected: CcDay[] = [];

  // pagination (rétro-chronologique) jusqu'à couvrir fromTs
  for (let i = 0; i < 6; i++) {
    const span = Math.ceil((cursor - fromTs) / DAY);
    if (span <= 0) break;
    const limit = Math.min(MAX_LIMIT, span);
    const chunk = await fetchChunk(sym, cursor, limit);
    if (chunk.length === 0) break;
    collected = chunk.concat(collected);
    const earliest = chunk[0]?.time;
    if (!earliest || earliest <= fromTs) break;
    cursor = earliest - DAY;
  }

  return collected
    .filter((d) => d.close > 0 && d.time >= fromTs && d.time <= toTs)
    .map((d) => [d.time * 1000, d.close] as PricePoint);
}
