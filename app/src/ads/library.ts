/** The AdMob library, loaded only on the phone (it cannot run in the browser preview; see library.web.ts). */
export type AdsLibrary = typeof import('react-native-google-mobile-ads');

export function loadAdsLibrary(): AdsLibrary | null {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require('react-native-google-mobile-ads') as AdsLibrary;
}
