import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { Suspense } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { migrateDatabase } from '../db/migrations';
import { DataProvider, useData } from '../state/data';
import { LanguageProvider } from '../state/language';
import { SheetsProvider } from '../state/sheets';
import { useTokens } from '../theme/useTokens';
import { PopupProvider, ToastProvider } from '../ui/kit';
import { Welcome } from '../ui/Welcome';

function Loading() {
  const t = useTokens();
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: t.background }}>
      <ActivityIndicator color={t.primary} />
    </View>
  );
}

function Gate() {
  const t = useTokens();
  const { loading, welcomeDone } = useData();
  if (loading) return <Loading />;
  if (!welcomeDone) return <Welcome />;
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.background } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="tour" options={{ presentation: 'modal' }} />
      <Stack.Screen name="add-cycles" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <Suspense fallback={<Loading />}>
        <SQLiteProvider databaseName="cycle-saathi.db" onInit={migrateDatabase} useSuspense>
          <LanguageProvider>
            <DataProvider>
              <PopupProvider>
                <ToastProvider>
                  <SheetsProvider>
                    <StatusBar style="auto" />
                    <Gate />
                  </SheetsProvider>
                </ToastProvider>
              </PopupProvider>
            </DataProvider>
          </LanguageProvider>
        </SQLiteProvider>
      </Suspense>
    </SafeAreaProvider>
  );
}
