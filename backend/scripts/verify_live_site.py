"""
Playwright Live Verification Script for PhishShield Production Deployment
Visits https://phising-two-chi.vercel.app/ using installed browser (msedge/chrome),
inspects UI elements, checks console logs, captures screenshot, and tests live functionality.
"""

import sys
import os
import json
from pathlib import Path
from playwright.sync_api import sync_playwright

TARGET_URL = "https://phising-two-chi.vercel.app/"
ARTIFACT_DIR = Path(r"C:\Users\chand\.gemini\antigravity\brain\9c31b1b1-baf5-4c7d-b80b-74a06487c0f4")
SCREENSHOT_PATH = ARTIFACT_DIR / "vercel_live_phishshield.png"


def run_inspection():
    print(f"=== Starting Playwright Browser Inspection on {TARGET_URL} ===")
    
    with sync_playwright() as p:
        # Prefer msedge on Windows, fall back to default chromium/chrome
        browser = None
        for channel in ["msedge", "chrome", None]:
            try:
                kwargs = {"headless": True}
                if channel:
                    kwargs["channel"] = channel
                browser = p.chromium.launch(**kwargs)
                print(f"[BROWSER] Successfully launched Chromium via channel: {channel or 'default'}")
                break
            except Exception as e:
                print(f"[BROWSER] Launch failed with channel {channel}: {e}")
                continue

        if not browser:
            raise RuntimeError("Could not launch any browser channel (msedge, chrome, or default chromium).")

        context = browser.new_context(
            viewport={"width": 1440, "height": 900},
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        page = context.new_page()

        console_logs = []
        network_errors = []

        page.on("console", lambda msg: console_logs.append({"type": msg.type, "text": msg.text}))
        page.on("pageerror", lambda err: console_logs.append({"type": "error", "text": str(err)}))
        page.on("requestfailed", lambda req: network_errors.append({"url": req.url, "error": req.failure}))

        print(f"[NAVIGATE] Navigating to {TARGET_URL} ...")
        response = page.goto(TARGET_URL, wait_until="networkidle", timeout=60000)
        print(f"[STATUS] HTTP Response Code: {response.status}")

        # Wait for React DOM to render completely
        page.wait_for_timeout(4000)

        # 1. Page Title
        title = page.title()
        print(f"[PAGE TITLE] {title}")

        # 2. Extract Headings and UI text
        headings = [h.strip() for h in page.locator("h1, h2, h3, h4, h5, h6").all_inner_texts() if h.strip()]
        print(f"[HEADINGS DETECTED] ({len(headings)}):", headings[:10])

        # 3. Extract Navigation items and buttons
        buttons = [b.strip() for b in page.locator("button, a").all_inner_texts() if b.strip()]
        print(f"[ACTIONS & BUTTONS] ({len(buttons)}):", buttons[:10])

        # 4. Check for key PhishShield UI components
        body_text = page.locator("body").inner_text()
        has_phishshield = "phishshield" in body_text.lower()
        has_scanner = any(k in body_text.lower() for k in ["url", "sms", "scan", "threat"])
        has_banks = any(k in body_text.lower() for k in ["bank", "sbi", "hdfc", "icici", "registry"])

        print(f"[COMPONENT VERIFICATION]:")
        print(f"  - PhishShield Branding visible: {has_phishshield}")
        print(f"  - Scanner controls visible: {has_scanner}")
        print(f"  - Bank registry / Threat telemetry visible: {has_banks}")

        # 5. Take Full Page Screenshot
        page.screenshot(path=str(SCREENSHOT_PATH), full_page=True)
        print(f"[SCREENSHOT] Full page captured and saved to: {SCREENSHOT_PATH}")

        # 6. Check Console Logs
        errors = [l for l in console_logs if l["type"] == "error"]
        print(f"[DIAGNOSTICS] Total Console Errors: {len(errors)}")
        for err in errors[:5]:
            print(f"    * Error: {err['text']}")

        print(f"[DIAGNOSTICS] Total Network Failures: {len(network_errors)}")
        for net_err in network_errors[:5]:
            print(f"    * Failed: {net_err['url']} -> {net_err['error']}")

        browser.close()
        print("=== Playwright Live Verification Completed Successfully ===")
        return True


if __name__ == "__main__":
    success = run_inspection()
    sys.exit(0 if success else 1)
