import { describe, expect, it } from 'vitest';
import { getStage } from './stage';
import type { Period } from './types';

const p = (startDate: string): Period => ({ id: startDate, startDate, endDate: null, note: null });

describe('where she is with the app (there is no "period end")', () => {
  it('before any period: nothing yet', () => {
    expect(getStage([], '2026-11-05')).toEqual({ kind: 'none', period: null, cycleDay: null });
  });
  it('the day a period starts is day 1 of the current cycle', () => {
    expect(getStage([p('2026-11-05')], '2026-11-05')).toMatchObject({ kind: 'active', cycleDay: 1 });
  });
  it('the current cycle is the one that started last, however long ago', () => {
    expect(getStage([p('2026-10-10'), p('2026-11-10')], '2026-11-18')).toMatchObject({ kind: 'active', cycleDay: 9 });
  });
  it('a start that was told in any order still gives the latest cycle', () => {
    expect(getStage([p('2026-11-10'), p('2026-10-10')], '2026-11-18').period?.startDate).toBe('2026-11-10');
  });
});
