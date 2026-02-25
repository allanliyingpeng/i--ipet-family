import { Platform } from 'react-native';

// 商品 ID
const PRODUCT_ID = 'pro_monthly';

// 检查原生 IAP 模块是否可用
let isNativeIAPAvailable = false;
let RNIap: any = null;

try {
  RNIap = require('react-native-iap');
  isNativeIAPAvailable = true;
  console.log('IAP 模块已加载');
} catch (error) {
  console.log('IAP 模块不可用，使用模拟模式');
  isNativeIAPAvailable = false;
}

// 订阅信息类型
export interface SubscriptionInfo {
  productId: string;
  localizedPrice: string;
  price: number;
  currency: string;
}

/**
 * 初始化 IAP 连接
 */
export const initIAP = async (): Promise<boolean> => {
  if (!isNativeIAPAvailable) {
    console.log('模拟：IAP 初始化成功');
    return true;
  }

  try {
    await RNIap.initConnection();
    console.log('IAP 连接成功');
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
  } catch (error) {
    console.log('IAP 断开连接失败:', error);
  }
};

/**
 * 获取订阅商品信息
 */
export const getSubscriptionInfo = async (): Promise<SubscriptionInfo | null> => {
  if (!isNativeIAPAvailable) {
    // 模拟模式返回默认价格
    return {
      productId: PRODUCT_ID,
      localizedPrice: '$4.00',
      price: 4.00,
      currency: 'USD',
    };
  }

  try {
    const subscriptions = await RNIap.getSubscriptions({ skus: [PRODUCT_ID] });
    if (subscriptions.length > 0) {
      const sub = subscriptions[0];
      return {
        productId: sub.productId,
        localizedPrice: sub.localizedPrice,
        price: parseFloat(sub.price),
        currency: sub.currency,
      };
    }
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
}> => {
  if (!isNativeIAPAvailable) {
    // 模拟模式：延迟后返回成功
    console.log('模拟：开始购买订阅...');
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('模拟：订阅购买成功');
        resolve({ success: true });
      }, 1500);
    });
  }

  try {
    if (Platform.OS === 'ios') {
      await RNIap.requestSubscription({ sku: PRODUCT_ID });
    } else {
      await RNIap.requestSubscription({
        sku: PRODUCT_ID,
        subscriptionOffers: [{ sku: PRODUCT_ID, offerToken: '' }],
      });
    }
    return { success: true };
  } catch (error: any) {
    if (error.code === 'E_USER_CANCELLED') {
      return { success: false, error: '用户取消' };
    }
    return { success: false, error: error.message || '购买失败' };
  }
};

/**
 * 恢复购买（用于用户换设备后恢复订阅）
 */
export const restorePurchases = async (): Promise<{
  success: boolean;
  isPro: boolean;
  error?: string;
}> => {
  if (!isNativeIAPAvailable) {
    console.log('模拟：恢复购买');
    return { success: true, isPro: false };
  }

  try {
    const purchases = await RNIap.getAvailablePurchases();
    const hasProSubscription = purchases.some(
      (purchase: any) => purchase.productId === PRODUCT_ID
    );
    return { success: true, isPro: hasProSubscription };
  } catch (error: any) {
    return { success: false, isPro: false, error: error.message || '恢复失败' };
  }
};

/**
 * 检查当前订阅状态
 */
export const checkSubscriptionStatus = async (): Promise<boolean> => {
  if (!isNativeIAPAvailable) {
    return false; // 模拟模式默认非 Pro
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
