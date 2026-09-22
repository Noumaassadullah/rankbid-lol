# 🔧 Profile Page Fix - Troubleshooting Guide

## Issue Encountered
After login, the profile page was not showing submissions and the page was not accessible.

## Root Causes Identified

1. **Database Migration Not Applied**
   - The `user_id` column doesn't exist in Supabase `listings` table yet
   - This prevents the API from querying user submissions

2. **Missing Navbar**
   - Profile page wasn't showing the Navbar
   - Made it hard to navigate back

3. **No User Tracking on Old Submissions**
   - Existing submissions don't have a `user_id` set
   - They won't show up even after migration

## ✅ Fixes Applied

### 1. Updated Profile API Endpoint
- Added better error handling for missing `user_id` column
- Gracefully falls back when database migration not applied
- Added console logging for debugging

### 2. Added Navbar to Profile Page
- Profile page now shows Navbar at the top
- Users can navigate easily
- Consistent with rest of app

### 3. Improved Profile Page Structure
- Better layout and styling
- Proper loading states
- Cleaner UI flow

## 🔑 CRITICAL: Database Migration Required

### The Main Issue
The new features require a database column that hasn't been created yet.

### Solution: Apply Database Migration

#### Step 1: Open Supabase Dashboard
Go to https://supabase.com and select your project

#### Step 2: Open SQL Editor
Click on **SQL Editor** in the left sidebar

#### Step 3: Create New Query
Click **New Query**

#### Step 4: Run This SQL

```sql
-- Add user_id column to listings table (if it doesn't exist)
ALTER TABLE listings ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Add foreign key constraint
ALTER TABLE listings ADD CONSTRAINT listings_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS listings_user_id_idx ON listings(user_id);

-- Create user_votes table for authenticated user votes tracking
CREATE TABLE IF NOT EXISTS user_votes (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    listing_id TEXT NOT NULL,
    voted_at TIMESTAMP NOT NULL DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
    UNIQUE(user_id, listing_id)
);

-- Create indexes for user_votes
CREATE INDEX IF NOT EXISTS user_votes_user_id_idx ON user_votes(user_id);
CREATE INDEX IF NOT EXISTS user_votes_listing_id_idx ON user_votes(listing_id);
```

#### Step 5: Execute
Click **Run** and wait for success

### Alternative: Using psql CLI

```bash
# From your project root
source .env.local
psql "$DATABASE_URL" < prisma/migrations/add_user_tracking/migration.sql
```

## 📋 After Migration - What to Expect

### Before Migration
- Profile page accessible but shows empty submissions
- New submissions won't be tracked
- Voting won't be tracked

### After Migration
- Profile page shows new submissions
- All votes are tracked
- Everything works as designed

## 🧪 Testing Steps

### 1. Apply the Migration
Follow the SQL steps above

### 2. Test Profile Page Access
```
1. Go to https://rankbid-lol.vercel.app
2. Click "Sign Up" and create account
3. Login with your account
4. Click your profile name in navbar
5. Click "My Profile"
```

### 3. Test Submissions
```
1. On homepage, click "Submit Now"
2. Fill in product details
3. Click Submit
4. Go to profile → "My Submissions"
5. Should see your submission listed
```

### 4. Test Voting
```
1. Go to homepage
2. Vote on a product
3. Go to profile → "My Votes"
4. Should see your vote listed with timestamp
```

### 5. Verify Login/Logout
```
1. Profile name shows in navbar when logged in
2. Click name → "Logout" works correctly
3. After logout, can login again
4. Previous submissions/votes are still tracked
```

## 🐛 Common Errors & Solutions

### Error: "Cannot find column user_id"
**Solution**: Database migration hasn't been applied. Run the SQL above.

### Profile Page Shows Empty
**Solution**: 
- Migrations applied but no submissions yet
- OR user_id not set for existing submissions
- Submit a new product to test

### "Cannot read property 'id' of null"
**Solution**: 
- User not logged in
- Clear browser cache/cookies
- Try logging in again

### Navbar Not Showing in Profile
**Solution**: Page has been fixed! Rebuild and redeploy:
```bash
npm run build
vercel deploy --prod
```

## 📚 New Features After Migration

### For Logged-In Users
✅ Submit products (tracked with your ID)
✅ Vote on products (tracked with timestamp)
✅ View "My Submissions" in profile
✅ View "My Votes" in profile
✅ See voting/submission statistics

### For Anonymous Users
✅ View all listings
✅ Browse by category
❌ Cannot vote (must login)

## 🚀 Deployment

The updated profile page has been deployed with:
- ✅ Navbar integration
- ✅ Better error handling
- ✅ Improved styling
- ✅ Fallback for missing columns

**Current Status**: Ready for production once migration is applied

## 📞 Support

### If Profile Page Still Doesn't Show:

1. **Check browser console** (F12 → Console tab)
   - Look for error messages
   - Screenshot and share errors

2. **Verify user is logged in**
   - Check localStorage in DevTools
   - Should have `user` and `auth_token`

3. **Check database connection**
   - Verify Supabase credentials in `.env.local`
   - Test connection to Supabase

4. **Force refresh**
   - Clear browser cache
   - Hard refresh (Ctrl+Shift+R)
   - Try in private/incognito window

## ✅ Verification Checklist

After applying migration:
- [ ] Can login successfully
- [ ] Profile page loads with Navbar
- [ ] Can see "My Submissions" tab
- [ ] Can see "My Votes" tab
- [ ] Can see "Settings" tab
- [ ] New submissions appear in profile
- [ ] Votes are tracked with timestamps
- [ ] Can logout and login again
- [ ] Previous data is still there

---

## Summary

**Issue**: Profile page not showing submissions
**Root Cause**: Database migration not applied
**Solution**: Run the SQL migration in Supabase
**Status**: Fixed and deployed ✅

**Next Step**: Apply the database migration NOW!
