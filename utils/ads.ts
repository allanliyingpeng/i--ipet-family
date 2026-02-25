import { Platform } from 'react-native';

// 广告单元 ID 配置
const AD_UNIT_IDS = {
  rewarded: {
    ios: __DEV__
      ? 'ca-app-pub-3940256099942544/1712485313'  // 测试 ID
      : 'ca-app-pub-2964512936249564/7941971404', // 正式 ID
    android: __DEV__
      ? 'ca-app-pub-3940256099942544/5224354917'  // 测试 ID
      : 'ca-app-pub-2964512936249564/8147653833', // 正式 ID
  },
};

// 获取当前平台的激励广告 ID
const getRewardedAdUnitId = (): string => {
  return Platform.OS === 'ios'
    ? AD_UNIT_IDS.rewarded.ios
    : AD_UNIT_IDS.rewarded.android;
};

// 检查原生广告模块是否可用
let isNativeAdsAvailable = false;
let RewardedAd: any = null;
let RewardedAdEventType: any = null;
let AdEventType: any = null;

try {
  const adsModule = require('react-native-google-mobile-ads');
  RewardedAd = adsModule.RewardedAd;
  RewardedAdEventType = adsModule.RewardedAdEventType;
  AdEventType = adsModule.AdEventType;
  isNativeAdsAvailable = true;
  console.log('原生广告模块已加载');
} catch (error) {
  console.log('原生广告模块不可用，使用模拟广告');
  isNativeAdsAvailable = false;
}

// 当前广告实例
let rewardedAd: any = null;
let isAdLoaded = false;

/**
 * 预加载激励广告
 */
export const preloadAd = async (): Promise<void> => {
  if (!isNativeAdsAvailable) {
    console.log('模拟：预加载广告...');
    return;
  }

  return new Promise((resolve) => {
    const adUnitId = getRewardedAdUnitId();
    rewardedAd = RewardedAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    const unsubscribeLoaded = rewardedAd.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        console.log('广告预加载完成');
        isAdLoaded = true;
        unsubscribeLoaded();
        resolve();
      }
    );

    const unsubscribeError = rewardedAd.addAdEventListener(
      AdEventType.ERROR,
      (error: any) => {
        console.log('广告预加载失败:', error);
        isAdLoaded = false;
        unsubscribeError();
        resolve();
      }
    );

    rewardedAd.load();
  });
};

/**
 * 检查广告是否可用
 */
export const isAdReady = async (): Promise<boolean> => {
  if (!isNativeAdsAvailable) {
    return true; // 模拟模式始终可用
  }
  return isAdLoaded && rewardedAd !== null;
};

/**
 * 显示激励广告
 * @returns Promise<boolean> 是否成功观看完广告获得奖励
 */
export const showRewardedAd = async (): Promise<boolean> => {
  // 如果原生模块不可用，使用模拟广告
  if (!isNativeAdsAvailable) {
    console.log('模拟：开始播放广告...');
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('模拟：广告播放完成');
        resolve(true);
      }, 1500);
    });
  }

  // 使用真实广告
  return new Promise((resolve) => {
    const adUnitId = getRewardedAdUnitId();

    // 创建新的广告实例
    const ad = RewardedAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    let earnedReward = false;
    let resolved = false;

    // 设置超时（30秒）
    const timeout = setTimeout(() => {
      if (!resolved) {
        console.log('广告加载超时');
        resolved = true;
        cleanup();
        resolve(false);
      }
    }, 30000);

    // 清理监听器和超时
    const cleanup = () => {
      clearTimeout(timeout);
      unsubscribeLoaded();
      unsubscribeEarned();
      unsubscribeClosed();
      unsubscribeError();
    };

    // 监听广告加载完成
    const unsubscribeLoaded = ad.addAdEventListener(
      RewardedAdEventType.LOADED,
      () => {
        console.log('广告加载完成，开始播放');
        ad.show();
      }
    );

    // 监听用户获得奖励
    const unsubscribeEarned = ad.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      (reward: any) => {
        console.log('用户获得奖励:', reward);
        earnedReward = true;
      }
    );

    // 监听广告关闭
    const unsubscribeClosed = ad.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        console.log('广告已关闭');
        if (!resolved) {
          resolved = true;
          cleanup();
          resolve(earnedReward);
        }
      }
    );

    // 监听广告加载失败
    const unsubscribeError = ad.addAdEventListener(
      AdEventType.ERROR,
      (error: any) => {
        console.log('广告加载失败:', error);
        if (!resolved) {
          resolved = true;
          cleanup();
          resolve(false);
        }
      }
    );

    // 开始加载广告
    console.log('开始加载广告...');
    ad.load();
  });
};
