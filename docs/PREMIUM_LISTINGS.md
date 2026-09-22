# Premium Listings Feature

## Overview

RankBid now supports **paid premium listings** that allow users to feature their products at guaranteed positions on the leaderboard with founder information displayed.

## Pricing

- **Position #1**: $5 USD
- **Position #2**: $3 USD
- **Position #3**: $1 USD

## How It Works

### For Users

1. **Submit a Regular Listing** - Submit your product for free
2. **Click the Premium Star** - Click the ⭐ button on your listing
3. **Fill Founder Info** - Enter your name, email, phone, and social accounts
4. **Submit Payment Request** - Submit your premium listing request
5. **Admin Approval** - An admin will verify your payment and activate your premium listing
6. **Permanent Placement** - Your listing stays at its position until votes move it

### For Admins

1. Go to `/admin/premium-listings`
2. Enter the admin key
3. View pending premium listing requests
4. Review founder information and payment details
5. Approve or reject the request
6. Once approved, the listing appears at the top of the leaderboard

## Features

### Founder Information Display

Premium listings show:
- ✅ Founder name
- ✅ Email address (clickable)
- ✅ Phone number (clickable)
- ✅ Website
- ✅ Twitter/X
- ✅ LinkedIn
- ✅ Instagram
- ✅ Facebook
- ✅ TikTok
- ✅ YouTube
- ✅ GitHub

### Special Premium Badge

- Premium listings display a "PREMIUM #1/2/3" badge
- Styled with unique gradient background
- Easily distinguishable from regular listings

## Database Schema

### premium_listings Table

```sql
CREATE TABLE premium_listings (
  id TEXT PRIMARY KEY,
  listing_id TEXT NOT NULL UNIQUE REFERENCES listings(id),
  founder_name TEXT NOT NULL,
  founder_email TEXT NOT NULL,
  founder_phone TEXT NOT NULL,
  founder_website TEXT,
  founder_twitter TEXT,
  founder_linkedin TEXT,
  founder_instagram TEXT,
  founder_facebook TEXT,
  founder_tiktok TEXT,
  founder_youtube TEXT,
  founder_github TEXT,
  position INTEGER NOT NULL (1, 2, or 3),
  amount_paid NUMERIC NOT NULL,
  payment_method TEXT,
  payment_status TEXT ('pending', 'approved', 'rejected'),
  approved_at TIMESTAMP,
  approved_by TEXT,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);
```

## API Endpoints

### POST /api/listings/premium

**Submit Premium Listing Request**

```json
{
  "listingId": "uuid",
  "position": 1,
  "founderName": "John Doe",
  "founderEmail": "john@example.com",
  "founderPhone": "+92 300 1234567",
  "founderWebsite": "https://example.com",
  "founderTwitter": "@handle",
  "founderLinkedin": "https://linkedin.com/in/...",
  "founderInstagram": "@handle",
  "founderFacebook": "https://facebook.com/...",
  "founderTiktok": "@handle",
  "founderYoutube": "https://youtube.com/...",
  "founderGithub": "@username",
  "paymentMethod": "manual"
}
```

**Response**: `{ success: true, message: "Premium listing request submitted. Awaiting admin approval." }`

### GET /api/listings/premium?listingId=uuid

**Get Premium Listing Status**

**Response**:
```json
{
  "premium": {
    "id": "premium_...",
    "listing_id": "uuid",
    "payment_status": "pending|approved|rejected",
    "position": 1,
    "founder_name": "John Doe",
    ...
  }
}
```

### GET /api/admin/premium-listings?status=pending

**Fetch Premium Listings for Admin** (requires x-admin-key header)

**Response**:
```json
{
  "premiumListings": [
    {
      "id": "premium_...",
      "listing_title": "My Product",
      "founder_name": "John Doe",
      "position": 1,
      "amount_paid": 5,
      "payment_status": "pending",
      ...
    }
  ]
}
```

### PATCH /api/admin/premium-listings

**Approve/Reject Premium Listing** (requires x-admin-key header)

```json
{
  "premiumListingId": "premium_...",
  "status": "approved|rejected",
  "approvedBy": "admin@example.com"
}
```

## Environment Variables

Set the admin key in `.env.local`:

```
ADMIN_KEY=your-secret-admin-key
```

## Workflow

1. User submits listing (free)
2. User clicks ⭐ to make it premium
3. Premium modal opens with founder form
4. User fills in info and selects position ($1, $3, or $5)
5. Request sent to `/api/listings/premium`
6. Admin sees pending request at `/admin/premium-listings`
7. Admin reviews founder info and verifies payment received
8. Admin clicks "Approve"
9. Premium listing appears at top of leaderboard with special styling
10. Votes can still move it down, but it stays visible

## Payment Verification

**Manual verification process:**

1. User submits premium request with their payment amount
2. Admin receives notification and checks payment status
3. Admin can verify payment via:
   - Direct contact (email/phone provided)
   - Email confirmation of payment
   - Payment processor transaction ID
4. Admin approves once payment confirmed
5. Admin can reject if payment not received

## Frontend Components

- `PremiumListingCard.tsx` - Displays premium listing with founder info
- `PremiumListingModal.tsx` - Form for submitting premium listing request

## Admin Dashboard

Access at: `/admin/premium-listings`

Features:
- View pending/approved/rejected premium listings
- One-click approve/reject buttons
- View all founder information
- See payment amounts and dates
- Filter by status
