-- Create daily_snapshots table to store historical rankings
CREATE TABLE IF NOT EXISTS daily_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  snapshot_data jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create index for date-based queries
CREATE INDEX IF NOT EXISTS idx_daily_snapshots_date ON daily_snapshots(date DESC);
