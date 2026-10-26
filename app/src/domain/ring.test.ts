import { describe, expect, it } from 'vitest';
import { DEFAULT_CYCLE_RULES as rules } from '../config/cycleRules';
import { currentCycleRing } from './ring';
import type { Period } from './types';

const p = (startDate: string, endDate: string | null = null): Period => ({ id: startDate, startDate, endDate, note: null });
const regular = [p('2026-07-01', '2026-07-05'), p('2026-07-29', '2026-08-02'), p('2026-08-26', '2026-08-30'), p('2026-09-23', '2026-09-27')];

describe('currentCycleRing', () => {
  it('is null until there is enough data to predict', () => {
    expect(currentCycleRing([p('2026-10-01')], rules)).toBeNull();
  });
  it('lays out a regular 28-day cycle phase by phase', () => {
    const ring = currentCycleRing(regular, rules)!;
    expect(ring.length).toBe(28);
    expect(ring.segments).toEqual([
      { phase: 'menstrual', startDay: 1, endDay: 5 },
      { phase: 'follicular', startDay: 6, endDay: 13 },
      { phase: 'ovulation', startDay: 14, endDay: 16 },
      { phase: 'luteal', startDay: 17, endDay: 28 },
    ]);
  });
  it('covers every day of the cycle exactly once', () => {
    const ring = currentCycleRing(regular, rules)!;
    const days = ring.segments.reduce((sum, s) => sum + (s.endDay - s.startDay + 1), 0);
    expect(days).toBe(ring.length);
  });
});
