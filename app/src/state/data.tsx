import { useSQLiteContext } from 'expo-sqlite';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { DEFAULT_CYCLE_RULES, type CycleRules } from '../config/cycleRules';
import {
  addPeriod,
  deleteDailyLog,
  listDailyLogs,
  listPeriods,
  saveDailyLog,
  updatePeriod,
} from '../db/repository';
import { todayLocal, type DateStr } from '../domain/dates';
import { findOpenPeriod, validatePeriodStart, type LogError } from '../domain/logging';
import type { DailyLog, FlowLevel, Period } from '../domain/types';

type Result = { ok: true } | { ok: false; error: LogError };

interface DataValue {
  periods: Period[];
  logs: DailyLog[];
  rules: CycleRules;
  loading: boolean;
  logPeriodStart(date: DateStr, flow: FlowLevel | null, note: string | null): Promise<Result>;
  logPeriodEnd(date: DateStr, note: string | null): Promise<Result>;
  logFlow(date: DateStr, flow: FlowLevel | null, note: string | null): Promise<Result>;
  removeFlowLog(date: DateStr): Promise<void>;
}

const DataContext = createContext<DataValue | null>(null);

export function DataProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const [periods, setPeriods] = useState<Period[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const rules = DEFAULT_CYCLE_RULES;

  const reload = useCallback(async () => {
    const [p, l] = await Promise.all([listPeriods(db), listDailyLogs(db)]);
    setPeriods(p);
    setLogs(l);
    setLoading(false);
  }, [db]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const value = useMemo<DataValue>(
    () => ({
      periods,
      logs,
      rules,
      loading,
      async logPeriodStart(date, flow, note) {
        const error = validatePeriodStart(date, periods, todayLocal(), rules);
        if (error) return { ok: false, error };
        await addPeriod(db, date);
        if (flow || note) await saveDailyLog(db, date, { flow, note });
        await reload();
        return { ok: true };
      },
      async logPeriodEnd(date, note) {
        if (date > todayLocal()) return { ok: false, error: 'future_date' };
        const open = findOpenPeriod(date, periods);
        if (!open) return { ok: false, error: 'no_open_period' };
        await updatePeriod(db, open.id, { endDate: date, ...(note ? { note } : {}) });
        await reload();
        return { ok: true };
      },
      async logFlow(date, flow, note) {
        if (date > todayLocal()) return { ok: false, error: 'future_date' };
        await saveDailyLog(db, date, { flow, note });
        await reload();
        return { ok: true };
      },
      async removeFlowLog(date) {
        await deleteDailyLog(db, date);
        await reload();
      },
    }),
    [db, periods, logs, rules, loading, reload],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataValue {
  const value = useContext(DataContext);
  if (!value) throw new Error('useData must be used inside DataProvider');
  return value;
}
