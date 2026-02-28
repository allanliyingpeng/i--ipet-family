import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Linking,
  Dimensions,
  Animated,
  Alert,
} from 'react-native';
import { X, Crown, RefreshCw, Mail, MessageSquare, Shield, FileText, Camera, MessageCircle, Image, Gift } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors } from '../constants/Colors';
import { useUserStore, DEFAULT_FREE_LIMITS, AD_REWARDS } from '../stores/userStore';
import { PromoCodeModal } from './PromoCodeModal';
import { restorePurchases, isIAPAvailable, initIAP } from '../services/iap';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = SCREEN_WIDTH * 0.7;

interface DrawerMenuProps {
  visible: boolean;
  onClose: () => void;
}

export function DrawerMenu({ visible, onClose }: DrawerMenuProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [showPromoModal, setShowPromoModal] = useState(false);
  const {
    isPro,
    proExpiresAt,
    recognizeCount,
    chatCount,
    generateCount,
    generateAdWatchCount,
  } = useUserStore();

  // 恢复购买
  const handleRestorePurchase = async () => {
    if (!isIAPAvailable()) {
      Alert.alert(
        t('subscription.errorTitle'),
        t('subscription.notAvailable')
      );
      return;
    }

    // 先初始化 IAP
    const initSuccess = await initIAP();
    if (!initSuccess) {
      Alert.alert(
        t('subscription.errorTitle'),
        t('subscription.notAvailable')
      );
      return;
    }

    const result = await restorePurchases();
    if (result.success) {
      if (result.isPro) {
        // 恢复成功，设置 Pro 状态
        const expiresAt = new Date();
        expiresAt.setMonth(expiresAt.getMonth() + 1);
        useUserStore.setState({
          isPro: true,
          proExpiresAt: expiresAt.toISOString(),
        });
        Alert.alert(t('subscription.errorTitle'), t('subscription.restoreSuccess'));
      } else {
        Alert.alert(t('subscription.errorTitle'), t('subscription.restoreNotFound'));
      }
    } else {
      if (result.errorCode === 'IAP_NOT_AVAILABLE') {
        Alert.alert(
          t('subscription.errorTitle'),
          t('subscription.notAvailable')
        );
      } else {
        Alert.alert(t('subscription.errorTitle'), result.error || t('subscription.restoreFailed'));
      }
    }
    onClose();
  };

  // 格式化到期时间
  const formatExpiresAt = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  };

  const menuItems = [
    {
      icon: Gift,
      label: t('drawer.redeemCode'),
      onPress: () => {
        setShowPromoModal(true);
      },
    },
    {
      icon: RefreshCw,
      label: t('drawer.restorePurchase'),
      onPress: handleRestorePurchase,
    },
    {
      icon: Mail,
      label: t('drawer.contactUs'),
      link: 'mailto:support@ifamily.pet',
      onPress: () => Linking.openURL('mailto:support@ifamily.pet'),
    },
    {
      icon: MessageSquare,
      label: t('drawer.feedback'),
      link: 'mailto:feedback@ifamily.pet',
      onPress: () => Linking.openURL('mailto:feedback@ifamily.pet'),
    },
    {
      icon: Shield,
      label: t('drawer.privacy'),
      onPress: () => {
        onClose();
        Linking.openURL('https://ifamily.pet/privacy.html');
      },
    },
    {
      icon: FileText,
      label: t('drawer.disclaimer'),
      onPress: () => {
        onClose();
        Linking.openURL('https://ifamily.pet/terms.html');
      },
    },
  ];

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} activeOpacity={1} />
        <Animated.View style={styles.drawer}>
          {/* 顶部空白区域 90px */}
          <View style={styles.topSpacer} />

          <View style={styles.drawerContent}>
            <View style={styles.header}>
              <Text style={styles.title}>{t('drawer.settings')}</Text>
              <TouchableOpacity onPress={onClose}>
                <X size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
              <View style={styles.statusCard}>
                <View style={styles.statusRow}>
                  <Crown size={20} color={isPro ? Colors.accent : Colors.textSecondary} />
                  <Text style={styles.statusLabel}>{t('drawer.subscription')}</Text>
                  <Text style={[styles.statusValue, isPro && styles.subscribed]}>
                    {isPro ? t('drawer.proMember') : t('drawer.freeUser')}
                  </Text>
                </View>

                {isPro && proExpiresAt && (
                  <Text style={styles.expiresText}>
                    {t('drawer.expiresAt', { date: formatExpiresAt(proExpiresAt) })}
                  </Text>
                )}

                <View style={styles.divider} />
                <Text style={styles.usageTitle}>{t('drawer.todayRemaining')}</Text>

                {/* 品种识别 */}
                <View style={styles.usageRow}>
                  <Camera size={16} color={Colors.textSecondary} />
                  <Text style={styles.usageLabel}>{t('drawer.breedRecognize')}</Text>
                  <Text style={styles.usageValue}>
                    {isPro ? t('drawer.unlimited') : `${recognizeCount}/${DEFAULT_FREE_LIMITS.recognize}`}
                  </Text>
                  {!isPro && <Text style={styles.adHint}>{t('drawer.adReward', { count: 1 })}</Text>}
                </View>

                {/* 疑难分析 */}
                <View style={styles.usageRow}>
                  <MessageCircle size={16} color={Colors.textSecondary} />
                  <Text style={styles.usageLabel}>{t('drawer.chatAnalysis')}</Text>
                  <Text style={styles.usageValue}>
                    {isPro ? t('drawer.unlimited') : `${chatCount}/${DEFAULT_FREE_LIMITS.chat}`}
                  </Text>
                  {!isPro && <Text style={styles.adHint}>{t('drawer.adReward', { count: AD_REWARDS.chat.reward })}</Text>}
                </View>

                {/* 宠物生图 */}
                <View style={styles.usageRow}>
                  <Image size={16} color={Colors.textSecondary} />
                  <Text style={styles.usageLabel}>{t('drawer.petGenerate')}</Text>
                  <Text style={styles.usageValue}>
                    {isPro ? t('drawer.unlimited') : `${generateCount}/${DEFAULT_FREE_LIMITS.generate}`}
                  </Text>
                  {!isPro && (
                    <Text style={styles.adHint}>
                      {t('drawer.adReward3', { count: AD_REWARDS.generate.adsRequired })}
                      {generateAdWatchCount > 0 && ` (${generateAdWatchCount}/3)`}
                    </Text>
                  )}
                </View>

                {!isPro && (
                  <TouchableOpacity
                    style={styles.upgradeButton}
                    onPress={() => {
                      onClose();
                      router.push('/subscription');
                    }}
                  >
                    <Text style={styles.upgradeText}>{t('drawer.upgradePro')}</Text>
                  </TouchableOpacity>
                )}
              </View>

              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuItem}
                  onPress={item.onPress}
                >
                  <item.icon size={20} color={Colors.text} />
                  <Text style={styles.menuLabel}>{item.label}</Text>
                  {item.link && (
                    <Text style={styles.menuLink}>{item.link.includes('mailto') ? item.link.replace('mailto:', '') : ''}</Text>
                  )}
                </TouchableOpacity>
              ))}

              <Text style={styles.version}>{t('drawer.version', { version: '1.0.0' })}</Text>
            </ScrollView>
          </View>
        </Animated.View>
      </View>

      <PromoCodeModal
        visible={showPromoModal}
        onClose={() => setShowPromoModal(false)}
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  drawer: {
    width: DRAWER_WIDTH,
    backgroundColor: Colors.background,
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
  },
  topSpacer: {
    height: 90,
  },
  drawerContent: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statusCard: {
    backgroundColor: Colors.secondaryBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusLabel: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  subscribed: {
    color: Colors.accent,
  },
  expiresText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: -8,
    marginBottom: 4,
    marginLeft: 28,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
  usageTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  usageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  usageLabel: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: Colors.text,
  },
  usageValue: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.primary,
    marginRight: 8,
  },
  adHint: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  upgradeButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  upgradeText: {
    color: Colors.white,
    fontWeight: '600',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  menuLabel: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: Colors.text,
  },
  menuLink: {
    fontSize: 12,
    color: '#007AFF',
  },
  version: {
    marginTop: 24,
    textAlign: 'center',
    fontSize: 12,
    color: Colors.textSecondary,
  },
});
