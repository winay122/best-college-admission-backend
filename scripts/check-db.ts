import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const colleges = await prisma.college.findMany({
    select: { id: true, name: true, logoUrl: true, galleries: { select: { imageUrl: true } } },
    take: 5
  });
  console.log('--- Colleges ---');
  console.log(JSON.stringify(colleges, null, 2));

  const settings = await prisma.globalSetting.findFirst();
  console.log('--- Global Settings ---');
  console.log(JSON.stringify(settings, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
