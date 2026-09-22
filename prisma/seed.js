const { PrismaClient } = require('@prisma/client');
const bcryptjs = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  try {
    // Check if demo user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: 'demo@rankbid.com' },
    });

    if (existingUser) {
      console.log('Demo user already exists');
      return;
    }

    // Hash the demo password
    const hashedPassword = await bcryptjs.hash('demo123', 10);

    // Create demo user
    const user = await prisma.user.create({
      data: {
        email: 'demo@rankbid.com',
        password: hashedPassword,
        name: 'Demo User',
      },
    });

    console.log('Demo user created:', user.email);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
