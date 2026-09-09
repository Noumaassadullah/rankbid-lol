# Supabase Integration Setup Guide for RankBid

Complete guide for setting up Supabase as the database backend for RankBid through Vercel Marketplace.

## Table of Contents

1. [Overview](#overview)
2. [Step 1: Provision via Vercel Marketplace](#step-1-provision-via-vercel-marketplace)
3. [Step 2: Get API Credentials](#step-2-get-api-credentials)
4. [Step 3: Configure Environment Variables](#step-3-configure-environment-variables)
5. [Step 4: Create Database Schema](#step-4-create-database-schema)
6. [Step 5: Enable Authentication](#step-5-enable-authentication)
7. [Step 6: Test the Connection](#step-6-test-the-connection)
8. [Project Structure](#project-structure)
9. [Database Schema Reference](#database-schema-reference)
10. [Troubleshooting](#troubleshooting)

## Overview

RankBid uses Supabase (PostgreSQL-based backend) for data persistence. The integration includes:

- ✅ **Database** - PostgreSQL via Supabase
- ✅ **Client Utilities** - TypeScript-safe Supabase clients
- ✅ **React Hooks** - Query and mutation hooks
- ✅ **Type Safety** - Generated TypeScript types from schema
- ✅ **Row Level Security** - Built-in data access control
- ✅ **Authentication Ready** - Support for Supabase Auth providers

## Step 1: Provision via Vercel Marketplace

### Automatic Provisioning (Recommended)

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Select your **rankbid-lol** project

2. **Add Integration**
   - Go to **Settings** → **Integrations** (or **Storage** tab)
   - Search for "Supabase"
   - Click **Add**

3. **Connect Supabase Account**
   - Sign in with your Supabase account (create one at https://supabase.com if needed)
   - Authorize Vercel to manage your Supabase project
   - Select a region (recommended: closest to your users)
   - Click **Create & Connect**

### Manual Provisioning

If automatic fails, create a project directly:

1. Go to https://app.supabase.com
2. Click **New project**
3. Fill in:
   - **Name**: rankbid-lol
   - **Database password**: Save securely (you'll need it later)
   - **Region**: Select closest to your users
4. Click **Create new project** and wait (5-10 minutes)

## Step 2: Get API Credentials

1. **Open Supabase Project Dashboard**
   - Via Vercel: Dashboard → Project → Integrations → Open in Supabase
   - Or direct: https://app.supabase.com

2. **Navigate to API Settings**
   - Click **Settings** (⚙️) in left sidebar
   - Select **API** tab

3. **Copy Your Credentials**
   You'll need:
   ```
   Project URL          → NEXT_PUBLIC_SUPABASE_URL
   Anon public key      → NEXT_PUBLIC_SUPABASE_ANON_KEY
   Service role secret  → SUPABASE_SERVICE_ROLE_KEY
   ```

## Step 3: Configure Environment Variables

### For Local Development

1. **Update `.env.local`** (create if it doesn't exist)
   ```bash
   NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGc..."
   SUPABASE_SERVICE_ROLE_KEY="eyJhbGc..."
   ```

2. **Or pull from Vercel** (if already provisioned)
   ```bash
   vercel env pull --yes
   ```

### For Production (Vercel)

Vercel automatically sets environment variables when you provision via Marketplace. Verify they're set:

1. Go to Vercel Project → **Settings** → **Environment Variables**
2. Confirm these exist:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

If missing, add them manually from your Supabase API settings.

### Free Tier Considerations

Supabase free tier includes:
- **500 MB** database storage
- **2 CPU cores** (shared)
- **5 concurrent** connections
- **No project pause** for inactivity

To optimize for free tier:
- Keep image URLs external (use Vercel Blob or similar)
- Archive old listings periodically
- Use indexes strategically (already optimized in schema)
- Monitor storage in Supabase dashboard → **Usage**

## Step 4: Create Database Schema

1. **Open Supabase SQL Editor**
   - Go to your Supabase dashboard
   - Click **SQL Editor** (in left sidebar)
   - Click **New Query** (or create new file)

2. **Copy Schema SQL**
   - Open `supabase/schema.sql` in your project
   - Copy the entire contents

3. **Execute the Schema**
   - Paste into the SQL Editor
   - Click **Run** (or press `Ctrl+Enter`)
   - Wait for success notification

4. **Verify Tables Created**
   - Click **Table Editor** in left sidebar
   - You should see:
     - `users` table with 12 columns
     - `listings` table with 11 columns

### What the Schema Creates

```
Database Schema
├── users table
│   ├── id, email, username (unique)
│   ├── Profile: full_name, avatar_url, phone, city, country, bio
│   ├── Stats: rating, is_verified, listings_count
│   └── Indexes for email lookups
│
├── listings table
│   ├── id, user_id (foreign key)
│   ├── Content: title, description, category, price
│   ├── Metadata: status, image_url, location, views, is_featured
│   └── Indexes for user, category, status, date filtering
│
└── Row Level Security (RLS)
    ├── Users: public profiles, self-edit only
    └── Listings: active public, users see own
```

## Step 5: Enable Authentication (Optional)

To enable user sign-up/login with Supabase Auth:

1. **Navigate to Authentication**
   - In Supabase dashboard, click **Authentication** (left sidebar)
   - Go to **Providers** tab

2. **Enable Auth Methods**
   - **Email/Password** - Basic auth (recommended for MVP)
   - **Google** - OAuth (requires Google Cloud credentials)
   - **GitHub** - OAuth (requires GitHub OAuth app)
   - **Phone** - SMS verification (paid add-on)

3. **Configure Email Provider**
   - Click **Email** → **Enable**
   - Use Supabase's default email (testing) or add SMTP (production)

4. **Configure OAuth Providers** (if desired)
   - Click provider (e.g., **Google**)
   - Get Client ID and Secret from provider's console
   - Paste credentials and save

## Step 6: Test the Connection

### Quick Test

1. **Start development server**
   ```bash
   npm run dev
   ```

2. **Create test page** (`app/test-supabase/page.tsx`)
   ```typescript
   import { createClient } from '@/utils/supabase/server';

   export default async function TestPage() {
     try {
       const supabase = await createClient();
       const { data, error } = await supabase.from('users').select('count');
       
       if (error) throw error;
       
       return <div>✅ Supabase connected!</div>;
     } catch (error) {
       return <div>❌ Error: {error instanceof Error ? error.message : 'Unknown'}</div>;
     }
   }
   ```

3. **Visit** http://localhost:3000/test-supabase

### Full Feature Test

1. Create a listing (POST)
2. Read all listings (GET)
3. Update a listing (PATCH)
4. Delete a listing (DELETE)
5. Query with filters (WHERE, ORDER BY)

## Project Structure

```
rankbid-lol/
├── app/
│   ├── utils/supabase/
│   │   ├── client.ts           # Browser client
│   │   ├── server.ts           # Server client + admin client
│   │   ├── types.ts            # TypeScript types
│   │   ├── hooks.ts            # React hooks (Query + Mutation)
│   │   └── README.md           # Detailed usage guide
│   │
│   └── api/
│       └── listings/
│           └── route.ts        # Example API routes
│
├── supabase/
│   └── schema.sql              # Database schema definition
│
├── SUPABASE_SETUP.md          # This file
├── .env.example               # Environment template
└── .env.local                 # Local environment variables (git ignored)
```

## Database Schema Reference

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  city TEXT,
  country TEXT DEFAULT 'Pakistan',
  bio TEXT,
  rating NUMERIC DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  listings_count INTEGER DEFAULT 0
);
```

**Indexes:**
- `idx_users_email` - For authentication lookups

### Listings Table

```sql
CREATE TABLE listings (
  id UUID PRIMARY KEY,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'expired')),
  image_url TEXT,
  location TEXT NOT NULL,
  views INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT false
);
```

**Indexes:**
- `idx_listings_user_id` - Filter by user
- `idx_listings_category` - Filter by category
- `idx_listings_status` - Filter by status
- `idx_listings_created_at` - Sort by date

### Row Level Security Policies

**Users Table:**
```
SELECT: true (all users visible)
UPDATE: auth.uid() = id (self-edit only)
INSERT: auth.uid() = id (self-create only)
DELETE: DISABLED (no deletions)
```

**Listings Table:**
```
SELECT: status = 'active' OR user_id = auth.uid()
INSERT: user_id = auth.uid()
UPDATE: user_id = auth.uid()
DELETE: user_id = auth.uid()
```

## Usage Examples

### Query Data (Server Component)

```typescript
import { createClient } from '@/utils/supabase/server';

export default async function Page() {
  const supabase = await createClient();

  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  return <div>{/* render listings */}</div>;
}
```

### Query Data (Client Component)

```typescript
'use client';

import { useListings } from '@/utils/supabase/hooks';

export default function MyComponent() {
  const { listings, loading, error } = useListings({ category: 'electronics' });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return <div>{listings.map(l => <div key={l.id}>{l.title}</div>)}</div>;
}
```

### Mutate Data (Client Component)

```typescript
'use client';

import { useCreateListing } from '@/utils/supabase/hooks';

export default function CreateForm({ userId }: { userId: string }) {
  const { createListing, loading, error } = useCreateListing();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createListing({
        user_id: userId,
        title: 'iPhone 15',
        description: 'Great condition',
        price: 150000,
        category: 'electronics',
        location: 'Karachi',
      });
    } catch (err) {
      console.error('Failed:', err);
    }
  };

  return <form onSubmit={handleSubmit}>{/* form fields */}</form>;
}
```

### API Route

```typescript
// app/api/listings/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();

  const { data: listings, error } = await supabase
    .from('listings')
    .select('*');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(listings);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from('listings')
    .insert([body])
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
```

## Troubleshooting

### Environment Variables Not Found

**Error:** `Cannot read properties of undefined (reading NEXT_PUBLIC_SUPABASE_URL)`

**Solutions:**
1. Run `vercel env pull --yes` to download from Vercel
2. Check `.env.local` has all three variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Restart dev server: `npm run dev`
4. Check Vercel project settings for environment variables

### Connection Refused

**Error:** `TypeError: fetch failed` or `ECONNREFUSED`

**Solutions:**
1. Verify `NEXT_PUBLIC_SUPABASE_URL` is correct:
   ```bash
   echo $NEXT_PUBLIC_SUPABASE_URL
   ```
2. Check Supabase project is active (not paused)
3. Verify internet connection
4. Try accessing Supabase URL directly in browser

### RLS Policy Denies Access

**Error:** `new row violates row-level security policy` or `permission denied`

**Solutions:**
1. Make sure you're authenticated (have valid session)
2. Check the operation matches RLS policy:
   - INSERT listings: must have `user_id = your-user-id`
   - UPDATE listings: must own the listing
   - DELETE listings: must own the listing
3. View RLS policies in Supabase dashboard → **Authentication** → **Policies**

### TypeScript Errors

**Error:** `Cannot find type 'Database'` or missing table types

**Solutions:**
1. Ensure `types.ts` exists and exports `Database` interface
2. Regenerate types if schema changed:
   ```bash
   npx supabase gen types typescript \
     --project-id your-project-id \
     --schema public > app/utils/supabase/types.ts
   ```
3. Check `tsconfig.json` has correct path aliases

### Tables Not Visible in Dashboard

**Error:** No tables appear in Supabase SQL Editor

**Solutions:**
1. Go to **SQL Editor** in Supabase
2. Re-run `supabase/schema.sql` in a new query
3. Check for error messages in the query results
4. Go to **Table Editor** to verify tables exist
5. Check that you're in the right database/schema (public)

### Slow Queries

**Solutions:**
1. Verify indexes are created (check schema.sql was fully executed)
2. Use EXPLAIN ANALYZE in SQL Editor:
   ```sql
   EXPLAIN ANALYZE
   SELECT * FROM listings WHERE status = 'active' ORDER BY created_at DESC;
   ```
3. Add missing indexes for frequently filtered columns
4. Monitor query performance in Supabase dashboard → **Reports**

## Free Tier Best Practices

Working within Supabase's free tier limits:

### Database Storage (500 MB)
- Keep image URLs external (don't store images as blobs)
- Archive or delete expired listings regularly
- Avoid storing duplicate data
- Monitor usage: Supabase Dashboard → **Usage** tab

### Connections (5 concurrent)
- Use connection pooling (built-in for Next.js)
- Close connections properly (SDK handles this)
- Avoid keeping long-lived connections

### Performance
- Use indexes (already included in schema)
- Avoid N+1 queries (use joins instead)
- Cache frequently accessed data (implement in Next.js)
- Monitor slow queries in Supabase → **Reports**

### Rate Limiting
- Free tier has rate limits per minute
- Implement exponential backoff in API routes
- Use Next.js ISR/SWR for caching

### Optimization Checklist
- ✅ Store images externally (Vercel Blob, Cloudinary, etc.)
- ✅ Use query pagination for large datasets
- ✅ Archive old listings after 90 days
- ✅ Monitor storage usage weekly
- ✅ Use server-side rendering where possible
- ✅ Implement data cleanup tasks (background jobs)

### Upgrade Path
When you outgrow free tier:
1. **Pro tier** - $25/month for increased storage/connections
2. **Team tier** - Custom pricing for enterprise needs

## Next Steps

1. ✅ **Provision Supabase** via Vercel Marketplace
2. ✅ **Configure environment variables** (local + Vercel)
3. ✅ **Create database schema** (run schema.sql)
4. ✅ **Test connection** (visit test page)
5. 📝 **Build API routes** for CRUD operations
6. 📝 **Create UI components** using hooks
7. 📝 **Set up authentication** (if needed)
8. 📝 **Deploy to production** (automatic via Vercel)
9. 📝 **Monitor free tier usage** (weekly checks)

## Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [JavaScript Client Reference](https://supabase.com/docs/reference/javascript)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
- [Vercel Supabase Integration](https://vercel.com/integrations/supabase)

## Support

For questions or issues:
- **Supabase Docs**: https://supabase.com/docs
- **GitHub Issues**: https://github.com/supabase/supabase/issues
- **Vercel Support**: https://vercel.com/support
- **Project Documentation**: Check `app/utils/supabase/README.md` for detailed usage

---

**Last Updated:** 2026-09-10
**Status:** Production Ready ✅
