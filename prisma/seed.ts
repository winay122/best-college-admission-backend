import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Database (Phase 6 - Enterprise Master CRM Architecture)...');

  // 1. Admin Setup
  await prisma.user.upsert({
    where: { email: 'admin@bestcollegeadmission.in' },
    update: {},
    create: { email: 'admin@bestcollegeadmission.in', password: 'admin', role: 'ADMIN' },
  });

  // 2. Global CMS Setup
  await prisma.globalSetting.upsert({
    where: { id: 'GLOBAL' },
    update: {},
    create: { id: 'GLOBAL', banners: ['https://via.placeholder.com/1200x400?text=Demo+Hero+Banner'], contactEmail: 'support@bestcollegeadmission.in', contactPhone: '+91 9876543210' },
  });

  // 3. College with Micro-Module Relations
  await prisma.college.create({
    data: {
      name: 'RVS College of Engineering',
      city: 'Coimbatore',
      state: 'Tamil Nadu',
      logoUrl: 'https://via.placeholder.com/150?text=RVS+Logo',
      priorityScore: 90,
      facilities: ['WiFi', 'Library', 'AC Classrooms', 'Gym'],
      hostelAvailable: true,
      
      // 1:1 Rich Information
      info: {
        create: {
          aboutHtml: '<p>Premium Tier-3 College offering sprawling campus facilities and massive IT placement networks.</p>',
          highlightsHtml: '<ul><li>AICTE Approved</li><li>NAAC A+ Accreditation</li><li>No Donation Admissions</li></ul>',
          scholarshipHtml: '<p><strong>Automatic Merits:</strong></p><ul><li>>95%: 100% Tuition Waiver</li><li>>90%: 50% Tuition Waiver</li></ul>'
        }
      },

      // 1:1 High-Level Analytics
      placement: {
        create: {
          highestPackage: 4500000,
          averagePackage: 650000,
          placementPercent: 88.5,
          topRecruiters: ['TCS', 'Infosys', 'Wipro', 'HCL', 'Zifo']
        }
      },

      // 1:Many Course Nodes
      courses: {
        create: [
          { name: 'B.Tech Computer Science', duration: '4 Years', originalFee: 150000, discountedFee: 110000, eligibility: '10+2 with 60% PCM minimum.' },
          { name: 'B.Tech Information Technology', duration: '4 Years', originalFee: 140000, discountedFee: 105000, eligibility: '10+2 with 50% PCM minimum.' },
          { name: 'MBA Marketing', duration: '2 Years', originalFee: 200000, discountedFee: 180000, eligibility: 'Any UG Degree with Minimum 60%' }
        ]
      },

      // 1:Many Official Rankings
      rankings: {
        create: [
          { agency: 'NIRF Engineering', rank: 45, year: 2024 },
          { agency: 'Times Engineering', rank: 112, year: 2023 }
        ]
      },
      
      // 1:Many Media Arrays
      galleries: {
        create: [
          { imageUrl: 'https://via.placeholder.com/600x400?text=Campus+Lawn', caption: 'Front Atrium' },
          { imageUrl: 'https://via.placeholder.com/600x400?text=Library+Main', caption: 'CS Library Wing' }
        ]
      }
    }
  });
  console.log('Massive Aggregator Relational DB Phase 6 Seed completed successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
