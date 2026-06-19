"use client";

import type { Coin, Frequency } from "@/lib/types";
import { FREQUENCY_LABELS } from "@/lib/types";
import { Field } from "@/components/ui/Field";
import { ChevronDownIcon } from "@/components/ui/icons";
import { CryptoCombobox } from "./CryptoCombobox";

export interface FormState {
  coin: Coin | null;
  amount: number;
  frequency: Frequency;
  startDate: string;
  endDate: string;
}

export function SimulationForm({
  state,
  onChange,
}: {
  state: FormState;
  onChange: (patch: Partial<FormState>) => void;
}) {
  return (
    <div className="flex flex-col gap-7">
      <Field
        label="Actif numérique"
        info="La cryptomonnaie analysée. Plusieurs milliers d'actifs disponibles via la recherche."
      >
        <CryptoCombobox
          value={state.coin}
          onChange={(coin) => onChange({ coin })}
        />
      </Field>

      <Field
        label="Montant"
        unit="EUR"
        info="Montant investi à chaque période (ou en une seule fois selon la fréquence)."
      >
        <input
          type="number"
          min={0}
          step={10}
          value={Number.isFinite(state.amount) ? state.amount : ""}
          onChange={(e) => onChange({ amount: parseFloat(e.target.value) })}
          className="w-full bg-transparent py-2 text-xl font-light text-white outline-none"
          placeholder="100"
        />
      </Field>

      <Field
        label="Fréquence"
        info="Investissement réalisé en une seule fois, ou de façon récurrente (DCA)."
      >
        <div className="relative">
          <select
            value={state.frequency}
            onChange={(e) =>
              onChange({ frequency: e.target.value as Frequency })
            }
            className="w-full appearance-none bg-transparent py-2 pr-8 text-xl font-light text-white outline-none [&>option]:bg-navy-800 [&>option]:text-white"
          >
            {(Object.keys(FREQUENCY_LABELS) as Frequency[]).map((f) => (
              <option key={f} value={f}>
                {FREQUENCY_LABELS[f]}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-white/50" />
        </div>
      </Field>

      <div className="grid grid-cols-1 gap-7 sm:grid-cols-2">
        <Field label="Depuis">
          <input
            type="date"
            value={state.startDate}
            max={state.endDate}
            onChange={(e) => onChange({ startDate: e.target.value })}
            className="w-full bg-transparent py-2 text-lg font-light text-white outline-none [color-scheme:dark]"
          />
        </Field>
        <Field label="Jusqu'au">
          <input
            type="date"
            value={state.endDate}
            min={state.startDate}
            onChange={(e) => onChange({ endDate: e.target.value })}
            className="w-full bg-transparent py-2 text-lg font-light text-white outline-none [color-scheme:dark]"
          />
        </Field>
      </div>
    </div>
  );
}
