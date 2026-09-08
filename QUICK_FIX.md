# Quick Fix: Console JSON Error

If you're seeing this error:
```
SyntaxError: Unexpected end of JSON input
Failed to execute 'json' on 'Response'
```

**Don't panic!** This is because the database hasn't been set up yet. Follow these steps:

## 1️⃣ Database Setup (Required)

### Option A: PostgreSQL (Recommended)

```bash
# Install PostgreSQL (if you don't have it)
# macOS:
brew install postgresql

# Start PostgreSQL
brew services start postgresql

# Create database
createdb rankbid

# Run migrations
npx prisma migrate dev --name init
```

### Option B: PostgreSQL Cloud (Easier)

Use one of these services (free tier available):
- **Neon**: https://neon.tech
- **Railway**: https://railway.app
- **Supabase**: https://supabase.com

Then set `DATABASE_URL` in `.env.local`:
```env
DATABASE_URL="postgresql://user:password@host/rankbid"
```

## 2️⃣ Environment Variables

Create/update `.env.local`:

```env
# Database (REQUIRED)
DATABASE_URL="postgresql://localhost:5432/rankbid"

# Stripe (Optional - but recommended for payments)
STRIPE_PUBLIC_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Domain
NEXT_PUBLIC_DOMAIN="http://localhost:3000"
```

## 3️⃣ Run Migrations

```bash
# This creates all database tables
npx prisma migrate dev
```

## 4️⃣ Start Dev Server

```bash
npm run dev
```

Open http://localhost:3000 ✅

## ✅ The Error Should Be Gone!

The website will now:
- Display empty leaderboards (no listings yet)
- Allow you to create listings
- Process payments via Stripe
- Show real data in the leaderboard

## 🧪 Test It

1. Fill the claim form at `/`
2. Create a listing (it will show on the leaderboard)
3. Click "Claim Rank" to start payment

## 📊 View Database

```bash
# Open Prisma Studio to see your data
npx prisma studio
```

## 🆘 Still Having Issues?

Check that:
- [ ] PostgreSQL is running (`psql` works in terminal)
- [ ] DATABASE_URL is correct in `.env.local`
- [ ] You ran `npx prisma migrate dev`
- [ ] Node server restarted after `.env.local` change

If still stuck, run:
```bash
# Check database connection
psql $DATABASE_URL

# Reinitialize migrations
rm -rf prisma/migrations
npx prisma migrate dev --name init
```

---

**That's it!** The website is now fully functional. 🚀
