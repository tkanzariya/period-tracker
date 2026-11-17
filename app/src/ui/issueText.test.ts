import { describe, expect, it } from 'vitest';
import { DEFAULT_CYCLE_RULES as rules } from '../config/cycleRules';
import type { Issue, IssueCode } from '../domain/validation';
import { STRINGS } from '../i18n';
import { describeIssue } from './issueText';

const CODES: IssueCode[] = ['future_date', 'start_already_logged', 'start_too_soon', 'start_long_gap', 'note_empty', 'note_too_long'];
const CONFIRM: IssueCode[] = ['start_too_soon', 'start_long_gap'];

describe.each(Object.entries(STRINGS))('problem wording in %s', (_lang, S) => {
  it.each(CODES)('%s has a title and body', (code) => {
    const issue: Issue = {
      severity: CONFIRM.includes(code) ? 'confirm' : 'block',
      code,
      data: { start: '2026-10-06', days: 14, periodId: 'p1', date: '2026-11-06' },
    };
    const view = describeIssue(issue, S, rules);
    expect(view.title.length).toBeGreaterThan(3);
    expect(view.body?.length ?? 0).toBeGreaterThan(3);
    expect(view.title).not.toMatch(/undefined|NaN/);
    expect(view.body ?? '').not.toMatch(/undefined|NaN/);
  });

  it('"is that right?" questions have yes and no buttons that say what happens', () => {
    for (const code of CONFIRM) {
      const view = describeIssue({ severity: 'confirm', code, data: { days: 20 } }, S, rules);
      expect(view.yes).toBeTruthy();
      expect(view.no).toBeTruthy();
    }
  });

  it('a start that is already saved offers to change that period', () => {
    const view = describeIssue({ severity: 'block', code: 'start_already_logged', data: { start: '2026-10-06', periodId: 'p1' } }, S, rules);
    expect(view.action?.kind).toBe('change_period');
  });
});
