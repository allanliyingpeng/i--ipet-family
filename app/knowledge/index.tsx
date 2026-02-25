import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../constants/Colors';
import { catArticles, dogArticles, Article, getAllArticles } from './knowledge-data';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

export type ArticleType = Article;

export { getAllArticles };

export default function KnowledgeScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'cat' | 'dog'>('cat');

  const articles = activeTab === 'cat' ? catArticles : dogArticles;

  const renderCard = (item: ArticleType, index: number) => (
    <TouchableOpacity
      key={item.id}
      style={[styles.card, index % 2 === 0 ? styles.cardLeft : styles.cardRight]}
      onPress={() => router.push({ pathname: '/knowledge/[id]', params: { id: item.id } })}
      activeOpacity={0.9}
    >
      <Image source={item.image} style={styles.cardImage} />
      <View style={styles.cardOverlay} />
      <Text style={styles.cardTitle}>{t(item.titleKey)}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={Colors.text} />
          <Text style={styles.backText}>{t('knowledge.backToHome')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('knowledge.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'cat' && styles.activeTab]}
          onPress={() => setActiveTab('cat')}
        >
          <Text style={[styles.tabText, activeTab === 'cat' && styles.activeTabText]}>
            {t('knowledge.catTab')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'dog' && styles.activeTab]}
          onPress={() => setActiveTab('dog')}
        >
          <Text style={[styles.tabText, activeTab === 'dog' && styles.activeTabText]}>
            {t('knowledge.dogTab')}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.cardContainer}>
          {articles.map((item, index) => renderCard(item, index))}
        </View>
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
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: Colors.white,
  },
  tabText: {
    fontSize: 15,
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.text,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  cardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: cardWidth,
    height: cardWidth * 1.2,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
  },
  cardLeft: {
    marginRight: 8,
  },
  cardRight: {
    marginLeft: 8,
  },
  cardImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  cardTitle: {
    position: 'absolute',
    bottom: 16,
    left: 12,
    right: 12,
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
  },
});
