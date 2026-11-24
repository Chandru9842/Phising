"""
Playwright Live Interaction Test:
Navigates to https://phising-two-chi.vercel.app/,
navigates to URL Scanner, types a test URL, clicks Scan, and verifies results.
"""

from playwright.sync_api import sync_playwright
import time
from pathlib import Path

TARGET_URL = "https://phising-two-chi.vercel.app/"
ARTIFACT_DIR = Path(r"C:\Users\chand\.gemini\antigravity\brain\9c31b1b1-baf5-4c7d-b80b-74a06487c0f4")

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)
    page = browser.new_page(viewport={"width": 1440, "height": 900})

    print("[PLAYWRIGHT] Loading dashboard...")
    page.goto(TARGET_URL, wait_until="networkidle", timeout=60000)
    page.wait_for_timeout(3000)

    # Click on the URL Scanner in the sidebar
    print("[PLAYWRIGHT] Clicking '02 URL Scanner'...")
    page.locator("text=02").first.click()
    page.wait_for_timeout(2000)

    # Locate input field
    input_box = page.locator("input[placeholder*='url' i], input[type='text'], input[placeholder*='http' i]").first
    print("[PLAYWRIGHT] Typing test phishing URL...")
    input_box.fill("http://sbi-verify-kyc-update.com/netbanking")
    page.wait_for_timeout(1000)

    # Click Scan button
    scan_button = page.locator("button:has-text('Scan'), button:has-text('Analyze')").first
    print("[PLAYWRIGHT] Clicking Scan button...")
    scan_button.click()

    # Wait for response (up to 15 seconds)
    print("[PLAYWRIGHT] Waiting for scan analysis response...")
    page.wait_for_timeout(8000)

    # Capture screenshot of scan result
    scan_screenshot = ARTIFACT_DIR / "vercel_live_scan_result.png"
    page.screenshot(path=str(scan_screenshot), full_page=True)
    print(f"[PLAYWRIGHT] Scan result screenshot saved: {scan_screenshot}")

    # Inspect visible results
    page_text = page.locator("body").inner_text()
    print("[PLAYWRIGHT] Scan Page Elements:")
    for kw in ["CRITICAL", "SAFE", "SUSPICIOUS", "PHISHING", "State Bank of India", "Risk Score"]:
        if kw in page_text:
            print(f"  * Detected in UI: '{kw}'")

    browser.close()
    print("[PLAYWRIGHT] Live interaction test finished.")
