/**
 * @file centreRoutes.ts
 * @description Routes Express pour les centres médicaux.
 *
 * Routes publiques : GET (lecture seule)
 * Routes admin : POST, PATCH, DELETE
 *
 * @module routes
 */

import { Router } from 'express';
import { CentreController } from '../controllers/CentreController';
import { SpecialiteRepository } from '../repositories/SpecialiteRepository';
import { MedecinRepository } from '../repositories/MedecinRepository';
import { CentreRepository } from '../repositories/CentreRepository';
import { CentreService } from '../services/CentreService';
import { authMiddleware } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';
import { validate, idParamSchema } from '../middlewares/validationMiddleware';
import { createCentreSchema, updateCentreSchema } from '../validators/centreValidator';
import { RoleUser } from '@prisma/client';
import { prisma } from '../config/database';

const router = Router();

// ── Composition Root : instanciation des dépendances ──────────────────────────
const centreRepository = new CentreRepository(prisma);
const specialiteRepository = new SpecialiteRepository(prisma);
const medecinRepository = new MedecinRepository(prisma);
const centreService = new CentreService(centreRepository);
const centreController = new CentreController(centreService);


// ── Routes publiques ──────────────────────────────────────────────────────────

/** GET /api/centres — Liste tous les centres */
router.get('/', centreController.getAll);

/** GET /api/centres/:id — Détail d'un centre */
router.get(
  '/:id',
  validate(idParamSchema, 'params'),
  centreController.getById
);

/** GET /api/centres/:centreId/specialites — Spécialités d'un centre */
router.get(
  '/:centreId/specialites',
  async (req, res, next) => {
    try {
      const centreId = Number(req.params['centreId']);
      const specialites = await specialiteRepository.findByCentre(centreId);
      res.json({ success: true, data: specialites });
    } catch (e) { next(e); }
  }
);

/** GET /api/centres/:centreId/specialites/:specialiteId/medecins — Médecins d'un centre par spécialité */
router.get(
  '/:centreId/specialites/:specialiteId/medecins',
  async (req, res, next) => {
    try {
      const centreId     = Number(req.params['centreId']);
      const specialiteId = Number(req.params['specialiteId']);
      const medecins = await medecinRepository.findByCentreAndSpecialite(centreId, specialiteId);
      res.json({ success: true, data: medecins });
    } catch (e) { next(e); }
  }
);


// ── Routes admin (authentification + rôle admin requis) ───────────────────────

/** POST /api/centres — Crée un centre [Admin] */
router.post(
  '/',
  authMiddleware,
  requireRole(RoleUser.admin),
  validate(createCentreSchema),
  centreController.create
);

/** PATCH /api/centres/:id — Met à jour un centre [Admin] */
router.patch(
  '/:id',
  authMiddleware,
  requireRole(RoleUser.admin),
  validate(idParamSchema, 'params'),
  validate(updateCentreSchema),
  centreController.update
);

/** DELETE /api/centres/:id — Supprime un centre [Admin] */
router.delete(
  '/:id',
  authMiddleware,
  requireRole(RoleUser.admin),
  validate(idParamSchema, 'params'),
  centreController.delete
);

export default router;
