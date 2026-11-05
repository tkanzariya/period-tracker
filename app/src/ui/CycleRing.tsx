import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Stop } from 'react-native-svg';
import type { CycleRing as CycleRingData } from '../domain/ring';
import { mix } from '../theme/mix';
import { useTokens } from '../theme/useTokens';

const SIZE = 232;
const STROKE = 22;
const R = (SIZE - STROKE) / 2 - 8;
const C = 2 * Math.PI * R;
const GAP = 3; // visible gap between phases, in px

/**
 * The cycle drawn as a ring: one soft gradient arc per phase, each in its own colour, and a marker
 * for today. Before her first period there is no ring (the screen shows the welcome instead).
 */
export function CycleRingView({ ring, day, children }: { ring: CycleRingData; day: number | null; children: ReactNode }) {
  const t = useTokens();
  const center = SIZE / 2;

  let marker: { x: number; y: number } | null = null;
  if (day !== null) {
    const clamped = Math.min(Math.max(day, 1), ring.length);
    const angle = ((clamped - 0.5) / ring.length) * 2 * Math.PI - Math.PI / 2;
    marker = { x: center + R * Math.cos(angle), y: center + R * Math.sin(angle) };
  }

  // Gradient end points follow each arc (angles here are before the group is turned to start at the top).
  const at = (angle: number) => ({ x: center + R * Math.cos(angle), y: center + R * Math.sin(angle) });

  return (
    <View style={{ width: SIZE, height: SIZE, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={SIZE} height={SIZE} style={{ position: 'absolute' }}>
        <Defs>
          {ring.segments.map((s) => {
            const c = t.phase[s.phase];
            const a = at(((s.startDay - 1) / ring.length) * 2 * Math.PI);
            const b = at((s.endDay / ring.length) * 2 * Math.PI);
            return (
              <LinearGradient key={s.phase + s.startDay} id={`arc-${s.phase}-${s.startDay}`} gradientUnits="userSpaceOnUse" x1={a.x} y1={a.y} x2={b.x} y2={b.y}>
                <Stop offset="0" stopColor={mix(c.from, c.fg, 0.25)} />
                <Stop offset="1" stopColor={mix(c.to, c.fg, 0.5)} />
              </LinearGradient>
            );
          })}
        </Defs>
        <Circle cx={center} cy={center} r={R} stroke={t.surface2} strokeWidth={STROKE} fill="none" />
        {/* start the first day at 12 o'clock */}
        <G transform={`rotate(-90 ${center} ${center})`}>
          {ring.segments.map((s) => {
            const start = ((s.startDay - 1) / ring.length) * C;
            const length = ((s.endDay - s.startDay + 1) / ring.length) * C - GAP;
            return (
              <Circle
                key={`${s.phase}-${s.startDay}`}
                cx={center}
                cy={center}
                r={R}
                stroke={`url(#arc-${s.phase}-${s.startDay})`}
                strokeWidth={STROKE}
                fill="none"
                strokeDasharray={`${Math.max(length, 1)} ${C}`}
                strokeDashoffset={-start}
              />
            );
          })}
        </G>
        {marker ? <Circle cx={marker.x} cy={marker.y} r={STROKE / 2 + 3} fill={t.background} stroke={t.text} strokeWidth={3} /> : null}
      </Svg>
      <View style={{ alignItems: 'center', paddingHorizontal: 30 }}>{children}</View>
    </View>
  );
}
