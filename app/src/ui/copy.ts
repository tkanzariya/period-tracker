/**
 * Every word the app says lives here, so the wording can be reviewed and
 * improved in one place. Rules for writing here:
 *  - Short sentences, simple everyday words (someone with basic English should understand).
 *  - Friendly and personal, never technical. No "log", "phase", "cycle day".
 *  - Guesses are called guesses. Never alarming, never a diagnosis.
 * Anything about health is NEEDS DRASHTI REVIEW (it is printed in the review sheet).
 */
import type { CycleRules } from '../config/cycleRules';
import type { FlagCode, IrregularityFlag } from '../domain/flags';
import type { Phase } from '../domain/types';

export const PHASE_LABEL: Record<Phase, string> = {
  menstrual: 'Menstrual',
  follicular: 'Follicular',
  ovulation: 'Ovulation',
  luteal: 'Luteal',
};

/** One plain line under the phase name. */
export const PHASE_MEANING: Record<Phase, string> = {
  menstrual: 'Your period days',
  follicular: 'Your body is getting ready to release an egg',
  ovulation: 'An egg may be released around now (this is a guess)',
  luteal: 'Your body is waiting for your next period',
};

/** What the guide says for each phase. */
export const PHASE_GUIDE: Record<Phase, string> = {
  menstrual: 'Your period is here. Be kind to yourself today.',
  follicular: 'Your body is getting ready for ovulation. Many women feel more energetic now.',
  ovulation: 'Ovulation is likely around now. This is only my best guess.',
  luteal: 'Your next period is getting closer. Some women feel tired or moody around now. That is normal.',
};

export const DISCLAIMER =
  "These are only guesses to help you understand your body. This app can't tell you if something is wrong, and it can't stop you getting pregnant. If you are worried, please talk to your doctor.";

export const TAB_NAMES = { today: 'Today', calendar: 'Calendar', cycles: 'My cycles', settings: 'Settings' } as const;

export type GuideSituation =
  | { kind: 'ask_name' }
  | { kind: 'ask_first_period' }
  | { kind: 'period_going_on' }
  | { kind: 'still_learning' }
  | { kind: 'phase'; phase: Phase }
  | { kind: 'late'; days: number };

/** The guide's speech bubble. `name` is what she asked to be called. */
export function guideMessage(situation: GuideSituation, name: string | null): string {
  const hi = name ? `Hi ${name}!` : 'Hi!';
  switch (situation.kind) {
    case 'ask_name':
      return `${hi} I'm here to help you understand your body. What should I call you?`;
    case 'ask_first_period':
      return `${hi} Tell me the day your last period started. I will learn from it.`;
    case 'period_going_on':
      return `Your period is here${name ? `, ${name}` : ''}. Be kind to yourself today. Tell me when it ends.`;
    case 'still_learning':
      return `I am still learning about you${name ? `, ${name}` : ''}. Tell me when your next period starts and I will get better at guessing.`;
    case 'phase':
      return PHASE_GUIDE[situation.phase];
    case 'late':
      return `Your period is a little late. This can happen. If you are worried, please talk to your doctor.`;
  }
}

export const TELL_DOCTOR_TITLE = 'You may want to tell your doctor';

export function flagMessage(flag: IrregularityFlag, rules: CycleRules): string {
  const days = (n: number) => `${n} ${n === 1 ? 'day' : 'days'}`;
  const messages: Record<FlagCode, string> = {
    cycle_short: `Your last cycle was ${days(flag.value)}. Most cycles are between ${rules.cycle.normalMinDays} and ${rules.cycle.normalMaxDays} days.`,
    cycle_long: `Your last cycle was ${days(flag.value)}. Most cycles are between ${rules.cycle.normalMinDays} and ${rules.cycle.normalMaxDays} days.`,
    cycle_variation: `Your cycles are not always the same length. They changed by ${days(flag.value)} from the shortest to the longest.`,
    period_long: `Your last period lasted ${days(flag.value)}. Most periods last up to ${rules.period.normalMaxDays} days.`,
    period_late: `Your period is ${days(flag.value)} later than I guessed.`,
  };
  return messages[flag.code];
}

export const LOG_ERROR: Record<string, string> = {
  future_date: "That day hasn't come yet. Please pick today or an earlier day.",
  inside_period: 'You already told me about a period on that day.',
  no_open_period: "I can't see a period that was still going on that day.",
};

export const STR = {
  hiName: (name: string | null) => (name ? `Hi, ${name}` : 'Hi'),
  yourName: 'Your name',
  nameHint: 'For example: Drashti',
  continue: 'Continue',
  tellLastPeriod: 'My last period started on…',
  periodStarted: 'My period started',
  periodEnded: 'My period ended',
  justNote: 'Just a note',
  addNote: 'Add a note',
  dayOfCycle: (day: number) => `Day ${day}`,
  ofYourCycle: 'of your cycle',
  dayOfCycleSub: 'Day 1 is the first day of your period.',
  nextPeriodTitle: 'Your next period',
  nextPeriodRange: (range: string) => `Likely between ${range}`,
  nextPeriodBasis: (cycles: number, avg: number) =>
    `I looked at your last ${cycles} ${cycles === 1 ? 'cycle' : 'cycles'}. They were about ${avg} days long.`,
  stillLearningTitle: 'I am still learning',
  stillLearningBody: (more: number) =>
    `Tell me when your next ${more === 1 ? 'period starts' : `${more} periods start`} and I will be able to guess when the following one comes.`,
  ovulationAround: (date: string) => `Ovulation is likely around ${date} (a guess)`,
  // Log screen
  logTitle: 'Tell me',
  logQuestion: 'What would you like to tell me?',
  whichDay: 'Which day?',
  today: 'Today',
  yesterday: 'Yesterday',
  noteLabel: 'Want to write something? (optional)',
  notePlaceholder: 'Write here…',
  save: 'Save',
  removeNote: 'Remove my note for this day',
  removeNoteTitle: 'Remove this note?',
  removeNoteBody: (day: string) => `Your note for ${day} will be removed.`,
  cancel: 'Cancel',
  remove: 'Remove',
  cantSaveTitle: "I can't save that",
  somethingWrong: 'Something went wrong. Please try again.',
  // placeholders
  comingSoon: 'Coming soon',
} as const;
