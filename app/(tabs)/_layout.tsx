import { Tabs } from 'expo-router';
import { Home } from 'lucide-react-native';
import { Image, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Colors } from '../../constants/Colors';

export default function TabLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopColor: Colors.border,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="breed"
        options={{
          title: t('tabs.breed'),
          tabBarIcon: ({ color, focused }) => (
            <Image
              source={require('../../assets/icons/底部 bar-品种识别.png')}
              style={[styles.icon, { tintColor: color }]}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="analysis"
        options={{
          title: t('tabs.analysis'),
          tabBarIcon: ({ color, focused }) => (
            <Image
              source={require('../../assets/icons/底部 bar-疑难杂症.png')}
              style={[styles.icon, { tintColor: color }]}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="generate"
        options={{
          title: t('tabs.generate'),
          tabBarIcon: ({ color, focused }) => (
            <Image
              source={require('../../assets/icons/底部 bar-宠物生图.png')}
              style={[styles.icon, { tintColor: color }]}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 24,
    height: 24,
    resizeMode: 'contain',
  },
});
