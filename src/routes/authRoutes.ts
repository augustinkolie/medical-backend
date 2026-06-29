/**
 * @file authRoutes.ts
 * @description Routes Express pour l'authentification.
 *
 * @module routes
 */

import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleware';
import { loginSchema } from '../validators/authValidator';

const router = Router();
const authController = new AuthController();

/** POST /api/auth/login — Connexion */
router.post('/login', validate(loginSchema), authController.login);

/** GET /api/auth/me — Profil utilisateur connecté */
router.get('/me', authMiddleware, authController.me);

export default router;
