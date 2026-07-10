// Instancia unica do Prisma Client (evita multiplas conexoes em dev/hot-reload).
// NOTA IMPORTANTE: o Prisma Client precisa de ser gerado antes do build
// (comando `prisma generate`). Isto acontece automaticamente:
//  - localmente, via `npm run db:generate` ou o script "postinstall" abaixo
//  - na Vercel, o script "postinstall" do package.json corre sozinho
// Se a BD/generate falhar, as rotas que usam `prisma` tratam o erro com
// try/catch e a app continua a funcionar sem persistencia.
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
