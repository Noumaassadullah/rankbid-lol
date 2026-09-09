# Supabase Integration Guide

Complete Supabase integration for RankBid with TypeScript support, server/client clients, and React hooks.

## Quick Start

### 1. Set Environment Variables

After provisioning Supabase via Vercel Marketplace, ensure these are in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"  # For server-side admin operations
```

Pull from Vercel:
```bash
vercel env pull --yes
```

### 2. Create Database Schema

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor** → **New Query**
3. Copy and paste contents of `supabase/schema.sql`
4. Click **Run**

### 3. Verify Connection

```bash
npm run dev
```

## Files Overview

### `client.ts` - Browser Client
Browser-side Supabase client for use in Client Components and browser-only operations.

```typescript
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();
const { data } = await supabase.from('listings').select('*');
```

### `server.ts` - Server Client
Server-side Supabase client for use in Server Components, API routes, and server actions. Includes:
- Automatic cookie handling for auth state
- `createClient()` - Standard authenticated client
- `createAdminClientInstance()` - Admin client for privileged operations

```typescript
import { createClient, createAdminClientInstance } from '@/utils/supabase/server';

// Standard client (respects user auth)
const supabase = await createClient();

// Admin client (bypasses RLS for admin operations)
const admin = createAdminClientInstance();
```

### `types.ts` - TypeScript Definitions
Auto-generated TypeScript types for complete database type safety.

Includes types for:
- `Database` - Main database interface
- `Tables` - All table definitions (users, listings)
- `Row`, `Insert`, `Update` - CRUD operation types

### `hooks.ts` - React Hooks
Client-side hooks for queries and mutations.

#### Query Hooks
- `useListings()` - Fetch active listings with filters
- `useUser()` - Fetch user profile by ID
- `useUserListings()` - Fetch user's own listings

#### Mutation Hooks
- `useCreateListing()` - Create new listing
- `useUpdateListing()` - Update existing listing
- `useDeleteListing()` - Delete listing
- `useUpdateUser()` - Update user profile

## Usage Examples

### Server Component (App Router)

```typescript
// app/listings/page.tsx
import { createClient } from '@/utils/supabase/server';

export default async function ListingsPage() {
  const supabase = await createClient();

  const { data: listings, error } = await supabase
    .from('listings')
    .select(`
      *,
      users:user_id (
        username,
        avatar_url,
        rating
      )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    return <div>Error loading listings</div>;
  }

  return (
    <div>
      {listings?.map(listing => (
        <div key={listing.id}>
          <h3>{listing.title}</h3>
          <p>{listing.description}</p>
          <span>PKR {listing.price}</span>
        </div>
      ))}
    </div>
  );
}
```

### Client Component with Query Hook

```typescript
// components/ListingsGrid.tsx
'use client';

import { useListings } from '@/utils/supabase/hooks';

export default function ListingsGrid() {
  const { listings, loading, error } = useListings({ 
    category: 'electronics',
    status: 'active'
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="grid grid-cols-3 gap-4">
      {listings.map(listing => (
        <div key={listing.id} className="border rounded p-4">
          <h3>{listing.title}</h3>
          <p className="text-gray-600">{listing.description}</p>
          <div className="mt-2 flex justify-between">
            <span className="font-bold">PKR {listing.price}</span>
            <span className="text-sm text-gray-500">{listing.views} views</span>
          </div>
        </div>
      ))}
    </div>
  );
}
```

### Client Component with Mutation Hook

```typescript
// components/CreateListingForm.tsx
'use client';

import { useState } from 'react';
import { useCreateListing } from '@/utils/supabase/hooks';

export default function CreateListingForm({ userId }: { userId: string }) {
  const { createListing, loading, error } = useCreateListing();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createListing({
        user_id: userId,
        title,
        description,
        price: parseFloat(price),
        category: 'general',
        location: 'Karachi',
      });
      // Reset form or redirect
    } catch (err) {
      console.error('Failed to create listing:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Listing title"
        required
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description"
        required
      />
      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        placeholder="Price (PKR)"
        required
      />
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Listing'}
      </button>
      {error && <div className="text-red-600">{error}</div>}
    </form>
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

  const { data: listings, error } = await supabase
    .from('listings')
    .select('*')
    .eq('status', 'active');

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

### Admin Operations (Server-Only)

```typescript
// app/api/admin/migrate-data/route.ts
import { createAdminClientInstance } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function POST() {
  // Only callable by authenticated admin
  const admin = createAdminClientInstance();

  // Bypass RLS policies
  const { data, error } = await admin
    .from('users')
    .select('*')
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ count: data?.length });
}
```

## Database Schema

### Users Table
| Column | Type | Required | Notes |
|--------|------|----------|-------|
| id | UUID | ✓ | Primary key |
| created_at | Timestamp | | Auto-set |
| updated_at | Timestamp | | Auto-update |
| email | Text | ✓ | Unique |
| username | Text | ✓ | Unique |
| full_name | Text | | Max 255 chars |
| avatar_url | Text | | URL to profile image |
| phone | Text | | 11-digit Pakistani format |
| city | Text | | User's location |
| country | Text | | Default: "Pakistan" |
| bio | Text | | User biography |
| rating | Numeric | | 0-5 stars (default: 0) |
| is_verified | Boolean | | Verified badge (default: false) |
| listings_count | Integer | | Cache count (default: 0) |

### Listings Table
| Column | Type | Required | Notes |
|--------|------|----------|-------|
| id | UUID | ✓ | Primary key |
| created_at | Timestamp | | Auto-set |
| updated_at | Timestamp | | Auto-update |
| user_id | UUID | ✓ | Foreign key to users |
| title | Text | ✓ | Listing name |
| description | Text | ✓ | Full description |
| category | Text | ✓ | Product category |
| price | Numeric | ✓ | In PKR |
| status | Text | | Options: active, sold, expired |
| image_url | Text | | Product image URL |
| location | Text | ✓ | Listing location |
| views | Integer | | Count (default: 0) |
| is_featured | Boolean | | Featured listing (default: false) |

## Row Level Security (RLS)

RLS policies enforce data access control:

### Users Table
- **SELECT** - Everyone can view all public user profiles
- **UPDATE** - Users can only update their own profile
- **INSERT** - Users can only create their own profile

### Listings Table
- **SELECT** - Everyone can view active listings; users can view their own listings
- **INSERT** - Users can create listings
- **UPDATE** - Users can update only their own listings
- **DELETE** - Users can delete only their own listings

## Performance Indexes

The schema creates indexes for:
- `listings.user_id` - Filter by user
- `listings.category` - Filter by category
- `listings.status` - Filter by status
- `listings.created_at` - Sort by date
- `users.email` - Authentication lookups

## Authentication

Supabase handles user authentication separately. To integrate with Supabase Auth:

1. Enable desired auth providers in Supabase dashboard
2. Use Supabase Auth library for sign-up/login
3. The RLS policies will automatically restrict access based on `auth.uid()`

## Error Handling

All hooks and clients return error objects. Handle them:

```typescript
const { data, error } = await supabase.from('listings').select('*');

if (error) {
  console.error('Error code:', error.code);
  console.error('Error message:', error.message);
  // Handle based on error type
}
```

## Environment Variables Reference

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL              # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY         # Anon key for browser client

# Server-side only (not exposed to browser)
SUPABASE_SERVICE_ROLE_KEY             # Admin access key

# Optional - already provided by Vercel
DATABASE_URL                          # Direct PostgreSQL connection (not needed)
```

## Troubleshooting

### "Connection refused"
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Check internet connection
- Ensure Supabase project is active

### "RLS policy denies access"
- Make sure you're authenticated for operations requiring auth
- Check RLS policies in Supabase dashboard
- Verify user ID matches in database

### "No environment variables found"
- Run `vercel env pull --yes`
- Check `.env.local` has variables
- Ensure they're also in Vercel project settings

### TypeScript errors with database types
- Ensure `types.ts` matches your schema
- Generate fresh types from Supabase CLI (if schema was updated):
  ```bash
  npx supabase gen types typescript \
    --project-id your-project-id \
    --schema public > app/utils/supabase/types.ts
  ```

## Advanced Features

### Subscriptions (Real-time Updates)

```typescript
const channel = supabase
  .channel('listings-changes')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'listings' },
    (payload) => console.log('New listing:', payload.new)
  )
  .subscribe();

// Cleanup
await supabase.removeChannel(channel);
```

### Joins and Relations

```typescript
const { data } = await supabase
  .from('listings')
  .select(`
    *,
    users!user_id (
      username,
      avatar_url,
      rating,
      is_verified
    )
  `)
  .eq('status', 'active');
```

## Documentation Links

- [Supabase Documentation](https://supabase.com/docs)
- [JavaScript Client Reference](https://supabase.com/docs/reference/javascript)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)
