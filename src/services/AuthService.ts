/**
 * @file AuthService.ts
 * @description Service d'authentification : hachage bcrypt + JWT.
 *
 * @module services
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IAuthService, LoginResult } from '../interfaces/services/IAuthService';
import { IUtilisateurRepository } from '../interfaces/repositories/IUtilisateurRepository';
import { AppError } from '../middlewares/errorMiddleware';
import { ErrorCode, JwtPayload } from '../types';
import { env } from '../config/env';

/**
 * Implémentation du service d'authentification.
 */
export class AuthService implements IAuthService {
  /**
   * @param utilisateurRepository - Repository utilisateur (injecté)
   */
  constructor(
    private readonly utilisateurRepository: IUtilisateurRepository
  ) {}

  /**
   * @inheritdoc
   */
  async login(email: string, password: string): Promise<LoginResult> {
    // Recherche l'utilisateur par email (insensible à la casse)
    const utilisateur = await this.utilisateurRepository.findByEmail(
      email.toLowerCase()
    );

    if (!utilisateur) {
      // Message générique pour éviter l'énumération d'emails
      throw new AppError(
        'Email ou mot de passe incorrect',
        401,
        ErrorCode.INVALID_CREDENTIALS
      );
    }

    // Vérification du mot de passe avec bcrypt
    const passwordMatch = await bcrypt.compare(
      password,
      utilisateur.passwordHash
    );

    if (!passwordMatch) {
      throw new AppError(
        'Email ou mot de passe incorrect',
        401,
        ErrorCode.INVALID_CREDENTIALS
      );
    }

    // Génération du JWT
    const accessToken = this.generateToken({
      userId: utilisateur.id,
      email: utilisateur.email,
      role: utilisateur.role,
    });

    // Retourne le token et les données publiques (sans le hash du mot de passe)
    const { passwordHash: _hash, ...userPublic } = utilisateur;

    return {
      accessToken,
      user: userPublic,
    };
  }

  /**
   * @inheritdoc
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
  }

  /**
   * @inheritdoc
   */
  verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError('Token expiré', 401, ErrorCode.TOKEN_EXPIRED);
      }
      throw new AppError('Token invalide', 401, ErrorCode.UNAUTHORIZED);
    }
  }

  /**
   * @inheritdoc
   */
  generateToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
    });
  }
}
