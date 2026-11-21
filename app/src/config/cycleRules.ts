/**
 * Cycle rules: every number the prediction and phase logic uses lives here,
 * so they can be tuned (by Tirth, with Drashti's input) without touching logic.
 *
 * Defaults come from widely published ranges (ACOG-style adult norms; luteal
 * phase ~12-14 days; sperm survive up to ~5 days, egg ~12-24 hours).
 * They are estimates, not medical facts: every value is NEEDS DRASHTI REVIEW.
 * Later these can be overridden from the in-app settings table.
 */
/**
 * The age group she picks (or skips). It only changes how wide "normal" is and how long a silence lasts
 * before the app stops guessing; it is never a diagnosis. NEEDS DRASHTI REVIEW.
 *  - under20: periods are often irregular in the first years, cycles up to about 45 days are common
 *  - adult:   the default (also used when she skips the question)
 *  - over40:  cycles often change; longer gaps are common
 */
export type AgeGroup = 'under20' | 'adult' | 'over40';
export const AGE_GROUPS: AgeGroup[] = ['under20', 'adult', 'over40'];

export interface CycleRules {
  /** Which age group these rules were made for. */
  ageGroup: AgeGroup;
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
    /** The predicted range is never narrower than expected date ± this many days (until she has many cycles). */
    minRangeHalfWidthDays: number;
    /** With at least this many cycles of her own, the narrowest range may shrink to `minRangeHalfWidthManyDays`. */
    manyCycles: number;
    minRangeHalfWidthManyDays: number;
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
    /** A start more than this many days ago is not accepted (a typing slip, not a real memory). */
    maxStartAgeDays: number;
  };
  /** How the app talks when no new period has come when expected. */
  late: {
    /** Up to this many days after my guess it is "a few days late, this can happen"; after that the words go further. */
    fewDays: number;
  };
  /**
   * When no period has been told to the app for this many days since the last start, Today stops showing a
   * day number and a phase (they would be made up) and asks "did it come?" instead.
   */
  silence: {
    noPhaseAfterDays: number;
  };
  ovulation: {
    /** Ovulation is estimated this many days before the next period starts. */
    lutealPhaseDays: number;
    /** The "Ovulation" phase spans the ovulation day plus these days either side. */
    phaseDaysBefore: number;
    phaseDaysAfter: number;
    /** Hide ovulation, fertile days and the phases after bleeding for this age group (they vary too much to guess). */
    hideForUnder20: boolean;
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
  ageGroup: 'adult',
  cycle: { normalMinDays: 21, normalMaxDays: 35, maxVariationDays: 7 },
  period: { assumedLengthDays: 5 },
  prediction: {
    cyclesToAverage: 6,
    minCyclesForPrediction: 2,
    minRangeHalfWidthDays: 3,
    manyCycles: 6,
    minRangeHalfWidthManyDays: 2,
    typicalCycleLengthDays: 28,
    tentativeRangeHalfWidthDays: 3,
  },
  checks: { minDaysBetweenStarts: 15, longGapDays: 60, maxStartAgeDays: 365 },
  late: { fewDays: 7 },
  silence: { noPhaseAfterDays: 60 },
  ovulation: { lutealPhaseDays: 14, phaseDaysBefore: 1, phaseDaysAfter: 1, hideForUnder20: true },
  fertileWindow: { daysBeforeOvulation: 5, daysAfterOvulation: 1 },
  lowerFertility: { bufferDays: 2, requireRegularCycles: true },
};

/**
 * The rules for one age group, built from the defaults. Every number here is NEEDS DRASHTI REVIEW.
 *  - under20: normal up to 45 days; variation is expected, so the "cycles vary" note needs 20+ days; the app waits 90 days before it stops guessing
 *  - over40:  same cycle range as adults, but the app waits 90 days (gaps are common near menopause)
 */
export function rulesForAge(group: AgeGroup | null, base: CycleRules = DEFAULT_CYCLE_RULES): CycleRules {
  switch (group) {
    case 'under20':
      return { ...base, ageGroup: 'under20', cycle: { ...base.cycle, normalMaxDays: 45, maxVariationDays: 20 }, silence: { noPhaseAfterDays: 90 } };
    case 'over40':
      return { ...base, ageGroup: 'over40', silence: { noPhaseAfterDays: 90 } };
    default:
      return { ...base, ageGroup: 'adult' };
  }
}
