/** Blend two #RRGGBB colours: t = 0 gives `a`, t = 1 gives `b`. Used to soften the ring and band colours. */
export function mix(a: string, b: string, t: number): string {
  const ch = (hex: string, i: number) => parseInt(hex.slice(i, i + 2), 16);
  const out = [1, 3, 5].map((i) => Math.round(ch(a, i) + (ch(b, i) - ch(a, i)) * t));
  return '#' + out.map((v) => v.toString(16).padStart(2, '0')).join('').toUpperCase();
}
