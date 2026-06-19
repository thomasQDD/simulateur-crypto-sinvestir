"use client";

import type { Coin, SimulationResult } from "@/lib/types";
import { formatEur, formatUnits, formatDateFr } from "@/lib/format";

export function CalendarView({
  result,
  coin,
}: {
  result: SimulationResult;
  coin: Coin | null;
}) {
  if (result.purchases.length === 0) {
    return (
      <p className="py-8 text-center text-sm font-light text-white/40">
        Aucun achat sur la période sélectionnée.
      </p>
    );
  }

  return (
    <div className="overflow-hidden rounded-[15px] border border-white/10">
      <div className="max-h-[420px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-navy-800 text-left text-xs font-light uppercase tracking-wide text-white/50">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3 text-right">Prix unitaire</th>
              <th className="px-4 py-3 text-right">Investi</th>
              <th className="px-4 py-3 text-right">Quantité acquise</th>
              <th className="px-4 py-3 text-right">Cumul</th>
            </tr>
          </thead>
          <tbody className="font-light text-white/80">
            {result.purchases.map((p, i) => (
              <tr key={p.date + i} className="border-t border-white/5">
                <td className="px-4 py-2.5">{formatDateFr(p.date)}</td>
                <td className="px-4 py-2.5 text-right">{formatEur(p.price)}</td>
                <td className="px-4 py-2.5 text-right">{formatEur(p.invested)}</td>
                <td className="px-4 py-2.5 text-right">
                  {formatUnits(p.units, coin?.symbol)}
                </td>
                <td className="px-4 py-2.5 text-right text-white/60">
                  {formatUnits(p.cumulativeUnits, coin?.symbol)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
