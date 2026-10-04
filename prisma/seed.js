import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    console.log('--- RESTORING & SEEDING ENTERPRISE ARCHITECTURE ---');
    // 1. Admin Account (Persistent)
    await prisma.user.upsert({
        where: { email: 'admin@bestcollegeadmission.in' },
        update: {},
        create: { email: 'admin@bestcollegeadmission.in', password: 'admin123', role: 'ADMIN' },
    });
    // 2. Global Site Configuration
    const socialLinks = JSON.stringify([
        { platform: 'facebook', label: 'Facebook', url: 'https://facebook.com/bestcollegeadmission' },
        { platform: 'twitter', label: 'Twitter', url: 'https://twitter.com/bestcollegeadmission' },
        { platform: 'instagram', label: 'Instagram', url: 'https://instagram.com/bestcollegeadmission' },
        { platform: 'linkedin', label: 'LinkedIn', url: 'https://linkedin.com/company/bestcollegeadmission' }
    ]);
    await prisma.globalSetting.upsert({
        where: { id: 'GLOBAL' },
        update: {}, // Keep empty so customized production settings are never overwritten during seeding!
        create: {
            id: 'GLOBAL',
            contactEmail: 'support@bestcollegeadmission.in',
            contactPhone: '+91 98765 43210',
            officeHours: 'Mon-Fri: 9AM to 6PM',
            officeAddress: 'RIICO Industrial Area, Sitapura, Jaipur, Rajasthan 302022',
            logoUrl: 'https://via.placeholder.com/200x60?text=BestCollegeAdmission',
            footerAbout: 'Your trusted partner in navigating higher education. Compare top colleges, explore detailed placement data, and apply with absolute confidence.',
            copyrightText: '© 2026 BestCollegeAdmission Platforms. All rights reserved.',
            socialLinks: socialLinks,
            banners: [
                'https://via.placeholder.com/1200x400?text=2026+Admissions+Open'
            ]
        },
    });
    // 3. Universities
    const univ_rtu = await prisma.university.upsert({
        where: { slug: 'rtu-kota' },
        update: {},
        create: { name: 'Rajasthan Technical University', shortName: 'RTU', slug: 'rtu-kota' }
    });
    const univ_jnu = await prisma.university.upsert({
        where: { slug: 'jnu-jaipur' },
        update: {},
        create: { name: 'Jaipur National University', shortName: 'JNU', slug: 'jnu-jaipur' }
    });
    // 4. Degrees Hierarchy
    const deg_btech = await prisma.degree.upsert({
        where: { slug: 'b-tech' },
        update: {},
        create: { name: 'Engineering (B.Tech)', slug: 'b-tech' }
    });
    const deg_mba = await prisma.degree.upsert({
        where: { slug: 'mba' },
        update: {},
        create: { name: 'Management (MBA)', slug: 'mba' }
    });
    const deg_law = await prisma.degree.upsert({
        where: { slug: 'law' },
        update: {},
        create: { name: 'Law (LLB)', slug: 'law' }
    });
    const deg_msc = await prisma.degree.upsert({
        where: { slug: 'msc' },
        update: {},
        create: { name: 'Science (M.Sc)', slug: 'msc' }
    });
    // 5. Specializations
    const spec_cs = await prisma.specialization.upsert({
        where: { slug: 'computer-science' },
        update: {},
        create: { name: 'Computer Science', slug: 'computer-science', degreeId: deg_btech.id }
    });
    const spec_me = await prisma.specialization.upsert({
        where: { slug: 'mechanical' },
        update: {},
        create: { name: 'Mechanical Engineering', slug: 'mechanical', degreeId: deg_btech.id }
    });
    const spec_ce = await prisma.specialization.upsert({
        where: { slug: 'civil' },
        update: {},
        create: { name: 'Civil Engineering', slug: 'civil', degreeId: deg_btech.id }
    });
    const spec_marketing = await prisma.specialization.upsert({
        where: { slug: 'marketing' },
        update: {},
        create: { name: 'Marketing', slug: 'marketing', degreeId: deg_mba.id }
    });
    const spec_hr = await prisma.specialization.upsert({
        where: { slug: 'hr' },
        update: {},
        create: { name: 'Human Resource', slug: 'hr', degreeId: deg_mba.id }
    });
    // 6. Colleges Data Restoration
    const colleges = [
        {
            name: 'RVS College of Engineering',
            slug: 'rvs-college-engineering',
            city: 'Coimbatore',
            state: 'Tamil Nadu',
            logoUrl: 'https://via.placeholder.com/150?text=RVS+Logo',
            priorityScore: 95,
            rating: 4.8,
            ownershipType: 'PRIVATE',
            universityId: univ_rtu.id,
            facilities: ['WiFi', 'Smart Classrooms', 'Auditorium', 'Hostel'],
            hostelAvailable: true,
            data: {
                about: 'Leading technical institute with exceptional placement records in AI and ML.',
                highest: 4500000, avg: 750000, recruiters: ['Microsoft', 'Google', 'Amazon'],
                courses: [
                    { name: 'B.Tech Computer Science', degreeId: deg_btech.id, specializationId: spec_cs.id, originalFee: 150000, discountedFee: 110000 },
                    { name: 'B.Tech Mechanical', degreeId: deg_btech.id, specializationId: spec_me.id, originalFee: 120000, discountedFee: 90000 }
                ]
            }
        },
        {
            name: 'Apex Institute of Management',
            slug: 'apex-institute-management',
            city: 'Jaipur',
            state: 'Rajasthan',
            logoUrl: 'https://via.placeholder.com/150?text=Apex+Logo',
            priorityScore: 88,
            rating: 4.5,
            ownershipType: 'PRIVATE',
            universityId: univ_jnu.id,
            facilities: ['Digital Library', 'Gym', 'Cafeteria'],
            hostelAvailable: true,
            data: {
                about: 'Premium Management studies with global corporate exposure.',
                highest: 2200000, avg: 550000, recruiters: ['Deloitte', 'PwC', 'KPMG'],
                courses: [
                    { name: 'MBA Marketing', degreeId: deg_mba.id, specializationId: spec_marketing.id, originalFee: 250000, discountedFee: 210000 },
                    { name: 'MBA HR Management', degreeId: deg_mba.id, specializationId: spec_hr.id, originalFee: 230000, discountedFee: 195000 }
                ]
            }
        },
        {
            name: 'Jaipur Law College',
            slug: 'jaipur-law-college',
            city: 'Jaipur',
            state: 'Rajasthan',
            logoUrl: 'https://via.placeholder.com/150?text=Law+Logo',
            priorityScore: 80,
            rating: 4.2,
            ownershipType: 'GOVERNMENT_AIDED',
            universityId: univ_jnu.id,
            facilities: ['Moot Court', 'Library'],
            hostelAvailable: false,
            data: {
                about: 'Excel in legal studies with practical moot court experience.',
                highest: 1200000, avg: 400000, recruiters: ['Shardul Amarchand', 'Luthra & Luthra'],
                courses: [
                    { name: 'LLB Honors', degreeId: deg_law.id, specializationId: null, originalFee: 80000, discountedFee: 65000 }
                ]
            }
        }
    ];
    for (const c of colleges) {
        const existing = await prisma.college.findFirst({ where: { name: c.name } });
        if (existing) {
            await prisma.college.update({
                where: { id: existing.id },
                data: {
                    city: c.city,
                    state: c.state,
                    logoUrl: c.logoUrl,
                    priorityScore: c.priorityScore,
                    rating: c.rating,
                    ownershipType: c.ownershipType,
                    universityId: c.universityId,
                    facilities: c.facilities,
                    hostelAvailable: c.hostelAvailable,
                    info: {
                        update: {
                            aboutHtml: `<p>${c.data.about}</p>`,
                            highlightsHtml: '<ul><li>Industry Partners</li><li>Skill Development</li></ul>'
                        }
                    },
                    placement: {
                        update: {
                            highestPackage: c.data.highest,
                            averagePackage: c.data.avg,
                            placementPercent: 90
                            // Recruiters managed separately for complexity
                        }
                    }
                }
            });
        }
        else {
            await prisma.college.create({
                data: {
                    name: c.name,
                    slug: c.slug,
                    city: c.city,
                    state: c.state,
                    logoUrl: c.logoUrl,
                    priorityScore: c.priorityScore,
                    rating: c.rating,
                    ownershipType: c.ownershipType,
                    universityId: c.universityId,
                    facilities: c.facilities,
                    hostelAvailable: c.hostelAvailable,
                    info: {
                        create: {
                            aboutHtml: `<p>${c.data.about}</p>`,
                            highlightsHtml: '<ul><li>Industry Partners</li><li>Skill Development</li></ul>'
                        }
                    },
                    placement: {
                        create: {
                            highestPackage: c.data.highest,
                            averagePackage: c.data.avg,
                            placementPercent: 90,
                            recruiters: {
                                create: c.data.recruiters.map(r => ({ name: r }))
                            }
                        }
                    },
                    courses: {
                        create: c.data.courses.map(course => ({
                            name: course.name,
                            degreeId: course.degreeId,
                            specializationId: course.specializationId,
                            originalFee: course.originalFee,
                            discountedFee: course.discountedFee,
                            duration: '4 Years',
                            eligibility: '10+2 with minimum academic threshold.'
                        }))
                    },
                    galleries: {
                        create: [{ imageUrl: 'https://via.placeholder.com/600x400', caption: 'Main Campus View' }]
                    }
                }
            });
        }
    }
    console.log('--- RESTORATION SEED COMPLETED SUCCESSFULLY ---');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
