# Vercel Deployment with Supabase + JazzCash

Complete guide to deploy rankbid.lol on Vercel with Supabase database and JazzCash payments.

## Prerequisites

- Vercel account (linked) ✓
- Supabase account (free tier available)
- JazzCash merchant account (Pakistani payment provider)

---

## Step 1: Set Up Supabase

### Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in:
   - **Project name:** `rankbid-lol`
   - **Database password:** Save this securely
   - **Region:** Choose closest to you
4. Click "Create new project" (wait ~2 minutes)

### Get Supabase Credentials

1. In Supabase dashboard, go to **Settings → API**
2. Copy these values:
   ```
   Project URL → NEXT_PUBLIC_SUPABASE_URL
   anon key → NEXT_PUBLIC_SUPABASE_ANON_KEY
   service_role key → SUPABASE_SERVICE_ROLE_KEY
   ```

### Create Database Tables

In Supabase SQL Editor, run:

```sql
-- Listings table
CREATE TABLE listings (
  id TEXT PRIMARY KEY,
  url TEXT UNIQUE NOT NULL,
  handle TEXT,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  totalPaid INTEGER DEFAULT 0,
  dayPaid INTEGER DEFAULT 0,
  clickCount INTEGER DEFAULT 0,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
  id TEXT PRIMARY KEY,
  listingId TEXT NOT NULL REFERENCES listings(id),
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  transactionId TEXT,
  provider TEXT,
  metadata JSONB,
  paidAt TIMESTAMP DEFAULT NOW(),
  createdAt TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_listings_totalPaid ON listings(totalPaid DESC);
CREATE INDEX idx_listings_dayPaid ON listings(dayPaid DESC);
CREATE INDEX idx_listings_category ON listings(category);
CREATE INDEX idx_payments_listingId ON payments(listingId);
```

---

## Step 2: Set Up JazzCash

### Create JazzCash Merchant Account

1. Go to [JazzCash Developer Portal](https://sandbox.jazzcash.com.pk)
2. Register as merchant
3. Complete KYC verification
4. Wait for approval (24-48 hours)

### Get JazzCash Credentials

Once approved, you'll get:
- **Merchant ID**
- **Password**
- **Integrity Check Key**

### Test Credentials (Sandbox)

For testing, use sandbox credentials provided by JazzCash:
- Sandbox URL: `https://sandbox.jazzcash.com.pk`
- Test merchant ID and password available in their docs

---

## Step 3: Update Environment Variables

### Local Development (.env.local)

```bash
# Supabase
DATABASE_URL="postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres"
NEXT_PUBLIC_SUPABASE_URL="https://[project-id].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[your-anon-key]"
SUPABASE_SERVICE_ROLE_KEY="[your-service-role-key]"

# JazzCash
JAZZCASH_MERCHANT_ID="[your-merchant-id]"
JAZZCASH_PASSWORD="[your-password]"
JAZZCASH_INTEGRITY_CHECK_KEY="[your-integrity-check-key]"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

### Vercel Production

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select project `rankbid-lol`
3. Go to **Settings → Environment Variables**
4. Add all the above variables (except `NODE_ENV=development`)
5. Set production JazzCash credentials (not sandbox)

---

## Step 4: Update Database Configuration

The code now uses Supabase via Prisma. Update `prisma/schema.prisma` if needed:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

---

## Step 5: Deploy to Vercel

### First Deployment

```bash
# 1. Commit changes
git add .
git commit -m "Add Supabase + JazzCash integration"

# 2. Push to GitHub
git push origin main

# 3. Vercel auto-deploys, OR manually:
vercel deploy --prod
```

### Verify Deployment

1. Check [vercel.com/dashboard](https://vercel.com/dashboard)
2. Deployment should complete in 2-3 minutes
3. Visit your production URL (e.g., `https://rankbid-lol.vercel.app`)

---

## Step 6: Test the Flow

### Test Payment Locally

1. Start dev server: `npm run dev`
2. Go to `http://localhost:3000`
3. Fill in form and click "Claim rank"
4. You'll be redirected to JazzCash sandbox
5. Use test card details provided by JazzCash
6. Confirm payment
7. Should redirect back to `/payment/jazzcash-return`

### Test Payment in Production

Same flow but on your production Vercel URL.

---

## Troubleshooting

### "Database connection failed"

- Verify `DATABASE_URL` is set in Vercel Environment Variables
- Check Supabase project is running
- Verify connection string format

### "JazzCash payment fails"

- Check merchant ID and password are correct
- Verify `NEXT_PUBLIC_APP_URL` is correct (used for redirects)
- Check JazzCash Integrity Check Key
- Ensure transaction amount is ≥ 100 PKR (1000 cents)

### Leaderboard shows empty

- Database might not be configured
- Check that env vars are loaded: `vercel env pull`
- Verify Supabase tables were created

---

## Next Steps

1. ✅ Link Vercel
2. ⬜ Set up Supabase
3. ⬜ Set up JazzCash
4. ⬜ Add env vars to Vercel
5. ⬜ Deploy to Vercel
6. ⬜ Test in production

---

## Support

- **Supabase:** https://supabase.com/docs
- **JazzCash:** https://sandbox.jazzcash.com.pk (Developer docs)
- **Vercel:** https://vercel.com/docs
