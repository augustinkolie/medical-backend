/**
 * @file CentreRepository.ts
 * @description Implémentation Prisma du repository Centre.
 *
 * @module repositories
 */

import { PrismaClient, Centre } from '@prisma/client';
import {
  ICentreRepository,
  CreateCentreDto,
  UpdateCentreDto,
} from '../interfaces/repositories/ICentreRepository';
import { AppError } from '../middlewares/errorMiddleware';
import { ErrorCode } from '../types';

/**
 * Implémentation concrète du repository Centre via Prisma ORM.
 * Toutes les erreurs Prisma sont converties en `AppError` métier.
 */
export class CentreRepository implements ICentreRepository {
  /**
   * @param prisma - Instance du client Prisma (injecté)
   */
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * @inheritdoc
   */
  async findAll(): Promise<Centre[]> {
    return this.prisma.centre.findMany({
      orderBy: { nom: 'asc' },
    });
  }

  /**
   * @inheritdoc
   */
  async findById(id: number): Promise<Centre | null> {
    return this.prisma.centre.findUnique({
      where: { id },
    });
  }

  /**
   * @inheritdoc
   */
  async create(data: CreateCentreDto): Promise<Centre> {
    return this.prisma.centre.create({ data });
  }

  /**
   * @inheritdoc
   */
  async update(id: number, data: UpdateCentreDto): Promise<Centre> {
    try {
      return await this.prisma.centre.update({
        where: { id },
        data,
      });
    } catch {
      throw new AppError(`Centre #${id} introuvable`, 404, ErrorCode.NOT_FOUND);
    }
  }

  /**
   * @inheritdoc
   */
  async delete(id: number): Promise<Centre> {
    try {
      return await this.prisma.centre.delete({ where: { id } });
    } catch {
      throw new AppError(
        `Impossible de supprimer le centre #${id} — des médecins ou RDV y sont associés`,
        409,
        ErrorCode.RESOURCE_IN_USE
      );
    }
  }
}
