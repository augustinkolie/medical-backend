/**
 * @file database.ts
 * @description Instance singleton du client Prisma.
 *
 * @module config/database
 */

import { PrismaClient } from '@prisma/client';
import { env } from './env';

// ─── Prisma Singleton ─────────────────────────────────────────────────────────

/**
 * Instance unique du PrismaClient pour toute l'application.
 *
 * En développement, on attache l'instance sur l'objet global pour éviter
 * de recréer des connexions lors des hot-reloads de ts-node-dev.
 *
 * En production, une seule instance est créée au démarrage.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Client Prisma configuré avec logging adapté à l'environnement.
 *
 * - En développement : log des queries, warnings et erreurs
 * - En production : log uniquement des erreurs
 */
export const prisma: PrismaClient =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      env.NODE_ENV === 'development'
        ? ['query', 'warn', 'error']
        : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// ─── Helpers de connexion ─────────────────────────────────────────────────────

/**
 * Établit la connexion à la base de données et vérifie son état.
 * Appelé au démarrage du serveur.
 *
 * @throws {Error} Si la connexion échoue
 */
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('✅ Connexion PostgreSQL établie via Prisma');
  } catch (error) {
    console.error('❌ Impossible de se connecter à PostgreSQL :', error);
    throw error;
  }
}

/**
 * Ferme proprement la connexion à la base de données.
 * Appelé lors de l'arrêt du serveur (signal SIGTERM/SIGINT).
 */
export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  console.log('🔌 Connexion PostgreSQL fermée');
}
