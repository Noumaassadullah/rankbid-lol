# Google OAuth Login Setup Guide

I've added Google Sign-In to your RankBid platform! Users can now login with their Google account.

## ✨ What's New

- 🔑 Sign in with Google on login page
- 🆕 Sign up with Google on signup page
- ⚡ Instant account creation with Google profile data
- 🔐 Secure OAuth token verification

---

## 📋 Setup Instructions

### Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable the "Google+ API"
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Choose **Web application**
6. Add authorized redirect URIs:
   - `http://localhost:3000` (development)
   - `https://yourdomain.com` (production)
7. Copy your **Client ID**

### Step 2: Add Environment Variable

Add to `.env.local`:
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id_here
```

**Important:** This is a `NEXT_PUBLIC_` variable, so it's safe to expose on the client side.

### Step 3: Test It!

1. Start your dev server: `npm run dev`
2. Go to `/login` or `/signup`
3. You should see the **"Sign in with Google"** button
4. Click it and complete Google OAuth flow
5. You'll be logged in and redirected home

---

## 🔄 How It Works

### Flow Diagram
```
User clicks "Sign in with Google"
           ↓
Google OAuth popup
           ↓
User authenticates
           ↓
Google sends credential token to your app
           ↓
App sends token to /api/auth/google
           ↓
Server verifies token with Google
           ↓
Server finds or creates user in database
           ↓
Server creates session
           ↓
User logged in!
```

### API Endpoint: `POST /api/auth/google`

**Request:**
```json
{
  "token": "google_credential_token"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "email": "user@gmail.com",
    "name": "User Name"
  },
  "token": "session_token"
}
```

---

## 🎯 User Experience

### First Time Google Login
1. User clicks "Sign in with Google"
2. Google popup appears
3. User selects their Google account
4. New account automatically created with:
   - Email from Google
   - Name from Google profile
   - Password placeholder (can't login with password)
5. Logged in and redirected home

### Existing Google Account
1. User clicks "Sign in with Google"
2. Google popup appears (if logged out)
3. User selects same Google account
4. Logged in and redirected home

---

## 📝 Database

When a user signs in with Google:
- New `User` record created if email doesn't exist
- Uses Google profile name if available
- Password field set to `"google_oauth"` (not used for login)
- `Session` created for 30 days
- User info stored in localStorage

---

## 🔧 Files Changed

### New Files
```
✅ app/api/auth/google/route.ts
✅ components/Providers.tsx
✅ GOOGLE_OAUTH_SETUP.md (this file)
```

### Modified Files
```
✅ app/login/page.tsx - Added Google login button
✅ app/signup/page.tsx - Added Google signup button
✅ app/layout.tsx - Wrapped with GoogleOAuthProvider
✅ package.json - Added Google OAuth packages
```

---

## 🛡️ Security

- ✅ Token verified server-side with Google
- ✅ Session tokens are cryptographically random
- ✅ HTTP-only cookies (can't be accessed by JavaScript)
- ✅ CSRF protection via SameSite cookies
- ✅ 30-day session expiration

---

## 🚀 Production Deployment

### Before deploying to production:

1. **Update authorized URIs in Google Cloud Console:**
   - Remove `http://localhost:3000`
   - Add your production domain: `https://yourdomain.com`

2. **Set environment variable on your host:**
   - Vercel: Add to Environment Variables in project settings
   - Other: Set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in your deployment

3. **Test on production domain** before announcing to users

---

## 🐛 Troubleshooting

### Issue: "Google login button not showing"
**Solution:** Check that `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set in `.env.local`

### Issue: "Google authentication failed"
**Solution:** 
- Verify Client ID is correct in `.env.local`
- Check that your domain is in authorized URIs in Google Cloud Console
- Make sure Google+ API is enabled

### Issue: "User already exists but different email"
**Solution:** This can't happen - we use email as the unique identifier. If someone tries to signup with same email via different method, they'll be linked to existing account.

### Issue: "Session expires too quickly"
**Solution:** Sessions are set to 30 days. Clear cookies and try again if needed.

---

## 📚 Learn More

- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [@react-oauth/google Documentation](https://www.npmjs.com/package/@react-oauth/google)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

---

## ✅ Checklist Before Launch

- [ ] Google Cloud project created
- [ ] OAuth Client ID generated
- [ ] `NEXT_PUBLIC_GOOGLE_CLIENT_ID` added to `.env.local`
- [ ] Tested login on `/login` page
- [ ] Tested signup on `/signup` page
- [ ] Verified user can submit products after Google login
- [ ] Verified user can vote after Google login
- [ ] Production domain added to authorized URIs
- [ ] Environment variable set in production

---

That's it! 🎉 Your app now has Google OAuth sign-in!
