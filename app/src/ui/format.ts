import { parseDate, type DateStr } from '../domain/dates';
import type { Strings } from '../i18n';

/**
 * Dates in the person's language. Day and month names come from the wording files, so English and
 * Hindi both read naturally ("Tuesday, 27 October" / "मंगलवार, 27 अक्टूबर").
 */
function parts(date: DateStr) {
  const d = new Date(parseDate(date));
  return { day: d.getUTCDate(), month: d.getUTCMonth(), weekday: d.getUTCDay(), year: d.getUTCFullYear() };
}

/** "Tuesday, 27 October" */
export function formatLong(date: DateStr, S: Strings): string {
  const p = parts(date);
  return `${S.dates.weekdays[p.weekday]}, ${p.day} ${S.dates.months[p.month]}`;
}

/** "Tue, 27 Oct" */
export function formatMedium(date: DateStr, S: Strings): string {
  const p = parts(date);
  return `${S.dates.weekdaysShort[p.weekday]}, ${p.day} ${S.dates.monthsShort[p.month]}`;
}

/** "27 Oct" */
export function formatShort(date: DateStr, S: Strings): string {
  const p = parts(date);
  return `${p.day} ${S.dates.monthsShort[p.month]}`;
}

/** "10–14 Nov" or "30 Oct – 3 Nov"; a one-day range is just "27 Oct". */
export function formatRange(from: DateStr, to: DateStr, S: Strings): string {
  if (from === to) return formatShort(from, S);
  const a = parts(from);
  const b = parts(to);
  if (a.month === b.month && a.year === b.year) return `${a.day}–${b.day} ${S.dates.monthsShort[a.month]}`;
  return `${formatShort(from, S)} – ${formatShort(to, S)}`;
}

/** "October 2026" for the calendar title. `month` is 0-11. */
export function formatMonthYear(year: number, month: number, S: Strings): string {
  return `${S.dates.months[month]} ${year}`;
}

/** "today", "yesterday" or "27 Oct": how a day is named inside a sentence. */
export function dayWord(date: DateStr, today: DateStr, yesterday: DateStr, S: Strings): string {
  if (date === today) return S.common.todayLower;
  if (date === yesterday) return S.common.yesterdayLower;
  return formatShort(date, S);
}
