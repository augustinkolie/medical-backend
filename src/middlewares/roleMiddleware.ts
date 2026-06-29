/**
 * @file roleMiddleware.ts
 * @description Middleware de vérification de rôle (RBAC).
 *
 * Doit être utilisé APRÈS `authMiddleware`.
 *
 * @module middlewares
 */

import { Response, NextFunction } from 'express';
import { RoleUser } from '@prisma/client';
import { AppError } from './errorMiddleware';
import { ErrorCode, AuthenticatedRequest } from '../types';

/**
 * Factory de middleware de vérification de rôle.
 * Retourne un middleware Express qui autorise uniquement les rôles spécifiés.
 *
 * @param allowedRoles - Liste des rôles autorisés à accéder à la route
 * @returns Middleware Express
 *
 * @example
 * // Réservé aux admins uniquement
 * router.delete('/centres/:id', authMiddleware, requireRole(RoleUser.admin), controller.delete);
 *
 * @example
 * // Admins ET patients
 * router.get('/rendezvous', authMiddleware, requireRole(RoleUser.admin, RoleUser.patient), controller.getAll);
 */
export function requireRole(...allowedRoles: RoleUser[]) {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    const userRole = req.user?.role;

    if (!userRole || !allowedRoles.includes(userRole)) {
      throw new AppError(
        `Accès refusé — rôle requis : ${allowedRoles.join(' ou ')}`,
        403,
        ErrorCode.FORBIDDEN
      );
    }

    next();
  };
}
