# Admin Dashboard Guide

## Overview
The admin dashboard provides complete control over the RankBid platform. Access comprehensive statistics, manage listings, users, premium features, and moderation.

## Access

### Main Admin Dashboard
**URL:** `/admin`

### Premium Listings Management
**URL:** `/admin/premium`

### Authentication
Both dashboards require an admin key (stored in the `ADMIN_KEY` environment variable).

**Default Admin Key:** `admin-secret-key`

**To Change:** Set the `ADMIN_KEY` environment variable to your desired key.

```bash
export ADMIN_KEY="your-secure-admin-key"
```

## Features

### 1. Overview Tab
- **Total Users** - Count of all registered users
- **Total Listings** - Count of all submitted products
- **Total Votes** - Total votes cast across platform
- **Premium Listings** - Count with approved/pending breakdown

**Charts:**
- Votes over last 7 days (line chart)
- Listings by category (pie chart)

### 2. Listings Management
- **Search** - Find listings by title or description
- **View** - See all listing details including vote counts and clicks
- **Delete** - Remove listings and associated votes
- **Edit** - Update listing details (coming soon)

**Data Shown:**
- Title, Category, URL
- Total Votes & Day Votes
- Click Count
- Creation Date

### 3. Users Management
- **Search** - Find users by email or name
- **View** - See user activity stats
- **Delete** - Remove user accounts and all associated data

**Data Shown:**
- Email, Name, Join Date
- Vote Count (contributions)
- Active Sessions

### 4. Premium Listings
- **View Requests** - Filter by pending/approved/all
- **Approve** - Accept payment and activate premium features
- **Reject** - Decline request and notify founder
- **Details** - See founder info, price, position

**Premium Positions:**
- Position #1: $5 - Top spot with 4 social accounts
- Position #2: $3 - Second spot with 1 social account
- Position #3: $1 - Third spot with founder info only

### 5. Moderation (Coming Soon)
- Suspicious activity detection
- Vote pattern analysis
- Fraud prevention tools

## API Endpoints

### Admin Authentication
All admin endpoints require the `x-admin-key` header:
```
x-admin-key: your-admin-key
```

### GET `/api/admin/stats`
Returns dashboard statistics
```bash
curl -H "x-admin-key: admin-secret-key" https://yourapp.com/api/admin/stats
```

### GET `/api/admin/listings`
List all listings with pagination
```bash
curl -H "x-admin-key: admin-secret-key" \
  "https://yourapp.com/api/admin/listings?page=1&limit=20&search=query&category=Marketing"
```

### DELETE `/api/admin/listings`
Delete a listing
```bash
curl -X DELETE \
  -H "x-admin-key: admin-secret-key" \
  -H "Content-Type: application/json" \
  -d '{"listingId":"listing-id"}' \
  https://yourapp.com/api/admin/listings
```

### PATCH `/api/admin/listings`
Update listing details
```bash
curl -X PATCH \
  -H "x-admin-key: admin-secret-key" \
  -H "Content-Type: application/json" \
  -d '{
    "listingId":"listing-id",
    "title":"New Title",
    "category":"Marketing"
  }' \
  https://yourapp.com/api/admin/listings
```

### GET `/api/admin/users`
List all users with pagination
```bash
curl -H "x-admin-key: admin-secret-key" \
  "https://yourapp.com/api/admin/users?page=1&limit=20&search=email@example.com"
```

### DELETE `/api/admin/users`
Delete a user
```bash
curl -X DELETE \
  -H "x-admin-key: admin-secret-key" \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-id"}' \
  https://yourapp.com/api/admin/users
```

### GET `/api/admin/premium-listings`
Get premium listing requests
```bash
curl -H "x-admin-key: admin-secret-key" \
  "https://yourapp.com/api/admin/premium-listings?status=pending"
```
Status options: `pending`, `approved`, `rejected`

### PATCH `/api/admin/premium-listings`
Approve/reject premium request
```bash
curl -X PATCH \
  -H "x-admin-key: admin-secret-key" \
  -H "Content-Type: application/json" \
  -d '{
    "premiumListingId":"id",
    "status":"approved",
    "approvedBy":"admin"
  }' \
  https://yourapp.com/api/admin/premium-listings
```

### GET `/api/admin/moderation`
Get suspicious listings and activity
```bash
curl -H "x-admin-key: admin-secret-key" \
  https://yourapp.com/api/admin/moderation
```

## Security Best Practices

1. **Change Default Key** - Always change `ADMIN_KEY` in production
2. **Use HTTPS** - Admin endpoints should only work over HTTPS
3. **Limit Access** - Restrict admin URLs at the reverse proxy/firewall level
4. **Audit Logs** - Admin actions are not currently logged (coming soon)
5. **Browser Security** - Keys are stored in localStorage - use private browsing

## Future Improvements

- [ ] Audit logging for all admin actions
- [ ] Role-based access control (owner, moderator, viewer)
- [ ] 2FA for admin accounts
- [ ] Advanced analytics and reporting
- [ ] Scheduled reports via email
- [ ] Batch operations
- [ ] Backup and restore functionality
- [ ] Vote pattern anomaly detection

## Troubleshooting

### "Unauthorized" Error
- Check that the admin key is correct
- Ensure it matches the `ADMIN_KEY` environment variable
- Clear browser cache and try again

### Data Not Loading
- Check browser console for errors
- Verify database connection
- Ensure user has read permissions on all tables

### Cannot Approve Premium Listings
- Verify the premium_listings table exists in database
- Check that listing_id references valid listings
- Ensure ADMIN_KEY is properly set

## Support
For issues or questions, please contact the development team.
