import type { CycleRules } from '../config/cycleRules';
import { sortPeriods } from './cycles';
import { addDays, diffDays } from './dates';
import { getDayInfo } from './phases';
import { predictWithFallback } from './prediction';
import type { Period, Phase } from './types';

/** A run of consecutive days (1-based, inclusive) that share a phase. */
export interface RingSegment {
  phase: Phase;
  startDay: number;
  endDay: number;
}

export interface CycleRing {
  /** Expected length of the current cycle, in days. */
  length: number;
  segments: RingSegment[];
  /** Drawn from a typical cycle, not from her own pattern yet. */
  tentative: boolean;
}

/**
 * The current cycle laid out phase by phase, for drawing the ring on the Today
 * screen. Uses her own pattern when known, otherwise a typical cycle (tentative). Null only before
 * her first period.
 */
export function currentCycleRing(periods: Period[], rules: CycleRules): CycleRing | null {
  const sorted = sortPeriods(periods);
  const latest = sorted[sorted.length - 1];
  const prediction = predictWithFallback(sorted, rules);
  if (!latest || !prediction) return null;

  const length = diffDays(latest.startDate, prediction.expectedStart);
  if (length < 1) return null;

  const segments: RingSegment[] = [];
  for (let day = 1; day <= length; day++) {
    const phase = getDayInfo(addDays(latest.startDate, day - 1), sorted, rules).phase;
    if (!phase) continue;
    const last = segments[segments.length - 1];
    if (last && last.phase === phase && last.endDay === day - 1) last.endDay = day;
    else segments.push({ phase, startDay: day, endDay: day });
  }
  return { length, segments, tentative: prediction.tentative };
}
