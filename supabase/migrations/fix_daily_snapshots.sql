-- The archive was empty because daily_snapshots was never created, so the midnight cron
-- (/api/cron/reset-daily-votes) failed to save each day. Create it, lock it to the server,
-- and rebuild past days from the votes table.

CREATE TABLE IF NOT EXISTS public.daily_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  snapshot_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_daily_snapshots_date ON public.daily_snapshots (date DESC);
ALTER TABLE public.daily_snapshots ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.daily_snapshots FROM anon, authenticated;

-- Backfill: each past UTC day's top 100 by votes cast that day
-- (ties: whoever reached the count most recently, as on the live rankings).
INSERT INTO public.daily_snapshots (date, snapshot_data)
SELECT day,
       jsonb_agg(
         jsonb_build_object(
           'rank', rn,
           'listing', jsonb_build_object('id', listing_id, 'title', title, 'url', location),
           'votes', votes
         ) ORDER BY rn
       )
FROM (
  SELECT d.day, d.listing_id, l.title, l.location, d.votes,
         row_number() OVER (PARTITION BY d.day ORDER BY d.votes DESC, d.last_vote DESC) AS rn
  FROM (
    SELECT (v.voted_at::timestamptz AT TIME ZONE 'UTC')::date AS day,
           v.listing_id::text AS listing_id,
           count(*) AS votes,
           max(v.voted_at::timestamptz) AS last_vote
    FROM public.votes v
    WHERE v.voted_at IS NOT NULL
    GROUP BY 1, 2
  ) d
  JOIN public.listings l ON l.id::text = d.listing_id
  WHERE d.day < (now() AT TIME ZONE 'UTC')::date
) ranked
WHERE rn <= 100
GROUP BY day
ON CONFLICT (date) DO NOTHING;

-- Shows what was rebuilt.
SELECT date, jsonb_array_length(snapshot_data) AS products FROM public.daily_snapshots ORDER BY date DESC;
