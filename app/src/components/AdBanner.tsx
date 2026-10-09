import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AD_UNIT_IDS, BannerAdSize, RealBannerAd, isExpoGo } from '../services/adService';

interface AdBannerProps {
  unitId?: string;
  size?: any;
  style?: any;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  unitId = AD_UNIT_IDS.BANNER,
  size = BannerAdSize.ANCHORED_ADAPTIVE_BANNER || 'BANNER',
  style,
}) => {
  const [adFailed, setAdFailed] = useState(false);

  // If real AdMob native component is available (development build / production APK)
  if (RealBannerAd && !isExpoGo && !adFailed) {
    return (
      <View style={[styles.container, style]}>
        <RealBannerAd
          unitId={unitId}
          size={size}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
          onAdFailedToLoad={(error: any) => {
            console.warn('[AdBanner] Ad failed to load:', error);
            setAdFailed(true);
          }}
        />
      </View>
    );
  }

  // Only render real native ad if available; otherwise return null (no hardcoded mock ads)
  return null;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  mockContainer: {
    backgroundColor: '#F1F5F9',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    borderRadius: 8,
    borderStyle: 'dashed',
    paddingVertical: 10,
    paddingHorizontal: 16,
    width: '94%',
    alignSelf: 'center',
    position: 'relative',
  },
  adBadge: {
    position: 'absolute',
    top: 6,
    left: 8,
    backgroundColor: '#94A3B8',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  adBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  mockTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
    marginTop: 2,
  },
  mockSubtitle: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
});
