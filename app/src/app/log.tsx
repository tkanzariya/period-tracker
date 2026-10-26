import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { addDays, todayLocal } from '../domain/dates';
import { FLOW_LEVELS, type FlowLevel } from '../domain/types';
import { useData } from '../state/data';
import { MIN_TARGET, radius, spacing, typeScale, useTokens } from '../theme/tokens';
import { Body, Button } from '../ui/components';
import { FLOW_LABEL, LOG_ERROR } from '../ui/copy';
import { formatMedium } from '../ui/format';

type Mode = 'start' | 'end' | 'flow';
const MODES: { mode: Mode; label: string }[] = [
  { mode: 'start', label: 'Period started' },
  { mode: 'end', label: 'Period ended' },
  { mode: 'flow', label: 'Just flow' },
];
const DROPS: Record<FlowLevel, number> = { none: 0, spotting: 0, light: 1, medium: 2, heavy: 3 };

export default function LogSheet() {
  const t = useTokens();
  const data = useData();
  const params = useLocalSearchParams<{ mode?: Mode; date?: string }>();
  const today = todayLocal();

  const [mode, setMode] = useState<Mode>(params.mode ?? 'flow');
  const [date, setDate] = useState(params.date && params.date <= today ? params.date : today);
  const [flow, setFlow] = useState<FlowLevel | null>(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  const existing = data.logs.find((l) => l.date === date);
  const canGoForward = date < today;

  async function save() {
    setSaving(true);
    const cleanNote = note.trim() || null;
    const result =
      mode === 'start'
        ? await data.logPeriodStart(date, flow, cleanNote)
        : mode === 'end'
          ? await data.logPeriodEnd(date, cleanNote)
          : await data.logFlow(date, flow, cleanNote);
    setSaving(false);
    if (!result.ok) {
      Alert.alert('Can’t save this', LOG_ERROR[result.error] ?? 'Something went wrong.');
      return;
    }
    router.back();
  }

  function confirmDelete() {
    Alert.alert('Delete this entry?', `The flow entry for ${formatMedium(date)} will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await data.removeFlowLog(date);
          router.back();
        },
      },
    ]);
  }

  const stepButton = (label: string, delta: number, disabled: boolean) => (
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.background }} edges={['bottom']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: spacing.lg, gap: spacing.lg }} keyboardShouldPersistTaps="handled">
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            {stepButton('Previous day', -1, false)}
            <Text style={[typeScale.title, { color: t.text }]}>{date === today ? 'Today · ' : ''}{formatMedium(date)}</Text>
            {stepButton('Next day', 1, !canGoForward)}
          </View>

          <View style={{ flexDirection: 'row', backgroundColor: t.surface2, borderRadius: radius.button, padding: 3 }}>
            {MODES.map((m) => {
              const on = m.mode === mode;
              return (
                <Pressable
                  key={m.mode}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  onPress={() => setMode(m.mode)}
                  style={{ flex: 1, minHeight: MIN_TARGET - 4, alignItems: 'center', justifyContent: 'center', borderRadius: radius.button - 3, backgroundColor: on ? t.surface : 'transparent' }}
                >
                  <Text style={[typeScale.subhead, { color: t.text, fontWeight: on ? '600' : '400' }]}>{m.label}</Text>
                </Pressable>
              );
            })}
          </View>

          {mode !== 'end' ? (
            <View style={{ gap: spacing.sm }}>
              <Body secondary>Flow{existing?.flow ? ` (saved: ${FLOW_LABEL[existing.flow]})` : ''}</Body>
              <View style={{ flexDirection: 'row', gap: spacing.sm }}>
                {FLOW_LEVELS.map((level) => {
                  const on = flow === level;
                  return (
                    <Pressable
                      key={level}
                      accessibilityRole="button"
                      accessibilityLabel={`Flow ${FLOW_LABEL[level]}`}
                      accessibilityState={{ selected: on }}
                      onPress={() => setFlow(on ? null : level)}
                      style={{
                        flex: 1,
                        minHeight: 72,
                        borderRadius: radius.button,
                        borderWidth: 1.5,
                        borderColor: on ? t.primary : t.line,
                        backgroundColor: on ? t.primarySoft : t.surface,
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 4,
                      }}
                    >
                      <View style={{ flexDirection: 'row', height: 20, alignItems: 'center' }}>
                        {level === 'none' ? (
                          <Ionicons name="remove" size={18} color={on ? t.primary : t.text2} />
                        ) : level === 'spotting' ? (
                          <Ionicons name="ellipse" size={8} color={on ? t.primary : t.text2} />
                        ) : (
                          Array.from({ length: DROPS[level] }, (_, i) => <Ionicons key={i} name="water" size={16} color={t.primary} />)
                        )}
                      </View>
                      <Text style={[typeScale.footnote, { color: on ? t.primary : t.text, fontWeight: on ? '700' : '400' }]}>{FLOW_LABEL[level]}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ) : null}

          <View style={{ gap: spacing.sm }}>
            <Body secondary>Note (optional)</Body>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Add a note…"
              placeholderTextColor={t.text2}
              multiline
              style={[typeScale.subhead, { minHeight: MIN_TARGET, borderWidth: 1, borderColor: t.line, borderRadius: radius.button, padding: spacing.md, color: t.text, backgroundColor: t.surface }]}
            />
          </View>

          <Button label="Save" onPress={save} disabled={saving} />
          {existing ? <Button label="Delete this day's flow entry" variant="text" onPress={confirmDelete} /> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
