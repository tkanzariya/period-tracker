import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getStage } from '../domain/stage';
import { todayLocal } from '../domain/dates';
import { useData } from '../state/data';
import { useLanguage } from '../state/language';
import { useSheets } from '../state/sheets';
import { useTokens } from '../theme/useTokens';

// The part of expo-router's tab bar props we use (SDK 58: tabs are switched with navigateToTab(routeKey)).
type Props = { state: { index: number; routes: { key: string; name: string }[] }; navigateToTab: (routeKey: string) => void };

type IconName = keyof typeof Ionicons.glyphMap;
const ICONS: Record<string, [IconName, IconName]> = {
  index: ['home-outline', 'home'],
  calendar: ['calendar-outline', 'calendar'],
  history: ['stats-chart-outline', 'stats-chart'],
};

/**
 * Today, Calendar, a round "Tell me" button in the middle, My cycles, Settings (Tirth, 2026-11-21: the
 * main button lives in the bar, like HomeHisab, so nothing floats over the cards or the ad above the bar).
 * "Tell me" and Settings open their own screens; they are not tabs.
 */
export function BottomBar({ state, navigateToTab }: Props) {
  const t = useTokens();
  const { S } = useLanguage();
  const insets = useSafeAreaInsets();
  const { periods } = useData();
  const { openTell } = useSheets();
  const first = getStage(periods, todayLocal()).kind === 'none';
  const labels: Record<string, string> = { index: S.nav.today, calendar: S.nav.calendar, history: S.nav.cycles };
  const current = state.routes[state.index]?.name;

  const tab = (name: string) => {
    const route = state.routes.find((r) => r.name === name);
    if (!route) return null;
    const on = current === name;
    return (
      <Pressable key={route.key} accessibilityRole="tab" accessibilityLabel={labels[name]} accessibilityState={{ selected: on }} onPress={() => navigateToTab(route.key)} style={styles.item}>
        <View style={[styles.pill, { backgroundColor: on ? t.primarySoft : 'transparent' }]}>
          <Ionicons name={ICONS[name][on ? 1 : 0]} size={24} color={on ? t.primary : t.text2} />
        </View>
        <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7} maxFontSizeMultiplier={1.3} style={[styles.label, { color: on ? t.text : t.text2, fontWeight: on ? '700' : '500' }]}>
          {labels[name]}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.bar, { backgroundColor: t.surface, borderTopColor: t.line, paddingBottom: insets.bottom + 4 }]}>
      {tab('index')}
      {tab('calendar')}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={first ? S.today.fab.first : S.today.fab.start}
        accessibilityHint={first ? S.today.fabHelp.first : S.today.fabHelp.start}
        onPress={() => openTell({ mode: 'start' })}
        style={styles.item}
      >
        <View style={[styles.plus, { backgroundColor: t.primary }]}>
          <Ionicons name="water" size={28} color={t.onPrimary} />
        </View>
        <Text numberOfLines={1} maxFontSizeMultiplier={1.3} style={[styles.label, { color: t.text, fontWeight: '700', marginTop: -2 }]}>
          {S.nav.tell}
        </Text>
      </Pressable>
      {tab('history')}
      <Pressable accessibilityRole="button" accessibilityLabel={S.common.settings} onPress={() => router.push('/settings')} style={styles.item}>
        <View style={styles.pill}>
          <Ionicons name="settings-outline" size={24} color={t.text2} />
        </View>
        <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7} maxFontSizeMultiplier={1.3} style={[styles.label, { color: t.text2, fontWeight: '500' }]}>
          {S.common.settings}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 8 },
  item: { flex: 1, alignItems: 'center', gap: 4, minHeight: 56 },
  pill: { width: 56, height: 32, borderRadius: 16, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  // Round, but inside the bar: it never rises over the banner ad above the bar (ads must not be overlapped by app buttons).
  plus: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', elevation: 2 },
  label: { fontSize: 12 },
});
