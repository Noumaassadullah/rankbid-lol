# Supabase Integration Setup

This directory contains Supabase client utilities for RankBid.

## Files

- **client.ts** - Browser/client-side Supabase client for use in Client Components and the browser
- **server.ts** - Server-side Supabase client for use in Server Components and API routes
- **types.ts** - TypeScript types for the Supabase database schema

## Setup Instructions

### 1. Configure Environment Variables

Add these environment variables to your `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key  # For server-side operations
```

These are automatically set via the Vercel integration, but you can also get them from:
1. Visit your Supabase project dashboard
2. Go to **Settings** → **API**
3. Copy the URL and Anon Key

### 2. Create Database Schema

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `supabase/schema.sql`
5. Click **Run** to execute

This will create:
- `users` table with user profiles
- `listings` table with marketplace listings
- Proper indexes for performance
- Row Level Security (RLS) policies

### 3. Enable Authentication (Optional)

If you want to enable Supabase authentication:

1. Go to **Authentication** → **Providers** in Supabase
2. Enable desired providers (Google, GitHub, etc.)
3. Configure OAuth credentials if needed

## Usage Examples

### Client-Side Usage (Client Component)

```typescript
import { createClient } from '@/utils/supabase/client';

export default function MyComponent() {
  const supabase = createClient();

  async function getListings() {
    const { data, error } = await supabase
      .from('listings')
      .select('*')
      .eq('status', 'active');
    
    if (error) console.error(error);
    return data;
  }

  // ... rest of component
}
```

### Server-Side Usage (Server Component)

```typescript
import { createClient } from '@/utils/supabase/server';

export default async function Page() {
  const supabase = await createClient();

  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      {listings?.map(listing => (
        <div key={listing.id}>{listing.title}</div>
      ))}
    </div>
  );
}
```

### API Route Usage

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
```

## Database Schema

### Users Table
- `id` - UUID primary key
- `email` - Unique email address
- `username` - Unique username
- `full_name` - User's full name
- `avatar_url` - Profile picture URL
- `phone` - Contact number
- `city` - City location
- `country` - Country (default: Pakistan)
- `bio` - User biography
- `rating` - User rating/reputation
- `is_verified` - Verification status
- `listings_count` - Number of active listings

### Listings Table
- `id` - UUID primary key
- `user_id` - Foreign key to users table
- `title` - Listing title
- `description` - Detailed description
- `category` - Product category
- `price` - Listing price
- `status` - active, sold, or expired
- `image_url` - Product image
- `location` - Listing location
- `views` - Number of views
- `is_featured` - Featured status

## Row Level Security (RLS)

RLS policies are enabled for data security:

**Users:**
- All users can view public profiles
- Users can only update their own profile

**Listings:**
- Everyone can view active listings
- Users can view their own listings (even if not active)
- Users can only create/update/delete their own listings

## Support

For more information, visit:
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client Docs](https://supabase.com/docs/reference/javascript)
