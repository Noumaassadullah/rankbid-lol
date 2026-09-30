# Live Traffic Stats - Quick Start Guide

## Overview
Your RankBid site now has **real-time traffic statistics** that update automatically with **daily, weekly, monthly, and all-time filtering**.

## What's Changed

### 1. **New Filtered Stats API** 
Endpoint: `/api/analytics/filtered-stats`

Get user counts for any time period:
```bash
# Today's visitors
curl http://localhost:3000/api/analytics/filtered-stats?period=daily

# This week's visitors  
curl http://localhost:3000/api/analytics/filtered-stats?period=weekly

# This month's visitors
curl http://localhost:3000/api/analytics/filtered-stats?period=monthly

# All-time visitors
curl http://localhost:3000/api/analytics/filtered-stats?period=all
```

### 2. **Enhanced Analytics Widget**
- Located at: `components/analytics-widget.tsx`
- Features:
  - ✅ Time period toggle buttons (Today / Week / Month / All Time)
  - ✅ Live visitor count with pulse indicator
  - ✅ Real-time page view tracking
  - ✅ Average visitors per day (for weekly/monthly)
  - ✅ Auto-refresh every 10 seconds
  - ✅ Color-coded stat cards with icons

### 3. **Updated Stats Page**
- Available at: `/stats`
- Now displays the analytics widget at the top
- Shows historical stats below

### 4. **Improved Visitor Tracking**
- Automatically tracks every page visit
- Updates sessions every 5 minutes
- Handles browser tab visibility changes
- Stores IP address and user agent

## How to Use

### Display Live Stats on Any Page
```tsx
import { AnalyticsWidget } from '@/components/analytics-widget';

export default function MyPage() {
  return (
    <div>
      <AnalyticsWidget />
      {/* rest of your page */}
    </div>
  );
}
```

### Display Compact Stats in Header
```tsx
import { AnalyticsCompact } from '@/components/analytics-compact';

export function Header() {
  return (
    <div>
      <AnalyticsCompact />
      {/* rest of header */}
    </div>
  );
}
```

## Live Stats Cards

### 1. Live Now (Red Card)
- Shows users active in last 30 minutes
- Has pulse animation indicator
- Updates in real-time

### 2. Period Stats (Blue Card)
- Changes based on selected time period
- Shows visitor count for that period
- Includes average per day for weekly/monthly

### 3. Total (Green Card)
- All-time visitor count
- Remains constant
- Shows total traffic since launch

### 4. Page Views (Purple Card)
- Changes based on selected period
- Shows total page views for that timeframe
- Helps identify traffic patterns

## Features

✅ **Real-Time Updates** - Stats refresh every 10 seconds
✅ **Time Period Filtering** - Daily, Weekly, Monthly, All Time
✅ **Daily Averaging** - See average visitors/day for longer periods
✅ **Session Tracking** - Automatic tracking with session IDs
✅ **Responsive Design** - Works on mobile and desktop
✅ **No Manual Configuration** - Automatic visitor tracking

## Database Requirements

The system uses two Supabase tables:

1. **visitor_sessions** - Tracks individual user sessions
2. **visitor_analytics** - Daily aggregated stats

These tables should be created by running:
```bash
supabase db push
```

## Testing

### Test on Stats Page
```bash
npm run dev
# Visit http://localhost:3000/stats
```

### Test Analytics Page
```bash
# Visit http://localhost:3000/analytics-test
```

### Manual API Test
```bash
# Get today's stats
curl 'http://localhost:3000/api/analytics/filtered-stats?period=daily'

# Get this week's stats
curl 'http://localhost:3000/api/analytics/filtered-stats?period=weekly'

# Get this month's stats
curl 'http://localhost:3000/api/analytics/filtered-stats?period=monthly'

# Get all-time stats
curl 'http://localhost:3000/api/analytics/filtered-stats?period=all'
```

## Files Modified

- ✅ `components/analytics-widget.tsx` - Added time period filtering
- ✅ `components/analytics-compact.tsx` - Added daily visitor count
- ✅ `app/stats/page.tsx` - Integrated analytics widget
- ✅ `app/api/analytics/filtered-stats/route.ts` - NEW: Filtered stats endpoint

## Next Steps

1. **Deploy to Production**
   - Ensure Supabase tables are created
   - The tracking will automatically start collecting data

2. **Monitor Traffic**
   - Visit `/stats` page to see real-time analytics
   - Use the time period filters to analyze trends

3. **Embed Anywhere**
   - Add `<AnalyticsWidget />` to any page that needs traffic display

## Troubleshooting

### Stats Show 0 Visitors
- Check if Supabase tables exist: `supabase db push`
- Verify API keys in `.env.local`
- Check browser console for errors

### Stats Not Updating
- Refresh the page (auto-refresh is every 10 seconds)
- Check if `/api/track-visitor` is being called (dev tools)

### Performance Issues
- Widget refreshes every 10 seconds - can be adjusted in code
- Database queries are optimized with indexes

## Support

For issues or questions, check:
- `/ANALYTICS_IMPLEMENTATION.md` - Detailed technical documentation
- Dev console - Look for `[FILTERED STATS]` logs
