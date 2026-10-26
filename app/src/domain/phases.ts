import type { CycleRules } from '../config/cycleRules';
import { cycleStats, isRegular, sortPeriods } from './cycles';
import { addDays, diffDays, type DateStr } from './dates';
import { predictNextPeriod } from './prediction';
import type { Period, Phase } from './types';

export interface DayInfo {
  date: DateStr;
  /** Day of the cycle (1 = first day of the period); null before her first logged period. */
  cycleDay: number | null;
  /** null when there is not enough data to place this day. */
  phase: Phase | null;
  /** Estimated higher-fertility days around ovulation. */
  isFertileWindow: boolean;
  isOvulationDay: boolean;
  /** Estimate only; shown only when cycles are regular. Never contraception advice. */
  isLowerFertility: boolean;
  /** Inside the predicted range for a period that has not started yet. */
  isPredictedPeriod: boolean;
  /** Days past the end of the predicted range with no new period logged. */
  daysLate: number;
  /** Menstrual days that she logged are facts; everything else is an estimate. */
  isEstimate: boolean;
}

function emptyInfo(date: DateStr, cycleDay: number | null): DayInfo {
  return {
    date,
    cycleDay,
    phase: null,
    isFertileWindow: false,
    isOvulationDay: false,
    isLowerFertility: false,
    isPredictedPeriod: false,
    daysLate: 0,
    isEstimate: true,
  };
}

/**
 * Works out where a date falls in her cycle. Everything is derived from the
 * logged periods: nothing here is stored.
 */
export function getDayInfo(date: DateStr, periods: Period[], rules: CycleRules): DayInfo {
  const sorted = sortPeriods(periods);
  let index = -1;
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].startDate <= date) index = i;
  }
  if (index === -1) return emptyInfo(date, null);

  const current = sorted[index];
  const info = emptyInfo(date, diffDays(current.startDate, date) + 1);
  const periodEnd = current.endDate ?? addDays(current.startDate, rules.period.assumedLengthDays - 1);
  const inPeriod = date <= periodEnd;

  const next = sorted[index + 1];
  const prediction = next ? null : predictNextPeriod(sorted, rules);
  const nextStart = next ? next.startDate : prediction ? prediction.expectedStart : null;

  if (inPeriod) {
    info.phase = 'menstrual';
    info.isEstimate = false;
  }

  if (nextStart === null) return info;

  const ovulationDay = addDays(nextStart, -rules.ovulation.lutealPhaseDays);
  const ovulationStart = addDays(ovulationDay, -rules.ovulation.phaseDaysBefore);
  const ovulationEnd = addDays(ovulationDay, rules.ovulation.phaseDaysAfter);

  if (!inPeriod) {
    if (date < ovulationStart) info.phase = 'follicular';
    else if (date <= ovulationEnd) info.phase = 'ovulation';
    else info.phase = 'luteal';
  }

  const fertileStart = addDays(ovulationDay, -rules.fertileWindow.daysBeforeOvulation);
  const fertileEnd = addDays(ovulationDay, rules.fertileWindow.daysAfterOvulation);
  info.isFertileWindow = date >= fertileStart && date <= fertileEnd;
  info.isOvulationDay = date === ovulationDay;

  const regular = isRegular(cycleStats(sorted, rules), rules);
  const buffer = rules.lowerFertility.bufferDays;
  const outsideFertile = date < addDays(fertileStart, -buffer) || date > addDays(fertileEnd, buffer);
  info.isLowerFertility = outsideFertile && (regular || !rules.lowerFertility.requireRegularCycles);

  if (prediction) {
    const predictedEnd = addDays(prediction.earliestStart, rules.period.assumedLengthDays - 1 + (diffDays(prediction.earliestStart, prediction.latestStart)));
    info.isPredictedPeriod = date >= prediction.earliestStart && date <= predictedEnd;
    if (date > prediction.latestStart) info.daysLate = diffDays(prediction.latestStart, date);
  }

  return info;
}
