import { Platform } from 'react-native';

// 商品 ID - 需要与 App Store Connect 和 Google Play Console 中配置的一致
const PRODUCT_ID = 'pro_monthly';

// 检查原生 IAP 模块是否可用
let isNativeIAPAvailable = false;
let RNIap: any = null;

try {
  RNIap = require('react-native-iap');
  // 检查模块是否真正可用（不仅仅是能 require）
  if (RNIap && typeof RNIap.initConnection === 'function') {
    isNativeIAPAvailable = true;
    console.log('IAP 模块已加载');
  } else {
    console.log('IAP 模块加载但不可用');
    isNativeIAPAvailable = false;
  }
} catch (error) {
  console.log('IAP 模块不可用');
  isNativeIAPAvailable = false;
}

/**
 * 检查 IAP 是否可用
 */
export const isIAPAvailable = (): boolean => {
  return isNativeIAPAvailable;
};

// 订阅信息类型
export interface SubscriptionInfo {
  productId: string;
  localizedPrice: string;
  price: number;
  currency: string;
  offerToken?: string; // Android 需要
}

// 缓存订阅信息
let cachedSubscriptionInfo: SubscriptionInfo | null = null;

/**
 * 初始化 IAP 连接
 */
export const initIAP = async (): Promise<boolean> => {
  if (!isNativeIAPAvailable) {
    console.log('IAP 不可用：原生模块未加载');
    return false;
  }

  try {
    await RNIap.initConnection();
    console.log('IAP 连接成功');

    // 预加载订阅信息
    await getSubscriptionInfo();

    return true;
  } catch (error) {
    console.log('IAP 连接失败:', error);
    return false;
  }
};

/**
 * 结束 IAP 连接
 */
export const endIAP = async (): Promise<void> => {
  if (!isNativeIAPAvailable) return;

  try {
    await RNIap.endConnection();
    cachedSubscriptionInfo = null;
  } catch (error) {
    console.log('IAP 断开连接失败:', error);
  }
};

/**
 * 获取订阅商品信息
 */
export const getSubscriptionInfo = async (): Promise<SubscriptionInfo | null> => {
  if (!isNativeIAPAvailable) {
    return null;
  }

  // 返回缓存
  if (cachedSubscriptionInfo) {
    return cachedSubscriptionInfo;
  }

  try {
    const subscriptions = await RNIap.getSubscriptions({ skus: [PRODUCT_ID] });
    if (subscriptions.length > 0) {
      const sub = subscriptions[0];

      // Android 需要 offerToken
      let offerToken: string | undefined;
      if (Platform.OS === 'android' && sub.subscriptionOfferDetails?.length > 0) {
        offerToken = sub.subscriptionOfferDetails[0].offerToken;
      }

      cachedSubscriptionInfo = {
        productId: sub.productId,
        localizedPrice: sub.localizedPrice || sub.oneTimePurchaseOfferDetails?.formattedPrice || '$4.99',
        price: parseFloat(sub.price || '4.99'),
        currency: sub.currency || 'USD',
        offerToken,
      };
      return cachedSubscriptionInfo;
    }
    console.log('未找到订阅商品');
    return null;
  } catch (error) {
    console.log('获取订阅信息失败:', error);
    return null;
  }
};

/**
 * 购买订阅
 */
export const purchaseSubscription = async (): Promise<{
  success: boolean;
  error?: string;
  errorCode?: string;
}> => {
  if (!isNativeIAPAvailable) {
    return { success: false, error: 'IAP_NOT_AVAILABLE', errorCode: 'IAP_NOT_AVAILABLE' };
  }

  try {
    // 确保有订阅信息
    const subInfo = await getSubscriptionInfo();
    if (!subInfo) {
      return { success: false, error: '无法获取订阅商品信息', errorCode: 'PRODUCT_NOT_FOUND' };
    }

    if (Platform.OS === 'ios') {
      // iOS 购买
      await RNIap.requestSubscription({ sku: PRODUCT_ID });
    } else {
      // Android 购买 - 需要 offerToken
      if (!subInfo.offerToken) {
        return { success: false, error: '无法获取订阅优惠信息', errorCode: 'OFFER_TOKEN_NOT_FOUND' };
      }
      await RNIap.requestSubscription({
        sku: PRODUCT_ID,
        subscriptionOffers: [{ sku: PRODUCT_ID, offerToken: subInfo.offerToken }],
      });
    }

    // 购买请求已发送，实际结果需要通过监听器获取
    // react-native-iap v14+ 的 requestSubscription 会等待购买完成
    return { success: true };
  } catch (error: any) {
    console.log('购买错误:', error);
    if (error.code === 'E_USER_CANCELLED') {
      return { success: false, error: '用户取消', errorCode: 'USER_CANCELLED' };
    }
    if (error.code === 'E_ITEM_UNAVAILABLE') {
      return { success: false, error: '商品不可用', errorCode: 'ITEM_UNAVAILABLE' };
    }
    if (error.code === 'E_NETWORK_ERROR') {
      return { success: false, error: '网络错误', errorCode: 'NETWORK_ERROR' };
    }
    return { success: false, error: error.message || '购买失败', errorCode: 'PURCHASE_FAILED' };
  }
};

/**
 * 恢复购买（用于用户换设备后恢复订阅）
 */
export const restorePurchases = async (): Promise<{
  success: boolean;
  isPro: boolean;
  error?: string;
  errorCode?: string;
}> => {
  if (!isNativeIAPAvailable) {
    return { success: false, isPro: false, error: 'IAP_NOT_AVAILABLE', errorCode: 'IAP_NOT_AVAILABLE' };
  }

  try {
    // 确保 IAP 已初始化
    await RNIap.initConnection();

    const purchases = await RNIap.getAvailablePurchases();
    console.log('恢复购买结果:', purchases?.length || 0, '个');

    const hasProSubscription = purchases.some(
      (purchase: any) => purchase.productId === PRODUCT_ID
    );
    return { success: true, isPro: hasProSubscription };
  } catch (error: any) {
    console.log('恢复购买错误:', error);
    return { success: false, isPro: false, error: error.message || '恢复失败', errorCode: 'RESTORE_FAILED' };
  }
};

/**
 * 检查当前订阅状态
 */
export const checkSubscriptionStatus = async (): Promise<boolean> => {
  if (!isNativeIAPAvailable) {
    return false;
  }

  try {
    const purchases = await RNIap.getAvailablePurchases();
    return purchases.some(
      (purchase: any) => purchase.productId === PRODUCT_ID
    );
  } catch (error) {
    console.log('检查订阅状态失败:', error);
    return false;
  }
};

/**
 * 完成交易（iOS 需要）
 */
export const finishTransaction = async (purchase: any): Promise<void> => {
  if (!isNativeIAPAvailable) return;

  try {
    await RNIap.finishTransaction({ purchase, isConsumable: false });
    console.log('交易已完成');
  } catch (error) {
    console.log('完成交易失败:', error);
  }
};
