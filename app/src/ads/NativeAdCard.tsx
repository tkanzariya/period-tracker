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
 * A native ad drawn like one of our cards, clearly marked "Ad" (My cycles list and Calendar). Renders
 * nothing until an ad has loaded, so there is never an empty card.
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
  const { NativeAdView, NativeAsset, NativeAssetType, NativeMediaView } = lib;
  return (
    <NativeAdView
      nativeAd={ad}
      style={{ backgroundColor: t.surface, borderColor: t.line, borderWidth: 1, borderRadius: radius.card, padding: spacing.md, gap: 8 }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={{ backgroundColor: t.surface2, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2 }}>
          <Text style={{ color: t.text2, fontSize: 12, fontWeight: '700' }}>{S.ads.label}</Text>
        </View>
        {ad.icon ? (
          <NativeAsset assetType={NativeAssetType.ICON}>
            <Image source={{ uri: ad.icon.url }} style={{ width: 36, height: 36, borderRadius: 8 }} />
          </NativeAsset>
        ) : null}
        <View style={{ flex: 1 }}>
          <NativeAsset assetType={NativeAssetType.HEADLINE}>
            <Text numberOfLines={1} style={{ color: t.text, fontSize: 16, fontWeight: '700' }}>{ad.headline}</Text>
          </NativeAsset>
        </View>
      </View>
      <NativeMediaView style={{ width: '100%', height: 140, borderRadius: 12, overflow: 'hidden' }} />
      {ad.body ? (
        <NativeAsset assetType={NativeAssetType.BODY}>
          <Text numberOfLines={2} style={{ color: t.text2, fontSize: 14 }}>{ad.body}</Text>
        </NativeAsset>
      ) : null}
      {ad.callToAction ? (
        <NativeAsset assetType={NativeAssetType.CALL_TO_ACTION}>
          <Text style={{ color: t.primary, fontSize: 15, fontWeight: '800', paddingVertical: 8 }}>{ad.callToAction}</Text>
        </NativeAsset>
      ) : null}
    </NativeAdView>
  );
}
