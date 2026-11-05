import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';
import { todayLocal } from '../domain/dates';
import { STRINGS, type Language } from '../i18n';
import { pickTextFile, saveTextFile, sharePdf } from '../platform/files';
import { APP_VERSION, useData } from '../state/data';
import { useLanguage } from '../state/language';
import { Button, Card, Divider, Field, Input, ListRow, Screen, SectionHeader, Sheet, T, usePopup } from '../ui/kit';
import { Logo } from '../ui/Logo';
import { buildReportHtml } from '../ui/report';

export default function SettingsScreen() {
  const { S, language, setLanguage } = useLanguage();
  const data = useData();
  const popup = usePopup();
  const [langOpen, setLangOpen] = useState(false);
  const [nameOpen, setNameOpen] = useState(false);
  const [name, setName] = useState('');
  const today = todayLocal();

  async function share(filename: string, text: string, mime: string) {
    const result = await saveTextFile(filename, text, mime);
    if (result === 'unavailable') await popup.info({ title: S.settings.fileReadyTitle, message: S.settings.cantShare, icon: 'information-circle' });
    else if (result === 'downloaded') await popup.info({ title: S.settings.fileReadyTitle, message: S.settings.fileDownloadedBody, icon: 'checkmark-circle' });
  }

  async function saveCopy() {
    await share(`my-cycle-info-${today}.json`, await data.backupText(), 'application/json');
  }

  async function saveSheet() {
    if (data.periods.length === 0) await popup.info({ title: S.settings.saveSheet, message: S.settings.nothingToSave });
    const html = buildReportHtml({ periods: data.periods, notes: data.notes, rules: data.rules, S, name: data.name, today });
    const result = await sharePdf(html, S.report.fileName(today));
    if (result === 'unavailable') await popup.info({ title: S.settings.fileReadyTitle, message: S.settings.cantShare, icon: 'information-circle' });
  }

  async function bringBack() {
    const text = await pickTextFile();
    if (text === null) return;
    const r = await data.restoreFromText(text);
    if (!r.ok) {
      await popup.info({ title: S.settings.restoreProblemTitle, message: S.settings.restoreProblem[({ not_json: 'notJson', not_backup: 'notBackup', too_new: 'tooNew', bad_data: 'badData' } as const)[r.reason]], icon: 'information-circle' });
    } else if (r.addedPeriods === 0 && r.addedNotes === 0) {
      await popup.info({ title: S.settings.restoredTitle, message: S.settings.restoreNothingNew, icon: 'checkmark-circle' });
    } else {
      await popup.info({ title: S.settings.restoredTitle, message: S.settings.restoredBody(r.addedPeriods, r.addedNotes, r.skipped), icon: 'checkmark-circle' });
    }
  }

  async function saveName() {
    if (!name.trim()) return;
    await data.saveName(name);
    setNameOpen(false);
  }

  const choose = async (l: Language) => {
    setLangOpen(false);
    await setLanguage(l);
  };

  return (
    <Screen title={S.settings.title} back onBack={() => router.back()}>
      <SectionHeader title={S.settings.groups.general} />
      <Card style={{ paddingVertical: 4 }}>
        <ListRow icon="language" title={S.settings.language} subtitle={S.settings.languageHelp} value={STRINGS[language].languageName} chevron onPress={() => setLangOpen(true)} />
        <Divider inset={56} />
        <ListRow
          icon="person-outline"
          title={S.settings.name}
          value={data.name ?? S.settings.nameEmpty}
          chevron
          onPress={() => {
            setName(data.name ?? '');
            setNameOpen(true);
          }}
        />
      </Card>

      <SectionHeader title={S.settings.groups.data} />
      <Card style={{ paddingVertical: 4 }}>
        <ListRow icon="cloud-upload-outline" title={S.settings.saveCopy} subtitle={S.settings.saveCopyHelp} chevron onPress={() => void saveCopy()} />
        <Divider inset={56} />
        <ListRow icon="document-text-outline" title={S.settings.saveSheet} subtitle={S.settings.saveSheetHelp} chevron onPress={() => void saveSheet()} />
        <Divider inset={56} />
        <ListRow icon="cloud-download-outline" title={S.settings.bringBack} subtitle={S.settings.bringBackHelp} chevron onPress={() => void bringBack()} />
      </Card>
      <T kind="caption" muted>{S.settings.privacy}</T>

      <SectionHeader title={S.settings.groups.help} />
      <Card style={{ paddingVertical: 4 }}>
        <ListRow icon="help-buoy-outline" title={S.settings.howTo} subtitle={S.settings.howToHelp} chevron onPress={() => router.push('/tour')} />
      </Card>

      <SectionHeader title={S.settings.groups.about} />
      <Card style={{ alignItems: 'center', gap: 8 }}>
        <Logo size={64} />
        <T kind="label">{S.appName}</T>
        <T kind="caption" muted>{S.settings.version} {APP_VERSION}</T>
        <Divider />
        <T kind="label">{S.settings.goodToKnow}</T>
        <T kind="caption" muted center>{S.settings.disclaimer}</T>
      </Card>

      <Sheet
        visible={langOpen}
        onClose={() => setLangOpen(false)}
        title={S.settings.language}
      >
        {(Object.keys(STRINGS) as Language[]).map((l) => (
          <Button key={l} variant={l === language ? 'primary' : 'tonal'} icon={l === language ? 'checkmark' : undefined} label={STRINGS[l].languageName} onPress={() => void choose(l)} />
        ))}
      </Sheet>

      <Sheet
        visible={nameOpen}
        onClose={() => setNameOpen(false)}
        title={S.settings.nameSheetTitle}
        footer={<Button label={S.common.save} onPress={() => void saveName()} disabled={!name.trim()} />}
      >
        <Field label={S.settings.name} hint={S.settings.nameWhy}>
          <Input value={name} onChange={setName} label={S.settings.name} placeholder={S.settings.nameExample} autoCapitalize="words" autoFocus maxLength={40} />
        </Field>
      </Sheet>
    </Screen>
  );
}
