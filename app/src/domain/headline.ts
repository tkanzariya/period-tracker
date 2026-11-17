import type { CycleRules } from '../config/cycleRules';
import { diffDays, type DateStr } from './dates';
import { predictWithFallback } from './prediction';
import { getStage } from './stage';
import type { Period } from './types';

/**
 * The one line Today leads with: the answer to "where am I, and when is my next period?".
 * Pure data; the words live in the wording files.
 */
export type Headline =
  | { kind: 'none' }
  | { kind: 'period_day'; day: number }
  | { kind: 'unfinished'; day: number }
  | { kind: 'coming'; fromDays: number; toDays: number }
  | { kind: 'any_day_now' }
  | { kind: 'late'; days: number };

export function getHeadline(periods: Period[], today: DateStr, rules: CycleRules): Headline {
  const stage = getStage(periods, today, rules);
  if (stage.kind === 'none') return { kind: 'none' };
  if (stage.kind === 'in_period') return { kind: 'period_day', day: stage.periodDay ?? 1 };
  if (stage.kind === 'unfinished_period') return { kind: 'unfinished', day: stage.periodDay ?? 1 };

  const prediction = predictWithFallback(periods, rules);
  if (!prediction) return { kind: 'none' };
  const fromDays = diffDays(today, prediction.earliestStart);
  const toDays = diffDays(today, prediction.latestStart);
  if (fromDays > 0) return { kind: 'coming', fromDays, toDays };
  if (toDays >= 0) return { kind: 'any_day_now' };
  return { kind: 'late', days: -toDays };
}
