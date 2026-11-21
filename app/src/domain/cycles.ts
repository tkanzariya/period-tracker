import type { CycleRules } from '../config/cycleRules';
import { diffDays } from './dates';
import type { Period } from './types';

export function sortPeriods(periods: Period[]): Period[] {
  return [...periods].sort((a, b) => (a.startDate < b.startDate ? -1 : a.startDate > b.startDate ? 1 : 0));
}

/** Lengths (days) of completed cycles, oldest first: start of one period to start of the next. */
export function completedCycleLengths(periods: Period[]): number[] {
  const sorted = sortPeriods(periods);
  const lengths: number[] = [];
  for (let i = 1; i < sorted.length; i++) {
    lengths.push(diffDays(sorted[i - 1].startDate, sorted[i].startDate));
  }
  return lengths;
}

/** Days the period lasted (inclusive), or null when no end date is logged. */
export function periodLength(period: Period): number | null {
  return period.endDate ? diffDays(period.startDate, period.endDate) + 1 : null;
}

export interface CycleRow {
  period: Period;
  /** Days from this period's start to the next one's; null for the latest (still going). */
  cycleDays: number | null;
  /** Outside the usual range, for a calm tag in the list. */
  tag: 'short' | 'long' | 'gap' | null;
}

/** One row per period, newest first, for the "My cycles" list. */
export function cycleRows(periods: Period[], rules: CycleRules): CycleRow[] {
  const sorted = sortPeriods(periods);
  const rows = sorted.map((period, i): CycleRow => {
    const next = sorted[i + 1];
    const cycleDays = next ? diffDays(period.startDate, next.startDate) : null;
    const tag =
      cycleDays === null ? null
      : cycleDays > rules.checks.longGapDays ? 'gap'
      : cycleDays < rules.cycle.normalMinDays ? 'short'
      : cycleDays > rules.cycle.normalMaxDays ? 'long'
      : null;
    return { period, cycleDays, tag };
  });
  return rows.reverse();
}

export interface CycleStats {
  /** How many completed cycles fed these numbers. */
  count: number;
  averageLength: number;
  /** The middle value: one very long or short cycle does not move it. Shown as her "typical" cycle. */
  medianLength: number;
  shortest: number;
  longest: number;
  /** longest - shortest */
  variationDays: number;
  stdDevDays: number;
}

/** Stats over the most recent completed cycles; null when there are none. */
export function cycleStats(periods: Period[], rules: CycleRules): CycleStats | null {
  const recent = completedCycleLengths(periods).slice(-rules.prediction.cyclesToAverage);
  if (recent.length === 0) return null;
  const average = recent.reduce((sum, n) => sum + n, 0) / recent.length;
  const variance = recent.reduce((sum, n) => sum + (n - average) ** 2, 0) / recent.length;
  const shortest = Math.min(...recent);
  const longest = Math.max(...recent);
  const ordered = [...recent].sort((a, b) => a - b);
  const mid = Math.floor(ordered.length / 2);
  const medianLength = ordered.length % 2 ? ordered[mid] : (ordered[mid - 1] + ordered[mid]) / 2;
  return {
    count: recent.length,
    averageLength: average,
    medianLength,
    shortest,
    longest,
    variationDays: longest - shortest,
    stdDevDays: Math.sqrt(variance),
  };
}

/** True when recent cycles vary by no more than the configured number of days. */
export function isRegular(stats: CycleStats | null, rules: CycleRules): boolean {
  return stats !== null && stats.count >= rules.prediction.minCyclesForPrediction && stats.variationDays <= rules.cycle.maxVariationDays;
}

/**
 * Whether the app may guess ovulation, fertile days and the phases after bleeding. Not for the youngest age
 * group, and not when her cycles vary by more than the allowed days (the guess would look surer than it is).
 */
export function canGuessOvulation(stats: CycleStats | null, rules: CycleRules): boolean {
  if (rules.ageGroup === 'under20' && rules.ovulation.hideForUnder20) return false;
  if (stats && stats.count >= rules.prediction.minCyclesForPrediction && stats.variationDays > rules.cycle.maxVariationDays) return false;
  return true;
}
