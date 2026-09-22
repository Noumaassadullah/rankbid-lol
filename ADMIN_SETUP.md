# Admin Dashboard Setup Guide

## Quick Start

### 1. Set Admin Key
Set your admin key in the environment variables:

```bash
export ADMIN_KEY="your-secure-admin-key-here"
```

Or in your `.env.local`:
```
ADMIN_KEY=your-secure-admin-key-here
```

**Default value (development):** `admin-secret-key`

### 2. Access Admin Dashboard

**Main Dashboard:** `https://yourapp.com/admin`
- View platform statistics
- Manage listings
- Manage users
- View premium listing requests

**Premium Management:** `https://yourapp.com/admin/premium`
- Approve/reject premium listing requests
- View founder information
- Track premium revenue

### 3. Login

1. Navigate to `/admin`
2. Enter your admin key
3. Click "Sign In"
4. Your key is securely stored in browser session

## Key Features

### Overview Dashboard
- **Stats Cards**: Total users, listings, votes, premium listings
- **Charts**: Daily voting trends and category distribution
- **Real-time Data**: Automatically updated

### Listings Management
- **Search**: Find listings by title or description
- **Sort**: By votes, date, category
- **Actions**: Delete malicious listings
- **Pagination**: View 20 listings per page

### Users Management
- **Search**: Find users by email or name
- **View Stats**: Vote count, active sessions
- **Delete**: Remove user accounts
- **Moderation**: Flag suspicious accounts

### Premium Listings
- **Status Filter**: Pending, Approved, All
- **Approve**: Activate premium features
- **Reject**: Decline request
- **Details**: Founder info, position, price

## API Usage

All admin API endpoints require the `x-admin-key` header.

### Example: Get Dashboard Stats
```bash
curl -H "x-admin-key: your-admin-key" \
  https://yourapp.com/api/admin/stats
```

### Example: Delete a Listing
```bash
curl -X DELETE \
  -H "x-admin-key: your-admin-key" \
  -H "Content-Type: application/json" \
  -d '{"listingId":"abc123"}' \
  https://yourapp.com/api/admin/listings
```

### Example: Approve Premium
```bash
curl -X PATCH \
  -H "x-admin-key: your-admin-key" \
  -H "Content-Type: application/json" \
  -d '{
    "premiumListingId":"xyz789",
    "status":"approved"
  }' \
  https://yourapp.com/api/admin/premium-listings
```

## Security Checklist

- [ ] Change default admin key in production
- [ ] Use HTTPS only (not HTTP)
- [ ] Restrict `/admin` path at reverse proxy/firewall level
- [ ] Use strong, unique admin keys
- [ ] Rotate keys periodically
- [ ] Monitor access logs for suspicious activity
- [ ] Enable 2FA if available (coming soon)

## Database Tables

The admin dashboard works with these tables:
- `users` - User accounts
- `listings` - Submitted products
- `user_votes` - User voting records
- `premium_listings` - Premium feature requests
- `sessions` - User sessions

## Troubleshooting

### "Unauthorized" Error
- Check admin key matches `ADMIN_KEY` environment variable
- Clear browser cache
- Try incognito/private window

### Charts Not Loading
- Ensure database has data
- Check browser console for errors
- Verify database connection

### Can't Delete Listing
- Ensure listing exists
- Check admin key has permission
- Verify database integrity

### Premium Features Not Working
- Verify `premium_listings` table exists
- Check listing relationship
- Ensure founder info is populated

## Next Steps

1. Log in to `/admin` with your admin key
2. Review statistics and active listings
3. Check pending premium requests
4. Set up automated moderation alerts (coming soon)
5. Configure backup procedures

## Support

For issues or feature requests, contact the development team or check `ADMIN_DASHBOARD.md` for detailed documentation.
