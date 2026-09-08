# Troubleshooting: API 500 Error

If you see **"API error: 500"** in the console, follow this guide to fix it.

## 🔍 Quick Diagnosis

The 500 error means the server encountered an error. Most likely causes:

1. **Database not configured** ← Most common
2. **DATABASE_URL not set in .env.local**
3. **PostgreSQL not running**
4. **Database doesn't exist**
5. **Prisma migrations not run**

## ✅ Fix It Step-by-Step

### Step 1: Check .env.local

Open `.env.local` and verify:

```env
DATABASE_URL="postgresql://localhost:5432/rankbid"
STRIPE_PUBLIC_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_DOMAIN="http://localhost:3000"
```

**If DATABASE_URL is missing or wrong**, add it now!

### Step 2: Check PostgreSQL is Running

```bash
# macOS with Homebrew
brew services list

# Should show: postgresql ... started

# If not running, start it:
brew services start postgresql
```

**Windows/Linux**: Start PostgreSQL from your services app

### Step 3: Create the Database

```bash
# Create database
createdb rankbid

# Verify it exists
psql -l | grep rankbid
```

### Step 4: Run Migrations

```bash
# Install Prisma (if needed)
npm install

# Run migrations to create tables
npx prisma migrate dev

# Should output:
# ✓ Successfully created 8 new tables
```

### Step 5: Restart Dev Server

```bash
# Stop the server (Ctrl+C)

# Start it again
npm run dev
```

## 🧪 Verify It's Working

Open http://localhost:3000 and check:

- [ ] No yellow warning banner at top
- [ ] Leaderboard section appears empty (no error)
- [ ] Form fields are clickable
- [ ] Console shows no 500 errors

## 🪵 View the Database

```bash
# Open Prisma Studio to see database
npx prisma studio

# Opens http://localhost:5555
# You can see tables and data here
```

## 🌐 Using Cloud Database Instead?

Don't want to install PostgreSQL locally? Use:

### Option A: Neon (Recommended)
1. Go to https://neon.tech
2. Create account (free tier available)
3. Create a project
4. Copy connection string
5. Paste into `.env.local` as DATABASE_URL
6. Run migrations: `npx prisma migrate dev`

### Option B: Railway
1. Go to https://railway.app
2. Create account (free tier with $5 credit)
3. Create PostgreSQL project
4. Copy connection string
5. Paste into `.env.local` as DATABASE_URL
6. Run migrations: `npx prisma migrate dev`

### Option C: Supabase
1. Go to https://supabase.com
2. Create account (free tier)
3. Create project
4. Copy connection string from Settings
5. Paste into `.env.local` as DATABASE_URL
6. Run migrations: `npx prisma migrate dev`

## 🆘 Still Getting 500 Error?

Try these debug steps:

```bash
# 1. Check database connection
psql $DATABASE_URL -c "SELECT 1;"
# Should return: 1

# 2. Check Prisma can connect
npx prisma db push
# Should say: "✓ Already in sync, no schema change or pending migration detected."

# 3. Look at server logs
# Restart with: npm run dev
# Look for error messages in terminal

# 4. Reinitialize migrations
rm -rf prisma/migrations
npx prisma migrate dev --name init
```

## 📋 Checklist Before Asking for Help

- [ ] DATABASE_URL is set in .env.local
- [ ] PostgreSQL is running (`psql -V` works)
- [ ] Database exists (`createdb rankbid` worked or exists)
- [ ] Migrations ran (`npx prisma migrate dev` succeeded)
- [ ] Dev server restarted after changes
- [ ] Browser cache cleared (Ctrl+Shift+Delete)
- [ ] Checked console for error messages

## 💬 Common Error Messages

### "P1000 Authentication failed"
**Fix**: Check DATABASE_URL has correct username/password

### "P1001 Can't reach database server"
**Fix**: PostgreSQL not running - start it with `brew services start postgresql`

### "P2021 The table `listings` does not exist"
**Fix**: Migrations not run - `npx prisma migrate dev`

### "ECONNREFUSED connection refused"
**Fix**: PostgreSQL not started, or wrong host/port in DATABASE_URL

## ✨ Success Signs

Once fixed, you should see:
- ✅ Empty leaderboard (no 500 error)
- ✅ Form is interactive
- ✅ Can create listings
- ✅ Can view product pages
- ✅ No yellow warning banner

---

**Still stuck?** Check the server logs and let me know what error message you see!
