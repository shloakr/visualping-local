# Supabase Setup

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose a name (e.g., "ucla-class-tracker")
4. Set a database password (save this!)
5. Select a region close to you
6. Click "Create new project"

## 2. Run the Schema

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy the contents of `schema.sql` and paste it
4. Click **Run** (or press Cmd/Ctrl + Enter)

## 3. Get Your API Keys

1. Go to **Settings** > **API**
2. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_URL`
   - **service_role key** (under "Project API keys") → `SUPABASE_SERVICE_KEY` and `SUPABASE_KEY`

> **Important**: The `service_role` key bypasses Row Level Security. Keep it secret and only use it server-side!

## 4. Environment Variables

### For Vercel (web app):
```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### For GitHub Actions (monitor script):
Add these as repository secrets:
- `SUPABASE_URL` = Your project URL
- `SUPABASE_KEY` = Your service_role key
