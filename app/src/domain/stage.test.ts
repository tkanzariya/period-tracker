import { describe, expect, it } from 'vitest';
import { DEFAULT_CYCLE_RULES as rules } from '../config/cycleRules';
import { getStage, mainAction } from './stage';
import type { Period } from './types';

const p = (startDate: string, endDate: string | null = null): Period => ({ id: startDate, startDate, endDate, note: null });

describe('what the main button offers', () => {
  it('before any period: "started"', () => {
    const s = getStage([], '2026-11-05', rules);
    expect(s.kind).toBe('none');
    expect(mainAction(s)).toBe('start');
  });
  it('the day a period starts: it is going on, so offer "ended"', () => {
    const s = getStage([p('2026-11-05')], '2026-11-05', rules);
    expect(s).toMatchObject({ kind: 'in_period', periodDay: 1 });
    expect(mainAction(s)).toBe('end');
  });
  it('a period going on for 10 days is still "going on"', () => {
    expect(getStage([p('2026-10-27')], '2026-11-05', rules)).toMatchObject({ kind: 'in_period', periodDay: 10 });
  });
  it('a period left open for 11 days is "unfinished": still offer "ended"', () => {
    const s = getStage([p('2026-10-26')], '2026-11-05', rules);
    expect(s).toMatchObject({ kind: 'unfinished_period', periodDay: 11 });
    expect(mainAction(s)).toBe('end');
  });
  it('after the period ended: offer "started"', () => {
    const s = getStage([p('2026-10-06', '2026-10-10')], '2026-11-05', rules);
    expect(s.kind).toBe('between');
    expect(mainAction(s)).toBe('start');
  });
  it('looks at the latest period only', () => {
    expect(getStage([p('2026-09-08'), p('2026-10-06', '2026-10-10')], '2026-11-05', rules).kind).toBe('between');
  });
});
