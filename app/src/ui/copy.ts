import type { FlowLevel, Phase } from '../domain/types';
import type { FlagCode, IrregularityFlag } from '../domain/flags';

export const PHASE_LABEL: Record<Phase, string> = {
  menstrual: 'Menstrual',
  follicular: 'Follicular',
  ovulation: 'Ovulation',
  luteal: 'Luteal',
};

export const FLOW_LABEL: Record<FlowLevel, string> = {
  none: 'None',
  spotting: 'Spotting',
  light: 'Light',
  medium: 'Medium',
  heavy: 'Heavy',
};

export const DISCLAIMER = 'Estimates only. Not medical advice, and not a method of contraception.';

/** Calm wording: observations worth mentioning to a doctor, never a diagnosis. */
export function flagMessage(flag: IrregularityFlag): string {
  const messages: Record<FlagCode, string> = {
    cycle_short: `Your last cycle was ${flag.value} days, shorter than the usual range.`,
    cycle_long: `Your last cycle was ${flag.value} days, longer than the usual range.`,
    cycle_variation: `Your recent cycles differ by ${flag.value} days from shortest to longest.`,
    period_long: `Your last period lasted ${flag.value} days, longer than usual.`,
    period_late: `Your period is ${flag.value} ${flag.value === 1 ? 'day' : 'days'} past the expected range.`,
  };
  return messages[flag.code];
}

export const LOG_ERROR: Record<string, string> = {
  future_date: "You can't log a date in the future.",
  inside_period: 'That date falls inside a period you already logged.',
  no_open_period: 'There is no period in progress to end on that date.',
};
