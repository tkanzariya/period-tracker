import { describe, expect, it } from 'vitest';
import { bandRuns, type BandDay } from './bandRuns';

const day = (phase: BandDay['phase'], guess = false): BandDay => ({ phase, guess });

describe('bandRuns', () => {
  it('joins neighbouring days of the same phase', () => {
    expect(bandRuns([day('menstrual'), day('menstrual'), day('follicular'), null, day('follicular')])).toEqual([
      { phase: 'menstrual', guess: false, from: 0, to: 1 },
      { phase: 'follicular', guess: false, from: 2, to: 2 },
      { phase: 'follicular', guess: false, from: 4, to: 4 },
    ]);
  });

  it('keeps guesses apart from facts', () => {
    expect(bandRuns([day('menstrual'), day('menstrual', true)])).toHaveLength(2);
  });
});
