"use client";

import type { ReactNode } from "react";
import type { Coin, Frequency, SimulationResult } from "@/lib/types";
import {
  formatEur,
  formatPercent,
  formatUnits,
  formatInvestedLabel,
} from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { InfoTooltip } from "@/components/ui/InfoTooltip";

function StatCard({
  label,
  info,
  children,
  className = "",
}: {
  label: string;
  info?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={className}>
      <div className="mb-3 flex items-center gap-1.5 text-sm font-light text-white/60">
        <span>{label}</span>
        {info && <InfoTooltip text={info} />}
      </div>
      {children}
    </Card>
  );
}

export function ResultsPanel({
  result,
  coin,
  frequency,
  loading,
  error,
}: {
  result: SimulationResult | null;
  coin: Coin | null;
  frequency: Frequency;
  loading: boolean;
  error: string | null;
}) {
  if (error) {
    return (
      <Card className="border-negative/30 bg-negative/5">
        <p className="text-sm font-light text-white/80">
          Impossible de récupérer les données de marché pour cette période.
        </p>
        <p className="mt-1 text-xs font-light text-white/50">{error}</p>
      </Card>
    );
  }

  if (loading || !result) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i} className={i === 0 ? "sm:col-span-2" : ""}>
            <div className="h-4 w-24 animate-pulse rounded bg-white/10" />
            <div className="mt-4 h-8 w-40 animate-pulse rounded bg-white/10" />
          </Card>
        ))}
      </div>
    );
  }

  const gainPositive = result.gain >= 0;
  const total = gainPositive ? result.finalValue : result.invested;
  const bluePct = total > 0 ? (Math.min(result.finalValue, result.invested) / total) * 100 : 0;
  const accentPct = Math.max(0, 100 - bluePct);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {/* Capital final + barre de proportion */}
      <StatCard
        label="Capital final"
        info="Valeur de votre portefeuille à la date de fin, au dernier prix connu."
        className="sm:col-span-2"
      >
        <p className="text-3xl font-semibold text-white sm:text-4xl">
          {formatEur(result.finalValue)}
        </p>
        <div className="mt-5 flex items-center justify-between text-xs font-light">
          <span className="text-white/60">
            Investi{" "}
            <span className="font-medium text-accent">
              {formatEur(result.invested)}
            </span>
          </span>
          <span className="text-white/60">
            {gainPositive ? "Plus-value" : "Moins-value"}{" "}
            <span
              className="font-medium"
              style={{ color: gainPositive ? "var(--color-gold)" : "var(--color-negative)" }}
            >
              {formatEur(result.gain)}
            </span>
          </span>
        </div>
        <div className="mt-2 flex h-3 overflow-hidden rounded-full bg-white/5">
          <span className="h-full bg-accent" style={{ width: `${bluePct}%` }} />
          <span
            className="h-full"
            style={{
              width: `${accentPct}%`,
              backgroundColor: gainPositive
                ? "var(--color-gold)"
                : "var(--color-negative)",
            }}
          />
        </div>
      </StatCard>

      {/* Performance */}
      <StatCard
        label="Performance"
        info="Évolution en pourcentage : (capital final − investi) / investi."
      >
        <p
          className="text-3xl font-semibold sm:text-4xl"
          style={{ color: gainPositive ? "var(--color-positive)" : "var(--color-negative)" }}
        >
          {formatPercent(result.performance)}
        </p>
      </StatCard>

      {/* Prix moyen d'acquisition */}
      <StatCard
        label="Prix moyen d'acquisition"
        info="Montant total investi divisé par la quantité totale acquise."
      >
        <p className="text-2xl font-semibold text-white sm:text-3xl">
          {formatEur(result.averagePrice)}
        </p>
      </StatCard>

      {/* Acquis */}
      <StatCard
        label="Acquis"
        info="Quantité totale de crypto accumulée sur la période."
      >
        <p className="text-2xl font-semibold text-white sm:text-3xl">
          {formatUnits(result.units, coin?.symbol)}
        </p>
      </StatCard>

      {/* Investi */}
      <StatCard label="Investi">
        <p className="text-2xl font-semibold text-white sm:text-3xl">
          {formatEur(result.invested)}
        </p>
        <p className="mt-1 text-xs font-light text-white/50">
          {formatInvestedLabel(result.periods, frequency)}
        </p>
      </StatCard>

      {/* Récapitulatif */}
      <Card className="sm:col-span-2">
        <p className="text-center text-sm font-light leading-relaxed text-white/70">
          Un investissement de{" "}
          <strong className="font-medium text-white">{formatEur(result.invested)}</strong>{" "}
          sur <strong className="font-medium text-white">{coin?.name}</strong>{" "}
          {formatInvestedLabel(result.periods, frequency)} vaudrait{" "}
          <strong className="font-medium text-white">{formatEur(result.finalValue)}</strong>,
          soit une performance de{" "}
          <strong
            className="font-medium"
            style={{ color: gainPositive ? "var(--color-positive)" : "var(--color-negative)" }}
          >
            {formatPercent(result.performance)}
          </strong>{" "}
          sur la période.
        </p>
      </Card>
    </div>
  );
}
