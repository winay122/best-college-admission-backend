import prisma from './src/config/db.js';

async function test() {
  try {
    const unis = await prisma.university.findMany();
    console.log('✅ University model accessible:', unis.length);
    const accs = await prisma.accreditation.findMany();
    console.log('✅ Accreditation model accessible:', accs.length);
    process.exit(0);
  } catch (err: any) {
    console.error('❌ Prisma Access Error:', err.message);
    process.exit(1);
  }
}

test();
