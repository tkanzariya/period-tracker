import { describe, expect, it } from 'vitest';
import { DEFAULT_CYCLE_RULES as rules } from '../config/cycleRules';
import { getHeadline } from './headline';
import type { Period } from './types';

const p = (startDate: string, endDate: string | null = null): Period => ({ id: startDate, startDate, endDate, note: null });
// One finished period starting 2026-10-06: typical guess = 2026-11-03, range 31 Oct to 6 Nov.
const done = [p('2026-10-06', '2026-10-10')];

describe('the Today headline', () => {
  it('has nothing to say before the first period', () => {
    expect(getHeadline([], '2026-11-05', rules)).toEqual({ kind: 'none' });
  });
  it('counts the days of a period that is going on', () => {
    expect(getHeadline([p('2026-11-03')], '2026-11-04', rules)).toEqual({ kind: 'period_day', day: 2 });
  });
  it('asks about a period that was never ended', () => {
    expect(getHeadline([p('2026-10-01')], '2026-11-05', rules)).toMatchObject({ kind: 'unfinished' });
  });
  it('says how many days until the window opens and closes', () => {
    expect(getHeadline(done, '2026-10-20', rules)).toEqual({ kind: 'coming', fromDays: 11, toDays: 17 });
  });
  it('says "any day now" inside the window', () => {
    expect(getHeadline(done, '2026-11-03', rules)).toEqual({ kind: 'any_day_now' });
    expect(getHeadline(done, '2026-11-06', rules)).toEqual({ kind: 'any_day_now' });
  });
  it('says how many days later than the guess once the window has passed', () => {
    expect(getHeadline(done, '2026-11-10', rules)).toEqual({ kind: 'late', days: 4 });
  });
});
