# UCLA Class Tracker

A beautifully designed, self-serve web application to track UCLA class enrollment status and receive email notifications when spots open up. Built with Next.js, Supabase, and GitHub Actions.

**Live Demo:** [visualping-local.vercel.app](https://visualping-local.vercel.app)

## Design

Inspired by [UCLA Date Drop](https://ucla.trydatedrop.com), the interface features:

- **Immersive hero experience** — Full-screen LA sunset backdrop with large, elegant serif typography (Playfair Display)
- **Smooth visual transitions** — Blur gradient at the bottom of the hero seamlessly fading into warm cream sections
- **Polished form pages** — Clean cards with subtle shadows, smooth hover effects, and refined spacing
- **Minimalist navigation** — Clean text-based logo with subtle outline buttons
- **Warm color palette** — Soft cream backgrounds (#FDF8F3), UCLA blue (#2774AE), and gold (#FFD100) accents
- **Micro-interactions** — Smooth animations, lift effects on cards, and responsive button states
- **Atmospheric footer** — Purple mountain twilight scene creating a sense of depth and completion
- **Mobile-first responsive** — Beautiful on all screen sizes

The design philosophy emphasizes simplicity and elegance—content floats directly over stunning imagery rather than being confined to cards, letting the visuals breathe while maintaining excellent readability. Form pages feature a refined aesthetic with enhanced spacing, smooth transitions, and attention to detail.

## Features

- **Self-serve tracking** — Anyone can track UCLA classes with their own Resend API key (free tier available)
- **Flexible monitoring** — Choose hourly, 6-hour, or daily check intervals
- **Email notifications** — Get notified instantly when enrollment status changes
- **No account needed** — Just enter your email and start tracking
- **Magic link verification** — Secure, passwordless access to manage your trackers
- **API key validation** — Resend keys are validated before saving to ensure they work
- **Automatic expiration** — Set when to stop tracking (e.g., end of enrollment period)
- **Smart monitoring** — Uses Playwright for JavaScript-rendered UCLA pages
- **Baseline comparison** — Only sends notifications when actual changes are detected

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
| `NEXT_PUBLIC_APP_URL` | Your Vercel deployment URL (e.g., `https://yourapp.vercel.app`) |

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
│   │   │   ├── page.tsx      # Landing page (hero + how it works)
│   │   │   ├── track/        # Add tracker form
│   │   │   ├── manage/       # Manage existing trackers
│   │   │   ├── api/          # API routes
│   │   │   ├── globals.css   # Design system & styles
│   │   │   └── layout.tsx    # Root layout with fonts
│   │   └── lib/
│   │       └── supabase.ts   # Supabase client & utilities
│   ├── public/
│   │   ├── bg.png            # Hero background (LA sunset)
│   │   └── footer-bg.png     # Footer background (purple mountains)
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

## Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS v4, TypeScript
- **Fonts:** Playfair Display (serif headings), Geist Sans (body text)
- **Database:** Supabase (PostgreSQL with Row Level Security)
- **Monitoring:** Python + Playwright (headless Chromium for JS rendering)
- **Email:** Resend API (per-user keys for self-serve model)
- **Hosting:** Vercel (web app), GitHub Actions (scheduled monitoring)

## Configuration Options

### Tracker Settings (via Web UI)

| Field | Description |
|-------|-------------|
| `UCLA Class URL` | Full URL from UCLA Schedule of Classes |
| `Email` | Your email for notifications |
| `Resend API Key` | Your personal Resend API key (validated on submit) |
| `Check Interval` | `hourly`, `6hours`, or `daily` |
| `Stop Tracking After` | Expiration date for the tracker (required) |

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
- Links expire after 24 hours

### Verification email shows localhost?
- Make sure `NEXT_PUBLIC_APP_URL` is set to your Vercel deployment URL in environment variables

### Tracker already exists?
- Each email can only track a specific class URL once
- If you need to change settings, delete the existing tracker and create a new one

### Need help with UCLA URLs?
- Click "How do I get this URL?" on the track page for step-by-step instructions
- The URL must be from UCLA's Schedule of Classes and include specific class parameters

## Credits

- Design inspired by [UCLA Date Drop](https://ucla.trydatedrop.com)
- Background images: LA sunset and purple mountain twilight scenes

## License

MIT License - Feel free to use and modify!

---

*Not affiliated with UCLA. Built for Bruins, by Bruins.*
