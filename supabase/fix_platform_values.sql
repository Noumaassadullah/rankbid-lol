-- Update platform values for existing submissions based on their URL
-- This ensures existing high-vote submissions appear on the correct platform cards

-- Update LinkedIn submissions
UPDATE listings
SET platform = 'linkedin'
WHERE platform IS NULL OR platform = 'website'
  AND location ILIKE '%linkedin.com%';

-- Update Instagram submissions
UPDATE listings
SET platform = 'instagram'
WHERE platform IS NULL OR platform = 'website'
  AND location ILIKE '%instagram.com%';

-- Update Twitter/X submissions
UPDATE listings
SET platform = 'twitter'
WHERE platform IS NULL OR platform = 'website'
  AND (location ILIKE '%twitter.com%' OR location ILIKE '%x.com%');

-- Update Facebook submissions
UPDATE listings
SET platform = 'facebook'
WHERE platform IS NULL OR platform = 'website'
  AND location ILIKE '%facebook.com%';

-- Update TikTok submissions
UPDATE listings
SET platform = 'tiktok'
WHERE platform IS NULL OR platform = 'website'
  AND location ILIKE '%tiktok.com%';

-- Verify the updates
SELECT platform, COUNT(*) as count FROM listings GROUP BY platform;
