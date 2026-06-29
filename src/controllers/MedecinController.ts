/**
 * @file MedecinController.ts
 * @description Controller HTTP pour les médecins et leurs absences.
 *
 * @module controllers
 */

import { Request, Response, NextFunction } from 'express';
import { MedecinService } from '../services/MedecinService';
import { RendezVousService } from '../services/RendezVousService';

/**
 * Controller REST pour les médecins, spécialités et absences.
 */
export class MedecinController {
  constructor(
    private readonly medecinService: MedecinService,
    private readonly rendezVousService: RendezVousService
  ) {}

  /**
   * GET /api/medecins
   * Liste tous les médecins.
   */
  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const medecins = await this.medecinService.getAllMedecins();
      res.json({ success: true, data: medecins, meta: { total: medecins.length } });
    } catch (e) { next(e); }
  };

  /**
   * GET /api/centres/:centreId/specialites/:specialiteId/medecins
   * Médecins d'un centre pour une spécialité.
   */
  getByCentreAndSpecialite = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const centreId = Number(req.params['centreId']);
      const specialiteId = Number(req.params['specialiteId']);
      const medecins = await this.medecinService.getMedecinsByCentreAndSpecialite(centreId, specialiteId);
      res.json({ success: true, data: medecins });
    } catch (e) { next(e); }
  };

  /**
   * GET /api/medecins/:id
   */
  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const medecin = await this.medecinService.getMedecinById(Number(req.params['id']));
      res.json({ success: true, data: medecin });
    } catch (e) { next(e); }
  };

  /**
   * GET /api/medecins/:id/creneaux?date=YYYY-MM-DD
   * Créneaux disponibles d'un médecin pour une journée.
   */
  getCreneaux = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const medecinId = Number(req.params['id']);
      const date = req.query['date'] as string;
      const creneaux = await this.rendezVousService.getCreneauxDisponibles(medecinId, date);
      res.json({ success: true, data: creneaux });
    } catch (e) { next(e); }
  };

  /**
   * POST /api/medecins [Admin]
   */
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const medecin = await this.medecinService.createMedecin(req.body);
      res.status(201).json({ success: true, data: medecin, message: 'Médecin créé avec succès' });
    } catch (e) { next(e); }
  };

  /**
   * PATCH /api/medecins/:id [Admin]
   */
  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const medecin = await this.medecinService.updateMedecin(Number(req.params['id']), req.body);
      res.json({ success: true, data: medecin, message: 'Médecin mis à jour' });
    } catch (e) { next(e); }
  };

  /**
   * DELETE /api/medecins/:id [Admin]
   */
  delete = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.medecinService.deleteMedecin(Number(req.params['id']));
      res.json({ success: true, data: null, message: 'Médecin supprimé' });
    } catch (e) { next(e); }
  };

  // ─── Absences ─────────────────────────────────────────────────────────────

  /** GET /api/absences [Admin] */
  getAllAbsences = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const absences = await this.medecinService.getAllAbsences();
      res.json({ success: true, data: absences });
    } catch (e) { next(e); }
  };

  /** POST /api/absences [Admin] */
  createAbsence = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const absence = await this.medecinService.createAbsence(req.body);
      res.status(201).json({ success: true, data: absence, message: 'Absence déclarée' });
    } catch (e) { next(e); }
  };

  /** DELETE /api/absences/:id [Admin] */
  deleteAbsence = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.medecinService.deleteAbsence(Number(req.params['id']));
      res.json({ success: true, data: null, message: 'Absence supprimée' });
    } catch (e) { next(e); }
  };
}
