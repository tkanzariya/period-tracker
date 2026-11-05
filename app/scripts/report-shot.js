/**
 * Makes a real PDF of the report in the preview (headless Edge) and shows page 1 as a picture, so the
 * PDF can be checked without a phone.  Needs the preview server:  npx expo start --web --port 8082
 *   node scripts/report-shot.js [outDir]       env: LANG_CODE=en|hi
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE = process.env.PREVIEW_URL || 'http://localhost:8082';
const outDir = path.resolve(process.argv[2] || path.join(__dirname, '..', '.tmp', 'report'));
fs.mkdirSync(outDir, { recursive: true });

const ts = '2026-10-01T10:00:00.000Z';
const period = (id, s, e) => ({ id, start_date: s, end_date: e, note: null, created_at: ts, updated_at: ts, deleted_at: null });
const backup = {
  format: 'cycle-saathi-backup', schema_version: 2, exported_at: ts, app_version: '0.1.0',
  data: {
    periods: [period('p1', '2026-06-06', '2026-06-10'), period('p2', '2026-07-04', '2026-07-08'), period('p3', '2026-08-01', '2026-08-05'), period('p4', '2026-09-08', '2026-09-14'), period('p5', '2026-10-06', '2026-10-10')],
    daily_logs: [{ id: 'n1', date: '2026-10-08', note: 'Felt tired and a bit crampy', created_at: ts, updated_at: ts, deleted_at: null }],
    settings: [{ key: 'display_name', value: 'Drashti', updated_at: ts }, { key: 'tour_seen', value: '1', updated_at: ts }, { key: 'language', value: process.env.LANG_CODE || 'en', updated_at: ts }],
  },
};

(async () => {
  const browser = await chromium.launch({ executablePath: EDGE, headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  page.setDefaultTimeout(60000);
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof window.__cycleSaathi !== 'undefined', null, { timeout: 180000 });
  await page.evaluate((t) => window.__cycleSaathi.restore(t), JSON.stringify(backup));
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof window.__cycleSaathi !== 'undefined', null, { timeout: 180000 });
  await page.waitForTimeout(2500);

  // Capture the HTML the app hands to the printer instead of opening a print dialog.
  await page.evaluate(() => {
    window.__printed = null;
    window.print = () => {};
    const orig = document.body.appendChild.bind(document.body);
    document.body.appendChild = (el) => {
      if (el && el.tagName === 'IFRAME' && el.srcdoc) window.__printed = el.srcdoc;
      return orig(el);
    };
  });
  await page.getByRole('button', { name: /Settings|सेटिंग/ }).first().click();
  await page.waitForTimeout(1200);
  await page.getByRole('button', { name: /PDF/ }).first().click();
  await page.waitForTimeout(1500);
  const html = await page.evaluate(() => window.__printed);
  if (!html) throw new Error('The app did not hand a report to the printer');
  fs.writeFileSync(path.join(outDir, 'report.html'), html);

  const doc = await context.newPage();
  await doc.setContent(html);
  await doc.pdf({ path: path.join(outDir, 'report.pdf'), format: 'A4', printBackground: true });
  await doc.emulateMedia({ media: 'print' });
  await doc.setViewportSize({ width: 794, height: 1123 });
  await doc.screenshot({ path: path.join(outDir, 'report.png') });
  console.log('wrote', outDir);
  await browser.close();
})().catch((e) => {
  console.error('FAILED', e.message);
  process.exit(1);
});
