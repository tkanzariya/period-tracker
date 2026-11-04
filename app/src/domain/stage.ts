import type { CycleRules } from '../config/cycleRules';
import { sortPeriods } from './cycles';
import { diffDays, type DateStr } from './dates';
import type { Period } from './types';

/**
 * Where she is right now, in terms of what she can tell the app next. This decides what the main
 * button says, so it never offers "My period started" while one is already going on.
 *
 *  - none:               she has not told the app about any period yet
 *  - in_period:          a period was started and has no end yet (recent): next action is "ended"
 *  - unfinished_period:  a period was started long ago and never ended: ask about its end
 *  - between:            the last period has ended: next action is "started"
 */
export type StageKind = 'none' | 'in_period' | 'unfinished_period' | 'between';

export interface Stage {
  kind: StageKind;
  /** The latest period (null when kind is 'none'). */
  period: Period | null;
  /** Day of the open period (1 = first day); null unless a period is open. */
  periodDay: number | null;
}

export function getStage(periods: Period[], today: DateStr, rules: CycleRules): Stage {
  const sorted = sortPeriods(periods);
  const latest = sorted[sorted.length - 1];
  if (!latest) return { kind: 'none', period: null, periodDay: null };
  if (latest.endDate !== null) return { kind: 'between', period: latest, periodDay: null };

  const day = diffDays(latest.startDate, today) + 1;
  const kind: StageKind = day > rules.checks.unfinishedPeriodAfterDays ? 'unfinished_period' : 'in_period';
  return { kind, period: latest, periodDay: day };
}

/** The action the main button offers. */
export function mainAction(stage: Stage): 'start' | 'end' {
  return stage.kind === 'in_period' || stage.kind === 'unfinished_period' ? 'end' : 'start';
}
