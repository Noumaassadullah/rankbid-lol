# RankBid Production Setup Checklist

Follow these steps to get your site fully working with real-time stats and form submissions.

---

## ✅ Step 1: Set Up Supabase (5 minutes)

### 1.1 Create Supabase Project
- [ ] Go to https://supabase.com
- [ ] Sign up or log in
- [ ] Click "New Project"
- [ ] Fill in:
  - **Name:** rankbid-lol
  - **Database Password:** (Create a strong password)
  - **Region:** Choose closest to you
- [ ] Click "Create new project"
- [ ] Wait 2-3 minutes for setup

### 1.2 Get Supabase Credentials
- [ ] Go to **Settings** → **API**
- [ ] Copy **Project URL** → Save as `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Copy **Service Role Key** (secret key) → Save as `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Also copy **Anon Public Key** → Save as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 1.3 Create Database Tables (for visitor tracking)
Supabase should create tables automatically, but verify:
- [ ] Click **SQL Editor** on the left
- [ ] Run this query:

```sql
CREATE TABLE IF NOT EXISTS visitor_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  page_url TEXT,
  last_activity TIMESTAMP DEFAULT now(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_session_id ON visitor_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_is_active ON visitor_sessions(is_active);
```

- [ ] Click "Run" button
- [ ] Should show "Success"

---

## ✅ Step 2: Set Up PostgreSQL Database (5-10 minutes)

Choose ONE option:

### Option A: Use Supabase PostgreSQL (Recommended)
Supabase includes a PostgreSQL database. Get your connection string:

- [ ] In Supabase, go to **Settings** → **Database**
- [ ] Scroll down to **Connection string**
- [ ] Copy the **Full Connection String** (URI)
- [ ] It looks like: `postgresql://postgres:PASSWORD@db.REGION.supabase.co:5432/postgres`
- [ ] Replace `[YOUR-PASSWORD]` with your database password
- [ ] Save as `DATABASE_URL`

### Option B: Use External PostgreSQL
If using Railway, Render, or AWS RDS:
- [ ] Get your PostgreSQL connection string
- [ ] Format: `postgresql://username:password@host:port/dbname`
- [ ] Save as `DATABASE_URL`

---

## ✅ Step 3: Add Environment Variables to Vercel

### 3.1 Go to Vercel Dashboard
- [ ] Visit https://vercel.com/noumaassadullahs-projects
- [ ] Click on **rankbid-lol** project

### 3.2 Add Environment Variables
- [ ] Click **Settings** tab (top right)
- [ ] Click **Environment Variables** (left sidebar)

### 3.3 Add Each Variable
For each variable below, click "Add New":

#### Variable 1: DATABASE_URL
- **Name:** `DATABASE_URL`
- **Value:** (Your PostgreSQL connection string from Step 2)
- **Environments:** Select **Production** ✓
- Click **Add**

#### Variable 2: NEXT_PUBLIC_SUPABASE_URL
- **Name:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:** (From Supabase Step 1.2)
- **Environments:** Production ✓
- Click **Add**

#### Variable 3: SUPABASE_SERVICE_ROLE_KEY
- **Name:** `SUPABASE_SERVICE_ROLE_KEY`
- **Value:** (From Supabase Step 1.2 - the secret key)
- **Environments:** Production ✓
- Click **Add**

#### Variable 4: NEXT_PUBLIC_SUPABASE_ANON_KEY
- **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** (From Supabase Step 1.2)
- **Environments:** Production ✓
- Click **Add**

#### Variable 5: NEXT_PUBLIC_APP_URL
- **Name:** `NEXT_PUBLIC_APP_URL`
- **Value:** `https://rankbid-lol.vercel.app`
- **Environments:** Production ✓
- Click **Add**

#### Variable 6: NODE_ENV
- **Name:** `NODE_ENV`
- **Value:** `production`
- **Environments:** Production ✓
- Click **Add**

### 3.4 Verify All Variables Are Added
- [ ] You should see 6 variables in the list
- [ ] All marked as Production
- [ ] No errors shown

---

## ✅ Step 4: Redeploy to Production

### 4.1 Trigger Redeployment
- [ ] Click **Deployments** tab (top)
- [ ] Find the latest deployment
- [ ] Click the **...** (three dots) menu
- [ ] Click **Redeploy**
- [ ] Confirm when asked

### 4.2 Wait for Build to Complete
- [ ] You'll see "Building..."
- [ ] Wait for status to change to "Ready" (usually 30-60 seconds)
- [ ] Green checkmark = Success ✓

---

## ✅ Step 5: Test Everything

### 5.1 Test Real-Time Stats
- [ ] Go to https://rankbid-lol.vercel.app
- [ ] Look at the header
- [ ] **Before:** Shows "12 online" and "847 visitors" (dummy values)
- [ ] **After:** Shows real numbers that change
- [ ] Refresh page → numbers should update
- [ ] ✅ If numbers update → Stats API working!

### 5.2 Test Dark Mode
- [ ] Click the **moon icon** in top right
- [ ] Page should turn dark immediately
- [ ] Click **sun icon** to return to light
- [ ] Refresh page
- [ ] Setting should persist (stay dark/light)
- [ ] ✅ If it works → Dark mode working!

### 5.3 Test Form Submission
- [ ] Scroll to the form
- [ ] Enter a website URL: `https://example.com`
- [ ] Select a category
- [ ] Click "Claim rank"
- [ ] **Option A:** Shows success message
- [ ] **Option B:** Redirects to payment page
- [ ] ✅ If either happens → Database working!

### 5.4 Test Stats Page
- [ ] Go to https://rankbid-lol.vercel.app/stats
- [ ] Look for stats cards
- [ ] **Before:** Shows "0" products, bids, etc.
- [ ] **After:** Shows real numbers
- [ ] ✅ If numbers show → Database queries working!

---

## 🚀 Complete Verification

Run this checklist after testing:

```
✅ Stats showing real numbers (not 12 / 847)
✅ Dark mode toggle works
✅ Dark mode persists after refresh
✅ Form submission succeeds or goes to payment
✅ Stats page shows real database numbers
✅ No errors in browser console (F12)
✅ No 500 errors in Vercel logs
```

If ALL ✅, your site is **PRODUCTION READY** 🎉

---

## 🔧 Troubleshooting

### Stats Still Showing Dummy Values
**Problem:** Header still shows "12 online" and "847 visitors"
**Solution:**
1. Check Vercel environment variables are added
2. Click Redeploy again
3. Wait 60 seconds
4. Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
5. Check browser console for errors (F12)

**Check Vercel logs:**
```bash
vercel logs rankbid-lol.vercel.app --level error
```

If you see "Missing Supabase credentials", env vars not applied yet.

### Form Submission Still Failing
**Problem:** "Failed to submit listing. Please try again later."
**Solution:**
1. Verify `DATABASE_URL` is correct
2. Test connection string locally:
   ```bash
   psql "your-connection-string"
   ```
3. Check if database is accessible from Vercel
4. Look at Vercel logs for Prisma errors
5. Make sure database exists and is reachable

### Dark Mode Not Working
**Problem:** Clicking moon/sun icon does nothing
**Solution:**
1. Hard refresh (Ctrl+Shift+R)
2. Check browser console (F12)
3. Look for JavaScript errors
4. Make sure Tailwind CSS loaded properly

---

## 📞 Getting Help

If something doesn't work:

1. **Check Vercel Logs:**
   ```bash
   vercel logs rankbid-lol.vercel.app --follow
   ```

2. **Check Environment Variables:**
   - Go to Vercel → Settings → Environment Variables
   - Verify all 6 variables are there
   - Check values are not truncated

3. **Test Database Connection:**
   - Copy your DATABASE_URL
   - Try connecting locally with psql or any SQL client
   - If local connection fails, database isn't accessible

4. **Check Supabase:**
   - Go to https://app.supabase.com
   - Verify database is running
   - Check API keys in Settings → API

5. **Browser Console (F12):**
   - Open DevTools
   - Check Console tab for errors
   - Error messages often give clues

---

## ✅ Final Checklist Before Launch

- [ ] All 6 environment variables added to Vercel
- [ ] Redeployment completed successfully
- [ ] Stats showing real numbers
- [ ] Dark mode toggle works
- [ ] Form submission works
- [ ] Stats page shows real data
- [ ] No console errors
- [ ] No 500 errors in logs
- [ ] Tested on mobile (looks good)
- [ ] Dark mode persists after refresh

**Once all ✅, your site is LIVE and PRODUCTION READY!** 🚀
