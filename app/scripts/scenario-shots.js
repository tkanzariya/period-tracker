/**
 * Drives the web preview like a person would and takes phone-sized screenshots of every main situation:
 * first run, first period only (tentative data), full data, the sheets, the problem messages, settings,
 * the tour. Also fails loudly on console errors.
 *
 *   1. npx expo start --web --port 8082          (in app/)
 *   2. node scripts/scenario-shots.js [outDir]    env: SCHEME=light|dark, LANG_CODE=en|hi
 */
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const BASE = process.env.PREVIEW_URL || 'http://localhost:8082';
const SCHEME = process.env.SCHEME || 'light';
const LANG_CODE = process.env.LANG_CODE || 'en';
const outDir = path.resolve(process.argv[2] || path.join(__dirname, '..', '.tmp', `shots-${SCHEME}-${LANG_CODE}`));
fs.mkdirSync(outDir, { recursive: true });

const ts = '2026-10-01T10:00:00.000Z';
const period = (id, s, e) => ({ id, start_date: s, end_date: e, note: null, created_at: ts, updated_at: ts, deleted_at: null });
const backup = (periods, name = 'Drashti') => ({
  format: 'cycle-saathi-backup', schema_version: 2, exported_at: ts, app_version: '0.1.0',
  data: {
    periods,
    daily_logs: periods.length ? [{ id: 'n1', date: periods[periods.length - 1].start_date, note: 'Felt tired and a bit crampy', created_at: ts, updated_at: ts, deleted_at: null }] : [],
    settings: [{ key: 'display_name', value: name, updated_at: ts }, { key: 'language', value: LANG_CODE, updated_at: ts }, { key: 'tour_seen', value: '1', updated_at: ts }],
  },
});
const FULL = [
  period('p1', '2026-06-06', '2026-06-10'), period('p2', '2026-07-04', '2026-07-08'), period('p3', '2026-08-01', '2026-08-05'),
  period('p4', '2026-09-08', '2026-09-14'), period('p5', '2026-10-06', '2026-10-10'),
];
const FIRST_ONLY = [period('p5', '2026-10-27', '2026-10-31')];
const OPEN = [period('p5', '2026-11-03', null)];

const errors = [];
const wait = (page, ms = 900) => page.waitForTimeout(ms);

async function open(browser, restoreWith) {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, colorScheme: SCHEME });
  const page = await context.newPage();
  page.setDefaultTimeout(60000);
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 200)); });
  await page.goto(BASE, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof window.__cycleSaathi !== 'undefined', null, { timeout: 180000 });
  if (restoreWith) {
    await page.evaluate((text) => window.__cycleSaathi.restore(text), JSON.stringify(restoreWith));
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof window.__cycleSaathi !== 'undefined', null, { timeout: 180000 });
  }
  await wait(page, 2500);
  return { context, page };
}

const snap = (page, name) => page.screenshot({ path: path.join(outDir, name + '.png') }).then(() => console.log('shot', name));
const tap = async (page, name, exact = false) => {
  await page.getByRole('button', { name, exact }).first().click();
  await wait(page);
};
const goTab = (page, re) => page.locator('[role="tab"], a').filter({ hasText: re }).last().click();
const tapText = async (page, text) => {
  await page.getByText(text, { exact: false }).first().click();
  await wait(page);
};

(async () => {
  const browser = await chromium.launch({ executablePath: EDGE, headless: true });

  // 1. First run: welcome flow
  {
    const { context, page } = await open(browser, null);
    await snap(page, '01-welcome-intro');
    await page.getByRole('button').filter({ hasText: /./ }).last().click();
    await wait(page);
    await snap(page, '02-welcome-name');
    await page.locator('input').first().fill('Drashti');
    await page.getByRole('button').last().click().catch(() => {});
    await wait(page);
    await snap(page, '03-welcome-last-period');
    await page.getByRole('button', { name: /^Next|^आगे/ }).last().click();
    await wait(page);
    await snap(page, '04-welcome-history-offer');
    await context.close();
  }

  // 2. Only the first period known: tentative data
  {
    const { context, page } = await open(browser, backup(FIRST_ONLY));
    await snap(page, '10-today-first-period-tentative');
    await goTab(page, /Calendar|कैलेंडर/);
    await wait(page, 1500);
    await snap(page, '11-calendar-tentative');
    await context.close();
  }

  // 3. A period is going on: the button says "ended"
  {
    const { context, page } = await open(browser, backup(OPEN));
    await snap(page, '20-today-period-going-on');
    await page.locator('[aria-label="Period ended"], [aria-label="पीरियड ख हुई"]').first().click().catch(() => {});
    await wait(page);
    await snap(page, '21-tell-me-ended-sheet');
    await context.close();
  }

  // 4. Full data
  {
    const { context, page } = await open(browser, backup(FULL));
    await snap(page, '30-today-full');
    await goTab(page, /Calendar|कैलेंडर/);
    await wait(page, 1500);
    await snap(page, '31-calendar-full');
    await page.getByRole('button', { name: /Month before|पिछला महीना|पहले/ }).first().click();
    await wait(page, 1200);
    await snap(page, '31b-calendar-october');
    await page.getByRole('button', { name: /\b8 October|October 8\b|\b8 अक्टूबर/ }).first().click();
    await wait(page);
    await snap(page, '32-calendar-day-sheet');
    await page.keyboard.press('Escape');
    await goTab(page, /My cycles|मेरे चक्र/);
    await wait(page, 1500);
    await snap(page, '33-my-cycles');
    await goTab(page, /Today|आज/);
    await wait(page, 1200);
    // Problem: start a second period on a day inside the last one
    await page.getByRole('button', { name: /Period started|पीरियड शुरू/ }).first().click();
    await wait(page);
    await snap(page, '40-tell-me-start-sheet');
    await page.getByRole('button', { name: /Which day|कौन सा दिन/ }).first().click().catch(() => {});
    await wait(page);
    await snap(page, '41-date-picker');
    await context.close();
  }

  // 5. Settings, tour
  {
    const { context, page } = await open(browser, backup(FULL));
    await page.getByRole('button', { name: /Settings|सेटिंग/ }).first().click();
    await wait(page, 1200);
    await snap(page, '50-settings');
    await page.getByRole('button', { name: /How to use|कैसे/ }).first().click().catch(() => {});
    await wait(page, 1200);
    await snap(page, '51-tour-step-1');
    await context.close();
  }

  // 6. Problems (calm messages), "is that right?" popup, remove with Undo
  {
    const pickDay = async (page, monthsBack, label) => {
      await page.getByRole('button', { name: /Which day|कौन सा दिन/ }).last().click();
      await wait(page);
      for (let i = 0; i < monthsBack; i++) {
        await page.getByRole('button', { name: /Month before|पिछला महीना/ }).last().click();
        await wait(page, 400);
      }
      await page.getByRole('button', { name: label }).last().click();
      await wait(page);
    };
    const save = async (page) => {
      await page.getByRole('button', { name: /^Save|सेव/ }).last().click();
      await wait(page, 1200);
    };

    // a) start a period on a day inside an earlier one
    let c = await open(browser, backup(FULL));
    await tap(c.page, /Period started|पीरियड शुरू/);
    await pickDay(c.page, 1, /\b8 October|October 8\b|\b8 अक्टूबर/);
    await save(c.page);
    await snap(c.page, '60-problem-start-inside-period');
    await c.context.close();

    // b) start a second period while one is still open
    c = await open(browser, backup(OPEN));
    await tap(c.page, /Period ended|पीरियड ख/);
    await c.page.getByRole('tab', { name: /Period started|पीरियड शुरू/ }).last().click();
    await wait(c.page);
    await save(c.page);
    await snap(c.page, '61-problem-previous-not-ended');
    await c.context.close();

    // c) a new period only 14 days after the last start: "is that right?"
    c = await open(browser, backup(FULL));
    await tap(c.page, /Period started|पीरियड शुरू/);
    await pickDay(c.page, 1, /\b20 October|October 20\b|\b20 अक्टूबर/);
    await save(c.page);
    await snap(c.page, '62-popup-too-soon');
    await c.context.close();

    // d) end a period before it started: not offered a future day; empty note
    c = await open(browser, backup(FULL));
    await tap(c.page, /Period started|पीरियड शुरू/);
    await c.page.getByRole('tab', { name: /Just a note|सिर्फ़/ }).last().click();
    await wait(c.page);
    await save(c.page);
    await snap(c.page, '63-problem-empty-note');
    await c.context.close();

    // f) add earlier cycles (a missed-cycle question and a clash)
    c = await open(browser, backup(FULL));
    await goTab(c.page, /My cycles|मेरे चक्र/);
    await wait(c.page, 1200);
    await c.page.getByRole('button', { name: /Add earlier cycles|पिछले चक्र जोड़ें/ }).last().click();
    await wait(c.page, 1200);
    await snap(c.page, '70-add-cycles');
    await c.page.getByRole('button', { name: /Add another cycle|एक और चक्र/ }).last().click();
    await wait(c.page);
    await c.page.getByRole('button', { name: /Add another cycle|एक और चक्र/ }).last().click();
    await wait(c.page);
    await snap(c.page, '71-add-cycles-three-rows');
    await c.context.close();

    // e) remove a period, then the Undo toast
    c = await open(browser, backup(FULL));
    await goTab(c.page, /My cycles|मेरे चक्र/);
    await wait(c.page, 1200);
    await c.page.getByRole('button', { name: /Change this period|यह पीरियड बदलें/ }).first().click();
    await wait(c.page);
    await snap(c.page, '64-change-period-sheet');
    await c.page.getByRole('button', { name: /Remove this period|यह पीरियड हटाएँ/ }).last().click();
    await wait(c.page);
    await snap(c.page, '65-popup-remove');
    await c.page.getByRole('button', { name: /^Remove this period|^यह पीरियड हटाएँ|^Remove$|^हटाएँ$/ }).last().click();
    await wait(c.page, 1000);
    await snap(c.page, '66-toast-undo');
    await c.context.close();
  }

  await browser.close();
  if (errors.length) {
    console.log('ERRORS:\n' + [...new Set(errors)].join('\n'));
    process.exitCode = 1;
  } else console.log('no errors');
})().catch((e) => {
  console.error('FAILED', e.message);
  process.exit(1);
});
