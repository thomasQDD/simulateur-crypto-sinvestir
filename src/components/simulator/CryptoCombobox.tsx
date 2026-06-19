"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { Coin } from "@/lib/types";
import { ChevronDownIcon, SearchIcon } from "@/components/ui/icons";

export function CryptoCombobox({
  value,
  onChange,
}: {
  value: Coin | null;
  onChange: (coin: Coin) => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fermeture au clic extérieur
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Recherche (debounce) — liste populaire si query vide
  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const handle = setTimeout(async () => {
      if (!cancelled) setLoading(true);
      try {
        const res = await fetch(
          `/api/coins${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ""}`
        );
        const data = await res.json();
        if (!cancelled) setResults(data.coins ?? []);
      } catch {
        if (!cancelled) setResults([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(handle);
    };
  }, [query, open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 py-2 text-left text-xl font-light text-white"
      >
        <span className="flex min-w-0 items-center gap-2.5">
          {value?.thumb && (
            <Image
              src={value.thumb}
              alt=""
              width={24}
              height={24}
              className="h-6 w-6 rounded-full"
              unoptimized
            />
          )}
          <span className="truncate">
            {value ? `${value.name} (${value.symbol.toUpperCase()})` : "Choisir une crypto"}
          </span>
        </span>
        <ChevronDownIcon
          className={`shrink-0 text-white/50 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-40 overflow-hidden rounded-xl border border-white/10 bg-navy-800 shadow-2xl">
          <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2.5">
            <SearchIcon width={16} height={16} className="text-white/40" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher (Bitcoin, ETH, Solana…)"
              className="w-full bg-transparent text-sm font-light text-white outline-none placeholder:text-white/40"
            />
          </div>
          <ul className="max-h-72 overflow-y-auto py-1">
            {loading && (
              <li className="px-4 py-3 text-sm font-light text-white/50">
                Recherche…
              </li>
            )}
            {!loading && results.length === 0 && (
              <li className="px-4 py-3 text-sm font-light text-white/50">
                Aucun résultat
              </li>
            )}
            {!loading &&
              results.map((coin) => (
                <li key={coin.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(coin);
                      setOpen(false);
                      setQuery("");
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-light text-white/85 transition-colors hover:bg-white/[0.06]"
                  >
                    {coin.thumb && (
                      <Image
                        src={coin.thumb}
                        alt=""
                        width={20}
                        height={20}
                        className="h-5 w-5 rounded-full"
                        unoptimized
                      />
                    )}
                    <span className="truncate">{coin.name}</span>
                    <span className="ml-auto shrink-0 text-xs uppercase text-white/40">
                      {coin.symbol}
                    </span>
                  </button>
                </li>
              ))}
          </ul>
        </div>
      )}
    </div>
  );
}
