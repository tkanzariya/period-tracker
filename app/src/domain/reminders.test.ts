import { describe, expect, it } from 'vitest';
import { DEFAULT_CYCLE_RULES as rules } from '../config/cycleRules';
import { DEFAULT_REMINDER_PREFS, planReminders, type ReminderKind } from './reminders';
import type { Period } from './types';

const p = (startDate: string, endDate: string | null = null): Period => ({ id: startDate, startDate, endDate, note: null });
const base = { notes: [], todayStillOpen: false, prefs: DEFAULT_REMINDER_PREFS, lastBackup: '2026-10-20', rules };
const kinds = (list: { kind: ReminderKind }[]) => list.map((r) => r.kind);

// One period from 6 to 10 Oct: typical guess starts 3 Nov, range 31 Oct to 6 Nov.
const periods = [p('2026-10-06', '2026-10-10')];

describe('planning reminders', () => {
  it('nothing is planned before she has told the app anything except the monthly copy', () => {
    expect(kinds(planReminders({ ...base, periods: [], today: '2026-10-12', lastBackup: null }))).toEqual(['backup']);
  });

  it('N1: a heads-up two days before the earliest likely day', () => {
    const plan = planReminders({ ...base, periods, today: '2026-10-12' });
    expect(plan.find((r) => r.kind === 'coming')?.date).toBe('2026-10-29');
  });

  it('N2: "did it start?" every second day through the window', () => {
    const plan = planReminders({ ...base, periods, today: '2026-10-12' });
    expect(plan.filter((r) => r.kind === 'did_start').map((r) => r.date)).toEqual(['2026-10-31', '2026-11-02', '2026-11-04', '2026-11-06']);
  });

  it('N4: one "later than my guess" after the window closes', () => {
    const plan = planReminders({ ...base, periods, today: '2026-10-12' });
    expect(plan.find((r) => r.kind === 'late')?.date).toBe('2026-11-07');
  });

  it('N3: asks on day 5 and day 8 of a period that has no end', () => {
    const plan = planReminders({ ...base, periods: [p('2026-11-03')], today: '2026-11-04' });
    expect(plan.filter((r) => r.kind === 'did_end').map((r) => r.date)).toEqual(['2026-11-07', '2026-11-10']);
  });

  it('never more than one reminder a day, and the most useful one wins', () => {
    const plan = planReminders({ ...base, periods: [p('2026-11-01')], today: '2026-11-02' });
    const dates = plan.map((r) => r.date);
    expect(new Set(dates).size).toBe(dates.length);
  });

  it('N5: a copy reminder 30 days after the last one, or tomorrow if that has passed', () => {
    expect(planReminders({ ...base, periods, today: '2026-10-12', lastBackup: '2026-09-30' }).find((r) => r.kind === 'backup')?.date).toBe('2026-10-30');
    expect(planReminders({ ...base, periods: [], today: '2026-12-20', lastBackup: '2026-10-01' }).find((r) => r.kind === 'backup')?.date).toBe('2026-12-21');
  });

  it('N9: nudges after 40 days with nothing new', () => {
    const plan = planReminders({ ...base, periods, today: '2026-10-12', prefs: { ...DEFAULT_REMINDER_PREFS, did_start: false, coming: false, late: false } });
    expect(plan.find((r) => r.kind === 'quiet')?.date).toBe('2026-11-19');
  });

  it('a kind that is switched off is never planned', () => {
    const plan = planReminders({ ...base, periods, today: '2026-10-12', prefs: { ...DEFAULT_REMINDER_PREFS, coming: false } });
    expect(kinds(plan)).not.toContain('coming');
  });

  it('a reminder for today only counts while the morning time has not passed', () => {
    const early = planReminders({ ...base, periods, today: '2026-10-29', todayStillOpen: true });
    const late = planReminders({ ...base, periods, today: '2026-10-29', todayStillOpen: false });
    expect(early[0].date).toBe('2026-10-29');
    expect(late.find((r) => r.date === '2026-10-29')).toBeUndefined();
  });

  it('plans only the next 60 days', () => {
    const plan = planReminders({ ...base, periods, today: '2026-10-12' });
    expect(plan.every((r) => r.date <= '2026-12-11')).toBe(true);
  });
});
