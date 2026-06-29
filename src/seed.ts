import { PrismaClient, RoleUser } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('⏳ Insertion des données guinéennes...');

  // ─── 1. Comptes utilisateurs ───────────────────────────────────────────────
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

  const patientPassword = await bcrypt.hash('patient123', 10);
  await prisma.utilisateur.upsert({
    where: { email: 'patient@medirdv.com' },
    update: {},
    create: {
      email: 'patient@medirdv.com',
      nom: 'Diallo',
      prenom: 'Mamadou',
      passwordHash: patientPassword,
      role: RoleUser.patient,
    },
  });
  console.log('✔️  Comptes créés');

  // ─── 2. Centres médicaux guinéens ──────────────────────────────────────────
  const centresData = [
    { nom: 'Centre Médical de Labé',          adresse: 'Quartier Tata, Labé, Moyenne-Guinée',                contact: '+224 625 44 55 66' },
    { nom: 'Centre de Santé de Ratoma',       adresse: 'Quartier Bambeto, Commune de Ratoma, Conakry',       contact: '+224 624 55 66 77' },
    { nom: 'Clinique Ambroise Paré Conakry',  adresse: 'Cité Chemin de Fer, Matam, Conakry',                 contact: '+224 620 12 34 56' },
    { nom: 'Clinique Pasteur de Conakry',     adresse: 'Avenue de la République, Kaloum, Conakry',           contact: '+224 628 33 44 55' },
    { nom: 'Hôpital Ignace Deen',             adresse: 'Boulevard du Commerce, Kaloum, Conakry',             contact: '+224 622 00 20 20' },
    { nom: 'Hôpital National Donka',          adresse: 'Quartier Donka, Commune de Dixinn, Conakry',         contact: '+224 622 00 10 10' },
    { nom: 'Hôpital Préfectoral de Kindia',   adresse: 'Centre-ville, Kindia, Guinée',                       contact: '+224 621 00 30 30' },
    { nom: 'Hôpital Régional de Kankan',      adresse: 'Quartier Coronthie, Kankan, Haute-Guinée',           contact: '+224 621 00 40 40' },
  ];

  const centres: Record<string, { id: number }> = {};
  for (const c of centresData) {
    const result = await prisma.centre.upsert({
      where: { id: centresData.indexOf(c) + 1 },
      update: {},
      create: c,
    });
    centres[c.nom] = result;
  }
  console.log('✔️  Centres médicaux créés');

  // ─── 3. Spécialités médicales ──────────────────────────────────────────────
  const specialitesData = [
    { nom: 'Cardiologie',       description: 'Maladies du cœur et des vaisseaux sanguins' },
    { nom: 'Dermatologie',      description: 'Maladies de la peau, des cheveux et des ongles' },
    { nom: 'Endocrinologie',    description: 'Troubles hormonaux et des glandes endocrines' },
    { nom: 'Gynécologie',       description: 'Santé reproductive et des organes génitaux féminins' },
    { nom: 'Infectiologie',     description: 'Maladies infectieuses et parasitaires' },
    { nom: 'Médecine générale', description: 'Soins primaires et médecine de famille' },
    { nom: 'Neurologie',        description: 'Maladies du système nerveux central et périphérique' },
    { nom: 'Ophtalmologie',     description: 'Maladies et chirurgie des yeux' },
    { nom: 'Orthopédie',        description: 'Maladies et traumatismes de l\'appareil locomoteur' },
    { nom: 'Pédiatrie',         description: 'Médecine des enfants et des adolescents' },
  ];

  const specialites: Record<string, { id: number }> = {};
  for (const s of specialitesData) {
    const result = await prisma.specialite.upsert({
      where: { nom: s.nom },
      update: {},
      create: s,
    });
    specialites[s.nom] = result;
  }
  console.log('✔️  Spécialités créées');

  // ─── 4. Médecins guinéens ──────────────────────────────────────────────────
  const medecinsList = [
    { nom: 'Baldé',     prenom: 'Mamadou',   email: 'mbalde@medirdv.com',   tel: '+224 622 11 22 33', centre: 'Centre Médical de Labé',         spe: 'Médecine générale' },
    { nom: 'Barry',     prenom: 'Fatoumata', email: 'fbarry@medirdv.com',   tel: '+224 622 33 44 55', centre: 'Centre de Santé de Ratoma',       spe: 'Pédiatrie'         },
    { nom: 'Camara',    prenom: 'Ibrahima',  email: 'icamara@medirdv.com',  tel: '+224 621 44 55 66', centre: 'Clinique Ambroise Paré Conakry',  spe: 'Cardiologie'       },
    { nom: 'Diallo',    prenom: 'Aissatou',  email: 'adiallo@medirdv.com',  tel: '+224 620 55 66 77', centre: 'Clinique Pasteur de Conakry',     spe: 'Gynécologie'       },
    { nom: 'Kouyaté',   prenom: 'Seydou',    email: 'skouyate@medirdv.com', tel: '+224 628 66 77 88', centre: 'Hôpital Ignace Deen',             spe: 'Neurologie'        },
    { nom: 'Condé',     prenom: 'Mariama',   email: 'mconde@medirdv.com',   tel: '+224 627 77 88 99', centre: 'Hôpital National Donka',          spe: 'Infectiologie'     },
    { nom: 'Sylla',     prenom: 'Oumar',     email: 'osylla@medirdv.com',   tel: '+224 625 88 99 00', centre: 'Hôpital Préfectoral de Kindia',   spe: 'Orthopédie'        },
    { nom: 'Tounkara',  prenom: 'Kadiatou',  email: 'ktounkara@medirdv.com',tel: '+224 624 99 00 11', centre: 'Hôpital Régional de Kankan',      spe: 'Dermatologie'      },
    { nom: 'Soumah',    prenom: 'Thierno',   email: 'tsoumah@medirdv.com',  tel: '+224 623 00 11 22', centre: 'Hôpital National Donka',          spe: 'Ophtalmologie'     },
    { nom: 'Diakité',   prenom: 'Hawa',      email: 'hdiakite@medirdv.com', tel: '+224 622 11 33 44', centre: 'Clinique Ambroise Paré Conakry',  spe: 'Endocrinologie'    },
  ];

  for (const m of medecinsList) {
    await prisma.medecin.upsert({
      where: { email: m.email },
      update: {},
      create: {
        nom: m.nom,
        prenom: m.prenom,
        email: m.email,
        telephone: m.tel,
        centreId: centres[m.centre].id,
        specialiteId: specialites[m.spe].id,
      },
    });
  }
  console.log('✔️  Médecins créés');

  console.log('');
  console.log('✅ Base de données guinéenne initialisée avec succès !');
  console.log('   Admin   : admin@medirdv.com   / admin123');
  console.log('   Patient : patient@medirdv.com / patient123');
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
