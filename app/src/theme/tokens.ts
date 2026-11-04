import type { Phase } from '../domain/types';

/**
 * Design tokens (docs/context/design.md, ux-standards.md section 7). Screens use these names, never
 * raw hex. Every colour has a light and a dark value; the contrast of every text pair is checked by
 * theme/tokens.test.ts (WCAG AA 4.5:1; control borders 3:1).
 *
 * Phases each have their OWN soft colour and a gentle two-step gradient (`from` to `to`) so a cycle
 * reads as four calm bands instead of one red block. `fg` is the readable text/icon colour on `bg`.
 */
export interface PhaseColors {
  /** Readable text and icon colour for this phase. */
  fg: string;
  /** Flat soft fill (chips). */
  bg: string;
  /** Start and end of the soft gradient band used on the calendar and the ring. */
  from: string;
  to: string;
}

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
  /** Amber "please look" colour for notices (never red). */
  attention: string;
  attentionSoft: string;
  /** Solid red, used ONLY for buttons that remove something (with a trash icon and the word). */
  danger: string;
  onDanger: string;
  /** Borders of controls (inputs, switches): at least 3:1 against the background. */
  control: string;
  phase: Record<Phase, PhaseColors>;
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
  attention: '#8A4B08',
  attentionSoft: '#FBE8D0',
  danger: '#B3261E',
  onDanger: '#FFFFFF',
  control: '#8C7A74',
  phase: {
    menstrual: { fg: '#A81E4B', bg: '#F9DDE6', from: '#FBE3EA', to: '#F2BFD0' },
    follicular: { fg: '#7A4E00', bg: '#F7E8C8', from: '#F9EDD2', to: '#EFD7A0' },
    ovulation: { fg: '#0B6360', bg: '#D3EEEC', from: '#DDF2F0', to: '#A7DCD7' },
    luteal: { fg: '#5F4286', bg: '#E6DDF2', from: '#EBE3F5', to: '#D2C4E9' },
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
  attention: '#F5B27A',
  attentionSoft: '#3B2A1B',
  danger: '#FF9A92',
  onDanger: '#3B0B07',
  control: '#8F7C83',
  phase: {
    menstrual: { fg: '#F2708F', bg: '#4A2330', from: '#43202C', to: '#65303F' },
    follicular: { fg: '#E0A93B', bg: '#44361A', from: '#3D3119', to: '#58461F' },
    ovulation: { fg: '#4FC3C3', bg: '#1B3F40', from: '#193839', to: '#235456' },
    luteal: { fg: '#B79AE0', bg: '#3A2D50', from: '#352A49', to: '#4A3A68' },
  },
  scrim: 'rgba(0,0,0,0.6)',
};

/** 4dp grid. */
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { card: 20, button: 28, field: 14, pill: 999, sheet: 28 } as const;
/** Minimum touch target (Android floor). */
export const MIN_TARGET = 48;

export const typeScale = {
  display: { fontSize: 44, lineHeight: 52, fontWeight: '800' as const },
  largeTitle: { fontSize: 34, lineHeight: 41, fontWeight: '700' as const },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '700' as const },
  headline: { fontSize: 17, lineHeight: 22, fontWeight: '600' as const },
  body: { fontSize: 17, lineHeight: 24, fontWeight: '400' as const },
  subhead: { fontSize: 15, lineHeight: 21, fontWeight: '400' as const },
  footnote: { fontSize: 14, lineHeight: 19, fontWeight: '400' as const },
};
