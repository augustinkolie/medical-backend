/**
 * @file AvailabilityService.ts
 * @description Service de calcul des disponibilités des médecins.
 *
 * @module services
 */

import { IAvailabilityService, CreneauOptions } from '../interfaces/services/IAvailabilityService';
import { IAbsenceRepository } from '../interfaces/repositories/IAbsenceRepository';
import { IRendezVousRepository } from '../interfaces/repositories/IRendezVousRepository';
import { Creneau } from '../types';

/**
 * Implémentation du service de disponibilité.
 *
 * Algorithme central de MediRDV :
 * 1. Génère les créneaux théoriques d'une journée
 * 2. Exclut les créneaux durant une absence du médecin
 * 3. Exclut les créneaux déjà réservés (confirmés)
 * 4. Retourne les créneaux libres
 */
export class AvailabilityService implements IAvailabilityService {
  /** Heure de début par défaut (8h) */
  private readonly DEFAULT_HEURE_DEBUT = 8;
  /** Heure de fin par défaut (18h) */
  private readonly DEFAULT_HEURE_FIN = 18;
  /** Durée d'un créneau par défaut (30 minutes) */
  private readonly DEFAULT_DUREE_MINUTES = 30;

  /**
   * @param absenceRepository - Repository d'absences (injecté)
   * @param rendezVousRepository - Repository de RDV (injecté)
   */
  constructor(
    private readonly absenceRepository: IAbsenceRepository,
    private readonly rendezVousRepository: IRendezVousRepository
  ) {}

  /**
   * @inheritdoc
   */
  async getAvailableSlots(
    medecinId: number,
    date: string,
    options?: CreneauOptions
  ): Promise<Creneau[]> {
    const heureDebut = options?.heureDebut ?? this.DEFAULT_HEURE_DEBUT;
    const heureFin = options?.heureFin ?? this.DEFAULT_HEURE_FIN;
    const dureeMinutes = options?.dureeMinutes ?? this.DEFAULT_DUREE_MINUTES;

    const targetDate = new Date(date);

    // ── Étape 1 : Générer tous les créneaux théoriques ──
    const creneauxTheoriques = this.generateTheoreticalSlots(
      targetDate,
      heureDebut,
      heureFin,
      dureeMinutes
    );

    // ── Étape 2 : Récupérer les absences du médecin ce jour ──
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const [absences, rdvConfirmes] = await Promise.all([
      this.absenceRepository.findByMedecinAndPeriod(medecinId, startOfDay, endOfDay),
      this.rendezVousRepository.findConfirmedByMedecinAndDate(medecinId, targetDate),
    ]);

    // ── Étape 3 : Marquer les créneaux indisponibles ──
    const rdvDateTimes = new Set(
      rdvConfirmes.map((rdv) => rdv.dateHeure.getTime())
    );

    return creneauxTheoriques.map((creneau) => {
      const debutDate = new Date(creneau.debut);
      const finDate = new Date(creneau.fin);

      // Le créneau est occupé par un RDV existant
      const occupeParRdv = rdvDateTimes.has(debutDate.getTime());

      // Le créneau est couvert par une absence
      const occupeParAbsence = absences.some(
        (absence) =>
          absence.dateDebut <= debutDate && absence.dateFin >= finDate
      );

      return {
        ...creneau,
        disponible: !occupeParRdv && !occupeParAbsence,
      };
    });
  }

  /**
   * @inheritdoc
   */
  async isSlotAvailable(medecinId: number, dateHeure: Date): Promise<boolean> {
    const dateStr = dateHeure.toISOString().split('T')[0];
    const slots = await this.getAvailableSlots(medecinId, dateStr);

    return slots.some(
      (slot) =>
        new Date(slot.debut).getTime() === dateHeure.getTime() &&
        slot.disponible
    );
  }

  // ─── Méthode privée ────────────────────────────────────────────────────────

  /**
   * Génère la liste de tous les créneaux théoriques d'une journée.
   * Ex: 08h00-08h30, 08h30-09h00, ..., 17h30-18h00
   *
   * @param date - Journée cible
   * @param heureDebut - Heure de début des consultations
   * @param heureFin - Heure de fin des consultations
   * @param dureeMinutes - Durée d'un créneau en minutes
   * @returns Liste des créneaux avec heure de début et fin
   */
  private generateTheoreticalSlots(
    date: Date,
    heureDebut: number,
    heureFin: number,
    dureeMinutes: number
  ): Omit<Creneau, 'disponible'>[] {
    const slots: Omit<Creneau, 'disponible'>[] = [];

    const cursor = new Date(date);
    cursor.setHours(heureDebut, 0, 0, 0);

    const endTime = new Date(date);
    endTime.setHours(heureFin, 0, 0, 0);

    while (cursor < endTime) {
      const debutSlot = new Date(cursor);
      cursor.setMinutes(cursor.getMinutes() + dureeMinutes);
      const finSlot = new Date(cursor);

      // N'ajoute le créneau que si sa fin ne dépasse pas la fin de journée
      if (finSlot <= endTime) {
        slots.push({
          debut: debutSlot.toISOString(),
          fin: finSlot.toISOString(),
        });
      }
    }

    return slots;
  }
}
