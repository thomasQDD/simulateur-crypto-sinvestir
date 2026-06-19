"use client";

import { useEffect, useRef, useState } from "react";
import type { TimelinePoint } from "@/lib/types";
import { formatEur, formatEurCompact, formatDateFr } from "@/lib/format";

const PAD = { top: 16, right: 18, bottom: 30, left: 60 };
const HEIGHT = 340;

export function PerformanceChart({ timeline }: { timeline: TimelinePoint[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(720);
  const [hover, setHover] = useState<number | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      setWidth(entries[0].contentRect.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (timeline.length < 2) {
    return (
      <div ref={ref} className="flex h-[340px] items-center justify-center text-sm font-light text-white/40">
        Pas assez de données pour tracer un graphique.
      </div>
    );
  }

  const innerW = Math.max(0, width - PAD.left - PAD.right);
  const innerH = HEIGHT - PAD.top - PAD.bottom;
  const n = timeline.length;

  const yMax = Math.max(...timeline.map((p) => Math.max(p.value, p.invested))) * 1.08 || 1;

  const x = (i: number) => PAD.left + (i / (n - 1)) * innerW;
  const y = (v: number) => PAD.top + innerH - (v / yMax) * innerH;

  const linePath = (key: "value" | "invested") =>
    timeline.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(p[key])}`).join(" ");

  const areaPath =
    `M${x(0)},${y(0)} ` +
    timeline.map((p, i) => `L${x(i)},${y(p.value)}`).join(" ") +
    ` L${x(n - 1)},${y(0)} Z`;

  // Graduations Y
  const yTicks = 4;
  const yGrid = Array.from({ length: yTicks + 1 }, (_, i) => (yMax / yTicks) * i);

  // Graduations X (~6 dates)
  const xCount = Math.min(6, n);
  const xIdx = Array.from({ length: xCount }, (_, i) =>
    Math.round((i / (xCount - 1)) * (n - 1))
  );

  const hp = hover != null ? timeline[hover] : null;

  function onMove(e: React.MouseEvent<SVGRectElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const ratio = Math.min(1, Math.max(0, (px - PAD.left) / innerW));
    setHover(Math.round(ratio * (n - 1)));
  }

  return (
    <div ref={ref} className="relative w-full">
      <svg width={width} height={HEIGHT} role="img" aria-label="Évolution de la valeur du portefeuille">
        <defs>
          <linearGradient id="valueFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.35" />
            <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Grille + labels Y */}
        {yGrid.map((v, i) => (
          <g key={i}>
            <line
              x1={PAD.left}
              x2={width - PAD.right}
              y1={y(v)}
              y2={y(v)}
              stroke="rgba(255,255,255,0.07)"
            />
            <text
              x={PAD.left - 10}
              y={y(v) + 4}
              textAnchor="end"
              className="fill-white/40"
              style={{ fontSize: 11 }}
            >
              {formatEurCompact(v)}
            </text>
          </g>
        ))}

        {/* Labels X */}
        {xIdx.map((i) => (
          <text
            key={i}
            x={x(i)}
            y={HEIGHT - 8}
            textAnchor="middle"
            className="fill-white/40"
            style={{ fontSize: 11 }}
          >
            {timeline[i].date.slice(0, 7)}
          </text>
        ))}

        {/* Aire + courbes */}
        <path d={areaPath} fill="url(#valueFill)" />
        <path d={linePath("value")} fill="none" stroke="var(--color-accent)" strokeWidth={2} />
        <path
          d={linePath("invested")}
          fill="none"
          stroke="var(--color-gold)"
          strokeWidth={2}
          strokeDasharray="5 4"
        />

        {/* Curseur */}
        {hover != null && hp && (
          <g>
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={PAD.top}
              y2={PAD.top + innerH}
              stroke="rgba(255,255,255,0.25)"
            />
            <circle cx={x(hover)} cy={y(hp.value)} r={4} fill="var(--color-accent)" />
            <circle cx={x(hover)} cy={y(hp.invested)} r={4} fill="var(--color-gold)" />
          </g>
        )}

        {/* Zone de capture */}
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
          style={{
            left: Math.min(Math.max(x(hover!) - 70, 4), width - 150),
          }}
        >
          <p className="mb-1 font-light text-white/60">{formatDateFr(hp.date)}</p>
          <p className="text-white">
            <span className="text-accent">●</span> Valeur : {formatEur(hp.value)}
          </p>
          <p className="text-white">
            <span style={{ color: "var(--color-gold)" }}>●</span> Investi :{" "}
            {formatEur(hp.invested)}
          </p>
        </div>
      )}

      {/* Légende */}
      <div className="mt-3 flex items-center justify-center gap-6 text-xs font-light text-white/60">
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-accent" /> Valeur du portefeuille
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: "var(--color-gold)" }} />{" "}
          Montant investi
        </span>
      </div>
    </div>
  );
}
