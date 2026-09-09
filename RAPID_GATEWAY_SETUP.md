# RapidGateway Integration Setup Guide

This guide helps you integrate RapidGateway payment webhooks with your RankBid application.

## Step 1: Get Your Vercel Domain

Your webhook endpoint will be hosted on Vercel. Find your domain:

- **Production**: `https://your-vercel-domain.vercel.app/api/webhooks/rapid-gateway`
- Replace `your-vercel-domain` with your actual Vercel deployment domain

### Example:
If your project is at `rankbid-lol.vercel.app`, your webhook URL will be:
```
https://rankbid-lol.vercel.app/api/webhooks/rapid-gateway
```

## Step 2: Configure RapidGateway Dashboard

1. Go to RapidGateway Dashboard → **Settings** → **Webhooks**
2. In the **Endpoint URL** field, paste your webhook URL
3. Copy the **Signing salt** from the dashboard

## Step 3: Add Environment Variables

Add the signing salt to your `.env.local` (local development) and Vercel dashboard (production):

### Local Development (`.env.local`):
```env
RAPID_GATEWAY_SIGNING_SALT="your-signing-salt-from-dashboard"
```

### Production (Vercel Dashboard):
1. Go to your Vercel project → **Settings** → **Environment Variables**
2. Add new variable:
   - **Name**: `RAPID_GATEWAY_SIGNING_SALT`
   - **Value**: Your signing salt from RapidGateway
   - **Environments**: Select all (Production, Preview, Development)

## Step 4: Update Supabase Schema

Run this SQL in your Supabase dashboard to create the payments table:

1. Go to your Supabase project → **SQL Editor**
2. Create a new query and paste the SQL from `supabase/schema.sql`
3. Execute the query

Or simply push your changes:
```bash
npm run db:push  # If using Prisma
# OR
supabase db push  # If using Supabase migrations
```

## Step 5: Test the Webhook

### Using RapidGateway Test Button:
1. In RapidGateway Webhooks page, click **"Test your endpoint"**
2. Enter your webhook URL
3. Click **"Send test webhook"**

### Expected Response:
```json
{
  "success": true,
  "transactionId": "test-transaction-id"
}
```

### Checking Logs:
- **Local**: Check your terminal running `npm run dev`
- **Vercel**: Go to Vercel project → **Logs** → **Functions**

## Step 6: Handle Payment Completion

When a payment is completed, RapidGateway will POST to your webhook with:

```json
{
  "transactionId": "txn_abc123",
  "status": "completed",
  "amount": 5000,
  "reference": "order-12345",
  "timestamp": "2024-09-10T12:00:00Z"
}
```

Your webhook will:
1. ✅ Verify the signature
2. ✅ Update payment status in Supabase
3. ✅ Return success response

## File Structure

```
app/api/webhooks/rapid-gateway/
└── route.ts                 # Webhook handler

lib/
├── supabase-payments.ts     # Database utilities
└── payment.ts               # Payment helper functions

supabase/
└── schema.sql               # Database schema (includes payments table)

.env.example                 # Environment template
.env.local                   # Local environment (not committed)
```

## Environment Variables Reference

| Variable | Source | Purpose |
|----------|--------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Dashboard | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard | Server-side Supabase access |
| `RAPID_GATEWAY_SIGNING_SALT` | RapidGateway Webhooks | Verify webhook signatures |

## Troubleshooting

### Webhook not being delivered?
- ✅ Verify endpoint URL is public HTTPS
- ✅ Check signing salt is correct
- ✅ Ensure function executes successfully (check Vercel logs)

### Signature verification failing?
- ✅ Make sure `RAPID_GATEWAY_SIGNING_SALT` is set correctly
- ✅ Verify it matches the value in RapidGateway dashboard

### Payment status not updating?
- ✅ Check Supabase `payments` table exists
- ✅ Verify `SUPABASE_SERVICE_ROLE_KEY` is correct
- ✅ Check Vercel function logs for errors

## API Reference

### Creating a Payment
```typescript
import { createPaymentRecord } from '@/lib/supabase-payments';

await createPaymentRecord({
  transaction_id: 'txn_123',
  reference: 'order-1',
  amount: 5000,
  currency: 'PKR',
  status: 'pending',
  payment_method: 'rapid-gateway',
  user_id: 'user-uuid',
  listing_id: 'listing-uuid'
});
```

### Updating Payment Status
```typescript
import { updatePaymentStatus } from '@/lib/supabase-payments';

await updatePaymentStatus('txn_123', 'completed', {
  webhook_received_at: new Date().toISOString()
});
```

### Fetching Payment
```typescript
import { getPaymentByTransactionId } from '@/lib/supabase-payments';

const payment = await getPaymentByTransactionId('txn_123');
```

## Next Steps

1. Deploy your app to Vercel
2. Configure RapidGateway webhooks
3. Test with the "Send test webhook" button
4. Monitor real transactions in Supabase `payments` table
