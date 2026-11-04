import { describe, expect, it } from 'vitest';
import { DEFAULT_CYCLE_RULES as rules } from '../config/cycleRules';
import { checkNote, checkPeriodEdit, checkPeriodEnd, checkPeriodStart, NOTE_MAX_LENGTH } from './validation';
import type { Period } from './types';

const p = (startDate: string, endDate: string | null = null): Period => ({ id: startDate, startDate, endDate, note: null });
const TODAY = '2026-11-05';

// Each test is named after the situation a person can get into (docs/context/scenarios.md).
describe('telling the app a period STARTED', () => {
  it('S4: a day that has not come yet is refused', () => {
    expect(checkPeriodStart('2026-11-06', [], TODAY, rules)).toMatchObject({ severity: 'block', code: 'future_date' });
  });
  it('S0: the very first period, today or any past day, is fine', () => {
    expect(checkPeriodStart(TODAY, [], TODAY, rules)).toBeNull();
    expect(checkPeriodStart('2026-01-02', [], TODAY, rules)).toBeNull();
  });
  it('S6: starting on a day that is already a start is refused and points at that period', () => {
    expect(checkPeriodStart('2026-10-06', [p('2026-10-06', '2026-10-10')], TODAY, rules)).toMatchObject({
      severity: 'block',
      code: 'start_already_logged',
      data: { periodId: '2026-10-06' },
    });
  });
  it('S1: a day inside a finished period is refused', () => {
    expect(checkPeriodStart('2026-10-08', [p('2026-10-06', '2026-10-10')], TODAY, rules)).toMatchObject({ code: 'start_inside_period' });
  });
  it('S1: a day inside the assumed length of an unfinished period is refused', () => {
    expect(checkPeriodStart('2026-10-09', [p('2026-10-06')], TODAY, rules)).toMatchObject({ code: 'start_inside_period' });
  });
  it('S2: starting a second period while the first was never ended is refused, with the open one named', () => {
    expect(checkPeriodStart('2026-10-25', [p('2026-10-06')], TODAY, rules)).toMatchObject({
      severity: 'block',
      code: 'start_previous_unfinished',
      data: { periodId: '2026-10-06', start: '2026-10-06' },
    });
  });
  it('S2: once the first period is ended, the next one can start', () => {
    expect(checkPeriodStart('2026-11-03', [p('2026-10-06', '2026-10-10')], TODAY, rules)).toBeNull();
  });
  it('S3: a start unusually soon after another asks "is this a new period?" (14 days), 15 days is fine', () => {
    expect(checkPeriodStart('2026-10-20', [p('2026-10-06', '2026-10-10')], TODAY, rules)).toMatchObject({
      severity: 'confirm',
      code: 'start_too_soon',
      data: { days: 14 },
    });
    expect(checkPeriodStart('2026-10-21', [p('2026-10-06', '2026-10-10')], TODAY, rules)).toBeNull();
  });
  it('S3b: just after a period ended (day 2 after) also asks', () => {
    expect(checkPeriodStart('2026-10-12', [p('2026-10-06', '2026-10-10')], TODAY, rules)).toMatchObject({ code: 'start_too_soon' });
  });
  it('S5: filling in an older period before the first one is fine', () => {
    expect(checkPeriodStart('2026-08-01', [p('2026-10-06', '2026-10-10')], TODAY, rules)).toBeNull();
  });
  it('S5b: an older period that would run into a later one is refused', () => {
    expect(checkPeriodStart('2026-10-31', [p('2026-10-06', '2026-10-10'), p('2026-11-03')], TODAY, rules)).toMatchObject({
      severity: 'block',
      code: 'start_overlaps_next',
    });
  });
});

describe('telling the app a period ENDED', () => {
  it('S4: a day that has not come yet is refused', () => {
    expect(checkPeriodEnd('2026-11-06', [p('2026-11-03')], TODAY, rules)).toMatchObject({ code: 'future_date' });
  });
  it('S7: nothing was started at all', () => {
    expect(checkPeriodEnd(TODAY, [], TODAY, rules)).toMatchObject({ severity: 'block', code: 'end_no_period' });
  });
  it('S7b: the last period already has an end', () => {
    expect(checkPeriodEnd('2026-10-20', [p('2026-10-06', '2026-10-10')], TODAY, rules)).toMatchObject({
      severity: 'block',
      code: 'end_already',
      data: { end: '2026-10-10' },
    });
  });
  it('S8: an end before the period started is refused, naming the start', () => {
    expect(checkPeriodEnd('2026-10-15', [p('2026-10-20')], TODAY, rules)).toMatchObject({
      code: 'end_before_start',
      data: { start: '2026-10-20' },
    });
  });
  it('the normal case: ending a period that is going on', () => {
    expect(checkPeriodEnd(TODAY, [p('2026-11-03')], TODAY, rules)).toBeNull();
  });
  it('S9: a very long period asks "is that right?" (15 days), 14 days is fine', () => {
    expect(checkPeriodEnd('2026-10-20', [p('2026-10-06')], TODAY, rules)).toMatchObject({ severity: 'confirm', code: 'end_too_long', data: { days: 15 } });
    expect(checkPeriodEnd('2026-10-19', [p('2026-10-06')], TODAY, rules)).toBeNull();
  });
  it('S9b: an older period that was never ended can still be ended', () => {
    expect(checkPeriodEnd('2026-06-10', [p('2026-06-06'), p('2026-07-04', '2026-07-08')], TODAY, rules)).toBeNull();
  });
});

describe('CHANGING a period', () => {
  const a = p('2026-09-08', '2026-09-12');
  const b = p('2026-10-06', '2026-10-10');
  it('S12: moving the start into the earlier period is refused', () => {
    expect(checkPeriodEdit(b.id, '2026-09-10', '2026-10-10', [a, b], TODAY, rules)).toMatchObject({ severity: 'block', code: 'overlaps' });
  });
  it('S13: an end before the start is refused', () => {
    expect(checkPeriodEdit(b.id, '2026-10-06', '2026-10-05', [a, b], TODAY, rules)).toMatchObject({ code: 'end_before_start' });
  });
  it('S4: a future day is refused', () => {
    expect(checkPeriodEdit(b.id, '2026-10-06', '2026-11-06', [a, b], TODAY, rules)).toMatchObject({ code: 'future_date' });
  });
  it('a sensible change to its own dates is fine (it never clashes with itself)', () => {
    expect(checkPeriodEdit(b.id, '2026-10-07', '2026-10-11', [a, b], TODAY, rules)).toBeNull();
  });
  it('S9: making it last 15 days asks "is that right?"', () => {
    expect(checkPeriodEdit(b.id, '2026-10-06', '2026-10-20', [a, b], TODAY, rules)).toMatchObject({ severity: 'confirm', code: 'end_too_long' });
  });
  it('S3: moving the start unusually close to another start asks', () => {
    expect(checkPeriodEdit(b.id, '2026-09-20', '2026-09-24', [a, b], TODAY, rules)).toMatchObject({ severity: 'confirm', code: 'start_too_soon' });
  });
  it('turning "ended" off (no end) is fine', () => {
    expect(checkPeriodEdit(b.id, '2026-10-06', null, [a, b], TODAY, rules)).toBeNull();
  });
});

describe('NOTES', () => {
  it('S16: an empty or blank note is refused', () => {
    expect(checkNote('2026-11-01', '   ', TODAY)).toMatchObject({ code: 'note_empty' });
  });
  it('S17: a note for a future day is refused', () => {
    expect(checkNote('2026-11-06', 'hello', TODAY)).toMatchObject({ code: 'future_date' });
  });
  it('S18: a very long note is refused, the limit itself is fine', () => {
    expect(checkNote('2026-11-01', 'a'.repeat(NOTE_MAX_LENGTH + 1), TODAY)).toMatchObject({ code: 'note_too_long' });
    expect(checkNote('2026-11-01', 'a'.repeat(NOTE_MAX_LENGTH), TODAY)).toBeNull();
  });
  it('a normal note is fine', () => {
    expect(checkNote('2026-11-01', 'cramps in the evening', TODAY)).toBeNull();
  });
});
