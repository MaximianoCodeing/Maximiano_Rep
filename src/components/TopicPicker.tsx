// Ecra inicial: marca, saudacao personalizada, nome, nivel, tema + Start.
"use client";

import { motion } from "framer-motion";
import { TOPICS, LEVELS, type Level } from "@/lib/topics";

export function TopicPicker({
  name,
  welcomeBack,
  topic,
  level,
  onName,
  onTopic,
  onLevel,
  onStart,
}: {
  name: string;
  welcomeBack: string | null;
  topic: string;
  level: Level;
  onName: (v: string) => void;
  onTopic: (id: string) => void;
  onLevel: (l: Level) => void;
  onStart: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl flex flex-col items-center gap-7"
    >
      <div className="text-center">
        <h1 className="bg-gradient-to-r from-accent to-accent2 bg-clip-text text-5xl font-bold tracking-tight text-transparent">
          Fluio
        </h1>
        <p className="mt-2 text-black/60 dark:text-white/60">
          Practice English by voice — like a real call with a native teacher.
        </p>
        {welcomeBack && (
          <p className="mt-3 rounded-full bg-accent/10 px-4 py-1.5 text-sm text-accent">{welcomeBack}</p>
        )}
      </div>

      {/* Nome */}
      <div className="w-full">
        <p className="mb-2 text-sm text-black/50 dark:text-white/50">Your name (optional)</p>
        <input
          value={name}
          onChange={(e) => onName(e.target.value)}
          placeholder="e.g. Maria"
          className="w-full rounded-xl border border-black/10 bg-black/5 px-4 py-2.5 text-sm outline-none transition focus:border-accent dark:border-white/10 dark:bg-white/5"
        />
      </div>

      {/* Nivel */}
      <div className="w-full">
        <p className="mb-2 text-sm text-black/50 dark:text-white/50">Your level</p>
        <div className="flex flex-wrap gap-2">
          {LEVELS.map((l) => (
            <button
              key={l}
              onClick={() => onLevel(l)}
              className={`rounded-full px-4 py-1.5 text-sm transition ${
                level === l
                  ? "bg-accent text-white"
                  : "bg-black/5 text-black/70 hover:bg-black/10 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Temas */}
      <div className="w-full">
        <p className="mb-2 text-sm text-black/50 dark:text-white/50">Choose a topic</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {TOPICS.map((t) => (
            <button
              key={t.id}
              onClick={() => onTopic(t.id)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-left text-sm transition ${
                topic === t.id
                  ? "border-accent bg-accent/15"
                  : "border-black/10 bg-black/5 text-black/70 hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:text-white/70 dark:hover:bg-white/10"
              }`}
            >
              <span className="text-lg">{t.emoji}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Tema personalizado */}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-lg">✨</span>
          <input
            value={topic.startsWith("custom:") ? topic.slice(7) : ""}
            onChange={(e) => onTopic(e.target.value ? `custom:${e.target.value}` : "free")}
            placeholder="Or type your own topic…"
            className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:border-accent ${
              topic.startsWith("custom:")
                ? "border-accent bg-accent/10"
                : "border-black/10 bg-black/5 dark:border-white/10 dark:bg-white/5"
            }`}
          />
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onStart}
        className="mt-1 flex items-center gap-3 rounded-full bg-gradient-to-r from-accent to-accent2 px-10 py-4 text-lg font-medium text-white shadow-lg shadow-accent/30 transition hover:opacity-95"
      >
        <MicIcon />
        Start Conversation
      </motion.button>
    </motion.div>
  );
}

function MicIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}
