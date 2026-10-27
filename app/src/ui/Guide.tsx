import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Ellipse, G, Path } from 'react-native-svg';
import { radius, spacing, typeScale, useTokens } from '../theme/tokens';

const SKIN = '#D99B73';
const HAIR = '#2B1B20';
const BLUSH = '#F08CA4';
const FLOWER = '#F2B84B';

export type GuideMood = 'happy' | 'wave' | 'caring';

/**
 * The friendly lady who guides the app. A simple flat illustration drawn in
 * code so it follows the colour theme and needs no image files.
 */
export function GuideAvatar({ size = 88, mood = 'happy' }: { size?: number; mood?: GuideMood }) {
  const t = useTokens();
  const mouth = mood === 'caring' ? 'M53 67 Q60 70 67 67' : 'M51 66 Q60 75 69 66';
  return (
    <View accessible accessibilityLabel="Your friendly guide" style={{ width: size, height: size }}>
    <Svg width={size} height={size} viewBox="0 0 120 120">
      <Circle cx="60" cy="60" r="60" fill={t.primarySoft} />
      {/* hair behind */}
      <Path d="M27 58 C25 26 95 26 93 58 L98 100 C80 94 40 94 22 100 Z" fill={HAIR} />
      {/* shoulders and top */}
      <Path d="M16 120 C18 99 38 92 60 92 C82 92 102 99 104 120 Z" fill={t.primary} />
      {/* neck */}
      <Path d="M52 78 H68 V96 Q60 102 52 96 Z" fill={SKIN} />
      {/* face */}
      <Ellipse cx="60" cy="55" rx="22" ry="25" fill={SKIN} />
      {/* fringe */}
      <Path d="M37 52 C36 28 84 28 83 52 C76 43 68 39 58 39 C49 39 42 43 37 52 Z" fill={HAIR} />
      {/* eyes */}
      <Circle cx="51" cy="57" r="2.6" fill={HAIR} />
      <Circle cx="69" cy="57" r="2.6" fill={HAIR} />
      {/* cheeks */}
      <Circle cx="45" cy="64" r="4.2" fill={BLUSH} opacity={0.55} />
      <Circle cx="75" cy="64" r="4.2" fill={BLUSH} opacity={0.55} />
      {/* smile */}
      <Path d={mouth} stroke={HAIR} strokeWidth="2.4" strokeLinecap="round" fill="none" />
      {/* hair flower */}
      <G>
        <Circle cx="82" cy="44" r="6" fill={FLOWER} />
        <Circle cx="82" cy="44" r="2.4" fill={t.primary} />
      </G>
      {mood === 'wave' ? (
        <G>
          <Circle cx="100" cy="86" r="9" fill={SKIN} />
          <Path d="M90 74 L86 70 M100 72 L100 66 M110 76 L115 72" stroke={t.primary} strokeWidth="3" strokeLinecap="round" />
        </G>
      ) : null}
    </Svg>
    </View>
  );
}

/** The guide with a speech bubble. Use for the main thing she should know right now. */
export function GuideMessage({ text, mood = 'happy' }: { text: string; mood?: GuideMood }) {
  const t = useTokens();
  return (
    <View style={styles.row}>
      <GuideAvatar size={84} mood={mood} />
      <View style={[styles.bubble, { backgroundColor: t.surface, borderColor: t.line }]}>
        <View style={[styles.tail, { backgroundColor: t.surface, borderColor: t.line }]} />
        <Text style={[typeScale.body, { color: t.text }]}>{text}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  bubble: { flex: 1, borderWidth: 1, borderRadius: radius.card, padding: spacing.lg },
  tail: {
    position: 'absolute',
    left: -7,
    top: 28,
    width: 14,
    height: 14,
    borderLeftWidth: 1,
    borderBottomWidth: 1,
    transform: [{ rotate: '45deg' }],
  },
});
