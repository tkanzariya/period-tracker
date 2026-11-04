import { describe, expect, it } from 'vitest';
import { STRINGS } from '../i18n';
import { dayWord, formatLong, formatMedium, formatMonthYear, formatRange, formatShort } from './format';

const en = STRINGS.en;
const hi = STRINGS.hi;

describe('date wording in English', () => {
  it('formats single days', () => {
    expect(formatLong('2026-10-27', en)).toBe('Tuesday, 27 October');
    expect(formatMedium('2026-10-27', en)).toBe('Tue, 27 Oct');
    expect(formatShort('2026-10-27', en)).toBe('27 Oct');
    expect(formatMonthYear(2026, 9, en)).toBe('October 2026');
  });
  it('formats ranges in the same month and across months', () => {
    expect(formatRange('2026-11-10', '2026-11-14', en)).toBe('10–14 Nov');
    expect(formatRange('2026-10-30', '2026-11-03', en)).toBe('30 Oct – 3 Nov');
  });
  it('shows a one-day range as a single day', () => {
    expect(formatRange('2026-10-27', '2026-10-27', en)).toBe('27 Oct');
  });
  it('names today and yesterday inside a sentence', () => {
    expect(dayWord('2026-11-05', '2026-11-05', '2026-11-04', en)).toBe('today');
    expect(dayWord('2026-11-04', '2026-11-05', '2026-11-04', en)).toBe('yesterday');
    expect(dayWord('2026-11-01', '2026-11-05', '2026-11-04', en)).toBe('1 Nov');
  });
});

describe('date wording in Hindi', () => {
  it('uses Hindi day and month names', () => {
    expect(formatLong('2026-10-27', hi)).toBe('मंगलवार, 27 अक्टूबर');
    expect(formatRange('2026-11-10', '2026-11-14', hi)).toBe('10–14 नव');
    expect(formatMonthYear(2026, 0, hi)).toBe('जनवरी 2026');
  });
});
