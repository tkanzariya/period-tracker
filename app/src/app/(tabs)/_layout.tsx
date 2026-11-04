import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../../state/language';
import { useTokens } from '../../theme/useTokens';

export default function TabsLayout() {
  const t = useTokens();
  const { S } = useLanguage();
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.primary,
        tabBarInactiveTintColor: t.text2,
        tabBarLabelStyle: { fontSize: 13, fontWeight: '700' },
        tabBarStyle: { backgroundColor: t.surface, borderTopColor: t.line, height: 76 + insets.bottom, paddingTop: 8, paddingBottom: insets.bottom + 10 },
        sceneStyle: { backgroundColor: t.background },
      }}
    >
      <Tabs.Screen name="index" options={{ title: S.nav.today, tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'home' : 'home-outline'} size={26} color={color as string} /> }} />
      <Tabs.Screen name="calendar" options={{ title: S.nav.calendar, tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={26} color={color as string} /> }} />
      <Tabs.Screen name="history" options={{ title: S.nav.cycles, tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'stats-chart' : 'stats-chart-outline'} size={26} color={color as string} /> }} />
    </Tabs>
  );
}
