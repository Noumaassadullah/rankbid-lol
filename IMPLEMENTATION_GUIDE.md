# Implementation Guide: outbid.lol

This guide walks through the complete implementation of the outbid.lol platform with Stripe payment integration.

## What's Been Implemented

### ✅ Core Infrastructure

1. **Database Schema** (`prisma/schema.prisma`)
   - Simplified schema (no User requirement for frictionless submission)
   - Listing model for product listings
   - Payment model for tracking transactions
   - DailyRank and DailySnapshot for historical tracking

2. **API Endpoints**
   - `POST /api/listings/submit` - Create or fetch listings
   - `GET /api/listings/submit` - Get ranked listings with filtering
   - `POST /api/payment/checkout` - Initiate Stripe checkout
   - `POST /api/payment/webhook` - Handle Stripe webhooks
   - `GET /api/click` - Track clicks and redirect

3. **Frontend Pages**
   - **Home (`/`)** - Main leaderboard with claim form
   - **Success (`/success`)** - Post-payment confirmation and sharing
   - **Cancel (`/cancel`)** - Payment cancellation page
   - **Product (`/product/[id]`)** - Individual product details

4. **Payment Flow**
   - Stripe checkout session creation
   - Webhook handling for charge confirmation
   - Automatic listing rank updates
   - Daily totals tracking

### ✅ UI/UX

- Bold, vibrant design with orange and purple gradients
- No account needed - submit and pay instantly
- Real-time rank calculator
- Click tracking and performance metrics display
- Responsive mobile-first design

## Next Steps: Setup & Configuration

### 1. Database Setup

```bash
# If you haven't already, install dependencies
npm install

# Create database (using your PostgreSQL instance)
createdb rankbid

# Or use a cloud provider: Neon, Railway, or Supabase

# Run migrations to sync schema
npx prisma migrate dev --name init

# (Optional) Seed with sample data
npx prisma db seed
```

### 2. Stripe Configuration

#### Get Your Stripe Keys

1. Go to https://stripe.com and create an account
2. Go to Developers → API Keys
3. Copy **Publishable key** (pk_test_...)
4. Copy **Secret key** (sk_test_...)

#### Set Up Webhooks

1. Go to Developers → Webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://your-domain.com/api/payment/webhook`
4. Events to listen for:
   - `charge.succeeded`
   - `checkout.session.completed`
5. Copy the **Signing secret** (whsec_...)

#### Update Environment Variables

Edit `.env.local`:

```env
STRIPE_PUBLIC_KEY="pk_test_abc123..."
STRIPE_SECRET_KEY="sk_test_abc123..."
STRIPE_WEBHOOK_SECRET="whsec_abc123..."
NEXT_PUBLIC_DOMAIN="http://localhost:3000" # or your production domain
```

### 3. Local Testing

```bash
# Start development server
npm run dev

# Navigate to http://localhost:3000
# Try creating a listing and payment flow
```

#### Using Stripe Test Cards

Use these test card numbers in Stripe checkout:

- **Successful payment**: `4242 4242 4242 4242`
- **Failed payment**: `4000 0000 0000 0002`
- **Requires auth**: `4000 0025 0000 3155`

**Expiry**: Any future date (e.g., 12/25)  
**CVC**: Any 3 digits

### 4. How Payment Flow Works

```
User fills form (URL, category, amount)
         ↓
POST /api/listings/submit
         ↓
Listing created/found (e.g., id: "cuid123")
         ↓
POST /api/payment/checkout with listingId + amount
         ↓
Stripe session created (status: pending)
         ↓
Redirect to Stripe checkout page
         ↓
User enters card details & pays
         ↓
Stripe processes payment
         ↓
POST /api/payment/webhook (charge.succeeded event)
         ↓
Update Payment record (status: completed)
         ↓
Increment listing.totalPaid + dayPaid
         ↓
Create/update DailyRank record
         ↓
Redirect to /success?session_id=...&listing_id=...
         ↓
Success page fetches listing and displays metrics
```

## Key Features Breakdown

### 1. Frictionless Submission

**How it works:**
- No account creation needed
- User provides: URL/handle, description, category, bid amount
- Form submits to `POST /api/listings/submit`
- If URL doesn't exist → creates new listing
- If URL exists → fetches existing listing (for incremental upgrades)

**Code**: `app/page.tsx` (handleSubmit function)

### 2. Strict Dollar-Based Ranking

**How it works:**
- Query listings sorted by `totalPaid` DESC
- Rank = position in sorted list + 1
- Tie-breaking: older listing ranks higher (by `createdAt`)

**Code**: `app/api/listings/submit/route.ts` (GET endpoint)

### 3. Incremental Upgrades

**How it works:**
- User submits same URL again with new bid amount
- System finds existing listing by URL
- Stores new Payment record with same listingId
- Webhook increments listing.totalPaid by new payment amount
- Only difference is charged (system shows this on form)

**Example**:
- First bid: $100 → total = $100 → rank #5
- Gets outbid
- Second bid: $50 (difference) → total = $150 → rank #2
- Only charged $50, not $150

**Code**: `app/page.tsx` (calculateRank shows this)

### 4. Click Tracking

**How it works:**
- Each listing has clickCount field
- User clicks "Visit Site" → GET `/api/click?id=listingId`
- API increments clickCount
- Redirects to listing.url with 302 redirect

**Code**: `app/api/click/route.ts`

### 5. Payment Success Confirmation

**How it works:**
- Stripe redirects to `/success?session_id=...&listing_id=...`
- Page fetches listing by listingId
- Displays: rank, total paid, clicks, share link

**Code**: `app/success/page.tsx`

## Database Schema Reference

### Listings Table
```sql
CREATE TABLE listings (
  id              VARCHAR(255) PRIMARY KEY,
  title           VARCHAR(255) NOT NULL,
  description     TEXT NOT NULL,
  url             VARCHAR(2048) UNIQUE NOT NULL,
  handle          VARCHAR(255),
  category        ENUM('AI', 'SaaS', 'Developer', ...),
  totalPaid       INT DEFAULT 0,
  dayPaid         INT DEFAULT 0,
  clickCount      INT DEFAULT 0,
  createdAt       TIMESTAMP DEFAULT NOW(),
  lastRaisedAt    TIMESTAMP DEFAULT NOW(),
  updatedAt       TIMESTAMP DEFAULT NOW()
);
```

### Payments Table
```sql
CREATE TABLE payments (
  id              VARCHAR(255) PRIMARY KEY,
  listingId       VARCHAR(255) NOT NULL REFERENCES listings(id),
  amount          INT NOT NULL,
  method          VARCHAR(20) DEFAULT 'stripe',
  status          VARCHAR(20) DEFAULT 'pending',
  stripeSessionId VARCHAR(255) UNIQUE,
  stripePaymentId VARCHAR(255) UNIQUE,
  paidAt          TIMESTAMP,
  createdAt       TIMESTAMP DEFAULT NOW(),
  updatedAt       TIMESTAMP DEFAULT NOW()
};
```

## API Endpoints Reference

### Submit/Fetch Listing
```
POST /api/listings/submit
Content-Type: application/json

{
  "url": "https://example.com",
  "handle": "@twitter_handle",
  "description": "My awesome product",
  "category": "AI"
}

Response:
{
  "listing": { id, url, totalPaid, dayPaid, ... },
  "isNew": true
}
```

### Initiate Stripe Checkout
```
POST /api/payment/checkout
Content-Type: application/json

{
  "listingId": "cuid123",
  "amount": 10000  // in cents ($100)
}

Response:
{
  "url": "https://checkout.stripe.com/pay/cs_test_...",
  "sessionId": "cs_test_..."
}
```

### Click Tracking
```
GET /api/click?id=cuid123

Response:
302 Redirect to listing.url
Side effect: increments listing.clickCount
```

## Testing Checklist

- [ ] Database connection works (`npx prisma studio`)
- [ ] Create a listing without payment
- [ ] Verify listing appears on homepage
- [ ] Initiate Stripe checkout with test card
- [ ] Complete payment on Stripe
- [ ] Webhook received and processed (check logs)
- [ ] Listing shows updated totalPaid and rank
- [ ] Click tracking works (visit link, check incrementing clickCount)
- [ ] Incremental upgrade works (submit same URL with new amount)
- [ ] Can view product details page
- [ ] Mobile responsive on small screens

## Troubleshooting

### "Database connection error"
```
Error: P1000 Authentication failed against database server
```

**Fix:**
- Check DATABASE_URL in .env.local
- Verify PostgreSQL is running
- Test with: `psql $DATABASE_URL`

### "Stripe webhook not triggered"

**Check:**
- Webhook endpoint URL is correct in Stripe dashboard
- STRIPE_WEBHOOK_SECRET matches webhook's signing secret
- Webhook is enabled for `charge.succeeded` events
- Check Stripe dashboard → Webhooks → Event delivery logs

### "Listing not appearing after payment"

**Debug steps:**
1. Check Payment record in `npx prisma studio` → payments table
2. Verify status = "completed" (not "pending")
3. Check listing.totalPaid increased
4. Clear browser cache
5. Refresh `/` page

### "Stripe test card declined"

**Solutions:**
- Use `4242 4242 4242 4242` (test success card)
- Use any future expiry date
- Use any 3-digit CVC
- Check Stripe test mode is enabled (toggle at top of Dashboard)

## Environment Variables Checklist

```env
# ✓ Database
DATABASE_URL="postgresql://user:password@host/rankbid"

# ✓ Stripe (Required)
STRIPE_PUBLIC_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# ✓ Domain
NEXT_PUBLIC_DOMAIN="http://localhost:3000"
```

## File Reference

### New Files Created
- `app/api/listings/submit/route.ts` - Listing CRUD
- `app/api/payment/checkout/route.ts` - Stripe checkout
- `app/api/payment/webhook/route.ts` - Stripe webhook handler
- `app/api/click/route.ts` - Click tracking
- `app/success/page.tsx` - Success page (updated)
- `app/cancel/page.tsx` - Cancel page
- `IMPLEMENTATION_GUIDE.md` - This file

### Modified Files
- `app/page.tsx` - Home page (now functional)
- `app/product/[id]/page.tsx` - Product detail (updated)
- `prisma/schema.prisma` - Schema (simplified)
- `.env.local` - Environment variables (added Stripe keys)
- `SETUP.md` - Setup guide (updated)
- `README.md` - Project description (updated)

## Next Steps for Production

1. **Add authentication** (optional)
   - For dashboard to view own listings
   - For admin management

2. **Email notifications**
   - Confirm payment with listing link
   - Alert when outbid

3. **Admin dashboard**
   - View all payments
   - Ban/remove listings
   - Analytics

4. **Cron jobs**
   - Update rolling 24h dayPaid (every hour)
   - Create daily snapshots (midnight UTC)
   - Clean old records

5. **Performance optimizations**
   - Redis caching for rankings
   - Pagination for large leaderboards
   - CDN for assets

6. **Multiple payment methods**
   - Add JazzCash/EasyPaisa alongside Stripe
   - Fallback to PayPal, Apple Pay, etc.

## Support & Resources

- **Stripe Docs**: https://stripe.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Prisma Docs**: https://prisma.io/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs

---

**Ready to launch?** 🚀
1. Set up Stripe account
2. Configure .env.local
3. Run migrations
4. Test payment flow
5. Deploy to Vercel!
