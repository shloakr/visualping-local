# Deployment Guide

Follow these steps to deploy your UCLA Class Tracker.

## Prerequisites

1. A [Supabase](https://supabase.com) account (free tier works)
2. A [Vercel](https://vercel.com) account (free tier works)
3. A [Resend](https://resend.com) account (free tier works - optional, users provide their own)

## Step 1: Set Up Supabase Database

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be created (takes ~2 minutes)
3. Go to **SQL Editor** in the sidebar
4. Click **New Query**
5. Copy the contents of [`supabase/schema.sql`](supabase/schema.sql) and paste it
6. Click **Run** to create the tables
7. Go to **Settings > API** and copy:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon public** key (under Project API keys)
   - **service_role** key (under Project API keys)

## Step 2: Deploy to Vercel

### Option A: One-Click Deploy

Click this button and follow the prompts:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/ucla-class-tracker&root-directory=web)

### Option B: Manual Deploy

1. Fork this repository
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your forked repository
4. Set the **Root Directory** to `web`
5. Add the environment variables (see below)
6. Click **Deploy**

### Environment Variables for Vercel

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key |
| `SUPABASE_SERVICE_KEY` | Your Supabase service role key |
| `NEXT_PUBLIC_APP_URL` | Your Vercel deployment URL (e.g., `https://your-app.vercel.app`) |
| `DEFAULT_RESEND_API_KEY` | **Recommended**: Fallback Resend key for users who don't provide their own |

## Step 3: Configure GitHub Actions

The GitHub Actions workflow monitors tracked URLs every hour. It needs access to your Supabase database.

1. Go to your GitHub repository
2. Go to **Settings > Secrets and variables > Actions**
3. Add these repository secrets:

| Secret | Value |
|--------|-------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_KEY` | Your Supabase service role key |

**Recommended** (for email notifications):
| Secret | Value |
|--------|-------|
| `DEFAULT_RESEND_API_KEY` | Fallback Resend key for users who don't provide their own |
| `FROM_EMAIL` | Sender email (e.g., `onboarding@resend.dev`) |

**Optional** (for backwards compatibility with urls.yaml):
| Secret | Value |
|--------|-------|
| `RESEND_API_KEY` | A Resend API key for yaml-based URLs |

## Step 4: Test Your Deployment

1. Visit your Vercel deployment URL
2. Click "Track a Class"
3. Enter a UCLA class URL and your email (Resend API key is optional)
4. Submit the form
5. Check your Supabase dashboard - you should see the new tracker in the `tracked_urls` table

## Monitoring

- **GitHub Actions**: View the Actions tab to see monitoring runs
- **Supabase Dashboard**: View the `tracked_urls` table to see tracker status
- **Vercel Dashboard**: View deployment logs and analytics

## Troubleshooting

### "Failed to create tracker" error
- Check that your Supabase credentials are correct
- Verify the database schema has been applied
- Check Vercel function logs for details

### Emails not sending
- Verify the Resend API key is valid
- Check GitHub Actions logs for error details
- Ensure the Resend key starts with `re_`

### GitHub Actions not running
- Make sure the workflow is enabled in your repository
- Check that secrets are set correctly
- View the Actions tab for any errors

## Updating

To update your deployment:

1. Pull the latest changes from the main repository
2. Push to your fork
3. Vercel will automatically redeploy
4. GitHub Actions will use the updated code on the next run
