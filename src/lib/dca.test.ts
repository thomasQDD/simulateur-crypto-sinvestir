import { describe, it, expect } from "vitest";
import { buildPurchaseDates, priceAt, simulate } from "./dca";
import type { PricePoint } from "./types";

const DAY = 24 * 60 * 60 * 1000;

/** Construit une série journalière à prix constant entre deux dates. */
function constantSeries(startIso: string, days: number, price: number): PricePoint[] {
  const start = new Date(startIso + "T00:00:00Z").getTime();
  return Array.from({ length: days }, (_, i) => [start + i * DAY, price] as PricePoint);
}

describe("buildPurchaseDates", () => {
  it("once -> une seule date", () => {
    expect(buildPurchaseDates("2024-01-01", "2024-12-31", "once")).toEqual([
      "2024-01-01",
    ]);
  });

  it("daily -> une date par jour (bornes incluses)", () => {
    expect(buildPurchaseDates("2024-01-01", "2024-01-05", "daily")).toHaveLength(5);
  });

  it("weekly -> tous les 7 jours", () => {
    expect(buildPurchaseDates("2024-01-01", "2024-01-29", "weekly")).toEqual([
      "2024-01-01",
      "2024-01-08",
      "2024-01-15",
      "2024-01-22",
      "2024-01-29",
    ]);
  });

  it("monthly -> même quantième chaque mois", () => {
    expect(buildPurchaseDates("2024-01-15", "2024-04-15", "monthly")).toEqual([
      "2024-01-15",
      "2024-02-15",
      "2024-03-15",
      "2024-04-15",
    ]);
  });

  it("monthly -> clampe le quantième sur les mois courts", () => {
    const dates = buildPurchaseDates("2024-01-31", "2024-03-31", "monthly");
    expect(dates[0]).toBe("2024-01-31");
    expect(dates[1]).toBe("2024-02-29"); // 2024 bissextile
  });

  it("renvoie [] si end < start", () => {
    expect(buildPurchaseDates("2024-02-01", "2024-01-01", "daily")).toEqual([]);
  });
});

describe("priceAt", () => {
  const prices = constantSeries("2024-01-01", 10, 100).map(
    ([t], i) => [t, 100 + i] as PricePoint
  );

  it("renvoie le prix exact à une date présente", () => {
    const t = new Date("2024-01-03T00:00:00Z").getTime();
    expect(priceAt(prices, t)).toBe(102);
  });

  it("borne au premier point si la cible est avant", () => {
    const t = new Date("2020-01-01T00:00:00Z").getTime();
    expect(priceAt(prices, t)).toBe(100);
  });

  it("borne au dernier point si la cible est après", () => {
    const t = new Date("2030-01-01T00:00:00Z").getTime();
    expect(priceAt(prices, t)).toBe(109);
  });
});

describe("simulate", () => {
  it("one-shot : doublement du prix => +100% de performance", () => {
    // prix 100 pendant 30 jours puis on simule jusqu'à un jour à 200
    const series: PricePoint[] = [
      ...constantSeries("2024-01-01", 30, 100),
      [new Date("2024-02-01T00:00:00Z").getTime(), 200],
    ];
    const r = simulate({
      amount: 1000,
      frequency: "once",
      startDate: "2024-01-01",
      endDate: "2024-02-01",
      prices: series,
    });
    expect(r.invested).toBe(1000);
    expect(r.periods).toBe(1);
    expect(r.units).toBeCloseTo(10, 6); // 1000 / 100
    expect(r.averagePrice).toBeCloseTo(100, 6);
    expect(r.finalPrice).toBe(200);
    expect(r.finalValue).toBeCloseTo(2000, 6);
    expect(r.performance).toBeCloseTo(100, 6);
  });

  it("DCA à prix constant : performance nulle, prix moyen = prix", () => {
    const series = constantSeries("2024-01-01", 120, 50);
    const r = simulate({
      amount: 100,
      frequency: "monthly",
      startDate: "2024-01-01",
      endDate: "2024-04-01",
      prices: series,
    });
    expect(r.periods).toBe(4); // jan, fév, mar, avr
    expect(r.invested).toBe(400);
    expect(r.averagePrice).toBeCloseTo(50, 6);
    expect(r.units).toBeCloseTo(8, 6); // 400 / 50
    expect(r.performance).toBeCloseTo(0, 6);
    expect(r.timeline.length).toBeGreaterThan(0);
  });

  it("montant invalide ou pas de prix => résultat vide", () => {
    expect(simulate({ amount: 0, frequency: "once", startDate: "2024-01-01", endDate: "2024-02-01", prices: constantSeries("2024-01-01", 5, 10) }).invested).toBe(0);
    expect(simulate({ amount: 100, frequency: "once", startDate: "2024-01-01", endDate: "2024-02-01", prices: [] }).invested).toBe(0);
  });
});
