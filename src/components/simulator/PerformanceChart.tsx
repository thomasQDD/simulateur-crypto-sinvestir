"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { TimelinePoint } from "@/lib/types";
import { formatEur, formatEurCompact, formatUnits, formatDateFr } from "@/lib/format";

const PAD = { top: 16, right: 66, bottom: 30, left: 66 };
const HEIGHT = 360;

type SeriesKey = "value" | "invested" | "units";
type Axis = "eur" | "units";

interface SeriesDef {
  key: SeriesKey;
  label: string;
  color: string;
  axis: Axis;
  area?: boolean;
  dashed?: boolean;
}

const SERIES: SeriesDef[] = [
  { key: "value", label: "Valeur du portefeuille", color: "#1098f7", axis: "eur", area: true },
  { key: "invested", label: "Montant investi", color: "#f8d047", axis: "eur", dashed: true },
  { key: "units", label: "Quantité acquise", color: "#a78bfa", axis: "units" },
];

function niceUnits(v: number): string {
  if (!Number.isFinite(v)) return "—";
  const digits = v >= 1 ? 2 : v >= 0.01 ? 4 : 6;
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: digits }).format(v);
}

export function PerformanceChart({
  timeline,
  symbol,
}: {
  timeline: TimelinePoint[];
  symbol?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(720);
  const [hover, setHover] = useState<number | null>(null);
  const [visible, setVisible] = useState<Record<SeriesKey, boolean>>({
    value: true,
    invested: true,
    units: true,
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => setWidth(entries[0].contentRect.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const n = timeline.length;
  const innerW = Math.max(0, width - PAD.left - PAD.right);
  const innerH = HEIGHT - PAD.top - PAD.bottom;

  // Échelles : € à droite (valeur + investi), unités à gauche (quantité)
  const { eurMax, unitsMax } = useMemo(() => {
    let e = 0;
    let u = 0;
    for (const p of timeline) {
      if (visible.value) e = Math.max(e, p.value);
      if (visible.invested) e = Math.max(e, p.invested);
      if (visible.units) u = Math.max(u, p.units);
    }
    return { eurMax: e * 1.08 || 1, unitsMax: u * 1.08 || 1 };
  }, [timeline, visible]);

  if (n < 2) {
    return (
      <div ref={ref} className="flex h-[360px] items-center justify-center text-sm font-light text-white/40">
        Pas assez de données pour tracer un graphique.
      </div>
    );
  }

  const x = (i: number) => PAD.left + (i / (n - 1)) * innerW;
  const yEur = (v: number) => PAD.top + innerH - (v / eurMax) * innerH;
  const yUnits = (v: number) => PAD.top + innerH - (v / unitsMax) * innerH;
  const yOf = (def: SeriesDef, v: number) => (def.axis === "eur" ? yEur(v) : yUnits(v));

  const linePath = (def: SeriesDef) =>
    timeline.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${yOf(def, p[def.key])}`).join(" ");
  const areaPath = (def: SeriesDef) =>
    `M${x(0)},${yOf(def, 0)} ` +
    timeline.map((p, i) => `L${x(i)},${yOf(def, p[def.key])}`).join(" ") +
    ` L${x(n - 1)},${yOf(def, 0)} Z`;

  const ticks = 4;
  const eurVisible = visible.value || visible.invested;

  const xCount = Math.min(6, n);
  const xIdx = Array.from({ length: xCount }, (_, i) => Math.round((i / (xCount - 1)) * (n - 1)));

  const hp = hover != null ? timeline[hover] : null;

  function onMove(e: React.MouseEvent<SVGRectElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    setHover(Math.round(ratio * (n - 1)));
  }

  return (
    <div ref={ref} className="relative w-full">
      <svg width={width} height={HEIGHT} role="img" aria-label="Évolution de la valeur et de la quantité">
        <defs>
          <linearGradient id="valueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1098f7" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#1098f7" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grille + libellés des axes (gauche = quantité, droite = €) */}
        {Array.from({ length: ticks + 1 }, (_, i) => {
          const y = PAD.top + innerH - (i / ticks) * innerH;
          return (
            <g key={i}>
              <line x1={PAD.left} x2={width - PAD.right} y1={y} y2={y} stroke="rgba(255,255,255,0.07)" />
              {visible.units && (
                <text x={PAD.left - 8} y={y + 4} textAnchor="end" className="fill-white/40" style={{ fontSize: 10 }}>
                  {niceUnits((unitsMax / ticks) * i)}
                </text>
              )}
              {eurVisible && (
                <text x={width - PAD.right + 8} y={y + 4} textAnchor="start" className="fill-white/40" style={{ fontSize: 10 }}>
                  {formatEurCompact((eurMax / ticks) * i)}
                </text>
              )}
            </g>
          );
        })}

        {/* Libellés X (temps) */}
        {xIdx.map((i) => (
          <text key={i} x={x(i)} y={HEIGHT - 8} textAnchor="middle" className="fill-white/40" style={{ fontSize: 10 }}>
            {timeline[i].date.slice(0, 7)}
          </text>
        ))}

        {/* Aire de la valeur */}
        {visible.value && <path d={areaPath(SERIES[0])} fill="url(#valueFill)" />}

        {/* Courbes */}
        {SERIES.map((def) =>
          visible[def.key] ? (
            <path
              key={def.key}
              d={linePath(def)}
              fill="none"
              stroke={def.color}
              strokeWidth={2}
              strokeDasharray={def.dashed ? "5 4" : undefined}
            />
          ) : null
        )}

        {/* Curseur */}
        {hover != null && hp && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={PAD.top} y2={PAD.top + innerH} stroke="rgba(255,255,255,0.25)" />
            {SERIES.map((def) =>
              visible[def.key] ? (
                <circle key={def.key} cx={x(hover)} cy={yOf(def, hp[def.key])} r={3.5} fill={def.color} />
              ) : null
            )}
          </g>
        )}

        <rect
          x={PAD.left}
          y={PAD.top}
          width={innerW}
          height={innerH}
          fill="transparent"
          onMouseMove={onMove}
          onMouseLeave={() => setHover(null)}
        />
      </svg>

      {/* Tooltip */}
      {hp && (
        <div
          className="pointer-events-none absolute top-2 z-10 rounded-lg border border-white/10 bg-navy-800/95 px-3 py-2 text-xs shadow-xl"
          style={{ left: Math.min(Math.max(x(hover!) - 80, 4), width - 170) }}
        >
          <p className="mb-1 font-light text-white/60">{formatDateFr(hp.date)}</p>
          {SERIES.filter((d) => visible[d.key]).map((d) => (
            <p key={d.key} className="text-white">
              <span style={{ color: d.color }}>●</span>{" "}
              {d.label} :{" "}
              {d.axis === "eur" ? formatEur(hp[d.key]) : formatUnits(hp[d.key], symbol)}
            </p>
          ))}
        </div>
      )}

      {/* Légende cliquable (toggle on/off, toutes actives par défaut) */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        {SERIES.map((def) => (
          <button
            key={def.key}
            type="button"
            onClick={() => setVisible((v) => ({ ...v, [def.key]: !v[def.key] }))}
            className={`flex items-center gap-2 text-xs font-light transition-opacity ${
              visible[def.key] ? "text-white/70" : "text-white/40 line-through"
            }`}
          >
            <span
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: def.color, opacity: visible[def.key] ? 1 : 0.4 }}
            />
            {def.label}
          </button>
        ))}
      </div>
    </div>
  );
}
