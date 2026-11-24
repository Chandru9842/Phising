// Playwright script to verify the live deployed PhishShield frontend
import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const TARGET_URL = 'https://phising-two-chi.vercel.app/';
const ARTIFACT_DIR = 'C:/Users/chand/.gemini/antigravity/brain/9c31b1b1-baf5-4c7d-b80b-74a06487c0f4';
const SCREENSHOT_PATH = path.join(ARTIFACT_DIR, 'vercel_live_phishshield.png');

async function inspectLiveSite() {
  console.log(`[PLAYWRIGHT] Launching Chromium browser...`);
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  });

  const page = await context.newPage();

  const consoleLogs = [];
  const networkErrors = [];

  page.on('console', msg => {
    consoleLogs.push({ type: msg.type(), text: msg.text() });
  });

  page.on('pageerror', err => {
    consoleLogs.push({ type: 'error', text: err.toString() });
  });

  page.on('requestfailed', request => {
    networkErrors.push({ url: request.url(), failure: request.failure()?.errorText });
  });

  console.log(`[PLAYWRIGHT] Navigating to ${TARGET_URL}...`);
  const response = await page.goto(TARGET_URL, { waitUntil: 'networkidle', timeout: 45000 });
  console.log(`[PLAYWRIGHT] HTTP Response: ${response.status()}`);

  // Wait for React to mount
  await page.waitForTimeout(3000);

  const title = await page.title();
  console.log(`[PLAYWRIGHT] Page Title: "${title}"`);

  // Evaluate UI text and headings
  const headings = await page.$$eval('h1, h2, h3, h4', els => els.map(e => e.innerText.trim()).filter(Boolean));
  console.log(`[PLAYWRIGHT] Rendered Headings (${headings.length}):`, headings.slice(0, 8));

  // Check navigation and buttons
  const buttons = await page.$$eval('button', els => els.map(e => e.innerText.trim()).filter(Boolean));
  console.log(`[PLAYWRIGHT] Rendered Buttons (${buttons.length}):`, buttons.slice(0, 8));

  // Capture full page screenshot
  await page.screenshot({ path: SCREENSHOT_PATH, fullPage: true });
  console.log(`[PLAYWRIGHT] Screenshot saved successfully at: ${SCREENSHOT_PATH}`);

  // Check if system status indicator is present
  const bodyText = await page.innerText('body');
  const hasPhishShield = bodyText.includes('PhishShield');
  const hasScanner = bodyText.includes('Scanner') || bodyText.includes('URL') || bodyText.includes('Scan');

  console.log(`[PLAYWRIGHT] UI Validation:`);
  console.log(`  - Contains "PhishShield": ${hasPhishShield}`);
  console.log(`  - Contains Scanner Elements: ${hasScanner}`);
  console.log(`  - Console Error Count: ${consoleLogs.filter(l => l.type === 'error').length}`);
  console.log(`  - Network Request Failures: ${networkErrors.length}`);

  if (consoleLogs.filter(l => l.type === 'error').length > 0) {
    console.log(`[PLAYWRIGHT] Console Errors:`, consoleLogs.filter(l => l.type === 'error').slice(0, 5));
  }

  await browser.close();
  console.log(`[PLAYWRIGHT] Inspection complete!`);
}

inspectLiveSite().catch(err => {
  console.error('[PLAYWRIGHT ERROR]', err);
  process.exit(1);
});
