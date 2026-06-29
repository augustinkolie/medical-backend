/**
 * @file CentreService.ts
 * @description Service métier pour la gestion des centres médicaux.
 *
 * @module services
 */

import { Centre } from '@prisma/client';
import { ICentreRepository, CreateCentreDto, UpdateCentreDto } from '../interfaces/repositories/ICentreRepository';
import { AppError } from '../middlewares/errorMiddleware';
import { ErrorCode } from '../types';

/**
 * Service métier pour les centres médicaux.
 * Orchestre les validations métier et délègue les accès données au repository.
 */
export class CentreService {
  constructor(private readonly centreRepository: ICentreRepository) {}

  /**
   * Récupère la liste complète des centres.
   * @returns Liste des centres triés par nom
   */
  async getAllCentres(): Promise<Centre[]> {
    return this.centreRepository.findAll();
  }

  /**
   * Récupère un centre par son ID.
   * @param id - Identifiant du centre
   * @throws {AppError} 404 si le centre n'existe pas
   */
  async getCentreById(id: number): Promise<Centre> {
    const centre = await this.centreRepository.findById(id);
    if (!centre) {
      throw new AppError(`Centre #${id} introuvable`, 404, ErrorCode.NOT_FOUND);
    }
    return centre;
  }

  /**
   * Crée un nouveau centre médical.
   * @param data - Données du centre (nom, adresse, contact)
   * @returns Le centre créé
   */
  async createCentre(data: CreateCentreDto): Promise<Centre> {
    return this.centreRepository.create(data);
  }

  /**
   * Met à jour un centre existant.
   * @param id - Identifiant du centre
   * @param data - Champs à mettre à jour
   * @throws {AppError} 404 si le centre n'existe pas
   */
  async updateCentre(id: number, data: UpdateCentreDto): Promise<Centre> {
    await this.getCentreById(id); // Vérifie l'existence avant la mise à jour
    return this.centreRepository.update(id, data);
  }

  /**
   * Supprime un centre médical.
   * @param id - Identifiant du centre
   * @throws {AppError} 409 si des médecins ou RDV sont liés
   */
  async deleteCentre(id: number): Promise<void> {
    await this.getCentreById(id);
    await this.centreRepository.delete(id);
  }
}
