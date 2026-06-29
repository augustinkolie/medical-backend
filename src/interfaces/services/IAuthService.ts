/**
 * @file IAuthService.ts
 * @description Interface du service d'authentification JWT.
 *
 * @module interfaces/services
 */

import { Utilisateur } from '@prisma/client';
import { JwtPayload } from '../../types';

/**
 * Résultat de la connexion — token JWT + infos utilisateur (sans password).
 */
export interface LoginResult {
  /** Token JWT à transmettre dans les en-têtes Authorization */
  accessToken: string;
  /** Données publiques de l'utilisateur */
  user: Omit<Utilisateur, 'passwordHash'>;
}

/**
 * Contrat du service d'authentification.
 */
export interface IAuthService {
  /**
   * Authentifie un utilisateur avec email + mot de passe.
   * Vérifie le hash bcrypt et génère un JWT si les credentials sont valides.
   *
   * @param email - Email de l'utilisateur
   * @param password - Mot de passe en clair
   * @returns Token JWT et infos utilisateur
   * @throws {AppError} INVALID_CREDENTIALS si les identifiants sont incorrects
   */
  login(email: string, password: string): Promise<LoginResult>;

  /**
   * Hache un mot de passe avec bcrypt.
   * @param password - Mot de passe en clair
   * @returns Hash bcrypt
   */
  hashPassword(password: string): Promise<string>;

  /**
   * Vérifie la validité d'un token JWT et en extrait le payload.
   * @param token - Token JWT à vérifier
   * @returns Payload décodé si le token est valide
   * @throws {AppError} TOKEN_EXPIRED ou UNAUTHORIZED si invalide
   */
  verifyToken(token: string): JwtPayload;

  /**
   * Génère un token JWT pour un utilisateur.
   * @param payload - Données à inclure dans le token
   * @returns Token JWT signé
   */
  generateToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string;
}
