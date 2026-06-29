import { PrismaClient, RoleUser } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('⏳ Insertion des données guinéennes réelles...');

  // ─── 1. Comptes utilisateurs ───────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.utilisateur.upsert({
    where: { email: 'admin@medirdv.com' },
    update: {},
    create: { email: 'admin@medirdv.com', nom: 'Admin', prenom: 'System', passwordHash: adminPassword, role: RoleUser.admin },
  });

  const patientPassword = await bcrypt.hash('patient123', 10);
  await prisma.utilisateur.upsert({
    where: { email: 'patient@medirdv.com' },
    update: {},
    create: { email: 'patient@medirdv.com', nom: 'Diallo', prenom: 'Mamadou', passwordHash: patientPassword, role: RoleUser.patient },
  });
  console.log('✔️  Comptes utilisateurs créés');

  // ─── 2. Centres médicaux (données réelles locales) ─────────────────────────
  const centresData = [
    { id: 1, nom: 'Hôpital National Donka',          adresse: 'Quartier Donka, Commune de Dixinn, Conakry',         contact: '+224 622 00 10 10' },
    { id: 2, nom: 'Hôpital Ignace Deen',             adresse: 'Boulevard du Commerce, Kaloum, Conakry',             contact: '+224 622 00 20 20' },
    { id: 3, nom: 'Clinique Pasteur de Conakry',     adresse: 'Avenue de la République, Kaloum, Conakry',           contact: '+224 628 33 44 55' },
    { id: 4, nom: 'Centre de Santé de Ratoma',       adresse: 'Quartier Bambeto, Commune de Ratoma, Conakry',       contact: '+224 624 55 66 77' },
    { id: 5, nom: 'Hôpital Préfectoral de Kindia',   adresse: 'Centre-ville, Kindia, Guinée',                       contact: '+224 621 00 30 30' },
    { id: 6, nom: 'Centre Médical de Labé',          adresse: 'Quartier Tata, Labé, Moyenne-Guinée',                contact: '+224 625 44 55 66' },
    { id: 7, nom: 'Hôpital Régional de Kankan',      adresse: 'Quartier Coronthie, Kankan, Haute-Guinée',           contact: '+224 621 00 40 40' },
    { id: 8, nom: 'Clinique Ambroise Paré Conakry',  adresse: 'Cité Chemin de Fer, Matam, Conakry',                 contact: '+224 620 12 34 56' },
  ];

  for (const c of centresData) {
    await prisma.centre.upsert({
      where: { id: c.id },
      update: {},
      create: { nom: c.nom, adresse: c.adresse, contact: c.contact },
    });
  }
  console.log('✔️  8 centres médicaux créés');

  // ─── 3. Spécialités (données réelles locales) ──────────────────────────────
  const specialitesData = [
    { id: 1,  nom: 'Médecine générale', description: 'Soins primaires et médecine de famille' },
    { id: 2,  nom: 'Cardiologie',       description: 'Diagnostic et traitement des maladies du cœur et des vaisseaux' },
    { id: 3,  nom: 'Pédiatrie',         description: 'Médecine dédiée aux nourrissons, enfants et adolescents' },
    { id: 4,  nom: 'Dermatologie',      description: 'Traitement des affections cutanées, dermatoses et allergies' },
    { id: 5,  nom: 'Gynécologie',       description: 'Santé de la femme, suivi gynécologique et obstétrical' },
    { id: 6,  nom: 'Neurologie',        description: 'Diagnostic et traitement des maladies du système nerveux' },
    { id: 7,  nom: 'Ophtalmologie',     description: 'Soins et chirurgie des yeux' },
    { id: 8,  nom: 'Orthopédie',        description: "Traitement des affections de l'appareil locomoteur" },
    { id: 9,  nom: 'Infectiologie',     description: 'Diagnostic et traitement des maladies infectieuses (paludisme, typhoïde, etc.)' },
    { id: 10, nom: 'Endocrinologie',    description: 'Maladies hormonales : diabète, thyroïde, etc.' },
  ];

  for (const s of specialitesData) {
    await prisma.specialite.upsert({
      where: { nom: s.nom },
      update: {},
      create: { nom: s.nom, description: s.description },
    });
  }
  console.log('✔️  10 spécialités créées');

  // ─── 4. Médecins (23 médecins réels de la base locale) ────────────────────
  // On récupère les IDs réels des centres et spécialités insérés
  const centres     = await prisma.centre.findMany();
  const specialites = await prisma.specialite.findMany();
  const centreByNom     = Object.fromEntries(centres.map(c     => [c.nom, c.id]));
  const specialiteByNom = Object.fromEntries(specialites.map(s => [s.nom, s.id]));

  const medecinsList = [
    { nom: 'Diallo',     prenom: 'Mamadou',   email: 'dr.mamadou.diallo@donka.gn',       tel: '+224 621 10 11 12', centre: 'Hôpital National Donka',        spe: 'Médecine générale' },
    { nom: 'Kouyaté',   prenom: 'Sékou',     email: 'dr.sekou.kouyate@donka.gn',        tel: '+224 621 10 13 14', centre: 'Hôpital National Donka',        spe: 'Cardiologie'       },
    { nom: 'Bah',        prenom: 'Kadiatou',  email: 'dr.kadiatou.bah@donka.gn',         tel: '+224 621 10 15 16', centre: 'Hôpital National Donka',        spe: 'Gynécologie'       },
    { nom: 'Condé',      prenom: 'Alpha',     email: 'dr.alpha.conde@donka.gn',          tel: '+224 621 10 17 18', centre: 'Hôpital National Donka',        spe: 'Infectiologie'     },
    { nom: 'Touré',      prenom: 'Fatoumata', email: 'dr.fatoumata.toure@igdeen.gn',     tel: '+224 622 20 11 12', centre: 'Hôpital Ignace Deen',           spe: 'Pédiatrie'         },
    { nom: 'Sylla',      prenom: 'Oumar',     email: 'dr.oumar.sylla@igdeen.gn',         tel: '+224 622 20 13 14', centre: 'Hôpital Ignace Deen',           spe: 'Neurologie'        },
    { nom: 'Barry',      prenom: 'Aissatou',  email: 'dr.aissatou.barry@igdeen.gn',      tel: '+224 622 20 15 16', centre: 'Hôpital Ignace Deen',           spe: 'Dermatologie'      },
    { nom: 'Camara',     prenom: 'Aboubacar', email: 'dr.aboubacar.camara@igdeen.gn',    tel: '+224 622 20 17 18', centre: 'Hôpital Ignace Deen',           spe: 'Orthopédie'        },
    { nom: 'Keïta',      prenom: 'Mariama',   email: 'dr.mariama.keita@pasteur.gn',      tel: '+224 628 30 11 12', centre: 'Clinique Pasteur de Conakry',   spe: 'Médecine générale' },
    { nom: 'Soumah',     prenom: 'Thierno',   email: 'dr.thierno.soumah@pasteur.gn',     tel: '+224 628 30 13 14', centre: 'Clinique Pasteur de Conakry',   spe: 'Cardiologie'       },
    { nom: 'Bangoura',   prenom: 'Hawa',      email: 'dr.hawa.bangoura@pasteur.gn',      tel: '+224 628 30 15 16', centre: 'Clinique Pasteur de Conakry',   spe: 'Ophtalmologie'     },
    { nom: 'Traoré',     prenom: 'Lansana',   email: 'dr.lansana.traore@pasteur.gn',     tel: '+224 628 30 17 18', centre: 'Clinique Pasteur de Conakry',   spe: 'Endocrinologie'    },
    { nom: 'Konaté',     prenom: 'Aminata',   email: 'dr.aminata.konate@ratoma.gn',      tel: '+224 624 40 11 12', centre: 'Centre de Santé de Ratoma',     spe: 'Médecine générale' },
    { nom: 'Baldé',      prenom: 'Ibrahima',  email: 'dr.ibrahima.balde@ratoma.gn',      tel: '+224 624 40 13 14', centre: 'Centre de Santé de Ratoma',     spe: 'Pédiatrie'         },
    { nom: 'Sow',        prenom: 'Nènè',      email: 'dr.nene.sow@ratoma.gn',            tel: '+224 624 40 15 16', centre: 'Centre de Santé de Ratoma',     spe: 'Gynécologie'       },
    { nom: 'Guilavogui', prenom: 'Fodé',      email: 'dr.fode.guilavogui@kindia.gn',     tel: '+224 621 50 11 12', centre: 'Hôpital Préfectoral de Kindia', spe: 'Médecine générale' },
    { nom: 'Millimono',  prenom: 'Safiatou',  email: 'dr.safiatou.millimono@kindia.gn',  tel: '+224 621 50 13 14', centre: 'Hôpital Préfectoral de Kindia', spe: 'Infectiologie'     },
    { nom: 'Diallo',     prenom: 'Boubacar',  email: 'dr.boubacar.diallo@labe.gn',       tel: '+224 625 60 11 12', centre: 'Centre Médical de Labé',        spe: 'Médecine générale' },
    { nom: 'Bah',        prenom: 'Aminata',   email: 'dr.aminata.bah@labe.gn',           tel: '+224 625 60 13 14', centre: 'Centre Médical de Labé',        spe: 'Pédiatrie'         },
    { nom: 'Camara',     prenom: 'Elhadj',    email: 'dr.elhadj.camara@kankan.gn',       tel: '+224 623 70 11 12', centre: 'Hôpital Régional de Kankan',    spe: 'Cardiologie'       },
    { nom: 'Kouyaté',   prenom: 'Hadja',     email: 'dr.hadja.kouyate@kankan.gn',       tel: '+224 623 70 13 14', centre: 'Hôpital Régional de Kankan',    spe: 'Infectiologie'     },
    { nom: 'Touré',      prenom: 'Mory',      email: 'dr.mory.toure@ambpare.gn',         tel: '+224 620 80 11 12', centre: 'Clinique Ambroise Paré Conakry',spe: 'Dermatologie'      },
    { nom: 'Diallo',     prenom: 'Binta',     email: 'dr.binta.diallo@ambpare.gn',       tel: '+224 620 80 13 14', centre: 'Clinique Ambroise Paré Conakry',spe: 'Neurologie'        },
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
        centreId: centreByNom[m.centre],
        specialiteId: specialiteByNom[m.spe],
      },
    });
  }
  console.log('✔️  23 médecins créés');

  console.log('');
  console.log('✅ Base de données guinéenne synchronisée avec succès !');
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
