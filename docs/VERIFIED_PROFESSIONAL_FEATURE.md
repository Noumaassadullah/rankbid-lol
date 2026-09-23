# Verified & Professional User Feature Documentation

## Overview

The Verified & Professional User feature enables creators and business professionals to be identified on RankBid with a blue checkmark badge, display their contact information, and showcase their social media presence. This allows other users to discover and contact verified professionals directly.

## Subscription Tiers

### Free Tier (Default)
- Community voting access
- View rankings and categories
- No verification badge
- No public contact information displayed

### Verified Tier ($4.99/mo)
- **Blue checkmark badge** ✓
- **Public profile** with contact information
  - Email address
  - Phone number (optional)
- **Social media links** (up to 4 platforms)
  - Website
  - Twitter/X
  - LinkedIn
  - Instagram
  - Facebook
  - TikTok
  - YouTube
  - GitHub
- **Premium listing card** display
- Highlighted in search results

### Professional Tier ($14.99/mo)
- Everything in Verified tier PLUS:
- **All social media links** displayed (no limit)
- **#1 ranking position** on all platform submissions
- **Premium visibility** with enhanced listing card styling
- Direct contact integration
- Priority support

## Database Schema

### User Model Updates

```prisma
model User {
  // ... existing fields ...
  
  // Subscription tier: 'free' | 'verified' | 'professional'
  tier      String   @default("free")
  
  // Contact information
  phone     String?
  website   String?
  twitter   String?
  linkedin  String?
  instagram String?
  facebook  String?
  tiktok    String?
  youtube   String?
  github    String?
  
  // Relations
  listings   Listing[]
}
```

### Listing Model Updates

```prisma
model Listing {
  // ... existing fields ...
  
  // Track listing creator
  userId        String?   @map("user_id")
  user          User?     @relation(fields: [userId], references: [id], onDelete: SetNull)
  
  // Premium/Founder information (backward compatible)
  isPremium     Boolean   @default(false)
  premiumPosition Int?
  founderName   String?
  founderEmail  String?
  founderPhone  String?
  founderWebsite String?
  founderTwitter String?
  founderLinkedin String?
  founderInstagram String?
  founderFacebook String?
  founderTiktok String?
  founderYoutube String?
  founderGithub String?
}
```

## Components

### VerifiedBadge Component

Displays a blue checkmark badge indicating user verification status.

```tsx
<VerifiedBadge 
  tier="verified" | "professional"
  size="sm" | "md" | "lg"  // default: "md"
/>
```

**Props:**
- `tier`: User's subscription tier ('verified' or 'professional')
- `size`: Badge size (sm: 16px, md: 20px, lg: 24px)

**Features:**
- Responsive sizing
- Accessible title attribute with tier description
- Consistent blue color (#3B82F6)

### VerifiedListingCard Component

Enhanced listing card that displays verified/professional user information with contact details.

```tsx
<VerifiedListingCard
  listing={{
    id: string;
    title: string;
    url: string;
    totalVotes: number;
    dayVotes?: number;
    category: string;
    platform: string;
  }}
  user={{
    id: string;
    name: string | null;
    email: string;
    tier: 'verified' | 'professional';
    phone?: string | null;
    website?: string | null;
    twitter?: string | null;
    linkedin?: string | null;
    instagram?: string | null;
    facebook?: string | null;
    tiktok?: string | null;
    youtube?: string | null;
    github?: string | null;
  }}
  position: number;
  onVote: (listingId: string) => void;
  hasVoted: boolean;
/>
```

**Features:**
- Gradient background (blue for Verified, purple for Professional)
- Tier badge in top-right corner
- User name and tier indicator
- Clickable email and phone links
- Social media icon links
- Vote button with state management
- Responsive grid layout (1 column mobile, 3 columns desktop)

### ProfileEditor Component

Modal dialog for users to edit their profile and contact information.

```tsx
<ProfileEditor onClose={() => void} />
```

**Features:**
- Edit name, phone, website
- Add/edit social media handles
- Display current tier
- Client-side validation
- Success/error feedback
- Auto-close on successful save

## API Endpoints

### GET /api/user/profile

Fetch user profile information (requires authentication).

**Headers:**
- `x-user-id`: User ID from localStorage

**Response:**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "name": "John Doe",
  "tier": "verified",
  "phone": "+1 (555) 000-0000",
  "website": "https://example.com",
  "twitter": "@username",
  "linkedin": "https://linkedin.com/in/...",
  "instagram": "@username",
  "facebook": "https://facebook.com/...",
  "tiktok": "@username",
  "youtube": "https://youtube.com/...",
  "github": "@username"
}
```

### PUT /api/user/profile

Update user profile information (requires authentication).

**Headers:**
- `x-user-id`: User ID from localStorage
- `Content-Type`: application/json

**Request Body:**
```json
{
  "name": "John Doe",
  "phone": "+1 (555) 000-0000",
  "website": "https://example.com",
  "twitter": "@username",
  "linkedin": "https://linkedin.com/in/...",
  "instagram": "@username",
  "facebook": "https://facebook.com/...",
  "tiktok": "@username",
  "youtube": "https://youtube.com/...",
  "github": "@username"
}
```

**Response:** Updated user profile object

## Integration Points

### Home Page Listings
When displaying verified/professional listings:

1. Check user tier on listing
2. If `user.tier === 'verified' || user.tier === 'professional'`:
   - Display `<VerifiedListingCard />` instead of regular listing card
   - Include user contact information
   - Show social media links based on tier

### User Settings/Profile Page
1. Add button to open `<ProfileEditor />`
2. Load user profile via GET /api/user/profile
3. Handle profile updates with PUT /api/user/profile
4. Display current tier and tier benefits

### Social Media Display Logic

**Verified Users (Tier 2):**
- Show up to 4 social media links
- Prioritize: Website, Twitter, LinkedIn, Instagram

**Professional Users (Tier 3):**
- Show all available social media links
- No limit on number of platforms
- Featured prominently on #1 ranking positions

## Contact Display

### Public Display
- Email address (clickable `mailto:` link)
- Phone number (clickable `tel:` link)
- Social media links (opens in new tab)

### Privacy & Consent
Users explicitly choose what contact information to display:
- Only visible if user fills in the field
- Users can remove information at any time
- No automatic data exposure

## Tier Management

### Current Implementation
Tiers are manually set in the database. Future enhancements:

1. **Stripe Integration**
   - Automatic tier assignment on payment
   - Subscription management
   - Billing portal

2. **Tier Verification**
   - Email verification for Verified tier
   - Business account verification for Professional tier
   - 2+ week activity check for Verified tier

3. **Tier Badges**
   - Display on user profile
   - Show next to listings
   - Include in notifications

## Future Enhancements

1. **Premium Listing Display**
   - Professional users listed #1 on platform pages
   - Featured section for verified users
   - Search filtering by tier

2. **Analytics**
   - Contact click tracking for users
   - Listing performance by tier
   - Social media click analytics

3. **Direct Messaging**
   - In-app messaging between users
   - Email forwarding for privacy
   - Message threading

4. **Verification Status**
   - Email verification
   - Phone verification
   - Business registration verification

5. **Tier Recommendations**
   - Automatic tier suggestions based on activity
   - Performance metrics
   - ROI calculator

## Migration Guide

### For Existing Data
1. All users default to `tier: 'free'`
2. Existing founder information in listings remains unchanged
3. Manual tier assignment via database:
   ```sql
   UPDATE users SET tier = 'verified' WHERE id = 'user_id';
   ```

### For New Users
1. Sign up creates `tier: 'free'` by default
2. Users can upgrade via payment (Stripe integration needed)
3. Auto-upgrade to 'verified' after 2+ weeks + 10 votes (optional)

## Styling & Branding

### Colors
- Verified Badge: Blue (#3B82F6)
- Professional Badge: Purple (#A855F7)
- Verified Card Background: Blue gradient (from-blue-100 to-blue-200)
- Professional Card Background: Purple gradient (from-purple-100 to-purple-200)

### Typography
- Badge: Bold, uppercase
- User Name: Bold, larger than regular listings
- Contact Info: Small text, muted gray
- Social Links: Inline icons with hover effects

## Testing Checklist

- [ ] User can edit profile with ProfileEditor
- [ ] Contact information saves correctly
- [ ] Social media links format correctly
- [ ] VerifiedBadge displays correctly for both tiers
- [ ] VerifiedListingCard shows all tiers correctly
- [ ] Email and phone links work
- [ ] Social media links open in new tabs
- [ ] Responsive design works on mobile/tablet/desktop
- [ ] User tier persists across sessions
- [ ] Tier benefits display correctly

## Performance Considerations

1. **Database Queries**
   - Include user profile in listing queries (select specific fields)
   - Cache user tier in session/cookies
   - Index `users.tier` for filtering

2. **API Optimization**
   - Use select to avoid fetching unnecessary fields
   - Implement rate limiting on profile updates
   - Cache profile data for 5 minutes

3. **Component Rendering**
   - Memoize VerifiedBadge components
   - Lazy load ProfileEditor modal
   - Use CSS for gradient backgrounds instead of images

## Support & Documentation

For users:
- Show tier badge tooltip on hover
- Display tier benefits on upgrade page
- Provide tier comparison table
- Include FAQ on profile page

For developers:
- This documentation
- Component prop TypeScript interfaces
- API endpoint response examples
- Database schema comments
