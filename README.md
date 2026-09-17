# RankBid

A transparent, pay-to-rank leaderboard platform where product creators and makers compete fairly to gain visibility. The more you bid, the higher your rank. No algorithms, no politics, just pure merit-based competition.

## Core Mechanics

### 1. **Frictionless Submission**
Users do not need to create an account, log in, or wait for editorial approval. They simply paste their product URL or X (Twitter) handle, write a short description, and select a category directly on the homepage.

### 2. **Minimum Bid Requirement**
To claim a spot on the leaderboard, users must pay at least ₨2,800 (~$10 USD). This ensures quality and commitment from product creators. Multi-currency support (PKR, USD, GBP, INR) makes it accessible globally.

### 3. **Rank by Cumulative Dollar Value**
The entire leaderboard is strictly ordered by the total verified amount paid. There are no hidden quality scores, SEO algorithms, or complex bidding systems. If you pay more, you rank higher. If two listings have the same total, the older bid retains the higher rank.

### 4. **The Outbid Mechanic (King-of-the-Hill)**
Positions are never permanently locked. To claim the #1 spot (or any specific rank), a new buyer must outbid the current placeholder by at least 1 cent. The displaced listing is pushed down the board.

### 5. **Boost Feature (Incremental Upgrades)**
If a listing gets pushed down the rankings, creators do not have to pay the full price to reclaim their spot. They can use the "Boost" feature to add funds to their existing listing without creating a new one. They only pay the difference required to outbid the person above them.

### 6. **Transparent ROI & Click Tracking**
Once a listing is live, RankBid publicly tracks and displays the total amount paid and the number of direct clicks the website has received. This turns a paid bid into an auditable marketing expense with visible real-time performance metrics. Each listing has a detailed stats page showing:
- All-time rank and daily rank
- Total clicks received
- Payment history
- Average bid amount

### 7. **Daily Rankings & Archive**
RankBid maintains separate daily and all-time leaderboards. The daily board resets every day at UTC midnight, giving new products a fresh chance to compete. Historical daily rankings can be viewed in the Archive page, showing past snapshots of the leaderboard.

### 8. **Countdown Timer**
The daily page displays a countdown timer showing when the daily leaderboard will reset, so users know exactly when the competition resets.

## Tech Stack

- **Frontend**: Next.js 16 + React 19 + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Payments**: Stripe (primary), JazzCash & EasyPaisa (legacy)
- **Deployment**: Vercel

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Stripe Account (for payments)

### Installation

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your database and Stripe keys

# Run database migrations
npx prisma migrate dev

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app.

## Project Structure

```
rankbid-lol/
├── app/
│   ├── api/
│   │   ├── listings/submit/          # List creation & retrieval
│   │   ├── payment/
│   │   │   ├── checkout/            # Stripe checkout initiation
│   │   │   ├── webhook/             # Stripe webhook handler
│   │   │   └── ...
│   │   └── click/                   # Click tracking
│   ├── success/                      # Payment success page
│   ├── cancel/                       # Payment cancelled page
│   ├── product/[id]/                # Product details page
│   └── page.tsx                      # Home page
├── lib/
│   ├── prisma.ts                    # Database client
│   ├── ranking.ts                   # Ranking logic
│   ├── payment.ts                   # Payment utilities
│   └── utils.ts                     # Helpers
├── prisma/
│   └── schema.prisma                # Database schema
└── components/                      # React components
```

## Key Features

### Pages
- **/** - Homepage with leaderboard, submission form, and bid adjuster
- **/daily** - Daily rankings with countdown timer to next reset
- **/archive** - Historical daily rankings archive
- **/topup** - Boost feature to add funds to existing listings
- **/listing/[id]** - Detailed listing page with stats and click tracking
- **/stats** - Platform statistics and analytics
- **/rules** - Rules, guidelines, and banned content policy
- **/tos** - Terms of Service explaining the pay-to-rank model
- **/about** - About page describing the platform

### Listings API
- **POST** `/api/listings/submit` - Create or fetch a listing
- **GET** `/api/listings/submit?category=AI&sort=totalPaid` - Get ranked listings
- **GET** `/api/listing?id={listingId}` - Get detailed listing stats
- **GET** `/api/listing?url={url}` - Get listing by URL

### Top-up / Boost API
- **POST** `/api/listing/topup` - Initiate top-up for existing listing
- **GET** `/api/listing/topup?id={listingId}` - Check top-up eligibility

### Daily Snapshots API
- **GET** `/api/daily-snapshots?daysBack=30` - Get historical daily rankings
- **POST** `/api/daily-snapshots` - Create daily snapshot (cron job)

### Payment API
- **POST** `/api/payment/jazzcash-checkout` - Initiate JazzCash checkout
- **POST** `/api/payment/jazzcash/callback` - Handle JazzCash callback
- **POST** `/api/payment/webhook` - Handle payment webhooks

### Click Tracking & Stats
- **GET** `/api/click?id={listingId}` - Track click and redirect to listing URL
- **GET** `/api/stats` - Get platform statistics
- **POST** `/api/stats` - Track visitor session

## Database Schema

### Listing
- `id` - Unique identifier
- `url` - Product URL or handle
- `title` - Product name
- `description` - Product description
- `category` - Product category
- `totalPaid` - Total amount paid (in cents)
- `dayPaid` - Amount paid today (in cents)
- `clickCount` - Total clicks from leaderboard

### Payment
- `id` - Unique identifier
- `listingId` - Reference to listing
- `amount` - Payment amount (in cents)
- `status` - Payment status (pending/completed/failed)
- `stripeSessionId` - Stripe checkout session ID
- `stripePaymentId` - Stripe payment intent ID
- `paidAt` - Timestamp of payment completion

## Configuration Constants

Key constants are defined in `lib/constants.ts`:

```typescript
// Minimum and maximum amounts
export const MIN_LISTING_AMOUNT_CENTS = 280000; // ₨2,800 (~$10 USD)
export const MIN_OUTRANK_AMOUNT_CENTS = 100;    // 1 cent more to outrank
export const MAX_LISTING_AMOUNT_CENTS = 99999900; // ₨999,999

// Multi-currency rates (PKR = base)
const CURRENCY_RATES = {
  PKR: 1,
  USD: 280,    // 1 USD = ₨280
  GBP: 352,    // 1 GBP = ₨352
  INR: 3.36,   // 1 INR = ₨3.36
};

// Blocked domains (cannot be listed)
export const BLOCKED_DOMAINS = [
  'pornhub.com', 'xvideos.com', 'onlyfans.com', // Adult content
  't.me', 'telegram.me', 'discord.gg', 'discord.com/invite', // Chat links
  'whatsapp.com/invite', 'wa.me', // Messaging apps
];
```

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# Stripe (for legacy support)
STRIPE_PUBLIC_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# JazzCash (Pakistan payment)
JAZZCASH_MERCHANT_ID="..."
JAZZCASH_PASSWORD="..."

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_SUPABASE_URL="..."
SUPABASE_SERVICE_ROLE_KEY="..."
```

## Development

### Run dev server
```bash
npm run dev
```

### Build for production
```bash
npm run build
npm start
```

### View database with Prisma Studio
```bash
npx prisma studio
```

## Deployment

See [SETUP.md](./SETUP.md) for detailed deployment instructions.

## License

MIT - Feel free to modify and deploy!
