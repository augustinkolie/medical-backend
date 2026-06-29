/**
 * @file SpecialiteRepository.ts
 * @description Implémentation Prisma du repository Spécialité.
 *
 * @module repositories
 */

import { PrismaClient, Specialite } from '@prisma/client';
import {
  ISpecialiteRepository,
  CreateSpecialiteDto,
  UpdateSpecialiteDto,
} from '../interfaces/repositories/ISpecialiteRepository';
import { AppError } from '../middlewares/errorMiddleware';
import { ErrorCode } from '../types';

/**
 * Implémentation concrète du repository Spécialité via Prisma.
 */
export class SpecialiteRepository implements ISpecialiteRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /** @inheritdoc */
  async findAll(): Promise<Specialite[]> {
    return this.prisma.specialite.findMany({ orderBy: { nom: 'asc' } });
  }

  /** @inheritdoc */
  async findByCentre(centreId: number): Promise<Specialite[]> {
    // Récupère les spécialités distinctes des médecins du centre
    const medecins = await this.prisma.medecin.findMany({
      where: { centreId },
      select: { specialite: true },
      distinct: ['specialiteId'],
    });
    return medecins.map((m) => m.specialite);
  }

  /** @inheritdoc */
  async findById(id: number): Promise<Specialite | null> {
    return this.prisma.specialite.findUnique({ where: { id } });
  }

  /** @inheritdoc */
  async create(data: CreateSpecialiteDto): Promise<Specialite> {
    try {
      return await this.prisma.specialite.create({ data });
    } catch {
      throw new AppError(
        `La spécialité "${data.nom}" existe déjà`,
        409,
        ErrorCode.DUPLICATE_EMAIL
      );
    }
  }

  /** @inheritdoc */
  async update(id: number, data: UpdateSpecialiteDto): Promise<Specialite> {
    try {
      return await this.prisma.specialite.update({ where: { id }, data });
    } catch {
      throw new AppError(
        `Spécialité #${id} introuvable`,
        404,
        ErrorCode.NOT_FOUND
      );
    }
  }

  /** @inheritdoc */
  async delete(id: number): Promise<Specialite> {
    try {
      return await this.prisma.specialite.delete({ where: { id } });
    } catch {
      throw new AppError(
        `Impossible de supprimer la spécialité #${id}`,
        409,
        ErrorCode.RESOURCE_IN_USE
      );
    }
  }
}
