import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w-]+/g, '')    // Remove all non-word chars
    .replace(/--+/g, '-')       // Replace multiple - with single -
    .replace(/^-+/, '')         // Trim - from start of text
    .replace(/-+$/, '');        // Trim - from end of text
}

async function main() {
  console.log('--- SCANNING FOR SLUGLESS NODES in COLLEGE_INDEX ---');
  
  const colleges = await prisma.college.findMany();
  
  for (const college of colleges) {
    if (!college.slug) {
      const slug = generateSlug(college.name);
      console.log(`Generating slug for [${college.name}] -> ${slug}`);
      
      try {
        await prisma.college.update({
          where: { id: college.id },
          data: { slug }
        });
      } catch (err) {
        // In case of duplicate slug (e.g. same college name), add a suffix
        const uniqueSlug = `${slug}-${college.id.slice(0, 4)}`;
        console.warn(`Unique overlap detected for ${slug}. Falling back to ${uniqueSlug}`);
        await prisma.college.update({
          where: { id: college.id },
          data: { slug: uniqueSlug }
        });
      }
    }
  }
  
  console.log('--- ENTIRE INDEX SYNCHRONIZED SUCCESSFULLY ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
