/**
 * Capture web portal screenshots for the demo presentation.
 * All screenshots (except login) are taken AFTER logging in as Management.
 * Run with: node capture-web-screenshots.js
 * Requires: npm install puppeteer (from docs/demo or project root)
 *
 * Ensure the web app and backend are running (npm run dev from project root).
 * Set BASE_URL and LOGIN_* below or via env.
 */

const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
// Log in as Management (admin / demo123) so all post-login screens show full access
const LOGIN_USER = process.env.LOGIN_USER || process.env.LOGIN_EMAIL || 'admin';
const LOGIN_PASSWORD = process.env.LOGIN_PASSWORD || 'demo123';

const OUT_DIR = path.join(__dirname, 'screenshots', 'web');

/** path => filename (e.g. /approvals => approvals.png) */
const PAGES = [
  '/login',
  '/dashboard',
  '/approvals',
  '/analytics',
  '/donor-portal',
  '/donor-mgmt',
  '/user-mgmt',
  '/audit',
  '/settings',
  '/programs',
  '/partners',
  '/lfa',
  '/beneficiaries',
  '/activities',
  '/form-builder',
  '/monitoring',
  '/budget',
  '/expenses',
  '/reports',
  '/documents',
  '/employees',
  '/attendance',
  '/leave',
  '/recruitment',
  '/performance',
  '/payroll',
  '/engagement',
  '/calendar',
  '/letters',
  '/ess',
  '/assets',
  '/stationery',
  '/travel',
  '/insurance',
  '/admin-expenses',
];

async function main() {
  let puppeteer;
  try {
    puppeteer = require('puppeteer');
  } catch (_) {
    console.error('Puppeteer not found. Run: npm install puppeteer');
    process.exit(1);
  }

  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  try {
    // 1) Capture login page (no auth)
    await page.goto(BASE_URL + '/login', { waitUntil: 'networkidle0', timeout: 15000 });
    await page.screenshot({ path: path.join(OUT_DIR, 'login.png'), fullPage: true });
    console.log('Saved screenshots/web/login.png');

    // 2) Log in as Management – ensure backend is running (npm run dev)
    await page.waitForSelector('input[autocomplete="username"], input[type="text"]', { timeout: 8000 });
    // Click Management (first role button) to pre-fill admin / demo123, then submit
    await page.click('button[type="button"]');
    await new Promise((r) => setTimeout(r, 400));
    await page.click('button[type="submit"]');

    // 3) Wait for SPA redirect (no full page load – wait for URL and sidebar)
    await page.waitForFunction(
      () => !window.location.pathname.startsWith('/login') && window.location.pathname !== '',
      { timeout: 20000 }
    ).catch(() => null);
    await page.waitForSelector('aside', { timeout: 15000 }).catch(() => null);
    await new Promise((r) => setTimeout(r, 1500));

    const stillOnLogin = await page.evaluate(() => document.querySelector('input[type="password"]') && !document.querySelector('aside'));
    if (stillOnLogin) {
      console.error('Login did not succeed. Ensure backend is running (npm run dev) and credentials are admin / demo123.');
      const errPath = path.join(OUT_DIR, '_login_failed.png');
      await page.screenshot({ path: errPath, fullPage: true });
      console.error('Screenshot saved to ' + errPath);
    } else {
      // 4) Capture all post-login pages (inside portal)
      for (const route of PAGES) {
        if (route === '/login') continue;
        const name = route.slice(1) || 'dashboard';
        const file = name + '.png';
        try {
          await page.goto(BASE_URL + route, { waitUntil: 'networkidle0', timeout: 15000 });
          await new Promise((r) => setTimeout(r, 800));
          const hasSidebar = await page.evaluate(() => !!document.querySelector('aside'));
          if (!hasSidebar) {
            console.warn('After ' + route + ' still on login? Skipping.');
            continue;
          }
          await page.screenshot({ path: path.join(OUT_DIR, file), fullPage: true });
          console.log('Saved screenshots/web/' + file);
        } catch (e) {
          console.warn('Skip ' + route + ': ' + e.message);
        }
      }
    }
  } catch (e) {
    console.error('Capture failed:', e.message);
  } finally {
    await browser.close();
  }
}

main();
