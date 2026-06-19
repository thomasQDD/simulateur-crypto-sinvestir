import "server-only";
import type { PricePoint } from "./types";
import { getPriceHistory as fromCoinbase } from "./coinbase";
import { getPriceHistory as fromCryptoCompare } from "./cryptocompare";

/*
  Orchestrateur des sources de prix historiques.
  1. Coinbase (gratuit, sans clé, EUR, multi-années) — couvre les principales cryptos.
  2. Repli sur CryptoCompare si une clé est configurée — couverture étendue (milliers d'actifs).
*/
export async function getPriceHistory(
  symbol: string,
  fromIso: string,
  toIso: string
): Promise<PricePoint[]> {
  try {
    const data = await fromCoinbase(symbol, fromIso, toIso);
    if (data.length > 0) return data;
  } catch {
    // actif non coté en EUR sur Coinbase -> on tente le repli
  }

  if (process.env.CRYPTOCOMPARE_API_KEY) {
    return fromCryptoCompare(symbol, fromIso, toIso);
  }

  throw new Error(
    `Historique EUR indisponible pour ${symbol.toUpperCase()}. ` +
      `Essayez une crypto majeure (BTC, ETH, SOL…) ou configurez CRYPTOCOMPARE_API_KEY.`
  );
}
