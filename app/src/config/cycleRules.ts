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
    /**
     * There is no "period end" in the app: a cycle runs from one start to the next. This is only how many
     * days at the start of a cycle are drawn as the Bleeding phase (an estimate). NEEDS DRASHTI REVIEW.
     */
    assumedLengthDays: number;
  };
  prediction: {
    /** How many recent completed cycles feed the average. */
    cyclesToAverage: number;
    /** No prediction is shown below this many completed cycles. */
    minCyclesForPrediction: number;
    /** The predicted range is never narrower than expected date ± this many days. */
    minRangeHalfWidthDays: number;
    /**
     * Before enough cycles are logged, a typical cycle of this many days is used for a
     * TENTATIVE estimate (always shown as an estimate). 28 is the commonly quoted typical length.
     */
    typicalCycleLengthDays: number;
    /** A tentative next-period range is the typical date ± this many days. */
    tentativeRangeHalfWidthDays: number;
  };
  /** Gentle checks on what she tells the app (never about her health, only about the entry itself). */
  checks: {
    /** A new period starting fewer than this many days after another one started asks "is this a new period?". */
    minDaysBetweenStarts: number;
    /** A start more than this many days after (or before) another start asks "is that right?" (a missed cycle can be real). */
    longGapDays: number;
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
  period: { assumedLengthDays: 5 },
  prediction: {
    cyclesToAverage: 6,
    minCyclesForPrediction: 2,
    minRangeHalfWidthDays: 1,
    typicalCycleLengthDays: 28,
    tentativeRangeHalfWidthDays: 3,
  },
  checks: { minDaysBetweenStarts: 15, longGapDays: 60, },
  ovulation: { lutealPhaseDays: 14, phaseDaysBefore: 1, phaseDaysAfter: 1 },
  fertileWindow: { daysBeforeOvulation: 5, daysAfterOvulation: 1 },
  lowerFertility: { bufferDays: 2, requireRegularCycles: true },
};
