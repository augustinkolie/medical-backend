/**
 * @file MedecinRepository.ts
 * @description Implémentation Prisma du repository Médecin.
 *
 * @module repositories
 */

import { PrismaClient, Medecin } from '@prisma/client';
import {
  IMedecinRepository,
  MedecinWithRelations,
  CreateMedecinDto,
  UpdateMedecinDto,
} from '../interfaces/repositories/IMedecinRepository';
import { AppError } from '../middlewares/errorMiddleware';
import { ErrorCode } from '../types';

/** Inclusion des relations pour les requêtes médecin */
const INCLUDE_RELATIONS = {
  centre: true,
  specialite: true,
} as const;

/**
 * Implémentation concrète du repository Médecin via Prisma.
 */
export class MedecinRepository implements IMedecinRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /** @inheritdoc */
  async findAll(): Promise<MedecinWithRelations[]> {
    return this.prisma.medecin.findMany({
      include: INCLUDE_RELATIONS,
      orderBy: [{ nom: 'asc' }, { prenom: 'asc' }],
    });
  }

  /** @inheritdoc */
  async findByCentreAndSpecialite(
    centreId: number,
    specialiteId: number
  ): Promise<MedecinWithRelations[]> {
    return this.prisma.medecin.findMany({
      where: { centreId, specialiteId },
      include: INCLUDE_RELATIONS,
      orderBy: [{ nom: 'asc' }, { prenom: 'asc' }],
    });
  }

  /** @inheritdoc */
  async findById(id: number): Promise<MedecinWithRelations | null> {
    return this.prisma.medecin.findUnique({
      where: { id },
      include: INCLUDE_RELATIONS,
    });
  }

  /** @inheritdoc */
  async create(data: CreateMedecinDto): Promise<MedecinWithRelations> {
    try {
      return await this.prisma.medecin.create({
        data,
        include: INCLUDE_RELATIONS,
      });
    } catch {
      throw new AppError(
        `Un médecin avec l'email ${data.email} existe déjà`,
        409,
        ErrorCode.DUPLICATE_EMAIL
      );
    }
  }

  /** @inheritdoc */
  async update(
    id: number,
    data: UpdateMedecinDto
  ): Promise<MedecinWithRelations> {
    try {
      return await this.prisma.medecin.update({
        where: { id },
        data,
        include: INCLUDE_RELATIONS,
      });
    } catch {
      throw new AppError(
        `Médecin #${id} introuvable`,
        404,
        ErrorCode.NOT_FOUND
      );
    }
  }

  /** @inheritdoc */
  async delete(id: number): Promise<Medecin> {
    try {
      return await this.prisma.medecin.delete({ where: { id } });
    } catch {
      throw new AppError(
        `Impossible de supprimer le médecin #${id}`,
        409,
        ErrorCode.RESOURCE_IN_USE
      );
    }
  }
}
