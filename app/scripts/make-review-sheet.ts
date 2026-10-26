/**
 * Builds docs/review/cycle-review.html: a plain-language sheet for Drashti to
 * check every number and message the app uses. It reads the real values from
 * the code, so it always matches the app. Run from app/:  npm run review-sheet
 */
/// <reference types="node" />
import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { DEFAULT_CYCLE_RULES as r } from '../src/config/cycleRules';
import { addDays } from '../src/domain/dates';
import { getDayInfo } from '../src/domain/phases';
import type { Period, Phase } from '../src/domain/types';
import { DISCLAIMER, PHASE_GUIDE, PHASE_LABEL, PHASE_MEANING, flagMessage } from '../src/ui/copy';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const days = (n: number) => `${n} ${n === 1 ? 'day' : 'days'}`;

interface Item {
  id: string;
  title: string;
  /** What the app does today, in plain words. */
  says: string;
  /** Why, in plain words. */
  why?: string;
}
interface Section {
  title: string;
  intro?: string;
  items: Item[];
}

const sections: Section[] = [
  {
    title: '1. How the app guesses your next period',
    intro: 'A "cycle" is counted from the first day of one period to the first day of the next period.',
    items: [
      {
        id: 'avg',
        title: 'Which past cycles it looks at',
        says: `It uses your last ${r.prediction.cyclesToAverage} cycles and takes the average length.`,
        why: 'Newer cycles tell more about you than very old ones.',
      },
      {
        id: 'min',
        title: 'When it starts guessing',
        says: `It waits until you have ${r.prediction.minCyclesForPrediction} finished cycles (that means ${r.prediction.minCyclesForPrediction + 1} period start dates). Before that it says "I am still learning".`,
        why: 'One cycle is not enough to see a pattern.',
      },
      {
        id: 'range',
        title: 'The guess is a range, not one day',
        says: `It shows a range, at least ${days(r.prediction.minRangeHalfWidthDays)} before and after the best guess. If your cycles change a lot, the range gets wider.`,
        why: 'A single exact day would look more sure than it really is.',
      },
    ],
  },
  {
    title: '2. What the app calls "usual"',
    intro: 'When something is outside these numbers, the app says: "You may want to tell your doctor". It never says something is wrong.',
    items: [
      {
        id: 'cycle',
        title: 'Usual cycle length',
        says: `${r.cycle.normalMinDays} to ${r.cycle.normalMaxDays} days.`,
        why: 'A shorter or longer cycle is mentioned in a calm message.',
      },
      {
        id: 'period',
        title: 'Usual period length',
        says: `Up to ${days(r.period.normalMaxDays)}.`,
      },
      {
        id: 'assumed',
        title: 'If she forgets to say when the period ended',
        says: `The app guesses the period lasted ${days(r.period.assumedLengthDays)}.`,
      },
      {
        id: 'variation',
        title: 'Cycles that change a lot',
        says: `If her longest cycle is more than ${days(r.cycle.maxVariationDays)} longer than her shortest cycle (out of the last ${r.prediction.cyclesToAverage}), the app mentions it.`,
      },
    ],
  },
  {
    title: '3. Ovulation and fertile days',
    intro: 'All of these are guesses made from period dates only. The app says so every time.',
    items: [
      {
        id: 'ovulation',
        title: 'When ovulation happens',
        says: `${days(r.ovulation.lutealPhaseDays)} before the next period starts.`,
        why: 'The time from ovulation to the next period stays fairly steady (about 12 to 14 days) even when cycles are longer or shorter.',
      },
      {
        id: 'ovulationPhase',
        title: 'The "Ovulation" part of the cycle',
        says: `The ovulation day, plus ${days(r.ovulation.phaseDaysBefore)} before and ${days(r.ovulation.phaseDaysAfter)} after (so ${r.ovulation.phaseDaysBefore + r.ovulation.phaseDaysAfter + 1} days in total).`,
      },
      {
        id: 'fertile',
        title: 'Fertile days (best chance of pregnancy)',
        says: `From ${days(r.fertileWindow.daysBeforeOvulation)} before ovulation to ${days(r.fertileWindow.daysAfterOvulation)} after it.`,
        why: 'Sperm can live up to about 5 days. The egg lives about 12 to 24 hours.',
      },
      {
        id: 'lower',
        title: '"Lower-fertility days" (hidden unless she turns it on)',
        says: `Days outside the fertile days, with ${days(r.lowerFertility.bufferDays)} extra on each side to be careful. Only shown when her cycles are regular. Always with the words "not a way to prevent pregnancy".`,
        why: 'We do not use the words "safe period" because these guesses can be wrong.',
      },
    ],
  },
];

const phases: Phase[] = ['menstrual', 'follicular', 'ovulation', 'luteal'];
const phaseItems: Item[] = phases.flatMap((p) => [
  { id: `meaning-${p}`, title: `${PHASE_LABEL[p]}: the short line`, says: PHASE_MEANING[p] },
  { id: `guide-${p}`, title: `${PHASE_LABEL[p]}: what the guide says`, says: PHASE_GUIDE[p] },
]);
sections.push({
  title: '4. The four parts of the cycle and the words we use',
  intro: 'Please check that each sentence is correct, kind, and easy to understand.',
  items: phaseItems,
});

const flagItems: Item[] = [
  { id: 'f-short', title: 'Cycle is short', says: flagMessage({ code: 'cycle_short', value: 19 }, r) },
  { id: 'f-long', title: 'Cycle is long', says: flagMessage({ code: 'cycle_long', value: 38 }, r) },
  { id: 'f-var', title: 'Cycles change a lot', says: flagMessage({ code: 'cycle_variation', value: 11 }, r) },
  { id: 'f-plong', title: 'Period lasted long', says: flagMessage({ code: 'period_long', value: 9 }, r) },
  { id: 'f-late', title: 'Period is late', says: flagMessage({ code: 'period_late', value: 4 }, r) },
  { id: 'f-late-guide', title: 'What the guide says when the period is late', says: 'Your period is a little late. This can happen. If you are worried, please talk to your doctor.' },
  { id: 'disclaimer', title: 'Note shown at the bottom of the Today screen', says: DISCLAIMER },
];
sections.push({ title: '5. Messages when something looks unusual', items: flagItems });

// Worked example: a regular 28-day pattern, laid out day by day by the real app logic.
const p = (startDate: string, endDate: string | null): Period => ({ id: startDate, startDate, endDate, note: null });
const sample = [
  p('2026-07-01', '2026-07-05'),
  p('2026-07-29', '2026-08-02'),
  p('2026-08-26', '2026-08-30'),
  p('2026-09-23', '2026-09-27'),
];
const start = '2026-09-23';
const rows: string[] = [];
for (let d = 1; d <= 28; d++) {
  const info = getDayInfo(addDays(start, d - 1), sample, r);
  const tags = [info.isOvulationDay ? 'Ovulation day' : '', info.isFertileWindow ? 'Fertile day' : '', info.isLowerFertility ? 'Lower-fertility' : '']
    .filter(Boolean)
    .join(', ');
  rows.push(
    `<tr class="ph-${info.phase}"><td>Day ${d}</td><td>${info.phase ? PHASE_LABEL[info.phase] : ''}</td><td>${tags}</td></tr>`,
  );
}

function itemHtml(i: Item): string {
  return `<div class="item" data-id="${i.id}" data-title="${esc(i.title)}">
  <h3>${esc(i.title)}</h3>
  <p class="says"><b>The app says / does:</b> ${esc(i.says)}</p>
  ${i.why ? `<p class="why">Why: ${esc(i.why)}</p>` : ''}
  <div class="answer">
    <label><input type="radio" name="${i.id}" value="ok"> Looks right</label>
    <label><input type="radio" name="${i.id}" value="change"> Needs a change</label>
    <input class="change" type="text" placeholder="Change it to… (or write what is wrong)">
  </div>
</div>`;
}

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Cycle app: review sheet for Drashti</title>
<style>
:root{--bg:#FBF6F2;--card:#fff;--line:#E6D8D1;--text:#2B1B20;--text2:#6B5A60;--rose:#C9265F;--soft:#F9DDE6;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font-size:18px;line-height:1.5;padding:16px}
main{max-width:760px;margin:0 auto}h1{font-size:28px;margin:8px 0}h2{font-size:22px;margin:36px 0 6px;color:var(--rose)}h3{font-size:18px;margin:0 0 6px}
p{margin:6px 0}.intro,.why{color:var(--text2);font-size:16px}.says{background:var(--soft);padding:10px 12px;border-radius:12px}
.item{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:14px 16px;margin:12px 0;break-inside:avoid}
.answer{display:flex;flex-wrap:wrap;gap:10px 18px;align-items:center;margin-top:10px}
.answer label{display:flex;align-items:center;gap:8px;min-height:44px}.answer input[type=radio]{width:22px;height:22px;accent-color:var(--rose)}
.change{flex:1 1 100%;min-height:44px;border:1px solid var(--line);border-radius:10px;padding:8px 12px;font-size:16px}
.top{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:14px 16px}
table{width:100%;border-collapse:collapse;font-size:16px;background:var(--card);border-radius:12px;overflow:hidden}
td{padding:6px 10px;border-bottom:1px solid var(--line)}
.ph-menstrual td{background:#F9DDE6}.ph-follicular td{background:#F7E8C8}.ph-ovulation td{background:#D3EEEC}.ph-luteal td{background:#E6DDF2}
.btn{min-height:48px;border:0;border-radius:14px;background:var(--rose);color:#fff;font-size:18px;font-weight:600;padding:0 22px;margin:6px 8px 6px 0;cursor:pointer}
.btn.ghost{background:transparent;color:var(--rose);border:2px solid var(--rose)}
textarea{width:100%;min-height:200px;border:1px solid var(--line);border-radius:12px;padding:10px;font-size:15px;margin-top:10px}
@media print{.noprint{display:none}body{font-size:14px}.item{padding:8px 12px}}
</style></head><body><main>
<h1>Review sheet: how the app thinks</h1>
<div class="top">
  <p>Hi Drashti! This sheet shows every number and every sentence the app uses. Nothing here is final until you say so.</p>
  <p>For each box, tick <b>Looks right</b> or <b>Needs a change</b>. If something needs a change, write what it should be. At the end, press <b>Copy my answers</b> and send them to Tirth.</p>
  <p class="intro">You do not need to know anything about computers. Just check it as a nurse.</p>
</div>
${sections
  .map(
    (s) => `<h2>${esc(s.title)}</h2>${s.intro ? `<p class="intro">${esc(s.intro)}</p>` : ''}${s.items.map(itemHtml).join('\n')}`,
  )
  .join('\n')}
<h2>6. An example: a regular 28-day cycle</h2>
<p class="intro">This table is made by the app itself for a woman whose cycles are always 28 days and whose periods last 5 days. Does each day look right to you?</p>
<table>${rows.join('')}</table>
${itemHtml({ id: 'example', title: 'Does the 28-day example look right?', says: 'See the table above.' })}
<h2>Anything else?</h2>
<div class="item" data-id="other" data-title="Anything else"><textarea id="other" placeholder="Anything missing, confusing, or not kind enough? Write it here."></textarea></div>
<div class="noprint">
  <button class="btn" id="copy">Copy my answers</button>
  <button class="btn ghost" onclick="window.print()">Print or save as PDF</button>
  <textarea id="out" readonly placeholder="Your answers will appear here after you press Copy."></textarea>
</div>
<script>
document.getElementById('copy').addEventListener('click', function () {
  var lines = ['Review answers from Drashti', ''];
  document.querySelectorAll('.item[data-id]').forEach(function (el) {
    var id = el.getAttribute('data-id');
    if (id === 'other') return;
    var picked = el.querySelector('input[type=radio]:checked');
    var note = el.querySelector('.change');
    var status = picked ? (picked.value === 'ok' ? 'OK' : 'CHANGE') : 'not answered';
    var text = note && note.value.trim() ? ' -> ' + note.value.trim() : '';
    lines.push('- ' + el.getAttribute('data-title') + ': ' + status + text);
  });
  var other = document.getElementById('other').value.trim();
  if (other) { lines.push('', 'Other: ' + other); }
  var out = document.getElementById('out');
  out.value = lines.join('\\n');
  out.select();
  try { document.execCommand('copy'); } catch (e) {}
  if (navigator.clipboard) { navigator.clipboard.writeText(out.value).catch(function () {}); }
});
</script>
</main></body></html>
`;

const outFile = join(__dirname, '..', '..', 'docs', 'review', 'cycle-review.html');
mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, html);
console.log('wrote', outFile);
