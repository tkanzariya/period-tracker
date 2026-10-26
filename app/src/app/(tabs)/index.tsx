import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { completedCycleLengths, sortPeriods } from '../../domain/cycles';
import { todayLocal } from '../../domain/dates';
import { getIrregularityFlags } from '../../domain/flags';
import { getDayInfo } from '../../domain/phases';
import { estimateOvulationDay, predictNextPeriod } from '../../domain/prediction';
import { currentCycleRing } from '../../domain/ring';
import { useData } from '../../state/data';
import { MIN_TARGET, radius, spacing, typeScale, useTokens } from '../../theme/tokens';
import { Body, Button, Card, Heading, PhaseChip } from '../../ui/components';
import { CycleRingView } from '../../ui/CycleRing';
import { DISCLAIMER, PHASE_MEANING, STR, TELL_DOCTOR_TITLE, flagMessage, guideMessage, type GuideSituation } from '../../ui/copy';
import { GuideMessage } from '../../ui/Guide';
import { formatLong, formatRange, formatShort } from '../../ui/format';

export default function TodayScreen() {
  const t = useTokens();
  const { periods, rules, loading, name, saveName } = useData();
  const [draftName, setDraftName] = useState('');
  const today = todayLocal();

  const sorted = sortPeriods(periods);
  const latest = sorted[sorted.length - 1];
  const info = getDayInfo(today, periods, rules);
  const prediction = predictNextPeriod(periods, rules);
  const ovulation = estimateOvulationDay(periods, rules);
  const ring = currentCycleRing(periods, rules);
  const flags = getIrregularityFlags(periods, today, rules);
  const completed = completedCycleLengths(periods).length;

  // A period with no end told yet counts as going on for a few days past the usual maximum.
  const periodGoingOn = !!latest && latest.endDate === null && (info.cycleDay ?? 99) <= rules.period.normalMaxDays + 3;
  const lateDays = flags.find((f) => f.code === 'period_late')?.value ?? 0;

  const openTell = (mode: 'start' | 'end' | 'note') => router.push({ pathname: '/log', params: { mode, date: today } });

  let situation: GuideSituation;
  if (name === null) situation = { kind: 'ask_name' };
  else if (!latest) situation = { kind: 'ask_first_period' };
  else if (periodGoingOn) situation = { kind: 'period_going_on' };
  else if (lateDays > 0) situation = { kind: 'late', days: lateDays };
  else if (info.phase) situation = { kind: 'phase', phase: info.phase };
  else situation = { kind: 'still_learning' };

  const moreCyclesNeeded = Math.max(1, rules.prediction.minCyclesForPrediction - completed);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }} keyboardShouldPersistTaps="handled">
        <View>
          <Body secondary>{formatLong(today)}</Body>
          <Heading>{STR.hiName(name)}</Heading>
        </View>

        {loading ? null : (
          <>
            <GuideMessage text={guideMessage(situation, name)} mood={situation.kind === 'ask_name' ? 'wave' : situation.kind === 'late' ? 'caring' : 'happy'} />

            {name === null ? (
              <Card style={{ gap: spacing.md }}>
                <Body secondary>{STR.yourName}</Body>
                <TextInput
                  value={draftName}
                  onChangeText={setDraftName}
                  placeholder={STR.nameHint}
                  placeholderTextColor={t.text2}
                  autoCapitalize="words"
                  style={[
                    typeScale.body,
                    { minHeight: MIN_TARGET, borderWidth: 1, borderColor: t.line, borderRadius: radius.button, paddingHorizontal: spacing.md, color: t.text, backgroundColor: t.background },
                  ]}
                />
                <Button label={STR.continue} disabled={!draftName.trim()} onPress={() => saveName(draftName)} />
              </Card>
            ) : !latest ? (
              <Button label={STR.tellLastPeriod} onPress={() => openTell('start')} />
            ) : (
              <>
                <Card style={{ alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl }}>
                  <CycleRingView ring={ring} day={info.cycleDay}>
                    <Text style={[typeScale.largeTitle, { fontSize: 40, lineHeight: 46, color: t.text }]}>{STR.dayOfCycle(info.cycleDay ?? 1)}</Text>
                    <Body secondary>{STR.ofYourCycle}</Body>
                  </CycleRingView>
                  {info.phase ? (
                    <View style={{ alignItems: 'center', gap: spacing.sm }}>
                      <PhaseChip phase={info.phase} />
                      <Body secondary style={{ textAlign: 'center' }}>
                        {PHASE_MEANING[info.phase]}
                      </Body>
                    </View>
                  ) : null}
                  {info.phase === 'follicular' && ovulation && today < ovulation ? (
                    <Body secondary>{STR.ovulationAround(formatShort(ovulation))}</Body>
                  ) : null}
                  <Body secondary style={{ textAlign: 'center' }}>
                    {STR.dayOfCycleSub}
                  </Body>
                </Card>

                {prediction ? (
                  <Card>
                    <Body secondary>{STR.nextPeriodTitle}</Body>
                    <Text style={[typeScale.title, { color: t.text }]}>{STR.nextPeriodRange(formatRange(prediction.earliestStart, prediction.latestStart))}</Text>
                    <Body secondary>{STR.nextPeriodBasis(prediction.basedOnCycles, Math.round(prediction.averageLength))}</Body>
                  </Card>
                ) : (
                  <Card>
                    <Text style={[typeScale.headline, { color: t.text }]}>{STR.stillLearningTitle}</Text>
                    <Body secondary>{STR.stillLearningBody(moreCyclesNeeded)}</Body>
                  </Card>
                )}

                {flags.map((flag) => (
                  <Card key={flag.code} accent={t.phase.luteal.fg}>
                    <Text style={[typeScale.subhead, { color: t.text, fontWeight: '600' }]}>{TELL_DOCTOR_TITLE}</Text>
                    <Body secondary>{flagMessage(flag, rules)}</Body>
                  </Card>
                ))}

                <View style={{ gap: spacing.sm }}>
                  {periodGoingOn ? (
                    <Button label={STR.periodEnded} onPress={() => openTell('end')} />
                  ) : (
                    <Button label={STR.periodStarted} onPress={() => openTell('start')} />
                  )}
                  <Button label={STR.addNote} variant="secondary" onPress={() => openTell('note')} />
                </View>
              </>
            )}

            <Body secondary style={{ textAlign: 'center' }}>
              {DISCLAIMER}
            </Body>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
