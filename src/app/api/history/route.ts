import { NextResponse } from "next/server";
import { getPriceHistory } from "@/lib/prices";

export const revalidate = 21600;

const ISO = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const sym = searchParams.get("sym")?.trim();
  const from = searchParams.get("from")?.trim();
  const to = searchParams.get("to")?.trim();

  if (!sym || !from || !to || !ISO.test(from) || !ISO.test(to)) {
    return NextResponse.json(
      { error: "Paramètres requis : sym, from (YYYY-MM-DD), to (YYYY-MM-DD)" },
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
    const prices = await getPriceHistory(sym, from, to);
    if (prices.length === 0) {
      return NextResponse.json(
        { error: `Aucune donnée de prix disponible pour ${sym.toUpperCase()} sur cette période.` },
        { status: 404 }
      );
    }
    return NextResponse.json({ prices });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur de données" },
      { status: 502 }
    );
  }
}
