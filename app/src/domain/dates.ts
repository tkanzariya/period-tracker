/**
 * Calendar days are plain `YYYY-MM-DD` strings (no time zone), per the
 * data-portability rules. All arithmetic goes through UTC so daylight-saving
 * changes can never shift a date.
 */
export type DateStr = string;

const MS_PER_DAY = 86_400_000;
const pad = (n: number) => String(n).padStart(2, '0');

export function parseDate(date: DateStr): number {
  const [y, m, d] = date.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
}

export function formatDate(ms: number): DateStr {
  const d = new Date(ms);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

export function addDays(date: DateStr, days: number): DateStr {
  return formatDate(parseDate(date) + days * MS_PER_DAY);
}

/** Whole days from `from` to `to` (negative if `to` is earlier). */
export function diffDays(from: DateStr, to: DateStr): number {
  return Math.round((parseDate(to) - parseDate(from)) / MS_PER_DAY);
}

/** Today's date on the device's local calendar. */
export function todayLocal(now: Date = new Date()): DateStr {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function isValidDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  return formatDate(parseDate(date)) === date;
}
