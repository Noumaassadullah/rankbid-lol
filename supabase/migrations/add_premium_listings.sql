-- Create premium_listings table
CREATE TABLE IF NOT EXISTS premium_listings (
  id TEXT PRIMARY KEY,
  listing_id TEXT NOT NULL UNIQUE REFERENCES listings(id) ON DELETE CASCADE,
  founder_name TEXT NOT NULL,
  founder_email TEXT NOT NULL,
  founder_phone TEXT NOT NULL,
  founder_website TEXT,
  founder_twitter TEXT,
  founder_linkedin TEXT,
  founder_instagram TEXT,
  founder_facebook TEXT,
  founder_tiktok TEXT,
  founder_youtube TEXT,
  founder_github TEXT,
  position INTEGER NOT NULL CHECK (position IN (1, 2, 3)),
  amount_paid NUMERIC NOT NULL,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'approved', 'rejected')),
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_premium_listings_listing_id ON premium_listings(listing_id);
CREATE INDEX IF NOT EXISTS idx_premium_listings_position ON premium_listings(position);
CREATE INDEX IF NOT EXISTS idx_premium_listings_payment_status ON premium_listings(payment_status);
CREATE INDEX IF NOT EXISTS idx_premium_listings_created_at ON premium_listings(created_at DESC);

-- Add columns to listings table for vote tracking
ALTER TABLE listings ADD COLUMN IF NOT EXISTS total_votes INTEGER DEFAULT 0;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS day_votes INTEGER DEFAULT 0;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS platform TEXT DEFAULT 'website';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS click_count INTEGER DEFAULT 0;

-- Create index for vote sorting
CREATE INDEX IF NOT EXISTS idx_listings_total_votes ON listings(total_votes DESC);
CREATE INDEX IF NOT EXISTS idx_listings_day_votes ON listings(day_votes DESC);
