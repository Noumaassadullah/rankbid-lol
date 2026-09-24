# 📊 Real Visitor Analytics - Setup Guide

Your RankBid platform now has **real-time visitor tracking** that shows:
- **Live viewers** (active in last 30 minutes)
- **Total visitors** (all time)
- **Today's visitors** (24-hour count)
- **Page views** (total and daily)

## ✅ What Was Created

### API Routes
- `/api/track-visitor` — Tracks each visitor (POST)
- `/api/analytics/live-viewers` — Returns active viewers (GET)
- `/api/analytics/total-stats` — Returns all stats (GET)

### Components
- `VisitorTracker` — Client-side tracking (added to layout)
- `AnalyticsWidget` — Display component for stats

### Database Tables (Already Exist)
- `visitor_sessions` — Active user sessions
- `visitor_analytics` — Daily statistics

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Disable RLS (Critical!)
Go to your **Supabase Dashboard** → **SQL Editor** and run this:

```sql
ALTER TABLE visitor_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE visitor_analytics DISABLE ROW LEVEL SECURITY;
```

This allows the API to insert tracking data without authentication.

### Step 2: Deploy Code Changes
```bash
npm run build
npm run dev  # or deploy to production
```

The code is already integrated:
- ✅ `VisitorTracker` is in your layout
- ✅ API routes are created
- ✅ Analytics widget is ready

### Step 3: Test It Out
Visit: `http://localhost:3000/analytics-test`

This page shows:
- Live analytics dashboard
- Setup verification
- Testing instructions
- Browser console logs

---

## 📍 Where to Display Analytics

### Option A: Add to Homepage
```tsx
import { AnalyticsWidget } from '@/components/analytics-widget';

export default function Home() {
  return (
    <div>
      <h1>Welcome</h1>
      <AnalyticsWidget />
      {/* Rest of content */}
    </div>
  );
}
```

### Option B: Create Admin Dashboard
```tsx
// app/admin/analytics/page.tsx
import { AnalyticsWidget } from '@/components/analytics-widget';

export default function AdminAnalytics() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Website Analytics</h1>
      <AnalyticsWidget />
    </div>
  );
}
```

### Option C: Add to Footer
```tsx
// components/Footer.tsx
import { AnalyticsWidget } from '@/components/analytics-widget';

export default function Footer() {
  return (
    <footer>
      <AnalyticsWidget />
      {/* Rest of footer */}
    </footer>
  );
}
```

---

## 📊 How It Works

### Tracking Flow
1. User visits your site → `VisitorTracker` component loads
2. Creates/retrieves session ID from localStorage
3. POST to `/api/track-visitor` with session info
4. Server updates `visitor_sessions` and `visitor_analytics` tables
5. Repeats every 5 minutes while on site

### Display Flow
1. `AnalyticsWidget` calls `/api/analytics/live-viewers`
2. Gets active sessions from last 30 minutes
3. Also calls `/api/analytics/total-stats`
4. Gets aggregated visitor data
5. Refreshes every 10 seconds

### Cleanup
Inactive sessions (>30 min) are marked as `is_active = false` automatically on next API call.

---

## 🔍 Debug & Troubleshoot

### Check If Tracking Works
1. Open DevTools (F12)
2. Go to **Console** tab
3. You should see logs like:
   ```
   [CLIENT] Visitor tracked: {success: true}
   [TRACKING] Session: session-xxx, Page: /
   [LIVE VIEWERS] Current: 1
   [STATS] {totalVisitors: 5, totalPageViews: 12, ...}
   ```

### If No Logs Appear
1. Check if `/api/track-visitor` is reachable
2. Open Network tab in DevTools
3. Should see POST requests to `/api/track-visitor`
4. Check response status (should be 200)

### If Data Shows 0
1. Verify RLS is disabled:
   ```sql
   -- In Supabase SQL Editor
   SELECT * FROM pg_tables WHERE tablename = 'visitor_sessions';
   SELECT * FROM visitor_analytics;
   ```
   Should return data if tracking is working.

2. Check environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   SUPABASE_SERVICE_ROLE_KEY=...
   ```

3. Test API directly:
   ```bash
   curl http://localhost:3000/api/analytics/live-viewers
   curl http://localhost:3000/api/analytics/total-stats
   ```

---

## 📈 Analytics Metrics Explained

| Metric | What It Shows | How It's Counted |
|--------|---------------|-----------------|
| **Live Now** | Active visitors right now | Sessions with activity in last 30 min |
| **Today** | Visitors today | Unique visitors from today's date |
| **Total** | All-time visitors | Sum of all visitor_analytics records |
| **Views** | Page views | Sum of all page_views across all days |

---

## 🎯 Next Steps

1. ✅ Run the SQL to disable RLS
2. ✅ Deploy the code
3. ✅ Test on `/analytics-test`
4. ✅ Add `<AnalyticsWidget />` to your desired pages
5. ✅ Monitor real visitor data!

---

## 🚨 Important Notes

- **RLS Must Be Disabled** for visitor tables (these are analytics-only, no sensitive data)
- **Service Role Key** never exposed to client (kept in API routes)
- **Session IDs** stored in localStorage (persists across refreshes)
- **Auto-cleanup** happens when sessions are inactive >30 min
- **Real-time Updates** via 10-second polling (can adjust interval)

---

## 📱 Customize Widget Appearance

Edit `components/analytics-widget.tsx`:
- Change colors (currently uses Tailwind gradients)
- Adjust refresh interval (currently 10 seconds)
- Add more metrics from the stats object
- Modify card layout/styling

Example: Add more detailed breakdown
```tsx
<div className="mt-4 text-xs text-gray-600">
  <p>Yesterday: {stats.yesterdayVisitors}</p>
  <p>This Week: {stats.weekVisitors}</p>
  <p>This Month: {stats.monthVisitors}</p>
</div>
```

---

**Questions or issues?** Check the `/analytics-test` page for real-time diagnostics! 🚀
