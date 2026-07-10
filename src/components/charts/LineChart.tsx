// Grafico de linhas leve em SVG puro (sem dependencias externas).
// Suporta multiplas series para mostrar a evolucao das metricas.
"use client";

type Series = { name: string; color: string; values: number[] };

export function LineChart({
  series,
  labels,
  height = 220,
}: {
  series: Series[];
  labels: string[];
  height?: number;
}) {
  const width = 640;
  const pad = 32;
  const maxY = 100;
  const n = Math.max(...series.map((s) => s.values.length), 1);

  const x = (i: number) => pad + (i * (width - pad * 2)) / Math.max(n - 1, 1);
  const y = (v: number) => height - pad - (v / maxY) * (height - pad * 2);

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ minWidth: 480 }}>
        {/* Grelha horizontal */}
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={v}>
            <line x1={pad} x2={width - pad} y1={y(v)} y2={y(v)} className="stroke-black/10 dark:stroke-white/10" strokeWidth={1} />
            <text x={4} y={y(v) + 4} className="fill-black/40 dark:fill-white/40" fontSize={10}>{v}</text>
          </g>
        ))}

        {/* Series */}
        {series.map((s) => {
          if (s.values.length === 0) return null;
          const d = s.values.map((v, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(v)}`).join(" ");
          return (
            <g key={s.name}>
              <path d={d} fill="none" stroke={s.color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
              {s.values.map((v, i) => (
                <circle key={i} cx={x(i)} cy={y(v)} r={3} fill={s.color} />
              ))}
            </g>
          );
        })}

        {/* Labels do eixo X (mostra ate 6) */}
        {labels.map((lab, i) => {
          const step = Math.ceil(labels.length / 6);
          if (i % step !== 0 && i !== labels.length - 1) return null;
          return (
            <text key={i} x={x(i)} y={height - 8} textAnchor="middle" className="fill-black/40 dark:fill-white/40" fontSize={9}>
              {lab.slice(5)}
            </text>
          );
        })}
      </svg>

      {/* Legenda */}
      <div className="mt-2 flex flex-wrap gap-4">
        {series.map((s) => (
          <span key={s.name} className="flex items-center gap-1.5 text-xs text-black/60 dark:text-white/60">
            <span className="h-2 w-2 rounded-full" style={{ background: s.color }} />
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );
}
