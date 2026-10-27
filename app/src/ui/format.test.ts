import { describe, expect, it } from 'vitest';
import { formatLong, formatMedium, formatRange, formatShort } from './format';

describe('date wording', () => {
  it('formats single days', () => {
    expect(formatLong('2026-10-27')).toBe('Tuesday, 27 October');
    expect(formatMedium('2026-10-27')).toBe('Tue, 27 Oct');
    expect(formatShort('2026-10-27')).toBe('27 Oct');
  });
  it('formats ranges in the same month and across months', () => {
    expect(formatRange('2026-11-10', '2026-11-14')).toBe('10–14 Nov');
    expect(formatRange('2026-10-30', '2026-11-03')).toBe('30 Oct – 3 Nov');
  });
  it('shows a one-day range as a single day', () => {
    expect(formatRange('2026-10-27', '2026-10-27')).toBe('27 Oct');
  });
});
