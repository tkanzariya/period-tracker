import type { CycleRules } from '../config/cycleRules';
import { averagePeriodLength, cycleRows, cycleStats } from '../domain/cycles';
import type { DateStr } from '../domain/dates';
import type { DailyLog, Period } from '../domain/types';
import type { Strings } from '../i18n';
import { formatLong, formatRange, formatShort } from './format';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// The brand drop (same colours as the logo), small enough to sit in the report header.
const LOGO_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="44" height="54" viewBox="340 225 620 760">' +
  '<defs><linearGradient id="d" gradientUnits="userSpaceOnUse" x1="740" y1="600" x2="585" y2="800">' +
  '<stop offset="0" stop-color="#EE6F7B"/><stop offset="0.55" stop-color="#C13348"/><stop offset="1" stop-color="#951F36"/></linearGradient></defs>' +
  '<path d="M888 525 C 932 610 936 720 882 810 C 822 902 722 956 610 953 C 520 949 430 902 368 818 C 436 886 526 938 612 940 C 714 942 808 890 864 806 C 916 726 912 612 888 525 Z" fill="#E4A59E"/>' +
  '<path d="M645 253 C 686 286 706 340 688 378 C 660 440 570 470 500 512 C 430 555 414 620 428 668 C 445 730 520 790 580 825 C 625 850 638 890 641 934 C 632 884 620 858 576 828 C 512 790 440 735 424 668 C 412 620 432 556 504 516 C 576 476 668 446 696 380 C 712 340 690 290 645 253 Z" fill="#A5273F"/>' +
  '<path d="M641 520 C 612 580 557 648 557 722 A 93 93 0 0 0 743 722 C 743 650 672 580 641 520 Z" fill="url(#d)"/></svg>';

/** The printable report she can show a doctor: branded, one page of facts, no guesses. */
export function buildReportHtml(o: {
  periods: Period[];
  notes: DailyLog[];
  rules: CycleRules;
  S: Strings;
  name: string | null;
  today: DateStr;
}): string {
  const { periods, notes, rules, S, name, today } = o;
  const r = S.report;
  const rows = cycleRows(periods, rules);
  const stats = cycleStats(periods, rules);
  const periodAvg = averagePeriodLength(periods);

  const stat = (label: string, value: string) => `<div class="stat"><div class="lab">${esc(label)}</div><div class="val">${esc(value)}</div></div>`;
  const summary = [
    stats ? stat(r.usualCycle, S.common.days(Math.round(stats.averageLength))) : '',
    stats ? stat(r.range, `${stats.shortest}–${stats.longest}`) : '',
    periodAvg !== null ? stat(r.usualPeriod, S.common.days(Math.round(periodAvg))) : '',
    stat(r.cyclesNoted, String(periods.length)),
  ].join('');

  const body = rows
    .map((row) => {
      const end = row.period.endDate ?? row.period.startDate;
      const dates = row.period.endDate ? formatRange(row.period.startDate, end, S) : formatShort(row.period.startDate, S);
      const text = notes
        .filter((n) => n.date >= row.period.startDate && n.date <= end)
        .map((n) => `${formatShort(n.date, S)}: ${n.note}`)
        .join('; ');
      return (
        `<tr><td>${esc(dates)}</td><td>${esc(row.periodDays !== null ? S.common.days(row.periodDays) : r.endNotTold)}</td>` +
        `<td>${esc(row.cycleDays !== null ? S.common.days(row.cycleDays) : r.current)}</td><td>${esc(text)}</td></tr>`
      );
    })
    .join('');

  const who = name ? `${esc(r.forName(name))} · ` : '';
  const content = rows.length
    ? `<h2>${esc(r.summary)}</h2><div class="stats">${summary}</div>` +
      `<h2>${esc(r.history)}</h2><table><tr><th>${esc(r.colPeriod)}</th><th>${esc(r.colPeriodDays)}</th><th>${esc(r.colCycle)}</th><th>${esc(r.colNote)}</th></tr>${body}</table>`
    : `<p>${esc(r.empty)}</p>`;

  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(r.title)}</title><style>
@page{margin:18mm 16mm}
body{font-family:Arial,Helvetica,sans-serif;color:#2B1B20;font-size:12pt;line-height:1.4}
.head{display:flex;align-items:center;gap:14px;border-bottom:3px solid #C9265F;padding-bottom:10px;margin-bottom:16px}
.brand{font-size:11pt;color:#C9265F;font-weight:700;letter-spacing:.5px}
h1{margin:2px 0 0;font-size:22pt}
.sub{color:#6B5A60;font-size:10.5pt}
h2{font-size:13pt;color:#C9265F;margin:18px 0 8px}
.stats{display:flex;flex-wrap:wrap;gap:10px}
.stat{flex:1 1 120px;background:#F9DDE6;border-radius:10px;padding:10px 12px}
.lab{font-size:9.5pt;color:#6B5A60}.val{font-size:15pt;font-weight:700}
table{width:100%;border-collapse:collapse;font-size:10.5pt}
th{text-align:left;background:#FCEDE7;padding:7px 8px;border-bottom:2px solid #E6D8D1}
td{padding:7px 8px;border-bottom:1px solid #E6D8D1;vertical-align:top}
.foot{margin-top:24px;font-size:9pt;color:#6B5A60;border-top:1px solid #E6D8D1;padding-top:8px}
</style></head><body>
<div class="head">${LOGO_SVG}<div><div class="brand">${esc(S.appName)}</div><h1>${esc(r.title)}</h1>
<div class="sub">${who}${esc(r.madeOn(formatLong(today, S)))}</div></div></div>
${content}
<div class="foot">${esc(r.footer)}</div>
</body></html>`;
}
