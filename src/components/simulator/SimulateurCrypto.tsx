"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Coin, Frequency, PricePoint, SimulationResult } from "@/lib/types";
import { simulate } from "@/lib/dca";
import { formatEur, formatPercent } from "@/lib/format";
import { Segmented } from "@/components/ui/Segmented";
import { Card } from "@/components/ui/Card";
import { InfoIcon, ChartAreaIcon, CalendarIcon } from "@/components/ui/icons";
import { SimulationForm, type FormState } from "./SimulationForm";
import { ResultsPanel } from "./ResultsPanel";
import { PerformanceChart } from "./PerformanceChart";
import { CalendarView } from "./CalendarView";

const DEFAULT_COIN: Coin = {
  id: "bitcoin",
  symbol: "btc",
  name: "Bitcoin",
  thumb:
    "https://coin-images.coingecko.com/coins/images/1/thumb/bitcoin.png",
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

interface Props {
  embedded?: boolean;
}

export function SimulateurCrypto({ embedded = false }: Props) {
  const [state, setState] = useState<FormState>({
    coin: DEFAULT_COIN,
    amount: 100,
    frequency: "monthly",
    startDate: "2023-01-01",
    endDate: todayIso(),
  });

  const [prices, setPrices] = useState<PricePoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<"chart" | "calendar">("chart");
  const [toast, setToast] = useState<string | null>(null);

  // Lecture des paramètres d'URL au montage (deep-link partagé)
  useEffect(() => {
    const applyUrlParams = () => {
      const sp = new URLSearchParams(window.location.search);
      const patch: Partial<FormState> = {};
      const amount = sp.get("amount");
      const freq = sp.get("freq");
      const from = sp.get("from");
      const to = sp.get("to");
      const id = sp.get("coin");
      const sym = sp.get("sym");
      const name = sp.get("name");
      if (amount && !Number.isNaN(+amount)) patch.amount = +amount;
      if (freq) patch.frequency = freq as Frequency;
      if (from) patch.startDate = from;
      if (to) patch.endDate = to;
      if (id && name) patch.coin = { id, symbol: sym ?? id, name };
      if (Object.keys(patch).length) setState((s) => ({ ...s, ...patch }));
    };
    applyUrlParams();
  }, []);

  const onChange = useCallback((patch: Partial<FormState>) => {
    setState((s) => ({ ...s, ...patch }));
  }, []);

  // Récupération des prix quand la crypto ou la période change
  const { coin, startDate, endDate } = state;
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!coin || !coin.symbol || !startDate || !endDate || startDate > endDate) {
        setError(null);
        setPrices([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/history?sym=${encodeURIComponent(coin.symbol)}&from=${startDate}&to=${endDate}`
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Erreur de récupération");
        if (!cancelled) setPrices(data.prices ?? []);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Erreur inconnue");
          setPrices([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [coin, startDate, endDate]);

  const result: SimulationResult | null = useMemo(() => {
    if (prices.length === 0) return null;
    return simulate({
      amount: state.amount,
      frequency: state.frequency,
      startDate: state.startDate,
      endDate: state.endDate,
      prices,
    });
  }, [prices, state.amount, state.frequency, state.startDate, state.endDate]);

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  }

  function handleShare() {
    const { coin, amount, frequency, startDate, endDate } = state;
    const params = new URLSearchParams({
      coin: coin?.id ?? "",
      sym: coin?.symbol ?? "",
      name: coin?.name ?? "",
      amount: String(amount),
      freq: frequency,
      from: startDate,
      to: endDate,
    });
    const url = `${window.location.origin}${window.location.pathname}?${params}`;
    navigator.clipboard?.writeText(url).then(
      () => showToast("Lien de la simulation copié dans le presse-papier."),
      () => showToast("Copie impossible — copiez l'URL manuellement.")
    );
  }

  function handleSave() {
    try {
      const saved = JSON.parse(localStorage.getItem("sim-crypto") || "[]");
      saved.unshift({ ...state, savedAt: new Date().toISOString() });
      localStorage.setItem("sim-crypto", JSON.stringify(saved.slice(0, 20)));
      showToast("Simulation enregistrée localement (démo, sans compte).");
    } catch {
      showToast("Enregistrement impossible.");
    }
  }

  return (
    <div className={embedded ? "mx-auto max-w-5xl" : "mx-auto max-w-6xl"}>
      {/* Titre */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-4">
          <span className="hidden h-px w-16 bg-gradient-to-r from-transparent to-accent sm:block" />
          <h1 className="text-xl font-medium uppercase tracking-wide text-white sm:text-2xl lg:text-3xl">
            Simulateur Plus-Value Crypto
          </h1>
          <span className="hidden h-px w-16 bg-gradient-to-l from-transparent to-accent sm:block" />
        </div>
        <p className="mt-3 text-base font-light text-accent sm:text-lg">
          Calculez vos gains crypto en DCA ou en une seule fois
        </p>
        <p className="mx-auto mt-3 max-w-2xl text-sm font-light leading-relaxed text-white/60">
          Analysez l&apos;évolution passée d&apos;un scénario d&apos;investissement à partir
          de données de marché historiques, sur Bitcoin, Ethereum et des milliers de
          cryptomonnaies.
        </p>
      </div>

      {/* Encart pédagogique */}
      <div className="mx-auto mt-6 flex max-w-3xl items-start gap-3 rounded-[15px] border border-white/10 bg-white/[0.03] px-5 py-4 text-xs font-light leading-relaxed text-white/55">
        <InfoIcon className="mt-0.5 shrink-0 text-accent" width={18} height={18} />
        <p>
          Cet outil a une vocation pédagogique. Il illustre les mécanismes d&apos;un
          investissement à partir de données passées et ne constitue ni un conseil en
          investissement ni une promesse de performance. Les crypto-actifs sont très
          volatils : risque de perte en capital.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        {/* Colonne formulaire + boutons */}
        <div>
          <SimulationForm state={state} onChange={onChange} />
          <div className="mt-8 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={handleSave}
              className="w-full rounded-full bg-primary px-4 py-4 text-sm font-light text-white transition-colors hover:bg-primary-600"
            >
              Enregistrer la simulation
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="w-full rounded-full bg-white px-4 py-4 text-sm font-light text-navy-950 transition-colors hover:bg-white/90"
            >
              Partager mes résultats
            </button>
          </div>
        </div>

        {/* Colonne résultats : "Vos résultats" placé APRÈS le formulaire/boutons (comme la suite S'investir) */}
        <div>
          <h2 className="mb-5 flex items-center gap-3 text-2xl font-normal text-white">
            <span className="h-6 w-1 rounded-full bg-accent" />
            Vos résultats
          </h2>
          <ResultsPanel
            result={result}
            coin={state.coin}
            frequency={state.frequency}
            loading={loading}
            error={error}
          />
        </div>
      </div>

      {/* Graphiques / Calendrier */}
      {result && !error && (
        <div className="mt-12">
          <div className="flex justify-center">
            <Segmented
              value={view}
              onChange={setView}
              options={[
                { value: "chart", label: "Graphiques", icon: <ChartAreaIcon width={16} height={16} /> },
                { value: "calendar", label: "Calendrier", icon: <CalendarIcon width={16} height={16} /> },
              ]}
            />
          </div>

          <div className="mt-6 flex flex-wrap items-end justify-center gap-8 text-center">
            <div>
              <p className="text-xs font-light text-white/50">Capital final</p>
              <p className="text-lg font-semibold text-white">
                {formatEur(result.finalValue)}
              </p>
            </div>
            <div>
              <p className="text-xs font-light text-white/50">Investi</p>
              <p className="text-lg font-semibold text-white">
                {formatEur(result.invested)}
              </p>
            </div>
            <div>
              <p className="text-xs font-light text-white/50">Performance</p>
              <p
                className="text-lg font-semibold"
                style={{
                  color:
                    result.gain >= 0 ? "var(--color-positive)" : "var(--color-negative)",
                }}
              >
                {formatPercent(result.performance)}
              </p>
            </div>
          </div>

          <Card className="mt-6">
            {view === "chart" ? (
              <PerformanceChart timeline={result.timeline} symbol={state.coin?.symbol} />
            ) : (
              <CalendarView result={result} coin={state.coin} />
            )}
          </Card>
        </div>
      )}

      {/* Disclaimer */}
      <p className="mx-auto mt-10 max-w-3xl text-center text-xs font-light leading-relaxed text-white/35">
        L&apos;illustration graphique et les résultats présentés ne constituent pas un
        indicateur fiable des performances futures. Ils ont uniquement pour objectif
        d&apos;illustrer les mécanismes d&apos;un investissement sur une période donnée. Les
        performances passées ne préjugent pas des performances futures.
      </p>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-white/15 bg-navy-800 px-5 py-3 text-sm font-light text-white shadow-2xl">
          {toast}
        </div>
      )}
    </div>
  );
}
