# RankBid - Quick Start Guide

## What's Been Built ✅

A complete **pay-to-rank leaderboard platform** with JazzCash & EasyPaisa payment integration.

### Included Components:

**Frontend Pages:**
- ✅ Home page (`/`) - Main leaderboard with hero CTA
- ✅ Categories page (`/categories`) - Browse by category
- ✅ Daily page (`/daily`) - Daily UTC snapshots
- ✅ Today page (`/today`) - 24h rolling leaderboard
- ✅ Product detail page (`/product/[id]`) - Individual listing view
- ✅ About page (`/about`) - Origin story & stats
- ✅ Rules page (`/rules`) - Terms & pricing rules
- ✅ Success page (`/success`) - Payment confirmation
- ✅ Error page (`/error`) - Payment failure handling

**UI Components:**
- ✅ Navbar with theme toggle & search
- ✅ Footer with links
- ✅ ListingCard component
- ✅ Dark mode support (light/dark CSS)
- ✅ Mobile responsive design

**Backend API Routes:**
- ✅ `/api/listings` - Create and list products
- ✅ `/api/payment/initiate` - Start payment
- ✅ `/api/payment/jazzcash/callback` - JazzCash webhook
- ✅ `/api/payment/easypaisa/callback` - EasyPaisa webhook

**Database:**
- ✅ Prisma schema (users, listings, payments, daily_ranks)
- ✅ PostgreSQL-ready
- ✅ Relationship management

**Payment Integration:**
- ✅ JazzCash signature generation
- ✅ EasyPaisa signature generation
- ✅ Checkout URL builders
- ✅ Webhook handlers
- ✅ Payment status tracking

**Utilities:**
- ✅ URL normalization & validation
- ✅ Ranking calculation logic
- ✅ Currency formatting
- ✅ Time-ago helpers
- ✅ Payment constants

---

## 5-Minute Setup

### 1. Install & Configure

```bash
cd rankbid-lol

# Install dependencies (if not done)
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your credentials
nano .env.local
```

### 2. Set Up Database

```bash
# Create PostgreSQL database (or update DATABASE_URL)
createdb rankbid

# Run migrations
npm run db:push
```

### 3. Start Development

```bash
npm run dev
```

Open http://localhost:3000

---

## Test the Platform

### Test Listing Creation:

1. Go to homepage
2. Fill in product URL + category
3. Click "Claim Rank"
4. (Currently shows UI, but no real listing yet - need auth)

### Test Payment Flow (Once Connected):

1. Create a listing
2. Click "Claim"
3. Redirect to JazzCash/EasyPaisa sandbox
4. Complete payment
5. Get redirected to `/success`

---

## What's Left to Build 📋

### Critical (Required for Launch):
- [ ] **User Authentication** - Sign up/login system (NextAuth recommended)
- [ ] **Listing Management** - User can see their own listings
- [ ] **Payment Form** - Amount input + validation on homepage
- [ ] **Click Tracking** - Track when users click listing links
- [ ] **Real Ranking** - Fetch & display actual ranked listings from DB
- [ ] **Merchant Accounts** - Get live JazzCash/EasyPaisa credentials

### High Priority:
- [ ] **Admin Dashboard** - View all payments, disputes, analytics
- [ ] **Cron Jobs** - Daily snapshot freezing (midnight UTC)
- [ ] **Email Notifications** - Confirm payment, rank changes
- [ ] **Search** - Find products across leaderboard
- [ ] **Category Auto-Assignment** - AI-based category detection

### Nice to Have:
- [ ] **Stats Dashboard** - Visitors, revenue, top products
- [ ] **Social Sharing** - Share rank on Twitter, etc.
- [ ] **Testimonials** - Quotes from top rankers
- [ ] **Analytics** - Ranking trends, bid analysis
- [ ] **Stripe Support** - Add international payments

---

## Architecture Overview

```
User Flow:
1. Visit homepage
   ↓
2. Enter URL + category
   ↓
3. See price to outrank #1
   ↓
4. Click "Claim"
   ↓
5. Redirect to payment provider
   ↓
6. Complete payment
   ↓
7. Callback to /api/payment/{provider}/callback
   ↓
8. Update database (listing, payment records)
   ↓
9. Recalculate rankings
   ↓
10. Show success page

Database Structure:
users → listings ← payments
users ← payments
listings ← daily_ranks (historical snapshots)
```

---

## Payment Integration Status

### JazzCash ✅ Ready
- Signature generation: `generateJazzCashSignature()`
- Checkout URL: `generateJazzCashCheckoutURL()`
- Webhook handling: `/api/payment/jazzcash/callback`
- **TODO**: Add live merchant ID & password

### EasyPaisa ✅ Ready
- Signature generation: `generateEasypaisaSignature()`
- Checkout URL: `generateEasypaisaCheckoutURL()`
- Webhook handling: `/api/payment/easypaisa/callback`
- **TODO**: Add live merchant ID & API key

### Testing Credentials
- Use JazzCash/EasyPaisa sandbox first
- See SETUP.md for how to register

---

## File Structure Quick Reference

```
app/
  ├── page.tsx              # Home (main leaderboard)
  ├── about/page.tsx        # About page
  ├── categories/page.tsx   # Category browse
  ├── daily/page.tsx        # Daily leaderboard
  ├── today/page.tsx        # 24h leaderboard
  ├── product/[id]/page.tsx # Product detail
  ├── rules/page.tsx        # Rules & ToS
  ├── success/page.tsx      # Payment success
  ├── error/page.tsx        # Payment error
  ├── api/
  │   ├── listings/route.ts       # GET/POST listings
  │   └── payment/
  │       ├── initiate/route.ts   # POST to start payment
  │       ├── jazzcash/callback/  # GET/POST JazzCash
  │       └── easypaisa/callback/ # GET/POST EasyPaisa
  └── layout.tsx            # Root layout

components/
  ├── Navbar.tsx
  ├── Footer.tsx
  ├── ListingCard.tsx
  ├── ThemeToggle.tsx
  ├── SearchBar.tsx
  └── ThemeProvider.tsx

lib/
  ├── prisma.ts          # Database client
  ├── ranking.ts         # Rank calculation
  ├── payment.ts         # Payment signatures
  ├── utils.ts           # Helpers
  └── constants.ts       # Enums & constants

prisma/
  └── schema.prisma      # Database schema
```

---

## Next Steps

### 1. Add Authentication (CRITICAL)
```bash
npm install next-auth
```
Create `/app/api/auth/[...nextauth]/route.ts` for login/signup

### 2. Connect Real Database
- Use Neon.tech, Railway, or Supabase
- Update `DATABASE_URL` in `.env.local`

### 3. Get Payment Credentials
- **JazzCash**: https://merchant.jazzcash.com.pk
- **EasyPaisa**: https://easypaisa.com.pk (contact for credentials)

### 4. Build Admin Dashboard
Create `/app/admin` with:
- Payment listing view
- Dispute management
- Analytics

### 5. Deploy to Vercel
```bash
npm run build
npx vercel
```

---

## Key Commands

```bash
# Development
npm run dev

# Build
npm run build
npm start

# Database
npm run db:push        # Apply schema changes
npm run db:migrate     # Create new migration
npm run db:studio      # Open Prisma Studio UI

# Other
npm run lint           # Check code
npm run db:seed        # Populate test data (create seed.js first)
```

---

## Common Issues

### "DATABASE_URL not set"
→ Make sure `.env.local` exists and has DATABASE_URL

### "Listing not created after payment"
→ Check that webhook callback is being triggered
→ Verify payment status changed to "completed"

### "Rankings not updating"
→ Check database has listings with `status: "completed"`
→ Run `npm run db:studio` to inspect data

### "Payment signature mismatch"
→ Double-check merchant credentials in `.env.local`
→ Verify you're using sandbox URLs (not production)

---

## Performance Tips

- Add Redis caching for rankings (avoid DB hits on every page load)
- Implement CDN for static assets (next/image optimization)
- Use database indexes (already in schema)
- Paginate listing results (50 per page)

---

## Security Reminders

✅ Never commit `.env.local`
✅ Verify payment signatures server-side
✅ Validate URLs (no adult/scams)
✅ Rate limit payment endpoints
✅ Use HTTPS in production

---

## Support & Resources

- **Prisma Docs**: https://prisma.io/docs
- **Next.js Docs**: https://nextjs.org/docs
- **JazzCash API**: https://www.jazzcash.com.pk
- **EasyPaisa API**: https://easypaisa.com.pk
- **Vercel Docs**: https://vercel.com/docs

---

## Ready to Build? 🚀

1. ✅ Everything above is set up
2. 📋 Choose auth solution (NextAuth/Clerk/Auth0)
3. 🏗️ Build admin dashboard
4. 💳 Connect live payment credentials
5. 🚀 Deploy to Vercel

**Good luck! You have a complete platform foundation.** 🇵🇰

