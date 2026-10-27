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
  /** How long this period lasted; null while no end date is told. */
  periodDays: number | null;
  /** Days from this period's start to the next one's; null for the latest (still going). */
  cycleDays: number | null;
  /** Outside the usual range, for a calm tag in the list. */
  tag: 'short' | 'long' | null;
}

/** One row per period, newest first, for the "My cycles" list. */
export function cycleRows(periods: Period[], rules: CycleRules): CycleRow[] {
  const sorted = sortPeriods(periods);
  const rows = sorted.map((period, i): CycleRow => {
    const next = sorted[i + 1];
    const cycleDays = next ? diffDays(period.startDate, next.startDate) : null;
    const tag =
      cycleDays === null ? null : cycleDays < rules.cycle.normalMinDays ? 'short' : cycleDays > rules.cycle.normalMaxDays ? 'long' : null;
    return { period, periodDays: periodLength(period), cycleDays, tag };
  });
  return rows.reverse();
}

/** Average length of periods that have an end date; null if none. */
export function averagePeriodLength(periods: Period[]): number | null {
  const lengths = periods.map(periodLength).filter((n): n is number => n !== null);
  return lengths.length ? lengths.reduce((a, b) => a + b, 0) / lengths.length : null;
}

export interface CycleStats {
  /** How many completed cycles fed these numbers. */
  count: number;
  averageLength: number;
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
  return {
    count: recent.length,
    averageLength: average,
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
