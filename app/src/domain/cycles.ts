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
