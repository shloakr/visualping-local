# UCLA Class Tracker

A self-serve web application to track UCLA class enrollment status and receive email notifications when spots open up. Built with Next.js, Supabase, and GitHub Actions.

## Features

- **Self-serve tracking** - Anyone can track UCLA classes with their own Resend API key
- **Hourly monitoring** - Classes are checked every hour via GitHub Actions
- **Email notifications** - Get notified instantly when enrollment status changes
- **Beautiful web UI** - Modern, responsive interface built with Next.js and Tailwind CSS
- **No account needed** - Just enter your email and start tracking
- **Magic link verification** - Secure access to manage your trackers

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  Vercel         │────▶│   Supabase       │◀────│  GitHub Actions │
│  (Web UI)       │     │   (Database)     │     │  (Monitor)      │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                        │                        │
        │                        │                        │
   Users add                Stores tracked           Checks URLs
   class URLs               URLs & baselines         every hour
                                                         │
                                                         ▼
                                                  ┌─────────────────┐
                                                  │  Resend         │
                                                  │  (Email)        │
                                                  └─────────────────┘
```

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/shloakr/visualping-local.git
cd visualping-local
```

### 2. Set Up Supabase

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
4. Go to **Settings > API** and copy your project URL and service role key

See `supabase/README.md` for detailed instructions.

### 3. Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/shloakr/visualping-local&root-directory=web)

Or deploy manually:

```bash
cd web
npm install
npm run build
```

Add these environment variables in Vercel:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key |
| `SUPABASE_SERVICE_KEY` | Your Supabase service role key |
| `NEXT_PUBLIC_APP_URL` | Your Vercel deployment URL |

### 4. Configure GitHub Actions

Add these secrets to your GitHub repository (**Settings > Secrets and variables > Actions**):

| Secret | Description |
|--------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_KEY` | Your Supabase service role key |
| `FROM_EMAIL` | Default sender email (e.g., `alerts@yourdomain.com`) |

The GitHub Action runs automatically every hour to check all tracked URLs.

## How It Works

1. **User visits the web UI** and enters a UCLA class URL, their email, and their Resend API key
2. **API key is validated** against Resend to ensure it's valid before saving
3. **The tracker is saved** to Supabase with all the configuration
4. **GitHub Actions runs hourly** and fetches all active trackers from Supabase
5. **For each tracker**, it fetches the UCLA page using Playwright and compares to the baseline
6. **If changed**, it sends an email using the user's own Resend API key
7. **Baseline is updated** in Supabase for next comparison

## Local Development

### Web App (Next.js)

```bash
cd web
cp .env.example .env.local
# Fill in your Supabase credentials
npm install
npm run dev
```

### Monitor Script (Python)

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
playwright install chromium

export SUPABASE_URL="your-url"
export SUPABASE_KEY="your-key"
python src/monitor.py --source supabase --interval all
```

## Project Structure

```
visualping-local/
├── web/                      # Next.js web application
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx      # Landing page
│   │   │   ├── track/        # Add tracker form
│   │   │   ├── manage/       # Manage existing trackers
│   │   │   └── api/          # API routes
│   │   └── lib/
│   │       └── supabase.ts   # Supabase client & utilities
│   └── .env.example
├── src/
│   └── monitor.py            # URL monitoring script (Playwright)
├── supabase/
│   ├── schema.sql            # Database schema
│   └── README.md             # Supabase setup guide
├── .github/
│   └── workflows/
│       └── monitor.yml       # GitHub Actions workflow
├── baselines/                # File-based baselines (for yaml source)
├── urls.yaml                 # YAML-based URL config (legacy)
└── requirements.txt          # Python dependencies
```

## Configuration Options

### Tracker Settings (via Web UI)

| Field | Description |
|-------|-------------|
| `UCLA Class URL` | Full URL from UCLA Schedule of Classes |
| `Email` | Your email for notifications |
| `Resend API Key` | Your personal Resend API key (validated on submit) |
| `Check Interval` | `hourly`, `6hours`, or `daily` |
| `Stop Tracking After` | Expiration date for the tracker |

### Check Intervals

| Interval | Schedule |
|----------|----------|
| `hourly` | Every hour |
| `6hours` | 0:00, 6:00, 12:00, 18:00 UTC |
| `daily` | 0:00 UTC |

## Getting a Resend API Key

1. Sign up at [resend.com](https://resend.com) (free tier: 100 emails/day)
2. Go to **API Keys** in your dashboard
3. Click **Create API Key**
4. Copy the key (starts with `re_`)

## Troubleshooting

### Email not sending?
- Verify your Resend API key is valid (it's checked when you add a tracker)
- Check that the key starts with `re_`
- View GitHub Actions logs for error details

### Changes not being detected?
- UCLA pages require JavaScript rendering (handled by Playwright)
- Check if the class URL is valid and accessible
- View GitHub Actions logs to see captured content

### Can't manage trackers?
- Enter the same email you used when creating trackers
- Check your email for the magic link (uses your saved Resend key)
- Links expire after 1 hour

## License

MIT License - Feel free to use and modify!
