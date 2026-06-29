import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'postgresql://medirdv_user:medirdv_pass@localhost:5432/medirdv',
    },
  },
});

async function main() {
  const centres = await prisma.centre.findMany();
  const specialites = await prisma.specialite.findMany();
  const medecins = await prisma.medecin.findMany();

  console.log('=== CENTRES ===');
  console.log(JSON.stringify(centres, null, 2));
  console.log('=== SPECIALITES ===');
  console.log(JSON.stringify(specialites, null, 2));
  console.log('=== MEDECINS ===');
  console.log(JSON.stringify(medecins, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
