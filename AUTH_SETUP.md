# Authentication Setup Guide

I've added a complete login system to RankBid! Here's what was implemented:

## What's New

### Pages Created
- **`/login`** - Sign in page for existing users
- **`/signup`** - Create a new account page

### Database Changes
- Added `User` model to store user accounts (email, password, name)
- Added `Session` model to track user sessions
- Run migrations to apply schema changes

### Features
- ✅ User registration with email and password
- ✅ User login with session management
- ✅ Users must be logged in to submit products
- ✅ Users must be logged in to vote
- ✅ Login status shows in header with user name
- ✅ Logout button in header
- ✅ Demo account for testing

## Setup Instructions

### 1. Set up Database Environment Variable
Add to your `.env.local`:
```
DATABASE_URL=your_postgresql_url
```

### 2. Generate Prisma Client Types
```bash
npx prisma generate
```

This updates TypeScript types for the new User and Session models.

### 3. Create Database Tables
```bash
npm run db:push
```

This will:
- Create the `users` and `sessions` tables
- Seed a demo user account (demo@rankbid.com / demo123)

### 3. Demo Account
Use these credentials to test:
- **Email:** demo@rankbid.com
- **Password:** demo123

## File Structure

```
app/
├── login/page.tsx                 # Login page
├── signup/page.tsx                # Signup page
├── api/
│   └── auth/
│       ├── login/route.ts         # Login API endpoint
│       ├── signup/route.ts        # Signup API endpoint
│       └── me/route.ts            # Check current user session
└── utils/
    └── auth.ts                    # Auth utility functions
components/
└── Header.tsx                     # Updated with login/logout buttons
prisma/
├── schema.prisma                  # Added User and Session models
└── seed.js                        # Demo user seeding script
```

## How It Works

### Authentication Flow
1. User signs up or logs in via the login/signup pages
2. Server creates a session token and stores it in the database
3. Session token is set as an HTTP-only cookie
4. User info is stored in localStorage for client-side checks
5. Form submission and voting require logged-in user

### Protected Features
- **Submit Product Form**: Hidden until user logs in (shows login prompt)
- **Vote Button**: Shows "Login to Vote" link if not logged in
- **Header**: Shows user name and logout button when logged in

## API Endpoints

### POST `/api/auth/signup`
Create a new user account
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe" // optional
}
```

### POST `/api/auth/login`
Sign in with email and password
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

### GET `/api/auth/me`
Check if user is logged in (requires auth_token cookie)
Returns current user info if authenticated

## Next Steps

### Optional Enhancements
1. Add "Remember me" functionality
2. Add password reset flow
3. Add email verification
4. Add OAuth (Google, GitHub login)
5. Add two-factor authentication
6. Add user profile page

### Security Notes
- Passwords are hashed with bcryptjs
- Session tokens are stored in HTTP-only cookies
- Sessions expire after 30 days
- CSRF protection via SameSite cookies

## Troubleshooting

### Issue: DATABASE_URL not found
**Solution:** Make sure `.env.local` is created with your PostgreSQL connection string

### Issue: Demo user not created
**Solution:** Run `npm run db:seed` manually

### Issue: User stays logged in after refresh
**Solution:** This is expected - session is persisted in localStorage and database. To logout, click the logout button.

## Questions?
Check the following files for implementation details:
- `app/utils/auth.ts` - Authentication utilities
- `app/api/auth/login/route.ts` - Login endpoint logic
- `app/login/page.tsx` - Login UI component
- `app/page.tsx` - Protected form and vote sections
