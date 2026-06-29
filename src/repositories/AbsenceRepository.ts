/**
 * @file AbsenceRepository.ts
 * @description Implémentation Prisma du repository Absence.
 *
 * @module repositories
 */

import { PrismaClient, Absence } from '@prisma/client';
import {
  IAbsenceRepository,
  AbsenceWithMedecin,
  CreateAbsenceDto,
  UpdateAbsenceDto,
} from '../interfaces/repositories/IAbsenceRepository';
import { AppError } from '../middlewares/errorMiddleware';
import { ErrorCode } from '../types';

/**
 * Implémentation concrète du repository Absence via Prisma.
 */
export class AbsenceRepository implements IAbsenceRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /** @inheritdoc */
  async findAll(): Promise<AbsenceWithMedecin[]> {
    return this.prisma.absence.findMany({
      include: { medecin: true },
      orderBy: { dateDebut: 'desc' },
    });
  }

  /** @inheritdoc */
  async findByMedecinAndPeriod(
    medecinId: number,
    dateDebut: Date,
    dateFin: Date
  ): Promise<Absence[]> {
    // Requête : toutes les absences dont la période chevauche la fenêtre demandée.
    // Chevauchement si : absence.dateDebut < dateFin ET absence.dateFin > dateDebut
    return this.prisma.absence.findMany({
      where: {
        medecinId,
        dateDebut: { lt: dateFin },
        dateFin: { gt: dateDebut },
      },
    });
  }

  /** @inheritdoc */
  async findById(id: number): Promise<AbsenceWithMedecin | null> {
    return this.prisma.absence.findUnique({
      where: { id },
      include: { medecin: true },
    });
  }

  /** @inheritdoc */
  async create(data: CreateAbsenceDto): Promise<Absence> {
    return this.prisma.absence.create({ data });
  }

  /** @inheritdoc */
  async update(id: number, data: UpdateAbsenceDto): Promise<Absence> {
    try {
      return await this.prisma.absence.update({ where: { id }, data });
    } catch {
      throw new AppError(
        `Absence #${id} introuvable`,
        404,
        ErrorCode.NOT_FOUND
      );
    }
  }

  /** @inheritdoc */
  async delete(id: number): Promise<Absence> {
    try {
      return await this.prisma.absence.delete({ where: { id } });
    } catch {
      throw new AppError(
        `Absence #${id} introuvable`,
        404,
        ErrorCode.NOT_FOUND
      );
    }
  }
}
