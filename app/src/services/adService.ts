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
 * Initialize Google Mobile Ads SDK
 */
let isSdkInitialized = false;
let sdkInitPromise: Promise<void> | null = null;

export async function initializeMobileAds(): Promise<void> {
  if (isExpoGo || !GoogleMobileAds) {
    isSdkInitialized = true;
    return;
  }

  if (isSdkInitialized) return;
  if (sdkInitPromise) return sdkInitPromise;

  sdkInitPromise = (async () => {
    try {
      const mobileAds = GoogleMobileAds.default || GoogleMobileAds;
      if (typeof mobileAds === 'function') {
        console.log('[AdService] Initializing Google Mobile Ads SDK...');
        await mobileAds().initialize();
        isSdkInitialized = true;
        console.log('[AdService] Google Mobile Ads SDK initialized successfully');
      }
    } catch (e) {
      console.warn('[AdService] Error initializing Google Mobile Ads:', e);
    }
  })();

  return sdkInitPromise;
}

// Auto-trigger SDK initialization in background
initializeMobileAds().catch(() => {});

/**
 * Interstitial Ads Management
 */
let interstitialInstance: any = null;
let isInterstitialLoaded = false;
let isInterstitialLoading = false;

export async function initInterstitialAd(adUnitId: string = AD_UNIT_IDS.INTERSTITIAL) {
  if (isExpoGo || !GoogleMobileAds?.InterstitialAd) {
    return;
  }

  await initializeMobileAds();

  if (isInterstitialLoaded || isInterstitialLoading) {
    return;
  }

  try {
    const { InterstitialAd, AdEventType } = GoogleMobileAds;
    isInterstitialLoading = true;
    interstitialInstance = InterstitialAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    interstitialInstance.addAdEventListener(AdEventType.LOADED, () => {
      console.log('[AdService] Interstitial Ad loaded');
      isInterstitialLoaded = true;
      isInterstitialLoading = false;
    });

    interstitialInstance.addAdEventListener(AdEventType.ERROR, (err: any) => {
      console.warn('[AdService] Interstitial Ad failed to load:', err);
      isInterstitialLoaded = false;
      isInterstitialLoading = false;
    });

    interstitialInstance.addAdEventListener(AdEventType.CLOSED, () => {
      isInterstitialLoaded = false;
      isInterstitialLoading = false;
      interstitialInstance = null;
      // Preload next interstitial in background
      setTimeout(() => initInterstitialAd(adUnitId), 2000);
    });

    interstitialInstance.load();
  } catch (error) {
    isInterstitialLoading = false;
    console.warn('[AdService] Error creating interstitial ad:', error);
  }
}

export async function showInterstitialAd(): Promise<boolean> {
  if (isExpoGo || !GoogleMobileAds) {
    console.log('[AdService] [Expo Go Preview] Interstitial ad triggered');
    return true;
  }

  if (interstitialInstance && isInterstitialLoaded) {
    try {
      await interstitialInstance.show();
      return true;
    } catch (err) {
      console.warn('[AdService] Failed to show interstitial ad:', err);
      return false;
    }
  }

  return false;
}

/**
 * Rewarded Ads Management
 */
let rewardedInstance: any = null;
let isRewardedLoaded = false;
let isRewardedLoading = false;
let rewardedLoadResolvers: Array<(loaded: boolean) => void> = [];

export function isRewardedAdReady(): boolean {
  return isExpoGo || isRewardedLoaded;
}

/**
 * Prepare and load rewarded ad with automatic retries and error listeners
 */
export async function initRewardedAd(adUnitId: string = AD_UNIT_IDS.REWARDED): Promise<boolean> {
  if (isExpoGo || !GoogleMobileAds?.RewardedAd) {
    console.log('[AdService] Rewarded Ad initialized (Mock / Expo Go mode)');
    return true;
  }

  await initializeMobileAds();

  if (isRewardedLoaded && rewardedInstance) {
    return true;
  }

  if (isRewardedLoading) {
    return new Promise<boolean>((resolve) => {
      rewardedLoadResolvers.push(resolve);
    });
  }

  return new Promise<boolean>((resolve) => {
    rewardedLoadResolvers.push(resolve);

    try {
      const { RewardedAd, RewardedAdEventType, AdEventType } = GoogleMobileAds;
      isRewardedLoading = true;
      isRewardedLoaded = false;

      console.log('[AdService] Creating RewardedAd for unit ID:', adUnitId);
      const ad = RewardedAd.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: true,
      });
      rewardedInstance = ad;

      const notifyAll = (success: boolean) => {
        isRewardedLoading = false;
        const resolvers = [...rewardedLoadResolvers];
        rewardedLoadResolvers = [];
        resolvers.forEach((r) => r(success));
      };

      ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
        console.log('[AdService] ✅ Rewarded Ad successfully loaded and ready to play');
        isRewardedLoaded = true;
        notifyAll(true);
      });

      ad.addAdEventListener(AdEventType.ERROR, (error: any) => {
        console.warn('[AdService] ❌ Rewarded Ad failed to load:', error);
        isRewardedLoaded = false;
        notifyAll(false);
      });

      ad.load();
    } catch (error) {
      console.warn('[AdService] Error creating rewarded ad instance:', error);
      isRewardedLoading = false;
      isRewardedLoaded = false;
      const resolvers = [...rewardedLoadResolvers];
      rewardedLoadResolvers = [];
      resolvers.forEach((r) => r(false));
    }
  });
}

/**
 * Show Rewarded Ad.
 * If not already loaded, it automatically triggers loading and waits up to 8 seconds.
 */
export async function showRewardedAd(onEarnedReward?: () => void): Promise<boolean> {
  if (isExpoGo || !GoogleMobileAds?.RewardedAd) {
    console.log('[AdService] [Expo Go Preview] Playing simulated rewarded ad...');
    // Brief simulated delay for realistic preview UX
    await new Promise((res) => setTimeout(res, 800));
    onEarnedReward?.();
    return true;
  }

  await initializeMobileAds();

  // If not currently loaded, attempt to load with up to 8-second timeout
  if (!rewardedInstance || !isRewardedLoaded) {
    console.log('[AdService] Rewarded ad not loaded yet, loading now before display...');
    const loadPromise = initRewardedAd();
    const timeoutPromise = new Promise<boolean>((res) => setTimeout(() => res(false), 8000));
    const loaded = await Promise.race([loadPromise, timeoutPromise]);

    if (!loaded || !rewardedInstance || !isRewardedLoaded) {
      console.warn('[AdService] Rewarded ad failed to load within timeout');
      return false;
    }
  }

  const ad = rewardedInstance;
  const { RewardedAdEventType, AdEventType } = GoogleMobileAds;

  return new Promise<boolean>((resolve) => {
    let earned = false;
    let unsubEarned: (() => void) | null = null;
    let unsubClosed: (() => void) | null = null;
    let unsubError: (() => void) | null = null;

    const cleanup = () => {
      unsubEarned?.();
      unsubClosed?.();
      unsubError?.();
      isRewardedLoaded = false;
      rewardedInstance = null;
      // Pre-load the next rewarded ad in background
      setTimeout(() => initRewardedAd(), 1500);
    };

    unsubEarned = ad.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => {
        console.log('[AdService] 🏆 User earned rewarded ad perk!');
        earned = true;
        onEarnedReward?.();
      }
    );

    unsubClosed = ad.addAdEventListener(
      AdEventType?.CLOSED || 'closed',
      () => {
        console.log('[AdService] Rewarded ad closed. Reward earned status:', earned);
        cleanup();
        resolve(earned);
      }
    );

    unsubError = ad.addAdEventListener(
      AdEventType?.ERROR || 'error',
      (err: any) => {
        console.warn('[AdService] Error during rewarded ad playback:', err);
        cleanup();
        resolve(false);
      }
    );

    ad.show().catch((err: any) => {
      console.warn('[AdService] ad.show() rejected:', err);
      cleanup();
      resolve(false);
    });
  });
}

export { isExpoGo };
