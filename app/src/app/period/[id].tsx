import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { addDays, todayLocal } from '../../domain/dates';
import type { Period } from '../../domain/types';
import { useData } from '../../state/data';
import { MIN_TARGET, radius, spacing, typeScale, useTokens } from '../../theme/tokens';
import { Body, Button } from '../../ui/components';
import { LOG_ERROR, STR } from '../../ui/copy';
import { confirmAction, notify } from '../../ui/dialog';
import { goBackOrHome } from '../../ui/nav';
import { DayPicker } from '../../ui/DayPicker';
import { formatRange } from '../../ui/format';

export default function EditPeriodScreen() {
  const t = useTokens();
  const { periods, loading } = useData();
  const { id } = useLocalSearchParams<{ id: string }>();
  const period = periods.find((p) => p.id === id);

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: t.background }}>
        <ActivityIndicator color={t.primary} />
      </SafeAreaView>
    );
  }
  if (!period) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: t.background, padding: spacing.lg, gap: spacing.lg }}>
        <Body>{STR.periodGone}</Body>
        <Button label={STR.goBack} onPress={() => goBackOrHome()} />
      </SafeAreaView>
    );
  }
  // The form only exists once the period is known, so its starting values are always right.
  return <EditPeriodForm key={period.id} period={period} />;
}

function EditPeriodForm({ period }: { period: Period }) {
  const t = useTokens();
  const data = useData();
  const today = todayLocal();

  const [start, setStart] = useState(period.startDate);
  const [hasEnd, setHasEnd] = useState(period.endDate !== null);
  const [end, setEnd] = useState(period.endDate ?? addDays(period.startDate, data.rules.period.assumedLengthDays - 1));
  const [saving, setSaving] = useState(false);

  const shownEnd = end > today ? today : end;

  async function save() {
    setSaving(true);
    const result = await data.changePeriod(period.id, start, hasEnd ? shownEnd : null);
    setSaving(false);
    if (!result.ok) {
      await notify(STR.cantSaveTitle, LOG_ERROR[result.error] ?? STR.somethingWrong);
      return;
    }
    goBackOrHome();
  }

  async function remove() {
    const label = formatRange(period.startDate, period.endDate ?? period.startDate);
    const yes = await confirmAction(STR.deletePeriodTitle, `${label}. ${STR.deletePeriodBody}`, STR.remove, STR.cancel, true);
    if (!yes) return;
    await data.removePeriod(period.id);
    goBackOrHome();
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.background }} edges={['bottom']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <DayPicker label={STR.startedOn} value={start} onChange={setStart} max={today} />

        <View style={{ gap: spacing.sm }}>
          <Pressable
            accessibilityRole="switch"
            accessibilityState={{ checked: !hasEnd }}
            onPress={() => setHasEnd(!hasEnd)}
            style={{ minHeight: MIN_TARGET, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}
          >
            <View
              style={{
                width: 26,
                height: 26,
                borderRadius: radius.pill,
                borderWidth: 2,
                borderColor: t.primary,
                backgroundColor: !hasEnd ? t.primary : 'transparent',
              }}
            />
            <Text style={[typeScale.body, { color: t.text }]}>{STR.notEndedYet}</Text>
          </Pressable>
          {hasEnd ? <DayPicker label={STR.endedOn} value={shownEnd} onChange={setEnd} max={today} min={start} /> : null}
        </View>

        <Button label={STR.save} onPress={save} disabled={saving} />
        <Button label={STR.deletePeriod} variant="text" onPress={remove} />
      </ScrollView>
    </SafeAreaView>
  );
}
