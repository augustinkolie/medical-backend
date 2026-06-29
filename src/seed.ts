import { PrismaClient, RoleUser } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('⏳ Création des comptes par défaut...');

  // 1. Création du compte Administrateur
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.utilisateur.upsert({
    where: { email: 'admin@medirdv.com' },
    update: {},
    create: {
      email: 'admin@medirdv.com',
      nom: 'Admin',
      prenom: 'System',
      passwordHash: adminPassword,
      role: RoleUser.admin,
    },
  });
  console.log('✔️  Compte Admin créé : admin@medirdv.com / admin123');

  // 2. Création du compte Patient
  const patientPassword = await bcrypt.hash('patient123', 10);
  await prisma.utilisateur.upsert({
    where: { email: 'patient@medirdv.com' },
    update: {},
    create: {
      email: 'patient@medirdv.com',
      nom: 'Patient',
      prenom: 'Test',
      passwordHash: patientPassword,
      role: RoleUser.patient,
    },
  });
  console.log('✔️  Compte Patient créé : patient@medirdv.com / patient123');

  console.log('✅ Base de données initialisée avec succès !');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
