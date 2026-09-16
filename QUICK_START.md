# 🚀 Quick Start - Get Your Site Working in 5 Steps

## Step 1: Create Supabase Account (2 min)
1. Go to https://supabase.com
2. Click "Start Your Project"
3. Sign up with email
4. Create new project (any name, any region)
5. **SAVE** these from Settings → API:
   - `Project URL` 
   - `Service Role Key` (secret)
   - `Anon Public Key`

## Step 2: Create Database Table (1 min)
In Supabase → SQL Editor, run this:

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
```

Click "Run" ✓

## Step 3: Get Database Connection String (1 min)
1. In Supabase → Settings → Database
2. Copy the **Full Connection String** (URI)
3. Replace `[YOUR-PASSWORD]` with your database password
4. **SAVE** this as your `DATABASE_URL`

## Step 4: Add Environment Variables to Vercel (2 min)

Go to: https://vercel.com/noumaassadullahs-projects

1. Click **rankbid-lol** project
2. Click **Settings** → **Environment Variables**
3. Add these 6 variables (click "Add New" for each):

| Name | Value |
|------|-------|
| `DATABASE_URL` | Your PostgreSQL connection string |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Service Role Key |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Anon Public Key |
| `NEXT_PUBLIC_APP_URL` | `https://rankbid-lol.vercel.app` |
| `NODE_ENV` | `production` |

**Important:** Select **Production** for each variable ✓

## Step 5: Redeploy (1 min)

1. Click **Deployments** tab
2. Click **...** next to latest deployment
3. Click **Redeploy**
4. Wait for "Ready" status (green checkmark)

---

## ✅ Test It Works!

After deployment, visit: https://rankbid-lol.vercel.app

### Test 1: Real-Time Stats
- Look at header
- Should show **real numbers** (not "12 online")
- Refresh → numbers update
- ✅ Working!

### Test 2: Dark Mode
- Click moon icon
- Page goes dark
- Click sun icon
- Page goes light
- Refresh page
- Setting stays (dark/light)
- ✅ Working!

### Test 3: Form Submission
- Enter a URL: `https://example.com`
- Select a category
- Click "Claim rank"
- Should show success or payment page
- ✅ Working!

---

## 🎉 You're Done!

If all 3 tests pass, your site is **PRODUCTION READY**!
