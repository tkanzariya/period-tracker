import type { CycleRules } from '../config/cycleRules';
import { addDays, type DateStr } from './dates';
import { sortPeriods } from './cycles';
import { predictWithFallback } from './prediction';
import type { DailyLog, Period } from './types';

/**
 * Which reminders exist (docs/context/improvement-plan.md section 3). All are worked out on the phone
 * from her own dates; nothing is sent anywhere. Each fires at a fixed morning time (see REMINDER_HOUR).
 */
export type ReminderKind =
  | 'coming' //    N1: your period may start in the next few days
  | 'did_start' //  N2: did your period start?
  | 'did_end' //    N3: has your bleeding ended?
  | 'late' //       N4: later than my guess
  | 'backup' //     N5: save a copy of your information
  | 'quiet'; //     N9: tell me about your last period

export const REMINDER_KINDS: ReminderKind[] = ['coming', 'did_start', 'did_end', 'late', 'backup', 'quiet'];

/** Everything starts on; she can turn each kind off in Settings. */
export const DEFAULT_REMINDER_PREFS: Record<ReminderKind, boolean> = {
  coming: true,
  did_start: true,
  did_end: true,
  late: true,
  backup: true,
  quiet: true,
};

/** Morning, so nothing arrives at night (quiet hours 9 pm to 8 am). */
export const REMINDER_HOUR = 9;
/** How far ahead we plan; the plan is redone every time her information changes. */
export const REMINDER_HORIZON_DAYS = 60;
const BACKUP_EVERY_DAYS = 30;
const QUIET_AFTER_DAYS = 40;

export interface PlannedReminder {
  kind: ReminderKind;
  date: DateStr;
}

/** If two reminders fall on the same day only the most useful one is kept (never more than one a day). */
const PRIORITY: ReminderKind[] = ['did_end', 'did_start', 'coming', 'late', 'quiet', 'backup'];

export function planReminders(o: {
  periods: Period[];
  notes: DailyLog[];
  today: DateStr;
  /** True while it is still before REMINDER_HOUR today, so a reminder for today can still fire. */
  todayStillOpen: boolean;
  prefs: Record<ReminderKind, boolean>;
  /** The day she last saved a copy; null if never. */
  lastBackup: DateStr | null;
  rules: CycleRules;
}): PlannedReminder[] {
  const { periods, notes, today, todayStillOpen, prefs, lastBackup, rules } = o;
  const sorted = sortPeriods(periods);
  const found: PlannedReminder[] = [];
  const add = (kind: ReminderKind, date: DateStr) => {
    if (!prefs[kind]) return;
    const earliest = todayStillOpen ? today : addDays(today, 1);
    if (date < earliest || date > addDays(today, REMINDER_HORIZON_DAYS)) return;
    found.push({ kind, date });
  };
  const nextAllowed = todayStillOpen ? today : addDays(today, 1);

  const latest = sorted[sorted.length - 1];
  const prediction = predictWithFallback(sorted, rules);

  if (prediction) {
    add('coming', addDays(prediction.earliestStart, -2));
    for (let d = prediction.earliestStart; d <= prediction.latestStart; d = addDays(d, 2)) add('did_start', d);
    add('late', addDays(prediction.latestStart, 1));
  }

  if (latest && latest.endDate === null) {
    add('did_end', addDays(latest.startDate, 4)); // day 5
    add('did_end', addDays(latest.startDate, 7)); // day 8
  }

  add('backup', lastBackup ? addDays(lastBackup, BACKUP_EVERY_DAYS) : addDays(today, BACKUP_EVERY_DAYS));
  if (lastBackup && addDays(lastBackup, BACKUP_EVERY_DAYS) < nextAllowed) add('backup', nextAllowed);

  if (latest) {
    const days = [...sorted.flatMap((p) => [p.startDate, p.endDate ?? p.startDate]), ...notes.map((n) => n.date)];
    const lastActivity = days.reduce((a, b) => (a > b ? a : b));
    const quietOn = addDays(lastActivity, QUIET_AFTER_DAYS);
    add('quiet', quietOn < nextAllowed ? nextAllowed : quietOn);
  }

  const byDate = new Map<DateStr, PlannedReminder>();
  for (const r of found) {
    const existing = byDate.get(r.date);
    if (!existing || PRIORITY.indexOf(r.kind) < PRIORITY.indexOf(existing.kind)) byDate.set(r.date, r);
  }
  return [...byDate.values()].sort((a, b) => (a.date < b.date ? -1 : 1));
}
