import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { ADS_RULES, adUnit } from '../config/ads';
import { useLanguage } from '../state/language';
import { useTokens } from '../theme/useTokens';
import { useAds } from './AdsProvider';
import { loadAdsLibrary } from './library';

/**
 * The banner strip above the tab bar (Today, Calendar, My cycles). Like HomeHisab it is the small
 * standard 320x50 banner (not the tall adaptive one) with a tiny "Ad" tag. It collapses to nothing when
 * there is no ad, so there is never an empty box. `onHeight` lets the floating button sit above it.
 */
export function AdBanner({ onHeight }: { onHeight?: (height: number) => void }) {
  const { showAds } = useAds();
  const { S } = useLanguage();
  const t = useTokens();
  const lib = loadAdsLibrary();
  const [height, setHeight] = useState(0);

  useEffect(() => {
    onHeight?.(showAds && lib ? height : 0);
  }, [height, showAds, lib, onHeight]);

  if (!showAds || !lib) return null;
  const { BannerAd, BannerAdSize } = lib;
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', backgroundColor: t.surface, borderTopWidth: height > 0 ? 1 : 0, borderTopColor: t.line, height: height > 0 ? height + 8 : 0, overflow: 'hidden' }}>
      {height > 0 ? <Text style={{ position: 'absolute', left: 8, top: 2, fontSize: 11, color: t.text2 }} maxFontSizeMultiplier={1.2}>{S.ads.label}</Text> : null}
      <BannerAd
        unitId={adUnit('banner')}
        size={BannerAdSize.BANNER}
        requestOptions={{ requestNonPersonalizedAdsOnly: ADS_RULES.nonPersonalizedOnly }}
        onAdLoaded={(d) => setHeight(Math.ceil(d.height))}
        onAdFailedToLoad={() => setHeight(0)}
      />
    </View>
  );
}
