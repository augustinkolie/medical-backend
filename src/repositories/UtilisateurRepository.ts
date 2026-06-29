/**
 * @file UtilisateurRepository.ts
 * @description Implémentation Prisma du repository Utilisateur.
 *
 * @module repositories
 */

import { PrismaClient, Utilisateur } from '@prisma/client';
import {
  IUtilisateurRepository,
  CreateUtilisateurDto,
} from '../interfaces/repositories/IUtilisateurRepository';
import { AppError } from '../middlewares/errorMiddleware';
import { ErrorCode } from '../types';

/**
 * Implémentation concrète du repository Utilisateur via Prisma.
 */
export class UtilisateurRepository implements IUtilisateurRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /** @inheritdoc */
  async findByEmail(email: string): Promise<Utilisateur | null> {
    return this.prisma.utilisateur.findUnique({
      where: { email: email.toLowerCase() },
    });
  }

  /** @inheritdoc */
  async findById(id: number): Promise<Utilisateur | null> {
    return this.prisma.utilisateur.findUnique({ where: { id } });
  }

  /** @inheritdoc */
  async create(data: CreateUtilisateurDto): Promise<Utilisateur> {
    try {
      return await this.prisma.utilisateur.create({
        data: {
          ...data,
          email: data.email.toLowerCase(),
        },
      });
    } catch {
      throw new AppError(
        `L'email ${data.email} est déjà utilisé`,
        409,
        ErrorCode.DUPLICATE_EMAIL
      );
    }
  }
}
