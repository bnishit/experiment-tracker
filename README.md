# Experiment Tracker

A web application for tracking experiments, their parameters, user groups, platforms, and version history. Built for support teams to view experiment details and PMs to easily manage entries.

## Features

- **Support Team Dashboard**: View all experiments with filters (platform, user group, status, search)
- **PM Admin Panel**: Easy form-based entry for creating and editing experiments (protected with Supabase Auth)
- **Authentication**: Secure admin access using Supabase Auth (no public signups)
- **Version History**: Track changes to experiments over time with dates
- **Numbers List**: Store lists of numbers that can be hidden/shown in the UI
- **Platform Tracking**: Track which platforms each experiment is live on
- **Context/Description**: Markdown-supported context for each experiment

## Tech Stack

- **Next.js 15** (App Router) + TypeScript
- **Prisma** + PostgreSQL (via Supabase)
- **Tailwind CSS** + shadcn/ui components
- **Deploy on Vercel** (one-click deployment)

## Getting Started

### 1. Prerequisites

- Node.js 18+ installed
- A PostgreSQL database (we recommend [Supabase](https://supabase.com) free tier)

### 2. Database Setup

1. Create a new project on [Supabase](https://supabase.com) (or use any PostgreSQL provider)
2. Copy your database connection string from the Supabase dashboard
3. Add `?sslmode=require` to the connection string if using Supabase

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your database URL and Supabase credentials:

```
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

**Getting Supabase Auth credentials:**
1. Go to your Supabase project dashboard
2. Click **Project Settings** (gear icon)
3. Go to **API** section
4. Copy **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
5. Copy **anon/public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 5. Set Up Authentication

1. In your Supabase dashboard, go to **Authentication** > **Settings**
2. **Disable public signups**: Turn off "Enable email signup" (or keep it off)
3. **Create admin users manually**:
   - Go to **Authentication** > **Users**
   - Click **Add user** > **Create new user**
   - Enter email and password for your PMs
   - They can now log in at `/login`

### 6. Set Up Database

```bash
# Generate Prisma Client
npm run prisma:generate

# Push schema to database
npm run prisma:push

# Or use migrations for production
npm run prisma:migrate -- --name init
```

### 7. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
experiment-tracker/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── experiments/   # API routes
│   │   ├── admin/             # PM admin page
│   │   ├── page.tsx           # Support team dashboard
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── experiment-table.tsx
│   │   ├── experiment-form.tsx
│   │   └── version-form.tsx
│   └── lib/
│       ├── db.ts              # Prisma client
│       └── utils.ts
└── package.json
```

## Deployment to Vercel

### Option 1: Deploy from GitHub

1. Push your code to a GitHub repository
2. Go to [Vercel](https://vercel.com) and sign in
3. Click "New Project" and import your repository
4. Add environment variable:
   - `DATABASE_URL`: Your PostgreSQL connection string
5. Click "Deploy"
6. After deployment, run migrations:
   ```bash
   npm run prisma:push
   ```
   Or use Vercel's CLI:
   ```bash
   vercel env pull .env.local
   npx prisma db push
   ```

### Option 2: Deploy with Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variable
vercel env add DATABASE_URL

# Run migrations after first deploy
npx prisma db push
```

## Usage

### For Support Team

1. Visit the homepage (`/`) to see all experiments
2. Use filters to find specific experiments:
   - Search by name or exp parameter
   - Filter by platform (web, mobile, ios, android, etc.)
   - Filter by user group
   - Filter by active/inactive status
3. Click on an experiment card to expand and see details
4. Click "View Full Details" for a complete view with version history

### For PMs

1. Visit `/login` to sign in (you must be created as a user in Supabase first)
2. After login, you'll be redirected to `/admin` to access the admin panel
2. Click "New Experiment" to create an entry
3. Fill in the form:
   - **Experiment Name**: Name of the experiment
   - **Exp Parameter**: The experiment parameter
   - **User Group**: Which user group this is for
   - **Live Date**: When the experiment went live
   - **Platforms**: Comma-separated list (e.g., "web, mobile")
   - **Numbers List**: One number per line (can be hidden in UI)
   - **Context**: Markdown-supported description
4. Click "Add Version" on any experiment to record changes
5. Edit or delete experiments as needed

## API Routes

- `GET /api/experiments` - List all experiments (supports query params: search, platform, userGroup, isActive)
- `POST /api/experiments` - Create new experiment
- `GET /api/experiments/[id]` - Get single experiment
- `PATCH /api/experiments/[id]` - Update experiment
- `DELETE /api/experiments/[id]` - Delete experiment
- `GET /api/experiments/[id]/versions` - Get versions for experiment
- `POST /api/experiments/[id]/versions` - Add version to experiment

## Development

```bash
# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run Prisma Studio (database GUI)
npm run prisma:studio
```

## Notes

- Numbers lists are hidden by default in the UI but can be shown by clicking "Show"
- Version history supports Markdown formatting
- All dates are stored in UTC
- The database uses PostgreSQL arrays for platforms and numbersList

## Troubleshooting

**Database connection issues:**
- Ensure your `DATABASE_URL` is correct
- For Supabase, make sure to add `?sslmode=require`
- Check that your database allows connections from your IP (Vercel IPs for production)

**Prisma errors:**
- Run `npm run prisma:generate` after schema changes
- Run `npm run prisma:push` to sync schema to database

**Build errors:**
- Make sure all environment variables are set in Vercel
- Check that Prisma Client is generated (`npm run prisma:generate`)

## Admin Authentication Setup (Supabase)

1. In Supabase, go to **Project Settings → API** and copy the **Project URL** and **anon/public** key into `.env` as `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
2. Visit **Authentication → Settings** and turn off **Enable email signup** so only invited users can log in.
3. Create admin accounts via **Authentication → Users → Add user**, set a secure password, and auto-confirm them so they can sign in immediately.
4. Share only the login URL (e.g., `/login`) plus the user-specific credentials—avoid storing real keys in docs.

## Checking Database Health

- **Supabase Table Editor**: Navigate to your project dashboard → **Table Editor** to confirm `Experiment` and `Version` tables exist and contain data.
- **Prisma Studio (local)**: Run `npx prisma studio` to inspect and edit rows at `http://localhost:5555`.
- **API smoke test**: Hit `/api/experiments` on the deployed site; an empty array means the schema exists but may lack data.
- If production data is missing, double-check the `DATABASE_URL` configured for each Vercel environment and run `npm run seed` or manual inserts as needed.

## Fixing Supabase Connections on Vercel

Vercel serverless functions work best with Supabase's **connection pooler** on port **6543**.

1. In Supabase, open **Project Settings → Database → Connection string** and choose **Connection pooling → URI**.
2. Copy the pooler URL (it ends with `:6543/...`). Never paste the password back into docs—keep it in `.env` or Vercel only.
3. Update the `DATABASE_URL` environment variable in Vercel for Production/Preview/Development and redeploy.
4. If needed, try the Transaction mode pooler instead of Session mode.

## Deployment Checklist (Safe Values Only)

1. **Repository**: Commit your changes and push to GitHub.
2. **Vercel project**: Import the repo; Next.js defaults are detected automatically.
3. **Environment variables**: Set `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for every environment **without** embedding live credentials in documentation.
4. **First deploy**: Trigger a deploy and wait for completion.
5. **Migrations**: Run `npx prisma db push` against the production database (via Vercel CLI `vercel env pull .env.local` if needed).
6. **Redirects for Auth**: In Supabase, add your production domain (e.g., `https://your-app.vercel.app/login`) to the list of allowed redirect URLs.

## Handling `DATABASE_URL` Passwords

Supabase can generate a fully encoded connection string for you:

1. Visit **Project Settings → Database** and copy the `URI` connection string (pooler or direct).
2. The string already encodes special characters in the password—drop it straight into `.env` or the Vercel dashboard.
3. If you hand-edit the string, URL-encode characters like `@`, `:`, or `/` so the driver parses the credentials correctly.
