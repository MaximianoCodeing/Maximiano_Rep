// Cronometro da sessao. Conta segundos enquanto "running" for true.
"use client";

import { useEffect, useState } from "react";

export function formatTime(sec: number): string {
  const m = Math.floor(sec / 60).toString().padStart(2, "0");
  const s = Math.floor(sec % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function Timer({ running, onTick }: { running: boolean; onTick?: (sec: number) => void }) {
  const [sec, setSec] = useState(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSec((s) => {
        const next = s + 1;
        onTick?.(next);
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, onTick]);

  return <span className="font-mono text-lg tabular-nums text-black/80 dark:text-white/80">{formatTime(sec)}</span>;
}
