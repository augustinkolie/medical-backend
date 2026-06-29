/**
 * @file IMedecinRepository.ts
 * @description Interface du repository Médecin.
 *
 * @module interfaces/repositories
 */

import { Medecin, Specialite, Centre } from '@prisma/client';

/** Médecin avec ses relations (centre + spécialité) */
export type MedecinWithRelations = Medecin & {
  centre: Centre;
  specialite: Specialite;
};

/**
 * DTO pour la création d'un médecin.
 */
export interface CreateMedecinDto {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  centreId: number;
  specialiteId: number;
}

/**
 * DTO pour la mise à jour partielle d'un médecin.
 */
export interface UpdateMedecinDto {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  centreId?: number;
  specialiteId?: number;
}

/**
 * Contrat d'accès aux données pour les médecins.
 */
export interface IMedecinRepository {
  /**
   * Récupère tous les médecins avec leurs relations.
   * @returns Liste complète des médecins
   */
  findAll(): Promise<MedecinWithRelations[]>;

  /**
   * Récupère les médecins d'un centre pour une spécialité donnée.
   * @param centreId - Identifiant du centre médical
   * @param specialiteId - Identifiant de la spécialité
   * @returns Médecins correspondants
   */
  findByCentreAndSpecialite(
    centreId: number,
    specialiteId: number
  ): Promise<MedecinWithRelations[]>;

  /**
   * Trouve un médecin par son identifiant avec ses relations.
   * @param id - Identifiant du médecin
   * @returns Le médecin ou null
   */
  findById(id: number): Promise<MedecinWithRelations | null>;

  /**
   * Crée un nouveau médecin.
   * @param data - Données du médecin
   * @returns Le médecin créé
   */
  create(data: CreateMedecinDto): Promise<MedecinWithRelations>;

  /**
   * Met à jour un médecin.
   * @param id - Identifiant du médecin
   * @param data - Données à modifier
   * @returns Le médecin mis à jour
   */
  update(id: number, data: UpdateMedecinDto): Promise<MedecinWithRelations>;

  /**
   * Supprime un médecin.
   * @param id - Identifiant du médecin
   * @returns Le médecin supprimé
   */
  delete(id: number): Promise<Medecin>;
}
