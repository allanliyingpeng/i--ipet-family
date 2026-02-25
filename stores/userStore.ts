import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 默认免费次数限制
export const DEFAULT_FREE_LIMITS = {
  recognize: 2,
  chat: 4,
  generate: 1,
};

// 看广告增加次数配置
export const AD_REWARDS = {
  recognize: { adsRequired: 1, reward: 1 },
  chat: { adsRequired: 1, reward: 4 },
  generate: { adsRequired: 3, reward: 1 },
};

// 优惠码配置
export const PROMO_CODES: Record<string, { type: 'pro_days' | 'generate_count'; value: number; description: string }> = {
  'WELCOME2026': { type: 'pro_days', value: 7, description: '7天Pro体验' },
  'IPET888': { type: 'pro_days', value: 30, description: '30天Pro' },
  'FREEGEN10': { type: 'generate_count', value: 10, description: '10次生图' },
};

export interface RedeemResult {
  success: boolean;
  message: string;
  reward?: string;
}

interface UserState {
  // 用户类型
  isPro: boolean;
  proExpiresAt: string | null; // Pro 到期时间 ISO 字符串

  // 已使用的优惠码
  usedPromoCodes: string[];

  // 今日剩余次数
  recognizeCount: number;
  chatCount: number;
  generateCount: number;

  // 今日已看广告获得的额外次数（用于显示）
  extraRecognizeFromAd: number;
  extraChatFromAd: number;
  extraGenerateFromAd: number;

  // 生图广告观看计数器（需要看3次才能+1次生图）
  generateAdWatchCount: number;

  // 上次重置日期（用于判断是否需要重置）
  lastResetDate: string;

  // Actions
  useRecognize: () => boolean;
  useChat: () => boolean;
  useGenerate: () => boolean;

  watchAdForRecognize: () => void;
  watchAdForChat: () => void;
  watchAdForGenerate: () => void;

  setPro: (isPro: boolean) => void;
  checkAndResetDaily: () => void;
  checkProExpiration: () => void;
  redeemPromoCode: (code: string) => RedeemResult;

  // 兼容旧版本的属性（用于 DrawerMenu）
  isSubscribed: boolean;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // 初始状态
      isPro: false,
      proExpiresAt: null,
      usedPromoCodes: [],
      recognizeCount: DEFAULT_FREE_LIMITS.recognize,
      chatCount: DEFAULT_FREE_LIMITS.chat,
      generateCount: DEFAULT_FREE_LIMITS.generate,
      extraRecognizeFromAd: 0,
      extraChatFromAd: 0,
      extraGenerateFromAd: 0,
      generateAdWatchCount: 0,
      lastResetDate: new Date().toDateString(),

      // 兼容旧版本
      get isSubscribed() {
        return get().isPro;
      },

      // 检查 Pro 是否过期
      checkProExpiration: () => {
        const state = get();
        if (state.isPro && state.proExpiresAt) {
          const expiresAt = new Date(state.proExpiresAt);
          if (new Date() > expiresAt) {
            set({ isPro: false, proExpiresAt: null });
          }
        }
      },

      // 检查并重置每日次数
      checkAndResetDaily: () => {
        const today = new Date().toDateString();
        const state = get();
        if (state.lastResetDate !== today) {
          set({
            recognizeCount: DEFAULT_FREE_LIMITS.recognize,
            chatCount: DEFAULT_FREE_LIMITS.chat,
            generateCount: DEFAULT_FREE_LIMITS.generate,
            extraRecognizeFromAd: 0,
            extraChatFromAd: 0,
            extraGenerateFromAd: 0,
            generateAdWatchCount: 0,
            lastResetDate: today,
          });
        }
      },

      // 兑换优惠码
      redeemPromoCode: (code: string): RedeemResult => {
        const upperCode = code.toUpperCase().trim();
        const state = get();

        // 检查优惠码是否存在
        const promoConfig = PROMO_CODES[upperCode];
        if (!promoConfig) {
          return { success: false, message: '优惠码无效' };
        }

        // 检查是否已使用过
        if (state.usedPromoCodes.includes(upperCode)) {
          return { success: false, message: '该优惠码已使用过' };
        }

        // 发放权益
        if (promoConfig.type === 'pro_days') {
          // Pro 天数可叠加
          let newExpiresAt: Date;
          if (state.isPro && state.proExpiresAt) {
            // 已有 Pro，在现有到期时间上叠加
            newExpiresAt = new Date(state.proExpiresAt);
            newExpiresAt.setDate(newExpiresAt.getDate() + promoConfig.value);
          } else {
            // 没有 Pro，从现在开始计算
            newExpiresAt = new Date();
            newExpiresAt.setDate(newExpiresAt.getDate() + promoConfig.value);
          }

          set({
            isPro: true,
            proExpiresAt: newExpiresAt.toISOString(),
            usedPromoCodes: [...state.usedPromoCodes, upperCode],
          });

          return {
            success: true,
            message: '兑换成功！',
            reward: promoConfig.description,
          };
        } else if (promoConfig.type === 'generate_count') {
          // 增加生图次数
          set({
            generateCount: state.generateCount + promoConfig.value,
            usedPromoCodes: [...state.usedPromoCodes, upperCode],
          });

          return {
            success: true,
            message: '兑换成功！',
            reward: promoConfig.description,
          };
        }

        return { success: false, message: '优惠码配置错误' };
      },

      // 使用品种识别
      useRecognize: () => {
        const state = get();
        if (state.isPro) return true;
        if (state.recognizeCount > 0) {
          set({ recognizeCount: state.recognizeCount - 1 });
          return true;
        }
        return false;
      },

      // 使用疑难分析
      useChat: () => {
        const state = get();
        if (state.isPro) return true;
        if (state.chatCount > 0) {
          set({ chatCount: state.chatCount - 1 });
          return true;
        }
        return false;
      },

      // 使用宠物生图
      useGenerate: () => {
        const state = get();
        if (state.isPro) return true;
        if (state.generateCount > 0) {
          set({ generateCount: state.generateCount - 1 });
          return true;
        }
        return false;
      },

      // 看广告增加品种识别次数
      watchAdForRecognize: () => {
        const state = get();
        set({
          recognizeCount: state.recognizeCount + 1,
          extraRecognizeFromAd: state.extraRecognizeFromAd + 1,
        });
      },

      // 看广告增加疑难分析次数（+4次）
      watchAdForChat: () => {
        const state = get();
        set({
          chatCount: state.chatCount + AD_REWARDS.chat.reward,
          extraChatFromAd: state.extraChatFromAd + AD_REWARDS.chat.reward,
        });
      },

      // 看广告增加宠物生图次数（需要看3次，且不能叠加超过每日限制）
      watchAdForGenerate: () => {
        const state = get();
        const newCount = state.generateAdWatchCount + 1;
        if (newCount >= AD_REWARDS.generate.adsRequired) {
          // 看满3次广告，恢复1次生图机会（不能超过每日限制）
          const newGenerateCount = Math.min(
            state.generateCount + 1,
            DEFAULT_FREE_LIMITS.generate
          );
          set({
            generateCount: newGenerateCount,
            extraGenerateFromAd: state.extraGenerateFromAd + 1,
            generateAdWatchCount: 0,
          });
        } else {
          set({ generateAdWatchCount: newCount });
        }
      },

      // 设置 Pro 状态
      setPro: (isPro: boolean) => set({ isPro }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      // 只持久化需要的字段
      partialize: (state) => ({
        isPro: state.isPro,
        proExpiresAt: state.proExpiresAt,
        usedPromoCodes: state.usedPromoCodes,
        recognizeCount: state.recognizeCount,
        chatCount: state.chatCount,
        generateCount: state.generateCount,
        extraRecognizeFromAd: state.extraRecognizeFromAd,
        extraChatFromAd: state.extraChatFromAd,
        extraGenerateFromAd: state.extraGenerateFromAd,
        generateAdWatchCount: state.generateAdWatchCount,
        lastResetDate: state.lastResetDate,
      }),
    }
  )
);

export default useUserStore;
