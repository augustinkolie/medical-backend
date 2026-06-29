/**
 * @file CentreController.ts
 * @description Controller HTTP pour les centres médicaux.
 *
 * @module controllers
 */

import { Request, Response, NextFunction } from 'express';
import { CentreService } from '../services/CentreService';
import { ApiSuccessResponse } from '../types';
import { Centre } from '@prisma/client';

/**
 * Controller REST pour les centres médicaux.
 * Chaque méthode correspond à un endpoint de l'API.
 */
export class CentreController {
  constructor(private readonly centreService: CentreService) {}

  /**
   * GET /api/centres
   * Récupère la liste de tous les centres médicaux.
   */
  getAll = async (
    _req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const centres = await this.centreService.getAllCentres();
      const response: ApiSuccessResponse<Centre[]> = {
        success: true,
        data: centres,
        meta: { total: centres.length },
      };
      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/centres/:id
   * Récupère un centre par son identifiant.
   */
  getById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params['id']);
      const centre = await this.centreService.getCentreById(id);
      res.status(200).json({ success: true, data: centre });
    } catch (error) {
      next(error);
    }
  };

  /**
   * GET /api/centres/:id/specialites
   * Récupère les spécialités disponibles dans un centre.
   */
  getSpecialites = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Note: cette méthode serait sur SpecialiteService, mais simplifiée ici
      const id = Number(req.params['id']);
      await this.centreService.getCentreById(id); // vérifie l'existence
      // Délégation réelle au SpecialiteService dans la route
      res.status(200).json({ success: true, data: [] });
    } catch (error) {
      next(error);
    }
  };

  /**
   * POST /api/centres
   * Crée un nouveau centre médical. [Admin uniquement]
   */
  create = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const centre = await this.centreService.createCentre(req.body);
      res.status(201).json({
        success: true,
        data: centre,
        message: 'Centre créé avec succès',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * PATCH /api/centres/:id
   * Met à jour un centre existant. [Admin uniquement]
   */
  update = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params['id']);
      const centre = await this.centreService.updateCentre(id, req.body);
      res.status(200).json({
        success: true,
        data: centre,
        message: 'Centre mis à jour avec succès',
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * DELETE /api/centres/:id
   * Supprime un centre. [Admin uniquement]
   */
  delete = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params['id']);
      await this.centreService.deleteCentre(id);
      res.status(200).json({
        success: true,
        data: null,
        message: 'Centre supprimé avec succès',
      });
    } catch (error) {
      next(error);
    }
  };
}
