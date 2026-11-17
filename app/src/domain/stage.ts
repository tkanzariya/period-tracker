import type { CycleRules } from '../config/cycleRules';
import { diffDays, type DateStr } from './dates';
import { sortPeriods } from './cycles';
import type { Period } from './types';

/**
 * Where she is with the app. There is no "period end": a cycle starts on the day she tells the app a
 * period started, and it ends the day before the next one starts.
 *  - none:   she has not told the app about any period yet
 *  - active: at least one period is known; the latest one is the current cycle
 */
export type StageKind = 'none' | 'active';

export interface Stage {
  kind: StageKind;
  /** The latest period start (the current cycle); null when kind is 'none'. */
  period: Period | null;
  /** Day of the current cycle (1 = the day it started); null when kind is 'none'. */
  cycleDay: number | null;
}

export function getStage(periods: Period[], today: DateStr, _rules?: CycleRules): Stage {
  const latest = sortPeriods(periods).slice(-1)[0];
  if (!latest) return { kind: 'none', period: null, cycleDay: null };
  return { kind: 'active', period: latest, cycleDay: diffDays(latest.startDate, today) + 1 };
}
