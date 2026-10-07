import { FBAccount, Lead, AutomationTask, SpintaxTemplate, FeedPostItem } from '../types';

// Pool of natural, authentic English female names for Facebook matrix marketing
export const FEMALE_NAMES_POOL = [
  'Emma Carter',
  'Sophia Miller',
  'Olivia Davis',
  'Ava Johnson',
  'Mia Wilson',
  'Emily Clark',
  'Chloe Anderson',
  'Grace Taylor',
  'Lily Robinson',
  'Hannah White',
  'Jessica Williams',
  'Sarah Jenkins',
  'Ashley Brown',
  'Amanda Jones',
  'Megan Smith',
  'Rachel Green',
  'Jennifer Lee',
  'Samantha Hall',
  'Lauren Wright',
  'Victoria King',
  'Natalie Scott',
  'Hailey Baker',
  'Zoe Adams',
  'Brooke Nelson',
  'Amber Mitchell'
];

// Real 10 Facebook Accounts with 1:1 Dedicated US Residential Proxies & Authentic Female Personas
export const INITIAL_ACCOUNTS: FBAccount[] = [
  {
    id: 'acc-real-1',
    name: 'Alicia Turner',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    status: 'warming',
    proxyIp: '168.158.153.172:12323:14a41cce49cf1:767daa7beb',
    proxyLocation: '🇬🇧 英国伦敦 (ISP住宅) / 🇺🇸 代理',
    browserProfileId: 'ads-profile-2025',
    dailyActionsCount: 3,
    dailyLimit: 25,
    cookieStatus: 'valid',
    healthScore: 99,
    lastActive: 'UID:61579759624561',
    warmingDays: 2,
    group: '养号A组',
    twoFaCode: '986089',
    twoFactorSecret: '7TSJQJ5WA7LI36AZBGYSX6LVATFYSIQF'
  },
  {
    id: 'acc-real-2',
    name: 'Linda Barrie',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    status: 'warming',
    proxyIp: '161.77.124.175:12323:14a41cce49cf1:767daa7beb',
    proxyLocation: '🇬🇧 英国伦敦 (ISP住宅) / 26好友',
    browserProfileId: 'ads-profile-2017',
    dailyActionsCount: 2,
    dailyLimit: 25,
    cookieStatus: 'valid',
    healthScore: 98,
    lastActive: 'UID:61579314527257',
    warmingDays: 2,
    group: '养号A组',
    twoFaCode: '837284',
    twoFactorSecret: 'FERS36UNKRL2MGAQ2NNWMLPUSTKRTLS0'
  },
  {
    id: 'acc-real-3',
    name: 'Denise Hawkins',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=120&auto=format&fit=crop&q=80',
    status: 'warming',
    proxyIp: '168.158.200.26:12323:14a41cce49cf1:767daa7beb',
    proxyLocation: '🇬🇧 英国伦敦 (ISP住宅) / 真实相册',
    browserProfileId: 'ads-profile-2033',
    dailyActionsCount: 4,
    dailyLimit: 25,
    cookieStatus: 'valid',
    healthScore: 99,
    lastActive: 'UID:61579080766710',
    warmingDays: 2,
    group: '养号A组',
    twoFaCode: '349182',
    twoFactorSecret: 'A4PZN6PZGJZV547FSLSNSCNQCGQVQOP'
  },
  {
    id: 'acc-real-4',
    name: 'Danielle Clive',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    status: 'warming',
    proxyIp: '217.67.69.111:12323:14a41cce49cf1:767daa7beb',
    proxyLocation: '🇬🇧 英国伦敦 (ISP住宅) / 66好友',
    browserProfileId: 'ads-profile-2041',
    dailyActionsCount: 3,
    dailyLimit: 25,
    cookieStatus: 'valid',
    healthScore: 97,
    lastActive: 'UID:61578798729746',
    warmingDays: 2,
    group: '养号A组',
    twoFaCode: '897986',
    twoFactorSecret: '7YQOVYPTZ6QVGGC2D5IUVHVRA4BS2BEP'
  },
  {
    id: 'acc-real-5',
    name: 'Joan Buckley',
    avatar: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=120&auto=format&fit=crop&q=80',
    status: 'warming',
    proxyIp: '168.158.101.198:12323:14a41cce49cf1:767daa7beb',
    proxyLocation: '🇬🇧 英国伦敦 (ISP住宅) / 64好友',
    browserProfileId: 'ads-profile-2055',
    dailyActionsCount: 1,
    dailyLimit: 25,
    cookieStatus: 'valid',
    healthScore: 99,
    lastActive: 'UID:61578672255717',
    warmingDays: 2,
    group: '养号A组',
    twoFaCode: '210356',
    twoFactorSecret: 'H6ZOU46E2G2AXYAM4XBY7QNWJHM5JWWW'
  },
  {
    id: 'acc-real-6',
    name: 'Emily Clark',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    status: 'warming',
    proxyIp: '168.158.96.22:12323:14a41cce49cf1:767daa7beb',
    proxyLocation: '🇺🇸 美国静态独享住宅 IP (需验私密)',
    browserProfileId: 'ads-profile-2062',
    dailyActionsCount: 2,
    dailyLimit: 25,
    cookieStatus: 'valid',
    healthScore: 98,
    lastActive: 'UID:61578964440233',
    warmingDays: 2,
    group: '养号A组',
    twoFaCode: '939254',
    twoFactorSecret: 'D5PQ7KUUDKO2RIYR22XWG6D5D6BQH276'
  },
  {
    id: 'acc-real-7',
    name: 'Diana Hotz',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    status: 'warming',
    proxyIp: '161.77.53.87:12323:14a41cce49cf1:767daa7beb',
    proxyLocation: '🇬🇧 英国伦敦 (ISP住宅) / 36好友',
    browserProfileId: 'ads-profile-2078',
    dailyActionsCount: 3,
    dailyLimit: 25,
    cookieStatus: 'valid',
    healthScore: 99,
    lastActive: 'UID:61580110882668',
    warmingDays: 2,
    group: '养号A组',
    twoFaCode: '837284',
    twoFactorSecret: 'RO2N6KYQ73GH7UGHJLFDDPEU7CEENG7O'
  },
  {
    id: 'acc-real-8',
    name: 'Kennedy Myers',
    avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=120&auto=format&fit=crop&q=80',
    status: 'warming',
    proxyIp: '168.158.145.231:12323:14a41cce49cf1:767daa7beb',
    proxyLocation: '🇺🇸 洛杉矶 (ISP住宅) / 精美穿搭相册',
    browserProfileId: 'ads-profile-2089',
    dailyActionsCount: 1,
    dailyLimit: 25,
    cookieStatus: 'valid',
    healthScore: 97,
    lastActive: 'UID:61579840616215',
    warmingDays: 2,
    group: '养号A组',
    twoFaCode: '293217',
    twoFactorSecret: 'CZRFVXBDSC27K6QLLTEHRVFFL7RXZ5OH'
  },
  {
    id: 'acc-real-9',
    name: 'Jean Bennet',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    status: 'warming',
    proxyIp: '161.77.95.197:12323:14a41cce49cf1:767daa7beb',
    proxyLocation: '🇺🇸 洛杉矶 (ISP住宅) / 咖啡穿搭',
    browserProfileId: 'ads-profile-2094',
    dailyActionsCount: 2,
    dailyLimit: 25,
    cookieStatus: 'valid',
    healthScore: 98,
    lastActive: 'UID:61578926384875',
    warmingDays: 2,
    group: '养号A组',
    twoFaCode: '548508',
    twoFactorSecret: 'FIOA37KZVQRY7NWOLKQUSSSFGC03R2PZ'
  },
  {
    id: 'acc-real-10',
    name: 'Angela Sotomayor',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=120&auto=format&fit=crop&q=80',
    status: 'warming',
    proxyIp: '128.254.178.113:12323:14a41cce49cf1:767daa7beb',
    proxyLocation: '🇬🇧 英国伦敦 (ISP住宅) / 威尼斯相册',
    browserProfileId: 'ads-profile-2103',
    dailyActionsCount: 4,
    dailyLimit: 25,
    cookieStatus: 'valid',
    healthScore: 99,
    lastActive: 'UID:61579084982377',
    warmingDays: 2,
    group: '养号A组',
    twoFaCode: '614706',
    twoFactorSecret: 'Q3AW7CIMZGEJBSBUHB3QPT4PWCWP6AMT'
  }
];

// Authentic US Facebook Accounts Preset with Dedicated US Residential ISP & en-US Language
export const US_PRESET_ACCOUNTS: FBAccount[] = [
  {
    id: 'acc-us-1',
    name: 'TG-US-9174829104',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    status: 'active',
    proxyIp: '198.54.120.45:9021',
    proxyLocation: '🇺🇸 美国纽约 (AT&T 原生静态住宅 ISP)',
    browserProfileId: 'ads-profile-us-01',
    dailyActionsCount: 16,
    dailyLimit: 85,
    cookieStatus: 'valid',
    healthScore: 99,
    lastActive: '+1 (917) 482-9104',
    warmingDays: 33,
    group: '美区高权A组',
    twoFaCode: '492810'
  },
  {
    id: 'acc-us-2',
    name: 'TG-US-4158923019',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    status: 'active',
    proxyIp: '198.54.120.46:9022',
    proxyLocation: '🇺🇸 美国旧金山 (Comcast 原生住宅 ISP)',
    browserProfileId: 'ads-profile-us-02',
    dailyActionsCount: 22,
    dailyLimit: 85,
    cookieStatus: 'valid',
    healthScore: 98,
    lastActive: '+1 (415) 892-3019',
    warmingDays: 33,
    group: '美区高权A组',
    twoFaCode: '582914'
  },
  {
    id: 'acc-us-3',
    name: 'TG-US-3129482015',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    status: 'active',
    proxyIp: '198.54.120.47:9023',
    proxyLocation: '🇺🇸 美国芝加哥 (Verizon Fios 住宅 ISP)',
    browserProfileId: 'ads-profile-us-03',
    dailyActionsCount: 28,
    dailyLimit: 85,
    cookieStatus: 'valid',
    healthScore: 99,
    lastActive: '+1 (312) 948-2015',
    warmingDays: 33,
    group: '美区高权A组',
    twoFaCode: '718392'
  },
  {
    id: 'acc-us-4',
    name: 'TG-US-3058192041',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    status: 'active',
    proxyIp: '198.54.120.48:9024',
    proxyLocation: '🇺🇸 美国迈阿密 (Spectrum 原生住宅 ISP)',
    browserProfileId: 'ads-profile-us-04',
    dailyActionsCount: 19,
    dailyLimit: 85,
    cookieStatus: 'valid',
    healthScore: 97,
    lastActive: '+1 (305) 819-2041',
    warmingDays: 33,
    group: '美区高权A组',
    twoFaCode: '639102'
  },
  {
    id: 'acc-us-5',
    name: 'TG-US-2068940192',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&auto=format&fit=crop&q=80',
    status: 'active',
    proxyIp: '198.54.120.49:9025',
    proxyLocation: '🇺🇸 美国西雅图 (CenturyLink 原生住宅)',
    browserProfileId: 'ads-profile-us-05',
    dailyActionsCount: 25,
    dailyLimit: 85,
    cookieStatus: 'valid',
    healthScore: 99,
    lastActive: '+1 (206) 894-0192',
    warmingDays: 33,
    group: '美区高权A组',
    twoFaCode: '827103'
  },
  {
    id: 'acc-us-6',
    name: 'TG-US-5129384019',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&auto=format&fit=crop&q=80',
    status: 'active',
    proxyIp: '198.54.120.50:9026',
    proxyLocation: '🇺🇸 美国奥斯汀 (Frontier 原生住宅 ISP)',
    browserProfileId: 'ads-profile-us-06',
    dailyActionsCount: 31,
    dailyLimit: 85,
    cookieStatus: 'valid',
    healthScore: 98,
    lastActive: '+1 (512) 938-4019',
    warmingDays: 33,
    group: '美区高权A组',
    twoFaCode: '918234'
  }
];

export const INITIAL_TASKS: AutomationTask[] = [
  {
    id: 'task-us-male-45',
    name: '🇺🇸 50s-80s Facebook Dating 美国成熟男粉定向加人 (10.1万真实池)',
    sourceType: 'group_members',
    targetUrl: 'https://www.facebook.com/groups/1843429719574339/members',
    targetCount: 1500,
    status: 'running',
    filters: {
      countries: ['US'],
      gender: 'male',
      minFriends: 30,
      maxFriends: 5000,
      bioKeywords: ['single', 'looking', 'widowed', 'retired', 'divorced', 'dating', 'man'],
      negativeKeywords: ['scam', 'bot', 'agency'],
      aiQualification: true
    },
    actions: {
      addFriend: true,
      sendDirectMessage: false,
      likeRecentPosts: 2,
      messengerAutoReply: false,
      cancelPendingAfterDays: 14
    },
    safetyRules: {
      minDelaySeconds: 25,
      maxDelaySeconds: 45,
      dailyLimitPerAccount: 5,
      humanSimulationKeystrokes: true
    },
    progress: {
      scanned: 0,
      matched: 0,
      added: 0,
      dmed: 0
    },
    assignedAccountsCount: 10,
    createdAt: '今日 (已锁定群ID: 1843429719574339 真实公开大群)'
  }
];

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'lead-1',
    fbId: '10009283748291',
    name: 'David Miller',
    profileUrl: 'https://facebook.com/profile.php?id=10009283748291',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    source: 'group',
    sourceName: 'Shopify Entrepreneurs USA',
    country: '🇺🇸 美国 (洛杉矶)',
    gender: 'male',
    friendsCount: 680,
    bio: 'Founder @ Oakwood Apparel | 7-figure DTC Shopify Brand Owner',
    qualificationScore: 96,
    status: 'replied',
    assignedAccountId: 'acc-demo-1',
    capturedAt: '今日 10:14',
    lastActionAt: '刚刚'
  },
  {
    id: 'lead-2',
    fbId: '10009283748292',
    name: 'Sophia Martinez',
    profileUrl: 'https://facebook.com/profile.php?id=10009283748292',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
    source: 'group',
    sourceName: 'Amazon FBA Sellers Worldwide',
    country: '🇺🇸 美国 (迈阿密)',
    gender: 'female',
    friendsCount: 1420,
    bio: 'Amazon FBA Private Label Specialist & Supply Chain Consultant',
    qualificationScore: 94,
    status: 'replied',
    assignedAccountId: 'acc-demo-2',
    capturedAt: '今日 09:05',
    lastActionAt: '10分钟前'
  }
];

export const INITIAL_SPINTAX: SpintaxTemplate[] = [
  {
    id: 'sp-init-1',
    name: '欧美跨境/出海业务好友破冰',
    template: '{您好|嗨|Hi} {name}！{看到您也在|关注到您在}{group_name}小组，{感觉您对出海业务非常专业|看到您的动态很受启发}。我们开发了一套{精准获客自动化系统|社交矩阵引流工具}，{每天可自动触达30-80位高意向客户|支持云端去重与自动加粉}。{方便发您一份演示了解下吗？|期待和您交流海外获客心得！}',
    preview: '您好 Alex！看到您也在出海卖家小组，感觉您对出海业务非常专业。我们开发了一套精准获客自动化系统，支持云端去重与自动加粉。方便发您一份演示了解下吗？'
  },
  {
    id: 'sp-init-2',
    name: '帖子点赞/评论高意向互动跟进',
    template: '{Hello|你好} {name}，{注意到您点赞了关于|看到您在}{topic}{的讨论|的贴文}，{我们近期正好整理了一套关于这个方向的最新获客玩法|这里有一份详细的实操引流SOP方案}。{如果有兴趣的话，我私发给您看看？|方便给您发个简版资料参考下吗？}',
    preview: 'Hello Sarah，注意到您点赞了关于海外社媒精准获客的讨论，我们近期正好整理了一套关于这个方向的最新获客玩法。如果有兴趣的话，我私发给您看看？'
  }
];

export const DEFAULT_LIFESTYLE_POSTS: FeedPostItem[] = [
  {
    id: 'post-lifestyle-1',
    title: '☀️ 曼哈顿晨光咖啡与早安打卡 (系统内置免上传)',
    content: 'Coffee first, adulting second ☕✨ Golden morning in the city, wishing everyone a productive and joyful week ahead! 🗽🏙️ #lifestyle #morningroutine #nyc #goodvibes',
    images: [
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&auto=format&fit=crop&q=80'
    ],
    scheduleTimeSlots: ['早间 09:30-11:00 (Feed浏览点赞后发圈)'],
    targetAccountIds: ['all'],
    status: 'active',
    createdAt: '系统全自动就绪',
    publishedCount: 14
  },
  {
    id: 'post-lifestyle-2',
    title: '🌿 中央公园秋日漫步实拍 (系统内置免上传)',
    content: 'Fall colors are finally here 🍁🍂 Took a long walk to clear my mind and soak in the gentle breeze. Take time to breathe and appreciate the little things 🕊️✨ #autumnvibes #naturewalk #chill',
    images: [
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=600&auto=format&fit=crop&q=80'
    ],
    scheduleTimeSlots: ['傍晚 19:30-21:00 (下班刷圈高峰)'],
    targetAccountIds: ['all'],
    status: 'active',
    createdAt: '系统全自动就绪',
    publishedCount: 19
  },
  {
    id: 'post-lifestyle-3',
    title: '🥑 周末闺蜜早午餐 Brunch (系统内置免上传)',
    content: 'Sunday brunch mood 🥞🥑 Toast, fresh berries, and iced matcha with the best company! Recharge mode: 100% 💖 #weekendbrunch #foodie #sundaymood',
    images: [
      'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=600&auto=format&fit=crop&q=80'
    ],
    scheduleTimeSlots: ['午间 14:00-15:30 (午休活跃峰值)'],
    targetAccountIds: ['all'],
    status: 'active',
    createdAt: '系统全自动就绪',
    publishedCount: 8
  }
];

