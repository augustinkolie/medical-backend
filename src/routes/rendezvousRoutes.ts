/**
 * @file rendezvousRoutes.ts
 * @description Routes Express pour les rendez-vous médicaux.
 *
 * @module routes
 */

import { Router } from 'express';
import { RendezVousController } from '../controllers/RendezVousController';
import { RendezVousRepository } from '../repositories/RendezVousRepository';
import { AbsenceRepository } from '../repositories/AbsenceRepository';
import { AvailabilityService } from '../services/AvailabilityService';
import { RendezVousService } from '../services/RendezVousService';
import { authMiddleware } from '../middlewares/authMiddleware';
import { requireRole } from '../middlewares/roleMiddleware';
import { validate } from '../middlewares/validationMiddleware';
import { createRendezVousSchema } from '../validators/rendezvousValidator';
import { RoleUser } from '@prisma/client';
import { prisma } from '../config/database';

const router = Router();

// ── Composition des dépendances ───────────────────────────────────────────────
const absenceRepository = new AbsenceRepository(prisma);
const rendezVousRepository = new RendezVousRepository(prisma);
const availabilityService = new AvailabilityService(absenceRepository, rendezVousRepository);
const rendezVousService = new RendezVousService(rendezVousRepository, availabilityService);
const rdvController = new RendezVousController(rendezVousService);

// ── Routes ────────────────────────────────────────────────────────────────────

/** GET /api/rendezvous [Admin] */
router.get('/', authMiddleware, requireRole(RoleUser.admin), rdvController.getAll);

/** GET /api/rendezvous/mes-rdv [Patient authentifié] */
router.get('/mes-rdv', authMiddleware, rdvController.getMesRdv as never);

// POST /api/rendezvous - Créer un rendez-vous (Réservé aux patients authentifiés)
router.post(
  '/',
  authMiddleware,
  validate(createRendezVousSchema),
  rdvController.create
);

/** PATCH /api/rendezvous/:id/annuler — Annuler un RDV */
router.patch('/:id/annuler', authMiddleware, rdvController.cancel);

/** PATCH /api/rendezvous/:id/confirmer — Confirmer un RDV (Admin) */
router.patch('/:id/confirmer', authMiddleware, requireRole(RoleUser.admin), rdvController.confirm);

export default router;
