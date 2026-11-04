import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { WEEK_STARTS_ON } from '../config/display';
import { monthGrid, shiftMonth } from '../domain/calendar';
import { todayLocal, type DateStr } from '../domain/dates';
import { useLanguage } from '../state/language';
import { MIN_TARGET, radius, spacing } from '../theme/tokens';
import { useTokens } from '../theme/useTokens';
import { formatLong, formatMonthYear } from './format';
import { Button, IconButton, Sheet } from './kit';

/**
 * A date box that opens a simple month calendar (our own, so it looks the same everywhere and is not
 * an Android system dialog). Days outside min/max are greyed out and cannot be picked; days she has
 * already marked (for example, logged period days) show a small dot.
 */
export function DateField({ value, onChange, label, min, max, marked }: {
  value: DateStr; onChange: (d: DateStr) => void; label: string; min?: DateStr; max?: DateStr; marked?: ReadonlySet<DateStr>;
}) {
  const t = useTokens();
  const { S } = useLanguage();
  const [open, setOpen] = useState(false);
  const today = todayLocal();
  const monthOf = (d: DateStr) => ({ year: Number(d.slice(0, 4)), month: Number(d.slice(5, 7)) - 1 });
  const [view, setView] = useState(monthOf(value));

  const show = () => {
    setView(monthOf(value));
    setOpen(true);
  };
  const move = (by: number) => setView((v) => shiftMonth(v.year, v.month, by));
  const outOfRange = (d: DateStr) => (min !== undefined && d < min) || (max !== undefined && d > max);
  const canGoBack = min === undefined || `${view.year}-${String(view.month + 1).padStart(2, '0')}` > min.slice(0, 7);
  const canGoForward = max === undefined || `${view.year}-${String(view.month + 1).padStart(2, '0')}` < max.slice(0, 7);
  const initials = Array.from({ length: 7 }, (_, i) => S.dates.initials[(i + WEEK_STARTS_ON) % 7]);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${formatLong(value, S)}`}
        onPress={show}
        style={[styles.field, { backgroundColor: t.surface2 }]}
      >
        <Ionicons name="calendar-outline" size={22} color={t.primary} />
        <Text style={[styles.fieldText, { color: t.text }]}>{formatLong(value, S)}</Text>
        <Ionicons name="chevron-down" size={20} color={t.text2} />
      </Pressable>

      <Sheet visible={open} onClose={() => setOpen(false)} title={S.dates.pickDay}>
        <View style={styles.head}>
          <View style={{ opacity: canGoBack ? 1 : 0.3 }}>
            <IconButton icon="chevron-back" label={S.dates.previousMonth} onPress={() => canGoBack && move(-1)} color={t.primary} size={28} />
          </View>
          <Text accessibilityRole="header" style={[styles.month, { color: t.text }]}>{formatMonthYear(view.year, view.month, S)}</Text>
          <View style={{ opacity: canGoForward ? 1 : 0.3 }}>
            <IconButton icon="chevron-forward" label={S.dates.nextMonth} onPress={() => canGoForward && move(1)} color={t.primary} size={28} />
          </View>
        </View>
        <View style={styles.week}>
          {initials.map((d, i) => (
            <Text key={i} style={[styles.dow, { color: t.text2 }]}>{d}</Text>
          ))}
        </View>
        <View>
          {monthGrid(view.year, view.month, WEEK_STARTS_ON).map((week, wi) => (
            <View key={wi} style={styles.week}>
              {week.map((d, di) => {
                if (!d) return <View key={di} style={styles.cell} />;
                const disabled = outOfRange(d);
                const selected = d === value;
                const isToday = d === today;
                return (
                  <Pressable
                    key={di}
                    disabled={disabled}
                    accessibilityRole="button"
                    accessibilityLabel={formatLong(d, S)}
                    accessibilityState={{ selected, disabled }}
                    onPress={() => {
                      onChange(d);
                      setOpen(false);
                    }}
                    style={styles.cell}
                  >
                    <View
                      style={[
                        styles.day,
                        selected && { backgroundColor: t.primary },
                        !selected && isToday && { borderWidth: 2, borderColor: t.primary },
                        { opacity: disabled ? 0.3 : 1 },
                      ]}
                    >
                      <Text style={{ color: selected ? t.onPrimary : t.text, fontSize: 17, fontWeight: selected || isToday ? '800' : '400' }}>{Number(d.slice(8, 10))}</Text>
                      {marked?.has(d) ? <View style={[styles.dot, { backgroundColor: selected ? t.onPrimary : t.primary }]} /> : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
        {!outOfRange(today) ? (
          <Button
            label={S.common.today}
            variant="text"
            onPress={() => {
              onChange(today);
              setOpen(false);
            }}
          />
        ) : null}
      </Sheet>
    </>
  );
}

const styles = StyleSheet.create({
  field: { minHeight: 56, borderRadius: radius.field, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  fieldText: { fontSize: 17, flex: 1, fontWeight: '600' },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  month: { fontSize: 20, fontWeight: '700' },
  week: { flexDirection: 'row' },
  dow: { flex: 1, textAlign: 'center', fontSize: 14, paddingVertical: 6 },
  cell: { flex: 1, height: MIN_TARGET + 4, alignItems: 'center', justifyContent: 'center' },
  day: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 5, height: 5, borderRadius: 3, position: 'absolute', bottom: 5 },
});
