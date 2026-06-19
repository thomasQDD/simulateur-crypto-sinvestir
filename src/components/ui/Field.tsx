import type { ReactNode } from "react";
import { InfoTooltip } from "./InfoTooltip";

export function FieldLabel({ label, info }: { label: string; info?: string }) {
  return (
    <div className="mb-2 flex items-center gap-1.5 text-sm font-light text-white/60">
      <span>{label}</span>
      {info && <InfoTooltip text={info} />}
    </div>
  );
}

/**
 * Champ "underline" comme les simulateurs S'investir :
 * label + ⓘ au-dessus, valeur en grand, unité alignée à droite, trait en bas.
 */
export function Field({
  label,
  info,
  unit,
  children,
}: {
  label: string;
  info?: string;
  unit?: string;
  children: ReactNode;
}) {
  return (
    <div className="w-full">
      <FieldLabel label={label} info={info} />
      <div className="flex items-center gap-3 border-b border-[var(--color-field-border)] transition-colors focus-within:border-accent">
        <div className="min-w-0 flex-1">{children}</div>
        {unit && (
          <span className="shrink-0 text-sm font-light tracking-wide text-white/45">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
