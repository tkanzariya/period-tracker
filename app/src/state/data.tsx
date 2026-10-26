import { useSQLiteContext } from 'expo-sqlite';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { DEFAULT_CYCLE_RULES, type CycleRules } from '../config/cycleRules';
import {
  addPeriod,
  deleteDailyNote,
  getSetting,
  listDailyLogs,
  listPeriods,
  saveDailyNote,
  setSetting,
  updatePeriod,
} from '../db/repository';
import { todayLocal, type DateStr } from '../domain/dates';
import { findOpenPeriod, validatePeriodStart, type LogError } from '../domain/logging';
import type { DailyLog, Period } from '../domain/types';

type Result = { ok: true } | { ok: false; error: LogError };

interface DataValue {
  periods: Period[];
  notes: DailyLog[];
  /** What she likes to be called; null until she tells the app. */
  name: string | null;
  rules: CycleRules;
  loading: boolean;
  saveName(name: string): Promise<void>;
  periodStarted(date: DateStr, note: string | null): Promise<Result>;
  periodEnded(date: DateStr, note: string | null): Promise<Result>;
  saveNote(date: DateStr, note: string): Promise<Result>;
  removeNote(date: DateStr): Promise<void>;
}

const DataContext = createContext<DataValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const [periods, setPeriods] = useState<Period[]>([]);
  const [notes, setNotes] = useState<DailyLog[]>([]);
  const [name, setName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const rules = DEFAULT_CYCLE_RULES;

  const reload = useCallback(async () => {
    const [p, n, savedName] = await Promise.all([listPeriods(db), listDailyLogs(db), getSetting(db, 'display_name')]);
    setPeriods(p);
    setNotes(n);
    setName(savedName);
    setLoading(false);
  }, [db]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const value = useMemo<DataValue>(
    () => ({
      periods,
      notes,
      name,
      rules,
      loading,
      async saveName(newName) {
        await setSetting(db, 'display_name', newName.trim());
        await reload();
      },
      async periodStarted(date, note) {
        const error = validatePeriodStart(date, periods, todayLocal(), rules);
        if (error) return { ok: false, error };
        await addPeriod(db, date);
        if (note) await saveDailyNote(db, date, note);
        await reload();
        return { ok: true };
      },
      async periodEnded(date, note) {
        if (date > todayLocal()) return { ok: false, error: 'future_date' };
        const open = findOpenPeriod(date, periods);
        if (!open) return { ok: false, error: 'no_open_period' };
        await updatePeriod(db, open.id, { endDate: date });
        if (note) await saveDailyNote(db, date, note);
        await reload();
        return { ok: true };
      },
      async saveNote(date, note) {
        if (date > todayLocal()) return { ok: false, error: 'future_date' };
        await saveDailyNote(db, date, note.trim() || null);
        await reload();
        return { ok: true };
      },
      async removeNote(date) {
        await deleteDailyNote(db, date);
        await reload();
      },
    }),
    [db, periods, notes, name, rules, loading, reload],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataValue {
  const value = useContext(DataContext);
  if (!value) throw new Error('useData must be used inside DataProvider');
  return value;
}
