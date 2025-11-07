# Database Check Guide

## ✅ Database Status

Your database is set up and in sync! The tables exist.

## Where to See Your Data

### Option 1: Supabase Dashboard (Easiest)
1. Go to your Supabase project: https://supabase.com/dashboard/project/peyovrwqjjhgjivnbjlm
2. Click **Table Editor** in the left sidebar
3. You should see two tables:
   - `Experiment` - Your experiments
   - `Version` - Version history

### Option 2: Prisma Studio (Local)
```bash
cd experiment-tracker
npx prisma studio
```
This opens a browser at http://localhost:5555 where you can view/edit data.

### Option 3: Check Production API
Visit your Vercel URL:
- `https://your-app.vercel.app/api/experiments`

If it returns `[]`, the database is empty in production (but tables exist).

## If Production Database is Empty

If your production app shows no data, you can:

**Option A: Seed Production Database**
```bash
# Make sure DATABASE_URL in .env points to production
npm run seed
```

**Option B: Copy Data from Local**
Since you're using the same Supabase database, the data should already be there. If not, check:
1. Vercel environment variables - make sure DATABASE_URL is correct
2. Check Supabase dashboard to see if data exists there

## Quick Check Commands

```bash
# Check if tables exist
npx prisma db push --skip-generate

# View data in Prisma Studio
npx prisma studio

# Seed data (if empty)
npm run seed
```

