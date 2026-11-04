import { useState } from 'react';
import { View } from 'react-native';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useTokens } from '../theme/useTokens';
import { bandRuns, type BandDay } from './bandRuns';

/**
 * The colour behind one week of the calendar: a soft gradient band per phase, joined across days.
 * No underlines, stars or dots: the phase is the colour, and tapping a day tells you in words.
 */
export function PhaseBands({ days, height, id }: { days: (BandDay | null)[]; height: number; id: string }) {
  const t = useTokens();
  const [width, setWidth] = useState(0);
  const cell = width / 7;
  const runs = bandRuns(days);
  return (
    <View pointerEvents="none" onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={{ position: 'absolute', left: 0, right: 0, top: 0, height }}>
      {width > 0 ? (
        <Svg width={width} height={height}>
          <Defs>
            {runs.map((r, i) => (
              <LinearGradient key={i} id={`${id}-${i}`} x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0" stopColor={t.phase[r.phase].from} />
                <Stop offset="1" stopColor={t.phase[r.phase].to} />
              </LinearGradient>
            ))}
          </Defs>
          {runs.map((r, i) => (
            <Rect
              key={i}
              x={r.from * cell + 2}
              y={4}
              width={(r.to - r.from + 1) * cell - 4}
              height={height - 8}
              rx={(height - 8) / 2.4}
              fill={`url(#${id}-${i})`}
              opacity={r.guess ? 0.6 : 1}
            />
          ))}
        </Svg>
      ) : null}
    </View>
  );
}
