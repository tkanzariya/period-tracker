import { useSQLiteContext } from 'expo-sqlite';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { getSetting, setSetting } from '../db/repository';
import { todayLocal, type DateStr } from '../domain/dates';
import { DEFAULT_REMINDER_PREFS, planReminders, REMINDER_HOUR, REMINDER_KINDS, type ReminderKind } from '../domain/reminders';
import { cancelAll, getPermission, requestPermission, scheduleAll, type Permission } from '../platform/notifications';
import { useData } from './data';
import { useLanguage } from './language';

interface RemindersValue {
  /** The master switch. */
  enabled: boolean;
  prefs: Record<ReminderKind, boolean>;
  /** Lock-screen text shows the details (off by default: only "A note from your Saathi"). */
  showDetails: boolean;
  /** She has been asked once whether she wants reminders (so Today stops offering). */
  asked: boolean;
  permission: Permission;
  lastBackup: DateStr | null;
  /** Turns reminders on (asks the phone's permission) or off. Returns 'blocked' if the phone said no. */
  setEnabled(on: boolean): Promise<'ok' | 'blocked'>;
  setKind(kind: ReminderKind, on: boolean): Promise<void>;
  setShowDetails(on: boolean): Promise<void>;
  markAsked(): Promise<void>;
  markBackupSaved(): Promise<void>;
}

const RemindersContext = createContext<RemindersValue | null>(null);

/** Keeps reminder choices and re-plans the phone's reminders every time her information or choices change. */
export function RemindersProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const { periods, notes, rules, loading } = useData();
  const { S } = useLanguage();
  const [enabled, setEnabledState] = useState(false);
  const [prefs, setPrefs] = useState(DEFAULT_REMINDER_PREFS);
  const [showDetails, setShowDetailsState] = useState(false);
  const [asked, setAsked] = useState(false);
  const [permission, setPermission] = useState<Permission>('undetermined');
  const [lastBackup, setLastBackup] = useState<DateStr | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void (async () => {
      const [on, details, askedFlag, backup, ...kinds] = await Promise.all([
        getSetting(db, 'notif_enabled'),
        getSetting(db, 'notif_details'),
        getSetting(db, 'notif_asked'),
        getSetting(db, 'last_backup_at'),
        ...REMINDER_KINDS.map((k) => getSetting(db, `notif_k_${k}`)),
      ]);
      setEnabledState(on === '1');
      setShowDetailsState(details === '1');
      setAsked(askedFlag === '1');
      setLastBackup(backup);
      setPrefs(Object.fromEntries(REMINDER_KINDS.map((k, i) => [k, kinds[i] !== '0'])) as Record<ReminderKind, boolean>);
      setPermission(await getPermission().catch(() => 'undetermined' as Permission));
      setLoaded(true);
    })();
  }, [db]);

  // Re-plan whenever anything that matters changes.
  useEffect(() => {
    if (!loaded || loading) return;
    void (async () => {
      try {
        if (!enabled || permission !== 'granted') {
          await cancelAll();
          return;
        }
        const now = new Date();
        const plan = planReminders({
          periods,
          notes,
          today: todayLocal(now),
          todayStillOpen: now.getHours() < REMINDER_HOUR,
          prefs,
          lastBackup,
          rules,
        });
        await scheduleAll(
          S.notify.channel,
          plan.map((r) => {
            const [y, m, d] = r.date.split('-').map(Number);
            const text = showDetails ? S.notify.details[r.kind] : { title: S.notify.discreetTitle, body: S.notify.discreetBody };
            return { title: text.title, body: text.body, at: new Date(y, m - 1, d, REMINDER_HOUR, 0, 0), kind: r.kind };
          }),
        );
      } catch {
        // Reminders are a convenience: never let them break the app.
      }
    })();
  }, [loaded, loading, enabled, permission, prefs, showDetails, lastBackup, periods, notes, rules, S]);

  const value = useMemo<RemindersValue>(
    () => ({
      enabled,
      prefs,
      showDetails,
      asked,
      permission,
      lastBackup,
      async setEnabled(on) {
        if (on) {
          const result = await requestPermission(S.notify.channel);
          setPermission(result);
          if (result !== 'granted') return 'blocked';
        }
        setEnabledState(on);
        await setSetting(db, 'notif_enabled', on ? '1' : '0');
        return 'ok';
      },
      async setKind(kind, on) {
        setPrefs((p) => ({ ...p, [kind]: on }));
        await setSetting(db, `notif_k_${kind}`, on ? '1' : '0');
      },
      async setShowDetails(on) {
        setShowDetailsState(on);
        await setSetting(db, 'notif_details', on ? '1' : '0');
      },
      async markAsked() {
        setAsked(true);
        await setSetting(db, 'notif_asked', '1');
      },
      async markBackupSaved() {
        const today = todayLocal();
        setLastBackup(today);
        await setSetting(db, 'last_backup_at', today);
      },
    }),
    [db, enabled, prefs, showDetails, asked, permission, lastBackup, S],
  );

  return <RemindersContext.Provider value={value}>{children}</RemindersContext.Provider>;
}

export function useReminders(): RemindersValue {
  const v = useContext(RemindersContext);
  if (!v) throw new Error('useReminders must be used inside RemindersProvider');
  return v;
}

