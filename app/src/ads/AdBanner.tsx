import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { ADS_RULES, adUnit } from '../config/ads';
import { useTokens } from '../theme/useTokens';
import { useAds } from './AdsProvider';
import { loadAdsLibrary } from './library';

/**
 * The banner strip above the tab bar (Today, Calendar, My cycles). Collapses to nothing when there is
 * no ad, so there is never an empty box. `onHeight` lets the floating button sit above it.
 */
export function AdBanner({ onHeight }: { onHeight?: (height: number) => void }) {
  const { showAds } = useAds();
  const t = useTokens();
  const lib = loadAdsLibrary();
  const [height, setHeight] = useState(0);

  useEffect(() => {
    onHeight?.(showAds && lib ? height : 0);
  }, [height, showAds, lib, onHeight]);

  if (!showAds || !lib) return null;
  const { BannerAd, BannerAdSize } = lib;
  return (
    <View style={{ alignItems: 'center', backgroundColor: t.background, borderTopWidth: height > 0 ? 1 : 0, borderTopColor: t.line, height: height > 0 ? height + 1 : 0, overflow: 'hidden' }}>
      <BannerAd
        unitId={adUnit('banner')}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: ADS_RULES.nonPersonalizedOnly }}
        onAdLoaded={(d) => setHeight(Math.ceil(d.height))}
        onAdFailedToLoad={() => setHeight(0)}
      />
    </View>
  );
}
