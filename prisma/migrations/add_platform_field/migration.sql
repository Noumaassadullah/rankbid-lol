-- AlterEnum
ALTER TYPE "Category" ADD VALUE 'Technology';
ALTER TYPE "Category" ADD VALUE 'ECommerce';
ALTER TYPE "Category" ADD VALUE 'DigitalMarketing';
ALTER TYPE "Category" ADD VALUE 'Food';
ALTER TYPE "Category" ADD VALUE 'Fashion';

-- AlterTable
ALTER TABLE "listings" ADD COLUMN "platform" TEXT NOT NULL DEFAULT 'website';
