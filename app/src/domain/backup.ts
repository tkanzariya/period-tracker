import { isValidDate } from './dates';
import { completedCycleLengths, periodLength, sortPeriods } from './cycles';
import type { Period } from './types';

/**
 * The backup file: one JSON document holding everything she has told the app.
 * Designed for portability (see docs/context/tech-decisions.md):
 *  - versioned, so older and newer files can be told apart
 *  - rows keep their UUIDs and timestamps, including "deleted" rows, so a
 *    restore never creates duplicates and a future cloud sync can merge
 *  - plain snake_case fields that map straight onto Postgres columns
 */
export const BACKUP_FORMAT = 'cycle-saathi-backup';
/** The app's earlier working name; files saved before the rename are still accepted. */
const LEGACY_BACKUP_FORMAT = 'cadence-backup';

export interface PeriodRecord {
  id: string;
  start_date: string;
  end_date: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface DailyLogRecord {
  id: string;
  date: string;
  note: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface SettingRecord {
  key: string;
  value: string;
  updated_at: string;
}

export interface BackupData {
  periods: PeriodRecord[];
  daily_logs: DailyLogRecord[];
  settings: SettingRecord[];
}

export interface BackupFile {
  format: typeof BACKUP_FORMAT;
  schema_version: number;
  exported_at: string;
  app_version: string;
  data: BackupData;
}

export function buildBackup(data: BackupData, meta: { schemaVersion: number; appVersion: string; now?: Date }): BackupFile {
  return {
    format: BACKUP_FORMAT,
    schema_version: meta.schemaVersion,
    exported_at: (meta.now ?? new Date()).toISOString(),
    app_version: meta.appVersion,
    data,
  };
}

export function serializeBackup(backup: BackupFile): string {
  return JSON.stringify(backup, null, 2);
}

export type ParseResult =
  | { ok: true; backup: BackupFile }
  | { ok: false; reason: 'not_json' | 'not_backup' | 'too_new' | 'bad_data' };

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === 'string' && v.length > 0;
const isStrOrNull = (v: unknown): v is string | null => v === null || typeof v === 'string';
const isTimestamp = (v: unknown): v is string => typeof v === 'string' && !Number.isNaN(Date.parse(v));
const isTimestampOrNull = (v: unknown): v is string | null => v === null || isTimestamp(v);

function periodRecord(v: unknown): PeriodRecord | null {
  if (!isObj(v)) return null;
  const { id, start_date, end_date, note, created_at, updated_at, deleted_at } = v;
  if (!isStr(id) || typeof start_date !== 'string' || !isValidDate(start_date)) return null;
  if (end_date !== null && (typeof end_date !== 'string' || !isValidDate(end_date) || end_date < start_date)) return null;
  if (!isStrOrNull(note) || !isTimestamp(created_at) || !isTimestamp(updated_at) || !isTimestampOrNull(deleted_at)) return null;
  return { id, start_date, end_date: end_date as string | null, note, created_at, updated_at, deleted_at };
}

function dailyLogRecord(v: unknown): DailyLogRecord | null {
  if (!isObj(v)) return null;
  const { id, date, note, created_at, updated_at, deleted_at } = v;
  if (!isStr(id) || typeof date !== 'string' || !isValidDate(date)) return null;
  if (!isStrOrNull(note) || !isTimestamp(created_at) || !isTimestamp(updated_at) || !isTimestampOrNull(deleted_at)) return null;
  return { id, date, note, created_at, updated_at, deleted_at };
}

function settingRecord(v: unknown): SettingRecord | null {
  if (!isObj(v)) return null;
  const { key, value, updated_at } = v;
  if (!isStr(key) || typeof value !== 'string' || !isTimestamp(updated_at)) return null;
  return { key, value, updated_at };
}

function mapAll<T>(list: unknown, parse: (v: unknown) => T | null): T[] | null {
  if (!Array.isArray(list)) return null;
  const out: T[] = [];
  for (const item of list) {
    const parsed = parse(item);
    if (!parsed) return null;
    out.push(parsed);
  }
  return out;
}

/** Reads and checks a backup file. Extra or older fields (e.g. a removed column) are ignored. */
export function parseBackup(text: string, currentSchemaVersion: number): ParseResult {
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, reason: 'not_json' };
  }
  if (
    !isObj(raw) ||
    (raw.format !== BACKUP_FORMAT && raw.format !== LEGACY_BACKUP_FORMAT) ||
    typeof raw.schema_version !== 'number' ||
    !isObj(raw.data)
  ) {
    return { ok: false, reason: 'not_backup' };
  }
  if (raw.schema_version > currentSchemaVersion) return { ok: false, reason: 'too_new' };

  const periods = mapAll(raw.data.periods, periodRecord);
  const daily_logs = mapAll(raw.data.daily_logs, dailyLogRecord);
  const settings = mapAll(raw.data.settings, settingRecord);
  if (!periods || !daily_logs || !settings) return { ok: false, reason: 'bad_data' };

  return {
    ok: true,
    backup: {
      format: BACKUP_FORMAT,
      schema_version: raw.schema_version,
      exported_at: typeof raw.exported_at === 'string' ? raw.exported_at : '',
      app_version: typeof raw.app_version === 'string' ? raw.app_version : '',
      data: { periods, daily_logs, settings },
    },
  };
}

export interface ImportPlan {
  periods: { insert: PeriodRecord[]; update: PeriodRecord[] };
  daily_logs: { insert: DailyLogRecord[]; update: DailyLogRecord[] };
  settings: { upsert: SettingRecord[] };
  /** What she should hear: only rows that are visible (not deleted). */
  addedPeriods: number;
  addedNotes: number;
  /** Rows that were already there (or older than what she has). */
  skipped: number;
}

/**
 * Works out how to merge a backup into what is already on the phone. Safe to
 * run twice (the second time nothing changes): rows are matched by id, the
 * newer `updated_at` wins, and a second active row for the same day is skipped.
 */
export function planImport(existing: BackupData, incoming: BackupData): ImportPlan {
  const plan: ImportPlan = {
    periods: { insert: [], update: [] },
    daily_logs: { insert: [], update: [] },
    settings: { upsert: [] },
    addedPeriods: 0,
    addedNotes: 0,
    skipped: 0,
  };

  // Periods: track which start dates are taken by an active row, as the plan unfolds.
  const periodById = new Map(existing.periods.map((p) => [p.id, p]));
  const activeStarts = new Map(existing.periods.filter((p) => !p.deleted_at).map((p) => [p.start_date, p.id]));
  for (const inc of incoming.periods) {
    const have = periodById.get(inc.id);
    if (have) {
      if (inc.updated_at <= have.updated_at) {
        plan.skipped++;
        continue;
      }
      const clash = !inc.deleted_at && activeStarts.has(inc.start_date) && activeStarts.get(inc.start_date) !== inc.id;
      if (clash) {
        plan.skipped++;
        continue;
      }
      if (!have.deleted_at) activeStarts.delete(have.start_date);
      if (!inc.deleted_at) activeStarts.set(inc.start_date, inc.id);
      plan.periods.update.push(inc);
      periodById.set(inc.id, inc);
    } else {
      if (!inc.deleted_at && activeStarts.has(inc.start_date)) {
        plan.skipped++;
        continue;
      }
      if (!inc.deleted_at) {
        activeStarts.set(inc.start_date, inc.id);
        plan.addedPeriods++;
      }
      plan.periods.insert.push(inc);
      periodById.set(inc.id, inc);
    }
  }

  const logById = new Map(existing.daily_logs.map((l) => [l.id, l]));
  const activeDays = new Map(existing.daily_logs.filter((l) => !l.deleted_at).map((l) => [l.date, l.id]));
  for (const inc of incoming.daily_logs) {
    const have = logById.get(inc.id);
    if (have) {
      if (inc.updated_at <= have.updated_at) {
        plan.skipped++;
        continue;
      }
      const clash = !inc.deleted_at && activeDays.has(inc.date) && activeDays.get(inc.date) !== inc.id;
      if (clash) {
        plan.skipped++;
        continue;
      }
      if (!have.deleted_at) activeDays.delete(have.date);
      if (!inc.deleted_at) activeDays.set(inc.date, inc.id);
      plan.daily_logs.update.push(inc);
      logById.set(inc.id, inc);
    } else {
      if (!inc.deleted_at && activeDays.has(inc.date)) {
        plan.skipped++;
        continue;
      }
      if (!inc.deleted_at) {
        activeDays.set(inc.date, inc.id);
        plan.addedNotes++;
      }
      plan.daily_logs.insert.push(inc);
      logById.set(inc.id, inc);
    }
  }

  const settingByKey = new Map(existing.settings.map((s) => [s.key, s]));
  for (const inc of incoming.settings) {
    const have = settingByKey.get(inc.key);
    if (!have || inc.updated_at > have.updated_at) plan.settings.upsert.push(inc);
    else plan.skipped++;
  }

  return plan;
}

const csvCell = (value: string | number | null): string => {
  if (value === null) return '';
  const s = String(value);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/**
 * A spreadsheet she can show a doctor: one row per period, oldest first,
 * with plain column names.
 */
export function periodsToCsv(periods: Period[]): string {
  const sorted = sortPeriods(periods);
  const cycleLengths = completedCycleLengths(sorted);
  const header = ['Period started', 'Period ended', 'Period length (days)', 'Cycle length (days)', 'Note'];
  const lines = [header.join(',')];
  sorted.forEach((p, i) => {
    lines.push(
      [p.startDate, p.endDate, periodLength(p), cycleLengths[i] ?? null, p.note].map(csvCell).join(','),
    );
  });
  return lines.join('\n') + '\n';
}
