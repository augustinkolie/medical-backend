/**
 * @file server.ts
 * @description Point d'entrée du serveur HTTP — démarre l'écoute réseau.
 *
 * Ce fichier est séparé de `app.ts` pour permettre d'importer l'application
 * dans les tests d'intégration sans démarrer de serveur.
 *
 * Gère également l'arrêt gracieux du serveur (SIGTERM/SIGINT)
 * pour les environnements de déploiement (Docker, Render, etc.).
 *
 * @module server
 */

import { createApp } from './app';
import { connectDatabase, disconnectDatabase } from './config/database';
import { env } from './config/env';

/**
 * Démarre le serveur HTTP après connexion à la base de données.
 */
async function startServer(): Promise<void> {
  try {
    // 1. Connexion à PostgreSQL via Prisma
    await connectDatabase();

    // 2. Création de l'application Express
    const app = createApp();

    // 3. Démarrage du serveur HTTP
    const server = app.listen(env.PORT, () => {
      console.log('═'.repeat(60));
      console.log(`🏥 MediRDV API démarrée`);
      console.log(`   Mode       : ${env.NODE_ENV}`);
      console.log(`   Port       : ${env.PORT}`);
      console.log(`   URL locale : http://localhost:${env.PORT}`);
      console.log(`   Health     : http://localhost:${env.PORT}/health`);
      console.log('═'.repeat(60));
    });

    // ── Arrêt gracieux ──────────────────────────────────────────────────────

    /**
     * Gère les signaux d'arrêt du processus.
     * Ferme proprement le serveur HTTP et la connexion Prisma.
     *
     * @param signal - Signal reçu (SIGTERM ou SIGINT)
     */
    const gracefulShutdown = async (signal: string): Promise<void> => {
      console.log(`\n⚠️  Signal ${signal} reçu — arrêt gracieux en cours...`);

      server.close(async () => {
        console.log('🔌 Serveur HTTP fermé');
        await disconnectDatabase();
        console.log('👋 Arrêt complet — Au revoir !');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Impossible de démarrer le serveur :', error);
    process.exit(1);
  }
}

// Lance le serveur
startServer();
