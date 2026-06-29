/**
 * @file rendezvousValidator.ts
 * @description Schémas Zod pour les rendez-vous et créneaux.
 *
 * @module validators
 */

import { z } from 'zod';

/**
 * Schéma de création d'un rendez-vous.
 */
export const createRendezVousSchema = z.object({
  patientNom: z
    .string({ required_error: 'Le nom du patient est obligatoire' })
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(150)
    .trim(),

  patientEmail: z
    .string({ required_error: 'L\'email du patient est obligatoire' })
    .email('Format email invalide')
    .toLowerCase(),

  medecinId: z
    .number({ required_error: 'L\'identifiant du médecin est obligatoire' })
    .int()
    .positive('L\'identifiant du médecin doit être positif'),

  centreId: z
    .number({ required_error: 'L\'identifiant du centre est obligatoire' })
    .int()
    .positive(),

  dateHeure: z
    .string({ required_error: 'La date et heure sont obligatoires' })
    .datetime('Format de date invalide (ISO 8601 attendu)')
    .transform((val) => new Date(val)),

  motifConsult: z.string().max(500).trim().optional(),
});

/**
 * Schéma pour la query string de recherche de créneaux.
 * @example GET /api/medecins/1/creneaux?date=2024-07-15
 */
export const creneauxQuerySchema = z.object({
  date: z
    .string({ required_error: 'La date est obligatoire' })
    .regex(
      /^\d{4}-\d{2}-\d{2}$/,
      'Format de date invalide (YYYY-MM-DD attendu)'
    ),
});

/**
 * Schéma pour les absences de médecin.
 */
export const createAbsenceSchema = z.object({
  medecinId: z.number().int().positive(),
  dateDebut: z.string().datetime().transform((v) => new Date(v)),
  dateFin: z.string().datetime().transform((v) => new Date(v)),
  motif: z.enum(['maladie', 'conges', 'formation', 'autre']).default('autre'),
});

export const updateAbsenceSchema = createAbsenceSchema.partial().omit({ medecinId: true });

export type CreateRendezVousInput = z.infer<typeof createRendezVousSchema>;
export type CreateAbsenceInput = z.infer<typeof createAbsenceSchema>;
