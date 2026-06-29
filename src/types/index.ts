/**
 * @file index.ts
 * @description Types globaux partagés dans tout le backend MediRDV.
 *
 * Ce fichier centralise :
 * - L'extension du type `Request` d'Express avec l'utilisateur JWT
 * - Les types de réponse API standardisés
 * - Les types d'erreur métier
 *
 * @module types
 */

import { Request } from 'express';
import { RoleUser } from '@prisma/client';

// ─── Extension du Request Express ────────────────────────────────────────────

/**
 * Payload décodé du token JWT, injecté dans `req.user` par l'authMiddleware.
 */
export interface JwtPayload {
  /** Identifiant de l'utilisateur en base */
  userId: number;
  /** Email de l'utilisateur */
  email: string;
  /** Rôle de l'utilisateur */
  role: RoleUser;
  /** Date d'expiration du token (timestamp Unix) */
  iat?: number;
  /** Date d'émission du token (timestamp Unix) */
  exp?: number;
}

/**
 * Extension du type Request d'Express pour inclure l'utilisateur authentifié.
 * Disponible dans tous les controllers après passage par authMiddleware.
 */
export interface AuthenticatedRequest extends Request {
  /** Utilisateur authentifié extrait du JWT */
  user: JwtPayload;
}

// ─── Réponses API Standardisées ───────────────────────────────────────────────

/**
 * Structure de réponse API succès standardisée.
 *
 * @template T - Type des données retournées
 * @example
 * const response: ApiSuccessResponse<Centre[]> = {
 *   success: true,
 *   data: centres,
 *   message: 'Centres récupérés avec succès',
 *   meta: { total: 5 }
 * };
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  meta?: PaginationMeta;
}

/**
 * Structure de réponse API erreur standardisée.
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  details?: unknown;
  statusCode: number;
}

/**
 * Union type pour les réponses API.
 * @template T - Type des données en cas de succès
 */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// ─── Pagination ───────────────────────────────────────────────────────────────

/**
 * Métadonnées de pagination incluses dans les réponses listes.
 */
export interface PaginationMeta {
  /** Nombre total d'éléments */
  total: number;
  /** Page courante (1-indexée) */
  page?: number;
  /** Nombre d'éléments par page */
  limit?: number;
  /** Nombre total de pages */
  totalPages?: number;
}

/**
 * Paramètres de pagination extraits de la query string.
 */
export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

// ─── Créneaux ─────────────────────────────────────────────────────────────────

/**
 * Représente un créneau horaire disponible pour un médecin.
 */
export interface Creneau {
  /** Heure de début du créneau (ISO 8601) */
  debut: string;
  /** Heure de fin du créneau (ISO 8601) */
  fin: string;
  /** Si le créneau est disponible */
  disponible: boolean;
}

// ─── Erreurs Métier ───────────────────────────────────────────────────────────

/**
 * Codes d'erreur métier pour des messages cohérents côté client.
 */
export enum ErrorCode {
  // Général
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',

  // Auth
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',

  // Rendez-vous
  SLOT_NOT_AVAILABLE = 'SLOT_NOT_AVAILABLE',
  DOCTOR_ABSENT = 'DOCTOR_ABSENT',
  APPOINTMENT_ALREADY_CANCELLED = 'APPOINTMENT_ALREADY_CANCELLED',

  // Ressources
  DUPLICATE_EMAIL = 'DUPLICATE_EMAIL',
  RESOURCE_IN_USE = 'RESOURCE_IN_USE',
}
