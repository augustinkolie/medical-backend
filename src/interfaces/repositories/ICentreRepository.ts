/**
 * @file ICentreRepository.ts
 * @description Interface du repository Centre — contrat d'accès aux données.
 *
 * @module interfaces/repositories
 */

import { Centre } from '@prisma/client';

/**
 * DTO pour la création d'un centre médical.
 * Exclut les champs générés automatiquement (id, timestamps).
 */
export interface CreateCentreDto {
  nom: string;
  adresse: string;
  contact: string;
}

/**
 * DTO pour la mise à jour partielle d'un centre.
 * Tous les champs sont optionnels (PATCH sémantique).
 */
export interface UpdateCentreDto {
  nom?: string;
  adresse?: string;
  contact?: string;
}

/**
 * Contrat d'accès aux données pour les centres médicaux.
 * Toute implémentation concrète doit respecter ce contrat.
 */
export interface ICentreRepository {
  /**
   * Récupère tous les centres médicaux.
   * @returns Liste de tous les centres
   */
  findAll(): Promise<Centre[]>;

  /**
   * Trouve un centre par son identifiant unique.
   * @param id - Identifiant du centre
   * @returns Le centre trouvé ou null s'il n'existe pas
   */
  findById(id: number): Promise<Centre | null>;

  /**
   * Crée un nouveau centre médical.
   * @param data - Données du centre à créer
   * @returns Le centre créé avec son identifiant généré
   */
  create(data: CreateCentreDto): Promise<Centre>;

  /**
   * Met à jour les informations d'un centre existant.
   * @param id - Identifiant du centre à mettre à jour
   * @param data - Champs à modifier (partiel)
   * @returns Le centre mis à jour
   */
  update(id: number, data: UpdateCentreDto): Promise<Centre>;

  /**
   * Supprime un centre médical.
   * @param id - Identifiant du centre à supprimer
   * @returns Le centre supprimé
   * @throws {Error} Si le centre a des médecins ou RDV associés
   */
  delete(id: number): Promise<Centre>;
}
