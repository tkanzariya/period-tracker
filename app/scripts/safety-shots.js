/**
 * Screenshots of the age-aware and late/silent states (audit items M1 to M5), from the web preview.
 *
 * 1. In one terminal:  npx expo start --web --port 8082
 * 2. Then, from app/:  node scripts/safety-shots.js [outDir]
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE = process.env.PREVIEW_URL || 'http://localhost:8082';
const outDir = process.argv[2] || path.join(__dirname, '..', '.tmp', 'safety');
fs.mkdirSync(outDir, { recursive: true });

const ts = '2026-10-01T10:00:00.000Z';
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const ago = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return iso(d);
};
const addDays = (s, n) => {
  const d = new Date(s + 'T12:00:00');
  d.setDate(d.getDate() + n);
  return iso(d);
};
const backup = (starts, age) => ({
  format: 'cycle-saathi-backup',
  schema_version: 2,
  exported_at: ts,
  app_version: '0.2.0',
  data: {
    periods: starts.map((s, i) => ({ id: `p${i}`, start_date: s, end_date: null, note: null, created_at: ts, updated_at: ts, deleted_at: null })),
    daily_logs: [],
    settings: [{ key: 'display_name', value: 'Drashti', updated_at: ts }, { key: 'tour_seen', value: '1', updated_at: ts }, ...(age ? [{ key: 'age_group', value: age, updated_at: ts }] : [])],
  },
});

// A start date, then the cycle lengths after it; the last start is `lastAgo` days ago.
const fromCycles = (lengths, lastAgo) => {
  const total = lengths.reduce((a, b) => a + b, 0);
  const first = addDays(ago(lastAgo), -total);
  const starts = [first];
  lengths.forEach((l) => starts.push(addDays(starts[starts.length - 1], l)));
  return starts;
};

const scenarios = [
  { name: 'silent-adult', data: backup([ago(204)], null) },
  { name: 'late-more-adult', data: backup([ago(45)], null) },
  { name: 'late-few-adult', data: backup([ago(36)], null) },
  { name: 'teen-irregular', data: backup(fromCycles([35, 42], 12), 'under20') },
  { name: 'adult-irregular', data: backup(fromCycles([24, 41, 29, 48], 12), 'adult') },
  { name: 'regular-adult', data: backup(fromCycles([28, 28, 28], 12), 'adult') },
  { name: 'over40-long', data: backup(fromCycles([26, 33, 41], 20), 'over40') },
  { name: 'long-gap-list', data: backup([ago(200), ago(181), ago(162), ago(143), ago(125), ago(26)], null), tab: 'cycles' },
];

(async () => {
  const browser = await chromium.launch({ executablePath: EDGE, headless: true });
  for (const sc of scenarios) {
    const context = await browser.newContext({ viewport: { width: 390, height: 1100 }, deviceScaleFactor: 1.5, colorScheme: 'light' });
    const page = await context.newPage();
    page.setDefaultTimeout(120000);
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof window.__cycleSaathi !== 'undefined', null, { timeout: 120000 });
    await page.evaluate((text) => window.__cycleSaathi.restore(text), JSON.stringify(sc.data));
    await page.waitForTimeout(1500);
    if (sc.tab === 'cycles') {
      await page.getByText('My cycles', { exact: true }).first().click();
      await page.waitForTimeout(1200);
    }
    await page.screenshot({ path: path.join(outDir, `${sc.name}.png`) });
    console.log(sc.name, errors.length ? 'ERRORS ' + errors.join(' | ') : 'ok');
    await context.close();
  }

  // Settings: the age row and its sheet. Welcome: the age step.
  {
    const context = await browser.newContext({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 1.5 });
    const page = await context.newPage();
    page.setDefaultTimeout(120000);
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof window.__cycleSaathi !== 'undefined', null, { timeout: 120000 });
    await page.waitForTimeout(1500);
    await page.getByText('Get started').click();
    await page.getByLabel('Your name').fill('Drashti');
    await page.getByText('Continue').click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(outDir, 'welcome-age.png') });
    await page.getByText('Under 20').click();
    await page.getByText('Next', { exact: true }).click();
    await page.waitForTimeout(600);
    await page.screenshot({ path: path.join(outDir, 'welcome-after-age.png') });
    await context.close();
  }
  {
    const context = await browser.newContext({ viewport: { width: 390, height: 900 }, deviceScaleFactor: 1.5 });
    const page = await context.newPage();
    page.setDefaultTimeout(120000);
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof window.__cycleSaathi !== 'undefined', null, { timeout: 120000 });
    await page.evaluate((text) => window.__cycleSaathi.restore(text), JSON.stringify(backup([ago(10)], 'adult')));
    await page.waitForTimeout(1500);
    await page.getByLabel('Settings').first().click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(outDir, 'settings-age.png') });
    await page.getByText('Your age group').click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(outDir, 'settings-age-sheet.png') });
    await context.close();
  }
  await browser.close();
  console.log('done ->', outDir);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
