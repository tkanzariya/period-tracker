import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { averagePeriodLength, completedCycleLengths, cycleRows, cycleStats } from '../../domain/cycles';
import { useData } from '../../state/data';
import { useLanguage } from '../../state/language';
import { useSheets } from '../../state/sheets';
import { useTokens } from '../../theme/useTokens';
import { GearButton } from '../../ui/chrome';
import { formatRange, formatShort } from '../../ui/format';
import { GuideMessage } from '../../ui/Guide';
import { Card, Divider, ListRow, Screen, T } from '../../ui/kit';

const BAR_AREA = 110;

export default function MyCyclesScreen() {
  const t = useTokens();
  const { S } = useLanguage();
  const { periods, rules, loading } = useData();
  const { openChange } = useSheets();

  const rows = cycleRows(periods, rules);
  const stats = cycleStats(periods, rules);
  const periodAvg = averagePeriodLength(periods);
  const lengths = completedCycleLengths(periods).slice(-6);
  const chartMax = Math.max(rules.cycle.normalMaxDays + 5, ...lengths);
  const heightOf = (days: number) => (days / chartMax) * BAR_AREA;

  return (
    <Screen title={S.cycles.title} actions={<GearButton />}>
      {loading ? null : rows.length === 0 ? (
        <GuideMessage text={S.cycles.emptyBody} />
      ) : (
        <>
          {stats ? (
            <Card style={{ gap: 16 }}>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <T kind="caption" muted>{S.cycles.usual}</T>
                  <T kind="heading">{S.common.days(Math.round(stats.averageLength))}</T>
                </View>
                <View style={{ flex: 1 }}>
                  <T kind="caption" muted>{S.cycles.range}</T>
                  <T kind="heading">{stats.shortest}–{stats.longest}</T>
                </View>
                {periodAvg !== null ? (
                  <View style={{ flex: 1 }}>
                    <T kind="caption" muted>{S.cycles.usualPeriod}</T>
                    <T kind="heading">{S.common.days(Math.round(periodAvg))}</T>
                  </View>
                ) : null}
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
              const dates = row.period.endDate ? formatRange(row.period.startDate, row.period.endDate, S) : formatShort(row.period.startDate, S);
              return (
                <View key={row.period.id}>
                  {i > 0 ? <Divider /> : null}
                  <ListRow
                    title={dates}
                    subtitle={row.periodDays !== null ? S.cycles.periodLasted(row.periodDays) : S.cycles.endNotTold}
                    value={row.cycleDays !== null ? S.cycles.cycleWas(row.cycleDays) : S.cycles.current}
                    accessibilityLabel={`${S.change.title}: ${dates}`}
                    onPress={() => openChange(row.period.id)}
                    chevron
                    right={row.tag ? <Ionicons name="information-circle" size={20} color={t.attention} accessibilityLabel={row.tag === 'short' ? S.cycles.tagShort : S.cycles.tagLong} /> : undefined}
                  />
                </View>
              );
            })}
          </Card>
          <T kind="caption" muted center>{S.cycles.showDoctor}</T>
        </>
      )}
    </Screen>
  );
}
