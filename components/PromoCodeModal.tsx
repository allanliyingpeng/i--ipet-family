import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { X, Gift, CheckCircle, XCircle } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '../constants/Colors';
import { useUserStore } from '../stores/userStore';

interface PromoCodeModalProps {
  visible: boolean;
  onClose: () => void;
}

export function PromoCodeModal({ visible, onClose }: PromoCodeModalProps) {
  const { t } = useTranslation();
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string; reward?: string } | null>(null);
  const redeemPromoCode = useUserStore((state) => state.redeemPromoCode);

  const handleRedeem = async () => {
    if (!code.trim()) return;

    setIsLoading(true);
    // 模拟网络延迟
    await new Promise((resolve) => setTimeout(resolve, 500));

    const redeemResult = redeemPromoCode(code);
    setResult(redeemResult);
    setIsLoading(false);

    if (redeemResult.success) {
      setCode('');
    }
  };

  const handleClose = () => {
    setCode('');
    setResult(null);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <X size={24} color={Colors.textSecondary} />
          </TouchableOpacity>

          <Gift size={48} color={Colors.primary} style={styles.icon} />
          <Text style={styles.title}>{t('promoCode.title')}</Text>
          <Text style={styles.subtitle}>{t('promoCode.subtitle')}</Text>

          <TextInput
            style={styles.input}
            placeholder={t('promoCode.placeholder')}
            placeholderTextColor="#999"
            value={code}
            onChangeText={setCode}
            autoCapitalize="characters"
            autoCorrect={false}
            editable={!isLoading}
          />

          {result && (
            <View style={[styles.resultContainer, result.success ? styles.successBg : styles.errorBg]}>
              {result.success ? (
                <CheckCircle size={20} color="#4CAF50" />
              ) : (
                <XCircle size={20} color="#E53935" />
              )}
              <View style={styles.resultTextContainer}>
                <Text style={[styles.resultMessage, result.success ? styles.successText : styles.errorText]}>
                  {result.message}
                </Text>
                {result.reward && (
                  <Text style={styles.rewardText}>{t('promoCode.reward', { reward: result.reward })}</Text>
                )}
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[styles.redeemButton, (!code.trim() || isLoading) && styles.buttonDisabled]}
            onPress={handleRedeem}
            disabled={!code.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={Colors.white} />
            ) : (
              <Text style={styles.redeemButtonText}>{t('promoCode.redeem')}</Text>
            )}
          </TouchableOpacity>
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
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    padding: 4,
  },
  icon: {
    marginTop: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  input: {
    width: '100%',
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.text,
    backgroundColor: Colors.background,
    textAlign: 'center',
    letterSpacing: 2,
  },
  resultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  successBg: {
    backgroundColor: '#E8F5E9',
  },
  errorBg: {
    backgroundColor: '#FFEBEE',
  },
  resultTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  resultMessage: {
    fontSize: 14,
    fontWeight: '600',
  },
  successText: {
    color: '#4CAF50',
  },
  errorText: {
    color: '#E53935',
  },
  rewardText: {
    fontSize: 13,
    color: Colors.text,
    marginTop: 4,
  },
  redeemButton: {
    width: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  redeemButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
