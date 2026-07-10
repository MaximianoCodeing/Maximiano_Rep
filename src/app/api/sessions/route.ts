// GET /api/sessions?uid=...
// Devolve o historico de sessoes + estatisticas agregadas para o dashboard
// de progresso (streak, tempo total, series temporais das metricas).
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { ProgressPoint } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get("uid");
  if (!uid) return NextResponse.json({ error: "uid em falta" }, { status: 400 });

  try {
    const user = await prisma.user.findUnique({
      where: { authId: uid },
      include: { sessions: { orderBy: { createdAt: "asc" } } },
    });

    if (!user) {
      return NextResponse.json({
        stats: { streakDays: 0, totalSeconds: 0, sessionCount: 0 },
        progress: [],
        learnedWords: [],
        learnedExpressions: [],
      });
    }

    const progress: ProgressPoint[] = user.sessions.map((s: any) => ({
      date: s.createdAt.toISOString().slice(0, 10),
      fluency: s.fluency ?? 0,
      pronunciation: s.pronunciation ?? 0,
      grammar: s.grammar ?? 0,
      vocabulary: s.vocabulary ?? 0,
    }));

    return NextResponse.json({
      stats: {
        streakDays: user.streakDays,
        totalSeconds: user.totalSeconds,
        sessionCount: user.sessions.length,
      },
      progress,
      learnedWords: (user.learnedWords as any) ?? [],
      learnedExpressions: (user.learnedExpressions as any) ?? [],
    });
  } catch (err) {
    return NextResponse.json({
      stats: { streakDays: 0, totalSeconds: 0, sessionCount: 0 },
      progress: [],
      learnedWords: [],
      learnedExpressions: [],
      dbError: String(err),
    });
  }
}
