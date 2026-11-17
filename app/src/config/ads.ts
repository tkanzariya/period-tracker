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

/** The real ids go here (ad unit ids are public identifiers, not secrets). Empty means "use the test id". */
export const REAL_AD_UNITS: Partial<Record<keyof typeof TEST_AD_UNITS, string>> = {};

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
