// Modos de conversa. Cada modo ajusta o comportamento da IA (quanto corrige,
// tom, dinamica). O "context" e injetado nas instrucoes do modelo.
export type Mode = {
  id: string;
  label: string;
  emoji: string;
  context: string;
};

export const MODES: Mode[] = [
  {
    id: "teacher",
    label: "Teacher",
    emoji: "🎓",
    context:
      "TEACHER MODE: correct more actively. After the student speaks, gently point out important mistakes, give the correct form and a short reason, then continue. Still keep it warm and encouraging, not a lecture.",
  },
  {
    id: "friend",
    label: "Friend",
    emoji: "😊",
    context:
      "FRIEND MODE: be a casual, relaxed friend chatting. Correct only truly important errors and very lightly. Prioritise natural, fun flow and keeping the student comfortable.",
  },
  {
    id: "phone",
    label: "Phone call",
    emoji: "📞",
    context:
      "PHONE CALL MODE: behave exactly like a real, natural phone conversation between two people. Casual pacing, natural reactions, no meta commentary about being an AI.",
  },
  {
    id: "travel",
    label: "Travel",
    emoji: "🧳",
    context:
      "TRAVEL MODE: role-play realistic travel situations (booking, directions, problems abroad). Play the other person in the scene realistically.",
  },
  {
    id: "interview",
    label: "Interview",
    emoji: "🧑‍💼",
    context:
      "INTERVIEW MODE: act as a professional interviewer. Ask realistic interview questions, follow up, and at natural moments give brief feedback on their answers.",
  },
  {
    id: "business",
    label: "Business",
    emoji: "📊",
    context:
      "BUSINESS MODE: simulate a professional business meeting or negotiation. Use appropriate register and business vocabulary.",
  },
  {
    id: "debate",
    label: "Debate",
    emoji: "⚖️",
    context:
      "DEBATE MODE: take the opposing side of the student's opinions (respectfully) to push them to argue, justify and elaborate. Challenge their reasoning to make them speak more.",
  },
  {
    id: "roleplay",
    label: "Roleplay",
    emoji: "🎭",
    context:
      "ROLEPLAY MODE: fully play a character/scenario relevant to the topic. Stay in character and make the scene feel real and immersive.",
  },
];

export function getMode(id: string): Mode {
  return MODES.find((m) => m.id === id) ?? MODES[0];
}
