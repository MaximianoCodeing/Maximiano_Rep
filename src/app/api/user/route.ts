// GET  /api/user?uid=...  -> devolve o perfil de memoria do utilizador
// POST /api/user          -> cria/atualiza nome, nivel e objetivos
// Usado pela IA para personalizar sessoes e pelo ecra inicial ("Welcome back").
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { UserMemory } from "@/lib/types";

export const runtime = "nodejs";

// Garante que existe um registo de utilizador para o authId dado.
async function ensureUser(authId: string) {
  const existing = await prisma.user.findUnique({ where: { authId } });
  if (existing) return existing;
  return prisma.user.create({ data: { authId } });
}

export async function GET(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get("uid");
  if (!uid) return NextResponse.json({ error: "uid em falta" }, { status: 400 });

  try {
    const user = await prisma.user.findUnique({ where: { authId: uid } });
    if (!user) return NextResponse.json({ memory: null });

    const memory: UserMemory = {
      name: user.name,
      level: user.level,
      goals: user.goals,
      frequentErrors: (user.frequentErrors as any) ?? [],
      learnedWords: (user.learnedWords as any) ?? [],
      learnedExpressions: (user.learnedExpressions as any) ?? [],
      pronunciationNotes: (user.pronunciationNotes as any) ?? [],
      lastTopic: user.lastTopic,
      streakDays: user.streakDays,
      totalSeconds: user.totalSeconds,
    };
    return NextResponse.json({ memory });
  } catch (err) {
    // Sem BD -> devolve memoria vazia para nao quebrar a app.
    return NextResponse.json({ memory: null, dbError: String(err) });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.uid) return NextResponse.json({ error: "uid em falta" }, { status: 400 });

  try {
    await ensureUser(body.uid);
    const user = await prisma.user.update({
      where: { authId: body.uid },
      data: {
        name: body.name ?? undefined,
        level: body.level ?? undefined,
        goals: body.goals ?? undefined,
      },
    });
    return NextResponse.json({ ok: true, id: user.id });
  } catch (err) {
    return NextResponse.json({ ok: false, dbError: String(err) });
  }
}
