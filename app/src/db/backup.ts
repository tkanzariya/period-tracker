import type { SQLiteDatabase } from 'expo-sqlite';
import {
  buildBackup,
  parseBackup,
  planImport,
  serializeBackup,
  type BackupData,
  type DailyLogRecord,
  type ImportPlan,
  type PeriodRecord,
  type SettingRecord,
} from '../domain/backup';
import { SCHEMA_VERSION } from './migrations';

/** Every row, including ones marked deleted, exactly as stored. */
export async function readAllRecords(db: SQLiteDatabase): Promise<BackupData> {
  const [periods, daily_logs, settings] = await Promise.all([
    db.getAllAsync<PeriodRecord>(
      'SELECT id, start_date, end_date, note, created_at, updated_at, deleted_at FROM periods ORDER BY start_date, id',
    ),
    db.getAllAsync<DailyLogRecord>('SELECT id, date, note, created_at, updated_at, deleted_at FROM daily_logs ORDER BY date, id'),
    db.getAllAsync<SettingRecord>('SELECT key, value, updated_at FROM settings ORDER BY key'),
  ]);
  return { periods, daily_logs, settings };
}

export async function exportBackupText(db: SQLiteDatabase, appVersion: string): Promise<string> {
  const data = await readAllRecords(db);
  return serializeBackup(buildBackup(data, { schemaVersion: SCHEMA_VERSION, appVersion }));
}

async function applyPlan(db: SQLiteDatabase, plan: ImportPlan): Promise<void> {
  await db.withTransactionAsync(async () => {
    for (const p of plan.periods.insert) {
      await db.runAsync(
        'INSERT INTO periods (id, start_date, end_date, note, created_at, updated_at, deleted_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        p.id, p.start_date, p.end_date, p.note, p.created_at, p.updated_at, p.deleted_at,
      );
    }
    for (const p of plan.periods.update) {
      await db.runAsync(
        'UPDATE periods SET start_date = ?, end_date = ?, note = ?, updated_at = ?, deleted_at = ? WHERE id = ?',
        p.start_date, p.end_date, p.note, p.updated_at, p.deleted_at, p.id,
      );
    }
    for (const l of plan.daily_logs.insert) {
      await db.runAsync(
        'INSERT INTO daily_logs (id, date, note, created_at, updated_at, deleted_at) VALUES (?, ?, ?, ?, ?, ?)',
        l.id, l.date, l.note, l.created_at, l.updated_at, l.deleted_at,
      );
    }
    for (const l of plan.daily_logs.update) {
      await db.runAsync(
        'UPDATE daily_logs SET date = ?, note = ?, updated_at = ?, deleted_at = ? WHERE id = ?',
        l.date, l.note, l.updated_at, l.deleted_at, l.id,
      );
    }
    for (const s of plan.settings.upsert) {
      await db.runAsync(
        'INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at',
        s.key, s.value, s.updated_at,
      );
    }
  });
}

export type RestoreResult =
  | { ok: true; addedPeriods: number; addedNotes: number; skipped: number }
  | { ok: false; reason: 'not_json' | 'not_backup' | 'too_new' | 'bad_data' };

/** Reads a backup file's text and merges it into the database. Nothing is changed if the file is not valid. */
export async function restoreBackupText(db: SQLiteDatabase, text: string): Promise<RestoreResult> {
  const parsed = parseBackup(text, SCHEMA_VERSION);
  if (!parsed.ok) return parsed;
  const existing = await readAllRecords(db);
  const plan = planImport(existing, parsed.backup.data);
  await applyPlan(db, plan);
  return { ok: true, addedPeriods: plan.addedPeriods, addedNotes: plan.addedNotes, skipped: plan.skipped };
}
