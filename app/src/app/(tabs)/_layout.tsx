import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { useTokens } from '../../theme/useTokens';
import { BottomBar } from '../../ui/BottomBar';

export default function TabsLayout() {
  const t = useTokens();
  return (
    <Tabs
      tabBar={(props) => <BottomBar {...(props as unknown as ComponentProps<typeof BottomBar>)} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: t.background } }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="calendar" />
      <Tabs.Screen name="history" />
    </Tabs>
  );
}
