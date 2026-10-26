import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { typeScale, useTokens } from '../../theme/tokens';
import { TAB_NAMES } from '../../ui/copy';

type IconName = ComponentProps<typeof Ionicons>['name'];

const TABS: { name: string; title: string; icon: IconName; iconActive: IconName }[] = [
  { name: 'index', title: TAB_NAMES.today, icon: 'today-outline', iconActive: 'today' },
  { name: 'calendar', title: TAB_NAMES.calendar, icon: 'calendar-outline', iconActive: 'calendar' },
  { name: 'history', title: TAB_NAMES.cycles, icon: 'refresh-circle-outline', iconActive: 'refresh-circle' },
  { name: 'settings', title: TAB_NAMES.settings, icon: 'settings-outline', iconActive: 'settings' },
];

export default function TabsLayout() {
  const t = useTokens();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.primary,
        tabBarInactiveTintColor: t.text2,
        tabBarStyle: { backgroundColor: t.surface, borderTopColor: t.line },
        tabBarLabelStyle: { fontSize: typeScale.footnote.fontSize },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused, size }) => (
              <Ionicons name={focused ? tab.iconActive : tab.icon} size={size} color={focused ? t.primary : t.text2} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
