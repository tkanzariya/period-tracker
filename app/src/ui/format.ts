import { parseDate, type DateStr } from '../domain/dates';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAYS_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function parts(date: DateStr) {
  const d = new Date(parseDate(date));
  return { day: d.getUTCDate(), month: d.getUTCMonth(), weekday: d.getUTCDay() };
}

/** "Tuesday, 27 October" */
export function formatLong(date: DateStr): string {
  const p = parts(date);
  return `${DAYS_LONG[p.weekday]}, ${p.day} ${MONTHS_LONG[p.month]}`;
}

/** "Tue, 27 Oct" */
export function formatMedium(date: DateStr): string {
  const p = parts(date);
  return `${DAYS_SHORT[p.weekday]}, ${p.day} ${MONTHS[p.month]}`;
}

/** "27 Oct" */
export function formatShort(date: DateStr): string {
  const p = parts(date);
  return `${p.day} ${MONTHS[p.month]}`;
}

/** "10–14 Nov" or "30 Oct – 3 Nov" */
export function formatRange(from: DateStr, to: DateStr): string {
  const a = parts(from);
  const b = parts(to);
  if (a.month === b.month) return `${a.day}–${b.day} ${MONTHS[a.month]}`;
  return `${formatShort(from)} – ${formatShort(to)}`;
}
