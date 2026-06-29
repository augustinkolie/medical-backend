/**
 * @file RendezVousService.ts
 * @description Service métier pour la gestion des rendez-vous.
 *
 * @module services
 */

import {
  IRendezVousRepository,
  RendezVousWithRelations,
  CreateRendezVousDto,
  RendezVousFilters,
} from '../interfaces/repositories/IRendezVousRepository';
import { IAvailabilityService } from '../interfaces/services/IAvailabilityService';
import { AppError } from '../middlewares/errorMiddleware';
import { ErrorCode, Creneau } from '../types';
import { StatutRdv } from '@prisma/client';

/**
 * Service métier pour les rendez-vous médicaux.
 */
export class RendezVousService {
  constructor(
    private readonly rendezVousRepository: IRendezVousRepository,
    private readonly availabilityService: IAvailabilityService
  ) {}

  /**
   * Récupère tous les rendez-vous avec filtres optionnels.
   * Réservé à l'interface admin.
   */
  async getAllRendezVous(
    filters?: RendezVousFilters
  ): Promise<RendezVousWithRelations[]> {
    return this.rendezVousRepository.findAll(filters);
  }

  /**
   * Récupère un rendez-vous par son ID.
   * @throws {AppError} 404 si introuvable
   */
  async getRendezVousById(id: number): Promise<RendezVousWithRelations> {
    const rdv = await this.rendezVousRepository.findById(id);
    if (!rdv) {
      throw new AppError(
        `Rendez-vous #${id} introuvable`,
        404,
        ErrorCode.NOT_FOUND
      );
    }
    return rdv;
  }

  /**
   * Récupère les créneaux disponibles pour un médecin à une date donnée.
   * Délègue entièrement à l'AvailabilityService.
   *
   * @param medecinId - Identifiant du médecin
   * @param date - Date au format "YYYY-MM-DD"
   * @returns Liste des créneaux avec leur disponibilité
   */
  async getCreneauxDisponibles(
    medecinId: number,
    date: string
  ): Promise<Creneau[]> {
    return this.availabilityService.getAvailableSlots(medecinId, date);
  }

  /**
   * Crée un nouveau rendez-vous après vérification de la disponibilité.
   *
   * @param data - Données du rendez-vous
   * @throws {AppError} SLOT_NOT_AVAILABLE si le créneau est déjà pris
   * @returns Le rendez-vous créé avec ses relations
   */
  async createRendezVous(
    data: CreateRendezVousDto
  ): Promise<RendezVousWithRelations> {
    // Vérification atomique de la disponibilité du créneau
    const isAvailable = await this.availabilityService.isSlotAvailable(
      data.medecinId,
      data.dateHeure
    );

    if (!isAvailable) {
      throw new AppError(
        'Ce créneau n\'est plus disponible. Veuillez en choisir un autre.',
        409,
        ErrorCode.SLOT_NOT_AVAILABLE
      );
    }

    return this.rendezVousRepository.create(data);
  }

  /**
   * Annule un rendez-vous existant.
   *
   * @param id - Identifiant du RDV à annuler
   * @param utilisateurId - ID de l'utilisateur effectuant l'annulation (pour contrôle d'accès)
   * @param role - Rôle de l'utilisateur
   * @throws {AppError} APPOINTMENT_ALREADY_CANCELLED si déjà annulé
   * @throws {AppError} FORBIDDEN si le patient tente d'annuler un RDV qui n'est pas le sien
   */
  async cancelRendezVous(
    id: number,
    utilisateurId?: number,
    role?: string
  ): Promise<void> {
    const rdv = await this.getRendezVousById(id);

    // Vérification que le RDV n'est pas déjà annulé
    if (rdv.statut === StatutRdv.annule) {
      throw new AppError(
        'Ce rendez-vous est déjà annulé',
        400,
        ErrorCode.APPOINTMENT_ALREADY_CANCELLED
      );
    }

    // Un patient ne peut annuler que ses propres RDV
    if (
      role === 'patient' &&
      utilisateurId &&
      rdv.utilisateurId !== utilisateurId
    ) {
      throw new AppError(
        'Vous ne pouvez pas annuler un rendez-vous qui ne vous appartient pas',
        403,
        ErrorCode.FORBIDDEN
      );
    }

    await this.rendezVousRepository.cancel(id);
  }

  /**
   * Confirme un rendez-vous existant (Admin uniquement).
   * @param id - Identifiant du RDV à confirmer
   */
  async confirmRendezVous(id: number): Promise<void> {
    const rdv = await this.getRendezVousById(id);

    if (rdv.statut === StatutRdv.confirme) {
      throw new AppError(
        'Ce rendez-vous est déjà confirmé',
        400,
        ErrorCode.APPOINTMENT_ALREADY_CANCELLED
      );
    }

    await this.rendezVousRepository.confirm(id);
  }
}
