import { addDays, formatDate, parseDate, type DateStr } from './dates';

export type WeekStart = 0 | 1; // 0 = Sunday, 1 = Monday

/** The weeks of a month as rows of 7; days outside the month are null. `month` is 0-11. */
export function monthGrid(year: number, month: number, weekStartsOn: WeekStart = 1): (DateStr | null)[][] {
  const first = formatDate(Date.UTC(year, month, 1));
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const firstWeekday = new Date(parseDate(first)).getUTCDay(); // 0 = Sunday
  const lead = (firstWeekday - weekStartsOn + 7) % 7;

  const cells: (DateStr | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 0; d < daysInMonth; d++) cells.push(addDays(first, d));
  while (cells.length % 7 !== 0) cells.push(null);

  const weeks: (DateStr | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** Move a (year, month) pair forwards or backwards by whole months. */
export function shiftMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const index = year * 12 + month + delta;
  return { year: Math.floor(index / 12), month: ((index % 12) + 12) % 12 };
}

export function weekdayLabels(weekStartsOn: WeekStart = 1): string[] {
  const labels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  return Array.from({ length: 7 }, (_, i) => labels[(i + weekStartsOn) % 7]);
}
