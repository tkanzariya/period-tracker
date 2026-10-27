import type { ReactNode } from 'react';
import { View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import type { CycleRing as CycleRingData } from '../domain/ring';
import { useTokens } from '../theme/tokens';

const SIZE = 232;
const STROKE = 20;
const R = (SIZE - STROKE) / 2 - 8;
const C = 2 * Math.PI * R;
const GAP = 3; // visible gap between phases, in px

/**
 * The cycle drawn as a ring: one coloured arc per phase, and a marker showing
 * where she is today. Without enough data it is a plain grey ring.
 */
export function CycleRingView({ ring, day, children }: { ring: CycleRingData | null; day: number | null; children: ReactNode }) {
  const t = useTokens();
  const center = SIZE / 2;

  // Not enough data to draw the phases yet: a soft rose disc instead of an empty ring.
  if (!ring) {
    return (
      <View
        style={{ width: 176, height: 176, borderRadius: 88, alignSelf: 'center', alignItems: 'center', justifyContent: 'center', backgroundColor: t.primarySoft }}
      >
        {children}
      </View>
    );
  }

  let marker: { x: number; y: number } | null = null;
  if (ring && day !== null) {
    const clamped = Math.min(Math.max(day, 1), ring.length);
    const angle = ((clamped - 0.5) / ring.length) * 2 * Math.PI - Math.PI / 2;
    marker = { x: center + R * Math.cos(angle), y: center + R * Math.sin(angle) };
  }

  return (
    <View style={{ width: SIZE, height: SIZE, alignSelf: 'center', alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={SIZE} height={SIZE} style={{ position: 'absolute' }}>
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
                stroke={t.phase[s.phase].fg}
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
      <View style={{ alignItems: 'center', paddingHorizontal: 40 }}>{children}</View>
    </View>
  );
}
