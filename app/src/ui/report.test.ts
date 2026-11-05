import { describe, expect, it } from 'vitest';
import { DEFAULT_CYCLE_RULES as rules } from '../config/cycleRules';
import { STRINGS } from '../i18n';
import { buildReportHtml } from './report';

const p = (id: string, startDate: string, endDate: string | null) => ({ id, startDate, endDate, note: null });
const periods = [p('a', '2026-08-01', '2026-08-05'), p('b', '2026-08-29', '2026-09-02'), p('c', '2026-09-27', null)];
const notes = [{ id: 'n', date: '2026-08-02', note: 'Cramps <bad>' }];

describe.each(Object.entries(STRINGS))('PDF report in %s', (_l, S) => {
  const html = buildReportHtml({ periods, notes, rules, S, name: 'Drashti', today: '2026-10-05' });
  it('is branded and names her', () => {
    expect(html).toContain('Cycle Saathi');
    expect(html).toContain('Drashti');
    expect(html).toContain('<svg');
  });
  it('lists every period and escapes notes', () => {
    expect(html.match(/<tr><td>/g)).toHaveLength(3);
    expect(html).toContain('Cramps &lt;bad&gt;');
    expect(html).not.toMatch(/undefined|NaN/);
  });
  it('has a friendly empty version', () => {
    expect(buildReportHtml({ periods: [], notes: [], rules, S, name: null, today: '2026-10-05' })).toContain(S.report.empty);
  });
});
