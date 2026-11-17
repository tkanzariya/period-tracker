import { router, Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar } from 'expo-status-bar';
import { Suspense, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { startAds } from '../ads/init';
import { migrateDatabase } from '../db/migrations';
import { DataProvider, useData } from '../state/data';
import { listenForTaps } from '../platform/notifications';
import { LanguageProvider } from '../state/language';
import { RemindersProvider } from '../state/reminders';
import { SheetsProvider, useSheets } from '../state/sheets';
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
  const { openTell } = useSheets();
  useEffect(() => {
    if (!loading && welcomeDone) void startAds();
  }, [loading, welcomeDone]);
  // Tapping a reminder opens the right sheet.
  useEffect(() => {
    if (loading || !welcomeDone) return;
    return listenForTaps((kind) => {
      if (kind === 'did_start' || kind === 'late' || kind === 'quiet') openTell({ mode: 'start' });
      else if (kind === 'backup') router.push('/settings');
    });
  }, [loading, welcomeDone, openTell]);

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
              <RemindersProvider>
                <PopupProvider>
                  <ToastProvider>
                    <SheetsProvider>
                      <StatusBar style="auto" />
                      <Gate />
                    </SheetsProvider>
                  </ToastProvider>
                </PopupProvider>
              </RemindersProvider>
            </DataProvider>
          </LanguageProvider>
        </SQLiteProvider>
      </Suspense>
    </SafeAreaProvider>
  );
}
