import { describe, expect, it } from 'vitest';
import { defaultLanguage, STRINGS } from './index';

// Walks both languages together: same keys everywhere, same kind of value, no empty text, and
// functions that take the same inputs give text in both.
function compare(a: unknown, b: unknown, path: string, problems: string[]): void {
  if (typeof a === 'function' && typeof b === 'function') {
    const args = [3, 4, 5].slice(0, Math.max(a.length, b.length)).map((n) => (n === 3 ? 'X' : n));
    const ta = (a as (...x: unknown[]) => string)(...args);
    const tb = (b as (...x: unknown[]) => string)(...args);
    if (!ta || !tb) problems.push(`${path}: empty text from a function`);
    return;
  }
  if (typeof a === 'string' && typeof b === 'string') {
    if (!a.trim() || !b.trim()) problems.push(`${path}: empty text`);
    return;
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) problems.push(`${path}: different list lengths (${a.length} vs ${b.length})`);
    a.forEach((item, i) => compare(item, b[i], `${path}[${i}]`, problems));
    return;
  }
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const ka = Object.keys(a).sort();
    const kb = Object.keys(b).sort();
    if (ka.join() !== kb.join()) problems.push(`${path}: different keys (${ka.join()} vs ${kb.join()})`);
    for (const k of ka) compare((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k], `${path}.${k}`, problems);
    return;
  }
  problems.push(`${path}: different kinds of value`);
}

describe('wording files', () => {
  it('English and Hindi have exactly the same keys and no empty text', () => {
    const problems: string[] = [];
    compare(STRINGS.en, STRINGS.hi, 'strings', problems);
    expect(problems).toEqual([]);
  });

  it('Hindi really is Hindi: every plain line has Devanagari, except the app name and the Latin abbreviations of dates', () => {
    const lacking: string[] = [];
    const skip = new Set(['appName']);
    const walk = (o: unknown, path: string) => {
      if (typeof o === 'string') {
        if (!/[ऀ-ॿ]/.test(o) && !skip.has(path.split('.').pop() ?? '')) lacking.push(path);
      } else if (Array.isArray(o)) o.forEach((v, i) => walk(v, `${path}[${i}]`));
      else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) walk(v, `${path}.${k}`);
    };
    walk(STRINGS.hi, 'hi');
    expect(lacking).toEqual([]);
  });

  it('the English never says failed, invalid, error, wrong, mistake or overspent (calm wording)', () => {
    const text = JSON.stringify(STRINGS.en, (_k, v) => (typeof v === 'function' ? v(1, 1, 1) : v))
      // The health disclaimer may say the app cannot tell "if something is wrong": that is about her body, not a scolding.
      .replace(/if something is wrong/gi, '');
    expect(text.match(/\b(failed|invalid|error|wrong|mistake|overspent)\b/gi) ?? []).toEqual([]);
  });

  it('never uses the phrase "safe period" in either language', () => {
    const text = JSON.stringify(STRINGS, (_k, v) => (typeof v === 'function' ? v(1, 1, 1) : v));
    expect(text).not.toMatch(/safe period|सुरक्षित अवधि|सेफ़ पीरियड/i);
  });

  it('no wording is the generic OK or Submit', () => {
    const text = JSON.stringify(STRINGS.en, (_k, v) => (typeof v === 'function' ? v(1, 1, 1) : v));
    expect(text).not.toMatch(/"(OK|Submit)"/);
  });

  it('has 12 months and 7 weekdays in each language', () => {
    for (const s of Object.values(STRINGS)) {
      expect(s.dates.months).toHaveLength(12);
      expect(s.dates.monthsShort).toHaveLength(12);
      expect(s.dates.weekdays).toHaveLength(7);
      expect(s.dates.weekdaysShort).toHaveLength(7);
      expect(s.dates.initials).toHaveLength(7);
    }
  });

  it('picks Hindi only when the phone is set to Hindi', () => {
    expect(defaultLanguage('hi-IN')).toBe('hi');
    expect(defaultLanguage('en-IN')).toBe('en');
    expect(defaultLanguage('gu-IN')).toBe('en');
    expect(defaultLanguage(undefined)).toBe('en');
  });
});
