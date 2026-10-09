import { isRunningInExpoGo } from 'expo';

// Safe wrapper for react-native-google-mobile-ads
// Expo Go does not include native AdMob binaries, so we mock in Expo Go
// and use real Google Mobile Ads in standalone / development builds.

let GoogleMobileAds: any = null;
const isExpoGo = typeof isRunningInExpoGo === 'function' ? isRunningInExpoGo() : false;

if (!isExpoGo) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    GoogleMobileAds = require('react-native-google-mobile-ads');
  } catch (err) {
    console.warn('[AdService] Could not load react-native-google-mobile-ads:', err);
  }
}

// Standard Google Test Ad Unit IDs
export const AD_UNIT_IDS = {
  BANNER: GoogleMobileAds?.TestIds?.BANNER || 'ca-app-pub-3940256099942544/6300978111',
  INTERSTITIAL: GoogleMobileAds?.TestIds?.INTERSTITIAL || 'ca-app-pub-3940256099942544/1033173712',
  REWARDED: GoogleMobileAds?.TestIds?.REWARDED || 'ca-app-pub-3940256099942544/5224354917',
};

export const BannerAdSize = GoogleMobileAds?.BannerAdSize || {
  BANNER: 'BANNER',
  LARGE_BANNER: 'LARGE_BANNER',
  MEDIUM_RECTANGLE: 'MEDIUM_RECTANGLE',
  FULL_BANNER: 'FULL_BANNER',
  LEADERBOARD: 'LEADERBOARD',
  ANCHORED_ADAPTIVE_BANNER: 'ANCHORED_ADAPTIVE_BANNER',
};

export const RealBannerAd = GoogleMobileAds?.BannerAd || null;

/**
 * Helper to show an interstitial ad safely
 */
let interstitialInstance: any = null;
let isInterstitialLoaded = false;

export function initInterstitialAd(adUnitId: string = AD_UNIT_IDS.INTERSTITIAL) {
  if (isExpoGo || !GoogleMobileAds?.InterstitialAd) {
    console.log('[AdService] Interstitial Ad initialized (Mock / Expo Go mode)');
    return;
  }

  try {
    const { InterstitialAd, AdEventType } = GoogleMobileAds;
    interstitialInstance = InterstitialAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    interstitialInstance.addAdEventListener(AdEventType.LOADED, () => {
      isInterstitialLoaded = true;
    });

    interstitialInstance.addAdEventListener(AdEventType.CLOSED, () => {
      isInterstitialLoaded = false;
      // Preload next ad
      interstitialInstance.load();
    });

    interstitialInstance.load();
  } catch (error) {
    console.warn('[AdService] Error creating interstitial ad:', error);
  }
}

export function showInterstitialAd(): Promise<boolean> {
  if (isExpoGo || !GoogleMobileAds) {
    console.log('[AdService] [Expo Go Preview] Interstitial ad triggered');
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    if (interstitialInstance && isInterstitialLoaded) {
      interstitialInstance.show().catch((err: any) => {
        console.warn('[AdService] Failed to show interstitial ad:', err);
        resolve(false);
      });
      resolve(true);
    } else {
      resolve(false);
    }
  });
}

/**
 * Helper to manage Google AdMob Rewarded Ads
 */
let rewardedInstance: any = null;
let isRewardedLoaded = false;

export function initRewardedAd(adUnitId: string = AD_UNIT_IDS.REWARDED) {
  if (isExpoGo || !GoogleMobileAds?.RewardedAd) {
    console.log('[AdService] Rewarded Ad initialized (Mock / Expo Go mode)');
    return;
  }

  try {
    const { RewardedAd, RewardedAdEventType } = GoogleMobileAds;
    rewardedInstance = RewardedAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    rewardedInstance.addAdEventListener(RewardedAdEventType.LOADED, () => {
      isRewardedLoaded = true;
    });

    rewardedInstance.load();
  } catch (error) {
    console.warn('[AdService] Error creating rewarded ad:', error);
  }
}

export function showRewardedAd(onEarnedReward?: () => void): Promise<boolean> {
  if (isExpoGo || !GoogleMobileAds) {
    console.log('[AdService] [Expo Go Preview] Rewarded video completed!');
    onEarnedReward?.();
    return Promise.resolve(true);
  }

  return new Promise((resolve) => {
    if (rewardedInstance && isRewardedLoaded) {
      const { RewardedAdEventType, AdEventType } = GoogleMobileAds;
      let earned = false;

      const unsubEarned = rewardedInstance.addAdEventListener(
        RewardedAdEventType.EARNED_REWARD,
        () => {
          earned = true;
          onEarnedReward?.();
        }
      );

      const unsubClosed = rewardedInstance.addAdEventListener(
        AdEventType?.CLOSED || 'closed',
        () => {
          isRewardedLoaded = false;
          unsubEarned?.();
          unsubClosed?.();
          rewardedInstance?.load();
          resolve(earned);
        }
      );

      rewardedInstance.show().catch((err: any) => {
        console.warn('[AdService] Failed to show rewarded ad:', err);
        unsubEarned?.();
        unsubClosed?.();
        resolve(false);
      });
    } else {
      console.log('[AdService] Rewarded ad not loaded yet, requesting load...');
      rewardedInstance?.load();
      resolve(false);
    }
  });
}

export { isExpoGo };

