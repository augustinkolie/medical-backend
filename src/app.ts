/**
 * @file app.ts
 * @description Factory de l'application Express — configuration des middlewares globaux.
 *
 * Ce fichier ne démarre PAS le serveur HTTP (c'est le rôle de server.ts).
 * Cette séparation est intentionnelle : elle permet d'importer `app` dans
 * les tests sans lancer d'écoute réseau.
 *
 * @module app
 */

import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { env } from './config/env';
import apiRouter from './routes';
import { errorHandler, notFoundHandler } from './middlewares/errorMiddleware';

/**
 * Crée et configure l'application Express.
 * @returns Instance Express configurée
 */
export function createApp(): Application {
  const app = express();

  // ─── Sécurité ──────────────────────────────────────────────────────────────

  /**
   * Helmet : sécurise les en-têtes HTTP (X-Frame-Options, CSP, etc.)
   */
  app.use(helmet());

  /**
   * CORS : autorise uniquement les origines configurées.
   * En production, l'URL du frontend Vercel doit être dans ALLOWED_ORIGIN.
   */
  app.use(
    cors({
      origin: env.ALLOWED_ORIGIN.split(',').map((o) => o.trim()),
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true,
    })
  );

  /**
   * Rate Limiting : protège contre les attaques par déni de service et
   * le brute-force des endpoints d'authentification.
   */
  const limiter = rateLimit({
    windowMs: env.RATE_LIMIT_WINDOW_MS,
    max: env.RATE_LIMIT_MAX,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      error: 'Trop de requêtes, veuillez réessayer dans quelques minutes.',
      statusCode: 429,
    },
  });
  app.use('/api', limiter);

  // ─── Parsing & Compression ─────────────────────────────────────────────────

  /** Parse les corps de requête JSON */
  app.use(express.json({ limit: '10mb' }));

  /** Parse les corps URL-encoded (formulaires HTML) */
  app.use(express.urlencoded({ extended: true }));

  /** Compresse les réponses HTTP (gzip) */
  app.use(compression());

  // ─── Logging ──────────────────────────────────────────────────────────────

  /**
   * Morgan : log HTTP au format "combined" en production, "dev" en développement.
   */
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

  // ─── Routes ───────────────────────────────────────────────────────────────

  /**
   * Endpoint de santé — vérifié par Render/Vercel au démarrage.
   */
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  });

  /**
   * Montage de toutes les routes API sous le préfixe /api.
   */
  app.use('/api', apiRouter);

  // ─── Gestion des erreurs (MUST être en dernier) ───────────────────────────

  /** 404 — Route non trouvée */
  app.use(notFoundHandler);

  /** Gestionnaire d'erreurs global */
  app.use(errorHandler);

  return app;
}
