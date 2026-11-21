import { Ionicons } from '@expo/vector-icons';
import { useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type GestureResponderEvent } from 'react-native';
import { AdBanner } from '../../ads/AdBanner';
import { NativeAdCard } from '../../ads/NativeAdCard';
import { WEEK_STARTS_ON } from '../../config/display';
import { monthGrid, shiftMonth } from '../../domain/calendar';
import { addDays, parseDate, todayLocal, type DateStr } from '../../domain/dates';
import { getDayInfo, type DayInfo } from '../../domain/phases';
import { predictWithFallback } from '../../domain/prediction';
import type { Phase } from '../../domain/types';
import { useData } from '../../state/data';
import { useLanguage } from '../../state/language';
import { useSheets } from '../../state/sheets';
import { useTokens } from '../../theme/useTokens';
import { formatLong, formatMonthYear } from '../../ui/format';
import { Button, Card, IconButton, PhaseChip, Screen, Sheet, T } from '../../ui/kit';
import type { BandDay } from '../../ui/bandRuns';
import { PhaseBands } from '../../ui/PhaseBands';

const ROW = 52;
const PHASES: Phase[] = ['menstrual', 'follicular', 'ovulation', 'luteal'];

export default function CalendarScreen() {
  const t = useTokens();
  const { S } = useLanguage();
  const { periods, notes, rules } = useData();
  const { openTell, openChange } = useSheets();
  const today = todayLocal();
  const now = new Date(parseDate(today));
  const [view, setView] = useState({ year: now.getUTCFullYear(), month: now.getUTCMonth() });
  const [selected, setSelected] = useState<DateStr | null>(null);
  const [legendPhase, setLegendPhase] = useState<Phase | null>(null);

  const weeks = useMemo(() => monthGrid(view.year, view.month, WEEK_STARTS_ON), [view]);
  const prediction = useMemo(() => predictWithFallback(periods, rules), [periods, rules]);
  const initials = Array.from({ length: 7 }, (_, i) => S.dates.initials[(i + WEEK_STARTS_ON) % 7]);

  // Do not paint guesses forever into the future: stop after the next expected period.
  const horizon = prediction ? addDays(prediction.latestStart, rules.period.assumedLengthDays) : null;
  const infoFor = (date: DateStr): DayInfo | null => {
    const info = getDayInfo(date, periods, rules);
    if (info.cycleDay === null) return null;
    if (date > today && (horizon === null || date > horizon)) return null;
    return info;
  };
  const bandFor = (info: DayInfo | null): BandDay | null => {
    if (!info?.phase) return null;
    // Days that have not come yet are drawn softer: they are guesses.
    return { phase: info.phase, guess: info.date > today };
  };

  const info = selected ? infoFor(selected) : null;
  const note = selected ? (notes.find((n) => n.date === selected)?.note ?? null) : null;
  const periodHere = selected ? periods.find((p) => p.startDate === selected) : undefined;
  const go = (delta: number) => setView((v) => shiftMonth(v.year, v.month, delta));
  const goRef = useRef(go);
  goRef.current = go;
  const isThisMonth = view.year === now.getUTCFullYear() && view.month === now.getUTCMonth();
  // Swipe left or right on the month to change it (plain touch events: they work on the phone and in the browser).
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const swipe = {
    onTouchStart: (e: GestureResponderEvent) => {
      touchStart.current = { x: e.nativeEvent.pageX, y: e.nativeEvent.pageY };
    },
    onTouchEnd: (e: GestureResponderEvent) => {
      const from = touchStart.current;
      touchStart.current = null;
      if (!from) return;
      const dx = e.nativeEvent.pageX - from.x;
      const dy = e.nativeEvent.pageY - from.y;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 2) goRef.current(dx < 0 ? 1 : -1);
    },
  };
  const act = (fn: () => void) => {
    setSelected(null);
    fn();
  };

  return (
    <Screen title={S.calendar.title} adSlot={<AdBanner />}>
      <View style={styles.monthRow}>
        <IconButton icon="chevron-back" label={S.dates.previousMonth} onPress={() => go(-1)} color={t.primary} size={28} />
        <T kind="heading">{formatMonthYear(view.year, view.month, S)}</T>
        <IconButton icon="chevron-forward" label={S.dates.nextMonth} onPress={() => go(1)} color={t.primary} size={28} />
      </View>

      {isThisMonth ? null : (
        <View style={{ alignItems: 'center' }}>
          <Button small variant="tonal" icon="today-outline" label={S.calendar.todayChip} onPress={() => setView({ year: now.getUTCFullYear(), month: now.getUTCMonth() })} />
        </View>
      )}

      <View {...swipe}>
        <View style={{ flexDirection: 'row' }}>
          {initials.map((d, i) => (
            <T key={i} kind="caption" muted center style={{ flex: 1, paddingBottom: 4 }}>{d}</T>
          ))}
        </View>
        {weeks.map((week, wi) => {
          const infos = week.map((d) => (d ? infoFor(d) : null));
          return (
            <View key={wi} style={{ height: ROW }}>
              <PhaseBands days={infos.map(bandFor)} height={ROW} id={`w${view.year}-${view.month}-${wi}`} />
              <View style={{ flexDirection: 'row', height: ROW }}>
                {week.map((date, di) => {
                  if (!date) return <View key={di} style={{ flex: 1 }} />;
                  const isToday = date === today;
                  const isSelected = date === selected;
                  const hasNote = notes.some((n) => n.date === date);
                  const ovulation = infoFor(date)?.isOvulationDay ?? false;
                  return (
                    <Pressable
                      key={di}
                      accessibilityRole="button"
                      accessibilityLabel={formatLong(date, S)}
                      accessibilityState={{ selected: isSelected }}
                      onPress={() => setSelected(date)}
                      style={styles.cell}
                    >
                      <View style={[styles.day, ovulation && { borderWidth: 2, borderColor: t.phase.ovulation.fg }, isToday && { borderWidth: 2, borderColor: t.text }]}>
                        <Text style={{ color: t.text, fontSize: 16, fontWeight: isToday ? '800' : '500' }}>{Number(date.slice(8))}</Text>
                      </View>
                      {periods.some((p) => p.startDate === date) ? <Ionicons name="water" size={12} color={t.text} style={{ position: 'absolute', top: 3, left: 14 }} /> : null}
                      {hasNote ? <Ionicons name="create" size={11} color={t.text2} style={{ position: 'absolute', bottom: 4, right: 12 }} /> : null}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          );
        })}
      </View>

      <Card>
        <T kind="label">{S.calendar.legendTitle}</T>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {PHASES.map((p) => (
            <Pressable key={p} accessibilityRole="button" accessibilityLabel={`${S.phases.names[p]}: ${S.phases.meaning[p]}`} onPress={() => setLegendPhase(legendPhase === p ? null : p)}>
              <PhaseChip phase={p} />
            </Pressable>
          ))}
        </View>
        {legendPhase ? <T>{S.phases.meaning[legendPhase]}</T> : <T kind="caption" muted>{S.calendar.legendTap}</T>}
        <T kind="caption" muted>{S.calendar.startMarker}</T>
        <T kind="caption" muted>{S.calendar.guessLegend}</T>
        <T kind="caption" muted>{S.calendar.ovulationRingLegend}</T>
        <T kind="caption" muted>{S.calendar.legendNote}</T>
      </Card>

      <NativeAdCard kind="nativeCalendar" />

      <Sheet visible={selected !== null} onClose={() => setSelected(null)} title={selected ? formatLong(selected, S) : undefined}>
        {selected ? (
          <>
            {info?.phase ? (
              <View style={{ gap: 8, alignItems: 'flex-start' }}>
                {info.cycleDay !== null ? <T kind="label">{periodHere ? S.calendar.cycleStarts : S.calendar.dayOfCycle(info.cycleDay)}</T> : null}
                <PhaseChip phase={info.phase} />
                <T muted>{S.phases.meaning[info.phase]}</T>
                {info.isOvulationDay ? <T>{S.calendar.ovulationDay}</T> : info.isFertileWindow ? <T>{S.calendar.fertileDay}</T> : null}
                {info.isTentative ? <T kind="caption" muted>{S.calendar.typicalNote}</T> : null}
              </View>
            ) : (
              <T muted>{selected > today ? S.calendar.dayFuture : S.calendar.dayNoData}</T>
            )}
            {note ? (
              <Card tone="primary">
                <T kind="caption" muted>{S.calendar.yourNote}</T>
                <T>{note}</T>
              </Card>
            ) : null}
            {selected <= today ? (
              <View style={{ gap: 8 }}>
                {periodHere ? null : <Button variant="tonal" icon="water" label={S.calendar.periodStartedHere} onPress={() => act(() => openTell({ mode: 'start', date: selected }))} />}
                {periodHere ? <Button variant="tonal" icon="create-outline" label={S.calendar.changePeriod} onPress={() => act(() => openChange(periodHere.id))} /> : null}
                <Button variant="text" icon="document-text-outline" label={note ? S.calendar.editNote : S.calendar.addNote} onPress={() => act(() => openTell({ mode: 'note', date: selected }))} />
              </View>
            ) : null}
          </>
        ) : null}
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cell: { flex: 1, height: ROW, alignItems: 'center', justifyContent: 'center' },
  day: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
});
