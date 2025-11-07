# Deployment Guide - Vercel

## Quick Deploy Steps

### Option 1: Deploy via Vercel Dashboard (Easiest)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click **"Add New Project"**
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Add Environment Variables**
   In Vercel project settings, add these:
   ```
   DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

4. **Deploy**
   - Click **"Deploy"**
   - Wait for build to complete (~2-3 minutes)

5. **Run Database Migrations**
   After first deploy, run:
   ```bash
   npx prisma db push
   ```
   Or use Vercel CLI:
   ```bash
   vercel env pull .env.local
   npx prisma db push
   ```

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   cd experiment-tracker
   vercel
   ```
   - Follow prompts (use defaults)
   - When asked about env vars, say "No" (we'll add them manually)

4. **Add Environment Variables**
   ```bash
   vercel env add DATABASE_URL
   # Paste your DATABASE_URL when prompted
   
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   # Paste your Supabase URL
   
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   # Paste your Supabase anon key
   ```

5. **Redeploy**
   ```bash
   vercel --prod
   ```

6. **Run Migrations**
   ```bash
   vercel env pull .env.local
   npx prisma db push
   ```

## Post-Deployment Checklist

- [ ] Environment variables set in Vercel
- [ ] Database migrations run (`npx prisma db push`)
- [ ] Test public dashboard: `https://your-app.vercel.app`
- [ ] Test login: `https://your-app.vercel.app/login`
- [ ] Test admin panel: `https://your-app.vercel.app/admin`
- [ ] Verify Supabase auth works in production

## Important Notes

1. **Database**: Make sure your Supabase database allows connections from Vercel IPs (should work by default)

2. **CORS**: Supabase auth should work out of the box, but if you have issues, check Supabase dashboard → Settings → API → CORS settings

3. **Custom Domain**: After deployment, you can add a custom domain in Vercel project settings

4. **Environment Variables**: 
   - `DATABASE_URL` - Used server-side only (not exposed to client)
   - `NEXT_PUBLIC_SUPABASE_URL` - Exposed to client (safe, it's public)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Exposed to client (safe, it's public)

## Troubleshooting

**Build fails?**
- Check build logs in Vercel dashboard
- Make sure all dependencies are in `package.json`
- Verify TypeScript compiles: `npm run build`

**Database connection fails?**
- Verify `DATABASE_URL` is correct in Vercel env vars
- Check Supabase allows external connections
- Try running migrations locally with production URL

**Auth not working?**
- Verify Supabase env vars are set correctly
- Check Supabase dashboard → Authentication → URL Configuration
- Make sure your Vercel URL is added to allowed redirect URLs in Supabase

