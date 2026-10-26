import { describe, expect, it } from 'vitest';
import { DEFAULT_CYCLE_RULES as rules } from '../config/cycleRules';
import { completedCycleLengths, cycleStats, isRegular, periodLength } from './cycles';
import { addDays, diffDays, isValidDate, todayLocal } from './dates';
import { getIrregularityFlags } from './flags';
import { getDayInfo } from './phases';
import { predictNextPeriod } from './prediction';
import type { Period } from './types';

const p = (startDate: string, endDate: string | null = null): Period => ({ id: startDate, startDate, endDate, note: null });

// A regular 28-day pattern: Jul 1, Jul 29, Aug 26, Sep 23 (5-day periods).
const regular = [p('2026-07-01', '2026-07-05'), p('2026-07-29', '2026-08-02'), p('2026-08-26', '2026-08-30'), p('2026-09-23', '2026-09-27')];

describe('dates', () => {
  it('adds and diffs days across month and year boundaries', () => {
    expect(addDays('2026-10-30', 3)).toBe('2026-11-02');
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31');
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
    expect(diffDays('2026-10-01', '2026-10-27')).toBe(26);
    expect(diffDays('2026-10-27', '2026-10-01')).toBe(-26);
  });
  it('is not affected by daylight saving changes', () => {
    expect(diffDays('2026-03-01', '2026-04-01')).toBe(31);
    expect(diffDays('2026-10-01', '2026-11-01')).toBe(31);
  });
  it('validates date strings', () => {
    expect(isValidDate('2026-02-30')).toBe(false);
    expect(isValidDate('2026-2-3')).toBe(false);
    expect(isValidDate('2026-10-27')).toBe(true);
  });
  it('formats local today', () => {
    expect(todayLocal(new Date(2026, 9, 27, 23, 59))).toBe('2026-10-27');
  });
});

describe('cycles', () => {
  it('derives cycle and period lengths', () => {
    expect(completedCycleLengths(regular)).toEqual([28, 28, 28]);
    expect(periodLength(regular[0])).toBe(5);
    expect(periodLength(p('2026-10-01'))).toBeNull();
  });
  it('is independent of input order', () => {
    expect(completedCycleLengths([...regular].reverse())).toEqual([28, 28, 28]);
  });
  it('computes stats and regularity', () => {
    const stats = cycleStats(regular, rules)!;
    expect(stats.averageLength).toBe(28);
    expect(stats.variationDays).toBe(0);
    expect(isRegular(stats, rules)).toBe(true);
  });
  it('treats widely varying cycles as irregular', () => {
    const irregular = [p('2026-01-01'), p('2026-01-25'), p('2026-03-05'), p('2026-03-30')]; // 24, 39, 25
    const stats = cycleStats(irregular, rules)!;
    expect(stats.variationDays).toBe(15);
    expect(isRegular(stats, rules)).toBe(false);
  });
  it('has no stats without a completed cycle', () => {
    expect(cycleStats([p('2026-10-01')], rules)).toBeNull();
  });
});

describe('prediction', () => {
  it('does not predict before enough cycles are logged', () => {
    expect(predictNextPeriod([], rules)).toBeNull();
    expect(predictNextPeriod([p('2026-08-01')], rules)).toBeNull();
    expect(predictNextPeriod([p('2026-08-01'), p('2026-08-29')], rules)).toBeNull(); // 1 completed cycle
  });
  it('predicts a range around the average for regular cycles', () => {
    const prediction = predictNextPeriod(regular, rules)!;
    expect(prediction.expectedStart).toBe('2026-10-21');
    expect(prediction.earliestStart).toBe('2026-10-20');
    expect(prediction.latestStart).toBe('2026-10-22');
    expect(prediction.basedOnCycles).toBe(3);
  });
  it('widens the range when cycles vary', () => {
    const varied = [p('2026-01-01'), p('2026-01-25'), p('2026-03-05'), p('2026-03-30')];
    const prediction = predictNextPeriod(varied, rules)!;
    expect(diffDays(prediction.earliestStart, prediction.latestStart)).toBeGreaterThan(2);
  });
  it('only averages the most recent cycles', () => {
    const custom = { ...rules, prediction: { ...rules.prediction, cyclesToAverage: 2 } };
    const periods = [p('2026-01-01'), p('2026-02-15'), p('2026-03-15'), p('2026-04-12')]; // 45, 28, 28
    expect(predictNextPeriod(periods, custom)!.averageLength).toBe(28);
  });
});

describe('phases', () => {
  it('returns nothing before the first logged period', () => {
    const info = getDayInfo('2026-06-01', regular, rules);
    expect(info.cycleDay).toBeNull();
    expect(info.phase).toBeNull();
  });
  it('marks logged period days as menstrual facts', () => {
    const info = getDayInfo('2026-09-25', regular, rules);
    expect(info.phase).toBe('menstrual');
    expect(info.cycleDay).toBe(3);
    expect(info.isEstimate).toBe(false);
  });
  it('places ovulation 14 days before the predicted next period', () => {
    // next expected Oct 21 -> ovulation Oct 7
    const ov = getDayInfo('2026-10-07', regular, rules);
    expect(ov.isOvulationDay).toBe(true);
    expect(ov.phase).toBe('ovulation');
    expect(getDayInfo('2026-10-06', regular, rules).phase).toBe('ovulation');
    expect(getDayInfo('2026-10-08', regular, rules).phase).toBe('ovulation');
  });
  it('walks through follicular and luteal phases', () => {
    expect(getDayInfo('2026-09-30', regular, rules).phase).toBe('follicular');
    expect(getDayInfo('2026-10-09', regular, rules).phase).toBe('luteal');
    expect(getDayInfo('2026-10-20', regular, rules).phase).toBe('luteal');
  });
  it('marks the fertile window as 5 days before to 1 day after ovulation', () => {
    expect(getDayInfo('2026-10-01', regular, rules).isFertileWindow).toBe(false);
    expect(getDayInfo('2026-10-02', regular, rules).isFertileWindow).toBe(true);
    expect(getDayInfo('2026-10-08', regular, rules).isFertileWindow).toBe(true);
    expect(getDayInfo('2026-10-09', regular, rules).isFertileWindow).toBe(false);
  });
  it('shows lower-fertility days only outside the fertile window plus margin, and only for regular cycles', () => {
    expect(getDayInfo('2026-10-12', regular, rules).isLowerFertility).toBe(true);
    expect(getDayInfo('2026-10-05', regular, rules).isLowerFertility).toBe(false);
    const varied = [p('2026-01-01'), p('2026-01-25'), p('2026-03-05'), p('2026-03-30')];
    const lastDay = addDays('2026-03-30', 12);
    expect(getDayInfo(lastDay, varied, rules).isLowerFertility).toBe(false);
  });
  it('flags the predicted period range and days late', () => {
    expect(getDayInfo('2026-10-21', regular, rules).isPredictedPeriod).toBe(true);
    expect(getDayInfo('2026-10-18', regular, rules).isPredictedPeriod).toBe(false);
    expect(getDayInfo('2026-10-25', regular, rules).daysLate).toBe(3);
  });
  it('uses actual next start for past cycles', () => {
    // Cycle Jul 29 -> Aug 26: ovulation Aug 12
    expect(getDayInfo('2026-08-12', regular, rules).isOvulationDay).toBe(true);
    expect(getDayInfo('2026-08-12', regular, rules).isPredictedPeriod).toBe(false);
  });
  it('still shows cycle day and the period phase when there is too little data to predict', () => {
    const one = [p('2026-10-24')];
    const day = getDayInfo('2026-10-27', one, rules);
    expect(day.cycleDay).toBe(4);
    expect(day.phase).toBe('menstrual');
    const after = getDayInfo('2026-11-05', one, rules);
    expect(after.cycleDay).toBe(13);
    expect(after.phase).toBeNull();
  });
});

describe('irregularity flags', () => {
  it('has none for a regular pattern', () => {
    expect(getIrregularityFlags(regular, '2026-10-10', rules)).toEqual([]);
  });
  it('flags a long last cycle', () => {
    const periods = [...regular, p('2026-11-01')]; // 39 days
    const flags = getIrregularityFlags(periods, '2026-11-02', rules);
    expect(flags).toContainEqual({ code: 'cycle_long', value: 39 });
  });
  it('flags a short last cycle', () => {
    const periods = [...regular, p('2026-10-10')]; // 17 days
    expect(getIrregularityFlags(periods, '2026-10-11', rules)).toContainEqual({ code: 'cycle_short', value: 17 });
  });
  it('flags large variation', () => {
    const varied = [p('2026-01-01'), p('2026-01-25'), p('2026-03-05'), p('2026-03-30')];
    expect(getIrregularityFlags(varied, '2026-04-02', rules).map((f) => f.code)).toContain('cycle_variation');
  });
  it('flags a long period', () => {
    const periods = [...regular.slice(0, 3), p('2026-09-23', '2026-10-01')]; // 9 days
    expect(getIrregularityFlags(periods, '2026-10-05', rules)).toContainEqual({ code: 'period_long', value: 9 });
  });
  it('flags a late period only after the predicted range has passed', () => {
    expect(getIrregularityFlags(regular, '2026-10-22', rules).map((f) => f.code)).not.toContain('period_late');
    expect(getIrregularityFlags(regular, '2026-10-25', rules)).toContainEqual({ code: 'period_late', value: 3 });
  });
  it('does not flag lateness once the new period is logged', () => {
    const periods = [...regular, p('2026-10-26')];
    expect(getIrregularityFlags(periods, '2026-10-27', rules).map((f) => f.code)).not.toContain('period_late');
  });
});
