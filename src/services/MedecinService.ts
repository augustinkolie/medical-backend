/**
 * @file MedecinService.ts
 * @description Service métier pour la gestion des médecins.
 *
 * @module services
 */

import { ISpecialiteRepository } from '../interfaces/repositories/ISpecialiteRepository';
import {
  IMedecinRepository,
  MedecinWithRelations,
  CreateMedecinDto,
  UpdateMedecinDto,
} from '../interfaces/repositories/IMedecinRepository';
import { IAbsenceRepository, CreateAbsenceDto, UpdateAbsenceDto, AbsenceWithMedecin } from '../interfaces/repositories/IAbsenceRepository';
import { AppError } from '../middlewares/errorMiddleware';
import { ErrorCode } from '../types';
import { Absence } from '@prisma/client';

/**
 * Service métier pour les médecins et leurs absences.
 */
export class MedecinService {
  constructor(
    private readonly medecinRepository: IMedecinRepository,
    private readonly specialiteRepository: ISpecialiteRepository,
    private readonly absenceRepository: IAbsenceRepository
  ) {}

  /** Récupère tous les médecins */
  async getAllMedecins(): Promise<MedecinWithRelations[]> {
    return this.medecinRepository.findAll();
  }

  /**
   * Récupère les médecins d'un centre pour une spécialité.
   * @param centreId - Identifiant du centre
   * @param specialiteId - Identifiant de la spécialité
   */
  async getMedecinsByCentreAndSpecialite(
    centreId: number,
    specialiteId: number
  ): Promise<MedecinWithRelations[]> {
    return this.medecinRepository.findByCentreAndSpecialite(centreId, specialiteId);
  }

  /**
   * Récupère un médecin par son ID.
   * @throws {AppError} 404 si introuvable
   */
  async getMedecinById(id: number): Promise<MedecinWithRelations> {
    const medecin = await this.medecinRepository.findById(id);
    if (!medecin) {
      throw new AppError(`Médecin #${id} introuvable`, 404, ErrorCode.NOT_FOUND);
    }
    return medecin;
  }

  /**
   * Crée un nouveau médecin après vérification du centre et de la spécialité.
   */
  async createMedecin(data: CreateMedecinDto): Promise<MedecinWithRelations> {
    // Vérification que la spécialité existe
    const specialite = await this.specialiteRepository.findById(data.specialiteId);
    if (!specialite) {
      throw new AppError(
        `Spécialité #${data.specialiteId} introuvable`,
        404,
        ErrorCode.NOT_FOUND
      );
    }
    return this.medecinRepository.create(data);
  }

  /** Met à jour un médecin */
  async updateMedecin(
    id: number,
    data: UpdateMedecinDto
  ): Promise<MedecinWithRelations> {
    await this.getMedecinById(id);
    return this.medecinRepository.update(id, data);
  }

  /** Supprime un médecin */
  async deleteMedecin(id: number): Promise<void> {
    await this.getMedecinById(id);
    await this.medecinRepository.delete(id);
  }

  // ─── Gestion des absences ─────────────────────────────────────────────────

  /** Crée une absence pour un médecin */
  async createAbsence(data: CreateAbsenceDto): Promise<Absence> {
    // Vérifie que le médecin existe
    await this.getMedecinById(data.medecinId);

    // Validation des dates
    if (data.dateDebut >= data.dateFin) {
      throw new AppError(
        'La date de début doit être antérieure à la date de fin',
        400,
        ErrorCode.VALIDATION_ERROR
      );
    }
    return this.absenceRepository.create(data);
  }

  /** Récupère toutes les absences */
  async getAllAbsences(): Promise<AbsenceWithMedecin[]> {
    return this.absenceRepository.findAll();
  }

  /** Met à jour une absence */
  async updateAbsence(id: number, data: UpdateAbsenceDto): Promise<Absence> {
    return this.absenceRepository.update(id, data);
  }

  /** Supprime une absence */
  async deleteAbsence(id: number): Promise<void> {
    await this.absenceRepository.delete(id);
  }
}
