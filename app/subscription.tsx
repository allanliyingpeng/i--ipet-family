import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '../constants/Colors';
import { useUserStore } from '../stores/userStore';

export default function SubscriptionScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { setSubscribed } = useUserStore();

  const features = [
    t('subscription.feature1'),
    t('subscription.feature2'),
    t('subscription.feature3'),
    t('subscription.feature4'),
  ];

  const handleSubscribe = () => {
    setSubscribed(true);
    router.back();
  };

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
        <Text style={styles.price}>{t('subscription.price')}</Text>
        <Text style={styles.period}>{t('subscription.period')}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubscribe}>
        <Text style={styles.buttonText}>{t('subscription.subscribe')}</Text>
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
