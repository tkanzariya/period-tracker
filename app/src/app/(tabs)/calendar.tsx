import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WEEK_STARTS_ON } from '../../config/display';
import { monthGrid, shiftMonth, weekdayLabels } from '../../domain/calendar';
import { addDays, parseDate, todayLocal, type DateStr } from '../../domain/dates';
import { getDayInfo, type DayInfo } from '../../domain/phases';
import { predictNextPeriod } from '../../domain/prediction';
import { useData } from '../../state/data';
import { MIN_TARGET, radius, spacing, typeScale, useTokens } from '../../theme/tokens';
import { Body, Button, Card, PhaseChip } from '../../ui/components';
import { PHASE_MEANING, STR } from '../../ui/copy';
import { formatMedium } from '../../ui/format';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function CalendarScreen() {
  const t = useTokens();
  const { periods, notes, rules } = useData();
  const today = todayLocal();
  const now = new Date(parseDate(today));
  const [view, setView] = useState({ year: now.getUTCFullYear(), month: now.getUTCMonth() });
  const [selected, setSelected] = useState<DateStr>(today);

  const weeks = useMemo(() => monthGrid(view.year, view.month, WEEK_STARTS_ON), [view]);
  const prediction = useMemo(() => predictNextPeriod(periods, rules), [periods, rules]);

  // Do not paint guesses forever into the future: stop after the next expected period.
  const horizon = prediction ? addDays(prediction.latestStart, rules.period.assumedLengthDays) : null;
  const infoFor = (date: DateStr): DayInfo | null => {
    const info = getDayInfo(date, periods, rules);
    if (info.cycleDay === null) return null;
    if (date > today && (horizon === null || date > horizon)) return null;
    return info;
  };

  const selectedInfo = infoFor(selected);
  const selectedNote = notes.find((n) => n.date === selected)?.note ?? null;
  const go = (delta: number) => setView(shiftMonth(view.year, view.month, delta));

  const chevron = (name: string, icon: 'chevron-back' | 'chevron-forward', delta: number) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={name}
      onPress={() => go(delta)}
      style={{ width: MIN_TARGET, height: MIN_TARGET, alignItems: 'center', justifyContent: 'center' }}
    >
      <Ionicons name={icon} size={26} color={t.primary} />
    </Pressable>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          {chevron('Month before', 'chevron-back', -1)}
          <Text style={[typeScale.title, { color: t.text }]} accessibilityRole="header">
            {MONTHS[view.month]} {view.year}
          </Text>
          {chevron('Month after', 'chevron-forward', 1)}
        </View>

        <View>
          <View style={{ flexDirection: 'row' }}>
            {weekdayLabels(WEEK_STARTS_ON).map((label, i) => (
              <Text key={i} style={[typeScale.footnote, { flex: 1, textAlign: 'center', color: t.text2, paddingBottom: spacing.xs }]}>
                {label}
              </Text>
            ))}
          </View>
          {weeks.map((week, wi) => (
            <View key={wi} style={{ flexDirection: 'row' }}>
              {week.map((date, di) => {
                if (!date) return <View key={di} style={{ flex: 1, height: 46 }} />;
                const info = infoFor(date);
                const phase = info?.phase ?? null;
                const colors = phase ? t.phase[phase] : null;
                const isToday = date === today;
                const isSelected = date === selected;
                return (
                  <Pressable
                    key={di}
                    accessibilityRole="button"
                    accessibilityLabel={formatMedium(date)}
                    accessibilityState={{ selected: isSelected }}
                    onPress={() => setSelected(date)}
                    style={{ flex: 1, height: 46, padding: 1.5 }}
                  >
                    <View
                      style={{
                        flex: 1,
                        borderRadius: 10,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: colors ? colors.bg : 'transparent',
                        borderWidth: isSelected ? 2 : info?.isPredictedPeriod || isToday ? 1.5 : 0,
                        borderColor: isSelected ? t.text : info?.isPredictedPeriod ? t.phase.menstrual.fg : t.text2,
                        borderStyle: info?.isPredictedPeriod && !isSelected ? 'dashed' : 'solid',
                      }}
                    >
                      <Text style={[typeScale.subhead, { color: colors && phase === 'menstrual' ? colors.fg : t.text, fontWeight: phase === 'menstrual' || isToday ? '700' : '400' }]}>
                        {Number(date.slice(8))}
                      </Text>
                      {info?.isFertileWindow ? (
                        <View style={{ position: 'absolute', bottom: 4, left: 10, right: 10, height: 3, borderRadius: 2, backgroundColor: t.phase.ovulation.fg }} />
                      ) : null}
                      {info?.isOvulationDay ? (
                        <View style={{ position: 'absolute', top: 2, right: 3 }}>
                          <Ionicons name="sparkles" size={10} color={t.phase.ovulation.fg} />
                        </View>
                      ) : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          <LegendChip bg={t.phase.menstrual.bg} fg={t.phase.menstrual.fg} icon="water" label={STR.legendPeriod} />
          <LegendChip bg={t.phase.ovulation.bg} fg={t.phase.ovulation.fg} icon="sparkles" label={STR.legendOvulation} />
          <LegendChip bg={t.surface2} fg={t.phase.ovulation.fg} icon="remove" label={STR.legendFertile} />
          <LegendChip bg={t.surface2} fg={t.phase.menstrual.fg} icon="ellipse-outline" label={STR.legendNext} />
        </View>

        <Card style={{ gap: spacing.sm }}>
          <Text style={[typeScale.headline, { color: t.text }]}>{formatMedium(selected)}</Text>
          {selectedInfo?.phase ? (
            <View style={{ alignItems: 'flex-start', gap: spacing.sm }}>
              <PhaseChip phase={selectedInfo.phase} />
              <Body secondary>{PHASE_MEANING[selectedInfo.phase]}</Body>
            </View>
          ) : (
            <Body secondary>{selected > today ? STR.dayNotYet : STR.dayNoData}</Body>
          )}
          {selectedInfo?.isOvulationDay ? <Body>{STR.dayOvulation}</Body> : selectedInfo?.isFertileWindow ? <Body>{STR.dayFertile}</Body> : null}
          {selectedInfo?.isPredictedPeriod ? <Body>{STR.dayPredictedPeriod}</Body> : null}
          {selectedNote ? (
            <View style={{ borderLeftWidth: 3, borderLeftColor: t.primary, paddingLeft: spacing.md }}>
              <Body secondary>{STR.dayNote}</Body>
              <Body>{selectedNote}</Body>
            </View>
          ) : null}
          {selected <= today ? (
            <Button label={STR.tellAboutDay} variant="secondary" onPress={() => router.push({ pathname: '/log', params: { mode: 'note', date: selected } })} />
          ) : null}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function LegendChip({ bg, fg, icon, label }: { bg: string; fg: string; icon: 'water' | 'sparkles' | 'remove' | 'ellipse-outline'; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: bg, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: 6 }}>
      <Ionicons name={icon} size={14} color={fg} />
      <Text style={[typeScale.footnote, { color: fg, fontWeight: '600' }]}>{label}</Text>
    </View>
  );
}
