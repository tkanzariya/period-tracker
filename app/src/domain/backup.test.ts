import { describe, expect, it } from 'vitest';
import {
  buildBackup,
  parseBackup,
  periodsToCsv,
  planImport,
  serializeBackup,
  type BackupData,
  type DailyLogRecord,
  type PeriodRecord,
} from './backup';

const T1 = '2026-10-01T10:00:00.000Z';
const T2 = '2026-10-02T10:00:00.000Z';
const T3 = '2026-10-03T10:00:00.000Z';

const period = (id: string, start: string, end: string | null = null, updated = T1, deleted: string | null = null): PeriodRecord => ({
  id,
  start_date: start,
  end_date: end,
  note: null,
  created_at: T1,
  updated_at: updated,
  deleted_at: deleted,
});
const log = (id: string, date: string, note = 'hello', updated = T1, deleted: string | null = null): DailyLogRecord => ({
  id,
  date,
  note,
  created_at: T1,
  updated_at: updated,
  deleted_at: deleted,
});
const empty = (): BackupData => ({ periods: [], daily_logs: [], settings: [] });

describe('backup file', () => {
  const data: BackupData = {
    periods: [period('p1', '2026-09-01', '2026-09-05'), period('p2', '2026-09-29')],
    daily_logs: [log('l1', '2026-09-02')],
    settings: [{ key: 'display_name', value: 'Drashti', updated_at: T1 }],
  };

  it('round-trips through JSON', () => {
    const text = serializeBackup(buildBackup(data, { schemaVersion: 2, appVersion: '1.0.0', now: new Date(T2) }));
    const result = parseBackup(text, 2);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.backup.data).toEqual(data);
      expect(result.backup.exported_at).toBe(T2);
    }
  });
  it('still reads files saved under the earlier working name', () => {
    const text = serializeBackup(buildBackup(data, { schemaVersion: 2, appVersion: '1.0.0' })).replace('cycle-saathi-backup', 'cadence-backup');
    const result = parseBackup(text, 2);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.backup.format).toBe('cycle-saathi-backup');
  });
  it('rejects text that is not JSON', () => {
    expect(parseBackup('hello', 2)).toEqual({ ok: false, reason: 'not_json' });
  });
  it('rejects JSON that is not a backup', () => {
    expect(parseBackup('{"a":1}', 2)).toEqual({ ok: false, reason: 'not_backup' });
  });
  it('rejects a backup made by a newer app', () => {
    const text = serializeBackup(buildBackup(data, { schemaVersion: 3, appVersion: '2.0.0' }));
    expect(parseBackup(text, 2)).toEqual({ ok: false, reason: 'too_new' });
  });
  it('accepts a backup from an older app version', () => {
    const text = serializeBackup(buildBackup(data, { schemaVersion: 1, appVersion: '0.9.0' }));
    expect(parseBackup(text, 2).ok).toBe(true);
  });
  it('rejects bad rows instead of importing partly', () => {
    const bad = buildBackup({ ...data, periods: [period('p1', '2026-02-30')] }, { schemaVersion: 2, appVersion: '1' });
    expect(parseBackup(serializeBackup(bad), 2)).toEqual({ ok: false, reason: 'bad_data' });
    const endBeforeStart = buildBackup({ ...data, periods: [period('p1', '2026-09-05', '2026-09-01')] }, { schemaVersion: 2, appVersion: '1' });
    expect(parseBackup(serializeBackup(endBeforeStart), 2)).toEqual({ ok: false, reason: 'bad_data' });
  });
  it('ignores unknown extra fields (e.g. the removed flow column)', () => {
    const text = serializeBackup(buildBackup(data, { schemaVersion: 1, appVersion: '1' })).replace('"note": "hello"', '"note": "hello", "flow": "light"');
    expect(parseBackup(text, 2).ok).toBe(true);
  });
});

describe('planImport', () => {
  it('adds everything into an empty phone', () => {
    const incoming: BackupData = { periods: [period('p1', '2026-09-01')], daily_logs: [log('l1', '2026-09-02')], settings: [] };
    const plan = planImport(empty(), incoming);
    expect(plan.periods.insert).toHaveLength(1);
    expect(plan.addedPeriods).toBe(1);
    expect(plan.addedNotes).toBe(1);
    expect(plan.skipped).toBe(0);
  });
  it('is safe to run twice', () => {
    const incoming: BackupData = { periods: [period('p1', '2026-09-01')], daily_logs: [log('l1', '2026-09-02')], settings: [{ key: 'k', value: 'v', updated_at: T1 }] };
    const second = planImport(incoming, incoming);
    expect(second.periods.insert).toHaveLength(0);
    expect(second.periods.update).toHaveLength(0);
    expect(second.daily_logs.insert).toHaveLength(0);
    expect(second.settings.upsert).toHaveLength(0);
    expect(second.addedPeriods).toBe(0);
  });
  it('keeps the newer version of the same row', () => {
    const existing: BackupData = { ...empty(), periods: [period('p1', '2026-09-01', null, T1)] };
    const newer: BackupData = { ...empty(), periods: [period('p1', '2026-09-01', '2026-09-05', T2)] };
    expect(planImport(existing, newer).periods.update).toHaveLength(1);
    expect(planImport(newer, existing).periods.update).toHaveLength(0);
  });
  it('does not add a second period with the same start date', () => {
    const existing: BackupData = { ...empty(), periods: [period('p1', '2026-09-01')] };
    const incoming: BackupData = { ...empty(), periods: [period('other-id', '2026-09-01')] };
    const plan = planImport(existing, incoming);
    expect(plan.periods.insert).toHaveLength(0);
    expect(plan.skipped).toBe(1);
  });
  it('passes on deletions that are newer', () => {
    const existing: BackupData = { ...empty(), periods: [period('p1', '2026-09-01', null, T1)] };
    const incoming: BackupData = { ...empty(), periods: [period('p1', '2026-09-01', null, T2, T2)] };
    expect(planImport(existing, incoming).periods.update[0].deleted_at).toBe(T2);
  });
  it('does not announce deleted rows as added', () => {
    const incoming: BackupData = { ...empty(), periods: [period('p1', '2026-09-01', null, T1, T1)] };
    const plan = planImport(empty(), incoming);
    expect(plan.periods.insert).toHaveLength(1);
    expect(plan.addedPeriods).toBe(0);
  });
  it('does not undelete into a clash', () => {
    const existing: BackupData = { ...empty(), periods: [period('p1', '2026-09-01', null, T1, T1), period('p2', '2026-09-01', null, T1)] };
    const incoming: BackupData = { ...empty(), periods: [period('p1', '2026-09-01', null, T3, null)] };
    expect(planImport(existing, incoming).periods.update).toHaveLength(0);
  });
  it('one note per day', () => {
    const existing: BackupData = { ...empty(), daily_logs: [log('l1', '2026-09-02')] };
    const incoming: BackupData = { ...empty(), daily_logs: [log('l9', '2026-09-02', 'different')] };
    expect(planImport(existing, incoming).daily_logs.insert).toHaveLength(0);
  });
  it('settings: newer wins', () => {
    const existing: BackupData = { ...empty(), settings: [{ key: 'display_name', value: 'A', updated_at: T2 }] };
    const incoming: BackupData = { ...empty(), settings: [{ key: 'display_name', value: 'B', updated_at: T1 }] };
    expect(planImport(existing, incoming).settings.upsert).toHaveLength(0);
    expect(planImport(incoming, existing).settings.upsert).toHaveLength(1);
  });
});

describe('periodsToCsv', () => {
  it('writes one plain row per period with cycle length', () => {
    const csv = periodsToCsv([
      { id: 'b', startDate: '2026-09-29', endDate: null, note: null },
      { id: 'a', startDate: '2026-09-01', endDate: '2026-09-05', note: 'felt "tired", rested' },
    ]);
    expect(csv.split('\n')).toEqual([
      'Period started,Period ended,Period length (days),Cycle length (days),Note',
      '2026-09-01,2026-09-05,5,28,"felt ""tired"", rested"',
      '2026-09-29,,,,',
      '',
    ]);
  });
});
