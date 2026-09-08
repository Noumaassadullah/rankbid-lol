# outbid.lol

A dynamic, reverse-auction public leaderboard where visibility is entirely dictated by the amount of money a user bids.

## Core Mechanics

### 1. **Frictionless Submission**
Users do not need to create an account, log in, or wait for editorial approval. They simply paste their product URL or X (Twitter) handle, write a short description, and select a category directly on the homepage.

### 2. **The Initial Bid & Payment**
To claim a spot, the user enters a dollar amount they are willing to pay. The entry fee starts as low as $1 (or $5 for higher visibility). The checkout is handled instantly via Stripe; once the payment is verified, the listing goes live immediately.

### 3. **Rank by Cumulative Dollar Value**
The entire leaderboard is strictly ordered by the total verified dollar amount paid. There are no hidden quality scores, SEO algorithms, or complex bidding systems. If a user pays $10,000, they rank above someone who paid $9,999. If two listings have the exact same total, the older bid retains the higher rank.

### 4. **The Outbid Mechanic (King-of-the-Hill)**
Positions are never permanently locked. To claim the #1 spot (or any specific rank), a new buyer must outbid the current placeholder by at least $1 (or $5 depending on the tier). The displaced listing is pushed down the board.

### 5. **Incremental Upgrades (Paying the Difference)**
If a founder's project gets pushed down the rankings, they do not have to pay the full price to reclaim their spot. They can submit the exact same URL, and the system adds the new payment to their existing total. They only need to pay the difference required to outbid the person above them.

### 6. **Transparent ROI & Traffic**
Once a listing is live, outbid.lol publicly tracks and displays the total amount paid and the number of direct outbound clicks the website has received. This turns a paid bid into an auditable marketing expense with visible real-time performance metrics.

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

### Listings API
- **POST** `/api/listings/submit` - Create or fetch a listing
- **GET** `/api/listings/submit?category=AI&sort=totalPaid` - Get ranked listings

### Payment API
- **POST** `/api/payment/checkout` - Initiate Stripe checkout
- **POST** `/api/payment/webhook` - Handle Stripe webhooks

### Click Tracking
- **GET** `/api/click?id={listingId}` - Track click and redirect to listing URL

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

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."

# Stripe (Required)
STRIPE_PUBLIC_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Domain
NEXT_PUBLIC_DOMAIN="http://localhost:3000"
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
