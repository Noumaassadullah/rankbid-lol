-- Premium spots #1-#3 become a bidding ladder.
--
-- * A spot starts at its base price ($5 / $3 / $1). Once held, the next buyer must pay at least
--   the holder's bid + $1.
-- * Taking a held spot pushes its holder down one spot, and so on until an empty spot is reached.
--   Whoever is pushed past #3 is marked 'outbid'.
-- * Each purchase lasts 30 days from activation; being pushed down does not change that date.
--
-- Run this once in the Supabase SQL editor.

-- Create the table if add_premium_listings.sql was never run.
CREATE TABLE IF NOT EXISTS premium_listings (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  listing_id TEXT NOT NULL,
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
  amount_paid NUMERIC,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  approved_at TIMESTAMP WITH TIME ZONE,
  approved_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Link to listings, matching whatever type listings.id has (the admin page joins through this).
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
     WHERE conrelid = 'premium_listings'::regclass AND contype = 'f'
  ) THEN
    IF (SELECT data_type FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = 'listings' AND column_name = 'id') = 'uuid' THEN
      ALTER TABLE premium_listings ALTER COLUMN listing_id TYPE UUID USING listing_id::uuid;
    END IF;
    ALTER TABLE premium_listings
      ADD CONSTRAINT premium_listings_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Founder emails/phones live here: only the server (service role, which bypasses RLS) may read it.
ALTER TABLE premium_listings ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_premium_listings_listing_id ON premium_listings(listing_id);
CREATE INDEX IF NOT EXISTS idx_premium_listings_payment_status ON premium_listings(payment_status);

-- From add_payment_tracking.sql, in case that migration was never run.
ALTER TABLE premium_listings ADD COLUMN IF NOT EXISTS payment_amount NUMERIC(10, 2);
ALTER TABLE premium_listings ADD COLUMN IF NOT EXISTS payment_txn_ref TEXT;
ALTER TABLE premium_listings ADD COLUMN IF NOT EXISTS payment_verified_at TIMESTAMP WITH TIME ZONE;

-- Rows are created by the API without an id.
ALTER TABLE premium_listings ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

-- A product can buy again (renew, outbid, move up), so listing_id is no longer unique.
ALTER TABLE premium_listings DROP CONSTRAINT IF EXISTS premium_listings_listing_id_key;

-- The original CHECK only allowed pending/approved/rejected, which rejected every gateway update.
ALTER TABLE premium_listings DROP CONSTRAINT IF EXISTS premium_listings_payment_status_check;
UPDATE premium_listings SET payment_status = 'active' WHERE payment_status IN ('approved', 'confirmed', 'completed');
ALTER TABLE premium_listings ADD CONSTRAINT premium_listings_payment_status_check CHECK (payment_status IN (
  'pending',      -- waiting for payment or admin verification
  'active',       -- holds a spot (until expires_at)
  'outbid',       -- pushed off #3 by a higher bid
  'replaced',     -- the same product bought a new spot
  'needs_refund', -- paid, but someone else took the spot first with a higher bid
  'rejected',     -- admin rejected the manual payment
  'failed'        -- gateway reported a failed payment
));

ALTER TABLE premium_listings ADD COLUMN IF NOT EXISTS bid_usd NUMERIC(10, 2);
ALTER TABLE premium_listings ADD COLUMN IF NOT EXISTS amount_pkr INTEGER;
ALTER TABLE premium_listings ADD COLUMN IF NOT EXISTS activated_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE premium_listings ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE premium_listings ALTER COLUMN amount_paid DROP NOT NULL;

UPDATE premium_listings SET bid_usd = COALESCE(payment_amount, amount_paid) WHERE bid_usd IS NULL;
UPDATE premium_listings
   SET activated_at = COALESCE(approved_at, payment_verified_at, created_at),
       expires_at = COALESCE(approved_at, payment_verified_at, created_at) + INTERVAL '30 days'
 WHERE payment_status = 'active' AND expires_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_premium_listings_active ON premium_listings(position, expires_at) WHERE payment_status = 'active';

-- Puts a paid bid on the ladder. Called after the gateway confirms payment or an admin approves it.
-- Serialised with an advisory lock, so two payments landing together cannot share a spot.
-- Returns {"status": ..., "position": ...}.
CREATE OR REPLACE FUNCTION activate_premium_bid(p_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  bid premium_listings%ROWTYPE;
  holder premium_listings%ROWTYPE;
  required NUMERIC;
  base NUMERIC[] := ARRAY[5, 3, 1];
  carry TEXT;
  displaced TEXT;
  i INTEGER;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext('premium_ladder'));

  SELECT * INTO bid FROM premium_listings WHERE id = p_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('status', 'not_found');
  END IF;
  IF bid.payment_status <> 'pending' THEN
    -- Already handled (webhooks can be delivered more than once).
    RETURN jsonb_build_object('status', bid.payment_status, 'position', bid.position);
  END IF;

  -- A product holds at most one spot: buying again gives up its current one.
  UPDATE premium_listings SET payment_status = 'replaced', updated_at = now()
   WHERE listing_id = bid.listing_id AND payment_status = 'active' AND id <> bid.id;

  SELECT * INTO holder FROM premium_listings
   WHERE payment_status = 'active' AND expires_at > now() AND position = bid.position;
  required := CASE WHEN FOUND THEN holder.bid_usd + 1 ELSE base[bid.position] END;

  IF COALESCE(bid.bid_usd, 0) < required THEN
    UPDATE premium_listings SET payment_status = 'needs_refund', updated_at = now() WHERE id = bid.id;
    RETURN jsonb_build_object('status', 'needs_refund', 'position', bid.position, 'required', required);
  END IF;

  -- Walk down from the bought spot, moving each holder one spot lower until an empty spot.
  carry := bid.id;
  FOR i IN bid.position..3 LOOP
    SELECT id INTO displaced FROM premium_listings
     WHERE payment_status = 'active' AND expires_at > now() AND position = i AND id <> carry;
    UPDATE premium_listings SET position = i, updated_at = now() WHERE id = carry;
    IF displaced IS NULL THEN
      carry := NULL;
      EXIT;
    END IF;
    carry := displaced;
    displaced := NULL;
  END LOOP;

  IF carry IS NOT NULL THEN
    UPDATE premium_listings SET payment_status = 'outbid', updated_at = now() WHERE id = carry;
  END IF;

  UPDATE premium_listings
     SET payment_status = 'active', activated_at = now(), expires_at = now() + INTERVAL '30 days', updated_at = now()
   WHERE id = bid.id;

  RETURN jsonb_build_object('status', 'active', 'position', bid.position);
END;
$$;

REVOKE ALL ON FUNCTION activate_premium_bid(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION activate_premium_bid(TEXT) TO service_role;
