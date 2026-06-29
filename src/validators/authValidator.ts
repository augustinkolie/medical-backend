/**
 * @file authValidator.ts
 * @description Schémas Zod pour l'authentification.
 *
 * @module validators
 */

import { z } from 'zod';

/**
 * Schéma de validation pour la connexion.
 */
export const loginSchema = z.object({
  email: z
    .string({ required_error: 'L\'email est obligatoire' })
    .email('Format email invalide')
    .toLowerCase(),

  password: z
    .string({ required_error: 'Le mot de passe est obligatoire' })
    .min(1, 'Le mot de passe ne peut pas être vide'),
});

/**
 * Schéma d'inscription (validation plus stricte du mot de passe).
 */
export const registerSchema = z.object({
  email: z.string().email().toLowerCase(),

  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'
    ),

  nom: z.string().min(1).max(100).trim().optional(),
  prenom: z.string().min(1).max(100).trim().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
