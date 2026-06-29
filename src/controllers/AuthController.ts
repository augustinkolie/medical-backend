/**
 * @file AuthController.ts
 * @description Controller HTTP pour l'authentification.
 *
 * @module controllers
 */

import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { UtilisateurRepository } from '../repositories/UtilisateurRepository';
import { prisma } from '../config/database';

/**
 * Controller REST pour l'authentification (login / profil).
 */
export class AuthController {
  private readonly authService: AuthService;

  constructor() {
    // Composition root : instanciation des dépendances
    const utilisateurRepository = new UtilisateurRepository(prisma);
    this.authService = new AuthService(utilisateurRepository);
  }

  /**
   * POST /api/auth/login
   * Authentifie un utilisateur et retourne un JWT.
   */
  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body as { email: string; password: string };
      const result = await this.authService.login(email, password);
      res.status(200).json({
        success: true,
        data: result,
        message: 'Connexion réussie',
      });
    } catch (e) { next(e); }
  };

  /**
   * GET /api/auth/me
   * Retourne les informations de l'utilisateur connecté.
   * Nécessite le middleware authMiddleware.
   */
  me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // req.user injecté par authMiddleware
      const user = (req as Request & { user: unknown }).user;
      res.json({ success: true, data: user });
    } catch (e) { next(e); }
  };
}
