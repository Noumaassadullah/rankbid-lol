import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Create test listings with votes if they don't exist
    const listings = [];
    for (let i = 1; i <= 5; i++) {
      const listing = await prisma.listing.upsert({
        where: { url: `https://example${i}.com` },
        update: { dayVotes: i * 10 },
        create: {
          title: `Test Listing ${i}`,
          description: `Description for listing ${i}`,
          url: `https://example${i}.com`,
          handle: `listing${i}`,
          category: 'Other',
          platform: 'website',
          totalVotes: i * 10,
          dayVotes: i * 10,
        },
      });
      listings.push(listing);
    }

    console.log('✓ Created/Updated listings:', listings.length);

    // Create today's snapshot
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const existing = await prisma.dailySnapshot.findUnique({
      where: { date: today },
    });

    if (existing) {
      console.log('  Deleting existing snapshot for today...');
      await prisma.dailySnapshot.delete({ where: { date: today } });
    }

    // Get top listings
    const topListings = await prisma.listing.findMany({
      where: { dayVotes: { gt: 0 } },
      orderBy: { dayVotes: 'desc' },
      take: 10,
      select: {
        id: true,
        title: true,
        url: true,
        dayVotes: true,
      },
    });

    console.log('✓ Found', topListings.length, 'listings with votes');

    const snapshot = await prisma.dailySnapshot.create({
      data: {
        date: today,
        data: topListings.map((listing, idx) => ({
          rank: idx + 1,
          listing: {
            id: listing.id,
            title: listing.title,
            url: listing.url,
          },
          votes: listing.dayVotes,
        })),
        frozen: true,
      },
    });

    console.log('✓ Snapshot created successfully!');
    console.log('  ID:', snapshot.id);
    console.log('  Date:', snapshot.date.toISOString().split('T')[0]);
    console.log('  Items:', snapshot.data.length);
  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
