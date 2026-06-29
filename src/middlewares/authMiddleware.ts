/**
 * @file authMiddleware.ts
 * @description Middleware de vérification JWT — injecte l'utilisateur dans req.user.
 *
 * @module middlewares
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from './errorMiddleware';
import { ErrorCode, JwtPayload, AuthenticatedRequest } from '../types';

/**
 * Middleware d'authentification JWT.
 *
 * Lit le Bearer token dans l'en-tête `Authorization`,
 * vérifie sa signature et injecte le payload dans `req.user`.
 *
 * @example
 * // Protéger une route
 * router.get('/profil', authMiddleware, controller.getProfil);
 */
export function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  // Extraction du token depuis l'en-tête Authorization: Bearer <token>
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AppError(
      'Token d\'authentification manquant',
      401,
      ErrorCode.UNAUTHORIZED
    );
  }

  const token = authHeader.split(' ')[1];

  try {
    // Vérification et décodage du token JWT
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    // Injection de l'utilisateur dans la requête pour les controllers suivants
    (req as AuthenticatedRequest).user = payload;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError('Token expiré, veuillez vous reconnecter', 401, ErrorCode.TOKEN_EXPIRED);
    }
    throw new AppError('Token invalide', 401, ErrorCode.UNAUTHORIZED);
  }
}

/**
 * Middleware d'authentification optionnelle.
 * 
 * S'il y a un token, il l'injecte dans req.user.
 * S'il n'y a pas de token ou s'il est invalide, il laisse passer la requête
 * sans injecter d'utilisateur (utile pour la création de RDV qui peut être anonyme).
 */
export function optionalAuthMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    (req as AuthenticatedRequest).user = payload;
  } catch (error) {
    // On ignore silencieusement les erreurs de token pour une route optionnelle
  }

  next();
}
