import Constants from 'expo-constants';
import { useSQLiteContext } from 'expo-sqlite';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';
import { AGE_GROUPS, rulesForAge, type AgeGroup, type CycleRules } from '../config/cycleRules';
import { exportBackupText, restoreBackupText, type RestoreResult } from '../db/backup';
import {
  addPeriod,
  deleteDailyNote,
  deletePeriod,
  getSetting,
  listDailyLogs,
  listPeriods,
  restorePeriod,
  saveDailyNote,
  setSetting,
  updatePeriod,
} from '../db/repository';
import { periodsToCsv } from '../domain/backup';
import { cleanBleedingMarks } from '../domain/cycles';
import { addDays, diffDays, todayLocal, type DateStr } from '../domain/dates';
import type { DailyLog, Period } from '../domain/types';
import { checkHistory, checkNote, checkPeriodEdit, checkPeriodStart, type HistoryEntry, type Issue } from '../domain/validation';

export const APP_VERSION = Constants.expoConfig?.version ?? '0.1.0';

/**
 * What an action gives back:
 *  - ok: it was saved; `undo` puts everything back (shown as a toast with Undo)
 *  - issue: it cannot be saved as it is ('block') or needs a "is that right?" first ('confirm')
 *  - failed: the phone could not store it (for example it is full)
 */
export type ActionResult = { ok: true; undo: () => Promise<void> } | { ok: false; issue: Issue } | { ok: false; failed: true };

interface Options {
  /** She has already said "yes, that is right" to a 'confirm' issue. */
  confirmed?: boolean;
}

interface DataValue {
  periods: Period[];
  notes: DailyLog[];
  /** What she likes to be called; null until she tells the app. */
  name: string | null;
  /** The rules for her age group (adult until she says otherwise). */
  rules: CycleRules;
  /** The age group she picked; null when she has not (or skipped). */
  ageGroup: AgeGroup | null;
  loading: boolean;
  /** The welcome (hello, privacy, name, last period) has been done, or she already uses the app. */
  welcomeDone: boolean;
  tourSeen: boolean;
  saveName(name: string): Promise<void>;
  saveAgeGroup(group: AgeGroup | null): Promise<void>;
  markWelcomeDone(): Promise<void>;
  markTourSeen(): Promise<void>;
  periodStarted(date: DateStr, note: string | null, options?: Options): Promise<ActionResult>;
  /** Add several earlier cycles at once (the day each started). One Undo removes them all. */
  addHistory(entries: HistoryEntry[], options?: Options): Promise<ActionResult>;
  saveNote(date: DateStr, note: string): Promise<ActionResult>;
  removeNote(date: DateStr): Promise<ActionResult>;
  /** `bleedingDays`: how long the bleeding lasted (optional mark); null or left out = not marked (5 days are drawn). */
  changePeriod(id: string, startDate: DateStr, options?: Options & { bleedingDays?: number | null }): Promise<ActionResult>;
  removePeriod(id: string): Promise<ActionResult>;
  backupText(): Promise<string>;
  csvText(): string;
  restoreFromText(text: string): Promise<RestoreResult>;
}

const DataContext = createContext<DataValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const [periods, setPeriods] = useState<Period[]>([]);
  const [notes, setNotes] = useState<DailyLog[]>([]);
  const [name, setName] = useState<string | null>(null);
  const [ageGroup, setAgeGroup] = useState<AgeGroup | null>(null);
  const [welcomeFlag, setWelcomeFlag] = useState(false);
  const [tourSeen, setTourSeen] = useState(false);
  const [loading, setLoading] = useState(true);
  const rules = useMemo(() => rulesForAge(ageGroup), [ageGroup]);

  const reload = useCallback(async () => {
    const [p, n, savedName, welcome, tour, age] = await Promise.all([
      listPeriods(db),
      listDailyLogs(db),
      getSetting(db, 'display_name'),
      getSetting(db, 'welcome_done'),
      getSetting(db, 'tour_seen'),
      getSetting(db, 'age_group'),
    ]);
    // There is no "period end": a saved end date is only a mark of how many days the bleeding lasted, and is
    // ignored when it makes no sense (too long, or reaching the next period, as older test builds could save).
    setPeriods(cleanBleedingMarks(p, rulesForAge(null)));
    setNotes(n);
    setName(savedName);
    setAgeGroup(AGE_GROUPS.find((g) => g === age) ?? null);
    setWelcomeFlag(welcome === '1');
    setTourSeen(tour === '1');
    setLoading(false);
  }, [db]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const value = useMemo<DataValue>(() => {
    const failed: ActionResult = { ok: false, failed: true };
    /** Runs a change, reloads, and turns a storage problem into `failed`. */
    const run = async (work: () => Promise<() => Promise<void>>): Promise<ActionResult> => {
      try {
        const undoWork = await work();
        await reload();
        return {
          ok: true,
          undo: async () => {
            try {
              await undoWork();
            } finally {
              await reload();
            }
          },
        };
      } catch {
        return failed;
      }
    };
    const noteOn = (date: DateStr) => notes.find((n) => n.date === date)?.note ?? null;

    return {
      periods,
      notes,
      name,
      rules,
      ageGroup,
      loading,
      // Anyone who already has a name or periods has long since been welcomed.
      welcomeDone: welcomeFlag || name !== null || periods.length > 0,
      tourSeen,
      async saveName(newName) {
        await setSetting(db, 'display_name', newName.trim());
        await reload();
      },
      async saveAgeGroup(group) {
        await setSetting(db, 'age_group', group ?? '');
        await reload();
      },
      async markWelcomeDone() {
        await setSetting(db, 'welcome_done', '1');
        await reload();
      },
      async markTourSeen() {
        await setSetting(db, 'tour_seen', '1');
        await reload();
      },

      async periodStarted(date, note, options) {
        const issue = checkPeriodStart(date, periods, todayLocal(), rules);
        if (issue && (issue.severity === 'block' || !options?.confirmed)) return { ok: false, issue };
        const before = noteOn(date);
        return run(async () => {
          const created = await addPeriod(db, date);
          if (note) await saveDailyNote(db, date, note);
          return async () => {
            await deletePeriod(db, created.id);
            if (note) {
              if (before) await saveDailyNote(db, date, before);
              else await deleteDailyNote(db, date);
            }
          };
        });
      },

      async addHistory(entries, options) {
        const found = checkHistory(entries, periods, todayLocal(), rules);
        const stop = found.find((f) => f.issue.severity === 'block') ?? (options?.confirmed ? undefined : found[0]);
        if (stop) return { ok: false, issue: stop.issue };
        return run(async () => {
          const created: string[] = [];
          for (const entry of [...entries].sort((a, b) => (a.start < b.start ? -1 : 1))) {
            created.push((await addPeriod(db, entry.start, null)).id);
          }
          return async () => {
            for (const id of created) await deletePeriod(db, id);
          };
        });
      },

      async saveNote(date, text) {
        const issue = checkNote(date, text, todayLocal());
        if (issue) return { ok: false, issue };
        const before = noteOn(date);
        return run(async () => {
          await saveDailyNote(db, date, text.trim());
          return async () => {
            if (before) await saveDailyNote(db, date, before);
            else await deleteDailyNote(db, date);
          };
        });
      },

      async removeNote(date) {
        const before = noteOn(date);
        return run(async () => {
          await deleteDailyNote(db, date);
          return async () => {
            if (before) await saveDailyNote(db, date, before);
          };
        });
      },

      async changePeriod(id, startDate, options) {
        const issue = checkPeriodEdit(id, startDate, periods, todayLocal(), rules);
        if (issue && (issue.severity === 'block' || !options?.confirmed)) return { ok: false, issue };
        const old = periods.find((p) => p.id === id);
        if (!old) return failed;
        const days = options?.bleedingDays;
        const endDate = days === undefined ? (old.endDate ? addDays(startDate, diffDays(old.startDate, old.endDate)) : null) : days ? addDays(startDate, days - 1) : null;
        return run(async () => {
          await updatePeriod(db, id, { startDate, endDate });
          return async () => {
            await updatePeriod(db, id, { startDate: old.startDate, endDate: old.endDate });
          };
        });
      },

      async removePeriod(id) {
        return run(async () => {
          await deletePeriod(db, id);
          return async () => {
            await restorePeriod(db, id);
          };
        });
      },

      backupText: () => exportBackupText(db, APP_VERSION),
      csvText: () => periodsToCsv(periods),
      async restoreFromText(text) {
        const result = await restoreBackupText(db, text);
        await reload();
        return result;
      },
    };
  }, [db, periods, notes, name, rules, ageGroup, loading, welcomeFlag, tourSeen, reload]);

  // Developer helper for the browser preview only: lets a test script load a backup file's text.
  useEffect(() => {
    if (__DEV__ && Platform.OS === 'web') {
      (globalThis as unknown as { __cycleSaathi?: unknown }).__cycleSaathi = { restore: (text: string) => value.restoreFromText(text) };
    }
  }, [value]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataValue {
  const value = useContext(DataContext);
  if (!value) throw new Error('useData must be used inside DataProvider');
  return value;
}
