-- Create visitor_sessions table for tracking online users
CREATE TABLE IF NOT EXISTS visitor_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  session_id text UNIQUE NOT NULL,
  ip_address text,
  user_agent text,
  last_activity timestamp with time zone DEFAULT now(),
  page_url text,
  is_active boolean DEFAULT true
);

-- Create visitor_analytics table for daily stats
CREATE TABLE IF NOT EXISTS visitor_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date DEFAULT CURRENT_DATE,
  total_visitors integer DEFAULT 0,
  unique_visitors integer DEFAULT 0,
  page_views integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(date)
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_session_id ON visitor_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_is_active ON visitor_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_last_activity ON visitor_sessions(last_activity DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_analytics_date ON visitor_analytics(date DESC);

-- Disable RLS (these are public analytics tables, no sensitive data)
ALTER TABLE visitor_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_analytics DISABLE ROW LEVEL SECURITY;
