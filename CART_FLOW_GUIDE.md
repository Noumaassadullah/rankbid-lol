# Complete Shopping Cart Flow - RankBid Premium Listings

## Overview
This guide shows the complete website flow for the new shopping cart feature that allows users to purchase multiple premium listings at once.

---

## 🛒 Complete User Flow

### **Step 1: Browse Listings (Home Page)**
```
URL: /
User sees the main listing feed with products
```

**Features:**
- See all listings with voting counts
- Browse by categories
- Search for products
- See premium listings at the top

---

### **Step 2: Boost a Listing to Premium**
```
User clicks "Boost to Premium" button on any listing
```

**What appears:**
- Modal opens: "Boost to Premium"
- Shows 3 position options:
  - #1 Position → $5
  - #2 Position → $3
  - #3 Position → $1

**User fills in:**
- Required: Founder Name, Email, Phone
- Optional: Website, Twitter, LinkedIn, Instagram, GitHub, etc.

**Available Actions:**
1. **"🛒 Add to Cart"** - Save to cart for later checkout
2. **"💳 Pay $X & Submit Now"** - Pay immediately (existing flow)

---

### **Step 3a: Add to Cart (New Feature)**
```
User clicks "Add to Cart" button
```

**What happens:**
1. ✅ Item added to shopping cart
2. Success message appears: "✓ Added 'Product Name' to cart!"
3. Modal closes
4. Cart icon in header updates with count

**Cart Badge Shows:**
- Number of items in cart
- Updates in real-time

---

### **Step 3b: View Shopping Cart**
```
User clicks cart icon in header (or navigates to /cart)
```

**Cart Page Shows:**
- List of all items in cart
- For each item:
  - Product name
  - Founder information
  - Current position selection (editable)
  - Price
  - Remove button
  - Social media details

**Order Summary Panel (Right Sidebar):**
- Itemized breakdown of each product
- Subtotal calculation
- Total amount due
- "Manual Verification" info
- **Checkout button** with total
- Clear Cart button

---

### **Step 4: Edit Cart Items (Optional)**
```
User can modify items before checkout
```

**Editable:**
- Position (1, 2, or 3) - price updates automatically
- Can remove individual items with trash icon

**Cannot Edit:**
- Founder information (can remove & add different listing instead)

---

### **Step 5: Checkout**
```
User clicks "💳 Checkout • $[Total]" button
```

**Checkout Process:**
1. **Validation:**
   - All items checked for required fields
   - Minimum price verification

2. **Submit to API:**
   - `POST /api/premium-listings/checkout`
   - Sends all items in cart

3. **API Response:**
   - Creates premium_listings records in database
   - All marked as "pending" status
   - Admin notified for payment verification

4. **Success:**
   - Success message displays
   - Cart clears automatically
   - Redirect to home page after 2 seconds

---

## 📊 Complete Data Flow

### **User Actions → State Management → API → Database**

```
┌─────────────────┐
│  Browse Page    │
│  (Home, /cart)  │
└────────┬────────┘
         │
    [Click "Add to Cart" or "Boost"]
         │
    ┌────▼─────────────────────┐
    │   CartContext (React)    │
    │  - items[]               │
    │  - addItem()             │
    │  - removeItem()          │
    │  - updateItem()          │
    │  - clearCart()           │
    │  - totalPrice            │
    └────┬─────────────────────┘
         │
  [LocalStorage Cache]
         │
    ┌────▼──────────────────────────┐
    │  Cart Page (/cart)            │
    │  - Display all items          │
    │  - Edit positions/prices      │
    │  - Checkout button            │
    └────┬───────────────────────────┘
         │
  [Click Checkout]
         │
    ┌────▼────────────────────────────────────┐
    │  POST /api/premium-listings/checkout    │
    │  - Validate all items                  │
    │  - Check required fields               │
    │  - Verify positions & prices           │
    └────┬─────────────────────────────────────┘
         │
    ┌────▼──────────────────────┐
    │  Database (PostgreSQL)    │
    │  INSERT into:             │
    │  premium_listings         │
    │  - listing_id             │
    │  - position (1/2/3)       │
    │  - founder data           │
    │  - payment_status:pending │
    │  - amount ($)             │
    └──────────────────────────┘
```

---

## 🔧 Technical Components

### **Frontend Files Created:**

1. **contexts/CartContext.tsx**
   - React Context for cart state management
   - Methods: addItem, removeItem, updateItem, clearCart
   - LocalStorage persistence
   - Exports: CartProvider, useCart hook

2. **components/CartButton.tsx**
   - Shopping cart icon with badge
   - Shows item count
   - Links to /cart page

3. **app/cart/page.tsx**
   - Cart page component
   - Displays all cart items
   - Order summary panel
   - Checkout functionality

4. **components/PremiumListingModal.tsx** (Updated)
   - Added "Add to Cart" button
   - New handler: handleAddToCart()
   - Success message display

5. **components/Header.tsx** (Updated)
   - Added CartButton import
   - Added cart link in mobile menu

6. **components/Providers.tsx** (Updated)
   - Wrapped with CartProvider

### **Backend Files Created:**

1. **app/api/premium-listings/checkout/route.ts**
   - `POST /api/premium-listings/checkout`
   - Accepts multiple items
   - Validates all data
   - Creates database records
   - Returns success/error response

2. **app/api/premium-listings/submit/route.ts**
   - `POST /api/premium-listings/submit`
   - Single item submission
   - Used by "Pay Now" button

---

## 💾 Database Schema

The system uses existing table: `premium_listings`

```sql
CREATE TABLE premium_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id),
  position INT NOT NULL (1, 2, or 3),
  founder_name VARCHAR NOT NULL,
  founder_email VARCHAR NOT NULL,
  founder_phone VARCHAR NOT NULL,
  founder_website VARCHAR,
  founder_twitter VARCHAR,
  founder_linkedin VARCHAR,
  founder_instagram VARCHAR,
  founder_facebook VARCHAR,
  founder_tiktok VARCHAR,
  founder_youtube VARCHAR,
  founder_github VARCHAR,
  payment_status VARCHAR DEFAULT 'pending' (pending/approved/rejected),
  payment_amount DECIMAL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP,
  approved_by VARCHAR,
  UNIQUE(listing_id) -- Only one premium listing per product
);
```

---

## 🧪 Testing the Complete Flow

### **Test Case 1: Single Item Purchase**
```
1. Go to home page (/)
2. Find any listing
3. Click "Boost to Premium"
4. Fill in founder info
5. Click "🛒 Add to Cart"
6. Verify cart icon shows "1"
7. Click cart icon
8. See cart page with item
9. Click "Checkout"
10. Verify success message
11. Verify cart clears
12. Verify redirect to home
```

### **Test Case 2: Multiple Items**
```
1. Add listing #1 to cart (Position #1, $5)
2. Add listing #2 to cart (Position #2, $3)
3. Add listing #3 to cart (Position #3, $1)
4. Cart icon shows "3"
5. Go to /cart
6. Verify all 3 items displayed
7. Verify subtotal = $9
8. Click checkout
9. Verify all 3 submitted to API
10. Check database for 3 new records
```

### **Test Case 3: Edit Cart**
```
1. Add item at position #1 ($5)
2. Go to cart
3. Change position to #2 ($3)
4. Verify price updates to $3
5. Verify total updates
6. Checkout with updated price
7. Verify database has position 2
```

### **Test Case 4: Remove from Cart**
```
1. Add 3 items to cart
2. Go to cart (shows 3 items, total $9)
3. Click trash icon on item #2
4. Verify item removed
5. Verify count shows 2 items, total $6
6. Checkout with remaining 2
```

### **Test Case 5: Clear Cart**
```
1. Add 3 items
2. Go to cart
3. Click "Clear Cart"
4. Confirm prompt
5. Verify all items removed
6. See "Cart is Empty" message
```

### **Test Case 6: Pay Now (Original Flow)**
```
1. Go to home page
2. Click "Boost to Premium"
3. Fill in founder info
4. Click "💳 Pay $X & Submit Now"
5. Verify payment processing
6. Verify modal closes
7. Verify database record created
```

---

## 🚀 Features Summary

| Feature | Status | Location |
|---------|--------|----------|
| Browse Listings | ✅ Existing | `/` |
| Add to Cart | ✅ New | Premium Modal |
| View Cart | ✅ New | `/cart` |
| Edit Positions | ✅ New | Cart Page |
| Remove Items | ✅ New | Cart Page |
| Checkout | ✅ New | `/api/premium-listings/checkout` |
| Pay Now | ✅ Existing | Premium Modal |
| Cart Badge | ✅ New | Header |
| Order Summary | ✅ New | Cart Page |
| Mobile Responsive | ✅ New | All Pages |

---

## 📱 URLs Reference

| Page | URL | Purpose |
|------|-----|---------|
| Home | `/` | Browse listings, add to cart |
| Cart | `/cart` | View, edit, checkout cart |
| Premium Modal | Modal | Add items to cart or pay now |

---

## 🔗 API Endpoints

### **Checkout (Multiple Items)**
```
POST /api/premium-listings/checkout
Content-Type: application/json

{
  "items": [
    {
      "listingId": "uuid",
      "position": 1,
      "founderName": "John",
      "founderEmail": "john@example.com",
      "founderPhone": "+92 300 1234567",
      "founderWebsite": "https://example.com",
      "founderTwitter": "@handle",
      ...
    }
  ]
}

Response: {
  "success": true,
  "message": "Successfully submitted 3 premium listings for review",
  "premiumListings": [...],
  "totalPrice": 9,
  "itemCount": 3
}
```

### **Submit (Single Item)**
```
POST /api/premium-listings/submit
Content-Type: application/json

{
  "listingId": "uuid",
  "position": 1,
  "founderName": "John",
  ...
}

Response: {
  "success": true,
  "premiumListing": {...}
}
```

---

## ✨ Next Steps (Optional Enhancements)

1. **Payment Gateway Integration**
   - Connect to Stripe/PayPal
   - Automatic payment processing
   - Webhook for payment confirmation

2. **Email Notifications**
   - Confirmation email on submission
   - Admin notification for pending items
   - Approval notification to user

3. **Dashboard**
   - User can see their submitted listings
   - Track payment status
   - Edit submissions

4. **Coupon/Discount System**
   - Apply discount codes
   - Bundle discounts
   - Seasonal promotions

5. **Analytics**
   - Track cart abandonment
   - Monitor checkout conversion
   - Revenue reporting
