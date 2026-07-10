// Pagina da sessao de voz ativa. Escolhe modo, liga o Realtime, mostra o orb,
// cronometro e estado, e no fim gera + apresenta o relatorio.
"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useRealtimeVoice } from "@/hooks/useRealtimeVoice";
import { VoiceOrb } from "@/components/VoiceOrb";
import { Timer } from "@/components/Timer";
import { ReportCard } from "@/components/ReportCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import { MODES } from "@/lib/modes";
import { getClientUserId } from "@/lib/user";
import type { Level } from "@/lib/topics";
import type { Report, Turn } from "@/lib/types";

function SessionInner() {
  const params = useSearchParams();
  const router = useRouter();
  const topic = params.get("topic") || "free";
  const level = (params.get("level") as Level) || "B1";

  const { state, error, transcript, level: vol, start, stop } = useRealtimeVoice();
  const [phase, setPhase] = useState<"setup" | "live">("setup");
  const [mode, setMode] = useState("teacher");
  const [seconds, setSeconds] = useState(0);
  const [report, setReport] = useState<Report | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);

  const begin = () => {
    setPhase("live");
    start(topic, level, getClientUserId(), mode);
  };

  // Terminar a sessao: parar audio, pedir relatorio ao backend.
  const end = useCallback(async () => {
    const turns = stop();
    setLoadingReport(true);
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: turns, durationSec: seconds, topic, level, uid: getClientUserId(),
        }),
      });
      const data = await res.json();
      setReport(data.report as Report);
    } catch {
      setReport({
        fluency: 0, pronunciation: 0, grammar: 0, vocabulary: 0, confidence: 0,
        errors: [], suggestions: ["Could not generate the report. Please try again."],
        newWords: [], newExpressions: [], pronunciationTips: [], nextGoal: "",
      });
    } finally {
      setLoadingReport(false);
    }
  }, [stop, seconds, topic, level]);

  // ---- Relatorio ----
  if (report) {
    return (
      <main className="flex min-h-screen items-center justify-center p-6">
        <ReportCard
          report={report}
          durationSec={seconds}
          onRestart={() => router.push("/")}
          onProgress={() => router.push("/progress")}
        />
      </main>
    );
  }

  // ---- A gerar relatorio ----
  if (loadingReport) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-black/20 border-t-accent dark:border-white/20" />
        <p className="text-black/60 dark:text-white/60">Analysing your session…</p>
      </main>
    );
  }

  // ---- Escolha de modo (antes de comecar) ----
  if (phase === "setup") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-6">
        <div className="absolute right-5 top-5"><ThemeToggle /></div>
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Choose a conversation mode</h2>
          <p className="mt-1 text-black/60 dark:text-white/60">How should your teacher behave?</p>
        </div>
        <div className="grid w-full max-w-xl grid-cols-2 gap-2 sm:grid-cols-4">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`flex flex-col items-center gap-1 rounded-xl border px-3 py-4 text-sm transition ${
                mode === m.id
                  ? "border-accent bg-accent/15"
                  : "border-black/10 bg-black/5 hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
              }`}
            >
              <span className="text-2xl">{m.emoji}</span>
              {m.label}
            </button>
          ))}
        </div>
        <button
          onClick={begin}
          className="rounded-full bg-gradient-to-r from-accent to-accent2 px-10 py-4 text-lg font-medium text-white shadow-lg shadow-accent/30 transition hover:opacity-95"
        >
          Begin
        </button>
      </main>
    );
  }

  // ---- Conversa ativa ----
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-6">
      <div className="flex w-full max-w-2xl items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${state !== "idle" ? "animate-pulse bg-red-500" : "bg-black/30 dark:bg-white/30"}`} />
          <span className="text-sm text-black/60 dark:text-white/60">Mic active</span>
        </div>
        <Timer running={state !== "idle" && state !== "connecting"} onTick={setSeconds} />
      </div>

      <div className="flex flex-1 flex-col items-center justify-center">
        <VoiceOrb state={state} level={vol} />
        {error && (
          <div className="mt-6 max-w-sm rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-left text-sm text-red-500">
            <p className="mb-1 font-semibold">Erro ao iniciar a chamada:</p>
            <p className="break-words">{error}</p>
          </div>
        )}

        <AnimatePresence>
          {transcript.length > 0 && (
            <motion.p
              key={transcript.length}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-8 max-w-md text-center text-black/50 dark:text-white/50"
            >
              {transcript[transcript.length - 1].text}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <button
        onClick={end}
        className="flex items-center gap-2 rounded-full bg-red-500/90 px-8 py-3.5 font-medium text-white shadow-lg shadow-red-500/20 transition hover:bg-red-500"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
          <line x1="23" y1="1" x2="1" y2="23" />
        </svg>
        End conversation
      </button>
    </main>
  );
}

export default function SessionPage() {
  return (
    <Suspense fallback={<main className="min-h-screen" />}>
      <SessionInner />
    </Suspense>
  );
}
