-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
  id TEXT PRIMARY KEY,
  listing_id TEXT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  voter_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),

  UNIQUE(listing_id, voter_id)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_votes_listing_id ON votes(listing_id);
CREATE INDEX IF NOT EXISTS idx_votes_voter_id ON votes(voter_id);
CREATE INDEX IF NOT EXISTS idx_votes_created_at ON votes(created_at);

-- Drop old payment-related tables (backup first if needed)
-- These are commented out as a safety measure - uncomment if you've backed up the data
-- DROP TABLE IF EXISTS daily_ranks;
-- DROP TABLE IF EXISTS payments;
