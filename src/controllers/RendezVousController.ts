/**
 * @file RendezVousController.ts
 * @description Controller HTTP pour les rendez-vous médicaux.
 *
 * @module controllers
 */

import { Request, Response, NextFunction } from 'express';
import { RendezVousService } from '../services/RendezVousService';
import { AuthenticatedRequest } from '../types';

/**
 * Controller REST pour les rendez-vous.
 */
export class RendezVousController {
  constructor(private readonly rendezVousService: RendezVousService) {}

  /**
   * GET /api/rendezvous [Admin]
   * Liste tous les rendez-vous avec filtres optionnels.
   */
  getAll = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rdvs = await this.rendezVousService.getAllRendezVous();
      res.json({ success: true, data: rdvs, meta: { total: rdvs.length } });
    } catch (e) { next(e); }
  };

  /**
   * GET /api/rendezvous/mes-rdv [Patient]
   * Récupère les rendez-vous de l'utilisateur connecté.
   */
  getMesRdv = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rdvs = await this.rendezVousService.getAllRendezVous({
        utilisateurId: req.user.userId,
      });
      res.json({ success: true, data: rdvs });
    } catch (e) { next(e); }
  };

  /**
   * POST /api/rendezvous
   * Crée un nouveau rendez-vous avec vérification de disponibilité.
   */
  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const rdv = await this.rendezVousService.createRendezVous({
        ...req.body,
        utilisateurId: authReq.user?.userId ?? undefined,
      });
      res.status(201).json({
        success: true,
        data: rdv,
        message: 'Rendez-vous confirmé avec succès',
      });
    } catch (e) { next(e); }
  };

  /**
   * PATCH /api/rendezvous/:id/annuler
   * Annule un rendez-vous existant.
   */
  cancel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params['id']);
      const authReq = req as AuthenticatedRequest;
      await this.rendezVousService.cancelRendezVous(
        id,
        authReq.user?.userId,
        authReq.user?.role
      );
      res.json({ success: true, data: null, message: 'Rendez-vous annulé' });
    } catch (e) { next(e); }
  };

  /**
   * PATCH /api/rendezvous/:id/confirmer [Admin]
   * Confirme un rendez-vous existant.
   */
  confirm = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params['id']);
      await this.rendezVousService.confirmRendezVous(id);
      res.json({ success: true, data: null, message: 'Rendez-vous confirmé' });
    } catch (e) { next(e); }
  };
}
