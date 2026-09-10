-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  email text UNIQUE NOT NULL,
  username text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  phone text,
  city text,
  country text DEFAULT 'Pakistan',
  bio text,
  rating numeric DEFAULT 0,
  is_verified boolean DEFAULT false,
  listings_count integer DEFAULT 0
);

-- Create listings table
CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  price numeric NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'sold', 'expired')),
  image_url text,
  location text NOT NULL,
  views integer DEFAULT 0,
  is_featured boolean DEFAULT false
);

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
  UNIQUE(date)
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  transaction_id text UNIQUE NOT NULL,
  reference text NOT NULL,
  amount numeric NOT NULL,
  currency text DEFAULT 'PKR',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method text NOT NULL CHECK (payment_method IN ('rapid-gateway', 'jazzcash', 'easypaisa', 'stripe')),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  listing_id uuid REFERENCES listings(id) ON DELETE SET NULL,
  metadata jsonb,
  error_message text
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_listings_user_id ON listings(user_id);
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_payments_transaction_id ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_reference ON payments(reference);
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_session_id ON visitor_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_is_active ON visitor_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_last_activity ON visitor_sessions(last_activity DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_analytics_date ON visitor_analytics(date DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Anyone can view active listings" ON listings;
DROP POLICY IF EXISTS "Users can view their own listings" ON listings;
DROP POLICY IF EXISTS "Users can create listings" ON listings;
DROP POLICY IF EXISTS "Users can update their own listings" ON listings;
DROP POLICY IF EXISTS "Users can delete their own listings" ON listings;
DROP POLICY IF EXISTS "Service can insert payments" ON payments;
DROP POLICY IF EXISTS "Users can view their own payments" ON payments;

-- RLS Policies for users table
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for listings table
CREATE POLICY "Anyone can view active listings" ON listings FOR SELECT USING (status = 'active');
CREATE POLICY "Users can view their own listings" ON listings FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create listings" ON listings FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own listings" ON listings FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own listings" ON listings FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for payments table
-- Service role can insert/update payments (via webhook)
CREATE POLICY "Service can insert payments" ON payments FOR INSERT WITH CHECK (true);
-- Users can view their own payments
CREATE POLICY "Users can view their own payments" ON payments FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);
