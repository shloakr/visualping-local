#!/usr/bin/env python3
"""
VisualPing URL Monitor
Monitors URLs for text content changes and sends email notifications via Resend.
Supports both static pages (requests) and JavaScript-rendered pages (Playwright).

Can read URL configs from:
1. urls.yaml (local file, original behavior)
2. Supabase database (for web UI integration)
"""

import os
import sys
import hashlib
import argparse
from datetime import datetime
from pathlib import Path
from typing import Optional

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

# Try to import supabase (optional for database mode)
try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False


# Configuration
BASELINES_DIR = Path(__file__).parent.parent / "baselines"
URLS_CONFIG = Path(__file__).parent.parent / "urls.yaml"


def get_supabase_client() -> Optional["Client"]:
    """Create Supabase client from environment variables"""
    if not SUPABASE_AVAILABLE:
        return None
    
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_KEY")
    
    if not url or not key:
        return None
    
    return create_client(url, key)


def load_config_from_yaml() -> list[dict]:
    """Load URL configuration from urls.yaml"""
    if not URLS_CONFIG.exists():
        return []
    
    with open(URLS_CONFIG, "r") as f:
        config = yaml.safe_load(f)
    
    return config.get("urls", []) if config else []


def load_config_from_supabase(client: "Client", interval: str) -> list[dict]:
    """Load URL configuration from Supabase database"""
    try:
        # Build query for active trackers
        query = client.table("tracked_urls").select("*").eq("is_active", True)
        
        # Filter by interval if not "all"
        if interval != "all":
            query = query.eq("check_interval", interval)
        
        # Filter out expired trackers
        today = datetime.now().date().isoformat()
        query = query.or_(f"expires_at.is.null,expires_at.gt.{today}")
        
        result = query.execute()
        
        # Convert to the format expected by monitor_url
        urls = []
        for row in result.data:
            urls.append({
                "id": row["id"],
                "name": row["class_name"] or "Unknown Class",
                "url": row["ucla_url"],
                "selector": row["selector"],
                "js_render": True,  # UCLA pages always need JS rendering
                "check_interval": row["check_interval"],
                "expires": row["expires_at"],
                "notify_email": row["email"],
                "resend_api_key": row["resend_api_key"],
                "baseline_content": row["baseline_content"],
                "_source": "supabase",
            })
        
        return urls
    except Exception as e:
        print(f"❌ Error loading from Supabase: {e}")
        return []


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
    """Load stored baseline content for a URL from file"""
    baseline_file = BASELINES_DIR / f"{url_hash}.txt"
    if baseline_file.exists():
        return baseline_file.read_text(encoding="utf-8")
    return None


def save_baseline(url_hash: str, content: str) -> None:
    """Save content as new baseline for a URL to file"""
    BASELINES_DIR.mkdir(parents=True, exist_ok=True)
    baseline_file = BASELINES_DIR / f"{url_hash}.txt"
    baseline_file.write_text(content, encoding="utf-8")


def update_supabase_baseline(client: "Client", tracker_id: str, content: str, changed: bool = False) -> None:
    """Update baseline in Supabase database"""
    try:
        update_data = {
            "baseline_content": content,
            "baseline_hash": hashlib.md5(content.encode()).hexdigest(),
            "last_checked_at": datetime.now().isoformat(),
        }
        
        if changed:
            update_data["last_change_at"] = datetime.now().isoformat()
        
        client.table("tracked_urls").update(update_data).eq("id", tracker_id).execute()
    except Exception as e:
        print(f"  ⚠️ Failed to update Supabase: {e}")


def send_email_notification(
    name: str,
    url: str,
    old_content: str,
    new_content: str,
    to_email: str,
    api_key: str | None = None
) -> bool:
    """Send email notification about content change via Resend"""
    # Use provided API key, or fall back to DEFAULT_RESEND_API_KEY, or RESEND_API_KEY
    effective_api_key = (
        api_key 
        or os.environ.get("DEFAULT_RESEND_API_KEY") 
        or os.environ.get("RESEND_API_KEY")
    )
    from_email = os.environ.get("FROM_EMAIL", "onboarding@resend.dev")
    
    if not effective_api_key:
        print("  ⚠️ No Resend API key available, skipping email notification")
        return False
    
    resend.api_key = effective_api_key
    
    # Create a simple diff summary
    old_preview = old_content[:500] + "..." if len(old_content) > 500 else old_content
    new_preview = new_content[:500] + "..." if len(new_content) > 500 else new_content
    
    html_content = f"""
    <html>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2774AE;">🔔 Change Detected: {name}</h2>
        <p style="color: #374151;">The enrollment status has changed for your tracked class:</p>
        <p><a href="{url}" style="color: #2774AE;">{url}</a></p>
        
        <div style="background: #fee2e2; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h4 style="margin: 0 0 10px 0; color: #dc2626;">Previous Status:</h4>
            <p style="margin: 0; color: #374151; font-size: 14px;">{old_preview}</p>
        </div>
        
        <div style="background: #dcfce7; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h4 style="margin: 0 0 10px 0; color: #16a34a;">New Status:</h4>
            <p style="margin: 0; color: #374151; font-size: 14px;">{new_preview}</p>
        </div>
        
        <p style="color: #6b7280; font-size: 12px; margin-top: 30px;">
            Detected at {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}<br>
            Powered by UCLA Class Tracker
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


def monitor_url(url_config: dict, supabase_client: Optional["Client"] = None) -> tuple[bool, bool]:
    """
    Monitor a single URL for changes.
    Returns: (has_changed, is_new_baseline)
    """
    name = url_config.get("name", url_config["url"])
    url = url_config["url"]
    selector = url_config.get("selector")
    expires = url_config.get("expires")
    notify_email = url_config.get("notify_email")
    use_js = url_config.get("js_render", False)
    resend_api_key = url_config.get("resend_api_key")  # Per-user API key
    source = url_config.get("_source", "yaml")
    tracker_id = url_config.get("id")
    
    print(f"\n📍 Checking: {name}")
    print(f"   URL: {url}")
    print(f"   Source: {source}")
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
    
    # Get baseline content
    if source == "supabase":
        baseline_content = url_config.get("baseline_content")
    else:
        url_hash = get_url_hash(url)
        baseline_content = load_baseline(url_hash)
    
    if baseline_content is None:
        # First time seeing this URL, save baseline
        print("  📝 First check - saving baseline")
        
        if source == "supabase" and supabase_client and tracker_id:
            update_supabase_baseline(supabase_client, tracker_id, current_content)
        else:
            url_hash = get_url_hash(url)
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
                to_email=notify_email,
                api_key=resend_api_key
            )
        
        # Update baseline with new content
        if source == "supabase" and supabase_client and tracker_id:
            update_supabase_baseline(supabase_client, tracker_id, current_content, changed=True)
        else:
            url_hash = get_url_hash(url)
            save_baseline(url_hash, current_content)
        
        return True, False
    
    # No change, but update last_checked_at in Supabase
    if source == "supabase" and supabase_client and tracker_id:
        try:
            supabase_client.table("tracked_urls").update({
                "last_checked_at": datetime.now().isoformat()
            }).eq("id", tracker_id).execute()
        except Exception:
            pass  # Silently ignore update failures
    
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
    parser.add_argument(
        "--source",
        choices=["yaml", "supabase", "both"],
        default="both",
        help="Where to load URL configs from (default: both)"
    )
    args = parser.parse_args()
    
    print("=" * 50)
    print("🔍 UCLA Class Tracker - URL Monitor")
    print(f"   Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"   Interval filter: {args.interval}")
    print(f"   Source: {args.source}")
    print(f"   Playwright available: {PLAYWRIGHT_AVAILABLE}")
    print(f"   Supabase available: {SUPABASE_AVAILABLE}")
    print("=" * 50)
    
    # Initialize Supabase client if needed
    supabase_client = None
    if args.source in ["supabase", "both"]:
        supabase_client = get_supabase_client()
        if supabase_client:
            print("✓ Connected to Supabase")
        elif args.source == "supabase":
            print("❌ Supabase not configured, exiting")
            sys.exit(1)
    
    # Load URL configs
    urls = []
    
    # Load from YAML
    if args.source in ["yaml", "both"]:
        yaml_urls = load_config_from_yaml()
        # Filter by interval if specified
        if args.interval != "all":
            yaml_urls = [u for u in yaml_urls if u.get("check_interval") == args.interval]
        urls.extend(yaml_urls)
        print(f"📋 Loaded {len(yaml_urls)} URL(s) from urls.yaml")
    
    # Load from Supabase
    if args.source in ["supabase", "both"] and supabase_client:
        supabase_urls = load_config_from_supabase(supabase_client, args.interval)
        urls.extend(supabase_urls)
        print(f"📋 Loaded {len(supabase_urls)} URL(s) from Supabase")
    
    if not urls:
        print(f"\n⚠️ No URLs configured for interval: {args.interval}")
        sys.exit(0)
    
    print(f"\n📋 Checking {len(urls)} URL(s) total...")
    
    changes_detected = 0
    new_baselines = 0
    
    for url_config in urls:
        changed, is_new = monitor_url(url_config, supabase_client)
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
    
    # Exit with code 0 (success) even if changes detected
    sys.exit(0)


if __name__ == "__main__":
    main()
