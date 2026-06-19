export type Frequency = "once" | "daily" | "weekly" | "monthly";

export interface Coin {
  id: string;
  symbol: string;
  name: string;
  thumb?: string;
}

/** Point de prix : [timestamp ms, prix en devise] */
export type PricePoint = [number, number];

export interface SimulationInput {
  coin: Coin;
  /** Montant investi par période (ou en une fois), en devise */
  amount: number;
  frequency: Frequency;
  /** ISO date "YYYY-MM-DD" */
  startDate: string;
  endDate: string;
}

/** Un achat effectué à une date donnée */
export interface Purchase {
  date: string; // ISO YYYY-MM-DD
  price: number; // prix unitaire de la crypto ce jour-là
  invested: number; // montant investi ce jour-là
  units: number; // quantité de crypto acquise ce jour-là
  cumulativeUnits: number; // quantité cumulée jusqu'à cet achat inclus
  cumulativeInvested: number; // montant cumulé investi jusqu'à cet achat inclus
}

/** Point de la série temporelle pour le graphe */
export interface TimelinePoint {
  date: string;
  invested: number; // cumul investi (€)
  value: number; // valeur du portefeuille (€)
  units: number; // quantité de crypto cumulée
}

export interface SimulationResult {
  invested: number; // total investi
  periods: number; // nombre d'achats
  units: number; // quantité totale de crypto acquise
  averagePrice: number; // prix moyen d'acquisition
  finalPrice: number; // prix de la crypto à la date de fin
  finalValue: number; // capital final
  gain: number; // plus/moins-value (finalValue - invested)
  performance: number; // performance en %
  purchases: Purchase[];
  timeline: TimelinePoint[];
}

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  once: "Une seule fois",
  daily: "Par jour",
  weekly: "Par semaine",
  monthly: "Par mois",
};
