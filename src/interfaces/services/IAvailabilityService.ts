/**
 * @file IAvailabilityService.ts
 * @description Interface du service de disponibilité des médecins.
 *
 * @module interfaces/services
 */

import { Creneau } from '../../types';

/**
 * Options pour la génération des créneaux théoriques d'une journée.
 */
export interface CreneauOptions {
  /** Heure de début de la journée de consultation (défaut: 8) */
  heureDebut?: number;
  /** Heure de fin de la journée de consultation (défaut: 18) */
  heureFin?: number;
  /** Durée d'un créneau en minutes (défaut: 30) */
  dureeMinutes?: number;
}

/**
 * Contrat du service de calcul de disponibilité.
 */
export interface IAvailabilityService {
  /**
   * Calcule les créneaux disponibles pour un médecin à une date donnée.
   *
   * Algorithme :
   * 1. Génère les créneaux théoriques de la journée (08h-18h, toutes les 30 min)
   * 2. Exclut les créneaux couverts par une absence du médecin
   * 3. Exclut les créneaux déjà réservés (statut = 'confirme')
   * 4. Retourne les créneaux libres
   *
   * @param medecinId - Identifiant du médecin
   * @param date - Date de la journée (ex: "2024-07-15")
   * @param options - Options de configuration des créneaux
   * @returns Liste des créneaux disponibles
   */
  getAvailableSlots(
    medecinId: number,
    date: string,
    options?: CreneauOptions
  ): Promise<Creneau[]>;

  /**
   * Vérifie si un créneau spécifique est disponible pour un médecin.
   * Utilisé avant de confirmer un rendez-vous.
   *
   * @param medecinId - Identifiant du médecin
   * @param dateHeure - Date et heure du créneau à vérifier
   * @returns true si le créneau est libre
   */
  isSlotAvailable(medecinId: number, dateHeure: Date): Promise<boolean>;
}
