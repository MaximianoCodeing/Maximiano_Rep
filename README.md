# Fluio — Speak English with AI 🎙️

Website **premium** para praticar inglês **exclusivamente por voz** com uma IA professora, em tempo real — como uma chamada telefónica com um professor nativo disponível 24h. Sem chat de texto como elemento principal.

Combina a naturalidade do **Modo de Voz do ChatGPT** com o foco pedagógico de apps como o Praktika: memória de longo prazo, feedback personalizado e liberdade para falar de qualquer tema.

Construído com a **OpenAI Realtime API** sobre **WebRTC** (baixa latência, deteção automática de fala e barge-in).

---

## ✨ Funcionalidades

**Conversa por voz natural**
- Botão único **Start Conversation** → a conversa flui sem clicar entre respostas
- VAD do servidor deteta automaticamente quando terminas de falar
- Barge-in: a IA pára de falar assim que começas a falar
- Microfone com cancelamento de ruído e eco

**Interface tipo chamada telefónica**
- Círculo animado que reage ao volume da voz
- Estados: Listening / Thinking / Speaking
- Cronómetro + indicador de microfone ativo
- Sem caixas de texto, sem teclado, sem histórico durante a chamada
- **Tema claro e escuro**, totalmente responsivo (desktop, tablet, telemóvel)

**Professora "Ava" — personalidade consistente**
- Adapta-se automaticamente ao nível (A1–C2)
- Faz o utilizador falar ~70% do tempo (perguntas abertas, pede exemplos e opiniões)
- Corrige apenas erros importantes, com explicação rápida, sem interromper
- Ensina vocabulário e expressões nativas

**8 modos de conversa** — Teacher, Friend, Phone call, Travel, Interview, Business, Debate, Roleplay

**+25 temas** (trabalho, viagens, entrevista, restaurante, tecnologia, IA, programação, cinema, música, futebol, história, ciência…) **+ tema personalizado** escrito pelo utilizador

**Memória de longo prazo** — guarda nome, nível, objetivos, último tema, erros frequentes, palavras/expressões aprendidas, streak e tempo total. A IA usa isto para personalizar cada sessão ("Welcome back! Last time we talked about…")

**Relatório após cada sessão** — tempo, fluência, pronúncia, gramática, vocabulário, confiança (0–100), erros principais, dicas de pronúncia, sugestões, palavras/expressões novas e objetivo para o dia seguinte

**Dashboard de progresso** — streak, tempo total, nº de sessões e gráficos de evolução de cada competência

---

## 🧱 Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Framer Motion |
| Backend | Node.js (Next API Routes) |
| IA / Voz | OpenAI Realtime API + WebRTC; Chat Completions para o relatório |
| Base de dados | PostgreSQL + Prisma |
| Auth | Pronta para Clerk ou NextAuth (via authId) |
| Deploy | Vercel |

---

## 🚀 Como executar

```bash
# 1. Instalar dependências
npm install ...

# 2. Variáveis de ambiente
cp .env.example .env
#   -> preencher OPENAI_API_KEY (obrigatório)
#   -> preencher DATABASE_URL (para memória e progresso)

# 3. Gerar o Prisma Client + criar tabelas (se tiveres DATABASE_URL)
npm run db:generate
npm run db:push

# 4. Arrancar
npm run dev
```

Abrir **http://localhost:3000**

> **Notas:**
> - O microfone exige contexto seguro: `localhost` funciona; em produção usa HTTPS (a Vercel dá HTTPS automaticamente).
> - **Sem `DATABASE_URL` a app continua a funcionar** — só não persiste memória/progresso (usa um id anónimo local).
> - `prisma generate` precisa de rede para descarregar as engines na primeira vez.

---

## ☁️ Deploy no Netlify

Este projeto já inclui `netlify.toml` e o plugin `@netlify/plugin-nextjs`, necessários para o Netlify correr corretamente uma app Next.js com App Router e API routes (sem isto, o site costuma dar "Page Not Found").

1. Sobe o projeto para o GitHub — **atenção**: o `package.json` tem de ficar na **raiz** do repositório, não dentro de uma subpasta.
2. No Netlify: **Add new site → Import an existing project** → escolhe o repositório.
3. O Netlify deve detetar automaticamente `npm run build` como comando e `.next` como pasta de publicação (já vem definido no `netlify.toml`).
4. Em **Site settings → Environment variables**, adiciona:
   - `OPENAI_API_KEY`
   - `OPENAI_REALTIME_MODEL` = `gpt-4o-realtime-preview`
   - `DATABASE_URL` (liga uma base de dados PostgreSQL, ex: Neon ou Supabase — o Netlify não tem Postgres integrado como a Vercel)
5. Faz o deploy. Depois do primeiro deploy com sucesso, corre `npm run db:push` localmente (apontando para a `DATABASE_URL` de produção) para criar as tabelas.

Se voltar a dar "Not Found": confirma no separador **Deploys** se o build terminou com "Published" (verde) — copia o log de erro se não terminar, para diagnóstico.

## ☁️ Deploy na Vercel (alternativa)

1. Faz push do projeto para o GitHub.
2. Importa o repositório na Vercel.
3. Cria uma base de dados PostgreSQL (Vercel Postgres, Neon ou Supabase) e copia a connection string.
4. Nas Environment Variables da Vercel adiciona `OPENAI_API_KEY`, `OPENAI_REALTIME_MODEL` e `DATABASE_URL`.
5. Deploy. Corre `prisma db push` uma vez para criar as tabelas.

---

## 🗂️ Estrutura

```
src/
├─ app/
│  ├─ page.tsx                 # Ecrã inicial: nome, nível, tema (+ custom), "Welcome back"
│  ├─ session/page.tsx         # Escolha de modo → conversa de voz → relatório
│  ├─ progress/page.tsx        # Dashboard de progresso com gráficos
│  ├─ layout.tsx, globals.css  # Tema claro/escuro
│  └─ api/
│     ├─ session/route.ts      # Token efémero Realtime (protege a API key) + injeta memória
│     ├─ report/route.ts       # Gera relatório, persiste sessão e atualiza memória/streak
│     ├─ user/route.ts         # Ler/gravar perfil de memória do utilizador
│     └─ sessions/route.ts     # Estatísticas + séries do dashboard
├─ components/
│  ├─ TopicPicker.tsx          # Seleção de nível, tema e tema personalizado
│  ├─ VoiceOrb.tsx             # Círculo animado reativo à voz
│  ├─ Timer.tsx                # Cronómetro + formatação de duração
│  ├─ ReportCard.tsx           # Relatório final
│  ├─ ThemeToggle.tsx          # Alternar claro/escuro
│  └─ charts/LineChart.tsx     # Gráfico de evolução (SVG puro, sem dependências)
├─ hooks/
│  └─ useRealtimeVoice.ts      # Toda a lógica WebRTC + eventos Realtime + VAD/barge-in
├─ context/ThemeContext.tsx    # Estado do tema claro/escuro
└─ lib/
   ├─ prompt.ts                # Persona "Ava" + memória + modo + prompt do relatório
   ├─ topics.ts, modes.ts      # Temas e modos de conversa
   ├─ user.ts                  # Identificação leve (substituível por Clerk/NextAuth)
   ├─ prisma.ts, types.ts
prisma/schema.prisma           # Modelos User (memória) e Session
```

---

## 🔒 Fluxo técnico (seguro)

1. O browser pede um **token efémero** a `/api/session`. A `OPENAI_API_KEY` **nunca** chega ao cliente.
2. `useRealtimeVoice` captura o microfone, abre uma `RTCPeerConnection` e negoceia SDP diretamente com a OpenAI usando esse token.
3. O áudio da IA toca no browser; um data channel recebe eventos (transcrições, início/fim de fala, estados) — daí vêm os estados Listening/Thinking/Speaking e o barge-in.
4. Ao terminar, o transcript vai para `/api/report`, que gera a avaliação, persiste a sessão em PostgreSQL e **acumula a memória** (streak, tempo, palavras aprendidas, último tema).

## 🔐 Integrar autenticação (opcional)

O `schema.prisma` já liga `User → Session` por `authId`. Para usar Clerk/NextAuth, substitui `getClientUserId()` (`src/lib/user.ts`) pelo id do utilizador autenticado — o resto continua igual.
