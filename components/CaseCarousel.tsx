import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48;
const CARD_HEIGHT = 220;

interface CaseItem {
  id: string;
  image: any;
  descriptionKey: string;
}

const CASES: CaseItem[] = [
  {
    id: '1',
    image: require('../assets/images/case-cyberpunk.png'),
    descriptionKey: 'cases.case1',
  },
  {
    id: '2',
    image: require('../assets/images/case-oil.png'),
    descriptionKey: 'cases.case2',
  },
  {
    id: '3',
    image: require('../assets/images/case-cozy.png'),
    descriptionKey: 'cases.case3',
  },
];

export function CaseCarousel() {
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / SCREEN_WIDTH);
    setActiveIndex(index);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {CASES.map((item) => (
          <View key={item.id} style={styles.cardWrapper}>
            <View style={styles.card}>
              <Image source={item.image} style={styles.image} resizeMode="cover" />
              <LinearGradient
                colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.7)']}
                style={styles.gradient}
              >
                <Text style={styles.description} numberOfLines={3}>
                  {t(item.descriptionKey)}
                </Text>
              </LinearGradient>
            </View>
          </View>
        ))}
      </ScrollView>
      <View style={styles.pagination}>
        {CASES.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, index === activeIndex && styles.activeDot]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  cardWrapper: {
    width: SCREEN_WIDTH,
    paddingHorizontal: 24,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F5F5F5',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingTop: 40,
  },
  description: {
    color: '#FFFFFF',
    fontSize: 10,
    lineHeight: 14,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D9D9D9',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#333333',
  },
});
