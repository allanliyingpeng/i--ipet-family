import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Menu, ChevronRight, X, MessageCircle } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../constants/Colors';
import { DrawerMenu } from '../../components/DrawerMenu';
import { getHomeArticles, getAllArticles, Article } from '../knowledge/knowledge-data';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48;

const knowledgeArticles = getHomeArticles();
const allArticles = getAllArticles();

export default function HomeScreen() {
  const { t } = useTranslation();
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  // 搜索结果
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    return allArticles.filter((article) => {
      const title = t(article.titleKey).toLowerCase();
      const content = t(article.contentKey).toLowerCase();
      return title.includes(query) || content.includes(query);
    });
  }, [searchQuery, t]);

  const handleSearchItemPress = (article: Article) => {
    setSearchVisible(false);
    setSearchQuery('');
    router.push(`/knowledge/${article.id}`);
  };

  const handleAskAI = () => {
    setSearchVisible(false);
    setSearchQuery('');
    router.push('/analysis');
  };

  // 功能介绍轮播数据
  const featureCards = [
    {
      id: 1,
      title: t('home.featureCard1Title'),
      description: t('home.featureCard1Desc'),
      tag: t('home.featureCard1Tag'),
      image: require('../../assets/images/home-feature-breed.jpg'),
      overlayOpacity: 0.2,
      route: '/breed',
    },
    {
      id: 2,
      title: t('home.featureCard2Title'),
      description: t('home.featureCard2Desc'),
      tag: t('home.featureCard2Tag'),
      image: require('../../assets/images/home-feature-analysis.jpg'),
      overlayOpacity: 0.3,
      route: '/analysis',
    },
    {
      id: 3,
      title: t('home.featureCard3Title'),
      description: t('home.featureCard3Desc'),
      tag: t('home.featureCard3Tag'),
      image: require('../../assets/images/home-feature-generate.png'),
      overlayOpacity: 0.4,
      route: '/generate',
    },
  ];

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / (CARD_WIDTH + 16));
    setActiveCardIndex(index);
  };

  const renderFeatureCard = ({ item }: { item: (typeof featureCards)[0] }) => (
    <TouchableOpacity
      style={styles.featureCard}
      activeOpacity={0.9}
      onPress={() => router.push(item.route as any)}
    >
      <Image source={item.image} style={styles.featureCardImage} />
      <View style={[styles.featureCardOverlay, { opacity: item.overlayOpacity }]} />
      <View style={styles.featureCardContent}>
        <Text style={styles.featureCardTitle}>{item.title}</Text>
        <Text style={styles.featureCardDescription}>{item.description}</Text>
        <View style={styles.featureCardTag}>
          <Text style={styles.featureCardTagText}>{item.tag}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderKnowledgeCard = ({ item }: { item: (typeof knowledgeArticles)[0] }) => (
    <TouchableOpacity
      style={styles.knowledgeCard}
      activeOpacity={0.8}
      onPress={() => router.push(`/knowledge/${item.id}`)}
    >
      <Image source={item.image} style={styles.knowledgeCardImage} />
      <View style={styles.knowledgeCardOverlay} />
      <View style={styles.knowledgeCardContent}>
        <Text style={styles.knowledgeCardTitle}>
          {item.emoji} {t(item.titleKey)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // 搜索结果项
  const renderSearchItem = (article: Article) => {
    const title = t(article.titleKey);
    const content = t(article.contentKey);
    const summary = content.length > 60 ? content.substring(0, 60) + '...' : content;

    return (
      <TouchableOpacity
        key={article.id}
        style={styles.searchResultItem}
        onPress={() => handleSearchItemPress(article)}
      >
        <Text style={styles.searchResultEmoji}>{article.emoji}</Text>
        <View style={styles.searchResultText}>
          <Text style={styles.searchResultTitle} numberOfLines={1}>{title}</Text>
          <Text style={styles.searchResultSummary} numberOfLines={2}>{summary}</Text>
        </View>
        <ChevronRight size={20} color={Colors.textSecondary} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 顶部搜索栏 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.searchBar}
          activeOpacity={0.7}
          onPress={() => setSearchVisible(true)}
        >
          <Search size={20} color={Colors.textSecondary} />
          <Text style={styles.searchPlaceholder}>{t('home.searchPlaceholder')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setDrawerVisible(true)}
        >
          <Menu size={24} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 功能介绍区域 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('home.featureIntro')}</Text>
          <FlatList
            ref={flatListRef}
            data={featureCards}
            renderItem={renderFeatureCard}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            snapToInterval={CARD_WIDTH + 16}
            decelerationRate="fast"
            contentContainerStyle={styles.featureCardsContainer}
          />
          {/* 指示点 */}
          <View style={styles.pagination}>
            {featureCards.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.paginationDot,
                  index === activeCardIndex && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* 宠物百科区域 */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => router.push('/knowledge')}
          >
            <Text style={styles.sectionTitleInline}>{t('home.petKnowledge')}</Text>
            <ChevronRight size={20} color={Colors.textSecondary} />
          </TouchableOpacity>
          <FlatList
            data={knowledgeArticles}
            renderItem={renderKnowledgeCard}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.knowledgeCardsContainer}
          />
        </View>
      </ScrollView>

      <DrawerMenu visible={drawerVisible} onClose={() => setDrawerVisible(false)} />

      {/* 搜索弹窗 */}
      <Modal
        visible={searchVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setSearchVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.searchModal}
        >
          <SafeAreaView style={styles.searchModalContent}>
            {/* 搜索头部 */}
            <View style={styles.searchHeader}>
              <View style={styles.searchInputContainer}>
                <Search size={20} color={Colors.textSecondary} />
                <TextInput
                  style={styles.searchInput}
                  placeholder={t('home.searchPlaceholder')}
                  placeholderTextColor={Colors.textSecondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus
                  returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <X size={18} color={Colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setSearchVisible(false);
                  setSearchQuery('');
                }}
              >
                <Text style={styles.cancelText}>{t('home.cancel')}</Text>
              </TouchableOpacity>
            </View>

            {/* 搜索结果 */}
            <ScrollView style={styles.searchResults} keyboardShouldPersistTaps="handled">
              {searchQuery.trim().length > 0 && (
                <>
                  {searchResults.length > 0 ? (
                    <>
                      <Text style={styles.searchResultsTitle}>{t('home.searchResults')}</Text>
                      {searchResults.map(renderSearchItem)}
                    </>
                  ) : (
                    <View style={styles.noResults}>
                      <Text style={styles.noResultsText}>{t('home.noResults')}</Text>
                      <TouchableOpacity style={styles.askAICard} onPress={handleAskAI}>
                        <MessageCircle size={24} color={Colors.primary} />
                        <Text style={styles.askAIText}>{t('home.askAI')}</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
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
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchPlaceholder: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  menuButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingTop: 36,
  },
  section: {
    marginBottom: 36,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  sectionTitleInline: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  featureCardsContainer: {
    paddingHorizontal: 24,
    gap: 16,
  },
  featureCard: {
    width: CARD_WIDTH,
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
  },
  featureCardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  featureCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  featureCardContent: {
    ...StyleSheet.absoluteFillObject,
    padding: 16,
    justifyContent: 'flex-end',
  },
  featureCardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
  },
  featureCardDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 20,
    marginBottom: 12,
  },
  featureCardTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  featureCardTagText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: '500',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D9D9D9',
  },
  paginationDotActive: {
    backgroundColor: Colors.text,
  },
  knowledgeCardsContainer: {
    paddingHorizontal: 24,
    gap: 12,
  },
  knowledgeCard: {
    width: 160,
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  knowledgeCardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  knowledgeCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  knowledgeCardContent: {
    ...StyleSheet.absoluteFillObject,
    padding: 12,
    justifyContent: 'flex-end',
  },
  knowledgeCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    lineHeight: 20,
  },
  // 搜索弹窗样式
  searchModal: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchModalContent: {
    flex: 1,
  },
  searchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: Colors.text,
    padding: 0,
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  cancelText: {
    fontSize: 15,
    color: Colors.primary,
  },
  searchResults: {
    flex: 1,
    paddingHorizontal: 16,
  },
  searchResultsTitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 16,
    marginBottom: 12,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 12,
  },
  searchResultEmoji: {
    fontSize: 24,
  },
  searchResultText: {
    flex: 1,
  },
  searchResultTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  searchResultSummary: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  noResults: {
    alignItems: 'center',
    paddingTop: 60,
  },
  noResultsText: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  askAICard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 10,
  },
  askAIText: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.primary,
  },
});
