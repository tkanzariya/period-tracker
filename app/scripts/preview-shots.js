/**
 * Takes phone-sized screenshots of the web preview using the Edge browser that
 * ships with Windows, so screens can be checked without a phone or a visible window.
 *
 * 1. In one terminal:  npx expo start --web --port 8082
 * 2. Then, from app/:  node scripts/preview-shots.js [outDir]
 *
 * It loads sample data through the app's own restore function (dev only).
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE = process.env.PREVIEW_URL || 'http://localhost:8082';
const outDir = process.argv[2] || path.join(__dirname, '..', '.tmp', 'shots');
fs.mkdirSync(outDir, { recursive: true });

const ts = '2026-10-01T10:00:00.000Z';
const period = (id, s, e) => ({ id, start_date: s, end_date: e, note: null, created_at: ts, updated_at: ts, deleted_at: null });
const sample = {
  format: 'cycle-saathi-backup',
  schema_version: 2,
  exported_at: ts,
  app_version: '1.0.0',
  data: {
    periods: [
      period('p1', '2026-06-06', '2026-06-10'),
      period('p2', '2026-07-04', '2026-07-08'),
      period('p3', '2026-08-01', '2026-08-05'),
      period('p4', '2026-09-08', '2026-09-14'),
      period('p5', '2026-10-06', '2026-10-10'),
    ],
    daily_logs: [{ id: 'n1', date: '2026-10-08', note: 'Felt tired and a bit crampy', created_at: ts, updated_at: ts, deleted_at: null }],
    settings: [{ key: 'display_name', value: 'Drashti', updated_at: ts }],
  },
};

async function settle(page, ms = 1500) {
  await page.waitForTimeout(ms);
}

(async () => {
  const browser = await chromium.launch({ executablePath: EDGE, headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: process.env.SCHEME || 'light' });
  const page = await context.newPage();
  page.setDefaultTimeout(120000);
  page.setDefaultNavigationTimeout(180000);
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 200));
  });

  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof window.__cycleSaathi !== 'undefined', null, { timeout: 120000 });

  if (!process.env.NO_SAMPLE) {
    const result = await page.evaluate((text) => window.__cycleSaathi.restore(text), JSON.stringify(sample));
    console.log('restore:', JSON.stringify(result));
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof window.__cycleSaathi !== 'undefined', null, { timeout: 120000 });
  }
  await settle(page, 2500);

  const shot = async (name) => {
    await page.screenshot({ path: path.join(outDir, name + '.png') });
    console.log('shot', name);
  };

  await shot('1-today');
  for (const [label, name] of [['Calendar', '2-calendar'], ['My cycles', '3-my-cycles'], ['Settings', '4-settings']]) {
    await page.getByRole('link', { name: label }).first().click().catch(async () => {
      await page.getByText(label, { exact: true }).last().click();
    });
    await settle(page);
    await shot(name);
  }

  if (errors.length) console.log('ERRORS:\n' + [...new Set(errors)].join('\n'));
  else console.log('no errors');
  await browser.close();
})().catch((e) => {
  console.error('FAILED', e.message);
  process.exit(1);
});
