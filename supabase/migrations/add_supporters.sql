-- Supporters: people who vote through a shared /support/<listing id> link without an account.
-- Each supporter's vote is also stored in `votes` (voter_id = 'email:<email>') so it counts
-- toward rankings; this table keeps who they are and how they support the maker.
-- Run once in the Supabase SQL editor.

CREATE TABLE IF NOT EXISTS supporters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id text NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  support_type text NOT NULL CHECK (support_type IN ('founder', 'friend', 'supporter')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (listing_id, email)
);

CREATE INDEX IF NOT EXISTS idx_supporters_listing ON supporters (listing_id, created_at DESC);

-- Only the server (service role) reads/writes this table; emails are never exposed publicly.
ALTER TABLE supporters ENABLE ROW LEVEL SECURITY;
