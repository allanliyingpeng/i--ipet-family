import React, { useState, useEffect } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
  Text,
  Dimensions,
  Alert,
} from 'react-native';
import { X, Download } from 'lucide-react-native';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { useTranslation } from 'react-i18next';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ImagePreviewModalProps {
  visible: boolean;
  imageSource: string | null; // base64 字符串
  onClose: () => void;
}

export function ImagePreviewModal({ visible, imageSource, onClose }: ImagePreviewModalProps) {
  const { t } = useTranslation();
  const [imageSize, setImageSize] = useState({ width: SCREEN_WIDTH - 40, height: SCREEN_WIDTH - 40 });
  const [isSaving, setIsSaving] = useState(false);

  const imageUri = imageSource ? `data:image/jpeg;base64,${imageSource}` : null;

  useEffect(() => {
    if (imageUri) {
      Image.getSize(
        imageUri,
        (w, h) => {
          const ratio = h / w;
          const maxWidth = SCREEN_WIDTH - 40;
          const maxHeight = SCREEN_HEIGHT * 0.65;

          let displayWidth = maxWidth;
          let displayHeight = maxWidth * ratio;

          if (displayHeight > maxHeight) {
            displayHeight = maxHeight;
            displayWidth = maxHeight / ratio;
          }

          setImageSize({ width: displayWidth, height: displayHeight });
        },
        () => {
          setImageSize({ width: SCREEN_WIDTH - 40, height: SCREEN_WIDTH - 40 });
        }
      );
    }
  }, [imageSource]);

  const handleDownload = async () => {
    if (!imageSource || isSaving) return;

    setIsSaving(true);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('common.permissionDenied'), t('common.needAlbumPermission'));
        setIsSaving(false);
        return;
      }

      // 将 base64 保存为文件
      const fileName = `pet_generated_${Date.now()}.jpg`;
      const fileUri = FileSystem.cacheDirectory + fileName;

      await FileSystem.writeAsStringAsync(fileUri, imageSource, {
        encoding: FileSystem.EncodingType.Base64,
      });

      await MediaLibrary.saveToLibraryAsync(fileUri);
      Alert.alert('', t('common.saved'));
    } catch (error) {
      console.log('Save error:', error);
      Alert.alert(t('common.saveFailed'), '');
    } finally {
      setIsSaving(false);
    }
  };

  if (!imageSource) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={28} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={styles.contentContainer}>
              <View style={styles.imageContainer}>
                <Image
                  source={{ uri: imageUri! }}
                  style={[styles.image, { width: imageSize.width, height: imageSize.height }]}
                  resizeMode="contain"
                />
              </View>

              <TouchableOpacity
                style={[styles.downloadButton, isSaving && styles.downloadButtonDisabled]}
                onPress={handleDownload}
                disabled={isSaving}
              >
                <Download size={20} color="#FFFFFF" />
                <Text style={styles.downloadText}>{isSaving ? t('common.saving') : t('common.save')}</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  contentContainer: {
    alignItems: 'center',
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    borderRadius: 12,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333333',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 24,
    marginTop: 30,
  },
  downloadButtonDisabled: {
    opacity: 0.6,
  },
  downloadText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
