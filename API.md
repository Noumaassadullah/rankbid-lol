# RankBid API Documentation

## Base URL

```
http://localhost:3000/api
```

---

## Listings Endpoints

### GET /listings

Fetch ranked listings with filtering and pagination.

**Query Parameters:**
- `category` (string, optional) - Filter by category (default: "All")
- `window` (string, optional) - Ranking window: "alltime" or "today" (default: "alltime")
- `limit` (number, optional) - Results per page, max 1000 (default: 100)
- `offset` (number, optional) - Pagination offset (default: 0)

**Example:**
```bash
GET /api/listings?category=AI&window=alltime&limit=50&offset=0
```

**Response:**
```json
[
  {
    "id": "clp1a2b3c4d5e6f7g8h9",
    "title": "ChatGPT",
    "description": "AI chatbot platform",
    "url": "https://openai.com/chat",
    "category": "AI",
    "favicon": "https://...",
    "logo": "https://...",
    "totalPaid": 1500000,
    "dayPaid": 250000,
    "clickCount": 5432,
    "createdAt": "2024-09-05T10:30:00Z",
    "lastRaisedAt": "2024-09-08T14:22:00Z",
    "rank": 1,
    "amountToOutrank": 1500500
  }
]
```

---

### POST /listings

Create a new product listing.

**Request Body:**
```json
{
  "title": "My Awesome App",
  "description": "The best app ever",
  "url": "https://myapp.com",
  "category": "Productivity",
  "userId": "user_123"
}
```

**Response:**
```json
{
  "id": "clp1a2b3c4d5e6f7g8h9",
  "title": "My Awesome App",
  "description": "The best app ever",
  "url": "https://myapp.com",
  "category": "Productivity",
  "totalPaid": 0,
  "dayPaid": 0,
  "clickCount": 0,
  "createdAt": "2024-09-08T18:45:00Z",
  "lastRaisedAt": "2024-09-08T18:45:00Z"
}
```

**Status Codes:**
- `201` - Created successfully
- `400` - Missing required fields or invalid URL
- `409` - URL already listed

---

## Payment Endpoints

### POST /payment/initiate

Start a new payment to claim/increase rank.

**Request Body:**
```json
{
  "listingId": "clp1a2b3c4d5e6f7g8h9",
  "amount": "1000",
  "method": "jazzcash",
  "userId": "user_123"
}
```

**Parameters:**
- `listingId` (string, required) - ID of listing to rank up
- `amount` (string, required) - Amount in PKR (e.g., "500", "2000")
- `method` (string, required) - "jazzcash" or "easypaisa"
- `userId` (string, required) - Current user ID

**Response:**
```json
{
  "paymentId": "pay_1a2b3c4d5e6f7g8h9",
  "checkoutURL": "https://sandbox.jazzcash.com.pk/...",
  "amount": "1000",
  "listingId": "clp1a2b3c4d5e6f7g8h9"
}
```

**Status Codes:**
- `200` - Payment initiated, redirect user to `checkoutURL`
- `400` - Invalid amount or missing fields
- `404` - Listing not found

**Important:**
- Minimum amount: Rs. 500
- To outrank #1: amount must be ≥ (current #1 amount + Rs. 500)
- All amounts in whole Rupees (no decimals)

---

### GET /payment/jazzcash/callback

JazzCash returns here after payment (user redirect).

**Query Parameters:**
- `paymentId` (string, required) - Payment ID from initiate request
- `status` (string) - Payment status from provider
- `transactionId` (string) - Transaction ID from JazzCash

**Behavior:**
- Verifies payment with JazzCash
- Updates payment status to "completed"
- Recalculates listing ranks
- Redirects to `/success` or `/error`

---

### POST /payment/jazzcash/callback

JazzCash sends webhook here (server-to-server).

**Request Body:**
```json
{
  "transactionId": "tx_123456",
  "status": "success",
  "amount": "500000"
}
```

**Response:**
```json
{
  "status": "received"
}
```

---

### GET /payment/easypaisa/callback

EasyPaisa returns here after payment (user redirect).

**Query Parameters:**
- `paymentId` (string, required)
- `status` (string) - "success" or "failed"
- `transactionId` (string)

**Behavior:**
- Same as JazzCash callback
- Verifies payment and updates database

---

### POST /payment/easypaisa/callback

EasyPaisa webhook (server-to-server).

**Request Body:**
```json
{
  "transactionId": "tx_987654",
  "status": "success"
}
```

---

## Data Models

### Listing

```typescript
{
  id: string;
  userId: string;
  title: string;
  description: string;
  url: string;                    // Normalized URL
  handle?: string;                // For @twitter handles
  category: Category;
  favicon?: string;
  logo?: string;
  totalPaid: number;              // All-time sum in cents
  dayPaid: number;                // Last 24h sum in cents
  clickCount: number;
  createdAt: Date;
  lastRaisedAt: Date;
  updatedAt: Date;
}
```

### Payment

```typescript
{
  id: string;
  userId: string;
  listingId: string;
  amount: number;                 // In cents
  method: "jazzcash" | "easypaisa";
  status: "pending" | "completed" | "failed";
  transactionId?: string;
  checkoutSessionId?: string;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### User

```typescript
{
  id: string;
  email: string;
  password: string;              // Hashed
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "error": "Error message",
  "code": "error_code"
}
```

**Common Errors:**

| Code | Status | Meaning |
|------|--------|---------|
| `MISSING_FIELDS` | 400 | Required field missing |
| `INVALID_URL` | 400 | URL not allowed (adult/scam) |
| `INVALID_AMOUNT` | 400 | Amount too low or invalid |
| `NOT_FOUND` | 404 | Listing or payment not found |
| `DUPLICATE` | 409 | URL already listed |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Examples

### Example 1: List a Product & Make Payment

```bash
# 1. Create listing
curl -X POST http://localhost:3000/api/listings \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My App",
    "description": "Cool product",
    "url": "https://myapp.com",
    "category": "AI",
    "userId": "user_123"
  }'

# Response:
# {
#   "id": "listing_1",
#   ...
# }

# 2. Initiate payment to claim #1
curl -X POST http://localhost:3000/api/payment/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "listingId": "listing_1",
    "amount": "2500",
    "method": "jazzcash",
    "userId": "user_123"
  }'

# Response:
# {
#   "paymentId": "pay_1",
#   "checkoutURL": "https://sandbox.jazzcash.com.pk/...",
#   ...
# }

# 3. User visits checkoutURL, completes payment
# 4. JazzCash redirects to /api/payment/jazzcash/callback?paymentId=pay_1&status=success
# 5. System updates database, redirects to /success
```

### Example 2: Get Current Rankings

```bash
curl "http://localhost:3000/api/listings?category=AI&window=alltime&limit=10"

# Returns top 10 AI products ranked by all-time payment
```

### Example 3: Get 24h Rolling Rankings

```bash
curl "http://localhost:3000/api/listings?window=today&limit=20"

# Returns top 20 products ranked by last 24 hours payment
```

---

## Amount Calculations

### In Rupees (Display)
```
PKR 500 = 50000 cents (in API)
PKR 2,500 = 250000 cents (in API)
```

### To Outrank #1
If #1 is Rs. 5,000, you need:
```
minAmount = 5000 + 500 = 5,500 Rs.
In cents: 550,000
```

---

## Rate Limiting

**Not yet implemented** - will add in production:
- 100 requests per minute per IP
- 10 payment initiations per minute per user

---

## Authentication

**Currently**: Uses `userId` in request body
**TODO**: Implement NextAuth for proper auth

---

## Testing with cURL

### Test Listing Creation
```bash
curl -X POST http://localhost:3000/api/listings \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Product",
    "description": "Test description",
    "url": "https://test.example.com",
    "category": "AI",
    "userId": "test_user_1"
  }'
```

### Test Payment Initiation
```bash
curl -X POST http://localhost:3000/api/payment/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "listingId": "YOUR_LISTING_ID",
    "amount": "1000",
    "method": "jazzcash",
    "userId": "test_user_1"
  }'
```

---

## Webhooks

### JazzCash Webhook

**URL**: `/api/payment/jazzcash/callback`
**Method**: POST
**Headers**:
- `Content-Type`: application/json

**Payload**:
```json
{
  "transactionId": "txn_12345",
  "status": "success",
  "amount": "50000"
}
```

**Expected Response**:
```json
{
  "status": "received"
}
```

### EasyPaisa Webhook

**URL**: `/api/payment/easypaisa/callback`
**Method**: POST

**Payload**:
```json
{
  "transactionId": "txn_67890",
  "status": "success"
}
```

---

## Future Enhancements

- [ ] Add GET `/listings/:id` for individual listing details
- [ ] Add PUT `/listings/:id` to update listing
- [ ] Add DELETE `/listings/:id` to remove listing
- [ ] Add GET `/rankings/daily/:date` for historical daily archives
- [ ] Add GET `/categories` for category list
- [ ] Add POST `/auth/signup` and `/auth/login`
- [ ] Add rate limiting middleware
- [ ] Add request validation middleware
- [ ] Add response compression

---

## Support

For issues or questions:
1. Check SETUP.md for configuration help
2. Review QUICK_START.md for common problems
3. Check Prisma Studio: `npm run db:studio`
4. Enable logs: Check server console for errors
