-- Add payment tracking columns to premium_listings
ALTER TABLE premium_listings ADD COLUMN IF NOT EXISTS payment_amount NUMERIC(10, 2);
ALTER TABLE premium_listings ADD COLUMN IF NOT EXISTS payment_txn_ref TEXT UNIQUE;
ALTER TABLE premium_listings ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'confirmed', 'completed', 'failed'));
ALTER TABLE premium_listings ADD COLUMN IF NOT EXISTS payment_verified_at TIMESTAMP WITH TIME ZONE;

-- Create index for transaction reference lookup
CREATE INDEX IF NOT EXISTS idx_premium_listings_payment_txn_ref ON premium_listings(payment_txn_ref);
