import type { CycleRules } from '../config/cycleRules';
import type { DateStr } from '../domain/dates';
import type { Issue } from '../domain/validation';
import type { Strings } from '../i18n';
import { formatRange, formatShort } from './format';

/** A shortcut the screen can offer next to the message. */
export interface IssueAction {
  label: string;
  kind: 'change_period' | 'end_period' | 'start_period';
  periodId?: string;
  date?: DateStr;
}

/** The words for one problem, ready to show. `yes`/`no` are present for "is that right?" questions. */
export interface IssueView {
  title: string;
  body?: string;
  action?: IssueAction;
  yes?: string;
  no?: string;
}

/** Turns a structured problem from the domain into words in the person's language. */
export function describeIssue(issue: Issue, S: Strings, rules: CycleRules): IssueView {
  const d = issue.data;
  const text = S.issues;
  const range = (start?: DateStr, end?: DateStr | null) => (start ? formatRange(start, end ?? start, S) : '');
  switch (issue.code) {
    case 'future_date':
      return { title: text.futureDate.title, body: text.futureDate.body };
    case 'start_already_logged':
      return {
        title: text.startAlreadyLogged.title(formatShort(d.start ?? '', S)),
        body: text.startAlreadyLogged.body,
        action: { label: text.startAlreadyLogged.action, kind: 'change_period', periodId: d.periodId },
      };
    case 'start_inside_period':
      return {
        title: text.startInsidePeriod.title(range(d.start, d.end)),
        body: text.startInsidePeriod.body,
        action: { label: text.startInsidePeriod.action, kind: 'change_period', periodId: d.periodId },
      };
    case 'start_previous_unfinished':
      return {
        title: text.startPreviousUnfinished.title(formatShort(d.start ?? '', S)),
        body: text.startPreviousUnfinished.body,
        action: { label: text.startPreviousUnfinished.action, kind: 'end_period', periodId: d.periodId },
      };
    case 'start_overlaps_next':
      return { title: text.startOverlapsNext.title(formatShort(d.start ?? '', S)), body: text.startOverlapsNext.body };
    case 'start_too_soon':
      return {
        title: text.startTooSoon.title(d.days ?? 0),
        body: text.startTooSoon.body(rules.cycle.normalMinDays, rules.cycle.normalMaxDays),
        yes: text.startTooSoon.yes,
        no: text.startTooSoon.no,
      };
    case 'end_no_period':
      return { title: text.endNoPeriod.title, body: text.endNoPeriod.body, action: { label: text.endNoPeriod.action, kind: 'start_period' } };
    case 'end_before_start':
      return { title: text.endBeforeStart.title(formatShort(d.start ?? '', S)), body: text.endBeforeStart.body };
    case 'end_already':
      return {
        title: text.endAlready.title(formatShort(d.end ?? d.start ?? '', S)),
        body: text.endAlready.body,
        action: { label: text.endAlready.action, kind: 'change_period', periodId: d.periodId },
      };
    case 'end_too_long':
      return { title: text.endTooLong.title(d.days ?? 0), body: text.endTooLong.body, yes: text.endTooLong.yes, no: text.endTooLong.no };
    case 'overlaps':
      return { title: text.overlaps.title(range(d.start, d.end)), body: text.overlaps.body };
    case 'note_empty':
      return { title: text.noteEmpty.title, body: text.noteEmpty.body };
    case 'note_too_long':
      return { title: text.noteTooLong.title, body: text.noteTooLong.body(d.days ?? 0) };
  }
}
