import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActionSheetIOS,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Camera } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../constants/Colors';
import { breedRows } from '../../constants/breeds';
import { BreedTagRow } from '../../components/BreedTagRow';
import { UsageLimitModal } from '../../components/UsageLimitModal';
import { useUserStore } from '../../stores/userStore';

export default function BreedScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [pendingImageUri, setPendingImageUri] = useState<string | null>(null);
  const { isPro, recognizeCount, useRecognize, watchAdForRecognize } = useUserStore();

  // 执行识别操作
  const doRecognize = (imageUri: string) => {
    // 扣减次数（Pro用户不扣减）
    if (!isPro) {
      useRecognize();
    }
    // 跳转到结果页
    router.push({
      pathname: '/scan/result',
      params: { imageUri },
    });
  };

  // 处理识别请求
  const handleRecognize = (imageUri: string) => {
    // Pro用户直接执行
    if (isPro) {
      doRecognize(imageUri);
      return;
    }

    // 检查次数
    if (recognizeCount > 0) {
      doRecognize(imageUri);
    } else {
      // 没次数，显示弹窗，记录待执行的操作
      setPendingImageUri(imageUri);
      setShowLimitModal(true);
    }
  };

  // 广告看完后的回调
  const handleAdComplete = () => {
    watchAdForRecognize(); // 次数+1
    setShowLimitModal(false);
    // 自动继续之前的操作
    if (pendingImageUri) {
      doRecognize(pendingImageUri);
      setPendingImageUri(null);
    }
  };

  const handleModalClose = () => {
    setShowLimitModal(false);
    setPendingImageUri(null);
  };

  const launchCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('breed.permissionDenied'), t('breed.needCameraPermission'));
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]) {
        handleRecognize(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert(t('breed.error'), t('breed.cameraError'));
    }
  };

  const launchLibrary = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('breed.permissionDenied'), t('breed.needAlbumPermission'));
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]) {
        handleRecognize(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert(t('breed.error'), t('breed.albumError'));
    }
  };

  const showActionSheet = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [t('breed.cancel'), t('breed.takePhoto'), t('breed.choosePhoto')],
          cancelButtonIndex: 0,
          title: t('breed.selectImageSource'),
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            launchCamera();
          } else if (buttonIndex === 2) {
            launchLibrary();
          }
        }
      );
    } else {
      Alert.alert(
        t('breed.selectImageSource'),
        '',
        [
          { text: t('breed.takePhoto'), onPress: launchCamera },
          { text: t('breed.choosePhoto'), onPress: launchLibrary },
          { text: t('breed.cancel'), style: 'cancel' },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.sectionTitle}>{t('breed.supported')}</Text>

        <View style={styles.tagsContainer}>
          {breedRows.map((row, index) => (
            <BreedTagRow key={index} items={row} />
          ))}
        </View>

        <TouchableOpacity
          style={styles.scanButton}
          onPress={showActionSheet}
          activeOpacity={0.8}
        >
          <Camera size={48} color="#999999" strokeWidth={1.5} />
          <View style={styles.scanTextContainer}>
            <Text style={styles.scanTitle}>{t('breed.scanTitle')}</Text>
            <Text style={styles.scanSubtitle}>{t('breed.scanSubtitle')}</Text>
            {!isPro && (
              <Text style={styles.remainingCount}>{t('breed.remainingCount', { count: recognizeCount })}</Text>
            )}
          </View>
        </TouchableOpacity>
      </View>

      <UsageLimitModal
        visible={showLimitModal}
        onClose={handleModalClose}
        featureType="recognize"
        onWatchAdComplete={handleAdComplete}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 36,
  },
  tagsContainer: {
    marginBottom: 36,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 28,
    height: 120,
  },
  scanTextContainer: {
    marginLeft: 24,
  },
  scanTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  scanSubtitle: {
    fontSize: 14,
    color: '#999999',
  },
  remainingCount: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 4,
  },
});
