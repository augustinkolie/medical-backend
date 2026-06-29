/**
 * @file IUtilisateurRepository.ts
 * @description Interface du repository Utilisateur.
 *
 * @module interfaces/repositories
 */

import { Utilisateur, RoleUser } from '@prisma/client';

/**
 * DTO pour la création d'un utilisateur.
 * Le password_hash est calculé par l'AuthService avant d'appeler le repository.
 */
export interface CreateUtilisateurDto {
  email: string;
  passwordHash: string;
  nom?: string;
  prenom?: string;
  role?: RoleUser;
}

/**
 * Contrat d'accès aux données pour les utilisateurs.
 */
export interface IUtilisateurRepository {
  /**
   * Trouve un utilisateur par son email (pour la connexion).
   * @param email - Email de l'utilisateur
   * @returns L'utilisateur ou null si non trouvé
   */
  findByEmail(email: string): Promise<Utilisateur | null>;

  /**
   * Trouve un utilisateur par son identifiant.
   * @param id - Identifiant de l'utilisateur
   * @returns L'utilisateur ou null
   */
  findById(id: number): Promise<Utilisateur | null>;

  /**
   * Crée un nouveau compte utilisateur.
   * @param data - Données de l'utilisateur (password déjà haché)
   * @returns L'utilisateur créé
   */
  create(data: CreateUtilisateurDto): Promise<Utilisateur>;
}
