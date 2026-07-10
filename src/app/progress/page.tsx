// Dashboard de progresso: streak, tempo total, nº de sessoes e graficos de
// evolucao (fluencia, pronuncia, gramatica, vocabulario) + palavras aprendidas.
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { LineChart } from "@/components/charts/LineChart";
import { ThemeToggle } from "@/components/ThemeToggle";
import { formatDuration } from "@/components/Timer";
import { getClientUserId } from "@/lib/user";
import type { ProgressPoint, NewWord } from "@/lib/types";

type Data = {
  stats: { streakDays: number; totalSeconds: number; sessionCount: number };
  progress: ProgressPoint[];
  learnedWords: NewWord[];
  learnedExpressions: NewWord[];
};

function StatCard({ label, value, emoji }: { label: string; value: string; emoji: string }) {
  return (
    <div className="rounded-2xl border border-black/10 bg-white/70 p-5 backdrop-blur dark:border-white/10 dark:bg-white/[0.03]">
      <div className="text-2xl">{emoji}</div>
      <div className="mt-2 text-3xl font-bold">{value}</div>
      <div className="text-sm text-black/60 dark:text-white/60">{label}</div>
    </div>
  );
}

export default function ProgressPage() {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const uid = getClientUserId();
    fetch(`/api/sessions?uid=${uid}`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const labels = data?.progress.map((p) => p.date) ?? [];
  const series = [
    { name: "Fluency", color: "#6366f1", values: data?.progress.map((p) => p.fluency) ?? [] },
    { name: "Pronunciation", color: "#22c55e", values: data?.progress.map((p) => p.pronunciation) ?? [] },
    { name: "Grammar", color: "#eab308", values: data?.progress.map((p) => p.grammar) ?? [] },
    { name: "Vocabulary", color: "#ec4899", values: data?.progress.map((p) => p.vocabulary) ?? [] },
  ];

  return (
    <main className="mx-auto min-h-screen max-w-4xl p-6">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Your progress</h1>
          <p className="text-black/60 dark:text-white/60">Track your English journey</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="rounded-full bg-gradient-to-r from-accent to-accent2 px-5 py-2 text-sm font-medium text-white transition hover:opacity-95"
          >
            New session
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-black/20 border-t-accent dark:border-white/20" />
        </div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
          {/* Estatisticas rapidas */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard emoji="🔥" label="Day streak" value={String(data?.stats.streakDays ?? 0)} />
            <StatCard emoji="⏱️" label="Total practiced" value={formatDuration(data?.stats.totalSeconds ?? 0)} />
            <StatCard emoji="🎙️" label="Sessions" value={String(data?.stats.sessionCount ?? 0)} />
          </div>

          {/* Grafico de evolucao */}
          <section className="rounded-2xl border border-black/10 bg-white/70 p-5 backdrop-blur dark:border-white/10 dark:bg-white/[0.03]">
            <h2 className="mb-4 text-lg font-medium">Skill evolution</h2>
            {series.some((s) => s.values.length > 0) ? (
              <LineChart series={series} labels={labels} />
            ) : (
              <p className="py-10 text-center text-black/50 dark:text-white/50">
                No sessions yet. Finish a conversation to see your progress here.
              </p>
            )}
          </section>

          {/* Palavras aprendidas */}
          {(data?.learnedWords.length ?? 0) > 0 && (
            <section className="rounded-2xl border border-black/10 bg-white/70 p-5 backdrop-blur dark:border-white/10 dark:bg-white/[0.03]">
              <h2 className="mb-4 text-lg font-medium">Words you've learned</h2>
              <div className="flex flex-wrap gap-2">
                {data!.learnedWords.map((w, i) => (
                  <span key={i} className="rounded-lg bg-accent/15 px-3 py-1.5 text-sm">
                    <span className="font-medium">{w.term}</span>
                    <span className="text-black/60 dark:text-white/60"> — {w.meaning}</span>
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Expressoes aprendidas */}
          {(data?.learnedExpressions.length ?? 0) > 0 && (
            <section className="rounded-2xl border border-black/10 bg-white/70 p-5 backdrop-blur dark:border-white/10 dark:bg-white/[0.03]">
              <h2 className="mb-4 text-lg font-medium">Expressions you've learned</h2>
              <div className="flex flex-wrap gap-2">
                {data!.learnedExpressions.map((w, i) => (
                  <span key={i} className="rounded-lg bg-accent2/15 px-3 py-1.5 text-sm">
                    <span className="font-medium">{w.term}</span>
                    <span className="text-black/60 dark:text-white/60"> — {w.meaning}</span>
                  </span>
                ))}
              </div>
            </section>
          )}
        </motion.div>
      )}
    </main>
  );
}
