import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import type { ComponentProps } from 'react';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { addDays, todayLocal } from '../domain/dates';
import { useData } from '../state/data';
import { MIN_TARGET, radius, spacing, typeScale, useTokens } from '../theme/tokens';
import { Body, Button } from '../ui/components';
import { LOG_ERROR, STR } from '../ui/copy';
import { confirmAction, notify } from '../ui/dialog';
import { goBackOrHome } from '../ui/nav';
import { formatMedium } from '../ui/format';

type Mode = 'start' | 'end' | 'note';
type IconName = ComponentProps<typeof Ionicons>['name'];

const CHOICES: { mode: Mode; label: string; icon: IconName }[] = [
  { mode: 'start', label: STR.periodStarted, icon: 'water' },
  { mode: 'end', label: STR.periodEnded, icon: 'checkmark-circle' },
  { mode: 'note', label: STR.justNote, icon: 'create' },
];

export default function TellMeScreen() {
  const t = useTokens();
  const data = useData();
  const params = useLocalSearchParams<{ mode?: Mode; date?: string }>();
  const today = todayLocal();

  const [mode, setMode] = useState<Mode>(params.mode ?? 'start');
  const [date, setDate] = useState(params.date && params.date <= today ? params.date : today);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const existingNote = data.notes.find((n) => n.date === date)?.note ?? null;
  const yesterday = addDays(today, -1);
  const canSave = mode !== 'note' || note.trim().length > 0;

  async function save() {
    setSaving(true);
    const cleanNote = note.trim() || null;
    const result =
      mode === 'start'
        ? await data.periodStarted(date, cleanNote)
        : mode === 'end'
          ? await data.periodEnded(date, cleanNote)
          : await data.saveNote(date, note);
    setSaving(false);
    if (!result.ok) {
      await notify(STR.cantSaveTitle, LOG_ERROR[result.error] ?? STR.somethingWrong);
      return;
    }
    goBackOrHome();
  }

  async function confirmRemove() {
    const yes = await confirmAction(STR.removeNoteTitle, STR.removeNoteBody(formatMedium(date)), STR.remove, STR.cancel, true);
    if (!yes) return;
    await data.removeNote(date);
    goBackOrHome();
  }

  const step = (label: string, delta: number, disabled: boolean) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={() => setDate(addDays(date, delta))}
      style={{ width: MIN_TARGET, height: MIN_TARGET, alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.3 : 1 }}
    >
      <Ionicons name={delta < 0 ? 'chevron-back' : 'chevron-forward'} size={24} color={t.primary} />
    </Pressable>
  );

  const dayChip = (label: string, value: string) => {
    const on = date === value;
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ selected: on }}
        onPress={() => setDate(value)}
        style={{
          minHeight: 40,
          paddingHorizontal: spacing.lg,
          borderRadius: radius.pill,
          justifyContent: 'center',
          backgroundColor: on ? t.primarySoft : t.surface2,
          borderWidth: on ? 1.5 : 0,
          borderColor: t.primary,
        }}
      >
        <Text style={[typeScale.subhead, { color: on ? t.primary : t.text, fontWeight: on ? '700' : '400' }]}>{label}</Text>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.background }} edges={['bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }} keyboardShouldPersistTaps="handled">
          <Text style={[typeScale.title, { color: t.text }]}>{STR.logQuestion}</Text>

          <View style={{ gap: spacing.sm }}>
            {CHOICES.map((c) => {
              const on = c.mode === mode;
              return (
                <Pressable
                  key={c.mode}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  onPress={() => setMode(c.mode)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: spacing.md,
                    minHeight: 60,
                    padding: spacing.md,
                    borderRadius: radius.card,
                    borderWidth: 1.5,
                    borderColor: on ? t.primary : t.line,
                    backgroundColor: on ? t.primarySoft : t.surface,
                  }}
                >
                  <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? t.primary : t.surface2 }}>
                    <Ionicons name={c.icon} size={22} color={on ? t.onPrimary : t.primary} />
                  </View>
                  <Text style={[typeScale.headline, { color: t.text, flex: 1 }]}>{c.label}</Text>
                  {on ? <Ionicons name="checkmark" size={22} color={t.primary} /> : null}
                </Pressable>
              );
            })}
          </View>

          <View style={{ gap: spacing.sm }}>
            <Body secondary>{STR.whichDay}</Body>
            <View style={{ flexDirection: 'row', gap: spacing.sm }}>
              {dayChip(STR.today, today)}
              {dayChip(STR.yesterday, yesterday)}
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              {step('Day before', -1, false)}
              <Text style={[typeScale.headline, { color: t.text }]}>{formatMedium(date)}</Text>
              {step('Day after', 1, date >= today)}
            </View>
          </View>

          <View style={{ gap: spacing.sm }}>
            <Body secondary>{STR.noteLabel}</Body>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder={existingNote ?? STR.notePlaceholder}
              placeholderTextColor={t.text2}
              multiline
              style={[typeScale.subhead, { minHeight: 80, textAlignVertical: 'top', borderWidth: 1, borderColor: t.line, borderRadius: radius.button, padding: spacing.md, color: t.text, backgroundColor: t.surface }]}
            />
          </View>

          <Button label={STR.save} onPress={save} disabled={saving || !canSave} />
          {existingNote ? <Button label={STR.removeNote} variant="text" onPress={confirmRemove} /> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
