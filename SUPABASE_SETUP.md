# Supabase Integration Setup Guide for RankBid

## Overview

Supabase has been provisioned through Vercel Marketplace. This guide walks you through completing the setup and getting your database ready for the RankBid platform.

## Step 1: Access Your Supabase Project

### Option A: Via Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on your **rankbid-lol** project
3. Navigate to **Integrations** → **Supabase**
4. Click **"Open in Supabase"** to access your project dashboard

### Option B: Direct Supabase Link
1. Visit [Supabase Dashboard](https://app.supabase.com)
2. Sign in with your account
3. Your project should appear in the list (provisioned: `supabase-sky-leaf`)

## Step 2: Get Your API Credentials

1. In Supabase dashboard, go to **Settings** → **API**
2. You'll see:
   - **Project URL** - This is your `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon public key** - This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service role secret** - This is your `SUPABASE_SERVICE_ROLE_KEY`

3. Copy these values

## Step 3: Set Environment Variables

These should be automatically set by Vercel, but if they're missing:

### For Vercel Production/Preview:
1. Go to your Vercel project **Settings** → **Environment Variables**
2. Add:
   ```
   NEXT_PUBLIC_SUPABASE_URL = [your project URL]
   NEXT_PUBLIC_SUPABASE_ANON_KEY = [your anon key]
   SUPABASE_SERVICE_ROLE_KEY = [your service role key]
   ```

### For Local Development:
Your `.env.local` should have:
```bash
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

## Step 4: Create Database Schema

1. In Supabase dashboard, navigate to **SQL Editor**
2. Click **"New Query"**
3. Copy the entire contents of `supabase/schema.sql`
4. Paste into the SQL editor
5. Click **"Run"** button

This creates:
- ✅ `users` table - User profiles and account data
- ✅ `listings` table - Marketplace listings
- ✅ Indexes for performance
- ✅ Row Level Security (RLS) policies

## Step 5: Enable Authentication (Optional)

For user signup/login features:

1. Go to **Authentication** → **Providers** in Supabase
2. Enable desired auth methods:
   - **Email** - Basic email/password
   - **Google** - OAuth via Google
   - **GitHub** - OAuth via GitHub
   - etc.

3. Configure OAuth credentials if using social login

## Step 6: Test the Connection

Run this command to verify environment variables are loaded:

```bash
npm run dev
```

Then create a test page:

```typescript
// app/test-supabase/page.tsx
import { createClient } from '@/utils/supabase/server';

export default async function TestPage() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase.from('users').select('count');
    
    if (error) throw error;
    
    return <div>✅ Connection successful! Users count: {data}</div>;
  } catch (error) {
    return <div>❌ Error: {error instanceof Error ? error.message : 'Unknown error'}</div>;
  }
}
```

Visit `http://localhost:3000/test-supabase` to verify the connection works.

## Step 7: Update TypeScript Types (Optional)

For full TypeScript support, you can generate types from your Supabase schema:

```bash
npx supabase gen types typescript --project-id your-project-id --schema public > app/utils/supabase/types.ts
```

This generates exact types matching your database schema.

## Project Structure

```
app/
├── utils/supabase/
│   ├── client.ts          # Browser-side client
│   ├── server.ts          # Server-side client
│   ├── types.ts           # TypeScript types
│   ├── hooks.ts           # React hooks (useListings, useUser, etc.)
│   └── README.md          # Detailed documentation
└── ...

supabase/
└── schema.sql             # Database schema and RLS policies
```

## Usage Examples

### Server Component (App Router)
```typescript
import { createClient } from '@/utils/supabase/server';

export default async function MyPage() {
  const supabase = await createClient();
  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    .eq('status', 'active');

  return <div>{/* Render listings */}</div>;
}
```

### Client Component
```typescript
'use client';

import { useListings } from '@/utils/supabase/hooks';

export default function ListingsGrid() {
  const { listings, loading, error } = useListings({ category: 'electronics' });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {listings.map(listing => (
        <div key={listing.id}>{listing.title}</div>
      ))}
    </div>
  );
}
```

### API Route
```typescript
// app/api/listings/route.ts
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('listings')
    .select('*');

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
```

## Database Schema Overview

### Users Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| email | Text | User email (unique) |
| username | Text | Username (unique) |
| full_name | Text | Full name |
| avatar_url | Text | Profile picture URL |
| phone | Text | Phone number |
| city | Text | City location |
| country | Text | Country (default: Pakistan) |
| bio | Text | User biography |
| rating | Numeric | User rating/reputation |
| is_verified | Boolean | Verification status |
| listings_count | Integer | Number of active listings |

### Listings Table
| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key to users |
| title | Text | Listing title |
| description | Text | Detailed description |
| category | Text | Product category |
| price | Numeric | Listing price |
| status | Text | active, sold, expired |
| image_url | Text | Product image URL |
| location | Text | Listing location |
| views | Integer | Number of views |
| is_featured | Boolean | Featured status |

## Row Level Security (RLS)

The schema includes RLS policies for data security:

**Users:**
- ✅ Public profiles visible to all
- ✅ Users can update only their own profile

**Listings:**
- ✅ Active listings visible to all
- ✅ Users can view their own listings (including drafts)
- ✅ Users can only CRUD their own listings

## Troubleshooting

### "No environment variables found"
- Run `vercel link` to link your project
- Run `vercel env pull` to download variables
- Check `.env.local` has the variables

### "Connection refused"
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check internet connection
- Verify Supabase project is active

### "RLS policy denies access"
- Make sure you're authenticated for operations requiring auth
- Check the RLS policies in Supabase dashboard
- Verify user ID matches the `user_id` in tables

### Supabase dashboard shows no tables
- Go to **SQL Editor** in Supabase
- Run the schema.sql file again
- Verify no errors in the execution

## Next Steps

1. ✅ Create database schema (schema.sql)
2. ✅ Set environment variables
3. ✅ Create API routes for listings CRUD
4. ✅ Create API routes for user authentication
5. ✅ Update UI components to use Supabase
6. ✅ Test with real data

## Useful Links

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Auth Helpers for Next.js](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)

## Support

For questions or issues:
- Check Supabase docs: https://supabase.com/docs
- GitHub Issues: https://github.com/supabase/supabase/issues
- RankBid Documentation: (Add your docs link)
