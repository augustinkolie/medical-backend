/**
 * @file errorMiddleware.ts
 * @description Gestionnaire d'erreurs global Express + classe AppError.
 *
 * Ce middleware DOIT être enregistré en dernier dans app.ts (après toutes les routes).
 *
 * @module middlewares
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ErrorCode, ApiErrorResponse } from '../types';

// ─── Classe d'erreur métier ───────────────────────────────────────────────────

/**
 * Erreur applicative avec code HTTP et code métier.
 * Lancée depuis les services et repositories pour signaler des erreurs métier.
 *
 * @example
 * throw new AppError('Médecin introuvable', 404, ErrorCode.NOT_FOUND);
 */
export class AppError extends Error {
  constructor(
    /** Message lisible par l'humain */
    public readonly message: string,
    /** Code de statut HTTP */
    public readonly statusCode: number = 500,
    /** Code d'erreur métier pour le client */
    public readonly code: ErrorCode = ErrorCode.INTERNAL_ERROR,
    /** Détails supplémentaires (validation, etc.) */
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    // Préserve la stack trace correcte en TypeScript
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// ─── Middleware de gestion des erreurs ────────────────────────────────────────

/**
 * Gestionnaire d'erreurs global Express.
 * Convertit toute erreur en réponse JSON standardisée.
 *
 * Gère :
 * - `AppError` : erreurs métier intentionnelles
 * - `ZodError` : erreurs de validation Zod (depuis validationMiddleware)
 * - `Error` générique : erreurs imprévues (500)
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  // ── Erreur métier AppError ──
  if (err instanceof AppError) {
    const response: ApiErrorResponse = {
      success: false,
      error: err.message,
      statusCode: err.statusCode,
      details: err.details,
    };
    res.status(err.statusCode).json(response);
    return;
  }

  // ── Erreur de validation Zod ──
  if (err instanceof ZodError) {
    const response: ApiErrorResponse = {
      success: false,
      error: 'Données invalides',
      statusCode: 422,
      details: err.flatten().fieldErrors,
    };
    res.status(422).json(response);
    return;
  }

  // ── Erreur inattendue (500) ──
  console.error('❌ Erreur non gérée :', err);
  const response: ApiErrorResponse = {
    success: false,
    error: 'Erreur interne du serveur',
    statusCode: 500,
  };
  res.status(500).json(response);
}

/**
 * Middleware pour les routes non trouvées (404).
 * Doit être enregistré avant `errorHandler`.
 */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(`Route ${req.method} ${req.path} introuvable`, 404, ErrorCode.NOT_FOUND));
}
