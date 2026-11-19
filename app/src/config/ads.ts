/**
 * AdMob settings (docs/context/admob-setup.md). Placements: docs/context/improvement-plan.md section 4.
 *
 *  - ADS_ENABLED: ads are on.
 *  - USE_TEST_ADS: every ad is Google's TEST ad, in every build (decided by Tirth 2026-11-18). Flip to
 *    false only when real ads should run: then release builds use the real ids below (and `app.json`
 *    must carry REAL_APP_ID). Never click your own real ads.
 */
export const ADS_ENABLED = true;
export const USE_TEST_ADS = true;

export type AdKind = 'banner' | 'nativeCycles' | 'nativeCalendar' | 'interstitialReport' | 'interstitialHistory';

/** Google's published sample ids (safe to commit, they only ever return test ads). */
const TEST_BY_FORMAT = {
  banner: 'ca-app-pub-3940256099942544/9214589741',
  interstitial: 'ca-app-pub-3940256099942544/1033173712',
  native: 'ca-app-pub-3940256099942544/2247696110',
} as const;

const TEST_AD_UNITS: Record<AdKind, string> = {
  banner: TEST_BY_FORMAT.banner,
  nativeCycles: TEST_BY_FORMAT.native,
  nativeCalendar: TEST_BY_FORMAT.native,
  interstitialReport: TEST_BY_FORMAT.interstitial,
  interstitialHistory: TEST_BY_FORMAT.interstitial,
};

/** Tirth's real AdMob ids (received 2026-11-17). Public identifiers, not secrets. */
export const REAL_APP_ID = 'ca-app-pub-3531827195019919~6284780581'; // goes in app.json (androidAppId) when real ads go live

export const REAL_AD_UNITS: Record<AdKind, string> = {
  banner: 'ca-app-pub-3531827195019919/9387079930', // banner_main
  nativeCycles: 'ca-app-pub-3531827195019919/5447834920', // native_cycles_list
  nativeCalendar: 'ca-app-pub-3531827195019919/6994072076', // native_calendar
  interstitialReport: 'ca-app-pub-3531827195019919/7882426570', // interstitial_after_report
  interstitialHistory: 'ca-app-pub-3531827195019919/7298479358', // interstitial_after_history
};

/** Test id unless real ads are switched on, this is a release build, and the id is filled in. */
export function adUnit(kind: AdKind): string {
  return !USE_TEST_ADS && !__DEV__ ? REAL_AD_UNITS[kind] : TEST_AD_UNITS[kind];
}

/** Rules from the plan: at most one full-screen ad a day, none in the first 3 days. There is no way to switch ads off (Tirth, 2026-11-19). */
export const ADS_RULES = {
  maxInterstitialsPerDay: 1,
  quietDaysAfterInstall: 3,
  /** Keep ads suitable for a health app (decide with Drashti: pregnancy and fertility products). */
  maxContentRating: 'PG' as const,
  /** Non-personalised only: nothing about her cycle ever reaches the ad code. */
  nonPersonalizedOnly: true,
};
