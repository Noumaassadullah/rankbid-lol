# Rapid Gateway Setup Checklist

## ✅ Step 1: Collect Your Credentials

From your **Rapid Gateway Dashboard**, get:

- **Merchant ID** (numeric, e.g., `384`)
- **Client Secret** (OAuth2 secret)  
- **Signing Salt** (already set: `728de1acd1c3a044ec243388fa9da52c69b45a4c5ea023f87207dc63b2b87ada`)

## ✅ Step 2: Add to Vercel

```bash
vercel env add RAPID_GATEWAY_MERCHANT_ID
# Enter your merchant ID

vercel env add RAPID_GATEWAY_CLIENT_SECRET  
# Enter your client secret

vercel env add RAPID_GATEWAY_MERCHANT_NAME
# Enter "RankBid" or your name

vercel env pull --yes
```

## ✅ Step 3: Update Webhook URL

Rapid Gateway Dashboard → Settings → Webhooks:
```
https://rankbid.vercel.app/api/payment/rapid-gateway/callback
```
(Replace `rankbid` with your Vercel domain)

## ✅ Step 4: Database Migration

Run this SQL in your database:

```sql
ALTER TABLE premium_listings ADD COLUMN IF NOT EXISTS payment_amount NUMERIC(10, 2);
ALTER TABLE premium_listings ADD COLUMN IF NOT EXISTS payment_txn_ref TEXT UNIQUE;
ALTER TABLE premium_listings ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE premium_listings ADD COLUMN IF NOT EXISTS payment_verified_at TIMESTAMP WITH TIME ZONE;
CREATE INDEX IF NOT EXISTS idx_premium_listings_payment_txn_ref ON premium_listings(payment_txn_ref);
```

## ✅ Step 5: Test

```bash
npm run dev
```

- Open any listing → Click "💎 Boost to Premium"
- Enter phone as `03XXXXXXXXX` (e.g., `03001234567`)
- Select position and pay
- Should redirect to Rapid Gateway

## 📋 Your Credentials Template

Ready to add your credentials to Vercel? Provide:

```
Merchant ID: __________
Client Secret: __________
Merchant Name: __________
Vercel Domain: __________
```
