import type { CycleRules } from '../config/cycleRules';
import type { IrregularityFlag } from '../domain/flags';
import type { Strings } from '../i18n';

/** The calm sentence for one "you may want to tell your doctor" observation. NEEDS DRASHTI REVIEW. */
export function flagText(flag: IrregularityFlag, S: Strings, rules: CycleRules): string {
  const f = S.flags;
  switch (flag.code) {
    case 'cycle_short': return f.cycleShort(flag.value, rules.cycle.normalMinDays, rules.cycle.normalMaxDays);
    case 'cycle_long': return f.cycleLong(flag.value, rules.cycle.normalMinDays, rules.cycle.normalMaxDays);
    case 'cycle_variation': return f.variation(flag.value);
    case 'period_long': return f.periodLong(flag.value, rules.period.normalMaxDays);
    case 'period_late': return f.periodLate(flag.value);
  }
}
