import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

let prisma: PrismaClient;

try {
  if (!globalForPrisma.prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['error'] : ['error'],
    });
    if (process.env.NODE_ENV !== 'production') {
      globalForPrisma.prisma = prisma;
    }
  } else {
    prisma = globalForPrisma.prisma;
  }
} catch (error) {
  console.error('Prisma initialization error:', error);
  // Create a dummy client that won't crash the app
  prisma = new PrismaClient();
}

export { prisma };
