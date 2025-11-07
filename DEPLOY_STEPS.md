# Step-by-Step Deployment Guide

## ✅ Step 1: Create GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the **"+"** icon → **"New repository"**
3. Name it: `experiment-tracker` (or any name you prefer)
4. Make it **Private** or **Public** (your choice)
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click **"Create repository"**

## ✅ Step 2: Push Code to GitHub

After creating the repo, GitHub will show you commands. Run these in your terminal:

```bash
cd /Users/nishitbhatt/Documents/projects/experiment-tracker

# Add your GitHub repo as remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Or if you prefer SSH:**
```bash
git remote add origin git@github.com:YOUR_USERNAME/REPO_NAME.git
git branch -M main
git push -u origin main
```

## ✅ Step 3: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (use GitHub to sign in for easiest setup)
2. Click **"Add New Project"** or **"Import Project"**
3. Select your GitHub repository (`experiment-tracker`)
4. Vercel will auto-detect:
   - Framework: Next.js ✅
   - Build Command: `npm run build` ✅
   - Output Directory: `.next` ✅

## ✅ Step 4: Add Environment Variables

**Before clicking Deploy**, click **"Environment Variables"** and add these 3:

1. **DATABASE_URL**
   - Value: `postgresql://postgres:Nishit.123@db.peyovrwqjjhgjivnbjlm.supabase.co:5432/postgres?sslmode=require`
   - Environment: Select **Production**, **Preview**, and **Development** (all three)

2. **NEXT_PUBLIC_SUPABASE_URL**
   - Value: `https://peyovrwqjjhgjivnbjlm.supabase.co`
   - Environment: Select **Production**, **Preview**, and **Development** (all three)

3. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBleW92cndxampoZ2ppdm5iamxtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MDA5NTQsImV4cCI6MjA3ODA3Njk1NH0.Qb1nZ-Uv0DAyBoATvoUB88oV6B37tfyYE9EslSaXIj4`
   - Environment: Select **Production**, **Preview**, and **Development** (all three)

## ✅ Step 5: Deploy

1. Click **"Deploy"** button
2. Wait 2-3 minutes for build to complete
3. You'll get a URL like: `https://experiment-tracker-xyz.vercel.app`

## ✅ Step 6: Run Database Migrations (One-Time)

After first deployment, you need to run migrations:

**Option A: Using Vercel CLI (Recommended)**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Pull env vars and run migrations
cd /Users/nishitbhatt/Documents/projects/experiment-tracker
vercel env pull .env.local
npx prisma db push
```

**Option B: Using Supabase SQL Editor**
- Go to Supabase Dashboard → SQL Editor
- Run the schema from `prisma/schema.prisma` manually (not recommended, use Option A)

## ✅ Step 7: Update Supabase Auth Settings

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Add your Vercel URL to **Redirect URLs**:
   - `https://your-app.vercel.app/**`
   - `https://your-app.vercel.app/login`
   - `https://your-app.vercel.app/admin`

## ✅ Step 8: Test Your Deployment

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Test public dashboard (should work)
3. Test login: `https://your-app.vercel.app/login`
4. Test admin: `https://your-app.vercel.app/admin` (should redirect to login if not authenticated)

## 🎉 Done!

Your app is now live! Every time you push to GitHub, Vercel will automatically redeploy.

## Troubleshooting

**Build fails?**
- Check Vercel build logs
- Make sure all env vars are set correctly
- Verify `package.json` has all dependencies

**Database connection fails?**
- Double-check `DATABASE_URL` in Vercel env vars
- Make sure Supabase allows external connections

**Auth not working?**
- Verify Supabase URL and anon key in Vercel
- Check Supabase → Authentication → URL Configuration
- Make sure Vercel URL is in allowed redirect URLs

