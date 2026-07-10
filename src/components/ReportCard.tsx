// Cartao de relatorio apresentado no fim da sessao.
"use client";

import { motion } from "framer-motion";
import { formatTime } from "./Timer";
import type { Report } from "@/lib/types";

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-black/70 dark:text-white/70">{label}</span>
        <span className="font-mono text-black/90 dark:text-white/90">{value}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-accent to-accent2"
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8 }}
        />
      </div>
    </div>
  );
}

function WordChips({ items }: { items: { term: string; meaning: string }[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((w, i) => (
        <span key={i} className="rounded-lg bg-accent/15 px-3 py-1.5 text-sm">
          <span className="font-medium">{w.term}</span>
          <span className="text-black/60 dark:text-white/60"> — {w.meaning}</span>
        </span>
      ))}
    </div>
  );
}

export function ReportCard({
  report,
  durationSec,
  onRestart,
  onProgress,
}: {
  report: Report;
  durationSec: number;
  onRestart: () => void;
  onProgress: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl rounded-2xl border border-black/10 bg-white/70 p-6 backdrop-blur dark:border-white/10 dark:bg-white/[0.03] sm:p-8"
    >
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Session report</h2>
        <span className="rounded-full bg-black/5 px-3 py-1 text-sm text-black/70 dark:bg-white/5 dark:text-white/70">
          {formatTime(durationSec)}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ScoreBar label="Fluency" value={report.fluency} />
        <ScoreBar label="Pronunciation" value={report.pronunciation} />
        <ScoreBar label="Grammar" value={report.grammar} />
        <ScoreBar label="Vocabulary" value={report.vocabulary} />
        <ScoreBar label="Confidence" value={report.confidence} />
      </div>

      {report.nextGoal && (
        <div className="mt-6 rounded-xl border border-accent/30 bg-accent/10 p-4">
          <p className="text-xs uppercase tracking-wide text-accent">Goal for tomorrow</p>
          <p className="mt-1 text-sm">{report.nextGoal}</p>
        </div>
      )}

      {report.errors?.length > 0 && (
        <section className="mt-8">
          <h3 className="mb-3 text-lg font-medium">Main corrections</h3>
          <ul className="space-y-3">
            {report.errors.map((e, i) => (
              <li key={i} className="rounded-lg bg-black/5 p-3 text-sm dark:bg-white/5">
                <p className="text-red-500 line-through dark:text-red-300/90">{e.original}</p>
                <p className="text-green-600 dark:text-green-300/90">{e.correction}</p>
                <p className="mt-1 text-black/60 dark:text-white/60">{e.explanation}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {report.pronunciationTips?.length > 0 && (
        <section className="mt-6">
          <h3 className="mb-3 text-lg font-medium">Pronunciation tips</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-black/75 dark:text-white/75">
            {report.pronunciationTips.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </section>
      )}

      {report.suggestions?.length > 0 && (
        <section className="mt-6">
          <h3 className="mb-3 text-lg font-medium">Suggestions</h3>
          <ul className="list-disc space-y-1 pl-5 text-sm text-black/75 dark:text-white/75">
            {report.suggestions.map((s, i) => <li key={i}>{s}</li>)}
          </ul>
        </section>
      )}

      {report.newWords?.length > 0 && (
        <section className="mt-6">
          <h3 className="mb-3 text-lg font-medium">New words</h3>
          <WordChips items={report.newWords} />
        </section>
      )}

      {report.newExpressions?.length > 0 && (
        <section className="mt-6">
          <h3 className="mb-3 text-lg font-medium">New expressions</h3>
          <WordChips items={report.newExpressions} />
        </section>
      )}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          onClick={onRestart}
          className="flex-1 rounded-full bg-gradient-to-r from-accent to-accent2 py-3 font-medium text-white transition hover:opacity-95"
        >
          Practice again
        </button>
        <button
          onClick={onProgress}
          className="flex-1 rounded-full border border-black/15 py-3 font-medium transition hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/5"
        >
          View progress
        </button>
      </div>
    </motion.div>
  );
}
