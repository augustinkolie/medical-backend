/**
 * @file IRendezVousRepository.ts
 * @description Interface du repository RendezVous.
 *
 * @module interfaces/repositories
 */

import { RendezVous, Medecin, Centre, StatutRdv } from '@prisma/client';

/** Rendez-vous avec ses relations médecin et centre */
export type RendezVousWithRelations = RendezVous & {
  medecin: Medecin;
  centre: Centre;
};

/**
 * DTO pour la création d'un rendez-vous.
 */
export interface CreateRendezVousDto {
  patientNom: string;
  patientEmail: string;
  medecinId: number;
  centreId: number;
  dateHeure: Date;
  motifConsult?: string;
  utilisateurId?: number;
}

/**
 * Filtres pour la recherche de rendez-vous.
 */
export interface RendezVousFilters {
  medecinId?: number;
  centreId?: number;
  patientEmail?: string;
  statut?: StatutRdv;
  dateDebut?: Date;
  dateFin?: Date;
  utilisateurId?: number;
}

/**
 * Contrat d'accès aux données pour les rendez-vous.
 */
export interface IRendezVousRepository {
  /**
   * Récupère tous les rendez-vous, avec filtres optionnels.
   * Réservé à l'interface admin.
   * @param filters - Critères de filtrage optionnels
   * @returns Liste filtrée des rendez-vous
   */
  findAll(filters?: RendezVousFilters): Promise<RendezVousWithRelations[]>;

  /**
   * Trouve les rendez-vous confirmés d'un médecin sur une journée donnée.
   * Utilisé pour vérifier la disponibilité d'un créneau.
   * @param medecinId - Identifiant du médecin
   * @param date - Journée à vérifier
   * @returns Rendez-vous confirmés du médecin ce jour-là
   */
  findConfirmedByMedecinAndDate(
    medecinId: number,
    date: Date
  ): Promise<RendezVous[]>;

  /**
   * Trouve un rendez-vous par son identifiant.
   * @param id - Identifiant du RDV
   * @returns Le rendez-vous ou null
   */
  findById(id: number): Promise<RendezVousWithRelations | null>;

  /**
   * Crée un nouveau rendez-vous.
   * @param data - Données du RDV
   * @returns Le rendez-vous créé
   */
  create(data: CreateRendezVousDto): Promise<RendezVousWithRelations>;

  /**
   * Annule un rendez-vous (passe le statut à 'annule').
   * @param id - Identifiant du RDV à annuler
   * @returns Le rendez-vous mis à jour
   */
  cancel(id: number): Promise<RendezVous>;
}
