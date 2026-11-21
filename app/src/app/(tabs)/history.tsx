import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { AdBanner } from '../../ads/AdBanner';
import { NativeAdCard } from '../../ads/NativeAdCard';
import { completedCycleLengths, cycleRows, cycleStats } from '../../domain/cycles';
import { useData } from '../../state/data';
import { useLanguage } from '../../state/language';
import { useSheets } from '../../state/sheets';
import { useTokens } from '../../theme/useTokens';
import { GearButton } from '../../ui/chrome';
import { addDays, diffDays, todayLocal } from '../../domain/dates';
import { formatRange, formatShort } from '../../ui/format';
import { GuideMessage } from '../../ui/Guide';
import { router } from 'expo-router';
import { Button, Card, Divider, ListRow, Screen, T } from '../../ui/kit';

const BAR_AREA = 110;

export default function MyCyclesScreen() {
  const t = useTokens();
  const { S } = useLanguage();
  const { periods, rules, loading } = useData();
  const { openChange } = useSheets();

  const rows = cycleRows(periods, rules);
  const stats = cycleStats(periods, rules);
  const lengths = completedCycleLengths(periods).slice(-6);
  const chartMax = Math.max(rules.cycle.normalMaxDays + 5, ...lengths);
  const heightOf = (days: number) => (days / chartMax) * BAR_AREA;

  return (
    <Screen title={S.cycles.title} actions={<GearButton />} adSlot={<AdBanner />}>
      {loading ? null : rows.length === 0 ? (
        <>
          <GuideMessage text={S.cycles.emptyBody} />
          <Button variant="tonal" icon="add" label={S.history.addButton} onPress={() => router.push('/add-cycles')} />
        </>
      ) : (
        <>
          {stats ? (
            <Card style={{ gap: 16 }}>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <T kind="caption" muted>{S.cycles.usual}</T>
                  <T kind="heading">{S.common.days(Math.round(stats.medianLength))}</T>
                </View>
                <View style={{ flex: 1 }}>
                  <T kind="caption" muted>{S.cycles.range}</T>
                  <T kind="heading">{stats.shortest}–{stats.longest}</T>
                </View>
              </View>
              <View>
                <T kind="label">{S.cycles.chartTitle}</T>
                <View style={{ height: BAR_AREA + 22, flexDirection: 'row', alignItems: 'flex-end', gap: 8, paddingTop: 22 }}>
                  <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: heightOf(rules.cycle.normalMinDays), borderTopWidth: 1, borderStyle: 'dashed', borderColor: t.text2 }} />
                  <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: heightOf(rules.cycle.normalMaxDays), borderTopWidth: 1, borderStyle: 'dashed', borderColor: t.text2 }} />
                  {lengths.map((days, i) => (
                    <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
                      <T kind="caption">{days}</T>
                      <View style={{ width: '100%', height: heightOf(days), backgroundColor: t.primary, borderTopLeftRadius: 6, borderTopRightRadius: 6, opacity: 0.9 }} />
                    </View>
                  ))}
                </View>
                <T kind="caption" muted>{S.cycles.chartNote(rules.cycle.normalMinDays, rules.cycle.normalMaxDays)}</T>
              </View>
            </Card>
          ) : (
            <T kind="caption" muted>{S.cycles.learning}</T>
          )}

          <Card style={{ paddingVertical: 4 }}>
            {rows.map((row, i) => {
              // A cycle runs from its start to the day before the next start.
              const dates = row.cycleDays !== null
                ? formatRange(row.period.startDate, addDays(row.period.startDate, row.cycleDays - 1), S)
                : `${formatShort(row.period.startDate, S)} – ${S.common.today}`;
              return (
                <View key={row.period.id}>
                  {i === 3 ? <View style={{ paddingVertical: 8 }}><NativeAdCard kind="nativeCycles" /></View> : null}
                  {i > 0 ? <Divider /> : null}
                  <ListRow
                    title={dates}
                    subtitle={row.cycleDays !== null ? S.common.days(row.cycleDays) : S.cycles.currentDay(diffDays(row.period.startDate, todayLocal()) + 1)}
                    value={row.cycleDays === null ? S.cycles.current : row.tag ? (row.tag === 'short' ? S.cycles.tagShort : row.tag === 'gap' ? S.cycles.tagGap : S.cycles.tagLong) : undefined}
                    accessibilityLabel={`${S.change.title}: ${dates}`}
                    onPress={() => openChange(row.period.id)}
                    chevron
                    right={row.tag ? <Ionicons name="information-circle" size={20} color={t.attention} accessibilityLabel={row.tag === 'short' ? S.cycles.tagShort : row.tag === 'gap' ? S.cycles.tagGap : S.cycles.tagLong} /> : undefined}
                  />
                </View>
              );
            })}
          </Card>
          <Button variant="tonal" icon="add" label={S.history.addButton} onPress={() => router.push('/add-cycles')} />
          <T kind="caption" muted center>{S.cycles.showDoctor}</T>
        </>
      )}
    </Screen>
  );
}
