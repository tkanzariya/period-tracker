import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { Suspense } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { migrateDatabase } from '../db/migrations';
import { DataProvider } from '../state/data';
import { useTokens } from '../theme/tokens';

function Loading() {
  const t = useTokens();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: t.background }}>
      <ActivityIndicator color={t.primary} />
    </View>
  );
}

export default function RootLayout() {
  const t = useTokens();
  return (
    <Suspense fallback={<Loading />}>
      <SQLiteProvider databaseName="cadence.db" onInit={migrateDatabase} useSuspense>
        <DataProvider>
          <StatusBar style="auto" />
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: t.background },
              headerTintColor: t.text,
              headerShadowVisible: false,
              contentStyle: { backgroundColor: t.background },
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="log" options={{ presentation: 'modal', title: 'Log' }} />
          </Stack>
        </DataProvider>
      </SQLiteProvider>
    </Suspense>
  );
}
