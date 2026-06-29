/**
 * @file env.ts
 * @description Validation et typage des variables d'environnement via Zod.
 *
 * @module config/env
 */

import { z } from 'zod';
import dotenv from 'dotenv';

// Charge le fichier .env avant toute validation
dotenv.config();

// ─── Schéma de validation Zod ────────────────────────────────────────────────

/**
 * Schéma Zod décrivant toutes les variables d'environnement attendues.
 * Si une variable obligatoire est manquante, l'application se termine
 * immédiatement avec un message clair.
 */
const envSchema = z.object({
  /** Port sur lequel le serveur HTTP écoutera */
  PORT: z.string().default('3000').transform(Number),

  /** Environnement d'exécution */
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  /** URL de connexion PostgreSQL (format Prisma) */
  DATABASE_URL: z.string().url('DATABASE_URL doit être une URL valide'),

  /** Clé secrète de signature JWT */
  JWT_SECRET: z.string().min(32, 'JWT_SECRET doit faire au moins 32 caractères'),

  /** Durée de validité du token JWT (ex: "24h", "7d") */
  JWT_EXPIRES_IN: z.string().default('24h'),

  /** Origines autorisées par CORS (séparées par des virgules) */
  ALLOWED_ORIGIN: z.string().default('http://localhost:4200'),

  /** Fenêtre de rate limiting en millisecondes (défaut : 15 minutes) */
  RATE_LIMIT_WINDOW_MS: z.string().default('900000').transform(Number),

  /** Nombre max de requêtes par fenêtre par IP */
  RATE_LIMIT_MAX: z.string().default('100').transform(Number),

  /** Nombre de rounds bcrypt pour le hachage des mots de passe */
  BCRYPT_SALT_ROUNDS: z.string().default('12').transform(Number),
});

// ─── Validation ───────────────────────────────────────────────────────────────

const _parsed = envSchema.safeParse(process.env);

if (!_parsed.success) {
  console.error('❌ Variables d\'environnement invalides :');
  console.error(_parsed.error.flatten().fieldErrors);
  process.exit(1);
}

/**
 * Variables d'environnement validées et typées.
 * Utilisez toujours cet objet plutôt que `process.env` directement.
 *
 * @example
 * import { env } from '@config/env';
 * const port = env.PORT; // number, pas string
 */
export const env = _parsed.data;

/**
 * Type exporté représentant la structure des variables d'environnement.
 * Utile pour les tests et les mocks.
 */
export type Env = z.infer<typeof envSchema>;
