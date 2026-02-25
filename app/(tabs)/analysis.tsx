import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../constants/Colors';
import { ChatBubble } from '../../components/ChatBubble';
import { ChatInput } from '../../components/ChatInput';
import { UsageLimitModal } from '../../components/UsageLimitModal';
import { askPetQuestion } from '../../services/gemini';
import { useUserStore } from '../../stores/userStore';
import { imageUriToBase64 } from '../../utils/image';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  imageBase64?: string;
  timestamp: Date;
}

export default function AnalysisScreen() {
  const { t } = useTranslation();

  const createWelcomeMessage = (): Message => ({
    id: 'welcome',
    role: 'assistant',
    content: t('analysis.welcome'),
    timestamp: new Date(),
  });

  const [messages, setMessages] = useState<Message[]>([createWelcomeMessage()]);
  const [isLoading, setIsLoading] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<{ text: string; image?: string } | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const { useChat, watchAdForChat, isPro, chatCount } = useUserStore();

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

    // Pro 用户直接发送
    if (isPro) {
      await sendMessage(text, image);
      return;
    }

    // 检查使用次数
    if (chatCount > 0) {
      useChat(); // 扣减次数
      await sendMessage(text, image);
    } else {
      // 没有次数，存储待发送消息并弹窗
      setPendingMessage({ text, image });
      setShowLimitModal(true);
    }
  };

  const sendMessage = async (text: string, image?: string) => {
    // 添加用户消息
    let imageBase64: string | undefined;
    if (image) {
      try {
        imageBase64 = await imageUriToBase64(image);
      } catch (err) {
        console.log('图片转换失败:', err);
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text || '(图片)',
      image,
      imageBase64,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // 构建历史消息（转换为 API 格式）
      const allMessages = [...messages.filter(m => m.id !== 'welcome'), userMessage];
      const chatHistory = allMessages.map(m => ({
        role: m.role === 'user' ? 'user' as const : 'model' as const,
        text: m.content,
        image: m.imageBase64,
      }));

      // 获取 AI 回复
      const response = await askPetQuestion(chatHistory);

      // 添加 AI 消息
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.success ? (response.result || '抱歉，我无法回答这个问题。') : (response.error || '请求失败'),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '抱歉，出现了一些问题，请稍后再试。',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWatchAdSuccess = () => {
    watchAdForChat(); // 看广告获得次数
    setShowLimitModal(false);
    // 看完广告后，如果有待发送的消息，自动发送
    if (pendingMessage) {
      useChat(); // 扣减次数
      sendMessage(pendingMessage.text, pendingMessage.image);
      setPendingMessage(null);
    }
  };

  const handleClearChat = () => {
    Alert.alert(
      t('analysis.clearConfirmTitle'),
      t('analysis.clearConfirmMsg'),
      [
        { text: t('analysis.cancel'), style: 'cancel' },
        {
          text: t('analysis.confirmClear'),
          style: 'destructive',
          onPress: () => setMessages([createWelcomeMessage()]),
        },
      ]
    );
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <ChatBubble role={item.role} content={item.content} image={item.image} />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{t('analysis.title')}</Text>
          {!isPro && (
            <Text style={styles.remainingCount}>{t('analysis.remaining', { count: chatCount })}</Text>
          )}
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messageList}
          contentContainerStyle={styles.messageListContent}
          ListFooterComponent={
            isLoading ? <ChatBubble role="assistant" content="" isLoading /> : null
          }
        />

        <View style={styles.bottomContainer}>
          <TouchableOpacity style={styles.clearButton} onPress={handleClearChat}>
            <Text style={styles.clearButtonText}>{t('analysis.clearChat')}</Text>
          </TouchableOpacity>

          <ChatInput onSend={handleSend} disabled={isLoading} />

          <Text style={styles.disclaimer}>{t('analysis.aiDisclaimer')}</Text>
        </View>
      </KeyboardAvoidingView>

      <UsageLimitModal
        visible={showLimitModal}
        onClose={() => {
          setShowLimitModal(false);
          setPendingMessage(null);
        }}
        featureType="chat"
        onWatchAdComplete={handleWatchAdSuccess}
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
  header: {
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 0,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  remainingCount: {
    fontSize: 12,
    color: Colors.primary,
    marginTop: 4,
  },
  messageList: {
    flex: 1,
  },
  messageListContent: {
    paddingVertical: 16,
  },
  bottomContainer: {
    paddingBottom: 8,
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
    marginTop: 8,
    marginBottom: 4,
  },
});
