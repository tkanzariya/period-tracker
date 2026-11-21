/**
 * Builds docs/review/cycle-review.html: a plain-language sheet for Drashti to check every number and
 * message the app uses. It reads the real values and runs the real app logic for its examples and
 * diagrams, so it always matches the app. Run from app/:  npm run review-sheet
 *
 * Written for a nurse, not a programmer: small pictures, worked examples ("a woman whose last period
 * was 1 October..."), where each number comes from, and a Looks right / Needs a change box for each.
 */
/// <reference types="node" />
import { mkdirSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { rulesForAge } from '../src/config/cycleRules';
import { canGuessOvulation, completedCycleLengths, cycleStats } from '../src/domain/cycles';
import { addDays } from '../src/domain/dates';
import { getIrregularityFlags } from '../src/domain/flags';
import { getHeadline, type Headline } from '../src/domain/headline';
import { getDayInfo } from '../src/domain/phases';
import { predictNextPeriod, predictWithFallback } from '../src/domain/prediction';
import type { Period, Phase } from '../src/domain/types';
import type { IssueCode } from '../src/domain/validation';
import { en } from '../src/i18n/en';
import { flagText } from '../src/ui/flagText';
import { describeIssue } from '../src/ui/issueText';

const adult = rulesForAge('adult');
const young = rulesForAge('under20');
const over40 = rulesForAge('over40');
const r = adult;

const PHASE_LABEL = en.phases.names;
const PHASE_COLOR: Record<Phase, string> = { menstrual: '#F4B8CB', follicular: '#F7E8C8', ovulation: '#BFE6E3', luteal: '#D9CBEC' };

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const days = (n: number) => `${n} ${n === 1 ? 'day' : 'days'}`;
const p = (startDate: string): Period => ({ id: startDate, startDate, endDate: null, note: null });
const shortDate = (d: string) => `${Number(d.slice(8))} ${en.dates.monthsShort[Number(d.slice(5, 7)) - 1]}`;

interface Source {
  label: string;
  url: string;
}
interface Item {
  id: string;
  title: string;
  /** What the app says or does, in plain words. */
  says: string;
  /** Why, in plain words (and what it used to say, when it changed). */
  why?: string;
  /** A small picture (inline HTML or SVG) shown under the text. */
  visual?: string;
  /** Marked when a medical number or sentence needs her yes. */
  needsYou?: boolean;
  sources?: Source[];
}
interface Section {
  title: string;
  intro?: string;
  visual?: string;
  items: Item[];
}

const NHS_IRREG: Source = { label: 'NHS: irregular periods', url: 'https://www.nhs.uk/conditions/irregular-periods/' };
const NHS_LATE: Source = { label: 'NHS: missed or late periods', url: 'https://www.nhs.uk/conditions/missed-or-late-periods/' };
const ACOG651: Source = { label: 'ACOG Committee Opinion 651 (girls and teens)', url: 'https://pubmed.ncbi.nlm.nih.gov/26595586/' };
const FIGO: Source = { label: 'FIGO normal ranges (table in the Merck Manual)', url: 'https://www.merckmanuals.com/professional/multimedia/table/normal-menstrual-parameters' };
const WILCOX: Source = { label: 'Wilcox 1995, NEJM: timing of sex and ovulation', url: 'https://www.ovid.com/journals/nejm/pdf/10.1056/nejm199512073332301~timing-of-sexual-intercourse-in-relation-to-ovulation---' };
const BULL: Source = { label: 'Bull 2019: 600,000 app-tracked cycles', url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC6710244' };
const LUTEAL: Source = { label: 'Human Reproduction 2024: luteal phase length', url: 'https://academic.oup.com/humrep/article/39/11/2565/7775370' };
const STRAW: Source = { label: 'STRAW+10: stages of reproductive ageing', url: 'https://pubmed.ncbi.nlm.nih.gov/17453859/' };
const NHS_HEAVY: Source = { label: 'NHS: heavy periods', url: 'https://www.nhs.uk/conditions/heavy-periods/' };

// ---------------------------------------------------------------- small drawings

/** A strip of 28 coloured days, made by the real app logic for a regular 28-day cycle. */
function cycleStrip(): string {
  const sample = [p('2026-07-01'), p('2026-07-29'), p('2026-08-26'), p('2026-09-23')];
  const start = '2026-09-23';
  const cells: string[] = [];
  for (let d = 1; d <= 28; d++) {
    const info = getDayInfo(addDays(start, d - 1), sample, r);
    const color = info.phase ? PHASE_COLOR[info.phase] : '#eee';
    const mark = info.isOvulationDay ? '★' : '';
    cells.push(
      `<div class="cell" style="background:${color}" title="Day ${d}${info.phase ? ': ' + PHASE_LABEL[info.phase] : ''}"><span>${d}</span><i>${mark}</i></div>`,
    );
  }
  const legend = (['menstrual', 'follicular', 'ovulation', 'luteal'] as Phase[])
    .map((ph) => `<span class="key"><b style="background:${PHASE_COLOR[ph]}"></b>${PHASE_LABEL[ph]}</span>`)
    .join('');
  return `<div class="strip">${cells.join('')}</div><p class="legend">${legend}<span class="key">★ ovulation day (a guess)</span></p>`;
}

/** The timeline of what Today says as the days pass with no period (adult), as a coloured bar. */
function silenceBar(): string {
  const windowEnd = r.prediction.typicalCycleLengthDays + r.prediction.tentativeRangeHalfWidthDays;
  const fewEnd = windowEnd + r.late.fewDays;
  const silentAt = r.silence.noPhaseAfterDays;
  const total = 100;
  const x = (d: number) => (d / total) * 600;
  const zone = (a: number, b: number, color: string, label: string) =>
    `<rect x="${x(a)}" y="22" width="${x(b) - x(a)}" height="36" fill="${color}"/><text x="${(x(a) + x(b)) / 2}" y="44" text-anchor="middle" font-size="11" fill="#2B1B20">${label}</text>`;
  const tick = (d: number, label: string) =>
    `<line x1="${x(d)}" y1="58" x2="${x(d)}" y2="68" stroke="#6B5A60"/><text x="${x(d)}" y="82" text-anchor="middle" font-size="11" fill="#6B5A60">${label}</text>`;
  return `<svg viewBox="0 0 660 96" class="svg" role="img" aria-label="Timeline of what the app says as days pass without a period">
<g transform="translate(10,0)">
${zone(0, windowEnd, '#D9E8D5', 'normal guess')}
${zone(windowEnd, fewEnd, '#F7E8C8', '')}
${zone(fewEnd, silentAt, '#F4C9A8', 'late')}
${zone(silentAt, total, '#E3C6CF', 'no guess')}
${tick(0, 'day 1')}${tick(windowEnd, `day ${windowEnd}`)}${tick(fewEnd, `day ${fewEnd}`)}${tick(silentAt, `day ${silentAt}`)}${tick(100, 'day 100')}
<text x="0" y="12" font-size="12" fill="#2B1B20">Days since the last period started (a woman with no cycle history yet: typical 28 days)</text>
</g></svg>
<p class="legend"><span class="key"><b style="background:#D9E8D5"></b>normal guess</span><span class="key"><b style="background:#F7E8C8"></b>a few days late (up to ${r.late.fewDays} days after my guess)</span><span class="key"><b style="background:#F4C9A8"></b>late: a pregnancy test is mentioned</span><span class="key"><b style="background:#E3C6CF"></b>no day number, no phase: "did it come?" (shown for an adult; later for under 20 and 40+)</span></p>`;
}

/** A 21-day strip showing the predicted range around the best guess. */
function rangeStrip(half: number, label: string): string {
  const cells: string[] = [];
  for (let d = -10; d <= 10; d++) {
    const inside = Math.abs(d) <= half;
    cells.push(`<div class="cell small" style="background:${d === 0 ? '#C9265F' : inside ? '#F4B8CB' : '#f3eeee'};color:${d === 0 ? '#fff' : '#2B1B20'}"><span>${d === 0 ? 'best guess' : ''}</span></div>`);
  }
  return `<p class="legend"><b>${label}</b></p><div class="strip">${cells.join('')}</div>`;
}

/** Bars for a list of cycle lengths, with the typical (middle) and the average marked. */
function lengthBars(lengths: number[], typical: number, average: number): string {
  const max = Math.max(...lengths, 40);
  const bars = lengths
    .map(
      (n) =>
        `<div class="bar"><div class="fill" style="width:${(n / max) * 100}%"></div><span>${n} days</span></div>`,
    )
    .join('');
  return `<div class="bars">${bars}</div><p class="legend"><span class="key"><b style="background:#2f7d5b"></b>Typical (middle value): ${Math.round(typical)} days</span><span class="key"><b style="background:#a8650b"></b>Plain average: ${Math.round(average)} days</span></p>`;
}

// ---------------------------------------------------------------- what Today says

function todayLine(h: Headline): string {
  const t = en.today.headline;
  switch (h.kind) {
    case 'none': return '(nothing yet)';
    case 'period_day': return t.periodDay(h.day);
    case 'coming': return t.coming(h.fromDays, h.toDays);
    case 'any_day_now': return t.anyDayNow;
    case 'late': return `${t.late(h.days)}. ${h.few ? t.lateHelpFew : t.lateHelpMore}`;
    case 'silent': return `${t.silent(h.days)}. ${t.silentHelp}`;
  }
}
function guideLine(h: Headline): string {
  if (h.kind === 'late') return h.few ? en.guide.lateFew : en.guide.lateMore;
  if (h.kind === 'silent') return en.guide.silent(h.days);
  return '';
}

function silenceTable(): string {
  const start = '2026-10-01';
  const one = [p(start)];
  const picks = [3, 12, 27, 34, 42, 65, 80, 95];
  const rows = picks
    .map((d) => {
      const today = addDays(start, d - 1);
      const cells = [adult, young, over40].map((rules) => `<td>${esc(todayLine(getHeadline(one, today, rules)))}</td>`).join('');
      return `<tr><td><b>Day ${d}</b></td>${cells}</tr>`;
    })
    .join('');
  return `<table class="ex"><tr><th>Days since her last period started</th><th>Age 20 to 39 (default)</th><th>Under 20</th><th>40 and over</th></tr>${rows}</table>
<p class="legend">She told the app about one period on 1 October and nothing since. The app has no history for her, so it uses a typical 28-day cycle.</p>`;
}

function personTable(): string {
  const cases: { who: string; periods: Period[]; today: string; ages: [string, ReturnType<typeof rulesForAge>][] }[] = [
    { who: 'A girl of 17 with cycles of 35 and 42 days (periods on 20 Aug, 24 Sep, 5 Nov)', periods: [p('2026-08-20'), p('2026-09-24'), p('2026-11-05')], today: '2026-11-21', ages: [['Under 20', young], ['If she had said "20 to 39"', adult]] },
    { who: 'A woman with very different cycles: 24, 41, 29 and 48 days', periods: [p('2026-06-20'), p('2026-07-14'), p('2026-08-24'), p('2026-09-22'), p('2026-11-09')], today: '2026-11-21', ages: [['20 to 39', adult]] },
    { who: 'A woman with regular 28-day cycles (periods on 1 Jul, 29 Jul, 26 Aug, 23 Sep)', periods: [p('2026-07-01'), p('2026-07-29'), p('2026-08-26'), p('2026-09-23')], today: '2026-10-05', ages: [['20 to 39', adult]] },
  ];
  const rows: string[] = [];
  for (const c of cases) {
    for (const [label, rules] of c.ages) {
      const pred = predictWithFallback(c.periods, rules);
      const flags = getIrregularityFlags(c.periods, c.today, rules).filter((f) => f.code !== 'period_late');
      const may = canGuessOvulation(cycleStats(c.periods, rules), rules);
      const day = getDayInfo(c.today, c.periods, rules);
      const phaseNote = may ? (day.phase ? `Today: ${PHASE_LABEL[day.phase]} part, ovulation guessed` : '') : 'No ovulation or fertile-day guess (' + (rules.ageGroup === 'under20' ? en.today.noOvulationYoung : en.today.noOvulationVary) + ')';
      const flagLines = flags.length ? flags.map((f) => flagText(f, en, rules) + (rules.ageGroup === 'over40' ? ' ' + en.flags.over40Note : '')).join(' ') : 'No "tell your doctor" note.';
      rows.push(
        `<tr><td><b>${esc(c.who)}</b><br><span class="legend">${esc(label)}</span></td><td>${pred ? `Next period likely ${shortDate(pred.earliestStart)} to ${shortDate(pred.latestStart)}` : ''}</td><td>${esc(phaseNote)}</td><td>${esc(flagLines)}</td></tr>`,
      );
    }
  }
  return `<table class="ex"><tr><th>Who</th><th>Next period</th><th>Ovulation</th><th>Note to tell a doctor</th></tr>${rows.join('')}</table>`;
}

// ---------------------------------------------------------------- the sections

const sections: Section[] = [];

sections.push({
  title: 'A. The picture of one cycle',
  intro:
    'A cycle is counted from the first day of one period to the day before the next period starts. There is no "period ended" button: she only tells the app the day a period started. The first 5 days are drawn as "Bleeding" (an estimate). This is a regular 28-day cycle, drawn by the app itself.',
  visual: cycleStrip(),
  items: [
    {
      id: 'ph-order',
      title: 'Are the four parts, their order and their colours right for a regular 28-day cycle?',
      says: `Bleeding (days 1 to ${r.period.assumedLengthDays}), Follicular, Ovulation (${r.ovulation.phaseDaysBefore + r.ovulation.phaseDaysAfter + 1} days around ovulation), Luteal.`,
      why: 'Ovulation is guessed 14 days before the next period starts, because that part of the cycle is fairly steady even when cycles are longer or shorter.',
      needsYou: true,
      sources: [LUTEAL, WILCOX],
    },
    {
      id: 'assumed',
      title: 'The first 5 days are called "Bleeding" even though she never says when the bleeding ended',
      says: `${days(r.period.assumedLengthDays)}. If she adds when the bleeding ended (optional, in Change this period), the app will use her number instead.`,
      needsYou: true,
    },
  ],
});

sections.push({
  title: 'B. What "usual" means, and how it depends on age',
  intro: 'The app asks once: "How old are you?" (Under 20, 20 to 39, 40 and over; she can skip). It never asks for the exact age. The age group only changes how wide "usual" is and how long the app keeps guessing.',
  items: [
    {
      id: 'age-table',
      title: 'Are these numbers right for each age group?',
      says: 'See the table below.',
      needsYou: true,
      sources: [NHS_IRREG, ACOG651, FIGO, STRAW],
      visual: `<table class="ex"><tr><th></th><th>Under 20</th><th>20 to 39 (also if skipped)</th><th>40 and over</th></tr>
<tr><td>Usual cycle length</td><td>${young.cycle.normalMinDays} to ${young.cycle.normalMaxDays} days</td><td>${adult.cycle.normalMinDays} to ${adult.cycle.normalMaxDays} days</td><td>${over40.cycle.normalMinDays} to ${over40.cycle.normalMaxDays} days, plus the note "${esc(en.flags.over40Note)}"</td></tr>
<tr><td>"Cycles change a lot" note appears when longest minus shortest is more than</td><td>${days(young.cycle.maxVariationDays)}</td><td>${days(adult.cycle.maxVariationDays)}</td><td>${days(over40.cycle.maxVariationDays)}</td></tr>
<tr><td>Ovulation and fertile days guessed?</td><td>No (periods are often not regular yet)</td><td>Yes, unless cycles change by more than ${days(adult.cycle.maxVariationDays)}</td><td>Yes, unless cycles change by more than ${days(over40.cycle.maxVariationDays)}</td></tr>
<tr><td>The app stops showing a day number and a phase after</td><td>${days(young.silence.noPhaseAfterDays)} with no period told</td><td>${days(adult.silence.noPhaseAfterDays)}</td><td>${days(over40.silence.noPhaseAfterDays)}</td></tr></table>`,
    },
    {
      id: 'age-question',
      title: 'The question the app asks',
      says: `"${en.welcome.ageTitle}" ${en.welcome.ageBody} Choices: ${en.settings.ageGroup.options.under20} (${en.settings.ageGroup.optionHelp.under20}), ${en.settings.ageGroup.options.adult} (${en.settings.ageGroup.optionHelp.adult}), ${en.settings.ageGroup.options.over40} (${en.settings.ageGroup.optionHelp.over40}).`,
      needsYou: true,
    },
    {
      id: 'median',
      title: '"Typical cycle" uses the middle value, not the plain average',
      says: 'One very long or very short cycle should not become her "usual". The app shows the middle value and marks the odd cycle as a "Long gap".',
      why: 'Before: "Usual cycle 35 days, from 18 to 99" after one 99-day gap. Now the typical cycle is 19 days and the 99-day cycle is marked "Long gap".',
      visual: (() => {
        const lengths = [18, 19, 19, 18, 99];
        const periods = [p('2026-06-01'), p('2026-06-19'), p('2026-07-08'), p('2026-07-27'), p('2026-08-14'), p('2026-11-21')];
        const st = cycleStats(periods, r)!;
        return lengthBars(completedCycleLengths(periods), st.medianLength, st.averageLength) + `<p class="legend">Cycles of ${lengths.join(', ')} days.</p>`;
      })(),
      needsYou: true,
    },
  ],
});

sections.push({
  title: 'C. When a period is late, or nothing has been told for a long time',
  intro: 'This is the most important part to check. Before, the app said "a little late, this can happen" even 173 days later, and never mentioned pregnancy. Now the words change with how late it is, and after a long silence the app stops guessing and asks.',
  visual: silenceBar() + silenceTable(),
  items: [
    {
      id: 'late-few',
      title: 'Up to 7 days after my guess',
      says: `"${en.guide.lateFew}"`,
      why: `The number of days is ${r.late.fewDays}. Before: "Your period is a little late. This can happen. If you are worried, please talk to your doctor."`,
      needsYou: true,
      sources: [NHS_LATE],
    },
    {
      id: 'late-more',
      title: 'More than 7 days after my guess',
      says: `"${en.guide.lateMore}"`,
      needsYou: true,
      sources: [NHS_LATE],
    },
    {
      id: 'silent',
      title: 'No period told for 60 days (90 for under 20 and 40 and over): no day number, no phase, no guess',
      says: `"${en.today.headline.silent(75)}". ${en.today.headline.silentHelp} The Saathi says: "${en.guide.silent(75)}" A button: "${en.today.headline.silentButton}".`,
      why: 'Before it showed "Day 205 of your cycle" and the Luteal phase, which would be made up if she simply stopped using the app.',
      needsYou: true,
      sources: [NHS_LATE, ACOG651],
    },
  ],
});

sections.push({
  title: 'D. Examples of real situations',
  intro: 'The app worked these out itself from the dates. Please check the "Next period", "Ovulation" and "tell a doctor" columns for each woman.',
  visual: personTable(),
  items: [
    {
      id: 'ex-teen',
      title: 'The girl of 17: no "tell your doctor" for cycles of 35 and 42 days, and no ovulation guess',
      says: 'For under 20 the usual cycle goes up to 45 days and the app does not guess ovulation.',
      why: 'Before, a 42-day cycle was flagged "You may want to tell your doctor" for everyone.',
      needsYou: true,
      sources: [ACOG651],
    },
    {
      id: 'ex-vary',
      title: 'Cycles of 24, 41, 29, 48 days: the app says it cannot guess ovulation',
      says: en.today.noOvulationVary,
      needsYou: true,
      sources: [FIGO, BULL],
    },
  ],
});

const regularPeriods = [p('2026-07-01'), p('2026-07-29'), p('2026-08-26'), p('2026-09-23')];
const predNow = predictNextPeriod(regularPeriods, r)!;
sections.push({
  title: 'E. How wide the "next period" range is',
  intro: 'Before, a woman with four identical 28-day cycles got a range of only 1 day each side. Real cycles vary by days even in regular women, so the range is now never narrower than 3 days each side, until she has 6 cycles (then 2 days).',
  visual: rangeStrip(1, 'Before: 1 day each side') + rangeStrip(r.prediction.minRangeHalfWidthDays, `Now: ${r.prediction.minRangeHalfWidthDays} days each side (with fewer than ${r.prediction.manyCycles} cycles)`),
  items: [
    {
      id: 'range',
      title: 'Is 3 days each side, and then 2 days after 6 cycles, a good minimum?',
      says: `For 4 identical cycles (next period around ${shortDate(predNow.expectedStart)}) the app says "${en.today.nextRange(shortDate(predNow.earliestStart) + ' to ' + shortDate(predNow.latestStart))}".`,
      needsYou: true,
      sources: [BULL],
    },
    {
      id: 'typical',
      title: 'Before it knows her own pattern',
      says: `After even one period, a typical ${r.prediction.typicalCycleLengthDays}-day cycle, ${r.prediction.tentativeRangeHalfWidthDays} days each side, tagged "Typical cycle". Her own pattern is used after ${r.prediction.minCyclesForPrediction} finished cycles (${r.prediction.minCyclesForPrediction + 1} start dates), looking at the last ${r.prediction.cyclesToAverage}.`,
      needsYou: true,
    },
  ],
});

sections.push({
  title: 'F. Sentences that changed (please read each one as a nurse)',
  intro: 'Each sentence shows what the app used to say and what it says now.',
  items: [
    {
      id: 's-follicular',
      title: 'Follicular part (the Saathi says)',
      says: en.phases.guide.follicular,
      why: 'Before: "Your body is getting ready for ovulation. Many women feel more energetic now." Changed because the evidence for energy changes is weak.',
      needsYou: true,
    },
    {
      id: 's-ovulation',
      title: 'Ovulation part (the Saathi says), and the line on Today',
      says: `${en.phases.guide.ovulation} On Today: "${en.today.ovulationAround('28 Nov')}"`,
      why: 'Before: "Ovulation is likely around 28 Nov (a guess)". Now it says it can be days or weeks off.',
      needsYou: true,
      sources: [LUTEAL],
    },
    {
      id: 's-luteal',
      title: 'Luteal part (the Saathi says)',
      says: en.phases.guide.luteal,
      why: 'Before: "Some women feel tired or moody around now. That is normal." Changed because it could dismiss strong premenstrual symptoms.',
      needsYou: true,
    },
    {
      id: 's-long-young',
      title: 'A long cycle for someone under 20',
      says: flagText({ code: 'cycle_long', value: 42 }, en, young),
      needsYou: true,
      sources: [ACOG651],
    },
    {
      id: 's-long-adult',
      title: 'A long or short cycle for an adult',
      says: flagText({ code: 'cycle_long', value: 38 }, en, adult),
      why: 'Before: "Most cycles are between 21 and 35 days." Now "Most adults have cycles between...".',
      needsYou: true,
      sources: [NHS_IRREG],
    },
    {
      id: 's-var',
      title: 'Cycles change a lot',
      says: flagText({ code: 'cycle_variation', value: 11 }, en, adult),
      needsYou: true,
      sources: [FIGO],
    },
    {
      id: 's-over40',
      title: 'Added for 40 and over',
      says: en.flags.over40Note,
      needsYou: true,
      sources: [STRAW],
    },
    {
      id: 's-gap',
      title: 'Question when a new start is very far from the others',
      says: `"${en.issues.startLongGap.title(101)}" ${en.issues.startLongGap.body}`,
      why: 'Before: "101 days from your other periods" (it was not clear whose days).',
    },
    {
      id: 's-disclaimer',
      title: 'The note at the bottom of Today',
      says: en.today.disclaimer,
    },
  ],
});

const issueSample = { start: '2026-10-06', date: '2026-11-06', periodId: 'p1' };
const issueCodes: [IssueCode, string, number?][] = [
  ['future_date', 'She picks a day that has not come yet'],
  ['start_already_logged', 'A period already starts on that day'],
  ['start_too_soon', `A new start fewer than ${r.checks.minDaysBetweenStarts} days after another one (the app asks if that is right)`, 14],
  ['start_long_gap', `A new start more than ${r.checks.longGapDays} days from the others (a missed cycle; the app asks if that is right)`, 101],
  ['start_too_old', `A start more than ${days(r.checks.maxStartAgeDays)} ago (a typing slip; not allowed)`, r.checks.maxStartAgeDays],
  ['note_empty', 'She saves an empty note'],
  ['note_too_long', 'The note is too long', 500],
];
sections.push({
  title: 'G. Checks when she tells the app something',
  intro: 'The app stops mistakes and explains calmly, with a button for the next step.',
  items: issueCodes.map(([code, when, d]): Item => {
    const view = describeIssue({ severity: code === 'start_too_soon' || code === 'start_long_gap' ? 'confirm' : 'block', code, data: { ...issueSample, days: d } }, en, r);
    return {
      id: `issue-${code}`,
      title: when,
      says: `"${view.title}". ${view.body ?? ''}${view.action ? ` Button: "${view.action.label}".` : ''}${view.yes ? ` Buttons: "${view.yes}" / "${view.no}".` : ''}`,
    };
  }),
});

sections.push({
  title: 'H. Ovulation and fertile days',
  intro: 'All guesses made from period dates only, always labelled as guesses. Not shown for under 20, or when cycles change by more than 7 days.',
  items: [
    {
      id: 'ovulation',
      title: 'When ovulation happens',
      says: `${days(r.ovulation.lutealPhaseDays)} before the next period starts.`,
      why: 'In real life the length of the second half of the cycle varies from person to person, which is why the guess can be days off.',
      needsYou: true,
      sources: [LUTEAL, BULL],
    },
    {
      id: 'fertile',
      title: 'Fertile days',
      says: `From ${days(r.fertileWindow.daysBeforeOvulation)} before ovulation to ${days(r.fertileWindow.daysAfterOvulation)} after it.`,
      why: 'Sperm can live up to about 5 days. The egg lives about 12 to 24 hours.',
      needsYou: true,
      sources: [WILCOX],
    },
    {
      id: 'lower',
      title: '"Lower-fertility days" (estimate)',
      says: `Days outside the fertile days, with ${days(r.lowerFertility.bufferDays)} extra on each side. Only for regular cycles, always with "not birth control".`,
      why: 'We never use the words "safe period" because these guesses can be wrong.',
      needsYou: true,
    },
  ],
});

sections.push({
  title: 'I. Not in the app yet: heavy bleeding and when to see a doctor',
  intro: 'Tirth is still deciding this with you. Today the app does not ask about heavy or long bleeding or pain, and has no page saying when to see a doctor. A draft is in the improvements list (item M7). What would you like to see?',
  items: [
    {
      id: 'heavy',
      title: 'Which signs should the app tell her to see a doctor for?',
      says: 'Draft list from the NHS: changing a pad or tampon every 1 to 2 hours, clots bigger than about 2.5 cm, bleeding between periods or after sex, bleeding longer than 7 days, very strong pain, or no period for 3 months. What would you add or remove?',
      needsYou: true,
      sources: [NHS_HEAVY],
    },
  ],
});

sections.push({
  title: 'J. First start, tour, report and reminders',
  items: [
    { id: 'w-intro', title: 'Welcome: what it says about privacy and guesses', says: `${en.welcome.privateTitle}: ${en.welcome.privateBody} ${en.welcome.guessTitle}: ${en.welcome.guessBody}` },
    { id: 'report', title: 'The PDF report for a doctor', says: `A branded page with her name and date, the typical cycle (middle value), shortest to longest, and a table of every cycle with its length and notes. Footer: "${en.report.footer}"` },
    { id: 'settings-disclaimer', title: 'Good to know (Settings)', says: en.settings.disclaimer },
    { id: 'n-late', title: 'Reminder: later than my guess (lock-screen text when details are on)', says: `"${en.notify.details.late.title}" ${en.notify.details.late.body}`, why: 'Reminders arrive at 9 in the morning, at most one a day. By default the lock screen only says "A note from your Saathi". Is 9 in the morning right?', needsYou: true },
    { id: 'n-coming', title: 'Reminder: before the period', says: `"${en.notify.details.coming.title}" ${en.notify.details.coming.body}` },
    { id: 'n-quiet', title: 'Reminder: no news for 40 days', says: `"${en.notify.details.quiet.title}" ${en.notify.details.quiet.body}` },
  ],
});

// ---------------------------------------------------------------- the page

function itemHtml(i: Item): string {
  const sources = i.sources?.length
    ? `<p class="why">Where this comes from: ${i.sources.map((s) => `<a href="${s.url}" target="_blank" rel="noopener">${esc(s.label)}</a>`).join(' · ')}</p>`
    : '';
  return `<div class="item" data-id="${i.id}" data-title="${esc(i.title)}">
  <h3>${i.needsYou ? '<span class="need">Needs your yes</span> ' : ''}${esc(i.title)}</h3>
  <p class="says"><b>The app says / does:</b> ${esc(i.says)}</p>
  ${i.visual ?? ''}
  ${i.why ? `<p class="why">${esc(i.why)}</p>` : ''}
  ${sources}
  <div class="answer">
    <label><input type="radio" name="${i.id}" value="ok"> Looks right</label>
    <label><input type="radio" name="${i.id}" value="change"> Needs a change</label>
    <input class="change" type="text" placeholder="Change it to… (or write what is wrong)">
  </div>
</div>`;
}

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Cycle Saathi: review sheet for Drashti</title>
<style>
:root{--bg:#FBF6F2;--card:#fff;--line:#E6D8D1;--text:#2B1B20;--text2:#6B5A60;--rose:#C9265F;--soft:#F9DDE6;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font-size:18px;line-height:1.5;padding:16px}
main{max-width:820px;margin:0 auto}h1{font-size:28px;margin:8px 0}h2{font-size:22px;margin:36px 0 6px;color:var(--rose)}h3{font-size:18px;margin:0 0 6px}
p{margin:6px 0}.intro,.why,.legend{color:var(--text2);font-size:16px}.says{background:var(--soft);padding:10px 12px;border-radius:12px}
.item{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:14px 16px;margin:12px 0;break-inside:avoid}
.need{display:inline-block;font-size:12px;font-weight:700;color:#7a4a00;background:#FCE7C0;border-radius:999px;padding:1px 9px;vertical-align:middle}
.answer{display:flex;flex-wrap:wrap;gap:10px 18px;align-items:center;margin-top:10px}
.answer label{display:flex;align-items:center;gap:8px;min-height:44px}.answer input[type=radio]{width:22px;height:22px;accent-color:var(--rose)}
.change{flex:1 1 100%;min-height:44px;border:1px solid var(--line);border-radius:10px;padding:8px 12px;font-size:16px}
.top{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:14px 16px}
table.ex{width:100%;border-collapse:collapse;font-size:15px;background:var(--card);border-radius:12px;overflow:hidden;margin:8px 0}
table.ex th{background:var(--soft);text-align:left}table.ex th,table.ex td{padding:6px 10px;border-bottom:1px solid var(--line);vertical-align:top}
.strip{display:flex;flex-wrap:wrap;gap:2px;margin:8px 0}.cell{width:26px;height:34px;border-radius:5px;font-size:11px;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1}
.cell i{font-style:normal;font-size:11px;height:11px}.cell.small{width:26px;height:26px;font-size:9px;text-align:center}
.key{display:inline-flex;align-items:center;gap:6px;margin-right:14px}.key b{display:inline-block;width:16px;height:16px;border-radius:4px}
.svg{width:100%;height:auto;margin:6px 0}.bars{display:grid;gap:6px;margin:8px 0}.bar{position:relative;background:#f3eeee;border-radius:6px;height:26px}
.bar .fill{height:100%;background:#d9a0b4;border-radius:6px}.bar span{position:absolute;left:8px;top:2px;font-size:14px}
a{color:var(--rose)}.btn{min-height:48px;border:0;border-radius:14px;background:var(--rose);color:#fff;font-size:18px;font-weight:600;padding:0 22px;margin:6px 8px 6px 0;cursor:pointer}
.btn.ghost{background:transparent;color:var(--rose);border:2px solid var(--rose)}
textarea{width:100%;min-height:200px;border:1px solid var(--line);border-radius:12px;padding:10px;font-size:15px;margin-top:10px}
@media print{.noprint{display:none}body{font-size:14px}.item{padding:8px 12px}}
</style></head><body><main>
<h1>Review sheet: how the app thinks</h1>
<div class="top">
  <p>Hi Drashti! This sheet shows every number and sentence the app uses for your cycle, with small pictures and examples worked out by the app itself. Nothing here is final until you say so.</p>
  <p><b>What to do:</b> in each box tick <b>Looks right</b> or <b>Needs a change</b> (write what it should be). Boxes marked <span class="need">Needs your yes</span> are medical numbers or sentences that only you can confirm; each has links to where the number comes from. At the end press <b>Copy my answers</b> and send them to Tirth.</p>
  <p class="intro">You do not need to know anything about computers. Just check it as a nurse. <b>New since last time:</b> the age question, what the app says when a period is late or nothing has been told for a long time, honest ranges, the typical (middle) cycle, and no ovulation guess for teenagers or very irregular cycles.</p>
</div>
${sections
  .map(
    (s) =>
      `<h2>${esc(s.title)}</h2>${s.intro ? `<p class="intro">${esc(s.intro)}</p>` : ''}${s.visual ?? ''}${s.items.map(itemHtml).join('\n')}`,
  )
  .join('\n')}
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
