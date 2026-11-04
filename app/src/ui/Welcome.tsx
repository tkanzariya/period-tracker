import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { addDays, todayLocal, type DateStr } from '../domain/dates';
import { useData } from '../state/data';
import { useLanguage } from '../state/language';
import { DateField } from './DateField';
import { GuideAvatar } from './Guide';
import { Button, Card, Field, Input, Screen, T } from './kit';
import { Logo } from './Logo';

type Step = 'intro' | 'name' | 'last' | 'tour';

/**
 * First run: hello, privacy and "guesses only", her name, the start of her last period, then an offer
 * of the tour. Nothing is saved until the end, so she can always go back.
 */
export function Welcome() {
  const { S } = useLanguage();
  const data = useData();
  const today = todayLocal();
  const [step, setStep] = useState<Step>('intro');
  const [name, setName] = useState('');
  const [last, setLast] = useState<DateStr | null>(null);
  const [date, setDate] = useState<DateStr>(addDays(today, -7));

  async function finish(showTour: boolean) {
    if (name.trim()) await data.saveName(name);
    if (last) await data.periodStarted(last, null);
    await data.markTourSeen();
    await data.markWelcomeDone();
    if (showTour) setTimeout(() => router.push('/tour'), 400);
  }

  if (step === 'intro') {
    return (
      <Screen footer={<Button label={S.welcome.start} onPress={() => setStep('name')} />}>
        <View style={{ alignItems: 'center', gap: 16, paddingTop: 24 }}>
          <Logo size={88} />
          <T kind="title" center>{S.welcome.title}</T>
          <T center muted>{S.welcome.intro}</T>
        </View>
        <Card>
          <T kind="label">{S.welcome.privateTitle}</T>
          <T muted>{S.welcome.privateBody}</T>
        </Card>
        <Card>
          <T kind="label">{S.welcome.guessTitle}</T>
          <T muted>{S.welcome.guessBody}</T>
        </Card>
      </Screen>
    );
  }

  if (step === 'name') {
    return (
      <Screen
        back
        onBack={() => setStep('intro')}
        footer={
          <>
            <Button label={S.welcome.nameContinue} onPress={() => setStep('last')} disabled={!name.trim()} />
            <Button variant="text" label={S.common.skip} onPress={() => { setName(''); setStep('last'); }} />
          </>
        }
      >
        <View style={{ alignItems: 'center' }}>
          <GuideAvatar size={96} mood="wave" />
        </View>
        <T kind="title" center>{S.welcome.nameTitle}</T>
        <Field label={S.welcome.nameLabel} hint={S.welcome.nameWhy}>
          <Input value={name} onChange={setName} label={S.welcome.nameLabel} placeholder={S.welcome.nameExample} autoCapitalize="words" autoFocus maxLength={40} />
        </Field>
      </Screen>
    );
  }

  if (step === 'last') {
    return (
      <Screen
        back
        onBack={() => setStep('name')}
        footer={
          <>
            <Button label={S.common.next} onPress={() => { setLast(date); setStep('tour'); }} />
            <Button variant="text" label={S.welcome.lastSkip} onPress={() => { setLast(null); setStep('tour'); }} />
          </>
        }
      >
        <T kind="title" center>{S.welcome.lastTitle}</T>
        <T muted center>{S.welcome.lastBody}</T>
        <Field label={S.welcome.lastAction}>
          <DateField value={date} onChange={setDate} label={S.welcome.lastAction} max={today} />
        </Field>
      </Screen>
    );
  }

  return (
    <Screen
      footer={
        <>
          <Button label={S.welcome.tourYes} onPress={() => void finish(true)} />
          <Button variant="text" label={S.welcome.tourNo} onPress={() => void finish(false)} />
        </>
      }
    >
      <View style={{ alignItems: 'center', gap: 16, paddingTop: 24 }}>
        <GuideAvatar size={120} mood="happy" />
        <T kind="title" center>{S.welcome.tourTitle}</T>
        <T muted center>{S.welcome.tourBody}</T>
      </View>
    </Screen>
  );
}
