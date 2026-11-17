import { useSQLiteContext } from 'expo-sqlite';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { ADS_ENABLED, ADS_RULES, adUnit, type AdKind } from '../config/ads';
import { getSetting, setSetting } from '../db/repository';
import { addDays, diffDays, todayLocal, type DateStr } from '../domain/dates';
import { useData } from '../state/data';
import { startAds } from './init';
import { loadAdsLibrary } from './library';

interface AdsValue {
  /** Ads are started and she has not earned an ad-free period. Banners and native cards check this. */
  showAds: boolean;
  /** She watched a rewarded video: no ads until this day (inclusive); null otherwise. */
  adsFreeUntil: DateStr | null;
  /** The rewarded video can be offered (ads on, library present). */
  canOfferReward: boolean;
  /** A full-screen ad at a calm moment, if the daily limit and quiet days allow. Never throws. */
  maybeShowInterstitial(kind: 'interstitialReport' | 'interstitialHistory'): Promise<void>;
  /** Plays a rewarded video; resolves true if she earned the reward (no ads for a few days). */
  watchRewarded(): Promise<boolean>;
}

const AdsContext = createContext<AdsValue | null>(null);

/** Everything about ads in one place: starts the SDK after the welcome and applies the rules from the plan. */
export function AdsProvider({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const { loading, welcomeDone } = useData();
  const [ready, setReady] = useState(false);
  const [adsFreeUntil, setAdsFreeUntil] = useState<DateStr | null>(null);
  const [installed, setInstalled] = useState<DateStr | null>(null);

  useEffect(() => {
    if (loading || !welcomeDone || !ADS_ENABLED) return;
    void (async () => {
      const free = await getSetting(db, 'ads_free_until');
      setAdsFreeUntil(free);
      let first = await getSetting(db, 'installed_at');
      if (!first) {
        first = todayLocal();
        await setSetting(db, 'installed_at', first);
      }
      setInstalled(first);
      setReady(await startAds());
    })();
  }, [db, loading, welcomeDone]);

  const today = todayLocal();
  const adFree = adsFreeUntil !== null && adsFreeUntil >= today;

  const maybeShowInterstitial = useCallback(
    async (kind: 'interstitialReport' | 'interstitialHistory') => {
      try {
        const lib = loadAdsLibrary();
        if (!ready || !lib || adFree || !installed) return;
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
    [db, ready, adFree, installed],
  );

  const watchRewarded = useCallback(async () => {
    try {
      const lib = loadAdsLibrary();
      if (!ready || !lib) return false;
      const ad = lib.RewardedAd.createForAdRequest(adUnit('rewarded'), { requestNonPersonalizedAdsOnly: ADS_RULES.nonPersonalizedOnly });
      const earned = await new Promise<boolean>((resolve) => {
        let got = false;
        ad.addAdEventListener(lib.RewardedAdEventType.LOADED, () => {
          ad.show().catch(() => resolve(false));
        });
        ad.addAdEventListener(lib.RewardedAdEventType.EARNED_REWARD, () => {
          got = true;
        });
        ad.addAdEventListener(lib.AdEventType.CLOSED, () => resolve(got));
        ad.addAdEventListener(lib.AdEventType.ERROR, () => resolve(false));
        ad.load();
        setTimeout(() => resolve(got), 60000);
      });
      if (earned) {
        const until = addDays(todayLocal(), ADS_RULES.adsFreeDaysForReward);
        await setSetting(db, 'ads_free_until', until);
        setAdsFreeUntil(until);
      }
      return earned;
    } catch {
      return false;
    }
  }, [db, ready]);

  const value = useMemo<AdsValue>(
    () => ({ showAds: ready && !adFree, adsFreeUntil, canOfferReward: ready, maybeShowInterstitial, watchRewarded }),
    [ready, adFree, adsFreeUntil, maybeShowInterstitial, watchRewarded],
  );
  return <AdsContext.Provider value={value}>{children}</AdsContext.Provider>;
}

export function useAds(): AdsValue {
  const v = useContext(AdsContext);
  if (!v) throw new Error('useAds must be used inside AdsProvider');
  return v;
}

export type { AdKind };
