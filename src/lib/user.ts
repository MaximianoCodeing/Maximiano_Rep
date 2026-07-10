// Identificacao leve do utilizador SEM depender de auth configurada.
// Gera/guarda um id anonimo em localStorage para associar sessoes e memoria.
// Quando integrares Clerk/NextAuth, substitui getClientUserId() pelo id real
// do utilizador autenticado — o resto da app continua a funcionar igual.
"use client";

const KEY = "ve_uid";
const NAME_KEY = "ve_name";

export function getClientUserId(): string {
  if (typeof window === "undefined") return "anon";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = "u_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(KEY, id);
  }
  return id;
}

export function getClientName(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(NAME_KEY);
}

export function setClientName(name: string) {
  localStorage.setItem(NAME_KEY, name);
}
