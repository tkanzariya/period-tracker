import { describe, expect, it } from 'vitest';
import { DEFAULT_CYCLE_RULES as rules } from '../config/cycleRules';
import { checkHistory, checkNote, checkPeriodEdit, checkPeriodStart, NOTE_MAX_LENGTH } from './validation';
import type { Period } from './types';

const p = (startDate: string): Period => ({ id: startDate, startDate, endDate: null, note: null });
const TODAY = '2026-11-05';

// Each test is named after the situation a person can get into (docs/context/scenarios.md).
// There is no "period ended" in the app: she only ever says "a period started on this day".
describe('telling the app a period STARTED', () => {
  it('S0: the very first period, today or any past day, is fine', () => {
    expect(checkPeriodStart(TODAY, [], TODAY, rules)).toBeNull();
    expect(checkPeriodStart('2026-01-02', [], TODAY, rules)).toBeNull();
  });
  it('S1: a day that has not come yet is refused', () => {
    expect(checkPeriodStart('2026-11-06', [], TODAY, rules)).toMatchObject({ severity: 'block', code: 'future_date' });
  });
  it('S2: the same start twice is refused and points at that period', () => {
    expect(checkPeriodStart('2026-10-06', [p('2026-10-06')], TODAY, rules)).toMatchObject({
      severity: 'block',
      code: 'start_already_logged',
      data: { periodId: '2026-10-06' },
    });
  });
  it('S3: a normal next cycle (28 to 35 days later) is fine, no questions', () => {
    expect(checkPeriodStart('2026-11-03', [p('2026-10-06')], TODAY, rules)).toBeNull();
    expect(checkPeriodStart('2026-11-10', [p('2026-10-10')], '2026-11-18', rules)).toBeNull();
  });
  it('S4: a start only a few days after another asks "is that right?"', () => {
    expect(checkPeriodStart('2026-10-12', [p('2026-10-06')], TODAY, rules)).toMatchObject({ severity: 'confirm', code: 'start_too_soon', data: { days: 6 } });
  });
  it('S5: exactly 15 days after another is fine', () => {
    expect(checkPeriodStart('2026-10-21', [p('2026-10-06')], TODAY, rules)).toBeNull();
  });
  it('S6: an older period filled in before the first one is fine', () => {
    expect(checkPeriodStart('2026-08-20', [p('2026-10-06')], TODAY, rules)).toBeNull();
  });
  it('S7: a missed cycle (more than 60 days) asks, it does not block', () => {
    expect(checkPeriodStart('2026-10-10', [p('2026-07-01')], TODAY, rules)).toMatchObject({ severity: 'confirm', code: 'start_long_gap', data: { days: 101 } });
    expect(checkPeriodStart('2026-08-30', [p('2026-07-01')], TODAY, rules)).toBeNull(); // exactly 60
  });
  it('S8: an earlier start is judged against the nearest other start on either side', () => {
    expect(checkPeriodStart('2026-10-05', [p('2026-10-10')], TODAY, rules)).toMatchObject({ code: 'start_too_soon' });
  });
});

describe('changing the start day of a saved period', () => {
  const a = p('2026-09-08');
  const b = p('2026-10-06');
  it('S9: moving a start by a few days is fine', () => {
    expect(checkPeriodEdit(b.id, '2026-10-04', [a, b], TODAY, rules)).toBeNull();
  });
  it('S10: moving it onto another period\'s start is refused', () => {
    expect(checkPeriodEdit(b.id, '2026-09-08', [a, b], TODAY, rules)).toMatchObject({ severity: 'block', code: 'start_already_logged' });
  });
  it('S11: moving it to the future is refused', () => {
    expect(checkPeriodEdit(b.id, '2026-12-01', [a, b], TODAY, rules)).toMatchObject({ code: 'future_date' });
  });
  it('S12: moving it right next to another start asks', () => {
    expect(checkPeriodEdit(b.id, '2026-09-12', [a, b], TODAY, rules)).toMatchObject({ severity: 'confirm', code: 'start_too_soon' });
  });
  it('S13: it is not compared with itself', () => {
    expect(checkPeriodEdit(b.id, '2026-10-06', [a, b], TODAY, rules)).toBeNull();
  });
});

describe('notes', () => {
  it('S14: an empty note is refused', () => {
    expect(checkNote('2026-11-01', '   ', TODAY)).toMatchObject({ code: 'note_empty' });
  });
  it('S15: a note over the limit is refused', () => {
    expect(checkNote('2026-11-01', 'x'.repeat(NOTE_MAX_LENGTH + 1), TODAY)).toMatchObject({ code: 'note_too_long' });
    expect(checkNote('2026-11-01', 'x'.repeat(NOTE_MAX_LENGTH), TODAY)).toBeNull();
  });
  it('S16: a note on a future day is refused', () => {
    expect(checkNote('2026-11-06', 'hi', TODAY)).toMatchObject({ code: 'future_date' });
  });
});

describe('F3: adding earlier cycles in one go', () => {
  const current = p('2026-10-27');
  it('a tidy list of earlier cycles is fine, in any order', () => {
    const entries = [{ start: '2026-08-30' }, { start: '2026-10-01' }, { start: '2026-08-02' }];
    expect(checkHistory(entries, [current], TODAY, rules)).toEqual([]);
  });
  it('the same start twice is reported on the later row only', () => {
    const found = checkHistory([{ start: '2026-09-30' }, { start: '2026-09-30' }], [current], TODAY, rules);
    expect(found).toHaveLength(1);
    expect(found[0]).toMatchObject({ index: 1, issue: { code: 'start_already_logged' } });
  });
  it('two starts close together ask "is that right?" on the row concerned', () => {
    const found = checkHistory([{ start: '2026-09-01' }, { start: '2026-09-05' }], [current], TODAY, rules);
    expect(found.every((f) => f.issue.code === 'start_too_soon')).toBe(true);
    expect(found.length).toBeGreaterThan(0);
  });
  it('F4: a missed cycle in the history asks, it does not block', () => {
    const found = checkHistory([{ start: '2026-06-01' }], [current], TODAY, rules);
    expect(found[0].issue).toMatchObject({ severity: 'confirm', code: 'start_long_gap' });
  });
  it('a future start in the list is refused', () => {
    expect(checkHistory([{ start: '2027-01-01' }], [current], TODAY, rules)[0].issue.code).toBe('future_date');
  });
});
