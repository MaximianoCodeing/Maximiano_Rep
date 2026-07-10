// Tipos partilhados entre frontend e backend.
export type Turn = { role: "user" | "assistant"; text: string };

export type VoiceState = "idle" | "connecting" | "listening" | "thinking" | "speaking";

export type ReportError = { original: string; correction: string; explanation: string };
export type NewWord = { term: string; meaning: string };

export type Report = {
  fluency: number;
  pronunciation: number;
  grammar: number;
  vocabulary: number;
  confidence: number;
  errors: ReportError[];
  suggestions: string[];
  newWords: NewWord[];
  newExpressions: NewWord[];
  pronunciationTips: string[];
  nextGoal: string;
};

// Perfil de memoria do utilizador (subconjunto usado no cliente/prompt).
export type UserMemory = {
  name?: string | null;
  level: string;
  goals?: string | null;
  frequentErrors?: { pattern: string; example: string }[];
  learnedWords?: NewWord[];
  learnedExpressions?: NewWord[];
  pronunciationNotes?: string[];
  lastTopic?: string | null;
  streakDays?: number;
  totalSeconds?: number;
};

// Ponto de dados para os graficos de progresso.
export type ProgressPoint = {
  date: string;
  fluency: number;
  pronunciation: number;
  grammar: number;
  vocabulary: number;
};
