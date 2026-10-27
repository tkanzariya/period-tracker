import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { todayLocal } from '../../domain/dates';
import { pickTextFile, saveTextFile } from '../../platform/files';
import { APP_VERSION, useData } from '../../state/data';
import { MIN_TARGET, radius, spacing, typeScale, useTokens } from '../../theme/tokens';
import { Body, Button, Card, Heading } from '../../ui/components';
import { STR } from '../../ui/copy';
import { Logo } from '../../ui/Logo';
import { notify } from '../../ui/dialog';

type IconName = ComponentProps<typeof Ionicons>['name'];

function Row({ icon, title, help, onPress }: { icon: IconName; title: string; help: string; onPress: () => void }) {
  const t = useTokens();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      onPress={onPress}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: spacing.md, minHeight: 64, paddingVertical: spacing.sm, opacity: pressed ? 0.6 : 1 })}
    >
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: t.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon} size={20} color={t.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[typeScale.headline, { color: t.text }]}>{title}</Text>
        <Text style={[typeScale.footnote, { color: t.text2 }]}>{help}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={t.text2} />
    </Pressable>
  );
}

export default function SettingsScreen() {
  const t = useTokens();
  const data = useData();
  const [name, setName] = useState('');

  useEffect(() => {
    setName(data.name ?? '');
  }, [data.name]);

  const today = todayLocal();

  async function saveCopy() {
    const text = await data.backupText();
    const result = await saveTextFile(`my-cycle-info-${today}.json`, text, 'application/json');
    if (result === 'unavailable') await notify(STR.savedCopyTitle, STR.cantShare);
    else if (result === 'downloaded') await notify(STR.savedCopyTitle, STR.downloadedBody);
  }

  async function saveSheet() {
    const result = await saveTextFile(`my-periods-${today}.csv`, data.csvText(), 'text/csv');
    if (result === 'unavailable') await notify(STR.savedCopyTitle, STR.cantShare);
    else if (result === 'downloaded') await notify(STR.savedCopyTitle, STR.downloadedBody);
  }

  async function bringBack() {
    const text = await pickTextFile();
    if (text === null) return;
    const result = await data.restoreFromText(text);
    if (result.ok) await notify(STR.broughtBackTitle, STR.broughtBackBody(result.addedPeriods, result.addedNotes, result.skipped));
    else await notify(STR.cantSaveTitle, STR.restoreProblem[result.reason]);
  }

  const nameChanged = name.trim().length > 0 && name.trim() !== (data.name ?? '');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.background }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }} keyboardShouldPersistTaps="handled">
        <Heading>{STR.settingsTitle}</Heading>

        <Card style={{ gap: spacing.md }}>
          <Text style={[typeScale.headline, { color: t.text }]}>{STR.aboutYou}</Text>
          <Body secondary>{STR.callMe}</Body>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={STR.nameHint}
            placeholderTextColor={t.text2}
            autoCapitalize="words"
            style={[typeScale.body, { minHeight: MIN_TARGET, borderWidth: 1, borderColor: t.line, borderRadius: radius.button, paddingHorizontal: spacing.md, color: t.text, backgroundColor: t.background }]}
          />
          <Button label={STR.saveName} disabled={!nameChanged} onPress={() => data.saveName(name)} />
        </Card>

        <Card style={{ gap: spacing.xs }}>
          <Text style={[typeScale.headline, { color: t.text }]}>{STR.yourInfo}</Text>
          <Body secondary>{STR.yourInfoNote}</Body>
          <Row icon="cloud-upload-outline" title={STR.saveCopy} help={STR.saveCopyHelp} onPress={saveCopy} />
          <Row icon="document-text-outline" title={STR.saveSheet} help={STR.saveSheetHelp} onPress={saveSheet} />
          <Row icon="cloud-download-outline" title={STR.bringBack} help={STR.bringBackHelp} onPress={bringBack} />
        </Card>

        <View style={{ alignItems: 'center', gap: spacing.sm }}>
          <Logo size={72} />
          <Text style={[typeScale.headline, { color: t.text }]}>{STR.appName}</Text>
          <Body secondary style={{ textAlign: 'center' }}>
            {STR.appVersion} {APP_VERSION}
          </Body>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
