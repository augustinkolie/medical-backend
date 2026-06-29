/**
 * @file index.ts
 * @description Router principal — agrège toutes les routes de l'API.
 *
 * Toutes les routes sont préfixées par `/api` dans app.ts.
 *
 * @module routes
 */

import { Router } from 'express';
import centreRoutes from './centreRoutes';
import medecinRoutes from './medecinRoutes';
import rendezvousRoutes from './rendezvousRoutes';
import authRoutes from './authRoutes';
import specialiteRoutes from './specialiteRoutes';

const router = Router();

/**
 * Montage des sous-routers.
 * L'ordre des déclarations n'a pas d'impact sur la priorité des routes.
 */
router.use('/auth', authRoutes);
router.use('/centres', centreRoutes);
router.use('/medecins', medecinRoutes);
router.use('/rendezvous', rendezvousRoutes);
router.use('/specialites', specialiteRoutes);

export default router;
