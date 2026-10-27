import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { addDays, type DateStr } from '../domain/dates';
import { MIN_TARGET, spacing, typeScale, useTokens } from '../theme/tokens';
import { formatMedium } from './format';

/** Pick a day by stepping back and forward. Simple, big buttons, no calendar pop-up. */
export function DayPicker({
  value,
  onChange,
  max,
  min,
  label,
}: {
  value: DateStr;
  onChange: (date: DateStr) => void;
  max: DateStr;
  min?: DateStr;
  label?: string;
}) {
  const t = useTokens();
  const step = (name: string, delta: number, disabled: boolean) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={name}
      disabled={disabled}
      onPress={() => onChange(addDays(value, delta))}
      style={{ width: MIN_TARGET, height: MIN_TARGET, alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.3 : 1 }}
    >
      <Ionicons name={delta < 0 ? 'chevron-back' : 'chevron-forward'} size={24} color={t.primary} />
    </Pressable>
  );
  return (
    <View style={{ gap: spacing.xs }}>
      {label ? <Text style={[typeScale.footnote, { color: t.text2 }]}>{label}</Text> : null}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        {step('Day before', -1, min !== undefined && value <= min)}
        <Text style={[typeScale.headline, { color: t.text }]}>{formatMedium(value)}</Text>
        {step('Day after', 1, value >= max)}
      </View>
    </View>
  );
}
