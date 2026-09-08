# Deployment Checklist

Follow this checklist to deploy rankbid.lol to Vercel with Supabase + JazzCash.

## Pre-Deployment

- [ ] Have Vercel account (already linked ✓)
- [ ] Have Supabase account created
- [ ] Have JazzCash merchant account (or sandbox credentials for testing)

---

## Step 1: Supabase Setup (15 min)

- [ ] Create Supabase project at https://supabase.com
- [ ] Copy Project URL → `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Copy anon key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Copy service_role key → `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Create database tables (run SQL in Supabase Editor):
  ```sql
  -- Copy SQL from VERCEL_DEPLOYMENT.md Step 1
  ```
- [ ] Verify tables created: Check "Table Editor" in Supabase
- [ ] Get `DATABASE_URL` from Settings → Database → Connection string

---

## Step 2: JazzCash Setup (varies)

### If Testing (Sandbox):
- [ ] Get sandbox credentials from JazzCash docs
- [ ] Test credentials set locally for dev testing

### If Production:
- [ ] Apply for JazzCash merchant account
- [ ] Complete KYC verification
- [ ] Wait for approval (24-48 hours)
- [ ] Copy Merchant ID → `JAZZCASH_MERCHANT_ID`
- [ ] Copy Password → `JAZZCASH_PASSWORD`
- [ ] Copy Integrity Check Key → `JAZZCASH_INTEGRITY_CHECK_KEY`

---

## Step 3: Local Testing (10 min)

```bash
# 1. Update .env.local with Supabase credentials
# DATABASE_URL=postgresql://...
# NEXT_PUBLIC_SUPABASE_URL=https://...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# SUPABASE_SERVICE_ROLE_KEY=...

# 2. Update .env.local with JazzCash credentials
# JAZZCASH_MERCHANT_ID=...
# JAZZCASH_PASSWORD=...
# JAZZCASH_INTEGRITY_CHECK_KEY=...

# 3. Create migration
npm run prisma:migrate

# 4. Start dev server
npm run dev

# 5. Test at http://localhost:3000
# - Submit a listing
# - Click "Claim rank"
# - Complete JazzCash payment (sandbox)
# - Verify payment recorded in Supabase
```

- [ ] Dev server starts without errors
- [ ] Can submit listing form
- [ ] JazzCash checkout works
- [ ] Payment recorded in database

---

## Step 4: Vercel Setup (10 min)

1. Go to [Vercel Dashboard → rankbid-lol](https://vercel.com/dashboard)
2. Click "Settings" → "Environment Variables"
3. Add these environment variables:

```
DATABASE_URL = [from Supabase]
NEXT_PUBLIC_SUPABASE_URL = [your project URL]
NEXT_PUBLIC_SUPABASE_ANON_KEY = [anon key]
SUPABASE_SERVICE_ROLE_KEY = [service role key]
JAZZCASH_MERCHANT_ID = [merchant id]
JAZZCASH_PASSWORD = [password]
JAZZCASH_INTEGRITY_CHECK_KEY = [integrity key]
NEXT_PUBLIC_APP_URL = https://rankbid-lol.vercel.app
```

- [ ] All 8 environment variables added
- [ ] Values are correct (no typos)
- [ ] No quotes around values in Vercel UI

---

## Step 5: Deploy (5 min)

```bash
# Commit and push
git add .
git commit -m "Setup Supabase + JazzCash for Vercel deployment"
git push origin main
```

- [ ] Changes pushed to GitHub
- [ ] Vercel auto-deploys
- [ ] Build completes successfully (check Vercel dashboard)
- [ ] Deployment URL shows (e.g., https://rankbid-lol.vercel.app)

---

## Step 6: Verify Production (5 min)

Visit your production URL: `https://rankbid-lol.vercel.app`

- [ ] Page loads without errors
- [ ] Leaderboard displays (even if empty)
- [ ] Can submit a listing
- [ ] "Claim rank" button works
- [ ] JazzCash payment flow works
- [ ] Payment completes and redirects properly

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Database connection failed" | Check `DATABASE_URL` in Vercel env vars, verify Supabase project is running |
| "Payment gateway error" | Verify `JAZZCASH_MERCHANT_ID` and `JAZZCASH_INTEGRITY_CHECK_KEY` are correct |
| Build fails | Check logs in Vercel dashboard, ensure `prisma migrate` worked locally first |
| Leaderboard empty | Verify Supabase tables were created and env vars are loaded |

---

## Post-Deployment

- [ ] Monitor Vercel deployment for errors
- [ ] Check Supabase dashboard for successful payments
- [ ] Test a few payments end-to-end
- [ ] Share production URL with testers

---

**Total Time: ~45 minutes (or 24-48 hours if waiting for JazzCash approval)**
