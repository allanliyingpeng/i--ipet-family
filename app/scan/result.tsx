import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../constants/Colors';
import { recognizePet } from '../../services/gemini';
import { imageUriToBase64 } from '../../utils/image';

const { width } = Dimensions.get('window');

interface RecognitionResult {
  breed: string;
  confidence: string;
  description: string;
}

const parseResult = (text: string, t: (key: string) => string): RecognitionResult => {
  // 1. 尝试 JSON 解析
  try {
    // 提取 JSON（处理可能的前后文字）
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const json = JSON.parse(jsonMatch[0]);
      if (json.success === false) {
        return {
          breed: t('scanResult.unknownBreed'),
          confidence: '--',
          description: json.error || text,
        };
      }
      if (json.breedName) {
        return {
          breed: json.breedName,
          confidence: `${json.confidence}%`,
          description: json.description || '',
        };
      }
    }
  } catch (e) {
    // JSON 解析失败，继续尝试正则
  }

  // 2. 尝试中文格式正则
  const breedMatchZh = text.match(/【品种名称】[：:]?\s*(.+)/);
  const confidenceMatchZh = text.match(/【置信度】[：:]?\s*(\d+%?)/);
  const descMatchZh = text.match(/【品种简介】[：:]?\s*([\s\S]+)/);

  if (breedMatchZh) {
    return {
      breed: breedMatchZh[1]?.trim() || t('scanResult.unknownBreed'),
      confidence: confidenceMatchZh?.[1]?.trim() || '--',
      description: descMatchZh?.[1]?.trim() || text,
    };
  }

  // 3. 尝试英文格式正则
  const breedMatchEn = text.match(/【Breed】[：:]?\s*(.+)/);
  const confidenceMatchEn = text.match(/【Confidence】[：:]?\s*(\d+%?)/);
  const descMatchEn = text.match(/【Description】[：:]?\s*([\s\S]+)/);

  if (breedMatchEn) {
    return {
      breed: breedMatchEn[1]?.trim() || t('scanResult.unknownBreed'),
      confidence: confidenceMatchEn?.[1]?.trim() || '--',
      description: descMatchEn?.[1]?.trim() || text,
    };
  }

  // 4. 都失败了，返回原始文本
  return {
    breed: t('scanResult.unknownBreed'),
    confidence: '--',
    description: text,
  };
};

export default function ScanResultScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RecognitionResult | null>(null);

  useEffect(() => {
    const recognize = async () => {
      if (!imageUri) {
        setError(t('scanResult.noImage'));
        setLoading(false);
        return;
      }

      try {
        const base64 = await imageUriToBase64(imageUri);
        const response = await recognizePet(base64);

        if (response.success && response.result) {
          setResult(parseResult(response.result, t));
        } else {
          setError(response.error || t('scanResult.recognizeFailed'));
        }
      } catch (err: any) {
        setError(err.message || t('scanResult.recognizeFailed'));
      } finally {
        setLoading(false);
      }
    };

    recognize();
  }, [imageUri, t]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.text} />
          <Text style={styles.backText}>{t('scanResult.back')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('scanResult.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {imageUri && (
          <Image source={{ uri: imageUri }} style={styles.uploadedImage} resizeMode="cover" />
        )}

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>{t('scanResult.recognizing')}</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => router.back()}>
              <Text style={styles.retryButtonText}>{t('scanResult.retry')}</Text>
            </TouchableOpacity>
          </View>
        ) : result ? (
          <View style={styles.resultCard}>
            <View style={styles.resultHeader}>
              <Text style={styles.breedName}>{result.breed}</Text>
              <View style={styles.confidenceBadge}>
                <Text style={styles.confidenceText}>{result.confidence}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <Text style={styles.descriptionTitle}>{t('scanResult.description')}</Text>
            <Text style={styles.description}>{result.description}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    fontSize: 17,
    color: Colors.text,
    marginLeft: -4,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.text,
  },
  placeholder: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  uploadedImage: {
    width: width - 32,
    height: (width - 32) * 0.75,
    marginHorizontal: 16,
    borderRadius: 16,
    marginBottom: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#E53935',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  resultCard: {
    marginHorizontal: 16,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  breedName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  confidenceBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  confidenceText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4CAF50',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 16,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: Colors.textSecondary,
  },
});
