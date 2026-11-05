import type { CycleRules } from '../config/cycleRules';
import { sortPeriods } from './cycles';
import { addDays, diffDays, type DateStr } from './dates';
import type { Period } from './types';

/**
 * Checks on what she tells the app. Each check returns null (fine) or an Issue:
 *  - 'block':   cannot be saved as it is; the screen explains why and what to do
 *  - 'confirm': unusual but possible; the screen asks "is that right?" and she may go ahead
 * The wording for each code lives in the wording files (i18n), never here.
 */
export type IssueCode =
  | 'future_date'
  | 'start_already_logged'
  | 'start_inside_period'
  | 'start_previous_unfinished'
  | 'start_overlaps_next'
  | 'start_too_soon'
  | 'start_long_gap'
  | 'end_no_period'
  | 'end_before_start'
  | 'end_already'
  | 'end_too_long'
  | 'overlaps'
  | 'note_empty'
  | 'note_too_long';

export interface IssueData {
  date?: DateStr;
  /** Start of the period the problem is about. */
  start?: DateStr;
  end?: DateStr | null;
  days?: number;
  periodId?: string;
}

export interface Issue {
  severity: 'block' | 'confirm';
  code: IssueCode;
  data: IssueData;
}

export const NOTE_MAX_LENGTH = 500;

const block = (code: IssueCode, data: IssueData = {}): Issue => ({ severity: 'block', code, data });
const confirm = (code: IssueCode, data: IssueData = {}): Issue => ({ severity: 'confirm', code, data });

/** Last day a period covers: its end date, or the assumed length when no end was told. */
function coveredUntil(p: Period, rules: CycleRules): DateStr {
  return p.endDate ?? addDays(p.startDate, rules.period.assumedLengthDays - 1);
}

/** "My period started on <date>" */
export function checkPeriodStart(date: DateStr, periods: Period[], today: DateStr, rules: CycleRules): Issue | null {
  if (date > today) return block('future_date', { date });
  const sorted = sortPeriods(periods);

  for (const p of sorted) {
    if (p.startDate === date) return block('start_already_logged', { periodId: p.id, start: p.startDate, end: p.endDate });
    if (date > p.startDate && date <= coveredUntil(p, rules)) {
      return block('start_inside_period', { periodId: p.id, start: p.startDate, end: p.endDate });
    }
  }

  // An earlier period that was never ended: it must be ended before another one can start.
  const previousOpen = [...sorted].reverse().find((p) => p.startDate < date && p.endDate === null);
  if (previousOpen) return block('start_previous_unfinished', { periodId: previousOpen.id, start: previousOpen.startDate });

  // A later period that this new one would run into.
  const next = sorted.find((p) => p.startDate > date);
  if (next && next.startDate <= addDays(date, rules.period.assumedLengthDays - 1)) {
    return block('start_overlaps_next', { periodId: next.id, start: next.startDate });
  }

  // Unusually close to another start: ask, do not refuse.
  const nearest = Math.min(...sorted.map((p) => Math.abs(diffDays(p.startDate, date))));
  if (sorted.length > 0 && nearest < rules.checks.minDaysBetweenStarts) return confirm('start_too_soon', { days: nearest });

  // A long gap from the nearest other start (a missed cycle can be real: illness, pregnancy, pill).
  if (sorted.length > 0 && nearest > rules.checks.longGapDays) return confirm('start_long_gap', { days: nearest });

  return null;
}

/** "My period ended on <date>" */
export function checkPeriodEnd(date: DateStr, periods: Period[], today: DateStr, rules: CycleRules): Issue | null {
  if (date > today) return block('future_date', { date });
  const sorted = sortPeriods(periods);

  const owner = [...sorted].reverse().find((p) => p.startDate <= date);
  if (!owner) {
    const later = sorted.find((p) => p.endDate === null && p.startDate > date);
    if (later) return block('end_before_start', { date, start: later.startDate, periodId: later.id });
    return block('end_no_period', { date });
  }
  if (owner.endDate !== null) return block('end_already', { periodId: owner.id, start: owner.startDate, end: owner.endDate });

  const days = diffDays(owner.startDate, date) + 1;
  if (days > rules.checks.longPeriodDays) return confirm('end_too_long', { days, periodId: owner.id, start: owner.startDate });
  return null;
}

/** Changing the start and/or end of an existing period. */
export function checkPeriodEdit(
  id: string,
  startDate: DateStr,
  endDate: DateStr | null,
  periods: Period[],
  today: DateStr,
  rules: CycleRules,
): Issue | null {
  if (startDate > today || (endDate !== null && endDate > today)) return block('future_date', { date: endDate && endDate > today ? endDate : startDate });
  if (endDate !== null && endDate < startDate) return block('end_before_start', { date: endDate, start: startDate });

  const newEnd = endDate ?? addDays(startDate, rules.period.assumedLengthDays - 1);
  const others = sortPeriods(periods).filter((p) => p.id !== id);
  for (const other of others) {
    if (startDate <= coveredUntil(other, rules) && other.startDate <= newEnd) {
      return block('overlaps', { periodId: other.id, start: other.startDate, end: other.endDate });
    }
  }

  if (endDate !== null) {
    const days = diffDays(startDate, endDate) + 1;
    if (days > rules.checks.longPeriodDays) return confirm('end_too_long', { days, periodId: id, start: startDate });
  }
  if (others.length > 0) {
    const nearest = Math.min(...others.map((p) => Math.abs(diffDays(p.startDate, startDate))));
    if (nearest < rules.checks.minDaysBetweenStarts) return confirm('start_too_soon', { days: nearest });
    if (nearest > rules.checks.longGapDays) return confirm('start_long_gap', { days: nearest });
  }
  return null;
}

/** A note for one day. */
export function checkNote(date: DateStr, note: string, today: DateStr): Issue | null {
  if (date > today) return block('future_date', { date });
  if (note.trim().length === 0) return block('note_empty');
  if (note.length > NOTE_MAX_LENGTH) return block('note_too_long', { days: NOTE_MAX_LENGTH });
  return null;
}

/** One earlier cycle she is adding: when it started and when the bleeding ended. */
export interface HistoryEntry {
  start: DateStr;
  end: DateStr | null;
}

/**
 * Checks a whole list of earlier cycles at once, as if they were added oldest first.
 * Returns every problem with the position of the row it belongs to (at most one per row).
 */
export function checkHistory(
  entries: HistoryEntry[],
  periods: Period[],
  today: DateStr,
  rules: CycleRules,
): { index: number; issue: Issue }[] {
  const found: { index: number; issue: Issue }[] = [];
  const accumulated: Period[] = [...periods];
  // Overlaps and duplicates are found oldest-first; the long-gap question needs every other start, so it is asked at the end.
  const noGap: CycleRules = { ...rules, checks: { ...rules.checks, longGapDays: Number.POSITIVE_INFINITY } };
  entries
    .map((entry, index) => ({ entry, index }))
    .sort((a, b) => (a.entry.start < b.entry.start ? -1 : a.entry.start > b.entry.start ? 1 : 0))
    .forEach(({ entry, index }) => {
      let issue = checkPeriodStart(entry.start, accumulated, today, noGap);
      if (!issue && entry.end !== null) {
        if (entry.end < entry.start) issue = block('end_before_start', { date: entry.end, start: entry.start });
        else if (entry.end > today) issue = block('future_date', { date: entry.end });
        else if (diffDays(entry.start, entry.end) + 1 > rules.checks.longPeriodDays) {
          issue = confirm('end_too_long', { days: diffDays(entry.start, entry.end) + 1, start: entry.start });
        }
      }
      if (issue) found.push({ index, issue });
      accumulated.push({ id: `new-${index}`, startDate: entry.start, endDate: entry.end, note: null });
    });

  const starts = [...periods.map((x) => x.startDate), ...entries.map((e) => e.start)];
  entries.forEach((entry, index) => {
    if (found.some((f) => f.index === index)) return;
    const others = starts.filter((_, i) => !(i === periods.length + index));
    if (others.length === 0) return;
    const nearest = Math.min(...others.map((d) => Math.abs(diffDays(d, entry.start))));
    if (nearest > rules.checks.longGapDays) found.push({ index, issue: confirm('start_long_gap', { days: nearest }) });
  });
  return found.sort((a, b) => a.index - b.index);
}
