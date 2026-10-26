import type { DateStr } from './dates';

/** One bleeding episode. `endDate` is null while ongoing or not yet logged. */
export interface Period {
  id: string;
  startDate: DateStr;
  endDate: DateStr | null;
  note: string | null;
}

export type FlowLevel = 'none' | 'spotting' | 'light' | 'medium' | 'heavy';
export const FLOW_LEVELS: FlowLevel[] = ['none', 'spotting', 'light', 'medium', 'heavy'];

export interface DailyLog {
  id: string;
  date: DateStr;
  flow: FlowLevel | null;
  note: string | null;
}

export type Phase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
