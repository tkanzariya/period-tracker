import { describe, expect, it } from 'vitest';
import { DEFAULT_CYCLE_RULES as rules } from '../config/cycleRules';
import { monthGrid, shiftMonth, weekdayLabels } from './calendar';
import { averagePeriodLength, cycleRows } from './cycles';
import type { Period } from './types';

const p = (startDate: string, endDate: string | null = null): Period => ({ id: startDate, startDate, endDate, note: null });

describe('monthGrid', () => {
  it('lays out October 2026 (starts on a Thursday), Monday first', () => {
    const weeks = monthGrid(2026, 9, 1);
    expect(weeks[0]).toEqual([null, null, null, '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04']);
    expect(weeks).toHaveLength(5);
    expect(weeks[4][5]).toBe('2026-10-31');
    expect(weeks.every((w) => w.length === 7)).toBe(true);
  });
  it('supports Sunday first', () => {
    const weeks = monthGrid(2026, 9, 0);
    expect(weeks[0]).toEqual([null, null, null, null, '2026-10-01', '2026-10-02', '2026-10-03']);
  });
  it('handles a month that starts on the first column and a leap February', () => {
    expect(monthGrid(2026, 5, 1)[0][0]).toBe('2026-06-01'); // Mon 1 June 2026
    const feb = monthGrid(2028, 1, 1).flat().filter(Boolean);
    expect(feb).toHaveLength(29);
  });
});

describe('shiftMonth', () => {
  it('moves across year boundaries', () => {
    expect(shiftMonth(2026, 11, 1)).toEqual({ year: 2027, month: 0 });
    expect(shiftMonth(2026, 0, -1)).toEqual({ year: 2025, month: 11 });
    expect(shiftMonth(2026, 5, -17)).toEqual({ year: 2025, month: 0 });
  });
});

describe('weekdayLabels', () => {
  it('starts on the chosen day', () => {
    expect(weekdayLabels(1)).toEqual(['M', 'T', 'W', 'T', 'F', 'S', 'S']);
    expect(weekdayLabels(0)).toEqual(['S', 'M', 'T', 'W', 'T', 'F', 'S']);
  });
});

describe('cycleRows', () => {
  const periods = [p('2026-07-01', '2026-07-05'), p('2026-07-29', '2026-08-02'), p('2026-09-05', '2026-09-11'), p('2026-10-01')];
  it('lists newest first with cycle and period lengths', () => {
    const rows = cycleRows(periods, rules);
    expect(rows.map((r) => r.period.startDate)).toEqual(['2026-10-01', '2026-09-05', '2026-07-29', '2026-07-01']);
    expect(rows[0].cycleDays).toBeNull();
    expect(rows[1].cycleDays).toBe(26);
    expect(rows[2].cycleDays).toBe(38);
    expect(rows[1].periodDays).toBe(7);
    expect(rows[0].periodDays).toBeNull();
  });
  it('tags cycles outside the usual range', () => {
    const rows = cycleRows(periods, rules);
    expect(rows[2].tag).toBe('long');
    expect(rows[1].tag).toBeNull();
    expect(rows[3].tag).toBeNull(); // 28 days
  });
  it('averages only periods with an end date', () => {
    expect(averagePeriodLength(periods)).toBeCloseTo((5 + 5 + 7) / 3);
    expect(averagePeriodLength([p('2026-10-01')])).toBeNull();
  });
});
