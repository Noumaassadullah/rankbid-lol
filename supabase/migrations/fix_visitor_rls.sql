-- Allow public access to visitor_sessions and visitor_analytics for tracking
-- Disable RLS for these tables since they're only for analytics

ALTER TABLE visitor_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_analytics DISABLE ROW LEVEL SECURITY;

-- Or if you want to keep RLS enabled, add these policies:
-- DROP POLICY IF EXISTS "Anyone can insert visitor sessions" ON visitor_sessions;
-- CREATE POLICY "Anyone can insert visitor sessions" ON visitor_sessions
--   FOR INSERT
--   WITH CHECK (true);

-- DROP POLICY IF EXISTS "Anyone can update visitor sessions" ON visitor_sessions;
-- CREATE POLICY "Anyone can update visitor sessions" ON visitor_sessions
--   FOR UPDATE
--   USING (true);

-- DROP POLICY IF EXISTS "Anyone can insert analytics" ON visitor_analytics;
-- CREATE POLICY "Anyone can insert analytics" ON visitor_analytics
--   FOR INSERT
--   WITH CHECK (true);

-- DROP POLICY IF EXISTS "Anyone can update analytics" ON visitor_analytics;
-- CREATE POLICY "Anyone can update analytics" ON visitor_analytics
--   FOR UPDATE
--   USING (true);
