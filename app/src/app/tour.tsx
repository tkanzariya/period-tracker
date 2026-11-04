import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { useData } from '../state/data';
import { useLanguage } from '../state/language';
import { useTokens } from '../theme/useTokens';
import { GuideAvatar } from '../ui/Guide';
import { Button, Card, IconButton, Screen, T } from '../ui/kit';

/** The walkthrough: a few short cards from the Saathi saying what does what. Shown once, replayable from Settings. */
export default function TourScreen() {
  const t = useTokens();
  const { S } = useLanguage();
  const { markTourSeen } = useData();
  const [step, setStep] = useState(0);
  const steps = S.tour.steps;
  const last = step === steps.length - 1;
  const current = steps[step];

  async function close() {
    await markTourSeen();
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }

  return (
    <Screen
      title={S.a11y.tour}
      subtitle={S.tour.stepOf(step + 1, steps.length)}
      actions={<IconButton icon="close" label={S.common.close} onPress={() => void close()} />}
      footer={
        <>
          <Button label={last ? S.tour.finish : S.common.next} onPress={() => (last ? void close() : setStep(step + 1))} />
          {step > 0 ? <Button variant="text" label={S.common.back} onPress={() => setStep(step - 1)} /> : null}
        </>
      }
    >
      <View style={{ alignItems: 'center', gap: 16, paddingTop: 8 }}>
        <GuideAvatar size={120} mood={step === 0 ? 'wave' : 'happy'} />
        <Card style={{ width: '100%', gap: 10 }}>
          <T kind="heading" center>{current.title}</T>
          <T center>{current.body}</T>
        </Card>
        <View style={{ flexDirection: 'row', gap: 8 }} accessibilityLabel={S.tour.stepOf(step + 1, steps.length)}>
          {steps.map((_, i) => (
            <View key={i} style={{ width: i === step ? 22 : 8, height: 8, borderRadius: 4, backgroundColor: i === step ? t.primary : t.control }} />
          ))}
        </View>
      </View>
    </Screen>
  );
}
