import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { addDays, todayLocal } from '../../domain/dates';
import { getIrregularityFlags } from '../../domain/flags';
import { getDayInfo } from '../../domain/phases';
import { estimateOvulationDay, predictNextPeriod } from '../../domain/prediction';
import { completedCycleLengths, sortPeriods } from '../../domain/cycles';
import { useData } from '../../state/data';
import { spacing, typeScale, useTokens } from '../../theme/tokens';
import { Body, Button, Card, Heading, PhaseChip } from '../../ui/components';
import { DISCLAIMER, flagMessage } from '../../ui/copy';
import { formatLong, formatRange, formatShort } from '../../ui/format';

export default function TodayScreen() {
  const t = useTokens();
  const { periods, rules, loading } = useData();
  const today = todayLocal();

  const sorted = sortPeriods(periods);
  const latest = sorted[sorted.length - 1];
  const info = getDayInfo(today, periods, rules);
  const prediction = predictNextPeriod(periods, rules);
  const ovulation = estimateOvulationDay(periods, rules);
  const flags = getIrregularityFlags(periods, today, rules);
  const completed = completedCycleLengths(periods).length;

  // A period with no end logged is treated as in progress for a few days past the normal maximum.
  const inProgress = !!latest && latest.endDate === null && (info.cycleDay ?? 99) <= rules.period.normalMaxDays + 3;

  const openLog = (mode: 'start' | 'end' | 'flow') => router.push({ pathname: '/log', params: { mode, date: today } });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.md }}>
        <View>
          <Body secondary>{formatLong(today)}</Body>
          <Heading>Today</Heading>
        </View>

        {loading ? null : !latest ? (
          <>
            <Card style={{ alignItems: 'center', paddingVertical: spacing.xxl, gap: spacing.sm }}>
              <Text style={[typeScale.headline, { color: t.text, textAlign: 'center' }]}>Let's start with your last period</Text>
              <Body secondary style={{ textAlign: 'center' }}>
                Add the date it started. After 2–3 cycles I can estimate when your next one is due.
              </Body>
            </Card>
            <Button label="Add last period start" onPress={() => openLog('start')} />
          </>
        ) : (
          <>
            <Card style={{ alignItems: 'center', gap: spacing.sm }}>
              <Body secondary>Cycle day</Body>
              <Text style={[typeScale.largeTitle, { fontSize: 44, lineHeight: 52, color: t.text }]}>{info.cycleDay}</Text>
              {info.phase ? (
                <PhaseChip phase={info.phase} />
              ) : (
                <Body secondary>Phase appears once I have enough cycles to estimate</Body>
              )}
              {info.phase === 'follicular' && ovulation && today < ovulation ? (
                <Body secondary>Ovulation likely around {formatShort(ovulation)} (estimate)</Body>
              ) : null}
              {info.phase === 'ovulation' ? <Body secondary>Around your estimated ovulation (estimate)</Body> : null}
            </Card>

            {prediction ? (
              <Card>
                <Body secondary>Next period expected</Body>
                <Text style={[typeScale.title, { color: t.text }]}>{formatRange(prediction.earliestStart, prediction.latestStart)}</Text>
                <Body secondary>
                  Based on your last {prediction.basedOnCycles} {prediction.basedOnCycles === 1 ? 'cycle' : 'cycles'} (about {Math.round(prediction.averageLength)} days)
                </Body>
              </Card>
            ) : (
              <Card>
                <Text style={[typeScale.headline, { color: t.text }]}>Keep logging</Text>
                <Body secondary>
                  I need {Math.max(1, rules.prediction.minCyclesForPrediction - completed)} more completed{' '}
                  {rules.prediction.minCyclesForPrediction - completed <= 1 ? 'cycle' : 'cycles'} before I can estimate your next period.
                </Body>
              </Card>
            )}

            {flags.map((flag) => (
              <Card key={flag.code} accent={t.phase.luteal.fg}>
                <Text style={[typeScale.subhead, { color: t.text, fontWeight: '600' }]}>Worth mentioning to a doctor</Text>
                <Body secondary>{flagMessage(flag)}</Body>
              </Card>
            ))}

            <View style={{ gap: spacing.sm, marginTop: spacing.xs }}>
              {inProgress ? (
                <Button label="Log period end" onPress={() => openLog('end')} />
              ) : (
                <Button label="Log period start" onPress={() => openLog('start')} />
              )}
              <Button label="Log today" variant="secondary" onPress={() => openLog('flow')} />
            </View>
          </>
        )}

        <Body secondary style={{ textAlign: 'center', marginTop: spacing.md }}>{DISCLAIMER}</Body>
      </ScrollView>
    </SafeAreaView>
  );
}
