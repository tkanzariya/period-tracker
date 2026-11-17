import type { CycleRules } from '../config/cycleRules';
import type { DateStr } from '../domain/dates';
import type { Issue } from '../domain/validation';
import type { Strings } from '../i18n';
import { formatShort } from './format';

/** A shortcut the screen can offer next to the message. */
export interface IssueAction {
  label: string;
  kind: 'change_period';
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
  switch (issue.code) {
    case 'future_date':
      return { title: text.futureDate.title, body: text.futureDate.body };
    case 'start_already_logged':
      return {
        title: text.startAlreadyLogged.title(formatShort(d.start ?? '', S)),
        body: text.startAlreadyLogged.body,
        action: { label: text.startAlreadyLogged.action, kind: 'change_period', periodId: d.periodId },
      };
    case 'start_too_soon':
      return {
        title: text.startTooSoon.title(d.days ?? 0),
        body: text.startTooSoon.body(rules.cycle.normalMinDays, rules.cycle.normalMaxDays),
        yes: text.startTooSoon.yes,
        no: text.startTooSoon.no,
      };
    case 'start_long_gap':
      return { title: text.startLongGap.title(d.days ?? 0), body: text.startLongGap.body, yes: text.startLongGap.yes, no: text.startLongGap.no };
    case 'note_empty':
      return { title: text.noteEmpty.title, body: text.noteEmpty.body };
    case 'note_too_long':
      return { title: text.noteTooLong.title, body: text.noteTooLong.body(d.days ?? 0) };
  }
}
