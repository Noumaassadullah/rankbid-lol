-- AddColumn user_id to listings table
ALTER TABLE "listings" ADD COLUMN "user_id" TEXT;

-- AddColumn tier to users table
ALTER TABLE "users" ADD COLUMN "tier" TEXT NOT NULL DEFAULT 'free';

-- AddColumn contact fields to users table
ALTER TABLE "users" ADD COLUMN "phone" TEXT;
ALTER TABLE "users" ADD COLUMN "website" TEXT;
ALTER TABLE "users" ADD COLUMN "twitter" TEXT;
ALTER TABLE "users" ADD COLUMN "linkedin" TEXT;
ALTER TABLE "users" ADD COLUMN "instagram" TEXT;
ALTER TABLE "users" ADD COLUMN "facebook" TEXT;
ALTER TABLE "users" ADD COLUMN "tiktok" TEXT;
ALTER TABLE "users" ADD COLUMN "youtube" TEXT;
ALTER TABLE "users" ADD COLUMN "github" TEXT;

-- Create foreign key for user_id
ALTER TABLE "listings" ADD CONSTRAINT "listings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create index on user_id
CREATE INDEX "listings_user_id_idx" ON "listings"("user_id");

-- Create index on tier
CREATE INDEX "users_tier_idx" ON "users"("tier");
