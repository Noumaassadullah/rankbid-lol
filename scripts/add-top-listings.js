const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addTopListings() {
  try {
    const listings = [
      {
        url: 'https://www.linkedin.com/in/nouman-wordpress-developer/',
        title: 'Nouman - WordPress Developer',
        description: 'Expert WordPress developer with years of experience',
        category: 'Technology',
        platform: 'linkedin',
        totalPaid: 100000,
        dayPaid: 100000,
      },
      {
        url: 'https://www.linkedin.com/in/itsaftabzafar/',
        title: 'Aftab Zafar',
        description: 'Professional profile on LinkedIn',
        category: 'Technology',
        platform: 'linkedin',
        totalPaid: 90000,
        dayPaid: 90000,
      },
      {
        url: 'https://www.linkedin.com/company/mindwhiz/posts/',
        title: 'MindWhiz',
        description: 'MindWhiz Company - Innovative Solutions',
        category: 'Business',
        platform: 'linkedin',
        totalPaid: 80000,
        dayPaid: 80000,
      },
    ];

    for (const listing of listings) {
      const existing = await prisma.listing.findUnique({
        where: { url: listing.url },
      });

      if (!existing) {
        const created = await prisma.listing.create({
          data: listing,
        });
        console.log(`✓ Created: ${created.title}`);
      } else {
        console.log(`✓ Already exists: ${existing.title}`);
      }
    }

    console.log('\n✅ Top 3 LinkedIn listings added!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

addTopListings();
