const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixTopListings() {
  try {
    const listings = [
      {
        url: 'https://www.linkedin.com/in/nouman-wordpress-developer/',
        totalPaid: 100000,
        dayPaid: 100000,
      },
      {
        url: 'https://www.linkedin.com/in/itsaftabzafar/',
        totalPaid: 90000,
        dayPaid: 90000,
      },
      {
        url: 'https://www.linkedin.com/company/mindwhiz/posts/',
        totalPaid: 80000,
        dayPaid: 80000,
      },
    ];

    for (const listing of listings) {
      const updated = await prisma.listing.update({
        where: { url: listing.url },
        data: {
          totalPaid: listing.totalPaid,
          dayPaid: listing.dayPaid,
        },
      });
      console.log(`✓ Updated: ${updated.title}`);
    }

    console.log('\n✅ Top rankings updated!');
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixTopListings();
