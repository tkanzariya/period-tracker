import type { DateStr } from './dates';

/** One bleeding episode. `endDate` is null while ongoing or not yet logged. */
export interface Period {
  id: string;
  startDate: DateStr;
  endDate: DateStr | null;
  note: string | null;
}

/** A note she wrote for one day. (Symptoms, mood etc. join this in Phase 2.) */
export interface DailyLog {
  id: string;
  date: DateStr;
  note: string | null;
}

export type Phase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
