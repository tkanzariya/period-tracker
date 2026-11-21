import { describe, expect, it } from 'vitest';
import { AGE_GROUPS, DEFAULT_CYCLE_RULES, rulesForAge } from '../config/cycleRules';
import { bleedingLength, canGuessOvulation, cleanBleedingMarks, completedCycleLengths, cycleRows, cycleStats } from './cycles';
import { addDays } from './dates';
import { getHeadline } from './headline';
import { getDayInfo } from './phases';
import { predictNextPeriod } from './prediction';
import type { Period } from './types';
import { checkHistory, checkPeriodStart } from './validation';

const p = (startDate: string): Period => ({ id: startDate, startDate, endDate: null, note: null });
const adult = rulesForAge('adult');
const young = rulesForAge('under20');
const over40 = rulesForAge('over40');

// Regular 28-day cycles.
const regular = [p('2026-07-01'), p('2026-07-29'), p('2026-08-26'), p('2026-09-23')];
// Cycles of 35 and 42 days (a teenager).
const teen = [p('2026-08-20'), p('2026-09-24'), p('2026-11-05')];
// Cycles of 24, 41, 29, 48 days (very irregular).
const irregular = [p('2026-06-20'), p('2026-07-14'), p('2026-08-24'), p('2026-09-22'), p('2026-11-09')];

// These tests come from the 2026-11-21 audit (docs/review/audit-usability-medical-2026-11-21.md).
// Every number is NEEDS DRASHTI REVIEW.
describe('age groups (M3)', () => {
  it('adult is the default and keeps 21 to 35 days', () => {
    expect(rulesForAge(null)).toEqual(adult);
    expect(adult.cycle.normalMaxDays).toBe(35);
    expect(DEFAULT_CYCLE_RULES.ageGroup).toBe('adult');
  });
  it('under 20 allows cycles up to 45 days and cycles that vary more', () => {
    expect(young.cycle.normalMaxDays).toBe(45);
    expect(young.cycle.maxVariationDays).toBeGreaterThan(adult.cycle.maxVariationDays);
  });
  it('over 40 keeps the adult range but waits longer before it stops guessing', () => {
    expect(over40.cycle.normalMaxDays).toBe(35);
    expect(over40.silence.noPhaseAfterDays).toBeGreaterThan(adult.silence.noPhaseAfterDays);
  });
  it('knows all three groups', () => {
    expect(AGE_GROUPS).toEqual(['under20', 'adult', 'over40']);
  });
});

describe('a late period (M1)', () => {
  const one = [p('2026-10-06')]; // typical guess 3 Nov, window 31 Oct to 6 Nov
  it('up to a week after my guess is "a few days late"', () => {
    expect(getHeadline(one, '2026-11-10', adult)).toEqual({ kind: 'late', days: 4, few: true });
    expect(getHeadline(one, '2026-11-13', adult)).toEqual({ kind: 'late', days: 7, few: true });
  });
  it('more than a week late says more (a pregnancy test is mentioned in the words)', () => {
    expect(getHeadline(one, '2026-11-14', adult)).toEqual({ kind: 'late', days: 8, few: false });
  });
});

describe('a long silence (M2)', () => {
  const one = [p('2026-05-01')];
  it('after 60 days with no period told, adults get "did it come?" and no day or phase', () => {
    const today = addDays('2026-05-01', 70);
    expect(getHeadline(one, today, adult)).toEqual({ kind: 'silent', days: 70 });
    expect(getDayInfo(today, one, adult).phase).toBeNull();
    expect(getDayInfo(today, one, adult).isFertileWindow).toBe(false);
  });
  it('the cut-off depends on age: still guessing on day 70 for under 20 and over 40', () => {
    const today = addDays('2026-05-01', 70);
    expect(getHeadline(one, today, young).kind).toBe('late');
    expect(getHeadline(one, today, over40).kind).toBe('late');
    expect(getHeadline(one, addDays('2026-05-01', 95), young)).toEqual({ kind: 'silent', days: 95 });
    expect(getHeadline(one, addDays('2026-05-01', 95), over40)).toEqual({ kind: 'silent', days: 95 });
  });
  it('204 days after one period is silent, never a made-up luteal phase', () => {
    const today = addDays('2026-05-01', 204);
    expect(getHeadline(one, today, adult).kind).toBe('silent');
    expect(getDayInfo(today, one, adult).phase).toBeNull();
  });
  it('the first days of a cycle are still period days', () => {
    expect(getHeadline(one, '2026-05-03', adult)).toEqual({ kind: 'period_day', day: 3 });
  });
});

describe('honest ovulation guesses (M4)', () => {
  it('regular adult cycles may be guessed', () => {
    expect(canGuessOvulation(cycleStats(regular, adult), adult)).toBe(true);
    const day = getDayInfo(addDays('2026-09-23', 13), regular, adult);
    expect(day.isOvulationDay || day.phase === 'ovulation').toBe(true);
  });
  it('cycles that vary by more than 7 days get no ovulation, fertile days or phases after bleeding', () => {
    expect(canGuessOvulation(cycleStats(irregular, adult), adult)).toBe(false);
    for (let d = 6; d < 40; d++) {
      const info = getDayInfo(addDays('2026-11-09', d - 1), irregular, adult);
      expect(info.phase).toBeNull();
      expect(info.isFertileWindow).toBe(false);
      expect(info.isOvulationDay).toBe(false);
    }
    // Bleeding days are still drawn.
    expect(getDayInfo('2026-11-10', irregular, adult).phase).toBe('menstrual');
  });
  it('under 20 gets no ovulation guess, even with one period', () => {
    expect(canGuessOvulation(null, young)).toBe(false);
    expect(getDayInfo('2026-11-15', [p('2026-11-05')], young).phase).toBeNull();
    expect(getDayInfo('2026-11-05', [p('2026-11-05')], young).phase).toBe('menstrual');
  });
  it('the next period is still guessed for everyone', () => {
    expect(predictNextPeriod(teen, young)).not.toBeNull();
  });
});

describe('an honest range (M5)', () => {
  it('is never narrower than 3 days each side with fewer than 6 cycles', () => {
    const prediction = predictNextPeriod(regular, adult)!;
    expect(prediction.earliestStart).toBe(addDays(prediction.expectedStart, -3));
    expect(prediction.latestStart).toBe(addDays(prediction.expectedStart, 3));
  });
  it('may shrink to 2 days each side with 6 or more cycles', () => {
    const many = Array.from({ length: 8 }, (_, i) => p(addDays('2026-01-01', i * 28)));
    const prediction = predictNextPeriod(many, adult)!;
    expect(prediction.earliestStart).toBe(addDays(prediction.expectedStart, -2));
  });
});

describe('the typical cycle is the middle value (M6)', () => {
  const withGap = [p('2026-06-01'), p('2026-06-19'), p('2026-07-08'), p('2026-07-27'), p('2026-08-14'), p('2026-11-21')];
  it('one 99-day gap does not become the typical cycle', () => {
    expect(completedCycleLengths(withGap)).toEqual([18, 19, 19, 18, 99]);
    const stats = cycleStats(withGap, adult)!;
    expect(stats.medianLength).toBe(19);
    expect(stats.longest).toBe(99);
  });
  it('the next-period guess uses the middle value too', () => {
    const prediction = predictNextPeriod(withGap, adult)!;
    expect(prediction.expectedStart).toBe(addDays('2026-11-21', 19));
  });
  it('the long cycle is marked as a long gap in My cycles', () => {
    const rows = cycleRows(withGap, adult);
    expect(rows.find((r) => r.cycleDays === 99)?.tag).toBe('gap');
    expect(rows.find((r) => r.cycleDays === 18)?.tag).toBe('short');
  });
});

describe('a start far in the past (R1)', () => {
  const today = '2026-11-21';
  it('is refused when more than a year ago', () => {
    expect(checkPeriodStart('2025-11-20', [], today, adult)).toMatchObject({ severity: 'block', code: 'start_too_old' });
    expect(checkPeriodStart('2020-01-01', [], today, adult)).toMatchObject({ severity: 'block', code: 'start_too_old' });
  });
  it('a year ago exactly is allowed', () => {
    expect(checkPeriodStart('2025-11-21', [], today, adult)).toBeNull();
  });
  it('the earlier-cycles list uses the same limit', () => {
    const found = checkHistory([{ start: '2024-03-01' }], [], today, adult);
    expect(found[0]?.issue.code).toBe('start_too_old');
  });
});

describe('no made-up phase once a period is late (M2)', () => {
  it('shows lateness instead of Luteal after the days I expected a period', () => {
    const one = [p('2026-10-06')]; // window 31 Oct to 6 Nov
    expect(getDayInfo('2026-11-03', one, adult).phase).toBe('luteal');
    expect(getDayInfo('2026-11-12', one, adult).phase).toBeNull();
    expect(getDayInfo('2026-11-12', one, adult).daysLate).toBeGreaterThan(0);
  });
});

describe('marking the bleeding days (R4)', () => {
  const rules = adult;
  const marked = (start: string, end: string | null): Period => ({ id: start, startDate: start, endDate: end, note: null });
  it('uses 5 days unless she marked how long the bleeding lasted', () => {
    expect(bleedingLength(p('2026-11-01'), rules)).toBe(5);
    expect(bleedingLength(marked('2026-11-01', '2026-11-07'), rules)).toBe(7);
  });
  it('colours the marked days as Bleeding, and only those', () => {
    const periods = [marked('2026-11-01', '2026-11-07')];
    expect(getDayInfo('2026-11-07', periods, rules).phase).toBe('menstrual');
    expect(getDayInfo('2026-11-08', periods, rules).phase).not.toBe('menstrual');
    expect(getHeadline(periods, '2026-11-07', rules)).toEqual({ kind: 'period_day', day: 7 });
  });
  it('a mark never ends the cycle: the next start still decides the cycle length', () => {
    const periods = [marked('2026-10-10', '2026-10-15'), p('2026-11-10')];
    expect(completedCycleLengths(periods)).toEqual([31]);
  });
  it('ignores a mark that makes no sense (older builds could save an end equal to the next start)', () => {
    const cleaned = cleanBleedingMarks([marked('2026-10-10', '2026-11-10'), p('2026-11-10')], rules);
    expect(cleaned[0].endDate).toBeNull();
    expect(cleanBleedingMarks([marked('2026-10-10', '2026-10-12')], rules)[0].endDate).toBe('2026-10-12');
    expect(cleanBleedingMarks([marked('2026-10-10', '2026-10-01')], rules)[0].endDate).toBeNull();
    expect(cleanBleedingMarks([marked('2026-10-10', '2026-10-25')], rules)[0].endDate).toBeNull();
  });
});
