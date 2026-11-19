import { useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';
import { ADS_RULES, adUnit } from '../config/ads';
import { useLanguage } from '../state/language';
import { radius, spacing } from '../theme/tokens';
import { useTokens } from '../theme/useTokens';
import { useAds } from './AdsProvider';
import { loadAdsLibrary, type AdsLibrary } from './library';

type Loaded = Awaited<ReturnType<AdsLibrary['NativeAd']['createForAdRequest']>>;

/**
 * A compact native ad (icon, headline, text, button) drawn like one of our cards and clearly marked
 * "Ad", the same style as HomeHisab: no big picture. Renders nothing until an ad has loaded.
 */
export function NativeAdCard({ kind }: { kind: 'nativeCycles' | 'nativeCalendar' }) {
  const { showAds } = useAds();
  const { S } = useLanguage();
  const t = useTokens();
  const lib = loadAdsLibrary();
  const [ad, setAd] = useState<Loaded | null>(null);

  useEffect(() => {
    if (!showAds || !lib) return;
    let loaded: Loaded | null = null;
    let cancelled = false;
    lib.NativeAd.createForAdRequest(adUnit(kind), { requestNonPersonalizedAdsOnly: ADS_RULES.nonPersonalizedOnly })
      .then((a) => {
        if (cancelled) a.destroy();
        else {
          loaded = a;
          setAd(a);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
      loaded?.destroy();
    };
  }, [showAds, lib, kind]);

  if (!showAds || !lib || !ad) return null;
  const { NativeAdView, NativeAsset, NativeAssetType } = lib;
  return (
    // The rounded border sits on a plain View: Android ignores rounded corners on the native ad view itself.
    <View style={{ backgroundColor: t.surface, borderColor: t.line, borderWidth: 1, borderRadius: radius.card, overflow: 'hidden' }}>
      <NativeAdView nativeAd={ad} style={{ padding: spacing.md, gap: 10 }}>
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          {ad.icon ? (
            <NativeAsset assetType={NativeAssetType.ICON}>
              <Image source={{ uri: ad.icon.url }} style={{ width: 44, height: 44, borderRadius: 10 }} accessibilityIgnoresInvertColors />
            </NativeAsset>
          ) : null}
          <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
            <Text style={{ alignSelf: 'flex-start', color: t.text2, borderColor: t.line, borderWidth: 1, borderRadius: 4, paddingHorizontal: 5, fontSize: 11, overflow: 'hidden' }} maxFontSizeMultiplier={1.2}>{S.ads.label}</Text>
            <NativeAsset assetType={NativeAssetType.HEADLINE}>
              <Text numberOfLines={2} style={{ color: t.text, fontSize: 16, fontWeight: '700' }}>{ad.headline}</Text>
            </NativeAsset>
            {ad.body ? (
              <NativeAsset assetType={NativeAssetType.BODY}>
                <Text numberOfLines={2} style={{ color: t.text2, fontSize: 14 }}>{ad.body}</Text>
              </NativeAsset>
            ) : null}
          </View>
        </View>
        {ad.callToAction ? (
          <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
            <Text style={{ textAlign: 'center', backgroundColor: t.primarySoft, color: t.primary, fontSize: 15, fontWeight: '700', borderRadius: 12, paddingVertical: 10, overflow: 'hidden' }}>{ad.callToAction}</Text>
          </NativeAsset>
        ) : null}
      </NativeAdView>
    </View>
  );
}
