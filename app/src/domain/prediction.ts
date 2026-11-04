import type { CycleRules } from '../config/cycleRules';
import { cycleStats, sortPeriods } from './cycles';
import { addDays, type DateStr } from './dates';
import type { Period } from './types';

export interface Prediction {
  expectedStart: DateStr;
  /** Range the next period is likely to start within. */
  earliestStart: DateStr;
  latestStart: DateStr;
  basedOnCycles: number;
  averageLength: number;
  /**
   * True when this is only a first guess from a typical cycle (too few finished cycles of her own).
   * Shown with a "typical cycle" label and replaced as soon as her own pattern is known.
   */
  tentative: boolean;
}

/**
 * Next-period estimate from HER OWN cycles: last start + average of recent completed cycles, shown
 * as a range that widens with how much her cycles vary. Returns null until enough cycles are logged.
 */
export function predictNextPeriod(periods: Period[], rules: CycleRules): Prediction | null {
  const stats = cycleStats(periods, rules);
  if (!stats || stats.count < rules.prediction.minCyclesForPrediction) return null;

  const sorted = sortPeriods(periods);
  const lastStart = sorted[sorted.length - 1].startDate;
  const expectedStart = addDays(lastStart, Math.round(stats.averageLength));
  const halfWidth = Math.max(rules.prediction.minRangeHalfWidthDays, Math.ceil(stats.stdDevDays));

  return {
    expectedStart,
    earliestStart: addDays(expectedStart, -halfWidth),
    latestStart: addDays(expectedStart, halfWidth),
    basedOnCycles: stats.count,
    averageLength: stats.averageLength,
    tentative: false,
  };
}

/**
 * Her own prediction when there is one; otherwise a TENTATIVE one from a typical cycle, so the app
 * is useful from the very first period she tells it about. Null only when she has told it nothing.
 */
export function predictWithFallback(periods: Period[], rules: CycleRules): Prediction | null {
  const own = predictNextPeriod(periods, rules);
  if (own) return own;
  const sorted = sortPeriods(periods);
  if (sorted.length === 0) return null;

  const typical = rules.prediction.typicalCycleLengthDays;
  const half = rules.prediction.tentativeRangeHalfWidthDays;
  const expectedStart = addDays(sorted[sorted.length - 1].startDate, typical);
  return {
    expectedStart,
    earliestStart: addDays(expectedStart, -half),
    latestStart: addDays(expectedStart, half),
    basedOnCycles: 0,
    averageLength: typical,
    tentative: true,
  };
}

/** Estimated ovulation day for the current cycle (tentative until her own pattern is known). */
export function estimateOvulationDay(periods: Period[], rules: CycleRules): DateStr | null {
  const prediction = predictWithFallback(periods, rules);
  return prediction ? addDays(prediction.expectedStart, -rules.ovulation.lutealPhaseDays) : null;
}
