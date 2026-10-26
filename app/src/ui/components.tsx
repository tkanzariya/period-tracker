import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';
import type { Phase } from '../domain/types';
import { MIN_TARGET, radius, spacing, typeScale, useTokens } from '../theme/tokens';
import { PHASE_LABEL } from './copy';

type IconName = ComponentProps<typeof Ionicons>['name'];

/** Phase icon + word, always paired with colour so colour is never the only signal. */
export const PHASE_ICON: Record<Phase, IconName> = {
  menstrual: 'water',
  follicular: 'contrast-outline',
  ovulation: 'sparkles',
  luteal: 'moon',
};

export function Card({ children, style, accent }: { children: ReactNode; style?: StyleProp<ViewStyle>; accent?: string }) {
  const t = useTokens();
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: t.surface, borderColor: t.line },
        accent ? { borderLeftColor: accent, borderLeftWidth: 4 } : null,
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function Heading({ children }: { children: ReactNode }) {
  const t = useTokens();
  return <Text style={[typeScale.largeTitle, { color: t.text }]} accessibilityRole="header">{children}</Text>;
}

export function Body({ children, secondary, style }: { children: ReactNode; secondary?: boolean; style?: StyleProp<TextStyle> }) {
  const t = useTokens();
  return <Text style={[secondary ? typeScale.footnote : typeScale.subhead, { color: secondary ? t.text2 : t.text }, style]}>{children}</Text>;
}

export function PhaseChip({ phase }: { phase: Phase }) {
  const t = useTokens();
  const colors = t.phase[phase];
  return (
    <View style={[styles.chip, { backgroundColor: colors.bg }]} accessibilityLabel={`${PHASE_LABEL[phase]} phase`}>
      <Ionicons name={PHASE_ICON[phase]} size={16} color={colors.fg} />
      <Text style={[typeScale.subhead, { color: colors.fg, fontWeight: '600' }]}>{PHASE_LABEL[phase]}</Text>
    </View>
  );
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'text';
  disabled?: boolean;
}) {
  const t = useTokens();
  const bg = variant === 'primary' ? t.primary : 'transparent';
  const color = variant === 'primary' ? t.onPrimary : t.primary;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, opacity: disabled ? 0.4 : pressed ? 0.8 : 1 },
        variant === 'secondary' && { borderWidth: 1.5, borderColor: t.primary },
      ]}
    >
      <Text style={[typeScale.headline, { color }]}>{label}</Text>
    </Pressable>
  );
}

export function Placeholder({ title, note }: { title: string; note: string }) {
  const t = useTokens();
  return (
    <View style={{ gap: spacing.md }}>
      <Heading>{title}</Heading>
      <Card>
        <Text style={[typeScale.body, { color: t.text }]}>Coming next</Text>
        <Body secondary>{note}</Body>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: radius.card, padding: spacing.lg, gap: spacing.xs },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm - 2,
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  button: {
    minHeight: MIN_TARGET,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
});
