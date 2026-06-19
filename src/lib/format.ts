const eurFormatter = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const eurCompact = new Intl.NumberFormat("fr-FR", {
  style: "currency",
  currency: "EUR",
  notation: "compact",
  maximumFractionDigits: 1,
});

const percentFormatter = new Intl.NumberFormat("fr-FR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatEur(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return eurFormatter.format(value);
}

export function formatEurCompact(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return eurCompact.format(value);
}

export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${percentFormatter.format(value)} %`;
}

/** Quantité de crypto : précision adaptée à la taille de la valeur */
export function formatUnits(value: number, symbol?: string): string {
  if (!Number.isFinite(value)) return "—";
  const digits = value >= 1 ? 4 : value >= 0.0001 ? 8 : 10;
  const formatted = new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: digits,
  }).format(value);
  return symbol ? `${formatted} ${symbol.toUpperCase()}` : formatted;
}

/** "2 500,00 € en 25 mois" — libellé du montant investi avec nb de périodes */
export function formatInvestedLabel(periods: number, frequency: string): string {
  const map: Record<string, [string, string]> = {
    daily: ["jour", "jours"],
    weekly: ["semaine", "semaines"],
    monthly: ["mois", "mois"],
  };
  if (frequency === "once" || periods <= 1) return "en une seule fois";
  const [singular, plural] = map[frequency] ?? ["période", "périodes"];
  return `en ${periods} ${periods > 1 ? plural : singular}`;
}

export function formatDateFr(iso: string): string {
  const d = new Date(iso + "T00:00:00");
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}
