import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

const DROP_TABLES_SQL = `
  DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;
  DROP TABLE IF EXISTS "daily_snapshots" CASCADE;
  DROP TABLE IF EXISTS "daily_ranks" CASCADE;
  DROP TABLE IF EXISTS "payments" CASCADE;
  DROP TABLE IF EXISTS "listings" CASCADE;
  DROP TYPE IF EXISTS "Category" CASCADE;
`;

const CREATE_TABLES_SQL = `
-- CreateEnum
CREATE TYPE "Category" AS ENUM (
  'All', 'Leaderboards', 'AI', 'Marketing', 'Productivity', 'Agents', 'Crypto',
  'Design', 'Developer', 'Explore', 'Technology', 'ECommerce', 'DigitalMarketing',
  'Food', 'Fashion', 'Other'
);

-- CreateTable listings
CREATE TABLE "listings" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "url" TEXT NOT NULL,
  "handle" TEXT,
  "category" "Category" NOT NULL DEFAULT 'Other',
  "platform" TEXT NOT NULL DEFAULT 'website',
  "totalPaid" INTEGER NOT NULL DEFAULT 0,
  "dayPaid" INTEGER NOT NULL DEFAULT 0,
  "clickCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lastRaisedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable payments
CREATE TABLE "payments" (
  "id" TEXT NOT NULL,
  "listingId" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "provider" TEXT NOT NULL DEFAULT 'jazzcash',
  "status" TEXT NOT NULL DEFAULT 'pending',
  "transactionId" TEXT,
  "stripeSessionId" TEXT,
  "stripePaymentId" TEXT,
  "metadata" JSONB,
  "paidAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable daily_ranks
CREATE TABLE "daily_ranks" (
  "id" TEXT NOT NULL,
  "listingId" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "amount" INTEGER NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "daily_ranks_pkey" PRIMARY KEY ("id")
);

-- CreateTable daily_snapshots
CREATE TABLE "daily_snapshots" (
  "id" TEXT NOT NULL,
  "date" TIMESTAMP(3) NOT NULL,
  "data" JSONB NOT NULL,
  "frozen" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "daily_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "listings_url_key" ON "listings"("url");
CREATE INDEX "listings_category_idx" ON "listings"("category");
CREATE INDEX "listings_totalPaid_idx" ON "listings"("totalPaid");
CREATE INDEX "listings_dayPaid_idx" ON "listings"("dayPaid");
CREATE INDEX "listings_createdAt_idx" ON "listings"("createdAt");

-- CreateIndex payments
CREATE UNIQUE INDEX "payments_transactionId_key" ON "payments"("transactionId");
CREATE UNIQUE INDEX "payments_stripeSessionId_key" ON "payments"("stripeSessionId");
CREATE UNIQUE INDEX "payments_stripePaymentId_key" ON "payments"("stripePaymentId");
CREATE INDEX "payments_listingId_idx" ON "payments"("listingId");
CREATE INDEX "payments_status_idx" ON "payments"("status");
CREATE INDEX "payments_transactionId_idx" ON "payments"("transactionId");
CREATE INDEX "payments_provider_idx" ON "payments"("provider");

-- CreateIndex daily_ranks
CREATE UNIQUE INDEX "daily_ranks_listingId_date_key" ON "daily_ranks"("listingId", "date");
CREATE INDEX "daily_ranks_date_idx" ON "daily_ranks"("date");

-- CreateIndex daily_snapshots
CREATE UNIQUE INDEX "daily_snapshots_date_key" ON "daily_snapshots"("date");
CREATE INDEX "daily_snapshots_date_idx" ON "daily_snapshots"("date");

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_listingId_fkey"
  FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_ranks" ADD CONSTRAINT "daily_ranks_listingId_fkey"
  FOREIGN KEY ("listingId") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
`;

async function executeSql(sql: string, supabaseKey: string, supabaseUrl: string) {
  const response = await fetch(`${supabaseUrl}/rest/v1/`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'SQL execution failed');
  }
  return data;
}

export async function POST(req: NextRequest) {
  try {
    const adminKey = req.headers.get('x-admin-key');
    if (adminKey !== process.env.ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Drop existing tables
    try {
      await prisma.$executeRawUnsafe(DROP_TABLES_SQL);
      console.log('Dropped existing tables');
    } catch (err) {
      console.log('Drop failed (might not exist):', err);
    }

    // Create new tables
    try {
      await prisma.$executeRawUnsafe(CREATE_TABLES_SQL);
      console.log('Created new tables');
    } catch (err: any) {
      throw new Error(`Failed to create tables: ${err.message}`);
    }

    // Create the linkedin profiles
    const linkedinProfiles = [
      {
        id: 'nouman-linked-in',
        title: 'Nouman - WordPress Developer',
        description: 'LinkedIn Profile - Nouman',
        url: 'https://www.linkedin.com/in/nouman-wordpress-developer/',
        category: 'Technology',
        platform: 'linkedin',
        totalPaid: 100000,
        dayPaid: 100000,
      },
      {
        id: 'aftab-linked-in',
        title: 'Aftab Zafar - Software Engineer',
        description: 'LinkedIn Profile - Aftab Zafar',
        url: 'https://www.linkedin.com/in/itsaftabzafar/',
        category: 'Technology',
        platform: 'linkedin',
        totalPaid: 90000,
        dayPaid: 90000,
      },
      {
        id: 'mindwhiz-linked-in',
        title: 'MindWhiz - Tech Company',
        description: 'LinkedIn Company - MindWhiz',
        url: 'https://www.linkedin.com/company/mindwhiz/posts/',
        category: 'Technology',
        platform: 'linkedin',
        totalPaid: 80000,
        dayPaid: 80000,
      },
    ];

    const results = [];
    for (const profile of linkedinProfiles) {
      try {
        // Use raw SQL to insert since Prisma client might have issues
        const now = new Date().toISOString();
        await prisma.$executeRawUnsafe(
          `INSERT INTO "listings" (id, title, description, url, category, platform, "totalPaid", "dayPaid", "clickCount", "createdAt", "lastRaisedAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
          profile.id,
          profile.title,
          profile.description,
          profile.url,
          profile.category,
          profile.platform,
          profile.totalPaid,
          profile.dayPaid,
          0,
          now,
          now,
          now
        );
        results.push({ url: profile.url, status: 'created' });
      } catch (err: any) {
        results.push({ url: profile.url, status: 'error', error: err.message });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Database schema fixed and profiles created',
      results,
    });
  } catch (error: any) {
    console.error('Schema fix error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fix schema' },
      { status: 500 }
    );
  }
}
