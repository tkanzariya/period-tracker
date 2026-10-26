import type { SQLiteDatabase } from 'expo-sqlite';

/**
 * Numbered, append-only migrations. The schema version is stored in SQLite's
 * `PRAGMA user_version`. Never edit a released migration; add a new one.
 *
 * Portability rules (docs/context/tech-decisions.md): UUID text ids, calendar
 * days as YYYY-MM-DD text, UTC ISO timestamps, created_at / updated_at /
 * deleted_at on every entity table, Postgres-friendly column types.
 */
const MIGRATIONS: string[] = [
  // v1: Phase 1 tables
  `
  CREATE TABLE periods (
    id TEXT PRIMARY KEY NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT,
    note TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
  );
  CREATE UNIQUE INDEX periods_start_date_active ON periods (start_date) WHERE deleted_at IS NULL;

  CREATE TABLE daily_logs (
    id TEXT PRIMARY KEY NOT NULL,
    date TEXT NOT NULL,
    flow TEXT,
    note TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
  );
  CREATE UNIQUE INDEX daily_logs_date_active ON daily_logs (date) WHERE deleted_at IS NULL;

  CREATE TABLE settings (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  `,
  // v2: the flow-level feature was dropped (decision 2026-10-27); daily logs keep notes only.
  `
  ALTER TABLE daily_logs DROP COLUMN flow;
  `,
];

export const SCHEMA_VERSION = MIGRATIONS.length;

export async function migrateDatabase(db: SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const current = row?.user_version ?? 0;
  if (current > SCHEMA_VERSION) {
    throw new Error(`Database schema v${current} is newer than this app (v${SCHEMA_VERSION}). Update the app.`);
  }
  for (let version = current; version < SCHEMA_VERSION; version++) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(MIGRATIONS[version]);
      await db.execAsync(`PRAGMA user_version = ${version + 1}`);
    });
  }
}
