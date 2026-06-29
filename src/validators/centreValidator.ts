/**
 * @file centreValidator.ts
 * @description Schémas Zod de validation pour les centres médicaux.
 *
 * @module validators
 */

import { z } from 'zod';

/**
 * Schéma de création d'un centre médical.
 */
export const createCentreSchema = z.object({
  nom: z
    .string({ required_error: 'Le nom est obligatoire' })
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(150, 'Le nom ne peut pas dépasser 150 caractères')
    .trim(),

  adresse: z
    .string({ required_error: 'L\'adresse est obligatoire' })
    .min(5, 'L\'adresse doit contenir au moins 5 caractères')
    .max(255)
    .trim(),

  contact: z
    .string({ required_error: 'Le contact est obligatoire' })
    .min(6, 'Le contact doit contenir au moins 6 caractères')
    .max(50)
    .trim(),
});

/**
 * Schéma de mise à jour partielle d'un centre (PATCH).
 * Tous les champs sont optionnels.
 */
export const updateCentreSchema = createCentreSchema.partial();

export type CreateCentreInput = z.infer<typeof createCentreSchema>;
export type UpdateCentreInput = z.infer<typeof updateCentreSchema>;
