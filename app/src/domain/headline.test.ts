import { describe, expect, it } from 'vitest';
import { DEFAULT_CYCLE_RULES as rules } from '../config/cycleRules';
import { getHeadline } from './headline';
import type { Period } from './types';

const p = (startDate: string): Period => ({ id: startDate, startDate, endDate: null, note: null });
// One period starting 2026-10-06: typical guess = 2026-11-03, range 31 Oct to 6 Nov.
const one = [p('2026-10-06')];

describe('the Today headline', () => {
  it('has nothing to say before the first period', () => {
    expect(getHeadline([], '2026-11-05', rules)).toEqual({ kind: 'none' });
  });
  it('counts the first days of a cycle as period days (an estimate)', () => {
    expect(getHeadline([p('2026-11-03')], '2026-11-04', rules)).toEqual({ kind: 'period_day', day: 2 });
  });
  it('says how many days until the window opens and closes', () => {
    expect(getHeadline(one, '2026-10-20', rules)).toEqual({ kind: 'coming', fromDays: 11, toDays: 17 });
  });
  it('says "any day now" inside the window', () => {
    expect(getHeadline(one, '2026-11-03', rules)).toEqual({ kind: 'any_day_now' });
    expect(getHeadline(one, '2026-11-06', rules)).toEqual({ kind: 'any_day_now' });
  });
  it('says how many days later than the guess once the window has passed', () => {
    expect(getHeadline(one, '2026-11-10', rules)).toEqual({ kind: 'late', days: 4 });
  });
  it('after a new start the late message goes away', () => {
    expect(getHeadline([p('2026-10-10'), p('2026-11-10')], '2026-11-18', rules).kind).toBe('coming');
  });
});
