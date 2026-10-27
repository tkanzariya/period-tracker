import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { averagePeriodLength, completedCycleLengths, cycleRows, cycleStats } from '../../domain/cycles';
import { useData } from '../../state/data';
import { radius, spacing, typeScale, useTokens } from '../../theme/tokens';
import { Body, Card, Heading } from '../../ui/components';
import { STR } from '../../ui/copy';
import { formatRange, formatShort } from '../../ui/format';
import { GuideMessage } from '../../ui/Guide';

const BAR_AREA = 110;

export default function MyCyclesScreen() {
  const t = useTokens();
  const { periods, rules, loading } = useData();

  const rows = cycleRows(periods, rules);
  const stats = cycleStats(periods, rules);
  const periodAvg = averagePeriodLength(periods);
  const lengths = completedCycleLengths(periods).slice(-6);
  const chartMax = Math.max(rules.cycle.normalMaxDays + 5, ...lengths);
  const heightOf = (days: number) => (days / chartMax) * BAR_AREA;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <Heading>{STR.cyclesTitle}</Heading>

        {loading ? null : rows.length === 0 ? (
          <>
            <GuideMessage text={STR.noCyclesBody} />
          </>
        ) : (
          <>
            {stats ? (
              <Card style={{ gap: spacing.md }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ flex: 1 }}>
                    <Body secondary>{STR.averageCycle}</Body>
                    <Text style={[typeScale.title, { color: t.text }]}>{STR.daysUnit(Math.round(stats.averageLength))}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Body secondary>{STR.usualRange}</Body>
                    <Text style={[typeScale.title, { color: t.text }]}>
                      {stats.shortest}–{stats.longest}
                    </Text>
                  </View>
                  {periodAvg !== null ? (
                    <View style={{ flex: 1 }}>
                      <Body secondary>{STR.averagePeriod}</Body>
                      <Text style={[typeScale.title, { color: t.text }]}>{STR.daysUnit(Math.round(periodAvg))}</Text>
                    </View>
                  ) : null}
                </View>

                <View>
                  <View style={{ height: BAR_AREA + 22, flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, paddingTop: 22 }}>
                    {/* the usual range, drawn as two thin lines behind the bars */}
                    <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: heightOf(rules.cycle.normalMinDays), borderTopWidth: 1, borderStyle: 'dashed', borderColor: t.text2 }} />
                    <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: heightOf(rules.cycle.normalMaxDays), borderTopWidth: 1, borderStyle: 'dashed', borderColor: t.text2 }} />
                    {lengths.map((days, i) => (
                      <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
                        <Text style={[typeScale.footnote, { color: t.text }]}>{days}</Text>
                        <View style={{ width: '100%', height: heightOf(days), backgroundColor: t.primary, borderTopLeftRadius: 6, borderTopRightRadius: 6, opacity: 0.9 }} />
                      </View>
                    ))}
                  </View>
                  <Body secondary>
                    {STR.last6}. Dashed lines show {rules.cycle.normalMinDays} and {rules.cycle.normalMaxDays} days.
                  </Body>
                </View>
              </Card>
            ) : null}

            <Card style={{ paddingVertical: spacing.xs }}>
              {rows.map((row, i) => {
                const end = row.period.endDate ?? row.period.startDate;
                const dates = row.period.endDate ? formatRange(row.period.startDate, end) : formatShort(row.period.startDate);
                return (
                  <Pressable
                    key={row.period.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Change period from ${dates}`}
                    onPress={() => router.push({ pathname: '/period/[id]', params: { id: row.period.id } })}
                    style={({ pressed }) => ({
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: spacing.md,
                      minHeight: 64,
                      paddingVertical: spacing.md,
                      borderTopWidth: i === 0 ? 0 : 1,
                      borderTopColor: t.line,
                      opacity: pressed ? 0.6 : 1,
                    })}
                  >
                    <View style={{ flex: 1, gap: 2 }}>
                      <Text style={[typeScale.headline, { color: t.text }]}>{dates}</Text>
                      <Body secondary>{row.periodDays !== null ? STR.periodLasted(row.periodDays) : STR.periodEndNotTold}</Body>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <Text style={[typeScale.headline, { color: t.text }]}>{row.cycleDays !== null ? STR.cycleWas(row.cycleDays) : STR.stillGoing}</Text>
                      {row.tag ? (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: t.phase.luteal.bg, borderRadius: radius.pill, paddingHorizontal: spacing.sm, paddingVertical: 2 }}>
                          <Ionicons name="information-circle" size={14} color={t.phase.luteal.fg} />
                          <Text style={[typeScale.footnote, { color: t.phase.luteal.fg, fontWeight: '600' }]}>{row.tag === 'short' ? STR.tagShort : STR.tagLong}</Text>
                        </View>
                      ) : null}
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={t.text2} />
                  </Pressable>
                );
              })}
            </Card>
            <Body secondary style={{ textAlign: 'center' }}>
              {STR.showDoctor}
            </Body>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
