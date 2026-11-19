import { useSQLiteContext } from 'expo-sqlite';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ADS_ENABLED, ADS_RULES, adUnit, type AdKind } from '../config/ads';
import { getSetting, setSetting } from '../db/repository';
import { diffDays, todayLocal, type DateStr } from '../domain/dates';
import { useData } from '../state/data';
import { startAds } from './init';
import { loadAdsLibrary } from './library';

interface AdsValue {
  /** Ads are started and can be requested. Banners and native cards check this. */
  showAds: boolean;
  /** A full-screen ad at a calm moment, if the daily limit and quiet days allow. Never throws. */
  maybeShowInterstitial(kind: 'interstitialReport' | 'interstitialHistory'): Promise<void>;
}

const AdsContext = createContext<AdsValue | null>(null);

/** Everything about ads in one place: starts the SDK after the welcome and applies the rules from the plan. */
export function AdsProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const { loading, welcomeDone } = useData();
  const [ready, setReady] = useState(false);
  const [installed, setInstalled] = useState<DateStr | null>(null);

  useEffect(() => {
    if (loading || !welcomeDone || !ADS_ENABLED) return;
    void (async () => {
      let first = await getSetting(db, 'installed_at');
      if (!first) {
        first = todayLocal();
        await setSetting(db, 'installed_at', first);
      }
      setInstalled(first);
      setReady(await startAds());
    })();
  }, [db, loading, welcomeDone]);

  const maybeShowInterstitial = useCallback(
    async (kind: 'interstitialReport' | 'interstitialHistory') => {
      try {
        const lib = loadAdsLibrary();
        if (!ready || !lib || !installed) return;
        if (diffDays(installed, todayLocal()) < ADS_RULES.quietDaysAfterInstall) return;
        if ((await getSetting(db, 'interstitial_last_day')) === todayLocal()) return;
        const ad = lib.InterstitialAd.createForAdRequest(adUnit(kind), { requestNonPersonalizedAdsOnly: ADS_RULES.nonPersonalizedOnly });
        await new Promise<void>((resolve) => {
          const done = () => resolve();
          ad.addAdEventListener(lib.AdEventType.LOADED, () => {
            void setSetting(db, 'interstitial_last_day', todayLocal());
            ad.show().catch(done);
          });
          ad.addAdEventListener(lib.AdEventType.CLOSED, done);
          ad.addAdEventListener(lib.AdEventType.ERROR, done);
          ad.load();
          setTimeout(done, 15000);
        });
      } catch {
        // An ad problem must never get in her way.
      }
    },
    [db, ready, installed],
  );

  const value = useMemo<AdsValue>(
    () => ({ showAds: ready, maybeShowInterstitial }),
    [ready, maybeShowInterstitial],
  );
  return <AdsContext.Provider value={value}>{children}</AdsContext.Provider>;
}

export function useAds(): AdsValue {
  const v = useContext(AdsContext);
  if (!v) throw new Error('useAds must be used inside AdsProvider');
  return v;
}

export type { AdKind };
