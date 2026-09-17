-- Add bidType column to payments table
ALTER TABLE "payments" ADD COLUMN "bidType" TEXT NOT NULL DEFAULT 'alltime';

-- Add index for bidType
CREATE INDEX "payments_bidType_idx" ON "payments"("bidType");
