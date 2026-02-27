import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../constants/Colors';
import { CaseCarousel } from '../../components/CaseCarousel';
import { ChatBubble } from '../../components/ChatBubble';
import { ChatInput } from '../../components/ChatInput';
import { ImagePreviewModal } from '../../components/ImagePreviewModal';
import { UsageLimitModal } from '../../components/UsageLimitModal';
import { generatePetImage } from '../../services/gemini';
import { useUserStore } from '../../stores/userStore';
import { imageUriToBase64, base64ToDataUri } from '../../utils/image';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  generatedImage?: string; // base64 图片
  isGenerating?: boolean;
  timestamp: Date;
}

export default function GenerateScreen() {
  const { t } = useTranslation();

  const getWelcomeMessage = (): Message => ({
    id: 'welcome',
    role: 'assistant',
    content: t('generate.welcome'),
    timestamp: new Date(),
  });

  const [messages, setMessages] = useState<Message[]>([getWelcomeMessage()]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedPetImage, setUploadedPetImage] = useState<string | null>(null);
  const [uploadedPetImageBase64, setUploadedPetImageBase64] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [pendingGenerate, setPendingGenerate] = useState<{ imageBase64: string; text: string } | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const { useGenerate, watchAdForGenerate, isPro, generateCount, generateAdWatchCount } = useUserStore();

  const scrollToBottom = () => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (text: string, image?: string) => {
    if (!text && !image) return;

    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text || '',
      image,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // 情况一：用户同时发送了图片 + 文字 → 直接开始生成
    if (image && text) {
      // Pro 用户直接生成
      if (isPro) {
        // 继续生成流程
      } else if (generateCount > 0) {
        useGenerate(); // 扣减次数
        // 继续生成流程
      } else {
        // 没有次数，存储待生成信息并弹窗
        const base64 = await imageUriToBase64(image);
        setPendingGenerate({ imageBase64: base64, text });
        setShowLimitModal(true);
        return;
      }

      setIsLoading(true);

      // 显示生成中状态
      const generatingMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: t('generate.generating'),
        isGenerating: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, generatingMessage]);

      try {
        const imageBase64 = await imageUriToBase64(image);
        const response = await generatePetImage(imageBase64, text, isPro);

        if (response.success && response.imageBase64) {
          setMessages((prev) => {
            const filtered = prev.filter((m) => !m.isGenerating);
            return [
              ...filtered,
              {
                id: (Date.now() + 2).toString(),
                role: 'assistant',
                content: t('generate.generated'),
                generatedImage: response.imageBase64,
                timestamp: new Date(),
              },
            ];
          });
        } else {
          throw new Error(response.error || t('generate.generateFailed'));
        }
      } catch (error: any) {
        setMessages((prev) => {
          const filtered = prev.filter((m) => !m.isGenerating);
          return [
            ...filtered,
            {
              id: (Date.now() + 2).toString(),
              role: 'assistant',
              content: error.message || t('generate.generateFailedRetry'),
              timestamp: new Date(),
            },
          ];
        });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // 情况二：用户只发送了图片（没有文字）→ 询问风格
    if (image && !text) {
      setUploadedPetImage(image);
      // 预先转换 base64
      try {
        const base64 = await imageUriToBase64(image);
        setUploadedPetImageBase64(base64);
      } catch (err) {
        console.log('图片转换失败:', err);
      }
      setIsLoading(true);

      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: t('generate.askStyle'),
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 1000);
      return;
    }

    // 情况三：用户发送了文字，且之前已经上传过图片 → 开始生成
    if (text && uploadedPetImageBase64) {
      // Pro 用户直接生成
      if (isPro) {
        // 继续生成流程
      } else if (generateCount > 0) {
        useGenerate(); // 扣减次数
        // 继续生成流程
      } else {
        // 没有次数，存储待生成信息并弹窗
        setPendingGenerate({ imageBase64: uploadedPetImageBase64, text });
        setShowLimitModal(true);
        return;
      }

      setIsLoading(true);

      const generatingMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: t('generate.generating'),
        isGenerating: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, generatingMessage]);

      try {
        const response = await generatePetImage(uploadedPetImageBase64, text, isPro);

        if (response.success && response.imageBase64) {
          setMessages((prev) => {
            const filtered = prev.filter((m) => !m.isGenerating);
            return [
              ...filtered,
              {
                id: (Date.now() + 2).toString(),
                role: 'assistant',
                content: t('generate.generated'),
                generatedImage: response.imageBase64,
                timestamp: new Date(),
              },
            ];
          });
        } else {
          throw new Error(response.error || t('generate.generateFailed'));
        }

        setUploadedPetImage(null);
        setUploadedPetImageBase64(null);
      } catch (error: any) {
        setMessages((prev) => {
          const filtered = prev.filter((m) => !m.isGenerating);
          return [
            ...filtered,
            {
              id: (Date.now() + 2).toString(),
              role: 'assistant',
              content: error.message || t('generate.generateFailedRetry'),
              timestamp: new Date(),
            },
          ];
        });
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // 情况四：用户只发送了文字，但没有上传过图片 → 提示先上传图片
    if (text && !image && !uploadedPetImage) {
      setIsLoading(true);
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: t('generate.uploadFirst'),
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        setIsLoading(false);
      }, 500);
    }
  };

  const handleClearChat = () => {
    Alert.alert(
      t('generate.clearConfirmTitle'),
      t('generate.clearConfirmMsg'),
      [
        { text: t('generate.cancel'), style: 'cancel' },
        {
          text: t('generate.confirmClear'),
          style: 'destructive',
          onPress: () => {
            setMessages([getWelcomeMessage()]);
            setUploadedPetImage(null);
            setUploadedPetImageBase64(null);
          },
        },
      ]
    );
  };

  const handleWatchAd = async () => {
    // watchAdForGenerate 返回 void，不需要检查返回值
    // 此回调只有在广告成功播放后才会被调用
    watchAdForGenerate();

    if (!pendingGenerate) return;

    // 检查是否已经看够3个广告（generateCount > 0）
    const state = useUserStore.getState();
    if (state.generateCount > 0) {
      useGenerate(); // 扣减次数
      setShowLimitModal(false);

      // 重新触发生成
      const { imageBase64, text } = pendingGenerate;
      setPendingGenerate(null);

      setIsLoading(true);
      const generatingMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: t('generate.generating'),
        isGenerating: true,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, generatingMessage]);

      try {
        const response = await generatePetImage(imageBase64, text, isPro);

        if (response.success && response.imageBase64) {
          setMessages((prev) => {
            const filtered = prev.filter((m) => !m.isGenerating);
            return [
              ...filtered,
              {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: t('generate.generated'),
                generatedImage: response.imageBase64,
                timestamp: new Date(),
              },
            ];
          });
        } else {
          throw new Error(response.error || t('generate.generateFailed'));
        }
        setUploadedPetImage(null);
        setUploadedPetImageBase64(null);
      } catch (error: any) {
        setMessages((prev) => {
          const filtered = prev.filter((m) => !m.isGenerating);
          return [
            ...filtered,
            {
              id: (Date.now() + 1).toString(),
              role: 'assistant',
              content: error.message || t('generate.generateFailedRetry'),
              timestamp: new Date(),
            },
          ];
        });
      } finally {
        setIsLoading(false);
      }
    }
    // 如果还没看够3个广告，modal 会继续显示，用户可以继续看广告
  };

  const GeneratedImageItem = ({ imageBase64 }: { imageBase64: string }) => {
    const [imageSize, setImageSize] = useState({ width: 200, height: 200 });
    const maxWidth = Dimensions.get('window').width - 48 - 48;
    const imageUri = base64ToDataUri(imageBase64);

    useEffect(() => {
      Image.getSize(
        imageUri,
        (w, h) => {
          const ratio = h / w;
          const displayWidth = Math.min(maxWidth, w);
          setImageSize({
            width: displayWidth,
            height: displayWidth * ratio,
          });
        },
        () => {
          // 获取尺寸失败，使用默认尺寸
          setImageSize({ width: maxWidth, height: maxWidth });
        }
      );
    }, [imageBase64]);

    return (
      <TouchableOpacity
        style={styles.generatedImageContainer}
        onPress={() => setPreviewImage(imageBase64)}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: imageUri }}
          style={[styles.generatedImage, { width: imageSize.width, height: imageSize.height }]}
          resizeMode="contain"
        />
        <Text style={styles.tapHint}>{t('generate.tapToView')}</Text>
      </TouchableOpacity>
    );
  };

  const renderMessage = ({ item }: { item: Message }) => {
    if (item.generatedImage) {
      return <GeneratedImageItem imageBase64={item.generatedImage} />;
    }
    return (
      <ChatBubble
        role={item.role}
        content={item.content}
        image={item.image}
        isLoading={item.isGenerating}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionTitle}>{t('generate.cases')}</Text>
        {!isPro && (
          <Text style={styles.remainingCount}>
            {t('generate.remaining', { count: generateCount })}
          </Text>
        )}
      </View>
      <CaseCarousel />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          onContentSizeChange={scrollToBottom}
          ListFooterComponent={
            isLoading && !messages.some((m) => m.isGenerating) ? (
              <ChatBubble role="assistant" content="" isLoading />
            ) : null
          }
        />

        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.clearButton} onPress={handleClearChat}>
            <Text style={styles.clearButtonText}>{t('generate.clearChat')}</Text>
          </TouchableOpacity>

          <ChatInput onSend={handleSend} disabled={isLoading} />

          <Text style={styles.disclaimer}>{t('generate.aiDisclaimer')}</Text>
        </View>
      </KeyboardAvoidingView>

      <ImagePreviewModal
        visible={previewImage !== null}
        imageSource={previewImage}
        onClose={() => setPreviewImage(null)}
      />

      <UsageLimitModal
        visible={showLimitModal}
        featureType="generate"
        generateAdProgress={generateAdWatchCount}
        onWatchAdComplete={handleWatchAd}
        onClose={() => {
          setShowLimitModal(false);
          setPendingGenerate(null);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  keyboardView: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
    paddingTop: 16,
    paddingHorizontal: 24,
  },
  remainingCount: {
    fontSize: 12,
    color: '#999999',
    paddingTop: 16,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingBottom: 16,
  },
  generatedImageContainer: {
    paddingHorizontal: 24,
    paddingVertical: 6,
    alignItems: 'flex-start',
  },
  generatedImage: {
    borderRadius: 12,
  },
  tapHint: {
    fontSize: 12,
    color: '#999999',
    marginTop: 6,
  },
  bottomContainer: {
    paddingBottom: 4,
  },
  clearButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0F0F0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 24,
    marginBottom: 12,
  },
  clearButtonText: {
    fontSize: 14,
    color: '#666666',
  },
  disclaimer: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 2,
  },
});
