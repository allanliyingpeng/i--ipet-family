import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { X, Play, Crown } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors } from '../constants/Colors';
import { showRewardedAd } from '../utils/ads';
import { AD_REWARDS } from '../stores/userStore';

export type FeatureType = 'recognize' | 'chat' | 'generate';

interface UsageLimitModalProps {
  visible: boolean;
  onClose: () => void;
  featureType: FeatureType;
  onWatchAdComplete: () => void; // 广告看完后的回调
  generateAdProgress?: number; // 生图广告观看进度 (0-2)
}

export function UsageLimitModal({
  visible,
  onClose,
  featureType,
  onWatchAdComplete,
  generateAdProgress = 0,
}: UsageLimitModalProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);

  const featureName = t(`features.${featureType}`);
  const adConfig = AD_REWARDS[featureType];
  const isGenerate = featureType === 'generate';
  const remainingAds = adConfig.adsRequired - generateAdProgress;

  const handleWatchAd = async () => {
    setIsLoading(true);
    try {
      const success = await showRewardedAd();
      if (success) {
        onWatchAdComplete();
      }
    } catch (error) {
      console.log('广告播放失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = () => {
    onClose();
    router.push('/subscription');
  };

  const getAdButtonText = () => {
    if (isGenerate) {
      if (remainingAds > 1) {
        return t('limitModal.watchAdRemaining', { count: remainingAds });
      } else {
        return t('limitModal.watchAd', { count: 1 });
      }
    }
    // 疑难分析和品种识别根据配置显示
    return t('limitModal.watchAd', { count: adConfig.reward });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color={Colors.textSecondary} />
          </TouchableOpacity>

          <Text style={styles.title}>{t('limitModal.title')}</Text>
          <Text style={styles.subtitle}>
            {t('limitModal.subtitle', { feature: featureName })}
          </Text>

          {/* 看广告按钮 */}
          <TouchableOpacity
            style={[styles.adButton, isLoading && styles.buttonDisabled]}
            onPress={handleWatchAd}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <>
                <Play size={20} color={Colors.primary} />
                <View style={styles.adButtonTextContainer}>
                  <Text style={styles.adButtonText}>{getAdButtonText()}</Text>
                  {isGenerate && (
                    <Text style={styles.adProgress}>
                      {t('limitModal.progress', { current: generateAdProgress, total: adConfig.adsRequired })}
                    </Text>
                  )}
                </View>
              </>
            )}
          </TouchableOpacity>

          {/* 升级 Pro 按钮 */}
          <TouchableOpacity style={styles.proButton} onPress={handleUpgrade}>
            <Crown size={20} color={Colors.white} />
            <Text style={styles.proButtonText}>{t('limitModal.upgradePro')}</Text>
          </TouchableOpacity>

          <Text style={styles.hint}>
            {t('limitModal.proHint')}
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  container: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 340,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  adButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F7FF',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  adButtonTextContainer: {
    marginLeft: 8,
  },
  adButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.primary,
  },
  adProgress: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  proButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  proButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    marginLeft: 8,
  },
  hint: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
