/**
 * @file specialiteRoutes.ts
 * @description Routes Express pour les spécialités médicales.
 */

import { Router } from 'express';
import { SpecialiteRepository } from '../repositories/SpecialiteRepository';
import { prisma } from '../config/database';

const router = Router();
const specialiteRepository = new SpecialiteRepository(prisma);

/** GET /api/specialites */
router.get('/', async (req, res, next) => {
  try {
    const specialites = await specialiteRepository.findAll();
    res.json({ success: true, data: specialites });
  } catch (e) {
    next(e);
  }
});

export default router;
