import { describe, expect, it } from 'vitest';
import { DEFAULT_CYCLE_RULES as rules } from '../config/cycleRules';
import { findOpenPeriod, validatePeriodEdit, validatePeriodStart } from './logging';
import type { Period } from './types';

const p = (startDate: string, endDate: string | null = null): Period => ({ id: startDate, startDate, endDate, note: null });

describe('validatePeriodStart', () => {
  const periods = [p('2026-09-23', '2026-09-27')];
  it('rejects future dates', () => {
    expect(validatePeriodStart('2026-10-28', periods, '2026-10-27', rules)).toBe('future_date');
  });
  it('rejects a start inside an existing period', () => {
    expect(validatePeriodStart('2026-09-25', periods, '2026-10-27', rules)).toBe('inside_period');
  });
  it('uses the assumed length when no end is logged', () => {
    expect(validatePeriodStart('2026-09-27', [p('2026-09-23')], '2026-10-27', rules)).toBe('inside_period');
    expect(validatePeriodStart('2026-09-28', [p('2026-09-23')], '2026-10-27', rules)).toBeNull();
  });
  it('allows a normal new start and re-logging the same start', () => {
    expect(validatePeriodStart('2026-10-21', periods, '2026-10-27', rules)).toBeNull();
    expect(validatePeriodStart('2026-09-23', periods, '2026-10-27', rules)).toBeNull();
  });
});

describe('validatePeriodEdit', () => {
  const a = p('2026-09-01', '2026-09-05');
  const b = p('2026-09-29', '2026-10-03');
  const today = '2026-10-27';
  it('allows a sensible change to its own dates', () => {
    expect(validatePeriodEdit('2026-09-29', '2026-09-30', '2026-10-04', [a, b], today, rules)).toBeNull();
  });
  it('refuses an end before the start', () => {
    expect(validatePeriodEdit('2026-09-29', '2026-09-30', '2026-09-29', [a, b], today, rules)).toBe('end_before_start');
  });
  it('refuses the future', () => {
    expect(validatePeriodEdit('2026-09-29', '2026-09-29', '2026-10-28', [a, b], today, rules)).toBe('future_date');
  });
  it('refuses overlapping another period', () => {
    expect(validatePeriodEdit('2026-09-29', '2026-09-04', '2026-09-08', [a, b], today, rules)).toBe('overlaps');
  });
  it('allows touching nothing: gap between periods', () => {
    expect(validatePeriodEdit('2026-09-29', '2026-09-20', '2026-09-24', [a, b], today, rules)).toBeNull();
  });
});

describe('findOpenPeriod', () => {
  it('finds the latest period with no end on or before the date', () => {
    expect(findOpenPeriod('2026-10-03', [p('2026-09-23', '2026-09-27'), p('2026-10-01')])?.startDate).toBe('2026-10-01');
  });
  it('returns null when the latest period already has an end', () => {
    expect(findOpenPeriod('2026-10-03', [p('2026-10-01', '2026-10-05')])).toBeNull();
  });
  it('returns null when no period started yet', () => {
    expect(findOpenPeriod('2026-09-01', [p('2026-10-01')])).toBeNull();
  });
});
