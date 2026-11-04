import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import type { DateStr } from '../domain/dates';
import { ChangePeriodSheet } from '../ui/ChangePeriodSheet';
import { TellMeSheet, type TellMode } from '../ui/TellMeSheet';

interface SheetsValue {
  /** Open the "Tell me" sheet. With no arguments it picks what fits her stage right now. */
  openTell(options?: { mode?: TellMode; date?: DateStr }): void;
  openChange(periodId: string): void;
}

const SheetsContext = createContext<SheetsValue | null>(null);

/** Hosts the two bottom sheets once, so any screen can open them. */
export function SheetsProvider({ children }: { children: ReactNode }) {
  const [tell, setTell] = useState<{ open: boolean; mode?: TellMode; date?: DateStr }>({ open: false });
  const [changeId, setChangeId] = useState<string | null>(null);

  const openTell = useCallback((o?: { mode?: TellMode; date?: DateStr }) => setTell({ open: true, ...o }), []);
  const openChange = useCallback((id: string) => setChangeId(id), []);
  const value = useMemo(() => ({ openTell, openChange }), [openTell, openChange]);

  return (
    <SheetsContext.Provider value={value}>
      {children}
      <TellMeSheet visible={tell.open} mode={tell.mode} date={tell.date} onClose={() => setTell((t) => ({ ...t, open: false }))} onChangePeriod={openChange} />
      <ChangePeriodSheet periodId={changeId} onClose={() => setChangeId(null)} />
    </SheetsContext.Provider>
  );
}

export function useSheets(): SheetsValue {
  const v = useContext(SheetsContext);
  if (!v) throw new Error('useSheets must be used inside SheetsProvider');
  return v;
}
