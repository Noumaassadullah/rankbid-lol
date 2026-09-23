-- Add platform column to listings table if it doesn't exist
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS platform text DEFAULT 'website';

-- Add voting columns if they don't exist
ALTER TABLE listings
ADD COLUMN IF NOT EXISTS total_votes integer DEFAULT 0;

ALTER TABLE listings
ADD COLUMN IF NOT EXISTS day_votes integer DEFAULT 0;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_listings_platform ON listings(platform);
CREATE INDEX IF NOT EXISTS idx_listings_total_votes ON listings(total_votes DESC);
CREATE INDEX IF NOT EXISTS idx_listings_day_votes ON listings(day_votes DESC);
