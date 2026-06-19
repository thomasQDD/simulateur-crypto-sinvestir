import "server-only";
import type { Coin, PricePoint } from "./types";

const BASE = "https://api.coingecko.com/api/v3";
const API_KEY = process.env.COINGECKO_API_KEY;

/** Cryptos populaires affichées par défaut (sélecteur). */
const POPULAR_IDS = [
  "bitcoin",
  "ethereum",
  "solana",
  "binancecoin",
  "ripple",
  "cardano",
  "dogecoin",
  "polkadot",
  "chainlink",
  "litecoin",
  "avalanche-2",
  "tron",
];

interface CgFetchOptions {
  revalidate?: number;
}

async function cgFetch<T>(
  path: string,
  { revalidate = 3600 }: CgFetchOptions = {}
): Promise<T> {
  const headers: Record<string, string> = { accept: "application/json" };
  if (API_KEY) headers["x-cg-demo-api-key"] = API_KEY;

  const res = await fetch(`${BASE}${path}`, {
    headers,
    next: { revalidate },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `CoinGecko ${res.status} on ${path}${body ? ` — ${body.slice(0, 200)}` : ""}`
    );
  }
  return res.json() as Promise<T>;
}

interface CgMarket {
  id: string;
  symbol: string;
  name: string;
  image: string;
}

/** Liste des cryptos populaires (avec logo), pour l'état par défaut du sélecteur. */
export async function getPopularCoins(): Promise<Coin[]> {
  const data = await cgFetch<CgMarket[]>(
    `/coins/markets?vs_currency=eur&ids=${POPULAR_IDS.join(
      ","
    )}&order=market_cap_desc&per_page=${POPULAR_IDS.length}&page=1&sparkline=false`,
    { revalidate: 3600 }
  );
  // Conserve l'ordre de POPULAR_IDS
  const byId = new Map(data.map((c) => [c.id, c]));
  return POPULAR_IDS.flatMap((id) => {
    const c = byId.get(id);
    return c ? [{ id: c.id, symbol: c.symbol, name: c.name, thumb: c.image }] : [];
  });
}

interface CgSearchResult {
  coins: { id: string; symbol: string; name: string; thumb: string }[];
}

/** Recherche de cryptos (résultats classés par pertinence, avec logo). */
export async function searchCoins(query: string): Promise<Coin[]> {
  const data = await cgFetch<CgSearchResult>(
    `/search?query=${encodeURIComponent(query)}`,
    { revalidate: 86400 }
  );
  return data.coins.slice(0, 25).map((c) => ({
    id: c.id,
    symbol: c.symbol,
    name: c.name,
    thumb: c.thumb,
  }));
}

interface CgMarketChart {
  prices: [number, number][];
}

/**
 * Série de prix journaliers (EUR) pour une crypto entre deux dates (ISO).
 * Utilise market_chart/range (granularité journalière pour > 90 jours).
 */
export async function getPriceHistory(
  id: string,
  fromIso: string,
  toIso: string
): Promise<PricePoint[]> {
  const from = Math.floor(new Date(fromIso + "T00:00:00Z").getTime() / 1000);
  // +1 jour pour s'assurer que la date de fin est couverte
  const to = Math.floor(new Date(toIso + "T23:59:59Z").getTime() / 1000);

  const data = await cgFetch<CgMarketChart>(
    `/coins/${encodeURIComponent(
      id
    )}/market_chart/range?vs_currency=eur&from=${from}&to=${to}`,
    { revalidate: 21600 } // 6h : données historiques quasi-statiques
  );
  return data.prices;
}
