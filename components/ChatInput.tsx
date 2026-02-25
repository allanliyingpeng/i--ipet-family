import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActionSheetIOS,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { Camera, Send, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { Colors } from '../constants/Colors';

interface ChatInputProps {
  onSend: (text: string, image?: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const { t } = useTranslation();
  const [text, setText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleSend = () => {
    if (text.trim() || selectedImage) {
      onSend(text.trim(), selectedImage || undefined);
      setText('');
      setSelectedImage(null);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  const launchCamera = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('chatInput.permissionDenied'), t('chatInput.needCameraPermission'));
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert(t('chatInput.error'), t('chatInput.cameraError'));
    }
  };

  const launchLibrary = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('chatInput.permissionDenied'), t('chatInput.needAlbumPermission'));
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled && result.assets?.[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert(t('chatInput.error'), t('chatInput.albumError'));
    }
  };

  const showImagePicker = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [t('chatInput.cancel'), t('chatInput.takePhoto'), t('chatInput.choosePhoto')],
          cancelButtonIndex: 0,
          title: t('chatInput.selectImage'),
        },
        (buttonIndex) => {
          if (buttonIndex === 1) launchCamera();
          else if (buttonIndex === 2) launchLibrary();
        }
      );
    } else {
      Alert.alert(t('chatInput.selectImage'), '', [
        { text: t('chatInput.takePhoto'), onPress: launchCamera },
        { text: t('chatInput.choosePhoto'), onPress: launchLibrary },
        { text: t('chatInput.cancel'), style: 'cancel' },
      ]);
    }
  };

  const canSend = text.trim().length > 0 || selectedImage;

  return (
    <View style={styles.container}>
      <View style={[styles.inputContainer, selectedImage && styles.inputContainerWithImage]}>
        {selectedImage && (
          <View style={styles.imagePreviewContainer}>
            <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
            <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
              <X size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder={t('chatInput.placeholder')}
            placeholderTextColor="#999999"
            value={text}
            onChangeText={setText}
            multiline
            maxLength={500}
            editable={!disabled}
          />
          <TouchableOpacity
            style={styles.iconButton}
            onPress={showImagePicker}
            disabled={disabled}
          >
            <Camera size={24} color="#999999" />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.iconButton, !canSend && styles.iconButtonDisabled]}
            onPress={handleSend}
            disabled={disabled || !canSend}
          >
            <Send size={22} color={canSend ? Colors.primary : '#CCCCCC'} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 4,
  },
  inputContainer: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 24,
    paddingHorizontal: 16,
    minHeight: 48,
  },
  inputContainerWithImage: {
    borderRadius: 16,
    paddingTop: 12,
  },
  imagePreviewContainer: {
    position: 'relative',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  imagePreview: {
    width: 120,
    height: 90,
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    paddingVertical: 12,
    maxHeight: 100,
  },
  iconButton: {
    padding: 8,
    marginLeft: 4,
  },
  iconButtonDisabled: {
    opacity: 0.5,
  },
});