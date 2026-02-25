import { ImageSourcePropType } from 'react-native';

export interface Article {
  id: string;
  emoji: string;
  titleKey: string;
  image: ImageSourcePropType;
  contentKey: string;
}

// 喵星人篇 - 15篇文章
export const catArticles: Article[] = [
  {
    id: 'cat-1',
    emoji: '🚀',
    titleKey: 'knowledge.cat1.title',
    image: require('../../assets/images/猫星人-深夜限定.jpg'),
    contentKey: 'knowledge.cat1.content',
  },
  {
    id: 'cat-2',
    emoji: '🏷️',
    titleKey: 'knowledge.cat2.title',
    image: require('../../assets/images/猫星人 -进门就被蹭.jpg'),
    contentKey: 'knowledge.cat2.content',
  },
  {
    id: 'cat-3',
    emoji: '👨‍🍳',
    titleKey: 'knowledge.cat3.title',
    image: require('../../assets/images/喵星人-专业揉面.jpg'),
    contentKey: 'knowledge.cat3.content',
  },
  {
    id: 'cat-4',
    emoji: '👁️',
    titleKey: 'knowledge.cat4.title',
    image: require('../../assets/images/喵星人-眼神拉丝.jpg'),
    contentKey: 'knowledge.cat4.content',
  },
  {
    id: 'cat-5',
    emoji: '🎁',
    titleKey: 'knowledge.cat5.title',
    image: require('../../assets/images/喵星人-惊喜惊吓.jpg'),
    contentKey: 'knowledge.cat5.content',
  },
  {
    id: 'cat-6',
    emoji: '🥛',
    titleKey: 'knowledge.cat6.title',
    image: require('../../assets/images/喵星人-桌边杀手.png'),
    contentKey: 'knowledge.cat6.content',
  },
  {
    id: 'cat-7',
    emoji: '📦',
    titleKey: 'knowledge.cat7.title',
    image: require('../../assets/images/喵星人-纸箱情节.png'),
    contentKey: 'knowledge.cat7.content',
  },
  {
    id: 'cat-8',
    emoji: '🐦',
    titleKey: 'knowledge.cat8.title',
    image: require('../../assets/images/喵星人-碎碎念模式.png'),
    contentKey: 'knowledge.cat8.content',
  },
  {
    id: 'cat-9',
    emoji: '🍑',
    titleKey: 'knowledge.cat9.title',
    image: require('../../assets/images/猫星人-屁股问候.jpg'),
    contentKey: 'knowledge.cat9.content',
  },
  {
    id: 'cat-10',
    emoji: '🚽',
    titleKey: 'knowledge.cat10.title',
    image: require('../../assets/images/喵星人-便后狂奔.png'),
    contentKey: 'knowledge.cat10.content',
  },
  {
    id: 'cat-11',
    emoji: '💧',
    titleKey: 'knowledge.cat11.title',
    image: require('../../assets/images/喵星人-水龙头狂热.png'),
    contentKey: 'knowledge.cat11.content',
  },
  {
    id: 'cat-12',
    emoji: '⌨️',
    titleKey: 'knowledge.cat12.title',
    image: require('../../assets/images/喵星人-职场干扰.png'),
    contentKey: 'knowledge.cat12.content',
  },
  {
    id: 'cat-13',
    emoji: '👃',
    titleKey: 'knowledge.cat13.title',
    image: require('../../assets/images/喵星人-口腔检查.png'),
    contentKey: 'knowledge.cat13.content',
  },
  {
    id: 'cat-14',
    emoji: '🌲',
    titleKey: 'knowledge.cat14.title',
    image: require('../../assets/images/喵星人-登高望远.png'),
    contentKey: 'knowledge.cat14.content',
  },
  {
    id: 'cat-15',
    emoji: '🥩',
    titleKey: 'knowledge.cat15.title',
    image: require('../../assets/images/喵星人-露肚皮诱惑.png'),
    contentKey: 'knowledge.cat15.content',
  },
];

// 汪星人篇 - 15篇文章
export const dogArticles: Article[] = [
  {
    id: 'dog-1',
    emoji: '🔄',
    titleKey: 'knowledge.dog1.title',
    image: require('../../assets/images/汪星人-睡前仪式.png'),
    contentKey: 'knowledge.dog1.content',
  },
  {
    id: 'dog-2',
    emoji: '🐕',
    titleKey: 'knowledge.dog2.title',
    image: require('../../assets/images/汪星人-疯狂摇摆.png'),
    contentKey: 'knowledge.dog2.content',
  },
  {
    id: 'dog-3',
    emoji: '🥬',
    titleKey: 'knowledge.dog3.title',
    image: require('../../assets/images/汪星人-草地自助餐.png'),
    contentKey: 'knowledge.dog3.content',
  },
  {
    id: 'dog-4',
    emoji: '🕵️‍♂️',
    titleKey: 'knowledge.dog4.title',
    image: require('../../assets/images/汪星人-社交礼仪.png'),
    contentKey: 'knowledge.dog4.content',
  },
  {
    id: 'dog-5',
    emoji: '👟',
    titleKey: 'knowledge.dog5.title',
    image: require('../../assets/images/汪星人-异味收集者.png'),
    contentKey: 'knowledge.dog5.content',
  },
  {
    id: 'dog-6',
    emoji: '🦴',
    titleKey: 'knowledge.dog6.title',
    image: require('../../assets/images/汪星人-疯狂挖掘.png'),
    contentKey: 'knowledge.dog6.content',
  },
  {
    id: 'dog-7',
    emoji: '🐶',
    titleKey: 'knowledge.dog7.title',
    image: require('../../assets/images/汪星人-贴贴请求.png'),
    contentKey: 'knowledge.dog7.content',
  },
  {
    id: 'dog-8',
    emoji: '💩',
    titleKey: 'knowledge.dog8.title',
    image: require('../../assets/images/汪星人-倒车入库.png'),
    contentKey: 'knowledge.dog8.content',
  },
  {
    id: 'dog-9',
    emoji: '🚽',
    titleKey: 'knowledge.dog9.title',
    image: require('../../assets/images/汪星人-护法模式.png'),
    contentKey: 'knowledge.dog9.content',
  },
  {
    id: 'dog-10',
    emoji: '🥺',
    titleKey: 'knowledge.dog10.title',
    image: require('../../assets/images/汪星人-必杀技.png'),
    contentKey: 'knowledge.dog10.content',
  },
  {
    id: 'dog-11',
    emoji: '🔄',
    titleKey: 'knowledge.dog11.title',
    image: require('../../assets/images/汪星人-尾巴追逐战.png'),
    contentKey: 'knowledge.dog11.content',
  },
  {
    id: 'dog-12',
    emoji: '🌙',
    titleKey: 'knowledge.dog12.title',
    image: require('../../assets/images/汪星人-梦中赛马.png'),
    contentKey: 'knowledge.dog12.content',
  },
  {
    id: 'dog-13',
    emoji: '🎾',
    titleKey: 'knowledge.dog13.title',
    image: require('../../assets/images/汪星人-战利品回归.png'),
    contentKey: 'knowledge.dog13.content',
  },
  {
    id: 'dog-14',
    emoji: '🚿',
    titleKey: 'knowledge.dog14.title',
    image: require('../../assets/images/汪星人-甩水炸弹.png'),
    contentKey: 'knowledge.dog14.content',
  },
  {
    id: 'dog-15',
    emoji: '🐾',
    titleKey: 'knowledge.dog15.title',
    image: require('../../assets/images/汪星人-歪头杀.png'),
    contentKey: 'knowledge.dog15.content',
  },
];

// 获取所有文章
export const getAllArticles = () => [...catArticles, ...dogArticles];

// 获取首页展示的文章（各取前3篇，共6篇）
export const getHomeArticles = () => [...catArticles.slice(0, 3), ...dogArticles.slice(0, 3)];
