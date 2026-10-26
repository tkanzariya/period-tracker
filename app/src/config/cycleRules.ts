/**
 * Cycle rules: every number the prediction and phase logic uses lives here,
 * so they can be tuned (by Tirth, with Drashti's input) without touching logic.
 *
 * Defaults come from widely published ranges (ACOG-style adult norms; luteal
 * phase ~12-14 days; sperm survive up to ~5 days, egg ~12-24 hours).
 * They are estimates, not medical facts: every value is NEEDS DRASHTI REVIEW.
 * Later these can be overridden from the in-app settings table.
 */
export interface CycleRules {
  cycle: {
    /** A completed cycle shorter than this is flagged as unusually short. */
    normalMinDays: number;
    /** A completed cycle longer than this is flagged as unusually long. */
    normalMaxDays: number;
    /** Flag when longest minus shortest recent cycle exceeds this many days. */
    maxVariationDays: number;
  };
  period: {
    /** Assumed length when she has not logged an end date. */
    assumedLengthDays: number;
    /** A period longer than this is flagged. */
    normalMaxDays: number;
  };
  prediction: {
    /** How many recent completed cycles feed the average. */
    cyclesToAverage: number;
    /** No prediction is shown below this many completed cycles. */
    minCyclesForPrediction: number;
  };
  ovulation: {
    /** Ovulation is estimated this many days before the next period starts. */
    lutealPhaseDays: number;
    /** The "Ovulation" phase spans the ovulation day plus these days either side. */
    phaseDaysBefore: number;
    phaseDaysAfter: number;
  };
  fertileWindow: {
    /** Higher-fertility days: this many days before ovulation... */
    daysBeforeOvulation: number;
    /** ...up to this many days after. */
    daysAfterOvulation: number;
  };
  lowerFertility: {
    /** Extra margin kept on each side of the fertile window before a day is called lower-fertility. */
    bufferDays: number;
    /** Only show lower-fertility days when cycles are regular (within maxVariationDays). */
    requireRegularCycles: boolean;
  };
}

export const DEFAULT_CYCLE_RULES: CycleRules = {
  cycle: { normalMinDays: 21, normalMaxDays: 35, maxVariationDays: 7 },
  period: { assumedLengthDays: 5, normalMaxDays: 7 },
  prediction: { cyclesToAverage: 6, minCyclesForPrediction: 2 },
  ovulation: { lutealPhaseDays: 14, phaseDaysBefore: 1, phaseDaysAfter: 1 },
  fertileWindow: { daysBeforeOvulation: 5, daysAfterOvulation: 1 },
  lowerFertility: { bufferDays: 2, requireRegularCycles: true },
};
