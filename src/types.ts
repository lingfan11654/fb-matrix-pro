export interface ScriptConfig {
  addFriends: {
    source: 'recommended' | 'friends_of_friend' | 'post_likers' | 'keyword_location' | 'friend_link' | 'group_link' | 'profile_txt' | 'reels_interactive';
    removeUnqualified: boolean;
    refreshAtBottom: boolean;
    useAIFaceRecognition: boolean;
    nicknameLanguageDetect: boolean;
    targetLanguages: string[];
    filterLocation: string;
    cloudDeduplication: boolean;
    cloudDbName: string;
    friendCountRange: [number, number];
    delaySeconds: [number, number];
    stopCount: number;
    reelsFilterType: 'likers' | 'commenters' | 'comment_likers';
  };
  directMessages: {
    dmAllFriends: boolean;
    dmOnlineFriends: boolean;
    loopReply: boolean;
    repeatDmIntervalHours: number;
    dmCloudDeduplication: boolean;
    dmUncontactedOnly: boolean;
    richMediaAttachment: boolean;
    randomEmoji: boolean;
    spintaxTemplates: string[];
    delaySeconds: [number, number];
    stopCount: number;
  };
  groupPosting: {
    addRecommendedGroups: boolean;
    postAfterJoined: boolean;
    homePost: boolean;
    tagFriends: boolean;
    keywordSearchGroups: string;
    stopGroupsCount: number;
    postType: 'public' | 'friends';
    postImages: boolean;
    postRandomEmoji: boolean;
    postContent: string;
  };
  accountWarming: {
    deleteOldFriends: boolean;
    deleteCount: number;
    cancelSentRequests: boolean;
    cancelCount: number;
    likePublicPagePosts: boolean;
    likeFeedPosts: boolean;
    likeTimelineSuggested: boolean;
    keywordVideoWatchAndComment: boolean;
    keywordSearchSimulation: string;
    warmingDurationMinutes: number;
    delaySeconds: [number, number];
  };
  autoRegistration: {
    appVersion: 'new' | 'legacy';
    nicknameLanguage: 'english' | 'spanish' | 'portuguese' | 'french' | 'german' | 'japanese' | 'arabic' | 'vietnamese' | 'thai' | 'indonesian' | 'chinese' | 'custom';
    smsPlatform: 'sms-activate' | '5sim' | 'sms-man' | 'daisysms';
    smsApiKey: string;
    smsCountry: string;
    autoGenContacts: boolean;
    contactsCount: number;
    deviceVcfStatus: string;
  };
}

export interface MultiWindowInstance {
  windowId: number;
  name: string;
  avatar: string;
  proxyIp: string;
  status: 'running' | 'idle' | 'warning' | 'paused';
  currentAction: string;
  currentScreen: 'reels' | 'group' | 'profile' | 'messenger' | 'feed' | 'registration';
  scannedCount: number;
  successCount: number;
  log: string;
}

export interface FBAccount {
  id: string;
  name: string;
  avatar: string;
  status: 'active' | 'warming' | 'cooldown' | 'suspended';
  proxyIp: string;
  proxyLocation: string;
  browserProfileId: string;
  dailyActionsCount: number;
  dailyLimit: number;
  cookieStatus: 'valid' | 'expiring' | 'expired';
  healthScore: number;
  lastActive: string;
  warmingDays: number;
  createdAt?: number;
  initialWarmingDays?: number;
  group?: string;
  twoFaCode?: string;
  twoFactorSecret?: string;
  addedFriendsCount?: number; // 当前已加客户数 (自动汇总进全矩阵去重库)
  targetClientsGoal?: number; // 目标达标客户数 (默认150)
}

export interface Lead {
  id: string;
  fbId: string;
  name: string;
  profileUrl: string;
  avatar: string;
  source: 'group' | 'recommended' | 'post_likes' | 'friend_network' | 'direct_url';
  sourceName: string;
  country: string;
  gender: 'male' | 'female' | 'other';
  friendsCount: number;
  bio: string;
  qualificationScore: number;
  status: 'scraped' | 'qualified' | 'disqualified' | 'friend_request_sent' | 'dm_sent' | 'replied' | 'converted';
  assignedAccountId: string;
  capturedAt: string;
  lastActionAt: string;
}

export interface AutomationTask {
  id: string;
  name: string;
  sourceType: 'group_members' | 'recommended_friends' | 'post_likers' | 'friends_network' | 'profile_urls';
  targetUrl: string;
  targetCount: number;
  status: 'running' | 'paused' | 'completed' | 'queued';
  filters: {
    countries: string[];
    gender: 'all' | 'male' | 'female';
    minFriends: number;
    maxFriends: number;
    bioKeywords: string[];
    negativeKeywords: string[];
    aiQualification: boolean;
  };
  actions: {
    addFriend: boolean;
    sendDirectMessage: boolean;
    likeRecentPosts: number;
    messengerAutoReply: boolean;
    cancelPendingAfterDays: number;
  };
  safetyRules: {
    minDelaySeconds: number;
    maxDelaySeconds: number;
    dailyLimitPerAccount: number;
    humanSimulationKeystrokes: boolean;
  };
  progress: {
    scanned: number;
    matched: number;
    added: number;
    dmed: number;
  };
  assignedAccountsCount: number;
  createdAt: string;
}

export interface SpintaxTemplate {
  id: string;
  name: string;
  template: string;
  preview: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  tagline: string;
  price: number;
  billingPeriod: '月' | '季' | '年' | '终身';
  popular?: boolean;
  features: string[];
  specs: {
    accounts: string;
    concurrency: string;
    cloudDeduplication: string;
    aiQualification: string;
    proxies: string;
    updates: string;
  };
}

export interface OtherPlatform {
  id: string;
  name: string;
  icon: string;
  desc: string;
  tag: string;
  features: string[];
  popularRate: number;
}

export interface FeedPostItem {
  id: string;
  title: string;
  content: string;
  images: string[];
  scheduleTimeSlots: string[]; // e.g. ['09:00-11:30', '15:00-17:00', '20:00-22:00']
  targetAccountIds: string[]; // 'all' or specific account IDs
  status: 'active' | 'scheduled' | 'completed' | 'paused';
  createdAt: string;
  publishedCount: number;
}

export interface MessengerMessage {
  id: string;
  sender: 'lead' | 'me';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface MessengerConversation {
  id: string;
  accountId: string;
  accountName: string;
  leadId: string;
  leadName: string;
  leadAvatar: string;
  lastMessage: string;
  lastMessageTime: string;
  unread: boolean;
  messages: MessengerMessage[];
  assignedWhatsApp?: string;
  transferredToWhatsApp?: boolean;
}

export interface WhatsAppLeadChannel {
  id: string;
  tag: string; // e.g. 'WS-01'
  phoneOrLink: string; // e.g. '+1 (626) 388-9012' or 'https://wa.me/16263889012'
  assignedAccountId?: string; // which FB account is responsible, or 'global'
  assignedAccountName?: string;
  dailyCap: number; // e.g. 2 customers per day
  todayTransferred: number; // e.g. 1
  totalTransferred: number;
  status: 'active' | 'capped' | 'paused';
}

export interface WhatsAppDiversionConfig {
  enabled: boolean;
  mode: 'per_account_group' | 'global_round_robin'; // per account group: 1 FB account = 5 WS, or global pool
  dailyCapPerChannel: number; // e.g. 2 leads per WS per day
  autoTransferMessageCount: number; // e.g. auto transfer after 3-4 messages
  autoTransferKeywords: string[]; // e.g. ['number', 'phone', 'whatsapp', 'call', 'contact']
  transferTemplates: string[];
}

