# Payment Integration Guide

## Overview

RankBid now supports multiple payment methods for premium listings:
- **Rapid Gateway** (Primary) - Instant payment processing
- **JazzCash** - Pakistani mobile money
- **EasyPaisa** - Pakistani mobile money
- **Manual Verification** - Admin-verified payments

## Environment Variables Required

### Rapid Gateway Configuration

```bash
# Signing key for signature verification
RAPID_GATEWAY_SIGNING_SALT=<your-signing-salt>

# Rapid Gateway merchant configuration (add to Vercel)
RAPID_GATEWAY_MERCHANT_ID=<your-merchant-id>
RAPID_GATEWAY_CHECKOUT_URL=https://api.rapidgateway.com/checkout

# App URL for callbacks
NEXT_PUBLIC_APP_URL=https://rankbid.local (dev) or your production URL
```

### JazzCash Configuration (Optional)

```bash
JAZZCASH_MERCHANT_ID=<merchant-id>
JAZZCASH_PASSWORD=<merchant-password>
JAZZCASH_INTEGRITY_CHECK_KEY=<integrity-check-key>
JAZZCASH_RETURN_URL=https://your-domain/api/payment/jazzcash/callback
```

### EasyPaisa Configuration (Optional)

```bash
EASYPAISA_MERCHANT_ID=<merchant-id>
EASYPAISA_API_KEY=<api-key>
EASYPAISA_RETURN_URL=https://your-domain/api/payment/easypaisa/callback
```

## Setup Instructions

### 1. Add Environment Variables

```bash
# Pull latest env vars
vercel env pull --yes

# Add Rapid Gateway credentials to Vercel
vercel env add RAPID_GATEWAY_MERCHANT_ID
vercel env add RAPID_GATEWAY_CHECKOUT_URL
vercel env add RAPID_GATEWAY_SIGNING_SALT

# Pull again to get the production values
vercel env pull --yes
```

### 2. Database Migration

Run the payment tracking migration:

```bash
# The migration is in: supabase/migrations/add_payment_tracking.sql
# This adds the following columns to premium_listings:
# - payment_amount (Numeric)
# - payment_txn_ref (Text, unique)
# - payment_status (Text: pending, confirmed, completed, failed)
# - payment_verified_at (Timestamp)
```

### 3. Test Payment Flow

1. **Development Testing:**
   ```bash
   npm run dev
   # Navigate to any listing and click "Boost to Premium"
   # Select payment method (Rapid Gateway is default)
   # Fill in founder details and click "Pay via Rapid Gateway"
   ```

2. **Test Transaction:**
   - Use Rapid Gateway's test credentials
   - Verify that callback returns to `/payment-success`

## Payment Flow

### User Initiates Premium Listing

```
User fills premium listing form
↓
Selects payment method (Rapid Gateway, JazzCash, etc.)
↓
Clicks "Pay"
```

### Rapid Gateway Payment Flow

```
1. Frontend calls POST /api/premium-listings/checkout
   └─ Validates cart items
   └─ Creates premium_listings with status='pending'
   └─ Returns paymentData if payment method is Rapid Gateway

2. Frontend calls POST /api/payment/rapid-gateway/initiate
   └─ Generates HMAC-SHA256 signature
   └─ Creates payment request
   └─ Returns redirect URL

3. User redirected to Rapid Gateway checkout
   └─ User completes payment

4. Rapid Gateway redirects to GET /api/payment/rapid-gateway/callback
   └─ Verifies signature (HMAC-SHA256)
   └─ Checks payment status
   └─ Updates premium_listings: status='confirmed'
   └─ Redirects to /payment-success page
```

### Manual Payment Flow

```
1. Frontend calls POST /api/premium-listings/checkout
   └─ Validates cart items
   └─ Creates premium_listings with status='pending'
   └─ Returns success message

2. User sees confirmation
3. Admin reviews and approves in dashboard
4. Payment status updated to 'confirmed'
```

## API Endpoints

### Checkout Endpoint

**POST** `/api/premium-listings/checkout`

Request:
```json
{
  "items": [
    {
      "listingId": "listing-123",
      "position": 1,
      "founderName": "John Doe",
      "founderEmail": "john@example.com",
      "founderPhone": "+92 300 1234567",
      "founderWebsite": "https://example.com",
      "founderTwitter": "@johndoe",
      "founderLinkedin": "https://linkedin.com/in/johndoe",
      "founderInstagram": "@johndoe",
      "founderFacebook": "https://facebook.com/johndoe",
      "founderTiktok": "@johndoe",
      "founderYoutube": "https://youtube.com/@johndoe",
      "founderGithub": "johndoe"
    }
  ],
  "paymentMethod": "rapid-gateway"
}
```

Response:
```json
{
  "success": true,
  "paymentRequired": true,
  "paymentMethod": "rapid-gateway",
  "initiatePaymentUrl": "/api/payment/rapid-gateway/initiate",
  "paymentData": {
    "premiumListingId": "premium-123",
    "amount": 5,
    "email": "john@example.com",
    "phone": "+92 300 1234567",
    "name": "John Doe"
  },
  "premiumListings": [...],
  "totalPrice": 5,
  "itemCount": 1
}
```

### Rapid Gateway Initiate Endpoint

**POST** `/api/payment/rapid-gateway/initiate`

Request:
```json
{
  "premiumListingId": "premium-123",
  "amount": 5,
  "email": "john@example.com",
  "phone": "+92 300 1234567",
  "name": "John Doe"
}
```

Response:
```json
{
  "success": true,
  "redirectUrl": "https://api.rapidgateway.com/checkout?...",
  "txnRef": "premium-123-1695123456789",
  "amount": 500
}
```

### Rapid Gateway Callback Endpoint

**GET/POST** `/api/payment/rapid-gateway/callback`

Query Parameters (GET):
- `txn_ref` - Transaction reference
- `amount` - Amount paid
- `status` - Payment status (success, failed, pending)
- `signature` - HMAC-SHA256 signature

Response (GET):
- Redirects to `/payment-success?txn_ref=...&listing_id=...&position=...&amount=...`

## Payment Statuses

### Premium Listing Status Transitions

```
pending → confirmed → (after 30 days) → expired
       ↘ failed (if payment fails)
```

- **pending**: Waiting for payment confirmation
- **confirmed**: Payment verified, listing is active
- **failed**: Payment failed, listing is not active
- **expired**: Premium period ended (after 30 days)

## Signature Verification

All payments from Rapid Gateway must be verified using HMAC-SHA256:

```typescript
const payload = `amount=500&status=success&txn_ref=premium-123-1695123456789`;
const expectedSignature = crypto
  .createHmac('sha256', RAPID_GATEWAY_SIGNING_SALT)
  .update(payload)
  .digest('hex');

const isValid = expectedSignature === receivedSignature;
```

## Success Page

After successful payment, users are redirected to `/payment-success` which displays:
- Transaction confirmation
- Transaction ID
- Amount paid
- Listing position
- Next steps
- Important notes about premium duration

## Admin Dashboard

Admins can:
- View all premium listings
- Filter by payment status
- Manually verify/reject payments
- View transaction history
- Issue refunds

## Testing Checklist

- [ ] Environment variables configured in Vercel
- [ ] Database migration applied
- [ ] Premium listing form shows payment method selector
- [ ] Rapid Gateway redirect works in development
- [ ] Callback endpoint receives payment confirmation
- [ ] Success page displays correctly
- [ ] Payment status updates in database
- [ ] Manual verification flow works as fallback
- [ ] Error handling works for failed payments

## Troubleshooting

### Payment not redirecting to Rapid Gateway

1. Check `RAPID_GATEWAY_SIGNING_SALT` is configured
2. Verify `RAPID_GATEWAY_MERCHANT_ID` is correct
3. Check `NEXT_PUBLIC_APP_URL` matches your domain

### Signature verification failing

1. Ensure signing salt matches Rapid Gateway's value
2. Verify payload format matches exactly (alphabetically sorted parameters)
3. Check timestamp is recent (within 5 minutes)

### Callback not being received

1. Verify callback URL is accessible from internet
2. Check firewall/security settings allow Rapid Gateway IP
3. Monitor logs at `/api/payment/rapid-gateway/callback`

### Premium listing not updating after payment

1. Check database has payment tracking columns
2. Verify transaction reference format in database
3. Review callback logs for errors

## Security Considerations

1. **Signature Verification**: All callbacks must verify HMAC-SHA256 signature
2. **HTTPS Only**: All payment endpoints require HTTPS in production
3. **PII Protection**: Founder phone/email stored securely in database
4. **CSRF Protection**: Use Next.js built-in CSRF protection
5. **Rate Limiting**: Implement rate limiting on payment endpoints
6. **Audit Logging**: Log all payment transactions for compliance

## Support

For issues with:
- **Rapid Gateway integration**: Contact Rapid Gateway support
- **JazzCash integration**: Contact JazzCash support
- **EasyPaisa integration**: Contact EasyPaisa support
- **RankBid implementation**: Check logs and error messages
