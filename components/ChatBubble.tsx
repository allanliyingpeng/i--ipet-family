import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, TouchableOpacity, Alert } from 'react-native';
import { Copy } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import Markdown from 'react-native-markdown-display';
import { useTranslation } from 'react-i18next';
import { Colors } from '../constants/Colors';

interface ChatBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  isLoading?: boolean;
}

export function ChatBubble({ role, content, image, isLoading }: ChatBubbleProps) {
  const isUser = role === 'user';
  const { t } = useTranslation();

  const handleCopy = async () => {
    if (content) {
      await Clipboard.setStringAsync(content);
      Alert.alert('', t('common.copied'));
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.assistantContainer]}>
        <View style={[styles.bubble, styles.assistantBubble]}>
          <TypingIndicator />
        </View>
      </View>
    );
  }

  // AI 回复使用 Markdown 渲染，用户消息使用普通 Text
  const renderContent = () => {
    if (isUser) {
      return (
        <Text style={[styles.text, styles.userText]}>
          {content}
        </Text>
      );
    }
    return (
      <Markdown style={markdownStyles}>
        {content}
      </Markdown>
    );
  };

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        {image && (
          <Image source={{ uri: image }} style={styles.image} resizeMode="cover" />
        )}
        {renderContent()}
      </View>
      {/* 有文字内容时显示复制按钮 */}
      {content && (
        <TouchableOpacity style={styles.copyButton} onPress={handleCopy} activeOpacity={0.6}>
          <Copy size={14} color="#999999" />
          <Text style={styles.copyText}>{t('common.copy')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

function TypingIndicator() {
  const dot1Opacity = useRef(new Animated.Value(0.3)).current;
  const dot2Opacity = useRef(new Animated.Value(0.3)).current;
  const dot3Opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animateDots = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dot1Opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot1Opacity, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          Animated.timing(dot2Opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot2Opacity, { toValue: 0.3, duration: 300, useNativeDriver: true }),
          Animated.timing(dot3Opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(dot3Opacity, { toValue: 0.3, duration: 300, useNativeDriver: true }),
        ])
      ).start();
    };
    animateDots();
  }, []);

  return (
    <View style={styles.typingContainer}>
      <Animated.View style={[styles.dot, { opacity: dot1Opacity }]} />
      <Animated.View style={[styles.dot, { opacity: dot2Opacity }]} />
      <Animated.View style={[styles.dot, { opacity: dot3Opacity }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    paddingHorizontal: 24,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  assistantContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#333333',
  },
  assistantBubble: {
    backgroundColor: '#F5F5F5',
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: Colors.white,
  },
  assistantText: {
    color: Colors.text,
  },
  image: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginBottom: 8,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
    paddingHorizontal: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#999999',
    marginHorizontal: 2,
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  copyText: {
    fontSize: 12,
    color: '#999999',
    marginLeft: 4,
  },
});

// Markdown 样式
const markdownStyles = StyleSheet.create({
  body: {
    fontSize: 16,
    lineHeight: 22,
    color: Colors.text,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 0,
  },
  strong: {
    fontWeight: '700',
  },
  em: {
    fontStyle: 'italic',
  },
  bullet_list: {
    marginVertical: 4,
  },
  ordered_list: {
    marginVertical: 4,
  },
  list_item: {
    marginVertical: 2,
  },
  code_inline: {
    backgroundColor: '#E8E8E8',
    paddingHorizontal: 4,
    borderRadius: 4,
    fontFamily: 'monospace',
  },
});
