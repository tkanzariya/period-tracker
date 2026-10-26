import type { CycleRules } from '../config/cycleRules';
import { completedCycleLengths, cycleStats, periodLength, sortPeriods } from './cycles';
import { diffDays, type DateStr } from './dates';
import { predictNextPeriod } from './prediction';
import type { Period } from './types';

export type FlagCode = 'cycle_short' | 'cycle_long' | 'cycle_variation' | 'period_long' | 'period_late';

/** A calm observation worth mentioning to a doctor. Never a diagnosis. */
export interface IrregularityFlag {
  code: FlagCode;
  /** The number the flag is about (cycle days, period days, variation days, days late). */
  value: number;
}

export function getIrregularityFlags(periods: Period[], today: DateStr, rules: CycleRules): IrregularityFlag[] {
  const flags: IrregularityFlag[] = [];
  const sorted = sortPeriods(periods);

  const lengths = completedCycleLengths(sorted);
  const lastCycle = lengths[lengths.length - 1];
  if (lastCycle !== undefined) {
    if (lastCycle < rules.cycle.normalMinDays) flags.push({ code: 'cycle_short', value: lastCycle });
    else if (lastCycle > rules.cycle.normalMaxDays) flags.push({ code: 'cycle_long', value: lastCycle });
  }

  const stats = cycleStats(sorted, rules);
  if (stats && stats.count >= rules.prediction.minCyclesForPrediction && stats.variationDays > rules.cycle.maxVariationDays) {
    flags.push({ code: 'cycle_variation', value: stats.variationDays });
  }

  // Most recent period that has an end date logged.
  const lastEnded = [...sorted].reverse().find((p) => p.endDate !== null);
  if (lastEnded) {
    const length = periodLength(lastEnded);
    if (length !== null && length > rules.period.normalMaxDays) flags.push({ code: 'period_long', value: length });
  }

  const prediction = predictNextPeriod(sorted, rules);
  if (prediction) {
    const latest = sorted[sorted.length - 1];
    const late = diffDays(prediction.latestStart, today);
    if (late > 0 && latest.startDate < prediction.earliestStart) flags.push({ code: 'period_late', value: late });
  }

  return flags;
}
