/**
 * @file RendezVousRepository.ts
 * @description Implémentation Prisma du repository RendezVous.
 *
 * @module repositories
 */

import { PrismaClient, RendezVous, StatutRdv } from '@prisma/client';
import {
  IRendezVousRepository,
  RendezVousWithRelations,
  CreateRendezVousDto,
  RendezVousFilters,
} from '../interfaces/repositories/IRendezVousRepository';
import { AppError } from '../middlewares/errorMiddleware';
import { ErrorCode } from '../types';

/** Inclusion des relations pour les requêtes RendezVous */
const INCLUDE_RELATIONS = {
  medecin: {
    include: {
      specialite: true,
    },
  },
  centre: true,
} as const;

/**
 * Implémentation concrète du repository RendezVous via Prisma.
 */
export class RendezVousRepository implements IRendezVousRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /** @inheritdoc */
  async findAll(filters?: RendezVousFilters): Promise<RendezVousWithRelations[]> {
    return this.prisma.rendezVous.findMany({
      where: {
        medecinId: filters?.medecinId,
        centreId: filters?.centreId,
        patientEmail: filters?.patientEmail,
        statut: filters?.statut,
        utilisateurId: filters?.utilisateurId,
        // Filtre par plage de dates si fourni
        ...(filters?.dateDebut || filters?.dateFin
          ? {
              dateHeure: {
                ...(filters.dateDebut ? { gte: filters.dateDebut } : {}),
                ...(filters.dateFin ? { lte: filters.dateFin } : {}),
              },
            }
          : {}),
      },
      include: INCLUDE_RELATIONS,
      orderBy: { dateHeure: 'desc' },
    });
  }

  /** @inheritdoc */
  async findConfirmedByMedecinAndDate(
    medecinId: number,
    date: Date
  ): Promise<RendezVous[]> {
    // Calcule le début et la fin de la journée (minuit à 23:59:59)
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.prisma.rendezVous.findMany({
      where: {
        medecinId,
        statut: StatutRdv.confirme,
        dateHeure: { gte: startOfDay, lte: endOfDay },
      },
      orderBy: { dateHeure: 'asc' },
    });
  }

  /** @inheritdoc */
  async findById(id: number): Promise<RendezVousWithRelations | null> {
    return this.prisma.rendezVous.findUnique({
      where: { id },
      include: INCLUDE_RELATIONS,
    });
  }

  /** @inheritdoc */
  async create(data: CreateRendezVousDto): Promise<RendezVousWithRelations> {
    return this.prisma.rendezVous.create({
      data,
      include: INCLUDE_RELATIONS,
    });
  }

  /** @inheritdoc */
  async cancel(id: number): Promise<RendezVous> {
    try {
      return await this.prisma.rendezVous.update({
        where: { id },
        data: { statut: StatutRdv.annule },
      });
    } catch {
      throw new AppError(
        `Rendez-vous #${id} introuvable`,
        404,
        ErrorCode.NOT_FOUND
      );
    }
  }

  /** @inheritdoc */
  async confirm(id: number): Promise<RendezVous> {
    try {
      return await this.prisma.rendezVous.update({
        where: { id },
        data: { statut: StatutRdv.confirme },
      });
    } catch {
      throw new AppError(
        `Rendez-vous #${id} introuvable`,
        404,
        ErrorCode.NOT_FOUND
      );
    }
  }
}
