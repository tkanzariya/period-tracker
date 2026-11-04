import type { Phase } from '../domain/types';

export interface BandDay {
  phase: Phase | null;
  /** A guess about the future (shown softer). */
  guess: boolean;
}

export interface BandRun {
  phase: Phase;
  guess: boolean;
  from: number;
  to: number;
}

/** Joins neighbouring days that share a phase (and guess-ness) into runs of columns. */
export function bandRuns(days: (BandDay | null)[]): BandRun[] {
  const runs: BandRun[] = [];
  days.forEach((d, i) => {
    if (!d || !d.phase) return;
    const last = runs[runs.length - 1];
    if (last && last.phase === d.phase && last.guess === d.guess && last.to === i - 1) last.to = i;
    else runs.push({ phase: d.phase, guess: d.guess, from: i, to: i });
  });
  return runs;
}
