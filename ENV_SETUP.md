# Environment Variables Setup Guide

For RankBid to work properly, you need to configure the following environment variables on Vercel.

## Required Environment Variables

### Database (PostgreSQL/Prisma)
```
DATABASE_URL=postgresql://user:password@host:port/dbname
```
**Purpose:** Connects Prisma ORM to your PostgreSQL database for storing listings, payments, and rankings.

**How to get:**
1. Set up a PostgreSQL database (e.g., on Railway, Supabase, Render, or AWS RDS)
2. Get the connection string from your database provider
3. Format: `postgresql://username:password@host:port/database_name`

### Supabase (Real-time Stats & Visitor Tracking)
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Purpose:** 
- Tracks real-time visitor sessions
- Provides online user counts
- Stores visitor analytics

**How to get:**
1. Create a Supabase project at https://supabase.com
2. Go to Settings > API
3. Copy the `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
4. Copy the `Service Role Key` → `SUPABASE_SERVICE_ROLE_KEY`

### Payment Processing (JazzCash)
```
JAZZCASH_MERCHANT_ID=your_merchant_id
JAZZCASH_PASSWORD=your_password
JAZZCASH_INTEGRITY_CHECK_KEY=your_integrity_key
```

**Purpose:** Processes payments through JazzCash gateway

**How to get:** Contact JazzCash merchant support for credentials

### Optional: Stripe Integration
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_SECRET_KEY=sk_...
```

**Purpose:** Alternative payment processing (currently optional)

### Application
```
NEXT_PUBLIC_APP_URL=https://rankbid-lol.vercel.app
NODE_ENV=production
```

**Purpose:** 
- `NEXT_PUBLIC_APP_URL`: Used for payment redirects and callbacks
- `NODE_ENV`: Runtime environment setting

---

## Steps to Configure on Vercel

### 1. Go to Vercel Dashboard
- Visit https://vercel.com/dashboard
- Click on your `rankbid-lol` project

### 2. Click Settings
- Go to **Settings** tab
- Click **Environment Variables**

### 3. Add Each Variable
For each environment variable:
1. Click **Add New**
2. Enter the name (e.g., `DATABASE_URL`)
3. Enter the value
4. Select which environments: **Production** (recommended for all)
5. Click **Add**

### 4. Redeploy
After adding all variables:
1. Go to **Deployments** tab
2. Click the **three dots** next to the latest deployment
3. Select **Redeploy**
4. Wait for the deployment to complete

---

## Checking if Setup is Working

After deployment:

1. **Visit your site:** https://rankbid-lol.vercel.app

2. **Check stats:**
   - Look at the header - it should show real online users and visitor counts
   - If still showing "12 online" and "847 visitors", the Supabase env vars are missing

3. **Test form submission:**
   - Fill out a listing form with a URL
   - Select a category
   - Click "Claim rank"
   - If it succeeds, DATABASE_URL is configured correctly
   - If it fails with "Failed to submit listing", check DATABASE_URL

4. **Test dark mode:**
   - Click the moon icon in the header
   - Should switch to dark mode immediately
   - Click again to return to light mode
   - Refresh the page - setting should persist

---

## Troubleshooting

### Stats showing dummy values (12 online, 847 visitors)
- **Cause:** Missing Supabase credentials
- **Fix:** Add `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- **Verify:** Check Vercel logs with `vercel logs rankbid-lol.vercel.app --level error`

### Form submission fails with "Failed to submit listing"
- **Cause:** Missing or invalid `DATABASE_URL`
- **Fix:** Ensure your PostgreSQL database URL is correct and accessible
- **Verify:** Test connection string locally first

### Dark mode not working
- **Cause:** Tailwind dark mode not configured
- **Fix:** This should be fixed in latest deployment. If still broken, check browser console for errors
- **Verify:** Click moon icon and watch for theme change

### JazzCash payments not working
- **Cause:** Missing JazzCash credentials
- **Fix:** Add `JAZZCASH_MERCHANT_ID`, `JAZZCASH_PASSWORD`, `JAZZCASH_INTEGRITY_CHECK_KEY`
- **Note:** You'll need a JazzCash merchant account first

---

## Quick Test Commands (Local Development)

If you want to test locally first:

```bash
# Set environment variables
export DATABASE_URL="your-db-url"
export NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
export SUPABASE_SERVICE_ROLE_KEY="your-key"

# Start dev server
npm run dev

# Visit http://localhost:3000
# Test all features
```

---

## Production Checklist

- [ ] `DATABASE_URL` configured and accessible
- [ ] `NEXT_PUBLIC_SUPABASE_URL` set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set
- [ ] `NEXT_PUBLIC_APP_URL` points to production domain
- [ ] `NODE_ENV` set to `production`
- [ ] Deployment redeployed after adding env vars
- [ ] Verified stats showing real numbers
- [ ] Verified form submission works
- [ ] Verified dark mode toggle works
- [ ] Verified payment flow initializes correctly
