import { NextResponse } from "next/server";
import { getPopularCoins, searchCoins } from "@/lib/coingecko";

export const revalidate = 3600;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  try {
    const coins = q && q.length >= 1 ? await searchCoins(q) : await getPopularCoins();
    return NextResponse.json({ coins });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur CoinGecko" },
      { status: 502 }
    );
  }
}
