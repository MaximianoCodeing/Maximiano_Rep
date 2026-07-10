// POST /api/session
// Cria uma "ephemeral session" na OpenAI Realtime API e devolve um
// client_secret de curta duracao usado no browser para a ligacao WebRTC.
// A OPENAI_API_KEY nunca e exposta ao cliente.
// Injeta a memoria do utilizador (se existir) para personalizar a persona.
import { NextRequest, NextResponse } from "next/server";
import { buildInstructions } from "@/lib/prompt";
import { prisma } from "@/lib/prisma";
import type { Level } from "@/lib/topics";
import type { UserMemory } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "OPENAI_API_KEY nao configurada." }, { status: 500 });
  }

  const model = process.env.OPENAI_REALTIME_MODEL || "gpt-realtime";

  let topic = "free";
  let level: Level = "B1";
  let uid: string | null = null;
  let mode = "teacher";
  try {
    const body = await req.json();
    if (typeof body.topic === "string") topic = body.topic;
    if (typeof body.level === "string") level = body.level as Level;
    if (typeof body.uid === "string") uid = body.uid;
    if (typeof body.mode === "string") mode = body.mode;
  } catch {
    /* body opcional */
  }

  // Carregar memoria do utilizador para personalizar a IA (best-effort).
  let memory: UserMemory | undefined;
  if (uid) {
    try {
      const user = await prisma.user.findUnique({ where: { authId: uid } });
      if (user) {
        memory = {
          name: user.name,
          level: user.level,
          goals: user.goals,
          frequentErrors: (user.frequentErrors as any) ?? [],
          pronunciationNotes: (user.pronunciationNotes as any) ?? [],
          lastTopic: user.lastTopic,
          streakDays: user.streakDays,
        };
      }
    } catch {
      /* sem BD, segue sem memoria */
    }
  }

  const instructions = buildInstructions(topic, level, memory, mode);

  try {
    const r = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        session: {
          type: "realtime",
          model,
          instructions,
          audio: {
            output: { voice: "alloy" },
            input: {
              transcription: { model: "whisper-1" },
              // VAD do servidor: deteta inicio/fim de fala e permite barge-in.
              turn_detection: {
                type: "server_vad",
                threshold: 0.5,
                prefix_padding_ms: 300,
                silence_duration_ms: 700,
              },
            },
          },
        },
      }),
    });

    if (!r.ok) {
      const detail = await r.text();
      return NextResponse.json({ error: "Falha ao criar sessao Realtime", detail }, { status: 502 });
    }
    const data = await r.json();
    // GA: devolve { value, expires_at, session: {...} } em vez de { client_secret: {...}, model }.
    return NextResponse.json({
      client_secret: { value: data.value, expires_at: data.expires_at },
      model: data.session?.model || model,
    });
  } catch (err) {
    return NextResponse.json({ error: "Erro de rede ao contactar a OpenAI", detail: String(err) }, { status: 500 });
  }
}
