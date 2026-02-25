import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import zh from '../locales/zh.json';
import en from '../locales/en.json';

// 获取系统语言，中文显示中文，其他显示英文
const getLanguage = () => {
  const locale = Localization.getLocales()[0]?.languageCode || 'en';
  return locale.startsWith('zh') ? 'zh' : 'en';
};

i18n.use(initReactI18next).init({
  resources: {
    zh: { translation: zh },
    en: { translation: en },
  },
  lng: getLanguage(),
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: 'v4',
});

export default i18n;
