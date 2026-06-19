"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Purchase, TimelinePoint } from "@/lib/types";
import { formatEur, formatEurCompact, formatUnits, formatDateFr } from "@/lib/format";

const PAD = { top: 16, right: 66, bottom: 30, left: 66 };
const HEIGHT = 360;

type SeriesKey = "value" | "invested" | "units";
type Axis = "eur" | "units";
interface Pt {
  t: number;
  v: number;
}
interface SeriesDef {
  key: SeriesKey;
  label: string;
  color: string;
  axis: Axis;
  area?: boolean;
  dashed?: boolean;
}

const DEFS: SeriesDef[] = [
  { key: "value", label: "Valeur du portefeuille", color: "#1098f7", axis: "eur", area: true },
  { key: "invested", label: "Montant investi", color: "#f8d047", axis: "eur" },
  { key: "units", label: "Quantité acquise", color: "#a78bfa", axis: "units" },
];

const dateMs = (iso: string) => new Date(iso + "T00:00:00Z").getTime();

function interpAt(pts: Pt[], t: number): number | null {
  if (pts.length === 0) return null;
  if (t <= pts[0].t) return pts[0].v;
  if (t >= pts[pts.length - 1].t) return pts[pts.length - 1].v;
  for (let i = 1; i < pts.length; i++) {
    if (pts[i].t >= t) {
      const a = pts[i - 1];
      const b = pts[i];
      const f = (t - a.t) / (b.t - a.t || 1);
      return a.v + (b.v - a.v) * f;
    }
  }
  return pts[pts.length - 1].v;
}

function niceUnits(v: number): string {
  if (!Number.isFinite(v)) return "—";
  const digits = v >= 1 ? 2 : v >= 0.01 ? 4 : 6;
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: digits }).format(v);
}

export function PerformanceChart({
  timeline,
  purchases,
  symbol,
}: {
  timeline: TimelinePoint[];
  purchases: Purchase[];
  symbol?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(720);
  const [hoverT, setHoverT] = useState<number | null>(null);
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

  // Points par série :
  // - value : timeline journalière (suit le prix)
  // - invested / units : reliés aux points d'achat -> lignes lisses (peu de paliers)
  const { points, tMin, tMax } = useMemo(() => {
    const tMinL = timeline.length ? dateMs(timeline[0].date) : 0;
    const tMaxL = timeline.length ? dateMs(timeline[timeline.length - 1].date) : 1;
    const valuePts: Pt[] = timeline.map((p) => ({ t: dateMs(p.date), v: p.value }));

    const investedPts: Pt[] = purchases.map((p) => ({ t: dateMs(p.date), v: p.cumulativeInvested }));
    const unitsPts: Pt[] = purchases.map((p) => ({ t: dateMs(p.date), v: p.cumulativeUnits }));
    // prolonge jusqu'au bord droit (palier final)
    const extend = (pts: Pt[]) =>
      pts.length && pts[pts.length - 1].t < tMaxL
        ? [...pts, { t: tMaxL, v: pts[pts.length - 1].v }]
        : pts;

    return {
      tMin: tMinL,
      tMax: tMaxL,
      points: {
        value: valuePts,
        invested: extend(investedPts),
        units: extend(unitsPts),
      } as Record<SeriesKey, Pt[]>,
    };
  }, [timeline, purchases]);

  const innerW = Math.max(0, width - PAD.left - PAD.right);
  const innerH = HEIGHT - PAD.top - PAD.bottom;

  const { eurMax, unitsMax } = useMemo(() => {
    let e = 0;
    let u = 0;
    if (visible.value) for (const p of points.value) e = Math.max(e, p.v);
    if (visible.invested) for (const p of points.invested) e = Math.max(e, p.v);
    if (visible.units) for (const p of points.units) u = Math.max(u, p.v);
    return { eurMax: e * 1.08 || 1, unitsMax: u * 1.08 || 1 };
  }, [points, visible]);

  if (timeline.length < 2) {
    return (
      <div ref={ref} className="flex h-[360px] items-center justify-center text-sm font-light text-white/40">
        Pas assez de données pour tracer un graphique.
      </div>
    );
  }

  const span = tMax - tMin || 1;
  const x = (t: number) => PAD.left + ((t - tMin) / span) * innerW;
  const yEur = (v: number) => PAD.top + innerH - (v / eurMax) * innerH;
  const yUnits = (v: number) => PAD.top + innerH - (v / unitsMax) * innerH;
  const yOf = (def: SeriesDef, v: number) => (def.axis === "eur" ? yEur(v) : yUnits(v));

  const linePath = (def: SeriesDef) =>
    points[def.key].map((p, i) => `${i === 0 ? "M" : "L"}${x(p.t)},${yOf(def, p.v)}`).join(" ");
  const areaPath = (def: SeriesDef) => {
    const pts = points[def.key];
    return (
      `M${x(pts[0].t)},${yOf(def, 0)} ` +
      pts.map((p) => `L${x(p.t)},${yOf(def, p.v)}`).join(" ") +
      ` L${x(pts[pts.length - 1].t)},${yOf(def, 0)} Z`
    );
  };

  const ticks = 4;
  const eurVisible = visible.value || visible.invested;
  const xCount = 6;

  function onMove(e: React.MouseEvent<SVGRectElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    setHoverT(tMin + ratio * span);
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

        {/* Grille + axes : quantité à gauche, € à droite */}
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

        {/* Axe X (temps) */}
        {Array.from({ length: xCount }, (_, i) => {
          const t = tMin + (i / (xCount - 1)) * span;
          return (
            <text key={i} x={x(t)} y={HEIGHT - 8} textAnchor="middle" className="fill-white/40" style={{ fontSize: 10 }}>
              {new Date(t).toISOString().slice(0, 7)}
            </text>
          );
        })}

        {/* Aire de la valeur */}
        {visible.value && <path d={areaPath(DEFS[0])} fill="url(#valueFill)" />}

        {/* Courbes */}
        {DEFS.map((def) =>
          visible[def.key] ? (
            <path
              key={def.key}
              d={linePath(def)}
              fill="none"
              stroke={def.color}
              strokeWidth={2}
              strokeDasharray={def.dashed ? "5 4" : undefined}
              strokeLinejoin="round"
            />
          ) : null
        )}

        {/* Curseur */}
        {hoverT != null && (
          <g>
            <line x1={x(hoverT)} x2={x(hoverT)} y1={PAD.top} y2={PAD.top + innerH} stroke="rgba(255,255,255,0.25)" />
            {DEFS.map((def) => {
              if (!visible[def.key]) return null;
              const v = interpAt(points[def.key], hoverT);
              return v == null ? null : (
                <circle key={def.key} cx={x(hoverT)} cy={yOf(def, v)} r={3.5} fill={def.color} />
              );
            })}
          </g>
        )}

        <rect
          x={PAD.left}
          y={PAD.top}
          width={innerW}
          height={innerH}
          fill="transparent"
          onMouseMove={onMove}
          onMouseLeave={() => setHoverT(null)}
        />
      </svg>

      {/* Tooltip */}
      {hoverT != null && (
        <div
          className="pointer-events-none absolute top-2 z-10 rounded-lg border border-white/10 bg-navy-800/95 px-3 py-2 text-xs shadow-xl"
          style={{ left: Math.min(Math.max(x(hoverT) - 80, 4), width - 170) }}
        >
          <p className="mb-1 font-light text-white/60">{formatDateFr(new Date(hoverT).toISOString().slice(0, 10))}</p>
          {DEFS.filter((d) => visible[d.key]).map((d) => {
            const v = interpAt(points[d.key], hoverT);
            if (v == null) return null;
            return (
              <p key={d.key} className="text-white">
                <span style={{ color: d.color }}>●</span> {d.label} :{" "}
                {d.axis === "eur" ? formatEur(v) : formatUnits(v, symbol)}
              </p>
            );
          })}
        </div>
      )}

      {/* Légende cliquable (toggle on/off, toutes actives par défaut) */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
        {DEFS.map((def) => (
          <button
            key={def.key}
            type="button"
            onClick={() => setVisible((s) => ({ ...s, [def.key]: !s[def.key] }))}
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
