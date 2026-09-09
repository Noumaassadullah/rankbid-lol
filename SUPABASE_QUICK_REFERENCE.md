# Supabase Integration - Quick Reference

Complete Supabase setup with production-ready utilities. Optimized for free tier.

## ✅ What's Ready

- **Clients** - Browser (`client.ts`) & Server (`server.ts`) with TypeScript
- **Hooks** - Query hooks (useListings, useUser) and mutation hooks (create, update, delete)
- **Types** - Full TypeScript support for database schema
- **Schema** - `supabase/schema.sql` with indexes and RLS policies
- **API Examples** - `app/api/examples/` with CRUD examples
- **Documentation** - Complete setup guides and usage examples

## 🚀 Next Steps (In Order)

### 1. Provision Supabase (5 minutes)

**If not done yet:**
```bash
# Link project to Vercel (if not linked)
vercel link

# Add Supabase integration
vercel integration add supabase
# → Follow OAuth flow in browser to connect Supabase account
# → Select region (closest to your users)
# → Create project
```

**Or manually:**
- Go to https://app.supabase.com
- Create new project
- Save your **Project URL** and **API Key**

### 2. Configure Environment (5 minutes)

```bash
# Pull environment variables from Vercel
vercel env pull --yes

# Verify .env.local has:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - SUPABASE_SERVICE_ROLE_KEY
```

### 3. Create Database Schema (2 minutes)

1. Go to Supabase Dashboard
2. Click **SQL Editor** → **New Query**
3. Copy contents of `supabase/schema.sql`
4. Paste into editor and click **Run**

### 4. Test Connection (2 minutes)

```bash
# Start dev server
npm run dev

# Visit http://localhost:3000/test-supabase
# Should see "✅ Supabase connected!"
```

### 5. Start Building

Use the utilities in your components:

**Server Component:**
```typescript
import { createClient } from '@/utils/supabase/server';

export default async function Page() {
  const supabase = await createClient();
  const { data: listings } = await supabase
    .from('listings')
    .select('*')
    .eq('status', 'active');
  
  return <div>{/* render */}</div>;
}
```

**Client Component:**
```typescript
'use client';

import { useListings } from '@/utils/supabase/hooks';

export default function Listings() {
  const { listings, loading, error } = useListings();
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <div>{listings.map(l => <div key={l.id}>{l.title}</div>)}</div>;
}
```

## 📁 File Structure

```
app/
├── utils/supabase/
│   ├── client.ts           # Browser client (for Client Components)
│   ├── server.ts           # Server client (for Server Components/API routes)
│   │                        # + createAdminClientInstance() for admin ops
│   ├── types.ts            # TypeScript database types
│   ├── hooks.ts            # React hooks for queries & mutations
│   └── README.md           # Detailed usage documentation
│
└── api/examples/
    ├── listings-example/   # Example CRUD API routes
    └── users-example/      # Example user management

supabase/
└── schema.sql              # Database schema with RLS policies
```

## 🔧 Common Tasks

### Fetch Listings (Read)
```typescript
const { data: listings } = await supabase
  .from('listings')
  .select('*')
  .eq('status', 'active')
  .order('created_at', { ascending: false });
```

### Create Listing (Write)
```typescript
const { createListing } = useCreateListing();

await createListing({
  user_id: userId,
  title: 'iPhone 15',
  description: 'Great condition',
  price: 150000,
  category: 'electronics',
  location: 'Karachi',
});
```

### Update Listing
```typescript
const { updateListing } = useUpdateListing();

await updateListing(listingId, {
  title: 'iPhone 15 Pro',
  price: 200000,
});
```

### Delete Listing
```typescript
const { deleteListing } = useDeleteListing();

await deleteListing(listingId);
```

## 🎯 Database Schema Summary

### Users Table
- **id, email, username** (unique identifiers)
- **full_name, avatar_url, phone, city, bio** (profile)
- **rating, is_verified, listings_count** (stats)

### Listings Table
- **id, user_id** (identifiers)
- **title, description, category, price** (content)
- **status** (active, sold, expired)
- **location, image_url, views, is_featured** (metadata)

**Indexes:** user_id, category, status, created_at, email
**Security:** Row Level Security (RLS) policies enabled

## ⚡ Free Tier Optimizations

Supabase free tier includes 500MB storage and 5 concurrent connections:

- ✅ **Don't store images** - Use external URLs (Vercel Blob, Cloudinary)
- ✅ **Paginate queries** - Limit to 20-100 rows per request
- ✅ **Archive old data** - Delete expired listings after 90 days
- ✅ **Monitor usage** - Check Supabase Dashboard → Usage weekly
- ✅ **Use indexes** - Already optimized in schema.sql

## 📚 Documentation

- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Complete setup guide
- **[app/utils/supabase/README.md](./app/utils/supabase/README.md)** - Usage guide with examples
- **[Supabase Docs](https://supabase.com/docs)** - Official documentation
- **[Example API Routes](./app/api/examples/)** - Real-world code samples

## 🐛 Troubleshooting

### "Environment variables not found"
```bash
vercel env pull --yes
# Restart: npm run dev
```

### "Connection refused"
- Check `NEXT_PUBLIC_SUPABASE_URL` is correct
- Verify Supabase project is active
- Check internet connection

### "RLS policy denies access"
- Make sure user is authenticated
- Verify user ID matches in database
- Check RLS policies in Supabase dashboard

### "TypeScript errors"
- Regenerate types from schema:
```bash
npx supabase gen types typescript \
  --project-id your-project-id \
  --schema public > app/utils/supabase/types.ts
```

## 🔐 Security Notes

- **Anon Key** - Public, use in browser (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- **Service Role Key** - Private, server-only (`SUPABASE_SERVICE_ROLE_KEY`)
- **RLS Enabled** - Data access controlled by user ID
- **No secrets** - Never commit `.env.local` or API keys

## 📊 Useful Commands

```bash
# Pull latest environment variables
vercel env pull --yes

# Start development server
npm run dev

# Build for production
npm run build

# Check Supabase usage
# → Supabase Dashboard → Usage tab

# Run migrations (if needed)
npm run db:migrate
```

## ✨ What's Next?

1. **Set up authentication** (Google/GitHub OAuth)
2. **Build listing pages** (use `useListings()` hook)
3. **Create user profiles** (use `useUser()` hook)
4. **Add image uploads** (external storage like Vercel Blob)
5. **Implement search** (add PostgreSQL full-text search)
6. **Monitor performance** (Supabase Reports → Slow Queries)

## 💡 Tips

- Server Components are faster - use them when possible
- Cache frequently accessed data with Next.js ISR/SWR
- Use SQL joins to avoid N+1 queries
- Implement pagination for large datasets
- Monitor storage and upgrade to Pro if needed

---

**Last Updated:** 2026-09-10
**Status:** ✅ Production Ready
**Optimized for:** Supabase Free Tier
