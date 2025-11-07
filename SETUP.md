# Quick Setup Guide

## ✅ Completed Steps

1. ✅ Dependencies installed
2. ✅ Prisma Client generated
3. ✅ Environment file created (`.env`)

## 🔧 Next Steps (Required)

### 1. Set Up Database

You need to update the `.env` file with your actual database connection string.

**Option A: Supabase (Recommended - Free)**
1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to **Project Settings** > **Database**
4. Copy the **Connection string** (URI mode)
5. It should look like: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
6. Add `?sslmode=require` at the end
7. Update `.env` with this connection string

**Option B: Other PostgreSQL Provider**
- Get your connection string from your provider
- Format: `postgresql://user:password@host:port/database`
- Add `?sslmode=require` if using SSL

### 2. Push Database Schema

Once you've updated `.env` with your real DATABASE_URL:

```bash
npm run prisma:push
```

This will create the `Experiment` and `Version` tables in your database.

### 3. Start Development Server

```bash
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000)

## 🚀 Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and import your repo
3. Add environment variable: `DATABASE_URL` (your connection string)
4. Deploy!
5. After first deploy, run migrations:
   ```bash
   npx prisma db push
   ```

## 📝 Notes

- The dev server is running but won't work fully until the database is set up
- You can use `npm run prisma:studio` to view/edit your database in a GUI
- All data is stored in PostgreSQL, so it persists across deployments

