// Temas de conversa. Cada tema tem id, label, emoji e um contexto injetado
// nas instrucoes da IA. O utilizador tambem pode escrever um tema personalizado.
export type Topic = {
  id: string;
  label: string;
  emoji: string;
  context: string;
};

export const TOPICS: Topic[] = [
  { id: "free", label: "Free talk", emoji: "💬", context: "Have a free, open conversation about anything the learner wants." },
  { id: "work", label: "Work", emoji: "💼", context: "Discuss the learner's job, career and daily work life." },
  { id: "business", label: "Business", emoji: "📈", context: "Discuss business: meetings, negotiations, strategy, markets." },
  { id: "interview", label: "Job interview", emoji: "🧑‍💼", context: "Role-play a professional job interview with typical questions." },
  { id: "travel", label: "Travel", emoji: "✈️", context: "Talk about travelling: destinations, experiences, planning trips." },
  { id: "restaurant", label: "Restaurant", emoji: "🍽️", context: "Role-play ordering food and interacting with staff." },
  { id: "hotel", label: "Hotel", emoji: "🏨", context: "Role-play checking into a hotel, requests and complaints." },
  { id: "airport", label: "Airport", emoji: "🛫", context: "Role-play airport situations: check-in, security, boarding." },
  { id: "shopping", label: "Shopping", emoji: "🛍️", context: "Role-play shopping: items, sizes, prices, paying." },
  { id: "technology", label: "Technology", emoji: "💻", context: "Discuss technology, gadgets, apps and digital life." },
  { id: "ai", label: "AI", emoji: "🤖", context: "Discuss artificial intelligence, its uses, benefits and risks." },
  { id: "programming", label: "Programming", emoji: "👨‍💻", context: "Talk about coding, languages, projects and software development." },
  { id: "science", label: "Science", emoji: "🔬", context: "Discuss science topics, discoveries and how things work." },
  { id: "cinema", label: "Cinema", emoji: "🎬", context: "Discuss movies, actors, genres and recent films." },
  { id: "music", label: "Music", emoji: "🎵", context: "Talk about music, genres, artists, concerts and instruments." },
  { id: "books", label: "Books", emoji: "📚", context: "Discuss books, authors, stories and reading habits." },
  { id: "games", label: "Games", emoji: "🎮", context: "Talk about video games, board games and gaming culture." },
  { id: "football", label: "Football", emoji: "⚽", context: "Talk about football: teams, matches, players and tactics." },
  { id: "sports", label: "Sports", emoji: "🏅", context: "Discuss sports, exercise and staying active." },
  { id: "health", label: "Health", emoji: "🩺", context: "Discuss health, fitness, wellbeing and doctor visits." },
  { id: "family", label: "Family", emoji: "👨‍👩‍👧", context: "Chat about family, relationships and home life." },
  { id: "food", label: "Food", emoji: "🍜", context: "Talk about food, cooking, recipes and cuisines." },
  { id: "history", label: "History", emoji: "🏛️", context: "Discuss historical events, periods and figures." },
  { id: "culture", label: "Culture", emoji: "🌍", context: "Talk about cultures, traditions and customs around the world." },
  { id: "education", label: "Education", emoji: "🎓", context: "Discuss studying, schools, learning and educational systems." },
  { id: "news", label: "Current affairs", emoji: "📰", context: "Discuss general current-events style topics and opinions." },
  { id: "daily", label: "Daily life", emoji: "🌤️", context: "Chat about everyday routines, hobbies and plans." },
];

export const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"] as const;
export type Level = (typeof LEVELS)[number];

export function getTopic(id: string): Topic {
  const found = TOPICS.find((t) => t.id === id);
  if (found) return found;
  // Tema personalizado: id "custom:<texto>".
  if (id.startsWith("custom:")) {
    const label = id.slice(7);
    return { id, label, emoji: "✨", context: `Talk about the custom topic chosen by the learner: "${label}".` };
  }
  return TOPICS[0];
}
