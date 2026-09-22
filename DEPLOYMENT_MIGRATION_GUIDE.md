# Deployment & Database Migration Guide

## ✅ Deployment Status
- **Status**: DEPLOYED TO PRODUCTION
- **URL**: https://rankbid-lol.vercel.app
- **Deployment ID**: dpl_9tJZzEC51WxGxDU8Etq6wnWmCMXL
- **Commit**: 2dd83b2

## New Features Deployed
✅ User Profile Page at `/profile`
✅ Authentication-based Voting
✅ User Submissions Tracking
✅ Dark Mode Removed
✅ Enhanced Navbar with User Menu

---

## 🗄️ Database Migration (REQUIRED)

### Important: Apply this migration to your Supabase database to enable user vote tracking!

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to [Supabase Dashboard](https://supabase.com)
2. Select your project
3. Go to **SQL Editor**
4. Click **New Query**
5. Copy and paste the migration SQL below:

```sql
-- Create user_votes table for authenticated user votes tracking
CREATE TABLE IF NOT EXISTS "user_votes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "voted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create unique constraint on user_votes (one vote per user per listing)
CREATE UNIQUE INDEX IF NOT EXISTS "user_votes_user_id_listing_id_key" ON "user_votes"("user_id", "listing_id");

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "user_votes_user_id_idx" ON "user_votes"("user_id");
CREATE INDEX IF NOT EXISTS "user_votes_listing_id_idx" ON "user_votes"("listing_id");
```

6. Click **Run**

### Option 2: Using psql CLI

```bash
# Export DATABASE_URL from .env.local
source .env.local

# Run the migration
psql "$DATABASE_URL" < prisma/migrations/add_user_tracking/migration.sql
```

### Option 3: Vercel Postgres Connection (if using Postgres)

Connect to your database from Vercel and run the SQL queries above.

---

## 🧪 Testing the New Features

### 1. User Registration & Login
- Go to https://rankbid-lol.vercel.app
- Click **Sign Up**
- Create a new account with email and password
- You should see your profile name in the navbar

### 2. Submit a Product
- Click the home page
- Scroll to "Submit Now"
- Fill in product details
- Click submit
- Check `/profile` to see your submission

### 3. Vote on Products
- Go to homepage
- Try to vote on a product (should work now)
- Go to `/profile` → **My Votes** to see your voting history

### 4. User Profile
- Click your profile name in navbar → "My Profile"
- View your submissions
- View your votes
- Check account settings

---

## 📋 Verification Checklist

After migration, verify:

- [ ] Can create user account
- [ ] Can login with email/password
- [ ] Can login with Google OAuth
- [ ] Can submit products (shows in profile)
- [ ] Can vote on products (shows in profile)
- [ ] Non-logged-in users cannot vote
- [ ] All listings visible without login
- [ ] Profile page loads correctly
- [ ] No dark mode visible (light theme only)

---

## 🚀 What's New for Users

### For Visitors (No Login)
✅ View all product rankings
✅ Browse by category
✅ See today's top products
❌ Cannot vote (must login first)

### For Logged-In Users
✅ Submit new products
✅ Vote on products
✅ View personal dashboard
✅ Track submission history
✅ Track voting history
✅ Manage account settings

---

## 📊 API Endpoints

### New Endpoints
- `GET /api/user/submissions?userId=<id>` - Get user's submissions
- `GET /api/user/votes?userId=<id>` - Get user's votes

### Updated Endpoints
- `POST /api/listings/submit` - Now tracks userId
- `POST /api/votes` - Now tracks authenticated votes

---

## 🔧 Troubleshooting

### "You must be logged in to vote"
- User is not authenticated
- Clear localStorage and login again
- Check browser console for errors

### Profile page shows no submissions
- Migration might not be applied
- User hasn't submitted anything yet
- Check database connection

### Google OAuth not working
- Ensure `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set in Vercel
- Check Google Console credentials

---

## 📝 Database Schema

### New Table: user_votes
```
id            TEXT PRIMARY KEY
user_id       TEXT (Foreign Key → users.id)
listing_id    TEXT
voted_at      TIMESTAMP
```

**Indexes**:
- `user_votes_user_id_listing_id_key` (UNIQUE)
- `user_votes_user_id_idx`
- `user_votes_listing_id_idx`

---

## 🎉 You're All Set!

The application is deployed and ready for the migration. Once you apply the database migration, all features will be fully functional!

**Questions?** Check the API.md file for detailed endpoint documentation.
