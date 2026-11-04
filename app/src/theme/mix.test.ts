import { describe, expect, it } from 'vitest';
import { mix } from './mix';

describe('mix', () => {
  it('returns the ends and the middle', () => {
    expect(mix('#000000', '#FFFFFF', 0)).toBe('#000000');
    expect(mix('#000000', '#FFFFFF', 1)).toBe('#FFFFFF');
    expect(mix('#000000', '#FFFFFF', 0.5)).toBe('#808080');
  });
});
