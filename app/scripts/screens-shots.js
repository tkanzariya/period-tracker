/**
 * Screenshots of the 2026-11-21 screen batch (centre button, Today order, Calendar guesses and Today chip,
 * ring popup, My cycles filter and amber bars, bleeding days, earlier cycles), from the web preview.
 *
 * 1. In one terminal:  npx expo start --web --port 8082
 * 2. Then, from app/:  node scripts/screens-shots.js [outDir]
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE = process.env.PREVIEW_URL || 'http://localhost:8082';
const outDir = process.argv[2] || path.join(__dirname, '..', '.tmp', 'screens');
fs.mkdirSync(outDir, { recursive: true });

const ts = '2026-10-01T10:00:00.000Z';
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const addDays = (s, n) => {
  const d = new Date(s + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return iso(d);
};
const ago = (n) => addDays(iso(new Date()), -n);
const backup = (starts) => ({
  format: 'cycle-saathi-backup',
  schema_version: 2,
  exported_at: ts,
  app_version: '0.2.0',
  data: {
    periods: starts.map((s, i) => ({ id: `p${i}`, start_date: s, end_date: null, note: null, created_at: ts, updated_at: ts, deleted_at: null })),
    daily_logs: [],
    settings: [{ key: 'display_name', value: 'Drashti', updated_at: ts }, { key: 'tour_seen', value: '1', updated_at: ts }, { key: 'age_group', value: 'adult', updated_at: ts }],
  },
});
// Nine regular-ish cycles ending 10 days ago, with one 41-day cycle.
const lengths = [28, 29, 28, 41, 28, 30, 28, 29, 28];
const starts = [];
let cur = addDays(ago(10), -lengths.reduce((a, b) => a + b, 0));
starts.push(cur);
lengths.forEach((l) => {
  cur = addDays(cur, l);
  starts.push(cur);
});

(async () => {
  const browser = await chromium.launch({ executablePath: EDGE, headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 1.5, colorScheme: 'light' });
  await context.addInitScript(() => { const st = document.createElement('style'); st.textContent = '#error-toast{display:none!important}'; document.addEventListener('DOMContentLoaded', () => document.head.appendChild(st)); });
  const page = await context.newPage();
  page.setDefaultTimeout(120000);
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof window.__cycleSaathi !== 'undefined', null, { timeout: 120000 });
  await page.evaluate((text) => window.__cycleSaathi.restore(text), JSON.stringify(backup(starts)));
  await page.waitForTimeout(1500);
  const shot = (name) => page.screenshot({ path: path.join(outDir, name + '.png') });

  await shot('today');
  // Tap a ring arc (the first pink arc near the top right of the ring) to read what it means.
  await page.mouse.click(228, 402);
  await page.waitForTimeout(600);
  await shot('today-ring-popup');
  await page.getByText('Got it').click();
  await page.waitForTimeout(300);

  await page.getByRole('tab', { name: 'Calendar' }).click();
  await page.waitForTimeout(1200);
  await shot('calendar');
  await page.getByLabel('Month after').click();
  await page.getByLabel('Month after').click();
  await page.waitForTimeout(600);
  await shot('calendar-later-month');
  await page.getByText('Back to today').click();
  await page.waitForTimeout(400);

  await page.getByRole('tab', { name: 'My cycles' }).click();
  await page.waitForTimeout(1200);
  await shot('my-cycles');
  await page.getByText('All', { exact: true }).click();
  await page.waitForTimeout(500);
  await shot('my-cycles-all');
  // Change this period: bleeding days.
  await page.getByLabel(/^Change this period/).first().click();
  await page.waitForTimeout(800);
  await page.getByText('6 days').click();
  await shot('change-period-bleeding');
  await page.getByText('Save changes').click();
  await page.waitForTimeout(800);
  await page.getByRole('tab', { name: 'Calendar' }).click();
  await page.waitForTimeout(1000);
  await shot('calendar-after-bleeding-days');

  await page.getByLabel('Period started').click();
  await page.waitForTimeout(800);
  await shot('tell-me-sheet');

  console.log(errors.length ? 'ERRORS ' + errors.join(' | ') : 'no page errors');
  await context.close();

  const c2 = await browser.newContext({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 1.5 });
  await c2.addInitScript(() => { const st = document.createElement('style'); st.textContent = '#error-toast{display:none!important}'; document.addEventListener('DOMContentLoaded', () => document.head.appendChild(st)); });
  const p2 = await c2.newPage();
  p2.setDefaultTimeout(120000);
  await p2.goto(BASE, { waitUntil: 'domcontentloaded' });
  await p2.waitForFunction(() => typeof window.__cycleSaathi !== 'undefined', null, { timeout: 120000 });
  await p2.evaluate((text) => window.__cycleSaathi.restore(text), JSON.stringify(backup([ago(10)])));
  await p2.waitForTimeout(1500);
  await p2.getByRole('tab', { name: 'My cycles' }).click();
  await p2.waitForTimeout(800);
  await p2.getByText('Add earlier cycles').click();
  await p2.waitForTimeout(800);
  await p2.getByText('Add another cycle').click();
  await p2.waitForTimeout(500);
  await p2.screenshot({ path: path.join(outDir, 'earlier-cycles.png') });
  await c2.close();

  // Regular cycles: the Calendar shows dashed guesses and the ovulation ring.
  const reg = [];
  let d = addDays(ago(10), -28 * 4);
  for (let i = 0; i < 5; i++) { reg.push(d); d = addDays(d, 28); }
  const c3 = await browser.newContext({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 1.5 });
  await c3.addInitScript(() => { const st = document.createElement('style'); st.textContent = '#error-toast{display:none!important}'; document.addEventListener('DOMContentLoaded', () => document.head.appendChild(st)); });
  const p3 = await c3.newPage();
  p3.setDefaultTimeout(120000);
  await p3.goto(BASE, { waitUntil: 'domcontentloaded' });
  await p3.waitForFunction(() => typeof window.__cycleSaathi !== 'undefined', null, { timeout: 120000 });
  await p3.evaluate((text) => window.__cycleSaathi.restore(text), JSON.stringify(backup(reg)));
  await p3.waitForTimeout(1500);
  await p3.screenshot({ path: path.join(outDir, 'today-regular.png') });
  await p3.getByRole('tab', { name: 'Calendar' }).click();
  await p3.waitForTimeout(1200);
  await p3.screenshot({ path: path.join(outDir, 'calendar-regular.png') });
  await c3.close();
  await browser.close();
  console.log('done ->', outDir);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
