// Pagina inicial. Carrega memoria do utilizador (welcome back), gere o nome
// e navega para a sessao de voz. Inclui link para o dashboard de progresso.
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { TopicPicker } from "@/components/TopicPicker";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getClientUserId, getClientName, setClientName } from "@/lib/user";
import { getTopic, type Level } from "@/lib/topics";

export default function Home() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("free");
  const [level, setLevel] = useState<Level>("B1");
  const [welcome, setWelcome] = useState<string | null>(null);

  // Ao montar, carrega memoria do utilizador para personalizar o ecra.
  useEffect(() => {
    const localName = getClientName();
    if (localName) setName(localName);

    const uid = getClientUserId();
    fetch(`/api/user?uid=${uid}`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.memory) {
          if (d.memory.name) setName(d.memory.name);
          if (d.memory.level) setLevel(d.memory.level);
          if (d.memory.lastTopic) {
            setTopic(d.memory.lastTopic);
            const t = getTopic(d.memory.lastTopic);
            setWelcome(
              `Welcome back${d.memory.name ? ", " + d.memory.name : ""}! Last time we talked about ${t.label}. Continue?`
            );
          }
        }
      })
      .catch(() => {});
  }, []);

  const start = () => {
    const uid = getClientUserId();
    if (name.trim()) setClientName(name.trim());
    // Guardar nome/nivel na memoria (best-effort).
    fetch("/api/user", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uid, name: name.trim() || null, level }),
    }).catch(() => {});
    router.push(`/session?topic=${topic}&level=${level}`);
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center p-6">
      <div className="absolute right-5 top-5 flex items-center gap-2">
        <Link
          href="/progress"
          className="rounded-full border border-black/10 bg-black/5 px-4 py-2 text-sm transition hover:bg-black/10 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
        >
          Progress
        </Link>
        <ThemeToggle />
      </div>

      <TopicPicker
        name={name}
        welcomeBack={welcome}
        topic={topic}
        level={level}
        onName={setName}
        onTopic={setTopic}
        onLevel={setLevel}
        onStart={start}
      />
    </main>
  );
}
