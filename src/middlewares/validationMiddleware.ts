/**
 * @file validationMiddleware.ts
 * @description Middleware de validation des données entrantes via Zod.
 *
 * @module middlewares
 */

import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

/**
 * Cibles de validation dans la requête Express.
 */
type ValidationTarget = 'body' | 'params' | 'query';

/**
 * Factory de middleware de validation Zod.
 *
 * Valide les données de la requête (`body`, `params` ou `query`) contre
 * un schéma Zod. En cas d'échec, passe une ZodError au gestionnaire d'erreurs.
 *
 * @param schema - Schéma Zod de validation
 * @param target - Partie de la requête à valider (défaut: 'body')
 * @returns Middleware Express
 *
 * @example
 * import { createCentreSchema } from '../validators/centreValidator';
 *
 * router.post('/centres',
 *   validate(createCentreSchema),
 *   centreController.create
 * );
 *
 * @example
 * // Valider les params d'URL
 * router.get('/centres/:id',
 *   validate(z.object({ id: z.string().regex(/^\d+$/) }), 'params'),
 *   centreController.getById
 * );
 */
export function validate(
  schema: ZodSchema<any, any, any>,
  target: ValidationTarget = 'body'
) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      // Parse et coerce les données (transforme les strings en number si configuré)
      const parsed = schema.parse(req[target]);

      // Remplace les données originales par les données validées/transformées
      req[target] = parsed as typeof req[typeof target];

      next();
    } catch (error) {
      // ZodError sera capturée par le errorHandler global
      next(error);
    }
  };
}

// ─── Schémas communs réutilisables ────────────────────────────────────────────

/**
 * Schéma de validation pour les paramètres d'ID numérique dans les routes.
 * @example `/api/centres/:id` → valide que id est un entier positif
 */
export const idParamSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, 'L\'ID doit être un nombre entier positif')
    .transform(Number),
});
