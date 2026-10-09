-- Security hardening (2026-10-09).
-- The app talks to the database only from the server (service role / postgres), so the public
-- anon key must not be able to read or write private tables. Listings stay publicly readable.

-- 1. Turn RLS on for every table in public. Tables without a policy are then closed to anon/authenticated.
DO $$
DECLARE t record;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.tablename);
  END LOOP;
END $$;

-- 2. users: the "view all profiles" policy exposed emails and password hashes. Auth is custom
--    (auth.uid() is never set), so none of these policies are used by the app.
DROP POLICY IF EXISTS "Users can view all profiles" ON public.users;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;

-- 3. waitlist: emails were readable by anyone. Inserts go through /api/waitlist.
DROP POLICY IF EXISTS "Anyone can join waitlist" ON public.waitlist;
DROP POLICY IF EXISTS "Public can view waitlist count" ON public.waitlist;

-- 4. Belt and braces: remove direct table privileges from the public roles on private tables.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['users','sessions','votes','user_votes','supporters','premium_listings',
                           'visitor_sessions','visitor_analytics','waitlist','payments','daily_snapshots',
                           'listing_flags','rate_limits']
  LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      EXECUTE format('REVOKE ALL ON public.%I FROM anon, authenticated', t);
    END IF;
  END LOOP;
END $$;

-- 5. Rate limits used by lib/server/rate-limit.ts.
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id BIGSERIAL PRIMARY KEY,
  key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_rate_limits_key_created ON public.rate_limits (key, created_at DESC);
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.rate_limits FROM anon, authenticated;

-- 6. One vote per voter per listing, enforced by the database (closes the check-then-insert race).
DO $$
BEGIN
  CREATE UNIQUE INDEX IF NOT EXISTS uq_votes_listing_voter ON public.votes (listing_id, voter_id);
EXCEPTION WHEN unique_violation THEN
  RAISE NOTICE 'votes has duplicate (listing_id, voter_id) rows; unique index not created';
END $$;

-- 7. Stop storing raw visitor IPs; the app now writes a salted hash. Clear the raw ones already stored.
UPDATE public.visitor_sessions SET ip_address = NULL WHERE ip_address IS NOT NULL AND ip_address !~ '^[0-9a-f]{32}$';
