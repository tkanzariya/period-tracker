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
}

/** Estimated ovulation day for the current cycle, or null when there is no prediction yet. */
export function estimateOvulationDay(periods: Period[], rules: CycleRules): DateStr | null {
  const prediction = predictNextPeriod(periods, rules);
  return prediction ? addDays(prediction.expectedStart, -rules.ovulation.lutealPhaseDays) : null;
}

/**
 * Next-period estimate: last start + average of recent completed cycles, shown
 * as a range that widens with how much her cycles vary. Returns null until
 * enough cycles are logged, rather than guessing.
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
  };
}
