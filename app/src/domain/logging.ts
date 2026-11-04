import { sortPeriods } from './cycles';
import type { DateStr } from './dates';
import type { Period } from './types';

/** The period a "period ended" entry on `date` belongs to: the latest one that started on or before it and has no end yet. */
export function findOpenPeriod(date: DateStr, periods: Period[]): Period | null {
  const candidates = sortPeriods(periods).filter((p) => p.startDate <= date);
  const latest = candidates[candidates.length - 1];
  return latest && latest.endDate === null ? latest : null;
}
