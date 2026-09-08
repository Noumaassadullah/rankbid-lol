# RankBid - Setup Guide

A pure pay-to-rank public leaderboard platform with Stripe, JazzCash, and EasyPaisa payments.

## Project Overview

**RankBid** is a viral marketing leaderboard where:
- Users list products and bid for top rank
- Rank = amount paid (no algorithms, no votes)
- Three leaderboards: All-Time, Today (24h rolling), Daily (UTC calendar)
- Multiple categories with independent rankings
- Payment methods: JazzCash, EasyPaisa, Stripe (coming)

## Tech Stack

- **Frontend**: Next.js 16 + React 19 + TypeScript
- **Styling**: Tailwind CSS (light/dark mode)
- **Database**: PostgreSQL with Prisma ORM
- **Payments**: Stripe API (primary), JazzCash & EasyPaisa (legacy)
- **Deployment**: Vercel (built-in support)

## Prerequisites

- Node.js 18+ (recommended: Node 20 LTS)
- PostgreSQL 14+
- npm or pnpm package manager

## Installation

### 1. Clone & Install Dependencies

```bash
cd rankbid-lol
npm install
# or
pnpm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

Then edit `.env.local`:

```
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/rankbid"

# NextAuth (for admin/user auth)
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Stripe (Primary payment method)
STRIPE_PUBLIC_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# JazzCash (Legacy)
JAZZCASH_MERCHANT_ID="your-merchant-id"
JAZZCASH_PASSWORD="your-password"
JAZZCASH_RETURN_URL="http://localhost:3000/api/payment/jazzcash/callback"

# EasyPaisa (Legacy)
EASYPAISA_MERCHANT_ID="your-merchant-id"
EASYPAISA_API_KEY="your-api-key"
EASYPAISA_RETURN_URL="http://localhost:3000/api/payment/easypaisa/callback"

# Domain
NEXT_PUBLIC_DOMAIN="http://localhost:3000"
```

### 3. Set Up Database

Create a PostgreSQL database:

```bash
# Create database locally (or use cloud provider)
createdb rankbid

# Run migrations
npx prisma migrate dev --name init
```

### 4. Seed Initial Data (Optional)

```bash
npx prisma db seed
```

## Getting Started

### Development Server

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
rankbid-lol/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── listings/             # List products
│   │   └── payment/              # Payment processing
│   │       ├── initiate/         # Start payment
│   │       ├── jazzcash/         # JazzCash callbacks
│   │       └── easypaisa/        # EasyPaisa callbacks
│   ├── categories/               # Category browse
│   ├── daily/                    # Daily leaderboard
│   ├── today/                    # 24h leaderboard
│   ├── about/                    # About page
│   ├── rules/                    # Rules & terms
│   ├── success/                  # Payment success
│   ├── error/                    # Payment error
│   └── page.tsx                  # Home page
├── components/                   # Reusable React components
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── ThemeToggle.tsx
│   ├── ListingCard.tsx
│   └── ...
├── lib/                          # Utility libraries
│   ├── prisma.ts                 # Prisma client
│   ├── ranking.ts                # Ranking logic
│   ├── payment.ts                # Payment signatures
│   ├── utils.ts                  # Helpers
├── prisma/
│   └── schema.prisma             # Database schema
└── public/                       # Static assets
```

## Core Features

### 1. Listings (`/app/api/listings`)

- Create new product listings
- Validate URL (no adult/scams)
- Normalize URLs (strip params, resolve shorteners)
- Auto-assign categories

### 2. Ranking System (`/lib/ranking.ts`)

**All-Time**: Sum of all payments ever made
**Today (24h)**: Sum of payments in last 24 hours
**Daily**: UTC calendar day snapshots (frozen after midnight)

### 3. Payments

**JazzCash Integration**:
- Generate checkout URL with cryptographic signature
- Sandbox: `https://sandbox.jazzcash.com.pk/CustomerPortal/`
- Production: `https://www.jazzcash.com.pk/`

**EasyPaisa Integration**:
- Similar signature-based checkout
- Sandbox: `https://sandbox.easypaisa.com.pk`
- Production: `https://easypaisa.com.pk`

### 4. Payment Flow

#### Stripe (Recommended)
1. User fills form (URL/handle, description, category, bid amount)
2. POST `/api/payment/checkout` → creates Payment record (status: pending)
3. Creates Stripe checkout session
4. Redirects to Stripe hosted checkout page
5. User completes payment on Stripe
6. Stripe webhook POST to `/api/payment/webhook` with `charge.succeeded` event
7. Webhook verifies signature + updates Payment (status: completed)
8. Increments listing.totalPaid and listing.dayPaid
9. Updates listing.lastRaisedAt timestamp
10. Creates/updates DailyRank record
11. Redirect URL takes user to success page

#### Legacy: JazzCash / EasyPaisa
1. User enters amount + product URL
2. POST `/api/payment/initiate` → creates Payment record (status: pending)
3. Redirect to payment provider checkout
4. User completes payment
5. Provider redirects to `/api/payment/{provider}/callback`
6. Verify signature + update Payment (status: completed)
7. Recalculate listing totals + update ranks
8. Redirect to success page

## Database Schema

Key tables:

- **users**: User accounts
- **listings**: Products/URLs being ranked
- **payments**: Payment transactions (all-time ledger)
- **daily_ranks**: Daily aggregated payments (for history)
- **daily_snapshots**: Frozen daily leaderboard archives

## Payment Integration Checklist

### Stripe (Recommended)
- [ ] Create Stripe account at https://stripe.com
- [ ] Get API keys from Dashboard → Developers → API Keys
- [ ] Set up webhook endpoint for `charge.succeeded` and `checkout.session.completed` events
- [ ] Webhook URL: `https://your-domain.com/api/payment/webhook`
- [ ] Add keys to `.env.local`: STRIPE_PUBLIC_KEY, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
- [ ] Test with Stripe test mode
- [ ] Switch to live mode when ready

### JazzCash (Legacy)
- [ ] Get Merchant ID & Password from JazzCash
- [ ] Add to `.env.local`
- [ ] Test in sandbox first
- [ ] Move to production endpoint
- [ ] Add webhook handling

### EasyPaisa (Legacy)
- [ ] Get Merchant ID & API Key from EasyPaisa
- [ ] Add to `.env.local`
- [ ] Test in sandbox first
- [ ] Move to production endpoint
- [ ] Add webhook handling

## Deployment (Vercel)

### 1. Connect GitHub

```bash
git init
git add .
git commit -m "Initial commit"
# Push to GitHub repo
```

### 2. Deploy to Vercel

```bash
npx vercel
```

Or connect manually at [vercel.com](https://vercel.com)

### 3. Set Environment Variables in Vercel

- Go to Project Settings → Environment Variables
- Add all variables from `.env.local`
- Database URL (use Railway, Neon, or Supabase)

### 4. Run Migrations on Deployment

Add to `package.json` → build script:

```json
{
  "scripts": {
    "build": "prisma generate && next build"
  }
}
```

### Database Providers (Recommended for Vercel)

- **Neon**: https://neon.tech (PostgreSQL serverless)
- **Railway**: https://railway.app (all-in-one)
- **Supabase**: https://supabase.com (PostgreSQL + extras)

## Admin Dashboard (Future)

TODO: Build admin panel at `/admin` for:
- View all payments
- Manage disputes
- Ban listings
- Analytics dashboard
- Daily snapshot triggers

## Cron Jobs (Recommended)

Set up scheduled tasks to:

1. **Update day-paid values** (every hour)
   - Recalculate 24h rolling window
   - Update listing.dayPaid

2. **Freeze daily snapshots** (every midnight UTC)
   - Lock previous day's top 10
   - Create `/daily/YYYY-MM-DD` static pages

3. **Cleanup stale payments** (daily)
   - Archive old payment records

Use Vercel Crons or external service (EasyCron, cron-job.org).

## Testing

### Manual Payment Testing

1. Fill in sandbox merchant credentials in `.env.local`
2. Create a test listing on homepage
3. Initiate payment
4. Use test card provided by JazzCash/EasyPaisa
5. Verify webhook callback updates listing

### Unit Tests (TODO)

```bash
npm run test
```

## Troubleshooting

### Database Connection Error

```
PrismaClientInitializationError: Can't reach database server
```

**Fix**:
- Verify DATABASE_URL is correct
- Check PostgreSQL is running
- Test with: `psql $DATABASE_URL`

### Payment Signature Mismatch

**Cause**: Merchant ID/Password incorrect or order of params wrong

**Fix**:
- Double-check credentials in `.env.local`
- Review signature generation in `/lib/payment.ts`
- Test with JazzCash/EasyPaisa sandbox first

### Listings Not Appearing

**Cause**: Database migration didn't run

**Fix**:
```bash
npx prisma migrate deploy
npx prisma db push
```

## Security Notes

1. **Never commit `.env.local`** – use `.env.example` for template
2. **Verify payment signatures** – don't trust client-side amounts
3. **Sanitize inputs** – URL validation prevents XSS
4. **Rate limit payment routes** – prevent spam
5. **HTTPS only** – payment redirects must be secure

## Performance Optimization

- Add Redis caching for rankings (high traffic)
- Implement pagination for listings
- Add CDN for static assets
- Monitor database query times

## Next Steps

1. ✅ Database & schema setup
2. ✅ Core API routes
3. ✅ Payment integration (JazzCash/EasyPaisa)
4. ✅ Frontend pages & components
5. 📋 Admin dashboard
6. 📋 Cron jobs (daily snapshots)
7. 📋 Email notifications
8. 📋 Analytics & stats
9. 📋 Rate limiting
10. 📋 Stripe integration

## Support

For questions or issues:
- Check `.env.example` for all required variables
- Review `/lib/payment.ts` for signature logic
- Check Prisma docs: https://prisma.io
- JazzCash docs: https://www.jazzcash.com.pk
- EasyPaisa docs: https://easypaisa.com.pk

## License

MIT - Feel free to modify and deploy!

---

**Built for Pakistan** 🇵🇰
