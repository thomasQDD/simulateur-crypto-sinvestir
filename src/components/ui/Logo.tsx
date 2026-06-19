export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3 select-none">
      <span className="relative inline-flex h-9 w-9 items-center justify-center">
        <svg viewBox="0 0 40 40" className="h-9 w-9" aria-hidden>
          <path
            d="M20 2 35 11v18L20 38 5 29V11z"
            fill="none"
            stroke="rgba(248,208,71,0.55)"
            strokeWidth="1"
          />
        </svg>
        <span
          className="absolute font-display text-[22px] font-bold leading-none"
          style={{ color: "var(--color-gold)" }}
        >
          S<span className="align-super text-[12px]">&apos;</span>
        </span>
      </span>
      {!compact && (
        <span className="font-display text-lg font-semibold tracking-[0.18em] text-white">
          SIMULATEURS
        </span>
      )}
    </div>
  );
}
