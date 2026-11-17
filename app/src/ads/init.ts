import { Platform } from 'react-native';
import { ADS_ENABLED, ADS_RULES } from '../config/ads';
import { loadAdsLibrary } from './library';

let started = false;

/**
 * Starts AdMob once: asks for consent where the law needs it, then initialises the SDK. Does nothing
 * when ads are off or on the web preview (the library only exists on the phone, so it is loaded
 * lazily and never imported at the top of a file).
 */
export async function startAds(): Promise<boolean> {
  if (!ADS_ENABLED || started || Platform.OS !== 'android') return false;
  started = true;
  try {
    const ads = loadAdsLibrary();
    if (!ads) return false;
    await ads.AdsConsent.gatherConsent();
    const mobileAds = ads.default();
    await mobileAds.setRequestConfiguration({
      maxAdContentRating: ads.MaxAdContentRating[ADS_RULES.maxContentRating],
      tagForChildDirectedTreatment: false,
      tagForUnderAgeOfConsent: true,
    });
    await mobileAds.initialize();
    return true;
  } catch {
    started = false;
    return false;
  }
}
