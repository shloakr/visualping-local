#!/usr/bin/env python3
"""
VisualPing URL Monitor
Monitors URLs for text content changes and sends email notifications via Resend.
Supports both static pages (requests) and JavaScript-rendered pages (Playwright).
"""

import os
import sys
import hashlib
import argparse
from datetime import datetime
from pathlib import Path

import yaml
import requests
import resend
from bs4 import BeautifulSoup

# Try to import playwright (optional for JS-rendered pages)
try:
    from playwright.sync_api import sync_playwright
    PLAYWRIGHT_AVAILABLE = True
except ImportError:
    PLAYWRIGHT_AVAILABLE = False


# Configuration
BASELINES_DIR = Path(__file__).parent.parent / "baselines"
URLS_CONFIG = Path(__file__).parent.parent / "urls.yaml"


def load_config() -> dict:
    """Load URL configuration from urls.yaml"""
    with open(URLS_CONFIG, "r") as f:
        return yaml.safe_load(f)


def get_url_hash(url: str) -> str:
    """Generate a unique hash for a URL to use as filename"""
    return hashlib.md5(url.encode()).hexdigest()[:12]


def fetch_content_static(url: str, selector: str | None = None) -> str:
    """
    Fetch page content from URL using requests (for static pages).
    If selector is provided, extract only that element's text.
    """
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    
    try:
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
    except requests.RequestException as e:
        print(f"  ❌ Error fetching {url}: {e}")
        return ""
    
    soup = BeautifulSoup(response.text, "html.parser")
    
    # Remove script and style elements
    for element in soup(["script", "style", "noscript"]):
        element.decompose()
    
    if selector:
        # Extract specific element(s) matching the CSS selector
        elements = soup.select(selector)
        if elements:
            text = " ".join(el.get_text(separator=" ", strip=True) for el in elements)
        else:
            print(f"  ⚠️ Selector '{selector}' not found, using full page")
            text = soup.get_text(separator=" ", strip=True)
    else:
        text = soup.get_text(separator=" ", strip=True)
    
    # Normalize whitespace
    return " ".join(text.split())


def fetch_content_js(url: str, selector: str | None = None) -> str:
    """
    Fetch page content from URL using Playwright (for JavaScript-rendered pages).
    If selector is provided, extract only that element's text.
    """
    if not PLAYWRIGHT_AVAILABLE:
        print("  ❌ Playwright not available, falling back to static fetch")
        return fetch_content_static(url, selector)
    
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(url, wait_until="networkidle", timeout=60000)
            
            # Wait a bit for any final JS to settle
            page.wait_for_timeout(2000)
            
            if selector:
                # Try to find the selector
                elements = page.query_selector_all(selector)
                if elements:
                    texts = [el.inner_text() for el in elements]
                    text = " ".join(texts)
                else:
                    print(f"  ⚠️ Selector '{selector}' not found, using full page")
                    text = page.inner_text("body")
            else:
                text = page.inner_text("body")
            
            browser.close()
            
            # Normalize whitespace
            return " ".join(text.split())
    except Exception as e:
        print(f"  ❌ Error fetching {url} with Playwright: {e}")
        return ""


def fetch_content(url: str, selector: str | None = None, use_js: bool = False) -> str:
    """
    Fetch page content from URL.
    If use_js is True, use Playwright for JavaScript-rendered pages.
    """
    if use_js:
        return fetch_content_js(url, selector)
    return fetch_content_static(url, selector)


def load_baseline(url_hash: str) -> str | None:
    """Load stored baseline content for a URL"""
    baseline_file = BASELINES_DIR / f"{url_hash}.txt"
    if baseline_file.exists():
        return baseline_file.read_text(encoding="utf-8")
    return None


def save_baseline(url_hash: str, content: str) -> None:
    """Save content as new baseline for a URL"""
    BASELINES_DIR.mkdir(parents=True, exist_ok=True)
    baseline_file = BASELINES_DIR / f"{url_hash}.txt"
    baseline_file.write_text(content, encoding="utf-8")


def send_email_notification(
    name: str,
    url: str,
    old_content: str,
    new_content: str,
    to_email: str
) -> bool:
    """Send email notification about content change via Resend"""
    api_key = os.environ.get("RESEND_API_KEY")
    from_email = os.environ.get("FROM_EMAIL", "onboarding@resend.dev")
    
    if not api_key:
        print("  ⚠️ RESEND_API_KEY not set, skipping email notification")
        return False
    
    resend.api_key = api_key
    
    # Create a simple diff summary
    old_preview = old_content[:500] + "..." if len(old_content) > 500 else old_content
    new_preview = new_content[:500] + "..." if len(new_content) > 500 else new_content
    
    html_content = f"""
    <html>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2563eb;">🔔 Change Detected: {name}</h2>
        <p style="color: #374151;">The monitored page has changed:</p>
        <p><a href="{url}" style="color: #2563eb;">{url}</a></p>
        
        <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h4 style="margin: 0 0 10px 0; color: #dc2626;">Previous Content:</h4>
            <p style="margin: 0; color: #374151; font-size: 14px;">{old_preview}</p>
        </div>
        
        <div style="background: #dcfce7; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h4 style="margin: 0 0 10px 0; color: #16a34a;">New Content:</h4>
            <p style="margin: 0; color: #374151; font-size: 14px;">{new_preview}</p>
        </div>
        
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
            Detected at {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}<br>
            Powered by VisualPing GitHub Actions
        </p>
    </body>
    </html>
    """
    
    try:
        resend.Emails.send({
            "from": from_email,
            "to": [to_email],
            "subject": f"🔔 Change Detected: {name}",
            "html": html_content
        })
        print(f"  📧 Email sent to {to_email}")
        return True
    except Exception as e:
        print(f"  ❌ Failed to send email: {e}")
        return False


def is_expired(expires: str | None) -> bool:
    """Check if the URL tracking has expired"""
    if not expires:
        return False
    try:
        expiry_date = datetime.strptime(expires, "%Y-%m-%d").date()
        return datetime.now().date() > expiry_date
    except ValueError:
        print(f"  ⚠️ Invalid date format: {expires}, expected YYYY-MM-DD")
        return False


def monitor_url(url_config: dict) -> tuple[bool, bool]:
    """
    Monitor a single URL for changes.
    Returns: (has_changed, is_new_baseline)
    """
    name = url_config.get("name", url_config["url"])
    url = url_config["url"]
    selector = url_config.get("selector")
    expires = url_config.get("expires")
    notify_email = url_config.get("notify_email")
    use_js = url_config.get("js_render", False)  # New option for JS-rendered pages
    
    print(f"\n📍 Checking: {name}")
    print(f"   URL: {url}")
    if use_js:
        print("   Mode: JavaScript rendering (Playwright)")
    
    # Check if expired
    if is_expired(expires):
        print(f"  ⏰ Tracking expired on {expires}, skipping")
        return False, False
    
    # Fetch current content
    current_content = fetch_content(url, selector, use_js)
    if not current_content:
        return False, False
    
    url_hash = get_url_hash(url)
    baseline_content = load_baseline(url_hash)
    
    if baseline_content is None:
        # First time seeing this URL, save baseline
        print("  📝 First check - saving baseline")
        save_baseline(url_hash, current_content)
        return False, True
    
    if current_content != baseline_content:
        print("  🚨 CHANGE DETECTED!")
        
        # Send notification
        if notify_email:
            send_email_notification(
                name=name,
                url=url,
                old_content=baseline_content,
                new_content=current_content,
                to_email=notify_email
            )
        
        # Update baseline with new content
        save_baseline(url_hash, current_content)
        return True, False
    
    print("  ✅ No changes")
    return False, False


def main():
    parser = argparse.ArgumentParser(description="Monitor URLs for content changes")
    parser.add_argument(
        "--interval",
        choices=["hourly", "6hours", "daily", "all"],
        default="all",
        help="Only check URLs with this check_interval (default: all)"
    )
    args = parser.parse_args()
    
    print("=" * 50)
    print("🔍 VisualPing URL Monitor")
    print(f"   Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"   Interval filter: {args.interval}")
    print(f"   Playwright available: {PLAYWRIGHT_AVAILABLE}")
    print("=" * 50)
    
    config = load_config()
    urls = config.get("urls", [])
    
    if not urls:
        print("\n⚠️ No URLs configured in urls.yaml")
        sys.exit(0)
    
    # Filter URLs by interval if specified
    if args.interval != "all":
        urls = [u for u in urls if u.get("check_interval") == args.interval]
    
    if not urls:
        print(f"\n⚠️ No URLs configured for interval: {args.interval}")
        sys.exit(0)
    
    print(f"\n📋 Checking {len(urls)} URL(s)...")
    
    changes_detected = 0
    new_baselines = 0
    
    for url_config in urls:
        changed, is_new = monitor_url(url_config)
        if changed:
            changes_detected += 1
        if is_new:
            new_baselines += 1
    
    print("\n" + "=" * 50)
    print("📊 Summary:")
    print(f"   URLs checked: {len(urls)}")
    print(f"   Changes detected: {changes_detected}")
    print(f"   New baselines: {new_baselines}")
    print("=" * 50)
    
    # Exit with code 1 if changes detected (useful for CI)
    if changes_detected > 0:
        sys.exit(0)  # Still exit 0 since this is expected behavior


if __name__ == "__main__":
    main()
