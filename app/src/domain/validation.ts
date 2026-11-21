import type { CycleRules } from '../config/cycleRules';
import { sortPeriods } from './cycles';
import { diffDays, type DateStr } from './dates';
import type { Period } from './types';

/**
 * Checks on what she tells the app. There is no "period end" in the app (a cycle runs from one start to
 * the next), so the only thing she tells it is "a period started on this day". Each check returns null
 * (fine) or an Issue:
 *  - 'block':   cannot be saved as it is; the screen explains why and what to do
 *  - 'confirm': unusual but possible; the screen asks "is that right?" and she may go ahead
 * The wording for each code lives in the wording files (i18n), never here.
 */
export type IssueCode = 'future_date' | 'start_already_logged' | 'start_too_soon' | 'start_long_gap' | 'start_too_old' | 'note_empty' | 'note_too_long';

export interface IssueData {
  date?: DateStr;
  /** Start of the period the problem is about. */
  start?: DateStr;
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

/** Checks one start day against the other starts (`others` must not contain the period being checked). */
function checkAgainst(date: DateStr, others: Period[], today: DateStr, rules: CycleRules): Issue | null {
  if (date > today) return block('future_date', { date });
  // Far too long ago to be a real memory of a start: stop it (a typing slip such as the wrong year).
  if (diffDays(date, today) > rules.checks.maxStartAgeDays) return block('start_too_old', { date, days: rules.checks.maxStartAgeDays });

  const same = others.find((p) => p.startDate === date);
  if (same) return block('start_already_logged', { periodId: same.id, start: same.startDate });

  if (others.length > 0) {
    const nearest = Math.min(...others.map((p) => Math.abs(diffDays(p.startDate, date))));
    // Unusually close to another start: ask, do not refuse.
    if (nearest < rules.checks.minDaysBetweenStarts) return confirm('start_too_soon', { days: nearest });
    // A long gap: a missed cycle can be real (illness, pregnancy, pill).
    if (nearest > rules.checks.longGapDays) return confirm('start_long_gap', { days: nearest });
  }
  return null;
}

/** "My period started on <date>" */
export function checkPeriodStart(date: DateStr, periods: Period[], today: DateStr, rules: CycleRules): Issue | null {
  return checkAgainst(date, sortPeriods(periods), today, rules);
}

/** Changing the start day of a period she already told the app about. */
export function checkPeriodEdit(id: string, startDate: DateStr, periods: Period[], today: DateStr, rules: CycleRules): Issue | null {
  return checkAgainst(startDate, periods.filter((p) => p.id !== id), today, rules);
}

/** A note for one day. */
export function checkNote(date: DateStr, note: string, today: DateStr): Issue | null {
  if (date > today) return block('future_date', { date });
  if (note.trim().length === 0) return block('note_empty');
  if (note.length > NOTE_MAX_LENGTH) return block('note_too_long', { days: NOTE_MAX_LENGTH });
  return null;
}

/** One earlier cycle she is adding: the day it started. */
export interface HistoryEntry {
  start: DateStr;
}

/**
 * Checks a whole list of earlier cycles at once. Returns every problem with the position of the row it
 * belongs to (at most one per row).
 */
export function checkHistory(entries: HistoryEntry[], periods: Period[], today: DateStr, rules: CycleRules): { index: number; issue: Issue }[] {
  const found: { index: number; issue: Issue }[] = [];
  const seen = new Set<DateStr>();
  entries.forEach((entry, index) => {
    // The same day twice in the list: report the second one.
    if (seen.has(entry.start)) {
      found.push({ index, issue: block('start_already_logged', { start: entry.start }) });
      return;
    }
    seen.add(entry.start);
    // Compare with her saved starts and every other row (so a long gap is judged against all of them).
    const others: Period[] = [
      ...periods,
      ...entries.filter((e, i) => i !== index && e.start !== entry.start).map((e, i) => ({ id: `row-${i}`, startDate: e.start, endDate: null, note: null })),
    ];
    const issue = checkAgainst(entry.start, others, today, rules);
    if (issue) found.push({ index, issue });
  });
  return found;
}
