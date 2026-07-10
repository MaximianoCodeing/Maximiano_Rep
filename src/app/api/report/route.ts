// POST /api/report
// Recebe o transcript + metadados, gera o relatorio de avaliacao completo
// (fluencia, pronuncia, gramatica, vocabulario, confianca, erros, sugestoes,
// palavras/expressoes novas, dicas de pronuncia, proximo objetivo).
// Persiste a sessao e ATUALIZA A MEMORIA do utilizador (streak, tempo total,
// palavras aprendidas, erros frequentes, ultimo tema).
import { NextRequest, NextResponse } from "next/server";
import { buildReportPrompt } from "@/lib/prompt";
import { prisma } from "@/lib/prisma";
import type { Report, Turn } from "@/lib/types";

export const runtime = "nodejs";

const EMPTY: Report = {
  fluency: 0, pronunciation: 0, grammar: 0, vocabulary: 0, confidence: 0,
  errors: [], suggestions: [], newWords: [], newExpressions: [],
  pronunciationTips: [], nextGoal: "",
};

// Calcula os dias de streak com base na ultima pratica.
function computeStreak(last: Date | null, current: number): number {
  if (!last) return 1;
  const days = Math.floor((Date.now() - last.getTime()) / 86400000);
  if (days === 0) return current || 1; // ja praticou hoje
  if (days === 1) return (current || 0) + 1; // dia consecutivo
  return 1; // quebrou a sequencia
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "OPENAI_API_KEY nao configurada." }, { status: 500 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Body invalido." }, { status: 400 });

  const transcript: Turn[] = Array.isArray(body.transcript) ? body.transcript : [];
  const durationSec: number = Number(body.durationSec) || 0;
  const topic: string = body.topic || "free";
  const level: string = body.level || "B1";
  const uid: string | null = body.uid || null;

  const convoText = transcript
    .map((t) => `${t.role === "user" ? "STUDENT" : "TEACHER"}: ${t.text}`)
    .join("\n");

  let report: Report = { ...EMPTY };

  // 1. Gerar avaliacao via Chat Completions (JSON).
  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: buildReportPrompt() },
          { role: "user", content: `Level: ${level}\nTopic: ${topic}\n\nTRANSCRIPT:\n${convoText || "(no conversation)"}` },
        ],
      }),
    });
    if (r.ok) {
      const data = await r.json();
      const parsed = JSON.parse(data.choices?.[0]?.message?.content ?? "{}");
      report = { ...EMPTY, ...parsed };
    }
  } catch (err) {
    console.error("Falha ao gerar relatorio:", err);
  }

  // 2. Persistir sessao + atualizar memoria/estatisticas (best-effort).
  let sessionId: string | null = null;
  if (uid) {
    try {
      // Garantir utilizador.
      let user = await prisma.user.findUnique({ where: { authId: uid } });
      if (!user) user = await prisma.user.create({ data: { authId: uid, level } });

      // Criar a sessao.
      const saved = await prisma.session.create({
        data: {
          userId: user.id, topic, level, durationSec,
          fluency: report.fluency, pronunciation: report.pronunciation,
          grammar: report.grammar, vocabulary: report.vocabulary, confidence: report.confidence,
          errors: report.errors as any, suggestions: report.suggestions as any,
          newWords: report.newWords as any, newExpressions: report.newExpressions as any,
          pronunciationTips: report.pronunciationTips as any, nextGoal: report.nextGoal,
          transcript: transcript as any,
        },
      });
      sessionId = saved.id;

      // Acumular memoria: palavras/expressoes aprendidas (deduplicadas), streak, tempo.
      const prevWords = (user.learnedWords as any[]) ?? [];
      const prevExpr = (user.learnedExpressions as any[]) ?? [];
      const mergedWords = dedupe([...prevWords, ...report.newWords], "term");
      const mergedExpr = dedupe([...prevExpr, ...report.newExpressions], "term");

      await prisma.user.update({
        where: { id: user.id },
        data: {
          level,
          lastTopic: topic,
          learnedWords: mergedWords as any,
          learnedExpressions: mergedExpr as any,
          totalSeconds: user.totalSeconds + durationSec,
          streakDays: computeStreak(user.lastPractice, user.streakDays),
          lastPractice: new Date(),
        },
      });
    } catch (err) {
      console.warn("BD indisponivel, relatorio nao persistido:", String(err));
    }
  }

  return NextResponse.json({ report, durationSec, sessionId });
}

// Remove duplicados por chave, mantendo o primeiro.
function dedupe<T extends Record<string, any>>(arr: T[], key: string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of arr) {
    const k = String(item?.[key] ?? "").toLowerCase().trim();
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(item);
  }
  return out.slice(-100); // limita crescimento
}
