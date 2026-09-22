-- Create user_votes table for authenticated user votes tracking
CREATE TABLE IF NOT EXISTS "user_votes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "voted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create unique constraint on user_votes (one vote per user per listing)
CREATE UNIQUE INDEX IF NOT EXISTS "user_votes_user_id_listing_id_key" ON "user_votes"("user_id", "listing_id");

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "user_votes_user_id_idx" ON "user_votes"("user_id");
CREATE INDEX IF NOT EXISTS "user_votes_listing_id_idx" ON "user_votes"("listing_id");
