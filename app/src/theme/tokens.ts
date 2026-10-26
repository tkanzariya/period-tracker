import { useColorScheme } from 'react-native';
import type { Phase } from '../domain/types';

/**
 * Design tokens from docs/context/design.md. Components use these names,
 * never raw hex. Every colour has a light and a dark value; all text/background
 * pairs are verified WCAG AA.
 */
export interface Tokens {
  primary: string;
  onPrimary: string;
  primarySoft: string;
  background: string;
  surface: string;
  surface2: string;
  line: string;
  text: string;
  text2: string;
  phase: Record<Phase, { fg: string; bg: string }>;
  scrim: string;
}

export const lightTokens: Tokens = {
  primary: '#C9265F',
  onPrimary: '#FFFFFF',
  primarySoft: '#F9DDE6',
  background: '#FBF6F2',
  surface: '#FFFFFF',
  surface2: '#F4EAE5',
  line: '#E6D8D1',
  text: '#2B1B20',
  text2: '#6B5A60',
  phase: {
    menstrual: { fg: '#C9265F', bg: '#F9DDE6' },
    follicular: { fg: '#8A5A00', bg: '#F7E8C8' },
    ovulation: { fg: '#0B6E6E', bg: '#D3EEEC' },
    luteal: { fg: '#6B4A8F', bg: '#E6DDF2' },
  },
  scrim: 'rgba(0,0,0,0.35)',
};

export const darkTokens: Tokens = {
  primary: '#F2708F',
  onPrimary: '#1C1417',
  primarySoft: '#4A2330',
  background: '#1C1417',
  surface: '#2A1F23',
  surface2: '#33262B',
  line: '#4A3A40',
  text: '#F5ECEE',
  text2: '#B9A8AE',
  phase: {
    menstrual: { fg: '#F2708F', bg: '#4A2330' },
    follicular: { fg: '#E0A93B', bg: '#44361A' },
    ovulation: { fg: '#4FC3C3', bg: '#1B3F40' },
    luteal: { fg: '#B79AE0', bg: '#3A2D50' },
  },
  scrim: 'rgba(0,0,0,0.6)',
};

export function useTokens(): Tokens {
  return useColorScheme() === 'dark' ? darkTokens : lightTokens;
}

/** 4dp grid. */
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { card: 16, button: 14, pill: 999 } as const;
/** Minimum touch target (Android floor). */
export const MIN_TARGET = 48;

export const typeScale = {
  largeTitle: { fontSize: 34, lineHeight: 41, fontWeight: '700' as const },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '600' as const },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600' as const },
  body: { fontSize: 17, lineHeight: 22, fontWeight: '400' as const },
  subhead: { fontSize: 15, lineHeight: 20, fontWeight: '400' as const },
  footnote: { fontSize: 13, lineHeight: 18, fontWeight: '400' as const },
};
