# VisualPing - GitHub Actions URL Monitor

A lightweight, scalable URL monitoring service that runs on GitHub Actions. Track changes to any webpage and receive email notifications when content changes.

## Features

- **Text-based change detection** - Monitors page content for changes
- **CSS selector support** - Track specific elements instead of entire pages
- **Configurable intervals** - Check hourly, every 6 hours, or daily
- **Expiry dates** - Optionally stop tracking after a specific date
- **Email notifications** - Get notified via Resend when changes are detected
- **Scalable** - Monitor unlimited URLs

## Quick Start

### 1. Fork/Clone this Repository

```bash
git clone https://github.com/your-username/visualping.git
cd visualping
```

### 2. Set Up Resend (Free Email Service)

1. Sign up at [resend.com](https://resend.com) (100 free emails/day)
2. Create an API key in your Resend dashboard
3. Verify a domain or use the default `onboarding@resend.dev` sender

### 3. Add GitHub Secrets

Go to your repository **Settings → Secrets and variables → Actions** and add:

| Secret | Description |
|--------|-------------|
| `RESEND_API_KEY` | Your Resend API key |
| `FROM_EMAIL` | Verified sender email (e.g., `alerts@yourdomain.com` or `onboarding@resend.dev`) |

### 4. Configure URLs to Monitor

Edit `urls.yaml` to add the URLs you want to track:

```yaml
urls:
  # For JavaScript-rendered pages (like UCLA class schedule)
  - name: "HIST 187 Class Status"
    url: "https://sa.ucla.edu/ro/Public/SOC/Results/ClassDetail?..."
    selector: "#enrl_mtng_info"     # CSS selector for enrollment table
    js_render: true                  # Enable for JS-rendered pages
    check_interval: "hourly"
    expires: "2026-01-25"
    notify_email: "your@email.com"

  # For static pages (no js_render needed)
  - name: "Product Availability"
    url: "https://store.com/product"
    check_interval: "6hours"
    notify_email: "your@email.com"
```

### 5. Enable GitHub Actions

Push your changes and the workflow will run automatically on schedule. You can also trigger it manually from the **Actions** tab.

## Configuration Options

| Field | Required | Description |
|-------|----------|-------------|
| `name` | No | Friendly name for notifications |
| `url` | Yes | URL to monitor |
| `selector` | No | CSS selector to monitor specific content |
| `js_render` | No | Set to `true` for JavaScript-rendered pages (uses Playwright) |
| `check_interval` | Yes | `hourly`, `6hours`, or `daily` |
| `expires` | No | Stop tracking after this date (YYYY-MM-DD) |
| `notify_email` | Yes | Email to notify on changes |

## How It Works

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│  GitHub Actions │────▶│   monitor.py     │────▶│  Send Email     │
│  (scheduled)    │     │  - Fetch URL     │     │  via Resend     │
└─────────────────┘     │  - Compare text  │     └─────────────────┘
                        │  - Save baseline │
                        └──────────────────┘
                               │
                               ▼
                        ┌──────────────────┐
                        │  baselines/      │
                        │  (stored in repo)│
                        └──────────────────┘
```

1. GitHub Actions runs on schedule (hourly/6hours/daily)
2. The script fetches each URL's content
3. Content is compared against stored baseline
4. If changed: sends email notification and updates baseline
5. Baselines are committed back to the repository

## Running Locally

```bash
# Install dependencies
pip install -r requirements.txt

# Set environment variables
export RESEND_API_KEY="your_api_key"
export FROM_EMAIL="your@email.com"

# Run the monitor
python src/monitor.py --interval all
```

## Manual Trigger

You can manually trigger the workflow from the GitHub Actions tab:

1. Go to **Actions** → **URL Monitor**
2. Click **Run workflow**
3. Select the interval to check (or "all")

## Troubleshooting

### Email not sending?
- Verify your `RESEND_API_KEY` is correct
- Check that `FROM_EMAIL` is verified in Resend
- View workflow logs in GitHub Actions for error details

### Changes not being detected?
- Check if the `selector` is valid
- Some sites may block automated requests
- Try removing the selector to monitor the full page

### Baseline keeps changing?
- Some pages have dynamic content (timestamps, ads)
- Use a more specific `selector` to target stable content

## License

MIT License - Feel free to use and modify!

# visualping-local
