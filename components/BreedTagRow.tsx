import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';

interface BreedTagRowProps {
  items: string[];
}

export function BreedTagRow({ items }: BreedTagRowProps) {
  const { t } = useTranslation();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {items.map((item, index) => (
        <View key={`${item}-${index}`} style={styles.tag}>
          <Text style={styles.tagText}>{t(`breeds.${item}`)}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  contentContainer: {
    paddingRight: 16,
  },
  tag: {
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#333333',
  },
});
