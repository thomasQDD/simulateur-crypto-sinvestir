"use client";

import { useState } from "react";
import { InfoIcon } from "./icons";

export function InfoTooltip({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label={text}
        className="text-white/40 transition-colors hover:text-white/80"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={(e) => {
          e.preventDefault();
          setOpen((v) => !v);
        }}
      >
        <InfoIcon width={14} height={14} />
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 z-30 mb-2 w-56 -translate-x-1/2 rounded-lg border border-white/10 bg-navy-800 px-3 py-2 text-xs font-light leading-relaxed text-white/80 shadow-xl"
        >
          {text}
        </span>
      )}
    </span>
  );
}
