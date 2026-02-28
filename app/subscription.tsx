import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '../constants/Colors';
import { useUserStore } from '../stores/userStore';
import {
  initIAP,
  endIAP,
  purchaseSubscription,
  isIAPAvailable,
  finishTransaction,
  getSubscriptionInfo,
  SubscriptionInfo,
} from '../services/iap';

// 尝试导入购买监听器
let purchaseUpdatedListener: any = null;
let purchaseErrorListener: any = null;

try {
  const RNIap = require('react-native-iap');
  purchaseUpdatedListener = RNIap.purchaseUpdatedListener;
  purchaseErrorListener = RNIap.purchaseErrorListener;
} catch (e) {
  console.log('IAP 监听器不可用');
}

export default function SubscriptionScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [iapReady, setIapReady] = useState(false);
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);

  useEffect(() => {
    let purchaseUpdateSubscription: any = null;
    let purchaseErrorSubscription: any = null;

    const setupIAP = async () => {
      if (!isIAPAvailable()) {
        setIapReady(false);
        return;
      }

      const success = await initIAP();
      setIapReady(success);

      if (success) {
        // 获取订阅信息用于显示价格
        const info = await getSubscriptionInfo();
        setSubscriptionInfo(info);

        // 设置购买监听器
        if (purchaseUpdatedListener) {
          purchaseUpdateSubscription = purchaseUpdatedListener(async (purchase: any) => {
            console.log('购买更新:', purchase);

            if (purchase.productId === 'pro_monthly') {
              // 完成交易
              await finishTransaction(purchase);

              // 设置 Pro 状态
              const expiresAt = new Date();
              expiresAt.setMonth(expiresAt.getMonth() + 1);
              useUserStore.setState({
                isPro: true,
                proExpiresAt: expiresAt.toISOString(),
              });

              setIsLoading(false);
              router.back();
            }
          });
        }

        if (purchaseErrorListener) {
          purchaseErrorSubscription = purchaseErrorListener((error: any) => {
            console.log('购买错误监听:', error);
            setIsLoading(false);

            if (error.code !== 'E_USER_CANCELLED') {
              Alert.alert(
                t('subscription.errorTitle'),
                t('subscription.purchaseFailed')
              );
            }
          });
        }
      }
    };

    setupIAP();

    return () => {
      if (purchaseUpdateSubscription) {
        purchaseUpdateSubscription.remove();
      }
      if (purchaseErrorSubscription) {
        purchaseErrorSubscription.remove();
      }
      endIAP();
    };
  }, []);

  const features = [
    t('subscription.feature1'),
    t('subscription.feature2'),
    t('subscription.feature3'),
    t('subscription.feature4'),
  ];

  const handleSubscribe = async () => {
    // 检查 IAP 是否可用
    if (!isIAPAvailable() || !iapReady) {
      Alert.alert(
        t('subscription.errorTitle'),
        t('subscription.notAvailable')
      );
      return;
    }

    setIsLoading(true);
    try {
      const result = await purchaseSubscription();

      if (!result.success) {
        setIsLoading(false);
        if (result.errorCode === 'IAP_NOT_AVAILABLE') {
          Alert.alert(
            t('subscription.errorTitle'),
            t('subscription.notAvailable')
          );
        } else if (result.errorCode === 'USER_CANCELLED') {
          // 用户取消，不显示错误
        } else if (result.errorCode === 'PRODUCT_NOT_FOUND' || result.errorCode === 'OFFER_TOKEN_NOT_FOUND') {
          Alert.alert(
            t('subscription.errorTitle'),
            t('subscription.notAvailable')
          );
        } else {
          Alert.alert(
            t('subscription.errorTitle'),
            t('subscription.purchaseFailed')
          );
        }
      }
      // 如果成功，等待监听器处理
    } catch (error) {
      console.error('订阅错误:', error);
      setIsLoading(false);
      Alert.alert(
        t('subscription.errorTitle'),
        t('subscription.notAvailable')
      );
    }
  };

  // 显示价格（优先使用从商店获取的价格）
  const displayPrice = subscriptionInfo?.localizedPrice || t('subscription.price');

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('subscription.title')}</Text>
        <Text style={styles.subtitle}>{t('subscription.subtitle')}</Text>
      </View>

      <View style={styles.features}>
        {features.map((feature, index) => (
          <View key={index} style={styles.featureItem}>
            <Check size={20} color={Colors.accent} />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <View style={styles.pricing}>
        <Text style={styles.price}>{displayPrice}</Text>
        <Text style={styles.period}>{t('subscription.period')}</Text>
      </View>

      <TouchableOpacity
        style={[styles.button, isLoading && styles.buttonDisabled]}
        onPress={handleSubscribe}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <Text style={styles.buttonText}>{t('subscription.subscribe')}</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.terms}>
        {t('subscription.terms')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  features: {
    backgroundColor: Colors.secondaryBackground,
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureText: {
    marginLeft: 12,
    fontSize: 16,
    color: Colors.text,
  },
  pricing: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 24,
  },
  price: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.text,
  },
  period: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '600',
  },
  terms: {
    marginTop: 16,
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
