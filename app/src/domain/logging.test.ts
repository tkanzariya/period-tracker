import { describe, expect, it } from 'vitest';
import { findOpenPeriod } from './logging';
import type { Period } from './types';

const p = (startDate: string, endDate: string | null = null): Period => ({ id: startDate, startDate, endDate, note: null });

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
