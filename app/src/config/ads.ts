/**
 * AdMob settings. Everything here is Google's public TEST ids until Tirth pastes the real ones
 * (docs/context/admob-setup.md). Ads stay OFF until `ADS_ENABLED` is true: no ad code runs, no
 * consent prompt, nothing is shown. Placements are in docs/context/improvement-plan.md section 4.
 *
 * Never put a real ad unit id in a build that Drashti tests with: test ids only, or ads off.
 */
export const ADS_ENABLED = false;

/** Google's published sample ids (safe to commit, they only ever return test ads). */
export const TEST_AD_UNITS = {
  banner: 'ca-app-pub-3940256099942544/9214589741',
  interstitial: 'ca-app-pub-3940256099942544/1033173712',
  rewarded: 'ca-app-pub-3940256099942544/5224354917',
  native: 'ca-app-pub-3940256099942544/2247696110',
} as const;

/**
 * Tirth's real AdMob ids (received 2026-11-17). Public identifiers, not secrets. They are only used in a
 * release build when ADS_ENABLED is true; every debug or tester build still gets the test ids.
 */
export const REAL_APP_ID = 'ca-app-pub-3531827195019919~6284780581'; // goes in app.json (androidAppId) when ads are turned on

export const REAL_AD_UNITS: Partial<Record<keyof typeof TEST_AD_UNITS, string>> = {
  banner: 'ca-app-pub-3531827195019919/9387079930', // banner_main
  interstitial: 'ca-app-pub-3531827195019919/7882426570', // interstitial_after_report
  rewarded: 'ca-app-pub-3531827195019919/4423749054', // rewarded_no_ads
  native: 'ca-app-pub-3531827195019919/5447834920', // native_cycles_list
};

/** The ad units that have their own place (a second interstitial and a second native). */
export const REAL_EXTRA_UNITS = {
  interstitialAfterHistory: 'ca-app-pub-3531827195019919/7298479358', // interstitial_after_history
  nativeCalendar: 'ca-app-pub-3531827195019919/6994072076', // native_calendar
} as const;

/** Use real ids only in a release build AND only if one was filled in; everything else gets the test id. */
export function adUnit(kind: keyof typeof TEST_AD_UNITS): string {
  const real = REAL_AD_UNITS[kind];
  return !__DEV__ && real ? real : TEST_AD_UNITS[kind];
}

/** Rules from the plan: at most one full-screen ad a day, none in the first 3 days. */
export const ADS_RULES = {
  maxInterstitialsPerDay: 1,
  quietDaysAfterInstall: 3,
  bannerRefreshSeconds: 60,
  /** Keep ads suitable for a health app (decide with Drashti: pregnancy and fertility products). */
  maxContentRating: 'PG' as const,
  /** Non-personalised only: nothing about her cycle ever reaches the ad code. */
  nonPersonalizedOnly: true,
};
