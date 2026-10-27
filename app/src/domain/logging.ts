import type { CycleRules } from '../config/cycleRules';
import { sortPeriods } from './cycles';
import { addDays, type DateStr } from './dates';
import type { Period } from './types';

export type LogError = 'future_date' | 'inside_period' | 'no_open_period' | 'end_before_start' | 'overlaps';

/** Why changing a period to start/end on these dates should be refused, or null if it is fine. */
export function validatePeriodEdit(
  id: string,
  startDate: DateStr,
  endDate: DateStr | null,
  periods: Period[],
  today: DateStr,
  rules: CycleRules,
): LogError | null {
  if (startDate > today || (endDate !== null && endDate > today)) return 'future_date';
  if (endDate !== null && endDate < startDate) return 'end_before_start';
  const newEnd = endDate ?? addDays(startDate, rules.period.assumedLengthDays - 1);
  for (const other of periods) {
    if (other.id === id) continue;
    const otherEnd = other.endDate ?? addDays(other.startDate, rules.period.assumedLengthDays - 1);
    if (startDate <= otherEnd && other.startDate <= newEnd) return 'overlaps';
  }
  return null;
}

/** Why a "period started" entry on `date` should be refused, or null if it is fine. */
export function validatePeriodStart(date: DateStr, periods: Period[], today: DateStr, rules: CycleRules): LogError | null {
  if (date > today) return 'future_date';
  for (const p of periods) {
    if (p.startDate === date) return null; // re-logging the same start is harmless
    const end = p.endDate ?? addDays(p.startDate, rules.period.assumedLengthDays - 1);
    if (date > p.startDate && date <= end) return 'inside_period';
  }
  return null;
}

/** The period a "period ended" entry on `date` belongs to: the latest one that started on or before it and has no end yet. */
export function findOpenPeriod(date: DateStr, periods: Period[]): Period | null {
  const candidates = sortPeriods(periods).filter((p) => p.startDate <= date);
  const latest = candidates[candidates.length - 1];
  return latest && latest.endDate === null ? latest : null;
}
