import { NextResponse } from "next/server";
import { getPriceHistory } from "@/lib/coingecko";

export const revalidate = 21600;

const ISO = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id")?.trim();
  const from = searchParams.get("from")?.trim();
  const to = searchParams.get("to")?.trim();

  if (!id || !from || !to || !ISO.test(from) || !ISO.test(to)) {
    return NextResponse.json(
      { error: "Paramètres requis : id, from (YYYY-MM-DD), to (YYYY-MM-DD)" },
      { status: 400 }
    );
  }
  if (from > to) {
    return NextResponse.json(
      { error: "La date de début doit précéder la date de fin." },
      { status: 400 }
    );
  }

  try {
    const prices = await getPriceHistory(id, from, to);
    return NextResponse.json({ prices });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur CoinGecko" },
      { status: 502 }
    );
  }
}
