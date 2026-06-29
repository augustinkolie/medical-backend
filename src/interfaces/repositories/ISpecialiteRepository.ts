/**
 * @file ISpecialiteRepository.ts
 * @description Interface du repository Spécialité.
 *
 * @module interfaces/repositories
 */

import { Specialite } from '@prisma/client';

/**
 * DTO pour la création d'une spécialité médicale.
 */
export interface CreateSpecialiteDto {
  nom: string;
  description?: string;
}

/**
 * DTO pour la mise à jour d'une spécialité.
 */
export interface UpdateSpecialiteDto {
  nom?: string;
  description?: string;
}

/**
 * Contrat d'accès aux données pour les spécialités médicales.
 */
export interface ISpecialiteRepository {
  /**
   * Récupère toutes les spécialités disponibles.
   * @returns Liste complète des spécialités
   */
  findAll(): Promise<Specialite[]>;

  /**
   * Récupère les spécialités disponibles dans un centre spécifique.
   * (Spécialités pratiquées par au moins un médecin du centre)
   * @param centreId - Identifiant du centre médical
   * @returns Spécialités présentes dans ce centre
   */
  findByCentre(centreId: number): Promise<Specialite[]>;

  /**
   * Trouve une spécialité par son identifiant.
   * @param id - Identifiant de la spécialité
   * @returns La spécialité ou null
   */
  findById(id: number): Promise<Specialite | null>;

  /**
   * Crée une nouvelle spécialité médicale.
   * @param data - Données de la spécialité
   * @returns La spécialité créée
   */
  create(data: CreateSpecialiteDto): Promise<Specialite>;

  /**
   * Met à jour une spécialité existante.
   * @param id - Identifiant de la spécialité
   * @param data - Données à modifier
   * @returns La spécialité mise à jour
   */
  update(id: number, data: UpdateSpecialiteDto): Promise<Specialite>;

  /**
   * Supprime une spécialité.
   * @param id - Identifiant de la spécialité
   * @returns La spécialité supprimée
   */
  delete(id: number): Promise<Specialite>;
}
