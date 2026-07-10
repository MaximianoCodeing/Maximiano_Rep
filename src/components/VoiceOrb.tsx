// Circulo animado central que reage ao volume da voz e ao estado da sessao.
"use client";

import { motion } from "framer-motion";
import type { VoiceState } from "@/lib/types";

const STATE_LABEL: Record<VoiceState, string> = {
  idle: "Ready",
  connecting: "Connecting…",
  listening: "Listening",
  thinking: "Thinking",
  speaking: "Speaking",
};

const STATE_COLOR: Record<VoiceState, string> = {
  idle: "#8b8b9a",
  connecting: "#8b5cf6",
  listening: "#22c55e",
  thinking: "#eab308",
  speaking: "#6366f1",
};

export function VoiceOrb({ state, level }: { state: VoiceState; level: number }) {
  const color = STATE_COLOR[state];
  const scale = 1 + level * 0.5;

  return (
    <div className="flex flex-col items-center gap-6 select-none">
      <div className="relative flex items-center justify-center" style={{ width: 280, height: 280 }}>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="absolute flex items-center justify-center rounded-full"
            animate={{
              width: 190 + i * 42 + level * 130,
              height: 190 + i * 42 + level * 130,
              opacity: 0.35 - i * 0.1,
            }}
            transition={{ type: "spring", stiffness: 120, damping: 18 }}
          >
            <span className="block h-full w-full rounded-full border" style={{ borderColor: color, opacity: 0.45 }} />
          </motion.span>
        ))}

        <motion.div
          className="rounded-full"
          style={{
            width: 158,
            height: 158,
            background: `radial-gradient(circle at 30% 30%, ${color}, #12121a)`,
            boxShadow: `0 0 70px ${color}66`,
          }}
          animate={{ scale: state === "thinking" ? [1, 1.06, 1] : scale }}
          transition={
            state === "thinking"
              ? { duration: 1.2, repeat: Infinity }
              : { type: "spring", stiffness: 200, damping: 15 }
          }
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full" style={{ background: color }} />
        <span className="text-sm tracking-wide text-black/70 dark:text-white/70">{STATE_LABEL[state]}</span>
      </div>
    </div>
  );
}
