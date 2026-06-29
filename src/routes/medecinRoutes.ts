/**
 * @file medecinRoutes.ts
 * @description Routes Express pour les médecins, créneaux et absences.
 *
 * @module routes
 */

import { Router } from 'express';
import { MedecinController } from '../controllers/MedecinController';
import { RendezVousController } from '../controllers/RendezVousController';
import { MedecinRepository } from '../repositories/MedecinRepository';
import { SpecialiteRepository } from '../repositories/SpecialiteRepository';
import { AbsenceRepository } from '../repositories/AbsenceRepository';
import { RendezVousRepository } from '../repositories/RendezVousRepository';
import { MedecinService } from '../services/MedecinService';
import { AvailabilityService } from '../services/AvailabilityService';
import { RendezVousService } from '../services/RendezVousService';
import { authMiddleware } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';
import { validate } from '../middlewares/validationMiddleware';
import { creneauxQuerySchema, createAbsenceSchema } from '../validators/rendezvousValidator';
import { RoleUser } from '@prisma/client';
import { prisma } from '../config/database';

const router = Router();

// ── Composition des dépendances ───────────────────────────────────────────────
const medecinRepository = new MedecinRepository(prisma);
const specialiteRepository = new SpecialiteRepository(prisma);
const absenceRepository = new AbsenceRepository(prisma);
const rendezVousRepository = new RendezVousRepository(prisma);
const availabilityService = new AvailabilityService(absenceRepository, rendezVousRepository);
const medecinService = new MedecinService(medecinRepository, specialiteRepository, absenceRepository);
const rendezVousService = new RendezVousService(rendezVousRepository, availabilityService);
const medecinController = new MedecinController(medecinService, rendezVousService);

// ── Routes publiques ──────────────────────────────────────────────────────────

/** GET /api/medecins */
router.get('/', medecinController.getAll);

/** GET /api/medecins/:id */
router.get('/:id', medecinController.getById);

/** GET /api/medecins/:id/creneaux?date=YYYY-MM-DD */
router.get(
  '/:id/creneaux',
  validate(creneauxQuerySchema, 'query'),
  medecinController.getCreneaux
);

// ── Routes admin ──────────────────────────────────────────────────────────────

/** POST /api/medecins [Admin] */
router.post('/', authMiddleware, requireRole(RoleUser.admin), medecinController.create);

/** PATCH /api/medecins/:id [Admin] */
router.patch('/:id', authMiddleware, requireRole(RoleUser.admin), medecinController.update);

/** DELETE /api/medecins/:id [Admin] */
router.delete('/:id', authMiddleware, requireRole(RoleUser.admin), medecinController.delete);

// ── Routes absences [Admin] ───────────────────────────────────────────────────

/** GET /api/absences */
router.get('/absences/all', authMiddleware, requireRole(RoleUser.admin), medecinController.getAllAbsences);

/** POST /api/absences */
router.post(
  '/absences',
  authMiddleware,
  requireRole(RoleUser.admin),
  validate(createAbsenceSchema),
  medecinController.createAbsence
);

/** DELETE /api/absences/:id */
router.delete('/absences/:id', authMiddleware, requireRole(RoleUser.admin), medecinController.deleteAbsence);

export default router;
