# Premium Listings Feature - Setup & Overview

## What's Implemented

A complete **paid premium listing feature** for RankBid that lets users pay to feature their products at positions #1, #2, or #3 with founder information displayed.

## Pricing
- **Position #1**: $5 (top placement)
- **Position #2**: $3 (second placement)
- **Position #3**: $1 (third placement)

## How Users Use It

1. Submit a product listing (free, as usual)
2. Click the ⭐ star button on the listing card
3. Fill in founder info: name, email, phone, social accounts (8 options)
4. Select premium position (#1, #2, or #3)
5. Submit payment request
6. Admin approves payment
7. Listing appears at top with founder details visible

## How Admins Manage It

1. Visit `/admin/premium-listings`
2. Enter admin key (set in environment variables)
3. View pending premium listing requests
4. Review founder info and payment details
5. Click "Approve" or "Reject"
6. Once approved, listing goes live with premium styling

## Key Features

✅ **Premium Badge** - Shows "PREMIUM #1/2/3" badge on featured listings  
✅ **Founder Display** - Name, email, phone, and 8 social accounts  
✅ **Permanent Placement** - One-time payment, never expires  
✅ **Vote-Based Sorting** - Votes still affect ranking (can push down)  
✅ **Manual Verification** - Admin verifies payment before approval  
✅ **Beautiful UI** - Gradient card design with founder info showcase  

## Database Schema

New table `premium_listings`:
```
- id (primary key)
- listing_id (links to listings)
- founder_name, founder_email, founder_phone
- 8 social account fields
- position (1, 2, or 3)
- amount_paid ($)
- payment_status (pending/approved/rejected)
- created_at, approved_at, approved_by
```

## API Endpoints

### User Endpoints

**POST /api/listings/premium** - Submit premium listing request
```json
{
  "listingId": "uuid",
  "position": 1,
  "founderName": "John Doe",
  "founderEmail": "john@example.com",
  "founderPhone": "+92 300 1234567",
  "founderWebsite": "https://...",
  "founderTwitter": "@handle",
  "founderLinkedin": "https://...",
  "founderInstagram": "@handle",
  "founderFacebook": "https://...",
  "founderTiktok": "@handle",
  "founderYoutube": "https://...",
  "founderGithub": "@username",
  "paymentMethod": "manual"
}
```

**GET /api/listings/premium?listingId=uuid** - Check premium status

### Admin Endpoints

**GET /api/admin/premium-listings?status=pending** - List premium requests  
Requires: `x-admin-key` header

**PATCH /api/admin/premium-listings** - Approve/reject premium listing  
Requires: `x-admin-key` header
```json
{
  "premiumListingId": "premium_...",
  "status": "approved|rejected",
  "approvedBy": "admin@example.com"
}
```

## Setup Steps

### 1. Run Database Migration

```bash
cd /path/to/rankbid-lol
psql -d rankbid -f supabase/migrations/add_premium_listings.sql
```

Or if using Supabase CLI:
```bash
supabase db push
```

### 2. Set Environment Variable

Add to `.env.local`:
```
ADMIN_KEY=your-secure-admin-key-here
```

### 3. Test the Feature

1. Go to homepage
2. Submit a product listing (free)
3. Click ⭐ on the listing
4. Fill form and submit
5. Go to `/admin/premium-listings`
6. Enter admin key
7. Click "Approve" on the pending request
8. Go back to homepage - should see premium listing at top!

## Files Added/Modified

### New Files
- `app/api/listings/premium/route.ts` - Premium submission endpoint
- `app/api/admin/premium-listings/route.ts` - Admin approval endpoint
- `components/PremiumListingCard.tsx` - Premium listing card UI
- `components/PremiumListingModal.tsx` - Premium submission form
- `app/admin/premium-listings/page.tsx` - Admin dashboard
- `supabase/migrations/add_premium_listings.sql` - Database schema
- `docs/PREMIUM_LISTINGS.md` - Detailed documentation

### Modified Files
- `app/page.tsx` - Added premium section, star button, modal
- `app/api/listings/submit/route.ts` - Updated to include premium listings

## How Voting Works with Premium

- Premium listings still have vote counts
- Votes can push premium listings down (they're not locked at #1)
- If a non-premium listing gets more votes than a premium one, it can pass it
- Premium status is permanent; only votes determine final ranking

## Payment Verification Workflow

Since manual approval is enabled:

1. **User submits** - Premium request created as "pending"
2. **Admin verifies** - Admin checks if payment received (email, bank, etc.)
3. **Admin approves** - Listing status changes to "approved"
4. **Listing goes live** - Premium listing appears on leaderboard
5. **Reject if needed** - Admin can reject if payment not received

## Customization

### Change Prices
Edit `PRICES` in `components/PremiumListingModal.tsx`:
```typescript
const PRICES: { [key: number]: number } = {
  1: 5,    // $5 for position 1
  2: 3,    // $3 for position 2
  3: 1,    // $1 for position 3
};
```

### Add/Remove Social Accounts
Edit social fields array in `components/PremiumListingModal.tsx`:
```typescript
{ name: 'founderNewField', label: 'New Social', placeholder: '...' }
```

### Change Admin Key
Set different value in `.env.local`:
```
ADMIN_KEY=your-very-secure-key-here
```

## Future Enhancements

- 💳 Automated Stripe payment integration
- 📧 Email notifications to admin/user
- 📊 Analytics dashboard (sales, conversions)
- 🔄 Auto-renewal options
- 🌍 Per-country pricing
- 🎯 Limited-time promotions
- 📱 Mobile payment options

## Support

For issues or questions, check:
- `docs/PREMIUM_LISTINGS.md` - Complete API documentation
- `/admin/premium-listings` - Admin dashboard
- Database migrations for schema details

---

**Status**: ✅ Production Ready  
**Last Updated**: 2026-09-22  
**Version**: 1.0
