import { randomUUID } from 'expo-crypto';
import type { SQLiteDatabase } from 'expo-sqlite';
import type { DateStr } from '../domain/dates';
import type { DailyLog, FlowLevel, Period } from '../domain/types';

const now = () => new Date().toISOString();

interface PeriodRow {
  id: string;
  start_date: string;
  end_date: string | null;
  note: string | null;
}

interface DailyLogRow {
  id: string;
  date: string;
  flow: string | null;
  note: string | null;
}

const toPeriod = (r: PeriodRow): Period => ({ id: r.id, startDate: r.start_date, endDate: r.end_date, note: r.note });
const toDailyLog = (r: DailyLogRow): DailyLog => ({ id: r.id, date: r.date, flow: r.flow as FlowLevel | null, note: r.note });

// ---- periods ----

export async function listPeriods(db: SQLiteDatabase): Promise<Period[]> {
  const rows = await db.getAllAsync<PeriodRow>(
    'SELECT id, start_date, end_date, note FROM periods WHERE deleted_at IS NULL ORDER BY start_date',
  );
  return rows.map(toPeriod);
}

export async function addPeriod(db: SQLiteDatabase, startDate: DateStr, endDate: DateStr | null = null): Promise<Period> {
  const existing = await db.getFirstAsync<PeriodRow>(
    'SELECT id, start_date, end_date, note FROM periods WHERE start_date = ? AND deleted_at IS NULL',
    startDate,
  );
  if (existing) return toPeriod(existing);

  const id = randomUUID();
  const ts = now();
  await db.runAsync(
    'INSERT INTO periods (id, start_date, end_date, note, created_at, updated_at) VALUES (?, ?, ?, NULL, ?, ?)',
    id,
    startDate,
    endDate,
    ts,
    ts,
  );
  return { id, startDate, endDate, note: null };
}

export async function updatePeriod(
  db: SQLiteDatabase,
  id: string,
  changes: { startDate?: DateStr; endDate?: DateStr | null; note?: string | null },
): Promise<void> {
  const row = await db.getFirstAsync<PeriodRow>(
    'SELECT id, start_date, end_date, note FROM periods WHERE id = ? AND deleted_at IS NULL',
    id,
  );
  if (!row) return;
  await db.runAsync(
    'UPDATE periods SET start_date = ?, end_date = ?, note = ?, updated_at = ? WHERE id = ?',
    changes.startDate ?? row.start_date,
    changes.endDate === undefined ? row.end_date : changes.endDate,
    changes.note === undefined ? row.note : changes.note,
    now(),
    id,
  );
}

/** Soft delete: the row stays (marked deleted) so a later sync can learn about it. */
export async function deletePeriod(db: SQLiteDatabase, id: string): Promise<void> {
  const ts = now();
  await db.runAsync('UPDATE periods SET deleted_at = ?, updated_at = ? WHERE id = ?', ts, ts, id);
}

export async function restorePeriod(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync('UPDATE periods SET deleted_at = NULL, updated_at = ? WHERE id = ?', now(), id);
}

// ---- daily logs ----

export async function listDailyLogs(db: SQLiteDatabase): Promise<DailyLog[]> {
  const rows = await db.getAllAsync<DailyLogRow>(
    'SELECT id, date, flow, note FROM daily_logs WHERE deleted_at IS NULL ORDER BY date',
  );
  return rows.map(toDailyLog);
}

/** One entry per day: creates it, or updates the existing one. */
export async function saveDailyLog(
  db: SQLiteDatabase,
  date: DateStr,
  values: { flow: FlowLevel | null; note: string | null },
): Promise<void> {
  const ts = now();
  const existing = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM daily_logs WHERE date = ? AND deleted_at IS NULL',
    date,
  );
  if (existing) {
    await db.runAsync('UPDATE daily_logs SET flow = ?, note = ?, updated_at = ? WHERE id = ?', values.flow, values.note, ts, existing.id);
  } else {
    await db.runAsync(
      'INSERT INTO daily_logs (id, date, flow, note, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)',
      randomUUID(),
      date,
      values.flow,
      values.note,
      ts,
      ts,
    );
  }
}

export async function deleteDailyLog(db: SQLiteDatabase, date: DateStr): Promise<void> {
  const ts = now();
  await db.runAsync('UPDATE daily_logs SET deleted_at = ?, updated_at = ? WHERE date = ? AND deleted_at IS NULL', ts, ts, date);
}
