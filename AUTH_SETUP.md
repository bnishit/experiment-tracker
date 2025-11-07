# Authentication Setup Guide

## Quick Setup

### 1. Get Supabase Auth Credentials

1. Go to your Supabase project dashboard
2. Click **Project Settings** (gear icon) → **API**
3. Copy:
   - **Project URL** → Add to `.env` as `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → Add to `.env` as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Disable Public Signups

1. In Supabase dashboard, go to **Authentication** → **Settings**
2. Under **Auth Providers** → **Email**, make sure **"Enable email signup"** is **OFF**
3. This prevents new users from signing up - only you can create users

### 3. Create Admin Users (Your PMs)

1. Go to **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter:
   - **Email**: PM's email address
   - **Password**: Set a secure password (they can change it later)
   - **Auto Confirm User**: ✅ Check this (so they can log in immediately)
4. Click **Create user**

### 4. Share Login Credentials

Share with your PMs:
- **Login URL**: `https://your-domain.com/login` (or `http://localhost:3000/login` for dev)
- **Email**: The email you created
- **Password**: The password you set (they should change it after first login)

## How It Works

- **Public routes** (`/`): Anyone can view experiments (no auth needed)
- **Admin routes** (`/admin`): Protected - requires login
- **Login page** (`/login`): Only accessible if not logged in
- **No signups**: Users can only be created by you in Supabase dashboard

## Security Notes

- The anon key is safe to expose in client-side code (it's public by design)
- Supabase handles password hashing and security
- Sessions are managed via secure HTTP-only cookies
- Middleware protects admin routes server-side

## Troubleshooting

**Can't log in?**
- Verify user exists in Supabase Authentication → Users
- Check that email/password are correct
- Make sure "Auto Confirm User" was checked when creating the user

**Getting redirected?**
- If logged in and visiting `/login`, you'll be redirected to `/admin`
- If not logged in and visiting `/admin`, you'll be redirected to `/login`

**Want to change a user's password?**
- Go to Supabase → Authentication → Users
- Click on the user → **Reset password** or **Update user**

