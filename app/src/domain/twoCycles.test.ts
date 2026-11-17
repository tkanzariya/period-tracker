import { describe, expect, it } from 'vitest';
import { DEFAULT_CYCLE_RULES as rules } from '../config/cycleRules';
import { addDays } from './dates';
import { getDayInfo } from './phases';
import type { Period, Phase } from './types';

const p = (startDate: string): Period => ({ id: startDate, startDate, endDate: null, note: null });
const phaseOn = (periods: Period[], date: string): Phase | null => getDayInfo(date, periods, rules).phase;

// Tirth's own example (2026-11-18): a period started on 10 Oct and the next one on 10 Nov.
describe('two cycles: 10 Oct to 9 Nov, and 10 Nov onwards', () => {
  const periods = [p('2026-10-10'), p('2026-11-10')];

  it('today (18 Nov) is day 9 of the current cycle, not day 40', () => {
    expect(getDayInfo('2026-11-18', periods, rules).cycleDay).toBe(9);
  });

  it('the first cycle goes Bleeding, Follicular, Ovulation, Luteal, each exactly once and in that order', () => {
    const seen: Phase[] = [];
    for (let i = 0; i < 31; i++) {
      const phase = phaseOn(periods, addDays('2026-10-10', i));
      if (phase && seen[seen.length - 1] !== phase) seen.push(phase);
    }
    expect(seen).toEqual(['menstrual', 'follicular', 'ovulation', 'luteal']);
  });

  it('the new cycle starts again at day 1 with Bleeding', () => {
    expect(getDayInfo('2026-11-10', periods, rules).cycleDay).toBe(1);
    expect(phaseOn(periods, '2026-11-10')).toBe('menstrual');
    expect(phaseOn(periods, '2026-11-14')).toBe('menstrual');
    expect(phaseOn(periods, '2026-11-15')).toBe('follicular');
  });

  it('the last day before a new start is still the old cycle (day 31, Luteal)', () => {
    expect(getDayInfo('2026-11-09', periods, rules)).toMatchObject({ cycleDay: 31, phase: 'luteal' });
  });

  it('the order of entry does not matter', () => {
    const reversed = [p('2026-11-10'), p('2026-10-10')];
    expect(getDayInfo('2026-11-18', reversed, rules).cycleDay).toBe(9);
  });
});
