import { View } from 'react-native';
import { todayLocal } from '../../domain/dates';
import { getIrregularityFlags } from '../../domain/flags';
import { getHeadline } from '../../domain/headline';
import { getDayInfo } from '../../domain/phases';
import { estimateOvulationDay, predictWithFallback } from '../../domain/prediction';
import { currentCycleRing } from '../../domain/ring';
import { getStage, mainAction } from '../../domain/stage';
import { useData } from '../../state/data';
import { useLanguage } from '../../state/language';
import { useReminders } from '../../state/reminders';
import { useSheets } from '../../state/sheets';
import { GearButton } from '../../ui/chrome';
import { CycleRingView } from '../../ui/CycleRing';
import { flagText } from '../../ui/flagText';
import { formatLong, formatRange, formatShort } from '../../ui/format';
import { GuideMessage } from '../../ui/Guide';
import { Button, Card, Disclaimer, Fab, Notice, PhaseChip, Screen, T, useHideOnScroll } from '../../ui/kit';

export default function TodayScreen() {
  const { S } = useLanguage();
  const { periods, rules, name } = useData();
  const { openTell } = useSheets();
  const fab = useHideOnScroll();
  const reminders = useReminders();
  const today = todayLocal();

  const stage = getStage(periods, today, rules);
  const action = mainAction(stage);
  const info = getDayInfo(today, periods, rules);
  const prediction = predictWithFallback(periods, rules);
  const ovulation = estimateOvulationDay(periods, rules);
  const ring = currentCycleRing(periods, rules);
  const flags = getIrregularityFlags(periods, today, rules);
  const lateDays = flags.find((f) => f.code === 'period_late')?.value ?? 0;
  const headline = getHeadline(periods, today, rules);
  const headlineText =
    headline.kind === 'period_day' ? S.today.headline.periodDay(headline.day)
    : headline.kind === 'unfinished' ? S.today.headline.unfinished(headline.day)
    : headline.kind === 'coming' ? S.today.headline.coming(headline.fromDays, headline.toDays)
    : headline.kind === 'any_day_now' ? S.today.headline.anyDayNow
    : headline.kind === 'late' ? S.today.headline.late(headline.days)
    : null;
  const needsAttention = headline.kind === 'late' || headline.kind === 'unfinished';
  const offerReminders = stage.kind !== 'none' && !reminders.asked && !reminders.enabled;
  const doctorFlags = flags.filter((f) => f.code !== 'period_late');

  const fabLabel = stage.kind === 'none' ? S.today.fab.first : action === 'end' ? S.today.fab.end : S.today.fab.start;
  const fabHint = stage.kind === 'none' ? S.today.fabHelp.first : action === 'end' ? S.today.fabHelp.end : S.today.fabHelp.start;

  let guide: string;
  if (stage.kind === 'none') guide = S.guide.askFirstPeriod(name);
  else if (stage.kind === 'in_period') guide = S.guide.periodGoingOn(name);
  else if (stage.kind === 'unfinished_period') guide = S.guide.unfinished(name, stage.periodDay ?? 0);
  else if (lateDays > 0) guide = S.guide.late;
  else if (prediction?.tentative) guide = S.guide.typical(name, rules.prediction.typicalCycleLengthDays);
  else guide = info.phase ? S.phases.guide[info.phase] : S.guide.askFirstPeriod(name);

  return (
    <View style={{ flex: 1 }}>
      <Screen title={S.today.greeting(name)} subtitle={formatLong(today, S)} actions={<GearButton />} onScroll={fab.onScroll} bottomSpace={110}>
        {headlineText ? (
          <Card tone={needsAttention ? 'attention' : 'primary'} style={{ gap: 4 }}>
            <T kind="heading">{headlineText}</T>
            {headline.kind === 'late' ? <T kind="caption" muted>{S.today.headline.lateHelp}</T> : null}
            {prediction && headline.kind !== 'period_day' && headline.kind !== 'unfinished' ? (
              <T kind="caption" muted>
                {formatRange(prediction.earliestStart, prediction.latestStart, S)} · {prediction.tentative ? S.today.typicalTag : S.today.estimateTag}
              </T>
            ) : null}
          </Card>
        ) : null}

        {offerReminders ? (
          <Notice
            icon="notifications-outline"
            title={S.today.remindersOffer.title}
            body={S.today.remindersOffer.body}
            actions={
              <>
                <Button small label={S.today.remindersOffer.yes} onPress={() => void reminders.setEnabled(true).then(() => reminders.markAsked())} />
                <Button small variant="text" label={S.today.remindersOffer.no} onPress={() => void reminders.markAsked()} />
              </>
            }
          />
        ) : null}

        <GuideMessage text={guide} mood={stage.kind === 'none' ? 'wave' : lateDays > 0 ? 'caring' : 'happy'} />

        {stage.kind === 'unfinished_period' && stage.period ? (
          <Notice
            title={S.today.unfinishedTitle}
            body={S.today.unfinishedBody(formatShort(stage.period.startDate, S))}
            actions={<Button small variant="tonal" label={S.today.unfinishedAction} onPress={() => openTell({ mode: 'end' })} />}
          />
        ) : null}

        {ring && info.cycleDay !== null ? (
          <Card style={{ alignItems: 'center', gap: 12, paddingVertical: 24 }}>
            <CycleRingView ring={ring} day={info.cycleDay}>
              <T kind="display" center numberOfLines={1} style={{ fontSize: 38, lineHeight: 44 }}>{S.today.dayOfCycle(info.cycleDay)}</T>
              <T muted center>{S.today.ofYourCycle}</T>
            </CycleRingView>
            {info.phase ? (
              <View style={{ alignItems: 'center', gap: 8 }}>
                <PhaseChip phase={info.phase} />
                <T muted center>{S.phases.meaning[info.phase]}</T>
              </View>
            ) : null}
            {info.phase === 'follicular' && ovulation && today < ovulation ? <T muted center>{S.today.ovulationAround(formatShort(ovulation, S))}</T> : null}
          </Card>
        ) : null}

        {prediction ? (
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <T muted>{S.today.nextTitle}</T>
              <T kind="caption" muted>{prediction.tentative ? S.today.typicalTag : S.today.estimateTag}</T>
            </View>
            <T kind="heading">{S.today.nextRange(formatRange(prediction.earliestStart, prediction.latestStart, S))}</T>
            <T kind="caption" muted>
              {prediction.tentative ? S.today.basisTypical(rules.prediction.typicalCycleLengthDays) : S.today.basisOwn(prediction.basedOnCycles, Math.round(prediction.averageLength))}
            </T>
          </Card>
        ) : null}

        {doctorFlags.map((flag) => (
          <Notice key={flag.code} title={S.flags.title} body={flagText(flag, S, rules)} icon="medkit-outline" />
        ))}

        <Disclaimer text={S.today.disclaimer} />
      </Screen>
      <Fab label={fabLabel} hint={fabHint} icon={action === 'end' && stage.kind !== 'none' ? 'checkmark-circle' : 'water'} visible={fab.visible} onPress={() => openTell({ mode: action })} />
    </View>
  );
}
