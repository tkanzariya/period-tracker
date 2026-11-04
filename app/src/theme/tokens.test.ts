import { describe, expect, it } from 'vitest';
import type { Phase } from '../domain/types';
import { darkTokens, lightTokens, type Tokens } from './tokens';

function luminance(hex: string): number {
  const c = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
function ratio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

type Flat = Exclude<keyof Tokens, 'phase' | 'scrim'>;
const TEXT_PAIRS: [Flat, Flat][] = [
  ['text', 'background'], ['text', 'surface'], ['text', 'surface2'], ['text2', 'background'], ['text2', 'surface'], ['text2', 'surface2'],
  ['onPrimary', 'primary'], ['primary', 'background'], ['primary', 'surface'], ['text', 'primarySoft'],
  ['attention', 'attentionSoft'], ['text', 'attentionSoft'], ['onDanger', 'danger'], ['danger', 'background'], ['danger', 'surface'],
];
const CONTROL_PAIRS: [Flat, Flat][] = [['control', 'background'], ['control', 'surface']];
const PHASES: Phase[] = ['menstrual', 'follicular', 'ovulation', 'luteal'];

describe.each([['light', lightTokens], ['dark', darkTokens]] as const)('%s palette', (_name, t) => {
  it.each(TEXT_PAIRS)('%s on %s is at least 4.5:1', (fg, bg) => {
    expect(ratio(t[fg], t[bg])).toBeGreaterThanOrEqual(4.5);
  });
  it.each(CONTROL_PAIRS)('%s against %s is at least 3:1', (fg, bg) => {
    expect(ratio(t[fg], t[bg])).toBeGreaterThanOrEqual(3);
  });
  it.each(PHASES)('%s: text on both ends of its gradient band and its chip is at least 4.5:1', (phase) => {
    const c = t.phase[phase];
    expect(ratio(t.text, c.from)).toBeGreaterThanOrEqual(4.5);
    expect(ratio(t.text, c.to)).toBeGreaterThanOrEqual(4.5);
    expect(ratio(c.fg, c.bg)).toBeGreaterThanOrEqual(4.5);
  });
  it.each(PHASES)('%s: the band is visibly different from the screen background (so it can be seen)', (phase) => {
    expect(ratio(t.phase[phase].to, t.background)).toBeGreaterThanOrEqual(1.1);
  });
  it('has a six-digit hex value for every colour', () => {
    const values = Object.entries(t)
      .filter(([k]) => k !== 'scrim')
      .flatMap(([, v]) => (typeof v === 'string' ? [v] : Object.values(v as Record<string, Record<string, string>>).flatMap((p) => Object.values(p))));
    for (const v of values) expect(v).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });
});

describe('the four phases are told apart by more than colour depth', () => {
  it('no two phases share a gradient end colour in either theme', () => {
    for (const t of [lightTokens, darkTokens]) {
      const ends = PHASES.map((p) => t.phase[p].to);
      expect(new Set(ends).size).toBe(4);
    }
  });
});

describe('light and dark palettes', () => {
  it('define exactly the same token names', () => {
    expect(Object.keys(darkTokens).sort()).toEqual(Object.keys(lightTokens).sort());
    for (const p of PHASES) expect(Object.keys(darkTokens.phase[p]).sort()).toEqual(Object.keys(lightTokens.phase[p]).sort());
  });
});
