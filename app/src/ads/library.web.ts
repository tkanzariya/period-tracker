import type { AdsLibrary } from './library';

/** The browser preview has no ads. */
export function loadAdsLibrary(): AdsLibrary | null {
  return null;
}
