/**
 * @file IAbsenceRepository.ts
 * @description Interface du repository Absence.
 *
 * @module interfaces/repositories
 */

import { Absence, Medecin, MotifAbsence } from '@prisma/client';

/** Absence avec le médecin associé */
export type AbsenceWithMedecin = Absence & { medecin: Medecin };

/**
 * DTO pour la déclaration d'une nouvelle absence.
 */
export interface CreateAbsenceDto {
  medecinId: number;
  dateDebut: Date;
  dateFin: Date;
  motif: MotifAbsence;
}

/**
 * DTO pour la mise à jour d'une absence.
 */
export interface UpdateAbsenceDto {
  dateDebut?: Date;
  dateFin?: Date;
  motif?: MotifAbsence;
}

/**
 * Contrat d'accès aux données pour les absences des médecins.
 */
export interface IAbsenceRepository {
  /**
   * Récupère toutes les absences (pour le tableau de bord admin).
   * @returns Liste de toutes les absences avec médecin associé
   */
  findAll(): Promise<AbsenceWithMedecin[]>;

  /**
   * Récupère les absences d'un médecin sur une plage de dates.
   * Utilisé par l'AvailabilityService pour calculer les créneaux libres.
   *
   * @param medecinId - Identifiant du médecin
   * @param dateDebut - Début de la plage à vérifier
   * @param dateFin - Fin de la plage à vérifier
   * @returns Absences chevauchant la plage donnée
   */
  findByMedecinAndPeriod(
    medecinId: number,
    dateDebut: Date,
    dateFin: Date
  ): Promise<Absence[]>;

  /**
   * Trouve une absence par son identifiant.
   * @param id - Identifiant de l'absence
   * @returns L'absence ou null
   */
  findById(id: number): Promise<AbsenceWithMedecin | null>;

  /**
   * Crée une nouvelle absence pour un médecin.
   * @param data - Données de l'absence
   * @returns L'absence créée
   */
  create(data: CreateAbsenceDto): Promise<Absence>;

  /**
   * Met à jour une absence existante.
   * @param id - Identifiant de l'absence
   * @param data - Données à modifier
   * @returns L'absence mise à jour
   */
  update(id: number, data: UpdateAbsenceDto): Promise<Absence>;

  /**
   * Supprime une absence.
   * @param id - Identifiant de l'absence
   * @returns L'absence supprimée
   */
  delete(id: number): Promise<Absence>;
}
