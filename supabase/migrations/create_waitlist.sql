-- Create waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
  id BIGSERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notified BOOLEAN DEFAULT FALSE,
  notifiedAt TIMESTAMP,

  CONSTRAINT email_format CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email);

-- Create index on createdAt for sorting
CREATE INDEX IF NOT EXISTS idx_waitlist_created_at ON waitlist(createdAt DESC);

-- Enable RLS
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can insert to waitlist
CREATE POLICY "Anyone can join waitlist" ON waitlist
  FOR INSERT
  WITH CHECK (true);

-- Policy: Public can view count (read-only count query)
CREATE POLICY "Public can view waitlist count" ON waitlist
  FOR SELECT
  USING (false);  -- Restrict direct selects, use API instead

-- Policy: Admin/service role can read all
ALTER POLICY "Public can view waitlist count" ON waitlist USING (true);
