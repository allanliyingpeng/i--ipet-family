import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import * as SplashScreen from 'expo-splash-screen';
import { useUserStore } from '../stores/userStore';
import '../utils/i18n'; // 初始化 i18n

// 防止启动画面自动隐藏
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { t } = useTranslation();
  const checkAndResetDaily = useUserStore((state) => state.checkAndResetDaily);
  const checkProExpiration = useUserStore((state) => state.checkProExpiration);

  // App 启动时检查并重置每日次数，以及检查 Pro 是否过期
  useEffect(() => {
    checkAndResetDaily();
    checkProExpiration();
  }, []);

  // 控制启动画面显示时间
  useEffect(() => {
    const timer = setTimeout(async () => {
      await SplashScreen.hideAsync();
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="knowledge/index" options={{ headerShown: false }} />
          <Stack.Screen name="knowledge/[id]" options={{ headerShown: false }} />
          <Stack.Screen
            name="subscription"
            options={{
              headerShown: true,
              title: t('subscription.title'),
              headerBackTitle: t('subscription.backTitle'),
            }}
          />
        </Stack>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
