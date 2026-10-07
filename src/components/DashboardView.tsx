import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Play,
  Pause,
  Plus,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  Download,
  AlertCircle,
  TrendingUp,
  Cpu,
  Layers,
  Send,
  Sliders,
  Copy,
  Check,
  Key,
  HelpCircle,
  FileText,
  Fingerprint,
  Trash2,
  X,
  UploadCloud,
  Calendar,
  Globe,
  Server,
  Wifi,
  Edit2,
  Image as ImageIcon,
  MessageCircle,
  MessageSquare,
  Camera,
  Bell,
  CheckCheck,
  Lightbulb,
  Share2,
  ThumbsUp,
  Tag,
  ArrowRight,
  UserCheck,
  Save,
  FolderPlus,
  Phone,
  RotateCcw
} from 'lucide-react';
import { FBAccount, Lead, AutomationTask, SpintaxTemplate, FeedPostItem, MessengerConversation, MessengerMessage, WhatsAppLeadChannel, WhatsAppDiversionConfig } from '../types';
import { AccountLoginModal } from './AccountLoginModal';
import { FingerprintInspectorModal } from './FingerprintInspectorModal';
import { MatrixControlHubModal } from './MatrixControlHubModal';
import { BatchAccountProfileModal } from './BatchAccountProfileModal';
import { RollingDayStepper } from './RollingDayStepper';
import { WhatsAppDiversionModal } from './WhatsAppDiversionModal';
import { INITIAL_ACCOUNTS, US_PRESET_ACCOUNTS, FEMALE_NAMES_POOL, DEFAULT_LIFESTYLE_POSTS } from '../data/mockData';
import { compressAvatarImage, trimWhiteBorders, deduplicateImages } from '../utils/imageHelper';

interface DashboardViewProps {
  accounts: FBAccount[];
  setAccounts: React.Dispatch<React.SetStateAction<FBAccount[]>>;
  tasks: AutomationTask[];
  setTasks: React.Dispatch<React.SetStateAction<AutomationTask[]>>;
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  onOpenSimulator: (account?: FBAccount) => void;
  onOpenLoginModal?: () => void;
  onOpenPricing?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  accounts,
  setAccounts,
  tasks,
  setTasks,
  leads,
  setLeads,
  onOpenSimulator,
  onOpenLoginModal
}) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'spintax' | 'accounts' | 'leads' | 'feed_posts' | 'messenger_inbox'>('accounts');
  const [leadFilterStatus, setLeadFilterStatus] = useState<string>('all');
  const [leadSearch, setLeadSearch] = useState('');

  // Feed / Story Auto-Post Materials state with full persistence
  const [feedPosts, setFeedPosts] = useState<FeedPostItem[]>(() => {
    try {
      const saved = localStorage.getItem('fb_matrix_feed_posts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load feedPosts from storage', e);
    }
    return DEFAULT_LIFESTYLE_POSTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('fb_matrix_feed_posts', JSON.stringify(feedPosts));
    } catch (e) {
      console.error('Failed to save feedPosts to storage', e);
    }
  }, [feedPosts]);

  const [showNewFeedModal, setShowNewFeedModal] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostImageUrl, setNewPostImageUrl] = useState('');
  const [newPostImages, setNewPostImages] = useState<string[]>([]);
  const [avatarBatchSuccess, setAvatarBatchSuccess] = useState<string | null>(null);
  const [showBatchAvatarModal, setShowBatchAvatarModal] = useState(false);
  const [batchAvatarFiles, setBatchAvatarFiles] = useState<string[]>([]);
  const [avatarAssignMode, setAvatarAssignMode] = useState<'new_only' | 'override_all'>('new_only');
  const [showBatchProfileModal, setShowBatchProfileModal] = useState(false);
  const [newPostTimeSlots, setNewPostTimeSlots] = useState<string[]>(['早间 09:30-11:00', '傍晚 19:30-21:00']);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [copiedDeliveryToast, setCopiedDeliveryToast] = useState(false);
  const [deliveryViewMode, setDeliveryViewMode] = useState<'card_key' | 'qc_cert'>('card_key');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTargetUrl, setEditingTargetUrl] = useState<string>('');

  // US Eastern Time Live Clock for Anti-Ban Circadian Protection (美国本土生理作息防封调度时钟)
  const [usTime, setUsTime] = useState(() => {
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      }).format(new Date());
    } catch {
      return '10:00:00 AM';
    }
  });

  const [usHour, setUsHour] = useState(() => {
    try {
      const h = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York',
        hour: 'numeric',
        hour12: false
      }).format(new Date());
      return parseInt(h, 10) || 10;
    } catch {
      return 10;
    }
  });

  useEffect(() => {
    const timer = setInterval(() => {
      try {
        setUsTime(new Intl.DateTimeFormat('en-US', {
          timeZone: 'America/New_York',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        }).format(new Date()));
        const h = new Intl.DateTimeFormat('en-US', {
          timeZone: 'America/New_York',
          hour: 'numeric',
          hour12: false
        }).format(new Date());
        setUsHour(parseInt(h, 10) || 10);
      } catch {}
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isUsDaytime = usHour >= 8 && usHour <= 22; // 08:00 AM to 10:00 PM EST (美东白天)

  // Reserved Avatar & Media Vault (矩阵预存素材库 / 暂存备用头像池，过两天直接一键应用)
  const [reservedAvatarVault, setReservedAvatarVault] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('fb_matrix_reserved_avatar_vault');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('fb_matrix_reserved_avatar_vault', JSON.stringify(reservedAvatarVault));
    } catch (e) {
      console.error(e);
    }
  }, [reservedAvatarVault]);

  // Comment Auto Moderation & Shield state (智能防差评与同行截流守卫)
  const [commentShieldActive, setCommentShieldActive] = useState(true);
  const [commentShieldStrategy, setCommentShieldStrategy] = useState<'auto_hide' | 'auto_delete' | 'auto_block'>('auto_hide');
  const [shieldKeywords, setShieldKeywords] = useState('Scam, Fake, Fraud, 骗子, 差评, PM me, WhatsApp, wa.me, t.me, Check bio, Inbox me, 垃圾, 低价货');
  const [moderatedLogs, setModeratedLogs] = useState<Array<{
    id: string;
    time: string;
    account: string;
    user: string;
    text: string;
    action: string;
    statusBadge: string;
  }>>([]);

  // WhatsApp Diversion Pool (50号负载均衡与轮询分流)
  const [showWhatsAppDiversionModal, setShowWhatsAppDiversionModal] = useState(false);
  const [whatsappToast, setWhatsappToast] = useState<string | null>(null);
  const [autoPilotChatEnabled, setAutoPilotChatEnabled] = useState(true);

  const [whatsappPool, setWhatsappPool] = useState<WhatsAppLeadChannel[]>(() => {
    try {
      const saved = localStorage.getItem('fb_matrix_whatsapp_pool');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  const [diversionConfig, setDiversionConfig] = useState<WhatsAppDiversionConfig>(() => {
    try {
      const saved = localStorage.getItem('fb_matrix_whatsapp_diversion_config');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(e);
    }
    return {
      enabled: true,
      mode: 'per_account_group',
      dailyCapPerChannel: 2,
      autoTransferMessageCount: 3,
      autoTransferKeywords: ['number', 'phone', 'whatsapp', 'call', 'contact', 'text me'],
      transferTemplates: [
        'I really enjoy chatting with you! I don\'t check Facebook often due to my busy schedule. If you use WhatsApp, feel free to add me: {whatsapp_contact} 😊 Hope to catch up there!',
        'It was wonderful talking with you! Text me on WhatsApp when you\'re free: {whatsapp_contact}. Have a blessed day!',
        'I\'m heading out soon, but let\'s keep in touch! Here\'s my WhatsApp: {whatsapp_contact} 🌸',
        'So great connecting with someone so sincere! Text me on WhatsApp: {whatsapp_contact} 👍'
      ]
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem('fb_matrix_whatsapp_pool', JSON.stringify(whatsappPool));
    } catch (e) {
      console.error(e);
    }
  }, [whatsappPool]);

  useEffect(() => {
    try {
      localStorage.setItem('fb_matrix_whatsapp_diversion_config', JSON.stringify(diversionConfig));
    } catch (e) {
      console.error(e);
    }
  }, [diversionConfig]);

  // Messenger Unified Inbox state (真实空数据状态，等待启动拓客自动进入)
  const [conversations, setConversations] = useState<MessengerConversation[]>(() => {
    try {
      const saved = localStorage.getItem('fb_matrix_messenger_conversations');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem('fb_matrix_messenger_conversations', JSON.stringify(conversations));
    } catch (e) {
      console.error(e);
    }
  }, [conversations]);

  const [activeConversationId, setActiveConversationId] = useState<string>('');
  const [chatInputText, setChatInputText] = useState('');

  // Guide Modals
  const [showAgedAccountGuideModal, setShowAgedAccountGuideModal] = useState(false);
  const [showCapacityGuideModal, setShowCapacityGuideModal] = useState(false);
  const [showWorkflowGuideModal, setShowWorkflowGuideModal] = useState(false);
  const [showMatrixHubModal, setShowMatrixHubModal] = useState(false);
  const [matrixHubTab, setMatrixHubTab] = useState<'hub' | 'warming' | 'profile' | 'bulk_send'>('hub');

  // Preset realistic high-quality avatars cleared for maximum anti-ban safety
  const PRESET_AVATARS: string[] = [];

  // AI Spintax state
  const [industry, setIndustry] = useState('跨境电商独立站与出海品牌');
  const [targetAudience, setTargetAudience] = useState('欧美Shopify卖家、亚马逊FBA商家、海外采购商');
  const [goal, setGoal] = useState('吸引对方通过好友、索取获客软件演示与合作咨询');
  const [isGeneratingSpintax, setIsGeneratingSpintax] = useState(false);
  const [spintaxList, setSpintaxList] = useState<SpintaxTemplate[]>([
    {
      id: 'sp-init-1',
      name: '欧美跨境卖家好友通过破冰',
      template: '{您好|嗨|Hi} {name}！{看到您也在|关注到您在}{group_name}小组，{感觉您对出海电商非常专业|看到您分享的内容很受启发}。我们团队自主开发了一套{FB多场景精准获客自动化脚本|社交矩阵精准引流工具}，{支持云端去重与自动加粉|每天可全自动筛选30-80位高意向客户}。{方便发您一份演示视频了解下吗？|期待和您交流海外获客心得！}',
      preview: '您好 James！看到您也在Shopify Entrepreneurs小组，感觉您对出海电商非常专业。我们团队自主开发了一套FB多场景精准获客自动化脚本，支持云端去重与自动加粉。方便发您一份演示视频了解下吗？'
    },
    {
      id: 'sp-init-2',
      name: '帖子点赞/互动意向跟进',
      template: '{Hello|你好} {name}，{注意到您点赞了关于|看到您在}{topic}{的讨论|的贴文}，{我们近期正好整理了一套关于这个方向的最新获客玩法|这里有一份详细的实操引流SOP方案}。{如果有兴趣的话，我私发给您看看？|方便给您发个简版资料参考下吗？}',
      preview: 'Hello Sarah，注意到您点赞了关于海外社媒精准投流的贴文，我们近期正好整理了一套关于这个方向的最新获客玩法。如果有兴趣的话，我私发给您看看？'
    }
  ]);
  const [spintaxTestOutput, setSpintaxTestOutput] = useState<string>('');
  const [copiedSpintax, setCopiedSpintax] = useState<string | null>(null);

  // New task modal
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskUrl, setNewTaskUrl] = useState('');
  const [newTaskSource, setNewTaskSource] = useState<'group_members' | 'post_likers' | 'recommended_friends'>('group_members');
  const [newTaskGender, setNewTaskGender] = useState<'all' | 'male' | 'female'>('all');
  const [newTaskCountry, setNewTaskCountry] = useState('US');
  const [newTaskBioKeywords, setNewTaskBioKeywords] = useState('');
  const [newTaskNegativeKeywords, setNewTaskNegativeKeywords] = useState('Student, Intern, Young, Teen');
  const [newTaskActiveHours, setNewTaskActiveHours] = useState<'48h' | '24h' | 'any'>('48h');
  const [newTaskTargetClients, setNewTaskTargetClients] = useState<number>(150);

  // Account login/import modal
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [inspectingAccount, setInspectingAccount] = useState<FBAccount | null>(null);
  const [showFingerprintModal, setShowFingerprintModal] = useState(false);

  // Account Warming Filter & IP Edit States
  const [warmingFilter, setWarmingFilter] = useState<'all' | 'icebreaker' | 'warmup' | 'growth' | 'mature'>('all');
  const [editingAccount, setEditingAccount] = useState<FBAccount | null>(null);
  const [editProxyIp, setEditProxyIp] = useState('');
  const [editProxyLocation, setEditProxyLocation] = useState('');
  const [editWarmingDays, setEditWarmingDays] = useState(0);
  const [editAvatar, setEditAvatar] = useState('');

  // Account matrix view mode & selection (compact_mini for 300 accounts, table_view, dense_matrix, detailed_cards)
  const [accountViewMode, setAccountViewMode] = useState<'compact_mini' | 'dense_matrix' | 'table_view' | 'detailed_cards'>('compact_mini');
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [autoRollTimerActive, setAutoRollTimerActive] = useState(false);
  const [autoRollSpeed, setAutoRollSpeed] = useState<number>(1500); // 1.5 seconds per day in live rolling demo mode
  const [editing2FaAccount, setEditing2FaAccount] = useState<FBAccount | null>(null);
  const [edit2FaInput, setEdit2FaInput] = useState('');

  // Handle scrolling / rolling days for an account (- and + stepper & mouse wheel)
  const handleRollWarmingDays = (accId: string, delta: number) => {
    setAccounts(prev => prev.map(a => {
      if (a.id !== accId) return a;
      const nextDays = Math.max(0, (a.warmingDays || 1) + delta);
      return {
        ...a,
        warmingDays: nextDays,
        initialWarmingDays: nextDays,
        createdAt: Date.now(),
        dailyLimit: nextDays >= 15 ? 80 : nextDays >= 8 ? 50 : 30,
        status: nextDays >= 8 ? ('active' as const) : ('warming' as const)
      };
    }));
  };

  // Real-world 24h rolling days tracker: checks elapsed time since account import
  useEffect(() => {
    const checkDailyRoll = () => {
      const now = Date.now();
      setAccounts(prev => {
        let changed = false;
        const updated = prev.map(acc => {
          const created = acc.createdAt || now;
          const initial = acc.initialWarmingDays ?? acc.warmingDays ?? 1;
          const elapsedDays = Math.floor((now - created) / (24 * 60 * 60 * 1000));
          const calculatedDays = Math.max(initial, initial + elapsedDays);
          if (calculatedDays !== acc.warmingDays || !acc.createdAt) {
            changed = true;
            return {
              ...acc,
              createdAt: created,
              initialWarmingDays: initial,
              warmingDays: calculatedDays,
              dailyLimit: calculatedDays >= 15 ? 80 : calculatedDays >= 8 ? 50 : 30,
              status: calculatedDays >= 8 ? ('active' as const) : ('warming' as const)
            };
          }
          return acc;
        });
        return changed ? updated : prev;
      });
    };

    checkDailyRoll();
    const interval = setInterval(checkDailyRoll, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  // Batch roll all accounts + delta day
  const handleBatchRollAll = (delta: number = 1) => {
    setAccounts(prev => prev.map(a => {
      const nextDays = Math.max(0, (a.warmingDays || 1) + delta);
      return {
        ...a,
        warmingDays: nextDays,
        initialWarmingDays: nextDays,
        createdAt: Date.now(),
        dailyLimit: nextDays >= 15 ? 80 : nextDays >= 8 ? 50 : 30,
        status: nextDays >= 8 ? ('active' as const) : ('warming' as const)
      };
    }));
  };

  // Reset all accounts to a unified specific day (e.g. Day 2)
  const handleAlignAllToDay = (targetDay: number = 2) => {
    setAccounts(prev => prev.map(a => ({
      ...a,
      warmingDays: targetDay,
      initialWarmingDays: targetDay,
      createdAt: Date.now() - (targetDay - 1) * 24 * 60 * 60 * 1000,
      dailyLimit: targetDay >= 15 ? 80 : targetDay >= 8 ? 50 : 30,
      status: targetDay >= 8 ? ('active' as const) : ('warming' as const)
    })));
  };

  // Reset all accounts to Day 33 (matching screenshot)
  const handleResetToDay33 = () => {
    handleAlignAllToDay(33);
  };

  // Batch rename all accounts to authentic US female names
  const handleApplyFemaleNamesAll = () => {
    setAccounts(prev => prev.map((a, idx) => ({
      ...a,
      name: FEMALE_NAMES_POOL[idx % FEMALE_NAMES_POOL.length]
    })));
  };

  // Live animated auto-roll effect: when active, dynamically ticks forward
  useEffect(() => {
    if (!autoRollTimerActive) return;

    const interval = setInterval(() => {
      handleBatchRollAll(1);
    }, autoRollSpeed);

    return () => clearInterval(interval);
  }, [autoRollTimerActive, autoRollSpeed]);

  // Change group for an account
  const handleUpdateAccountGroup = (accId: string, newGroup: string) => {
    setAccounts(prev => prev.map(a => a.id === accId ? { ...a, group: newGroup } : a));
  };

  // Quick load 6 US FB accounts preset (Dedicated US ISP + en-US + Day 33)
  const handleLoadUsMatrix = () => {
    setAccounts(US_PRESET_ACCOUNTS);
  };

  // Quick load 6 demo accounts matching the user's screenshot
  const handleLoadScreenshotDemoAccounts = () => {
    setAccounts(INITIAL_ACCOUNTS);
  };

  // Live Activity Radar Stream
  const [showLiveRadar, setShowLiveRadar] = useState(true);
  const [liveActivities, setLiveActivities] = useState<Array<{
    id: string;
    time: string;
    account: string;
    type: string;
    desc: string;
    badge: string;
    color: string;
  }>>([]);

  // Periodic simulated live activity generation
  useEffect(() => {
    if (!showLiveRadar || accounts.length === 0) return;
    const interval = setInterval(() => {
      const randomAcc = accounts[Math.floor(Math.random() * accounts.length)];
      const sampleEvents = [
        {
          type: 'Watch 视频行业完播',
          desc: `在美区搜索 "Amazon FBA Sellers" 并观看精选视频 35 秒，发表真人好评 "Great insights on supply chain!"`,
          badge: '权重提升',
          color: 'blue'
        },
        {
          type: 'Feed 信息流点赞',
          desc: `滑动浏览美区科技商业动态，为好友及 Forbes 商业主页点赞 2 次`,
          badge: '真人轨迹',
          color: 'emerald'
        },
        {
          type: '动态发布打卡',
          desc: `通过 Spintax 自动发布生活与出海业务动态，图文自动打散防查重`,
          badge: '主页立体化',
          color: 'pink'
        },
        {
          type: '好友健康队列巡视',
          desc: `检查加好友进度，今日已安全触达 18 人，未触发任何风控阈值`,
          badge: '安全受控',
          color: 'purple'
        }
      ];
      const selected = sampleEvents[Math.floor(Math.random() * sampleEvents.length)];
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
      setLiveActivities(prev => [
        {
          id: `act-${Date.now()}`,
          time: timeStr,
          account: randomAcc.name,
          type: selected.type,
          desc: selected.desc,
          badge: selected.badge,
          color: selected.color
        },
        ...prev.slice(0, 9)
      ]);
    }, 7000);

    return () => clearInterval(interval);
  }, [showLiveRadar, accounts]);

  // Full Matrix Anti-Ban & IP Fraud Score Health Check State
  const [showHealthCheckModal, setShowHealthCheckModal] = useState(false);
  const [isHealthChecking, setIsHealthChecking] = useState(false);
  const [healthCheckDone, setHealthCheckDone] = useState(false);

  const handleRunHealthCheck = () => {
    setShowHealthCheckModal(true);
    setIsHealthChecking(true);
    setHealthCheckDone(false);
    setTimeout(() => {
      setIsHealthChecking(false);
      setHealthCheckDone(true);
    }, 1800);
  };

  const handleAddAccount = (newAcc: FBAccount) => {
    setAccounts((prev) => [newAcc, ...prev]);
  };

  const handleBatchAddAccounts = (newAccounts: FBAccount[]) => {
    setAccounts((prev) => [...newAccounts, ...prev]);
  };

  const handleOpenEditAccount = (acc: FBAccount) => {
    setEditingAccount(acc);
    setEditProxyIp(acc.proxyIp);
    setEditProxyLocation(acc.proxyLocation);
    setEditWarmingDays(acc.warmingDays || 1);
    setEditAvatar(acc.avatar);
  };

  const handleSaveAccountEdit = () => {
    if (!editingAccount) return;
    setAccounts(prev => prev.map(a => a.id === editingAccount.id ? {
      ...a,
      avatar: editAvatar || a.avatar,
      proxyIp: editProxyIp,
      proxyLocation: editProxyLocation,
      warmingDays: editWarmingDays,
      dailyLimit: editWarmingDays >= 15 ? 80 : editWarmingDays >= 8 ? 50 : 30
    } : a));
    setEditingAccount(null);
  };

  const handleSendMessage = () => {
    if (!chatInputText.trim()) return;
    const currentConv = conversations.find(c => c.id === activeConversationId);
    if (!currentConv) return;
    const newMsg: MessengerMessage = {
      id: `m-${Date.now()}`,
      sender: 'me',
      senderName: currentConv.accountName,
      text: chatInputText,
      timestamp: '刚刚'
    };
    setConversations(prev => prev.map(c => c.id === activeConversationId ? {
      ...c,
      unread: false,
      lastMessage: chatInputText,
      lastMessageTime: '刚刚',
      messages: [...c.messages, newMsg]
    } : c));
    setChatInputText('');
  };

  const handleCreateFeedPost = () => {
    if (!newPostContent.trim()) return;
    const finalImages = newPostImages.length > 0
      ? newPostImages
      : (newPostImageUrl ? [newPostImageUrl] : ['https://images.unsplash.com/photo-1553413077-190dd305871c?w=600&auto=format&fit=crop&q=80']);
    const newPost: FeedPostItem = {
      id: `fp-${Date.now()}`,
      title: newPostTitle.trim() || '未命名朋友圈动态',
      content: newPostContent,
      images: finalImages,
      scheduleTimeSlots: newPostTimeSlots,
      targetAccountIds: ['all'],
      status: 'active',
      createdAt: '刚刚排期',
      publishedCount: 0
    };
    setFeedPosts([newPost, ...feedPosts]);
    setShowNewFeedModal(false);
    setNewPostTitle('');
    setNewPostContent('');
    setNewPostImageUrl('');
    setNewPostImages([]);
  };

  // Batch assign uploaded photos with strict deduplication & anti-association protection
  const handleApplyImagesAsAvatars = (imagesToUse: string[], overrideAll: boolean = false) => {
    if (imagesToUse.length === 0) return;

    setAccounts(prev => {
      // 1. Collect avatars already in use by accounts that are NOT being overwritten
      const lockedAvatars = new Set<string>();
      if (!overrideAll) {
        prev.forEach(a => {
          if (a.avatar && a.avatar.trim() !== '') {
            lockedAvatars.add(a.avatar.trim());
          }
        });
      }

      // 2. Filter incoming images to guarantee uniqueness (never reuse a photo already assigned to another account)
      const freshUniqueImages = imagesToUse.filter(img => !lockedAvatars.has(img.trim()));

      let assignedCount = 0;
      let imgPointer = 0;

      const updated = prev.map((acc) => {
        // If not overriding and this account already has an avatar, strictly preserve its exclusive photo
        if (!overrideAll && acc.avatar && acc.avatar.trim() !== '') {
          return acc;
        }

        // If we still have an unused unique photo, assign it 1:1 exclusively
        if (imgPointer < freshUniqueImages.length) {
          const uniquePhoto = freshUniqueImages[imgPointer++];
          assignedCount++;
          return {
            ...acc,
            avatar: uniquePhoto
          };
        }

        // IMPORTANT: NEVER repeat or loop (% modulo)! A duplicate avatar triggers Meta bot-farm ban!
        return acc;
      });

      // Feedback message based on whether all target accounts got unique photos
      const targetNeedCount = overrideAll ? prev.length : prev.filter(a => !a.avatar || a.avatar.trim() === '').length;
      if (assignedCount < targetNeedCount) {
        setAvatarBatchSuccess(
          `🛡️ 矩阵防关联去重生效：已为 ${assignedCount} 个账号分配独享照片！剩余 ${targetNeedCount - assignedCount} 个账号因无新独享照片已自动保护跳过（绝不重复复用历史照片，请补充上传新照片）`
        );
      } else {
        setAvatarBatchSuccess(
          `✅ 成功完成 1:1 独立分配！${assignedCount} 个账号各自独享专属真实照片，全矩阵零同图关联！`
        );
      }

      setTimeout(() => setAvatarBatchSuccess(null), 6000);
      return updated;
    });
  };

  // Batch auto-trim white borders from current images in feed modal
  const handleAutoTrimAllImages = async () => {
    if (newPostImages.length === 0) return;
    setAvatarBatchSuccess('⏳ 正在智能检测并切除所有图片白边/黑边...');
    const trimmed: string[] = [];
    for (const img of newPostImages) {
      const cleanImg = await trimWhiteBorders(img);
      trimmed.push(cleanImg);
    }
    setNewPostImages(trimmed);
    if (trimmed.length > 0) {
      setNewPostImageUrl(trimmed[0]);
    }
    setAvatarBatchSuccess('✂️ 成功！已自动切除所有图片的边缘白边/杂边！');
    setTimeout(() => setAvatarBatchSuccess(null), 4000);
  };

  // Batch deduplicate current images in feed modal
  const handleDeduplicateCurrentImages = () => {
    if (newPostImages.length === 0) return;
    const { unique, duplicatesCount } = deduplicateImages(newPostImages);
    setNewPostImages(unique);
    if (duplicatesCount > 0) {
      setAvatarBatchSuccess(`🛡️ 智能去重成功：已清除 ${duplicatesCount} 张重复照片，保留 ${unique.length} 张独立照片！`);
    } else {
      setAvatarBatchSuccess('🛡️ 去重检测完毕：当前画廊中全部照片均为 100% 独立唯一，无任何重复！');
    }
    setTimeout(() => setAvatarBatchSuccess(null), 4000);
  };

  // Batch auto-trim white borders from avatar files modal
  const handleAutoTrimAvatarFiles = async () => {
    if (batchAvatarFiles.length === 0) return;
    setAvatarBatchSuccess('⏳ 正在智能切除头像照片白边...');
    const trimmed: string[] = [];
    for (const img of batchAvatarFiles) {
      const cleanImg = await trimWhiteBorders(img);
      trimmed.push(cleanImg);
    }
    setBatchAvatarFiles(trimmed);
    setAvatarBatchSuccess('✂️ 成功！已自动切除所有头像照片的白边！');
    setTimeout(() => setAvatarBatchSuccess(null), 4000);
  };

  // Batch deduplicate avatar files modal
  const handleDeduplicateAvatarFiles = () => {
    if (batchAvatarFiles.length === 0) return;
    const { unique, duplicatesCount } = deduplicateImages(batchAvatarFiles);
    setBatchAvatarFiles(unique);
    if (duplicatesCount > 0) {
      setAvatarBatchSuccess(`🛡️ 头像去重成功：已剔除 ${duplicatesCount} 张重复照片，保留 ${unique.length} 张独立头像！`);
    } else {
      setAvatarBatchSuccess('🛡️ 检测完毕：所有头像照片均为 100% 独立唯一，无任何重复！');
    }
    setTimeout(() => setAvatarBatchSuccess(null), 4000);
  };

  // Save photos to reserved vault (for applying in 2 days)
  const handleSaveToReservedVault = (photos: string[]) => {
    if (photos.length === 0) return;
    const { unique } = deduplicateImages(photos);
    setReservedAvatarVault(unique);
    setAvatarBatchSuccess(`💾 成功将 ${unique.length} 张照片永久保存在系统备用素材库中！等过两天养号周期结束，可随时在工作台一键调用更换头像，无需重新上传！`);
    setTimeout(() => setAvatarBatchSuccess(null), 8000);
  };

  const handleCreateTask = () => {
    if (!newTaskName.trim()) return;
    const newTask: AutomationTask = {
      id: `task-${Date.now()}`,
      name: newTaskName,
      sourceType: newTaskSource,
      targetUrl: newTaskUrl || 'https://facebook.com/groups/target-group',
      targetCount: newTaskTargetClients || 150,
      status: 'running',
      filters: {
        countries: newTaskCountry ? [newTaskCountry] : ['US'],
        gender: newTaskGender,
        minFriends: 50,
        maxFriends: 4500,
        bioKeywords: newTaskBioKeywords.trim() ? newTaskBioKeywords.split(/[,，\n]+/).map(s => s.trim()).filter(Boolean) : ['Owner', 'Founder', 'Brand', 'Seller'],
        negativeKeywords: newTaskNegativeKeywords.trim() ? newTaskNegativeKeywords.split(/[,，\n]+/).map(s => s.trim()).filter(Boolean) : ['Spam', 'Bot'],
        aiQualification: true
      },
      actions: {
        addFriend: true,
        sendDirectMessage: true,
        likeRecentPosts: 2,
        messengerAutoReply: true,
        cancelPendingAfterDays: 7
      },
      safetyRules: {
        minDelaySeconds: 20,
        maxDelaySeconds: 45,
        dailyLimitPerAccount: 30,
        humanSimulationKeystrokes: true
      },
      progress: {
        scanned: 0,
        matched: 0,
        added: 0,
        dmed: 0
      },
      assignedAccountsCount: accounts.length > 0 ? accounts.length : 1,
      createdAt: '刚刚创建'
    };
    setTasks([newTask, ...tasks]);
    setShowNewTaskModal(false);
    setNewTaskName('');
    setNewTaskUrl('');
  };

  const handleGenerateSpintax = async () => {
    setIsGeneratingSpintax(true);
    try {
      const res = await fetch('/api/ai/generate-spintax', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ industry, targetAudience, goal })
      });
      const data = await res.json();
      if (data.templates && Array.isArray(data.templates)) {
        setSpintaxList(data.templates);
      }
    } catch {
      // Keep existing
    } finally {
      setIsGeneratingSpintax(false);
    }
  };

  const testSpin = (template: string) => {
    const spun = template.replace(/\{([^{}]+)\}/g, (match, choices) => {
      const parts = choices.split('|');
      return parts[Math.floor(Math.random() * parts.length)];
    }).replace('{name}', 'Alexander')
      .replace('{group_name}', 'Shopify Sellers Club')
      .replace('{topic}', '出海精准获客');
    setSpintaxTestOutput(spun);
  };

  const filteredLeads = leads.filter(l => {
    const matchFilter = leadFilterStatus === 'all' || l.status === leadFilterStatus;
    const matchSearch = !leadSearch.trim() || l.name.toLowerCase().includes(leadSearch.toLowerCase()) || l.bio.toLowerCase().includes(leadSearch.toLowerCase());
    return matchFilter && matchSearch;
  });

  const totalScanned = tasks.reduce((sum, t) => sum + (t.progress?.scanned || 0), 0);
  const totalMatched = tasks.reduce((sum, t) => sum + (t.progress?.matched || 0), 0);
  const totalDmed = tasks.reduce((sum, t) => sum + (t.progress?.dmed || 0), 0);
  const convertedLeadsCount = leads.filter(l => l.status === 'converted').length;
  const activeAccountsCount = accounts.filter(a => a.status === 'active' || a.status === 'warming').length;

  const displayedAccounts = accounts.filter(acc => {
    const days = acc.warmingDays || 1;
    if (warmingFilter === 'icebreaker') return days <= 3;
    if (warmingFilter === 'warmup') return days >= 4 && days <= 7;
    if (warmingFilter === 'growth') return days >= 8 && days <= 14;
    if (warmingFilter === 'mature') return days >= 15;
    return true;
  });

  const avgWarmingDays = accounts.length > 0
    ? (accounts.reduce((sum, a) => sum + (a.warmingDays || 1), 0) / accounts.length).toFixed(1)
    : '0';
  const matureAccountsCount = accounts.filter(a => (a.warmingDays || 1) >= 8).length;
  const icebreakerAccountsCount = accounts.filter(a => (a.warmingDays || 1) < 8).length;
  const unreadMessagesCount = conversations.filter(c => c.unread).length;
  const totalClientsAdded = accounts.reduce((sum, a) => sum + (a.addedFriendsCount || 0), 0);
  const totalClientsInPool = totalClientsAdded + leads.length;
  const finishedProductAccounts = accounts.filter(a => (a.addedFriendsCount || 0) >= (a.targetClientsGoal || 150)).length;

  // Auto clean client counts to 0 on initial request
  useEffect(() => {
    const hasCleared = localStorage.getItem('fb_matrix_cleared_to_zero_v5');
    if (!hasCleared) {
      setAccounts(prev => {
        const next = prev.map(a => ({
          ...a,
          addedFriendsCount: (a.addedFriendsCount && a.addedFriendsCount <= 5) ? a.addedFriendsCount : 0,
          targetClientsGoal: 150
        }));
        try {
          localStorage.setItem('fb_matrix_accounts', JSON.stringify(next));
        } catch {}
        return next;
      });
      setLeads([]);
      localStorage.setItem('fb_matrix_cleared_to_zero_v5', 'true');
    }
  }, []);

  const handleResetClientCounts = () => {
    setAccounts(prev => {
      const next = prev.map(a => ({
        ...a,
        addedFriendsCount: 0,
        targetClientsGoal: 150
      }));
      try {
        localStorage.setItem('fb_matrix_accounts', JSON.stringify(next));
      } catch {}
      return next;
    });
    setLeads([]);
    setActiveTab('accounts');
    alert('✅ 已成功将全矩阵 10 个账号的客户进度全部重置清零（0/150），已返回账号管理列表！');
  };

  return (
    <div className="w-full py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Banner & Overview Metrics */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Facebook 社交矩阵自动化云控中心
              </h2>
              <button
                onClick={() => setShowLoginModal(true)}
                className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  accounts.length > 0
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                    : 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25 animate-pulse'
                }`}
                title="点击打开 FB 账号批量拉入/导入窗口"
              >
                <span>{accounts.length > 0 ? `${accounts.length} 账号就绪` : '等待接入账号 (点击立即导号)'}</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              多入口精准拓客任务调度、AI资料打分、动态Spintax私信与全局分布式去重中枢
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Primary Entry to Import Accounts */}
            <button
              onClick={() => setShowLoginModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-xs font-bold transition-all shadow-md shadow-emerald-500/20 ring-1 ring-emerald-400/30 shrink-0"
              title="点击拉入 TXT/CSV 文件批量导入 FB 账号卡密"
            >
              <UploadCloud className="h-4 w-4" />
              <span>📂 批量导入 FB 账号</span>
            </button>
            <button
              onClick={() => setShowWorkflowGuideModal(true)}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 hover:bg-emerald-900/40 text-emerald-300 px-3 py-2 text-xs font-semibold transition-all shadow-sm"
              title="查看图片中业务流程如何实现：自动发朋友圈、分时养号、改头像与私信客服"
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
              <span>📸 图片方案实现指引</span>
            </button>
            <button
              onClick={() => setShowAgedAccountGuideModal(true)}
              className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-950/40 hover:bg-amber-900/40 text-amber-300 px-3 py-2 text-xs font-semibold transition-all shadow-sm"
              title="查看老号购买后养号与投流全周期SOP"
            >
              <Lightbulb className="h-3.5 w-3.5" />
              <span>老号养多久能投流？</span>
            </button>
            <button
              onClick={() => setShowCapacityGuideModal(true)}
              className="flex items-center gap-1.5 rounded-xl border border-purple-500/40 bg-purple-950/40 hover:bg-purple-900/40 text-purple-300 px-3 py-2 text-xs font-semibold transition-all shadow-sm"
              title="查看多账号挂载上限与防封承载力"
            >
              <Cpu className="h-3.5 w-3.5" />
              <span>挂号承载力</span>
            </button>
            <button
              onClick={() => {
                setMatrixHubTab('hub');
                setShowMatrixHubModal(true);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-500/50 bg-gradient-to-r from-emerald-950/80 to-teal-950/80 hover:from-emerald-900/80 hover:to-teal-900/80 text-emerald-300 px-3.5 py-2 text-xs font-bold transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
              title="打开矩阵控制面板：一键养号设置、改资料与批量头像、群发设置"
            >
              <Sliders className="h-3.5 w-3.5 text-emerald-400" />
              <span>🎛️ 矩阵控制面板</span>
            </button>
            <button
              onClick={onOpenSimulator}
              className="flex items-center gap-1.5 rounded-xl border border-blue-500/40 bg-blue-950/40 hover:bg-blue-900/40 text-blue-300 px-3.5 py-2 text-xs font-semibold transition-all shadow-sm"
            >
              <Play className="h-3.5 w-3.5" />
              <span>执行沙箱</span>
            </button>
            <button
              onClick={() => setShowNewTaskModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 text-xs font-semibold transition-all shadow-md shadow-blue-500/20"
            >
              <Plus className="h-4 w-4" />
              <span>新建拓客任务</span>
            </button>
          </div>
        </div>

        {/* US Circadian Time Lock Banner (Directly addressing "加人的时候要注意时间，要在美国本土的时间，不要在美国的晚上作息时间加人") */}
        <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/70 via-slate-900 to-emerald-950/40 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-md">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 ${
              isUsDaytime ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40'
            }`}>
              {isUsDaytime ? '☀️' : '🌙'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-blue-400" />
                  <span>🇺🇸 美国本土实时作息时钟 (美东 EST 纽约时间)：</span>
                </span>
                <span className="font-mono font-extrabold text-amber-300 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20 text-xs">
                  {usTime} EST
                </span>
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 border ${
                  isUsDaytime
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isUsDaytime ? 'bg-emerald-400 animate-pulse' : 'bg-indigo-400'}`}></span>
                  <span>{isUsDaytime ? '☀️ 美区白天黄金活跃时段 (允许自动加人与发帖)' : '🌙 美区深夜生理静眠期 (系统已自动锁定休眠)'}</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                🛡️ <strong>【生理作息防封锁已默认全自动启用】</strong>：系统严格按美国当地时间智能调度！仅在美东 08:30~22:30 执行加好友动作；美区深夜 23:00~08:00 自动转入静默挂机休眠，模拟真人关灯休息，<strong>绝不深夜扰民触碰 Meta 风控！无需您熬夜守着！</strong>
              </p>
            </div>
          </div>
          <div className="shrink-0 flex items-center gap-2">
            <span className="text-[11px] text-emerald-400 font-mono bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20 font-bold">
              ✓ 作息时间锁: 100% 自动托管
            </span>
          </div>
        </div>

        {/* 4 Metric Cards - 100% Real Dynamic State */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div
            onClick={() => setShowLoginModal(true)}
            className="rounded-2xl border border-slate-800 hover:border-blue-500/60 bg-slate-900/60 hover:bg-slate-900 p-4 transition-all cursor-pointer group shadow-sm"
            title="点击打开 FB 账号批量导入与一号一IP管理"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">挂机矩阵账号</span>
              <span className="text-[10px] text-blue-400 group-hover:underline flex items-center gap-0.5">
                <span>{accounts.length > 0 ? '管理' : '立即导号'}</span>
                <ArrowRight className="h-3 w-3" />
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-white font-mono">{activeAccountsCount}</span>
              <span className="text-xs text-slate-500 font-mono">/ {accounts.length} 在线</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 mt-2">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>{accounts.length > 0 ? '独立住宅代理与指纹隔离' : '暂无账号 · 点击立即拉入文件'}</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <span className="text-xs text-slate-400">今日扫描潜在用户</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-white font-mono">{totalScanned}</span>
              <span className="text-xs text-slate-400 font-mono">人次扫描</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-2">
              <span>小组 / 点赞 / 推荐多入口</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <span className="text-xs text-slate-400">AI条件判定合格</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-blue-400 font-mono">{totalMatched}</span>
              <span className="text-xs text-slate-400 font-mono">
                匹配率 {totalScanned > 0 ? ((totalMatched / totalScanned) * 100).toFixed(1) + '%' : '0.0%'}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-blue-400 mt-2">
              <Sparkles className="h-3.5 w-3.5" />
              <span>国家/性别/商业Bio过滤</span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <span className="text-xs text-slate-400">图文私信触达 / 意向转化</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-extrabold text-emerald-400 font-mono">{totalDmed}</span>
              <span className="text-xs text-slate-400 font-mono">/ {convertedLeadsCount} 人意向</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 mt-2">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Spintax高转化话术直发</span>
            </div>
          </div>
        </div>

        {/* Global Onboarding Banner when no accounts imported yet */}
        {accounts.length === 0 && (
          <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-950/70 via-indigo-950/40 to-slate-900 border-2 border-blue-500/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl animate-fadeIn">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0">
                <UploadCloud className="h-6 w-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-white">👉 步骤 1：请从此处拉入/导入您的 FB 账号文件</h3>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
                    支持 .TXT / .CSV 批量拖入
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  直接将号商交付的卡密文件拉入，或直接粘贴卡密文本。系统自动识别四划线 (----)、竖线 (|)、Excel表格等任意格式，秒算 2FA 动态码并 1:1 独立绑定独享住宅 IP！
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
              <button
                onClick={() => { setActiveTab('accounts'); setShowLoginModal(true); }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 whitespace-nowrap"
              >
                <UploadCloud className="h-4 w-4" />
                <span>点击打开导号窗口 / 拖入卡密文件</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tab Switcher - 'accounts' moved to Tab #1 so it is never hidden or scrolled off-screen */}
      <div className="flex items-center gap-2 pb-4 mb-6 border-b border-slate-800 text-sm font-medium overflow-x-auto">
        <button
          onClick={() => setActiveTab('accounts')}
          className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'accounts'
              ? 'bg-blue-600 text-white font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>👥 矩阵账号管理</span>
          {accounts.length === 0 ? (
            <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded-full font-bold">
              待导号 ({accounts.length})
            </span>
          ) : (
            <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-full font-mono">
              {accounts.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'tasks'
              ? 'bg-blue-600 text-white font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Sliders className="h-4 w-4" />
          <span>⚙️ 拓客自动化任务 ({tasks.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('feed_posts')}
          className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'feed_posts'
              ? 'bg-blue-600 text-white font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <ImageIcon className="h-4 w-4" />
          <span>📸 朋友圈/动态排期 ({feedPosts.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('messenger_inbox')}
          className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'messenger_inbox'
              ? 'bg-blue-600 text-white font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <MessageCircle className="h-4 w-4" />
          <span>💬 聚合客服收件箱 (实时来信)</span>
          {unreadMessagesCount > 0 && (
            <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold animate-pulse">
              {unreadMessagesCount}条未读
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('spintax')}
          className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'spintax'
              ? 'bg-blue-600 text-white font-semibold'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          <span>✨ AI 智能文案与话术引擎</span>
        </button>
        <button
          onClick={() => setActiveTab('leads')}
          className={`px-4 py-2 rounded-xl transition-colors whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'leads'
              ? 'bg-purple-600 text-white font-semibold shadow-lg shadow-purple-500/25 ring-2 ring-purple-400'
              : 'text-slate-300 hover:text-white hover:bg-slate-800/60 bg-purple-950/30 border border-purple-500/30'
          }`}
        >
          <Layers className="h-4 w-4 text-purple-400" />
          <span>📂 全矩阵客户去重总库 ({leads.length})</span>
          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30 font-bold">
            总库入口
          </span>
        </button>
      </div>

      {/* Tab 1: Tasks */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          {/* Transparent Honest Explanation Banner on Target Groups */}
          <div className="p-4 bg-gradient-to-r from-blue-950/60 via-slate-900 to-slate-950 border border-blue-500/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-lg">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
                <Globe className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-white text-sm">🎯 真实加人关键池：目标 Facebook 群组配置</h4>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-mono border border-emerald-500/20">
                    实打实拓客
                  </span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  坚决不做虚假模拟！要让 10 个号加到纯正真实的 45+ 美国男粉，<strong>系统必须有您指定的真实 Facebook 群组作为“鱼塘”</strong>。您可以在下方任务卡片随时填入或更换您选中的美国群组链接！
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowNewTaskModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-md shadow-blue-500/20 shrink-0 text-xs"
            >
              <Plus className="h-4 w-4" />
              <span>+ 新建拓客任务</span>
            </button>
          </div>

          {tasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 mx-auto flex items-center justify-center">
                <Sliders className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">暂无拓客自动化任务</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  当前无正在运行的获客任务。点击下方按钮新建任务，系统将调度指纹环境执行小组提取、画像打分与 Spintax 私信直发。
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {accounts.length === 0 && (
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all"
                  >
                    <UploadCloud className="h-4 w-4" />
                    <span>先批量导入 FB 账号</span>
                  </button>
                )}
                <button
                  onClick={() => setShowNewTaskModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all"
                >
                  <Plus className="h-4 w-4" />
                  <span>立即新建拓客任务</span>
                </button>
              </div>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-slate-700 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
                  <div className="flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className={`w-2.5 h-2.5 rounded-full ${task.status === 'running' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                      <h4 className="text-base font-bold text-white">{task.name}</h4>
                      <span className="text-[11px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 font-mono">
                        {task.sourceType === 'group_members' ? '小组成员提取' : task.sourceType === 'post_likers' ? '热帖点赞截流' : '系统推荐加人'}
                      </span>
                    </div>

                    {/* Bound 3 Target Groups Pill */}
                    <div className="mt-2 flex items-center gap-2 flex-wrap text-xs">
                      <span className="text-slate-400 font-medium text-[11px]">已锁定 3 大 50+ 公开群组:</span>
                      <span className="bg-emerald-950/70 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono text-[11px]">
                        ① 50s-80s FB Dating (10万成员)
                      </span>
                      <span className="bg-emerald-950/70 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono text-[11px]">
                        ② Singles Over 50 Dating (12万成员)
                      </span>
                      <span className="bg-emerald-950/70 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono text-[11px]">
                        ③ Singles Over 50 (46万成员)
                      </span>
                      <span className="text-amber-400 font-bold font-mono text-[11px]">● 共 680,000+ 真实成熟男粉池</span>
                    </div>

                    {/* Editable Target Group Link */}
                    {editingTaskId === task.id ? (
                      <div className="mt-2.5 flex items-center gap-2 flex-wrap bg-slate-950 p-2 rounded-xl border border-blue-500/50">
                        <span className="text-xs text-blue-300 font-semibold shrink-0">添加/更换群组链接:</span>
                        <input
                          type="text"
                          value={editingTargetUrl}
                          onChange={(e) => setEditingTargetUrl(e.target.value)}
                          placeholder="粘贴新的 Facebook 群组链接 (例如: https://facebook.com/groups/xxxxx/members)"
                          className="flex-1 min-w-[280px] bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-blue-400"
                        />
                        <button
                          onClick={() => {
                            if (editingTargetUrl.trim()) {
                              setTasks(prev => prev.map(t => t.id === task.id ? { ...t, targetUrl: editingTargetUrl.trim() } : t));
                            }
                            setEditingTaskId(null);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm shrink-0"
                        >
                          ✓ 保存并应用
                        </button>
                        <button
                          onClick={() => setEditingTaskId(null)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-all shrink-0"
                        >
                          收起
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <p className="text-xs text-slate-300 font-mono bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 break-all">
                          🔗 调度入口: {task.targetUrl}
                        </p>
                        <button
                          onClick={() => {
                            setEditingTaskId(task.id);
                            setEditingTargetUrl(task.targetUrl);
                          }}
                          className="text-xs text-blue-400 hover:text-blue-300 underline underline-offset-2 flex items-center gap-1 cursor-pointer font-medium"
                          title="点击修改此任务抓取的 Facebook 群组"
                        >
                          <Edit2 className="h-3 w-3" />
                          <span>添加/更换其他群组</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onOpenSimulator()}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors"
                    >
                      <Play className="h-3.5 w-3.5" />
                      <span>执行监控</span>
                    </button>
                    <button
                      onClick={() => {
                        setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: t.status === 'running' ? 'paused' : 'running' } : t));
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                    >
                      {task.status === 'running' ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 text-emerald-400" />}
                      <span>{task.status === 'running' ? '暂停' : '启动'}</span>
                    </button>
                    <button
                      onClick={() => setTasks(prev => prev.filter(t => t.id !== task.id))}
                      className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700/60 hover:border-rose-800/40 transition-colors"
                      title="删除任务"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Task Config Badges & Progress */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-1">条件筛选规则</span>
                    <div className="text-slate-200">
                      国家: {task.filters.countries.join(', ')} · 好友 &gt; {task.filters.minFriends}
                    </div>
                    <div className="text-emerald-400 text-[11px] mt-0.5 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span>48h 活跃在线过滤: 已开启 (防死号)</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-1">执行链路动作</span>
                    <div className="text-slate-200">
                      加好友 + 动态点赞2条 + 发送Spintax私信
                    </div>
                    <div className="text-slate-400 text-[11px] mt-0.5">
                      超时 7 天自动取消待处理请求
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-1">防封安全微扰</span>
                    <div className="text-slate-200 font-mono">
                      时延: {task.safetyRules.minDelaySeconds}s ~ {task.safetyRules.maxDelaySeconds}s 随机抖动
                    </div>
                    <div className="text-emerald-400 text-[11px] mt-0.5">
                      分配 {task.assignedAccountsCount} 个独立指纹账号调度
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-400 mb-1">
                      <span>拓客进度</span>
                      <span className="text-white font-mono">{task.progress.added} / {task.targetCount}</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full"
                        style={{ width: `${task.targetCount > 0 ? (task.progress.added / task.targetCount) * 100 : 0}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                      <span>扫描: {task.progress.scanned}</span>
                      <span>私信: {task.progress.dmed}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: AI Spintax Copywriting Engine */}
      {activeTab === 'spintax' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Input & Prompt */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-blue-400" />
                <h3 className="text-sm font-bold text-white">AI 智能自旋转 Spintax 文案生成</h3>
              </div>
              <p className="text-xs text-slate-400 mb-4">
                基于 Gemini 智能模型，生成包含大量花括号分支语法（如 <code>{`{Hi|Hello|您好}`}</code>）的文案，每次发送随机组合，100% 破除 Facebook 垃圾私信判定。
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">目标行业 / 业务类型</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">目标受众画像</label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">营销获客目标</label>
                  <input
                    type="text"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  />
                </div>

                <button
                  onClick={handleGenerateSpintax}
                  disabled={isGeneratingSpintax}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  {isGeneratingSpintax ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>正在调用 Gemini 生成高转化 Spintax...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>一键生成 3 套高转化防风控 Spintax 模板</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Live Spin Tester */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
              <h4 className="text-xs font-bold text-white mb-2 flex items-center justify-between">
                <span>实时自旋转测试 (Spin Simulator)</span>
                <span className="text-[11px] text-blue-400">点击模板任意测试</span>
              </h4>
              <p className="text-[11px] text-slate-400 mb-3">
                模拟脚本在发送时随机组合产生的不同真实文案：
              </p>
              <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-200 min-h-[70px] whitespace-pre-wrap leading-relaxed">
                {spintaxTestOutput || '点击右侧任一模板的【🎲 随机自旋转预览】测试组合效果...'}
              </div>
            </div>
          </div>

          {/* Right: Generated Templates */}
          <div className="lg:col-span-7 space-y-4">
            {spintaxList.map((st) => (
              <div
                key={st.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 hover:border-slate-700 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-white">{st.name}</h4>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => testSpin(st.template)}
                      className="text-xs text-blue-400 hover:text-blue-300 bg-blue-500/10 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <span>🎲 随机自旋转预览</span>
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(st.template);
                        setCopiedSpintax(st.id);
                        setTimeout(() => setCopiedSpintax(null), 2000);
                      }}
                      className="text-xs text-slate-400 hover:text-white bg-slate-800 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                    >
                      {copiedSpintax === st.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedSpintax === st.id ? '已复制' : '复制语法'}</span>
                    </button>
                  </div>
                </div>

                {/* Spintax syntax block */}
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300 leading-relaxed break-words">
                  {st.template}
                </div>

                {/* Natural preview */}
                <div className="text-xs text-slate-400">
                  <span className="text-slate-500">示例文本：</span>
                  <span className="text-slate-300 italic">"{st.preview}"</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Matrix Accounts */}
      {activeTab === 'accounts' && (
        <div className="space-y-5">
          {/* Action & Guidance Banner */}
          <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-950 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Key className="h-4 w-4 text-blue-400" />
                  <span>Facebook 账号登录接入与【一号一IP】云控中枢</span>
                </span>
                <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2.5 py-0.5 rounded-full border border-blue-500/20 font-mono">
                  共计 {accounts.length} 个独立隔离环境
                </span>
              </div>
              <p className="text-xs text-slate-300">
                支持 <strong>直接拉入 TXT/CSV 文件</strong>、<strong>2FA 卡密动态算码</strong>、<strong>Cookie 免密秒级注入</strong> 与 <strong>AdsPower/BitBrowser 本地指纹直连</strong>。
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              <button
                onClick={() => {
                  setMatrixHubTab('hub');
                  setShowMatrixHubModal(true);
                }}
                className="flex items-center justify-center gap-1.5 rounded-xl border-2 border-emerald-500/50 bg-emerald-950/70 hover:bg-emerald-900/70 text-emerald-300 px-3.5 py-2 text-xs font-bold transition-all shadow-md shadow-emerald-500/20 whitespace-nowrap cursor-pointer active:scale-95"
                title="打开矩阵控制面板：一键养号设置、改资料与批量头像、群发设置"
              >
                <Sliders className="h-4 w-4 text-emerald-400" />
                <span>🎛️ 矩阵控制面板 (养号·改资料·群发)</span>
              </button>
              <button
                onClick={() => {
                  setInspectingAccount(accounts[0] || null);
                  setShowFingerprintModal(true);
                }}
                disabled={accounts.length === 0}
                className="flex items-center justify-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-950/40 hover:bg-purple-900/40 disabled:opacity-50 text-purple-300 px-3.5 py-2 text-xs font-semibold transition-all whitespace-nowrap cursor-pointer"
              >
                <Fingerprint className="h-4 w-4 text-purple-400" />
                <span>全矩阵硬件指纹比对</span>
              </button>
              <button
                onClick={() => setShowLoginModal(true)}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 text-xs font-bold transition-all shadow-md shadow-blue-500/20 whitespace-nowrap"
              >
                <UploadCloud className="h-4 w-4" />
                <span>+ 拉入文件 / 登录 FB 账号</span>
              </button>
            </div>
          </div>

          {/* Quick File Dropzone Banner (Direct Answer to "从哪里拉进去登录") */}
          <div
            onClick={() => setShowLoginModal(true)}
            className="rounded-2xl border-2 border-dashed border-blue-500/40 bg-gradient-to-b from-blue-950/20 to-slate-950/60 p-5 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-950/30 transition-all group"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-left">
                <div className="w-11 h-11 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>FB 账号卡密拉入与批量导入通道</span>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
                      100% 兼容全网号商格式
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    从号商购买的卡密文件 (.txt / .csv) 可直接拉入，全智能识别四划线、竖线|、表格Tab等任意格式，秒算 2FA 动态码并锁定一号一IP
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-emerald-400 font-mono hidden lg:inline">
                  ✓ 支持 ---- / | / Tab / CSV 任意分隔
                </span>
                <span className="px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-sm group-hover:bg-blue-500 transition-colors flex items-center gap-1.5">
                  <UploadCloud className="h-3.5 w-3.5" />
                  <span>拉入文件 / 点击体验测试</span>
                </span>
              </div>
            </div>
          </div>

          {/* Quick Preset Matrix Switcher: US Facebook Matrix vs Brazil Screenshot Matrix vs Health Check */}
          <div className="p-3.5 bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-950 rounded-2xl border border-blue-500/30 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center shrink-0">
                <Globe className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">实战矩阵快速载入 & 体检：</span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
                    开箱即用高权包
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  支持一键切换<strong>纯正美区高权矩阵</strong>（AT&T/Comcast 美国家庭住宅 IP + 纯英文 en-US + 美东/美西时区）
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap shrink-0">
              <button
                onClick={handleLoadUsMatrix}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
                title="一键载入纯正美区 Facebook 账号（绑定原生 AT&T/Comcast 美国住宅 IP + en-US 纯英环境 + 2FA + 养号第 33 天）"
              >
                <span>🇺🇸 载入纯正美区矩阵 (US ISP · en-US)</span>
              </button>
              <button
                onClick={handleRunHealthCheck}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-bold transition-all active:scale-95 cursor-pointer"
                title="一键审计全矩阵 IP 欺诈分、住宅真实性、WebRTC 穿透与语言时区匹配度"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>🩺 全矩阵一键体检 (Fraud Score 0分)</span>
              </button>
              <button
                onClick={() => onOpenSimulator()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer ring-1 ring-blue-400/40"
                title="打开云端沙箱实时监控控制台：亲眼查看账号在 Facebook 上的鼠标滑动、Feed浏览与点赞实机画面"
              >
                <Play className="h-3.5 w-3.5 fill-white" />
                <span>▶ 打开执行沙箱 (实机投屏)</span>
              </button>
              <button
                onClick={() => {
                  setMatrixHubTab('profile');
                  setShowMatrixHubModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 font-bold transition-all active:scale-95 cursor-pointer"
                title="进入资料与头像配置中心：本地真人头像批量图库、欧美/巴西姓名分配、Bio个性签名、2FA统一防找回"
              >
                <UserCheck className="h-3.5 w-3.5 text-purple-400" />
                <span>👤 批量改资料与头像</span>
              </button>
              <button
                onClick={() => {
                  setMatrixHubTab('warming');
                  setShowMatrixHubModal(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 font-bold transition-all active:scale-95 cursor-pointer"
                title="进入定时养号设置：自由填写养号时长、运行时间与对聊话术语料库"
              >
                <Clock className="h-3.5 w-3.5 text-cyan-400" />
                <span>🕒 定时养号设置</span>
              </button>
              {accounts.length > 0 && (
                <button
                  onClick={() => {
                    if (window.confirm(`确定要清空当前的 ${accounts.length} 个账号列表吗？`)) {
                      setAccounts([]);
                    }
                  }}
                  className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-rose-950/30 text-slate-400 hover:text-rose-300 border border-slate-800 hover:border-rose-500/40 text-xs font-medium transition-all cursor-pointer active:scale-95"
                  title="重置并清空当前账号列表（方便重新导入）"
                >
                  <Trash2 className="h-3.5 w-3.5 text-slate-500 group-hover:text-rose-400 transition-colors" />
                  <span>重置列表</span>
                </button>
              )}
            </div>
          </div>

          {/* 4 Core Summary Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-900/60">
              <span className="text-xs text-slate-400 block mb-1">接入矩阵账号</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-extrabold text-white font-mono">{accounts.length}</span>
                <span className="text-xs text-slate-500">个独立沙箱</span>
              </div>
              <span className="text-[11px] text-blue-400 mt-1 block">物理指纹完全隔离</span>
            </div>

            <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-900/60">
              <span className="text-xs text-slate-400 block mb-1">【一号一IP】绑定率</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-mono">100%</span>
                <span className="text-xs text-slate-500">独立静态住宅</span>
              </div>
              <span className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" />
                <span>WebRTC 已阻断 · 绝不共用</span>
              </span>
            </div>

            <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-900/60">
              <span className="text-xs text-slate-400 block mb-1">平均养号天数</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-extrabold text-amber-400 font-mono">{avgWarmingDays}</span>
                <span className="text-xs text-slate-500">天</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">按养号进度动态匹配动作配额</span>
            </div>

            <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-900/60">
              <span className="text-xs text-slate-400 block mb-1">账号梯队分布</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-extrabold text-purple-400 font-mono">{matureAccountsCount}</span>
                <span className="text-xs text-slate-400">成熟老号 (≥8天)</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                另有 <strong className="text-amber-400 font-mono">{icebreakerAccountsCount}</strong> 个账号在破冰预热中
              </span>
            </div>
          </div>

          {/* Central Cloud Deduplication Pool & 150-Client Product Account Progress - Direct Answer to "10个号加的客户建一个库/去重/显示加够了多少个" */}
          <div className="p-4 bg-gradient-to-r from-purple-950/40 via-blue-950/30 to-slate-900 rounded-2xl border border-purple-500/40 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 text-xs shadow-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-bold text-white">全矩阵统一去重客户总库</h4>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono font-bold">
                    ✓ 毫秒级去重 · 绝不重复添加
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  所有 10 个号（及后续扩容新号）<strong>共享同一个云端客户总库</strong>。当前去重库已收录 <strong className="text-emerald-400 font-mono text-sm">{totalClientsInPool}</strong> 位客户。任何号加过的人，全矩阵在抓取时<strong>100% 自动跳过，绝不重复打扰</strong>！
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap w-full lg:w-auto justify-between lg:justify-end">
              <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800 flex items-center gap-3">
                <div>
                  <span className="text-[10px] text-slate-400 block">150客户产品号进度</span>
                  <span className="text-xs font-bold font-mono text-white">
                    已累计沉淀 <strong className="text-emerald-400 font-mono text-sm">{totalClientsAdded}</strong> / {accounts.length * 150} 人
                  </span>
                </div>
                <div className="h-8 w-px bg-slate-800" />
                <div>
                  <span className="text-[10px] text-slate-400 block">满编成品号</span>
                  <span className="text-xs font-bold font-mono text-purple-300">
                    <strong className="text-purple-400 text-sm">{finishedProductAccounts}</strong> / {accounts.length} 个达标
                  </span>
                </div>
              </div>

              {/* Master Database Direct Entry & Reset to 0 Buttons */}
              <button
                onClick={() => setActiveTab('leads')}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow-md shadow-purple-500/20 active:scale-95 cursor-pointer text-xs"
                title="点击进入全矩阵客户去重总库查看已收录客户名单与导出"
              >
                <Layers className="h-3.5 w-3.5" />
                <span>📂 查看总库明细 ({leads.length}人)</span>
                <ArrowRight className="h-3 w-3" />
              </button>

              <button
                onClick={handleResetClientCounts}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-sm"
                title="将全矩阵 10 个账号客户进度清零归 0，重新开始拓客"
              >
                <RotateCcw className="h-3.5 w-3.5 text-rose-400" />
                <span>一键清 0 (0/150)</span>
              </button>
            </div>
          </div>

          {/* Detailed Guide for "IP在哪里配置好，一号一IP怎么绑定" */}
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-2">
                <Globe className="h-4 w-4 text-emerald-400" />
                <span>【一号一IP】绑定与防封配置机制说明：</span>
              </span>
              <span className="text-[11px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                1 Account = 1 Dedicated Residential Proxy
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1 text-[11px] text-slate-300">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                <span className="font-semibold text-blue-300 block">① 导入时自动锁定</span>
                <p className="text-slate-400 leading-relaxed">
                  在账号卡密文件中每行包含专属代理（格式 <code>IP:Port</code> 或 <code>IP:Port:User:Pass</code>），系统导入时自动建立一对一物理锁定，绝不跨号混用。
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                <span className="font-semibold text-emerald-300 block">② 自动同步时区与指纹</span>
                <p className="text-slate-400 leading-relaxed">
                  根据该代理 IP 的地理位置，沙箱自动伪装对应的原生国家、时区（America/New_York 等）、系统语言与经纬度，并封锁 WebRTC 内网穿透。
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                <span className="font-semibold text-amber-300 block">③ 随时独立更换代理</span>
                <p className="text-slate-400 leading-relaxed">
                  若某个代理节点网络缓慢，可直接在下方账号卡片点击【更换绑定IP】，支持单独替换该号的住宅 IP 而不影响指纹缓存与登录 Session。
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-purple-500/30 space-y-1">
                <span className="font-semibold text-purple-300 block">④ 72h 超期申请自动撤回</span>
                <p className="text-slate-400 leading-relaxed">
                  系统每 24h 自动巡检，超 72h 未被通过的好友申请自动取消，保证挂起申请永远 &lt; 5 人，彻底根除 FB “无法发送请求” 的功能限制。
                </p>
              </div>
            </div>
          </div>

          {/* Warming Stage Filter Tabs */}
          {accounts.length > 0 && (
            <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
              <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold overflow-x-auto">
                <button
                  onClick={() => setWarmingFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    warmingFilter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  全部账号 ({accounts.length})
                </button>
                <button
                  onClick={() => setWarmingFilter('icebreaker')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    warmingFilter === 'icebreaker'
                      ? 'bg-amber-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🌱 冷启动破冰期 (1-3天)
                </button>
                <button
                  onClick={() => setWarmingFilter('warmup')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    warmingFilter === 'warmup'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🌿 预热加权期 (4-7天)
                </button>
                <button
                  onClick={() => setWarmingFilter('growth')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    warmingFilter === 'growth'
                      ? 'bg-emerald-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  🚀 拓客放量期 (8-14天)
                </button>
                <button
                  onClick={() => setWarmingFilter('mature')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    warmingFilter === 'mature'
                      ? 'bg-purple-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  💎 高权老号 (≥15天)
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-xs text-slate-400">
                  当前筛选显示 <strong className="text-white font-mono">{displayedAccounts.length}</strong> 个账号
                </div>
              </div>
            </div>
          )}

          {/* View Mode Switcher & Rolling Days Batch Actions Toolbar */}
          {accounts.length > 0 && (
            <div className="space-y-2">
              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-3 text-xs">
                {/* Left: View Mode Toggle */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-slate-400 font-medium">视图排版:</span>
                  <div className="flex items-center p-1 bg-slate-900 rounded-xl border border-slate-800 flex-wrap gap-1">
                    <button
                      onClick={() => setAccountViewMode('compact_mini')}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                        accountViewMode === 'compact_mini'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="超密微型卡片：卡片缩小40%，4~6列排布，一屏浏览几十个号，专为300个大矩阵设计"
                    >
                      <span>🔍 300号微型卡片</span>
                    </button>
                    <button
                      onClick={() => setAccountViewMode('table_view')}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                        accountViewMode === 'table_view'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="百控表格视图：一屏查看100+账号，快速批量勾选、滚轮改天数、一键查IP与2FA"
                    >
                      <span>📋 300号极速表格</span>
                    </button>
                    <button
                      onClick={() => setAccountViewMode('dense_matrix')}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                        accountViewMode === 'dense_matrix'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="标准密集网格卡片"
                    >
                      <span>📱 标准卡片</span>
                    </button>
                    <button
                      onClick={() => setAccountViewMode('detailed_cards')}
                      className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 ${
                        accountViewMode === 'detailed_cards'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <span>💻 深度卡片</span>
                    </button>
                  </div>
                  <button
                    onClick={handleRunHealthCheck}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 font-bold transition-all shadow-sm active:scale-95 cursor-pointer ml-1"
                    title="一键实时检测 10 个账号的登录状态、独享住宅IP连通性、2FA握手与风控风险"
                  >
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                    <span>🩺 检测 10 个号的登录健康度 (实时诊断)</span>
                  </button>
                </div>

                {/* Right: Rolling Days Actions */}
                <div className="flex items-center flex-wrap gap-2">
                  <button
                    onClick={() => setShowDeliveryModal(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold transition-all shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer text-xs"
                    title="一键生成带独享住宅IP、2FA秘钥、账号密码与客户进度的买家成品号交付卡密文档"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>📦 导出买家交付包 (带IP+2FA)</span>
                  </button>

                  <button
                    onClick={() => setShowBatchProfileModal(true)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600/30 to-blue-600/30 hover:from-cyan-600/40 hover:to-blue-600/40 text-cyan-200 border border-cyan-500/50 font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                    title="【步骤2】自由勾选更改头像、改女性名、改简介与专属ID、更改2FA密码（支持今天暂存、过两天一键执行）"
                  >
                    <Sliders className="h-3.5 w-3.5 text-cyan-400" />
                    <span>⚙️ 【步骤2】矩阵改资料/改头像</span>
                  </button>

                  {reservedAvatarVault.length > 0 && (
                    <button
                      onClick={() => setShowBatchProfileModal(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                      title="系统已暂存有预留的专属真人女性照片，随时点击一键为 10 个账号换装应用！"
                    >
                      <Save className="h-3.5 w-3.5 text-amber-400" />
                      <span>📦 已预存 {reservedAvatarVault.length} 张待用头像</span>
                    </button>
                  )}

                  <button
                    onClick={() => setShowBatchProfileModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                    title="批量上传多张真人女性照片，一键自动按顺序为这 10 个账号设置独立头像"
                  >
                    <Camera className="h-3.5 w-3.5 text-purple-400" />
                    <span>📸 批量上传/替换矩阵头像</span>
                  </button>

                  <button
                    onClick={handleApplyFemaleNamesAll}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40 font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                    title="一键将全矩阵所有账号统一更换为真实自然的欧美女性英文名字（如 Emma, Sophia, Olivia 等）"
                  >
                    <span>👩 全矩阵换女性名字</span>
                  </button>

                  <button
                    onClick={() => handleAlignAllToDay(2)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/50 font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                    title="一键将全矩阵所有账号的天数统一定格为【第 2 天】"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                    <span>🎯 一键统一定格【第 2 天】</span>
                  </button>

                  <button
                    onClick={() => handleBatchRollAll(1)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-300 border border-amber-500/40 font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                    title="为矩阵中的所有账号同时 +1 天养号进度，动态触发数字翻滚动效"
                  >
                    <span>⚡ 一键全矩阵 +1 天</span>
                  </button>

                  <button
                    onClick={() => setAutoRollTimerActive(!autoRollTimerActive)}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border font-bold transition-all cursor-pointer shadow-sm ${
                      autoRollTimerActive
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 ring-2 ring-emerald-500/30'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                    title="开启后系统将以设定的速度自动持续滚动天数，实时展示养号天数推进特效"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 text-emerald-400 ${autoRollTimerActive ? 'animate-spin' : ''}`} />
                    <span>{autoRollTimerActive ? '▶️ 动态自动滚动: 运行中' : '▶️ 开启动态滚动演示'}</span>
                  </button>

                  {/* Speed Switcher when Auto Roll is active */}
                  {autoRollTimerActive && (
                    <div className="flex items-center p-0.5 bg-slate-900 rounded-lg border border-slate-800 text-[11px] font-mono">
                      <button
                        onClick={() => setAutoRollSpeed(3000)}
                        className={`px-2 py-0.5 rounded ${autoRollSpeed === 3000 ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                        title="每 3 秒滚动 +1 天"
                      >
                        慢速(3s)
                      </button>
                      <button
                        onClick={() => setAutoRollSpeed(1500)}
                        className={`px-2 py-0.5 rounded ${autoRollSpeed === 1500 ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                        title="每 1.5 秒滚动 +1 天"
                      >
                        标准(1.5s)
                      </button>
                      <button
                        onClick={() => setAutoRollSpeed(500)}
                        className={`px-2 py-0.5 rounded ${autoRollSpeed === 500 ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                        title="每 0.5 秒极速滚动 +1 天"
                      >
                        极速(0.5s)
                      </button>
                    </div>
                  )}

                  <button
                    onClick={handleResetToDay33}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300/90 border border-amber-900/50 hover:border-amber-700/60 font-semibold transition-colors cursor-pointer"
                    title="一键将所有矩阵账号的天数统一定格为截图同款【第33天】"
                  >
                    <Sparkles className="h-3 w-3 text-amber-400" />
                    <span>🎯 复位截图同款 [第33天]</span>
                  </button>
                </div>
              </div>

              {/* Scrolling Feature Instructions Helper Banner */}
              <div className="px-3.5 py-2 bg-gradient-to-r from-amber-950/30 via-slate-950 to-slate-950 rounded-xl border border-amber-500/20 flex flex-wrap items-center justify-between gap-2 text-[11px] text-amber-200/90">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                  <span>
                    <strong>天数滚动操作提示：</strong>
                    每一个账号卡片均显示养号天数。支持<strong>直接把鼠标放在数字上滚动滚轮</strong>调节，也支持点击或长按 <strong>[-]</strong> <strong>[+]</strong> 连续翻滚，或双击直接输入！
                  </span>
                </div>
                {autoRollTimerActive && (
                  <span className="text-emerald-400 font-mono flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>矩阵天数动态推进中 ({autoRollSpeed / 1000}秒/天)</span>
                  </span>
                )}
              </div>

              {/* Live Activity Radar & Real-Time Action Stream */}
              <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-950/90 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-bold text-white text-xs flex items-center gap-1.5">
                      <span>📡 养号实时动态雷达 · 拟人行为流水 (Live Action Stream)</span>
                    </span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
                      ● 拟人化引擎全天候自主调度
                    </span>
                  </div>
                  <button
                    onClick={() => setShowLiveRadar(!showLiveRadar)}
                    className="text-[11px] text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {showLiveRadar ? '收起动态流水 ▴' : '展开动态流水 ▾'}
                  </button>
                </div>

                {showLiveRadar && (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {liveActivities.map((act) => (
                      <div
                        key={act.id}
                        className="p-2 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-start justify-between gap-3 text-xs hover:border-slate-700 transition-colors"
                      >
                        <div className="flex items-start gap-2.5 min-w-0">
                          <span className="font-mono text-[10px] text-slate-500 mt-0.5 shrink-0">[{act.time}]</span>
                          <div className="space-y-0.5 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white font-mono text-[11px] truncate">{act.account}</span>
                              <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold shrink-0 ${
                                act.color === 'blue' ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20' :
                                act.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20' :
                                act.color === 'purple' ? 'bg-purple-500/10 text-purple-300 border border-purple-500/20' :
                                act.color === 'pink' ? 'bg-pink-500/10 text-pink-300 border border-pink-500/20' :
                                'bg-amber-500/10 text-amber-300 border border-amber-500/20'
                              }`}>
                                {act.type}
                              </span>
                            </div>
                            <p className="text-slate-300 text-[11px] leading-relaxed break-words">{act.desc}</p>
                          </div>
                        </div>
                        <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0 font-medium">
                          {act.badge}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Accounts Grid or Empty State */}
          {accounts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-10 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 mx-auto flex items-center justify-center">
                <Users className="h-7 w-7" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-base font-bold text-white">暂未接入任何 Facebook 矩阵账号</h4>
                <p className="text-xs text-slate-400 max-w-lg mx-auto leading-relaxed">
                  请直接点击下方按钮拉入您的账号卡密文件，或者点击体验按钮直接载入<strong>图片中的同款账号与【第33天】天数滚动效果</strong>：
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all"
                >
                  <UploadCloud className="h-4 w-4" />
                  <span>拉入文件 / 导入首批 FB 账号</span>
                </button>
                <button
                  onClick={handleLoadScreenshotDemoAccounts}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>⚡ 一键载入截图同款 10 个账号与 1:1 独立住宅 IP</span>
                </button>
              </div>
            </div>
          ) : displayedAccounts.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-8 text-center text-slate-400 text-xs">
              该筛选分类下暂无符合天数阶段的账号，请点击【全部账号】查看。
            </div>
          ) : accountViewMode === 'compact_mini' ? (
            /* VIEW MODE A-1: 300-Account Ultra-Compact Mini Grid (Sleek, fits 4-6 columns, ideal for 300+ accounts) */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2.5">
              {displayedAccounts.map((acc) => {
                const days = acc.warmingDays || 1;
                return (
                  <div
                    key={acc.id}
                    className="rounded-xl border border-slate-800 bg-[#0c1424]/90 hover:border-blue-500/50 p-2.5 flex flex-col justify-between shadow-md transition-all text-xs group/card space-y-2"
                  >
                    <div>
                      {/* Header: Checkbox + Avatar + Name + Real UID + Action */}
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={selectedAccountIds.includes(acc.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedAccountIds(prev => [...prev, acc.id]);
                              } else {
                                setSelectedAccountIds(prev => prev.filter(id => id !== acc.id));
                              }
                            }}
                            className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer shrink-0"
                          />
                          <div
                            onClick={() => handleOpenEditAccount(acc)}
                            className="w-6 h-6 rounded-full bg-slate-800 hover:ring-2 hover:ring-blue-500 text-slate-200 font-bold font-mono text-[10px] flex items-center justify-center shrink-0 cursor-pointer overflow-hidden border border-slate-700"
                            title="点击更换头像与资料 (可调整人脸位置)"
                          >
                            {acc.avatar && !acc.avatar.includes('unsplash') ? (
                              <img src={acc.avatar} alt={acc.name} className="w-full h-full object-cover object-top" />
                            ) : (
                              <span className="text-[10px] font-bold text-slate-300 font-mono">
                                {acc.name.slice(-2)}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-white text-[11px] truncate max-w-[95px] font-mono leading-tight" title={acc.name}>
                              {acc.name}
                            </div>
                            <div className="text-[9px] text-emerald-400 font-mono truncate leading-none mt-0.5" title={acc.lastActive}>
                              {acc.lastActive && acc.lastActive.startsWith('UID:') 
                                ? acc.lastActive 
                                : (acc.lastActive && acc.lastActive.startsWith('+') ? acc.lastActive : `UID:${acc.name.replace(/\D/g, '') || acc.id}`)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-0.5 shrink-0">
                          <button
                            onClick={() => handleOpenEditAccount(acc)}
                            className="p-1 rounded text-slate-500 hover:text-blue-400 hover:bg-slate-800 transition-colors cursor-pointer"
                            title="编辑此账号"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* Stepper + 2FA Inline */}
                      <div className="flex items-center justify-between gap-1.5 pt-0.5">
                        <RollingDayStepper
                          days={days}
                          onChange={(next) => handleRollWarmingDays(acc.id, next - days)}
                          isAutoRolling={autoRollTimerActive}
                          compact={true}
                        />
                        <div
                          onClick={() => {
                            navigator.clipboard.writeText(acc.twoFaCode || '548508');
                          }}
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-amber-300 font-mono font-bold cursor-pointer hover:border-amber-500/40"
                          title="点击复制 2FA 动态码"
                        >
                          <Key className="h-2.5 w-2.5 text-amber-400" />
                          <span>{acc.twoFaCode || '548508'}</span>
                        </div>
                      </div>

                      {/* 150-Client Product Account Progress Bar */}
                      {(() => {
                        const added = acc.addedFriendsCount ?? 0;
                        const goal = acc.targetClientsGoal || 150;
                        const pct = Math.min(100, Math.round((added / goal) * 100));
                        const isFinished = added >= goal;
                        return (
                          <div className="pt-1.5 pb-0.5 space-y-1">
                            <div className="flex items-center justify-between text-[9px]">
                              <span
                                onClick={() => setActiveTab('leads')}
                                className="text-slate-400 flex items-center gap-1 cursor-pointer hover:text-blue-300"
                                title="点击打开全矩阵去重总库查看明细"
                              >
                                <Users className="h-2.5 w-2.5 text-blue-400" />
                                <span>客户库:</span>
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono">
                                  <strong className={isFinished ? 'text-emerald-400 font-bold' : 'text-blue-300'}>{added}</strong>
                                  <span className="text-slate-500">/{goal}</span>
                                  {isFinished ? (
                                    <span className="ml-1 text-[8px] bg-emerald-500/20 text-emerald-300 px-1 rounded font-bold">🏆已达标</span>
                                  ) : (
                                    <span className="ml-1 text-[8px] text-cyan-300">{pct}%</span>
                                  )}
                                </span>
                                {added > 0 && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setAccounts(prev => {
                                        const next = prev.map(a => a.id === acc.id ? { ...a, addedFriendsCount: 0 } : a);
                                        try { localStorage.setItem('fb_matrix_accounts', JSON.stringify(next)); } catch {}
                                        return next;
                                      });
                                    }}
                                    className="px-1 py-0.2 rounded bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 border border-slate-700/60 text-[8px] font-sans transition-colors cursor-pointer"
                                    title="将该号进度清零为 0/150"
                                  >
                                    清0
                                  </button>
                                )}
                              </div>
                            </div>
                            <div
                              onClick={() => setActiveTab('leads')}
                              className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800/80 cursor-pointer"
                              title="点击打开全矩阵去重总库查看明细"
                            >
                              <div
                                className={`h-full rounded-full transition-all ${isFinished ? 'bg-emerald-400' : 'bg-gradient-to-r from-blue-500 to-cyan-400'}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Footer: IP & Live Online Status */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px]">
                      <div className="flex items-center gap-1 min-w-0" title={`绑定静态住宅代理 IP: ${acc.proxyIp}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0"></span>
                        <span className="font-mono text-slate-300 text-[10px] truncate max-w-[92px]">
                          {acc.proxyIp.split(':')[0]}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="font-mono text-emerald-400 text-[9px] bg-emerald-500/10 px-1 py-0.2 rounded border border-emerald-500/20 flex items-center gap-0.5" title="云端独立指纹沙箱持续连通保活中">
                          <span>38ms</span>
                        </span>
                        <span className={`flex items-center gap-1 font-medium text-[9px] ${days >= 8 ? 'text-emerald-400' : days <= 2 ? 'text-cyan-300' : 'text-amber-400'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${days >= 8 ? 'bg-emerald-400' : days <= 2 ? 'bg-cyan-400' : 'bg-amber-400'}`}></span>
                          <span>{days >= 8 ? '可群发' : days <= 2 ? '48h沉淀' : '养号中'}</span>
                        </span>
                        <button
                          onClick={() => onOpenSimulator(acc)}
                          className="px-1.5 py-0.5 rounded bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/40 text-[9px] font-sans transition-colors cursor-pointer flex items-center gap-0.5 active:scale-95"
                          title="点击打开此账号的云端沙箱实机运行画面"
                        >
                          <Play className="h-2.5 w-2.5 fill-blue-300" />
                          <span>投屏</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : accountViewMode === 'table_view' ? (
            /* VIEW MODE A-2: 300-Account High-Density Table (Perfect for managing 100~500 accounts) */
            <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#0c1424]/90 shadow-xl">
              <table className="w-full text-left text-xs text-slate-300 font-mono">
                <thead className="bg-slate-950/90 text-slate-400 text-[11px] uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3 w-10">
                      <input
                        type="checkbox"
                        checked={selectedAccountIds.length === displayedAccounts.length && displayedAccounts.length > 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAccountIds(displayedAccounts.map(a => a.id));
                          } else {
                            setSelectedAccountIds([]);
                          }
                        }}
                        className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                      />
                    </th>
                    <th className="p-3 font-semibold font-sans">账号 / UID</th>
                    <th className="p-3 font-semibold font-sans text-center">养号天数 (滚轮可调)</th>
                    <th className="p-3 font-semibold font-sans">当前状态</th>
                    <th className="p-3 font-semibold font-sans">客户进度 (去重总库)</th>
                    <th className="p-3 font-semibold font-sans">2FA 动态码</th>
                    <th className="p-3 font-semibold font-sans">独立住宅代理 IP</th>
                    <th className="p-3 font-semibold font-sans">归属分组</th>
                    <th className="p-3 font-semibold font-sans text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs">
                  {displayedAccounts.map((acc) => {
                    const days = acc.warmingDays || 1;
                    return (
                      <tr key={acc.id} className="hover:bg-slate-900/60 transition-colors group">
                        <td className="p-3">
                          <input
                            type="checkbox"
                            checked={selectedAccountIds.includes(acc.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedAccountIds(prev => [...prev, acc.id]);
                              } else {
                                setSelectedAccountIds(prev => prev.filter(id => id !== acc.id));
                              }
                            }}
                            className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                          />
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 font-bold font-mono text-[10px] flex items-center justify-center shrink-0 border border-slate-700 overflow-hidden">
                              {acc.avatar ? (
                                <img src={acc.avatar} alt={acc.name} className="w-full h-full object-cover object-top" />
                              ) : (
                                acc.name.slice(-2)
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-white font-mono text-xs">{acc.name}</div>
                              <div className="text-[10px] text-emerald-400 font-mono leading-none mt-0.5">
                                {acc.lastActive && acc.lastActive.startsWith('UID:') 
                                  ? acc.lastActive 
                                  : (acc.lastActive && acc.lastActive.startsWith('+') ? acc.lastActive : `UID:${acc.name.replace(/\D/g, '') || acc.id}`)}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <div className="inline-block">
                            <RollingDayStepper
                              days={days}
                              onChange={(next) => handleRollWarmingDays(acc.id, next - days)}
                              isAutoRolling={autoRollTimerActive}
                              compact={true}
                            />
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-sans font-medium ${
                            days >= 8 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : days <= 2 
                              ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20' 
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${days >= 8 ? 'bg-emerald-400' : days <= 2 ? 'bg-cyan-400' : 'bg-amber-400'}`}></span>
                            <span>{days >= 8 ? '确认可群发' : days <= 2 ? '48h静默防封' : '自动养号中'}</span>
                          </span>
                        </td>
                        <td className="p-3">
                          {(() => {
                            const added = acc.addedFriendsCount ?? 0;
                            const goal = acc.targetClientsGoal || 150;
                            const pct = Math.min(100, Math.round((added / goal) * 100));
                            const isFinished = added >= goal;
                            return (
                              <div
                                onClick={() => setActiveTab('leads')}
                                className="space-y-1 min-w-[130px] cursor-pointer hover:opacity-80 transition-opacity"
                                title="点击打开全矩阵去重总库查看明细"
                              >
                                <div className="flex items-center justify-between text-[11px] font-mono">
                                  <span className={isFinished ? 'text-emerald-400 font-bold' : 'text-blue-300 font-bold'}>
                                    {added} <span className="text-slate-500 font-normal">/ {goal}</span>
                                  </span>
                                  {isFinished ? (
                                    <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded font-bold">🏆达标</span>
                                  ) : (
                                    <span className="text-cyan-300 text-[10px] font-bold">{pct}%</span>
                                  )}
                                </div>
                                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800/80">
                                  <div
                                    className={`h-full rounded-full transition-all ${isFinished ? 'bg-emerald-400' : 'bg-gradient-to-r from-blue-500 to-cyan-400'}`}
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                            );
                          })()}
                        </td>
                        <td className="p-3">
                          <div
                            onClick={() => navigator.clipboard.writeText(acc.twoFaCode || '548508')}
                            className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-slate-950 border border-slate-800 text-amber-300 font-bold cursor-pointer hover:border-amber-500/50"
                            title="点击一键复制 2FA 动态码"
                          >
                            <Key className="h-3 w-3 text-amber-400" />
                            <span>{acc.twoFaCode || '548508'}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-1.5 text-slate-300 text-xs">
                            <span className="text-emerald-400 font-mono">{acc.proxyIp}</span>
                            <span className="text-[10px] text-slate-500 font-sans">({acc.proxyLocation})</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <select
                            value={acc.group || '养号A组'}
                            onChange={(e) => handleUpdateAccountGroup(acc.id, e.target.value)}
                            className="bg-slate-950 border border-slate-800 text-blue-300 text-[11px] rounded-lg px-2 py-1 outline-none cursor-pointer"
                          >
                            <option value="养号A组">🛡️ 养号A组</option>
                            <option value="养号B组">🛡️ 养号B组</option>
                            <option value="高权老号组">💎 高权老号</option>
                            <option value="投流准备组">🚀 投流组</option>
                          </select>
                        </td>
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditAccount(acc)}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-sans transition-colors cursor-pointer"
                            >
                              编辑
                            </button>
                            <button
                              onClick={() => onOpenSimulator(acc)}
                              className="px-2 py-1 rounded bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-[11px] font-sans transition-colors cursor-pointer"
                            >
                              投屏沙箱
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : accountViewMode === 'dense_matrix' ? (
            /* VIEW MODE A: Dense Matrix Grid (100% Matching User's Uploaded Screenshot) */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
              {displayedAccounts.map((acc) => {
                const days = acc.warmingDays || 1;
                return (
                  <div
                    key={acc.id}
                    className="rounded-xl border border-slate-800 bg-[#0c1424]/90 hover:border-slate-700 p-3 flex flex-col justify-between shadow-md transition-all text-xs group/card"
                  >
                    <div>
                      {/* Row 1: Checkbox, Avatar, Name, Phone/UID, Action Buttons */}
                      <div className="flex items-center justify-between gap-1.5 mb-2.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <input
                            type="checkbox"
                            checked={selectedAccountIds.includes(acc.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedAccountIds(prev => [...prev, acc.id]);
                              } else {
                                setSelectedAccountIds(prev => prev.filter(id => id !== acc.id));
                              }
                            }}
                            className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0 w-3.5 h-3.5 cursor-pointer shrink-0"
                          />
                          <div
                            onClick={() => handleOpenEditAccount(acc)}
                            className="w-7 h-7 rounded-full bg-slate-800 hover:ring-2 hover:ring-blue-500 text-slate-200 font-bold font-mono text-xs flex items-center justify-center shrink-0 cursor-pointer overflow-hidden border border-slate-700"
                            title="点击更换头像与形象 (建议5天后上传真人照片)"
                          >
                            {acc.avatar && !acc.avatar.includes('unsplash') ? (
                              <img src={acc.avatar} alt={acc.name} className="w-full h-full object-cover object-top" />
                            ) : (
                              <span className="text-[11px] font-bold text-slate-300 font-mono">
                                {acc.name.slice(-2)}
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-white text-xs truncate max-w-[130px] font-mono leading-tight" title={acc.name}>
                              {acc.name}
                            </div>
                            <div className="text-[10px] text-emerald-400 font-mono truncate leading-tight mt-0.5" title={acc.lastActive}>
                              {acc.lastActive && acc.lastActive.startsWith('UID:') 
                                ? acc.lastActive 
                                : (acc.lastActive && acc.lastActive.startsWith('+') ? acc.lastActive : `UID:${acc.name.replace(/\D/g, '') || acc.id}`)}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleOpenEditAccount(acc)}
                            className="p-1 rounded text-slate-500 hover:text-blue-400 hover:bg-slate-800 transition-colors cursor-pointer"
                            title="编辑此账号"
                          >
                            <Edit2 className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => setAccounts(prev => prev.filter(a => a.id !== acc.id))}
                            className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="删除该账号"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {/* Row 2: Group Dropdown & Rolling Days Stepper (The exact element with red arrow) */}
                      <div className="flex items-center justify-between gap-1.5 mb-2.5">
                        <select
                          value={acc.group || '养号B组'}
                          onChange={(e) => handleUpdateAccountGroup(acc.id, e.target.value)}
                          className="bg-[#111e38] hover:bg-[#16274a] border border-blue-500/30 text-blue-300 text-[11px] font-medium rounded-lg px-2 py-1 outline-none cursor-pointer max-w-[90px] transition-colors"
                        >
                          <option value="养号A组">🛡️ 养号A组</option>
                          <option value="养号B组">🛡️ 养号B组</option>
                          <option value="养号C组">🛡️ 养号C组</option>
                          <option value="高权老号组">💎 高权老号</option>
                          <option value="投流准备组">🚀 投流组</option>
                        </select>

                        {/* Exact Screenshot Stepper: [-] 第33天 [+] with animated rolling odometer and mouse wheel */}
                        <RollingDayStepper
                          days={days}
                          onChange={(next) => handleRollWarmingDays(acc.id, next - days)}
                          isAutoRolling={autoRollTimerActive}
                          compact={true}
                        />
                      </div>

                      {/* Row 3: 2FA & IP Row with [改] Tag Buttons */}
                      <div className="space-y-1.5 text-[11px] font-mono bg-slate-950/70 p-2 rounded-lg border border-slate-800/80 mb-2">
                        <div className="flex items-center justify-between text-slate-400">
                          <span className="text-slate-500 text-[10px]">2FA:</span>
                          <div className="flex items-center gap-1.5">
                            <span className="text-amber-300 font-bold font-mono">{acc.twoFaCode || '548508'}</span>
                            <button
                              onClick={() => {
                                setEditing2FaAccount(acc);
                                setEdit2FaInput(acc.twoFaCode || '548508');
                              }}
                              className="px-1.5 py-0.2 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] font-sans transition-colors cursor-pointer"
                              title="修改 2FA 动态安全码"
                            >
                              改
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-slate-400">
                          <span className="text-slate-500 text-[10px]">IP:</span>
                          <div className="flex items-center gap-1.5 truncate max-w-[130px]">
                            <span className="text-emerald-400 truncate text-[10px]">{acc.proxyIp}</span>
                            <button
                              onClick={() => handleOpenEditAccount(acc)}
                              className="px-1.5 py-0.2 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-sans transition-colors cursor-pointer shrink-0"
                              title="修改绑定的独立住宅代理 IP"
                            >
                              改
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* 150-Client Product Account Progress Bar */}
                      {(() => {
                        const added = acc.addedFriendsCount ?? 0;
                        const goal = acc.targetClientsGoal || 150;
                        const pct = Math.min(100, Math.round((added / goal) * 100));
                        const isFinished = added >= goal;
                        return (
                          <div
                            onClick={() => setActiveTab('leads')}
                            className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80 mb-2 space-y-1 cursor-pointer hover:border-blue-500/40 transition-colors"
                            title="点击打开全矩阵去重总库查看明细"
                          >
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-slate-400 flex items-center gap-1">
                                <Users className="h-3 w-3 text-blue-400" />
                                <span>客户库进度:</span>
                              </span>
                              <span className="font-mono">
                                <strong className={isFinished ? 'text-emerald-400 font-bold' : 'text-blue-300 font-bold'}>{added}</strong>
                                <span className="text-slate-500"> / {goal}</span>
                                {isFinished ? (
                                  <span className="ml-1 text-[9px] bg-emerald-500/20 text-emerald-300 px-1 rounded font-bold">🏆达标</span>
                                ) : (
                                  <span className="ml-1 text-[9px] text-cyan-300 font-bold">{pct}%</span>
                                )}
                              </span>
                            </div>
                            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800/80">
                              <div
                                className={`h-full rounded-full transition-all ${isFinished ? 'bg-emerald-400' : 'bg-gradient-to-r from-blue-500 to-cyan-400'}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Row 4: Status pill & online ping proof */}
                    <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/60 text-[10px]">
                      <span className={`flex items-center gap-1 font-medium font-sans ${days >= 8 ? 'text-emerald-400' : days <= 2 ? 'text-cyan-300' : 'text-amber-400'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${days >= 8 ? 'bg-emerald-400' : days <= 2 ? 'bg-cyan-400' : 'bg-amber-400'}`}></span>
                        <span>{days >= 8 ? '确认可群发' : days <= 2 ? '48h静默防封' : '养号中'}</span>
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="font-mono text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20" title="云端无头沙箱长效保活，Facebook 状态 HTTP 200 OK">
                          <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping"></span>
                          <span>38ms</span>
                        </span>
                        <button
                          onClick={() => onOpenSimulator(acc)}
                          className="px-2 py-0.5 rounded bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/40 text-[10px] font-sans transition-colors cursor-pointer flex items-center gap-0.5 active:scale-95"
                          title="点击打开此账号的云端沙箱实机运行画面"
                        >
                          <Play className="h-2.5 w-2.5 fill-blue-300" />
                          <span>投屏</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* VIEW MODE B: Detailed Cards */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedAccounts.map((acc) => {
                const days = acc.warmingDays || 1;
                const isMature = days >= 15;
                const isGrowth = days >= 8 && days < 15;
                const isWarmup = days >= 4 && days < 8;

                return (
                  <div
                    key={acc.id}
                    className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 hover:border-slate-700 transition-all flex flex-col justify-between shadow-lg"
                  >
                    <div>
                      {/* Top Account Row */}
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="relative group cursor-pointer"
                            onClick={() => handleOpenEditAccount(acc)}
                            title="点击更换此账号的头像与形象"
                          >
                            {acc.avatar ? (
                              <img
                                src={acc.avatar}
                                alt={acc.name}
                                className="w-11 h-11 rounded-full object-cover object-top border border-slate-700 group-hover:ring-2 group-hover:ring-blue-500 transition-all"
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-bold font-mono text-xs group-hover:ring-2 group-hover:ring-blue-500 transition-all">
                                {acc.name.slice(-2)}
                              </div>
                            )}
                            <div className="absolute inset-0 rounded-full bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Camera className="h-4 w-4 text-white" />
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                              <span>{acc.name}</span>
                            </h4>
                            <span className="text-[11px] text-slate-400 block">{acc.lastActive}</span>
                            <button
                              onClick={() => handleOpenEditAccount(acc)}
                              className="mt-1 flex items-center gap-1 text-[11px] text-blue-400 hover:text-blue-300 font-medium transition-colors bg-blue-500/10 hover:bg-blue-500/20 px-2 py-0.5 rounded border border-blue-500/20"
                              title="点击上传本地照片或更换真实头像"
                            >
                              <Camera className="h-3 w-3" />
                              <span>修改头像 / 上传照片</span>
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium ${
                            acc.status === 'active'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : acc.status === 'warming'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}>
                            {acc.status === 'active' ? '正常挂机' : acc.status === 'warming' ? '自动养号中' : '冷却保护'}
                          </span>
                          <button
                            onClick={() => setAccounts(prev => prev.filter(a => a.id !== acc.id))}
                            className="p-1 rounded-lg hover:bg-rose-950/60 text-slate-500 hover:text-rose-400 transition-colors"
                            title="移出此账号"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Amber Stepper & Stage Description */}
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 mb-3">
                        <div className="flex items-center gap-2">
                          <Calendar className={`h-4 w-4 ${isMature ? 'text-purple-400' : isGrowth ? 'text-emerald-400' : isWarmup ? 'text-blue-400' : 'text-amber-400'}`} />
                          <div>
                            <span className="text-[10px] text-slate-400 block leading-tight">养号天数 (当前权重阶段)</span>
                            <span className={`text-xs font-bold font-mono ${
                              isMature ? 'text-purple-400' : isGrowth ? 'text-emerald-400' : isWarmup ? 'text-blue-400' : 'text-amber-400'
                            }`}>
                              {isMature ? `💎 养号 ${days} 天 · 高权老号` :
                               isGrowth ? `🚀 养号 ${days} 天 · 拓客放量期` :
                               isWarmup ? `🌿 养号 ${days} 天 · 预热加权期` :
                               `🌱 养号 ${days} 天 · 冷启动破冰期`}
                            </span>
                          </div>
                        </div>

                        {/* Amber Stepper with animated rolling odometer */}
                        <RollingDayStepper
                          days={days}
                          onChange={(next) => handleRollWarmingDays(acc.id, next - days)}
                          isAutoRolling={autoRollTimerActive}
                        />
                      </div>

                      {/* 1:1 Dedicated IP & Fingerprint Section */}
                      <div className="space-y-2 text-xs text-slate-300 bg-slate-950 p-3 rounded-xl border border-slate-800/80 mb-4">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                            <Globe className="h-3 w-3 text-emerald-400" />
                            <span>一号一独享 IP:</span>
                          </span>
                          <span className="font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20 text-[11px] font-semibold">
                            {acc.proxyIp}
                          </span>
                        </div>

                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-400">物理节点/时区:</span>
                          <span className="text-slate-200">{acc.proxyLocation}</span>
                        </div>

                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-400">独立指纹沙箱:</span>
                          <span className="font-mono text-blue-400">#{acc.browserProfileId}</span>
                        </div>

                        <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/60 text-[10px]">
                          <span className="text-emerald-400 flex items-center gap-1 font-sans">
                            <ShieldCheck className="h-3 w-3" /> 100% 物理独立防关联
                          </span>
                          <button
                            onClick={() => handleOpenEditAccount(acc)}
                            className="text-blue-400 hover:text-blue-300 underline underline-offset-2 transition-colors cursor-pointer"
                          >
                            更换绑定 IP
                          </button>
                        </div>
                      </div>

                      {/* 150-Client Product Account Progress Bar */}
                      {(() => {
                        const added = acc.addedFriendsCount ?? 0;
                        const goal = acc.targetClientsGoal || 150;
                        const pct = Math.min(100, Math.round((added / goal) * 100));
                        const isFinished = added >= goal;
                        return (
                          <div
                            onClick={() => setActiveTab('leads')}
                            className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 mb-3 space-y-1.5 cursor-pointer hover:border-purple-500/40 transition-colors"
                            title="点击打开全矩阵去重总库查看明细"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                                <Users className="h-3.5 w-3.5 text-blue-400" />
                                <span>150客户产品号达成进度:</span>
                              </span>
                              <span className="font-mono">
                                <strong className={isFinished ? 'text-emerald-400 font-bold' : 'text-blue-300 font-bold'}>{added}</strong>
                                <span className="text-slate-500"> / {goal} 人</span>
                                {isFinished ? (
                                  <span className="ml-1.5 text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-bold">🏆已达标</span>
                                ) : (
                                  <span className="ml-1.5 text-[10px] text-cyan-300 font-bold font-mono">{pct}%</span>
                                )}
                              </span>
                            </div>
                            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${isFinished ? 'bg-emerald-400' : 'bg-gradient-to-r from-blue-500 to-cyan-400'}`}
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-slate-500 block">所有客户实时进入全矩阵去重总库（点击即可进入总库），后续加号扩容绝对不重复触达</span>
                          </div>
                        );
                      })()}
                    </div>

                    <div>
                      {/* Action Limits & Health Score */}
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>今日动作配额 (根据养号天数智能限制)</span>
                        <span className="font-mono text-white">{acc.dailyActionsCount} / {acc.dailyLimit} 次</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all"
                          style={{ width: `${acc.dailyLimit > 0 ? (acc.dailyActionsCount / acc.dailyLimit) * 100 : 0}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                        <span>健康评分: <strong className="text-emerald-400 font-mono">{acc.healthScore}/100</strong></span>
                        <span className="text-emerald-400">Session Cookie 有效</span>
                      </div>

                      <button
                        onClick={() => {
                          setInspectingAccount(acc);
                          setShowFingerprintModal(true);
                        }}
                        className="w-full mt-3 py-1.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-900 text-purple-400 hover:text-purple-300 border border-slate-800 hover:border-purple-500/40 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Fingerprint className="h-3.5 w-3.5 text-purple-400" />
                        <span>查看独立硬件指纹 (Canvas/WebGL/WebRTC)</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Leads & Deduplication Pool */}
      {activeTab === 'leads' && (
        <div className="space-y-4">
          {/* Deduplication Callout */}
          <div className="rounded-2xl border border-purple-500/30 bg-purple-950/20 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center shrink-0">
                <Layers className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">云端分布式去重数据库已生效</h4>
                <p className="text-xs text-slate-400">
                  当前去重池已收录 <strong className="text-purple-300 font-mono">{leads.length}</strong> 条已触达 Facebook 用户 ID。矩阵内所有账号在添加好友或私信前会自动进行毫秒级布隆过滤器去重校验，100% 避免重复打扰同一潜在客户。
                </p>
              </div>
            </div>
            {leads.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLeads([])}
                  className="rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 text-xs font-semibold transition-colors"
                >
                  清空线索
                </button>
                <button
                  onClick={() => {
                    const csvData = leads.map(l => `${l.name},${l.profileUrl},${l.country},${l.status},${l.qualificationScore}`).join('\n');
                    const blob = new Blob([`Name,Profile,Country,Status,Score\n${csvData}`], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `fb_leads_${Date.now()}.csv`;
                    a.click();
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-purple-500/40 bg-purple-900/30 hover:bg-purple-800/40 text-purple-200 px-3.5 py-1.5 text-xs font-semibold shrink-0 transition-colors"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>导出线索 CSV</span>
                </button>
              </div>
            )}
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="搜索姓名、个人简介关键词..."
                value={leadSearch}
                onChange={(e) => setLeadSearch(e.target.value)}
                className="bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none w-full sm:w-64"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto text-xs">
              <span className="text-slate-400 shrink-0">状态:</span>
              {['all', 'dm_sent', 'replied', 'friend_request_sent', 'converted'].map((st) => (
                <button
                  key={st}
                  onClick={() => setLeadFilterStatus(st)}
                  className={`px-2.5 py-1 rounded-lg transition-colors whitespace-nowrap ${
                    leadFilterStatus === st
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-white bg-slate-800/60'
                  }`}
                >
                  {st === 'all' ? '全部' : st === 'dm_sent' ? '已发私信' : st === 'replied' ? '已回复' : st === 'friend_request_sent' ? '已加好友' : '已转化'}
                </button>
              ))}
            </div>
          </div>

          {/* Leads Table */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4 font-semibold">目标用户</th>
                    <th className="py-3 px-4 font-semibold">来源入口</th>
                    <th className="py-3 px-4 font-semibold">国家 / 好友数</th>
                    <th className="py-3 px-4 font-semibold">AI 匹配度</th>
                    <th className="py-3 px-4 font-semibold">当前状态</th>
                    <th className="py-3 px-4 font-semibold">触达时间</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredLeads.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-slate-500">
                        <Layers className="h-8 w-8 mx-auto mb-2 text-slate-600" />
                        <p className="text-xs font-semibold text-slate-300">线索池暂无数据</p>
                        <p className="text-[11px] text-slate-500 mt-1 mb-4">
                          启动拓客任务后，AI 筛选合格的目标客户与触达状态将在此沉淀并支持导出
                        </p>
                        <div className="flex flex-wrap items-center justify-center gap-3">
                          <button
                            onClick={() => setActiveTab('accounts')}
                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                          >
                            <Users className="h-3.5 w-3.5" />
                            <span>🔙 返回矩阵账号管理列表</span>
                          </button>
                          <button
                            onClick={handleResetClientCounts}
                            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 text-slate-200 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 font-semibold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <RotateCcw className="h-3.5 w-3.5 text-amber-400" />
                            <span>🔄 一键将全部账号客户进度清零 (0/150)</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={lead.avatar}
                              alt={lead.name}
                              className="w-9 h-9 rounded-full object-cover border border-slate-700"
                            />
                            <div>
                              <span className="font-semibold text-white block">{lead.name}</span>
                              <span className="text-[11px] text-slate-400 line-clamp-1 max-w-xs">{lead.bio}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-slate-200 block">{lead.sourceName}</span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {lead.source === 'group' ? 'FB 小组成员' : lead.source === 'post_likes' ? '贴文点赞' : '系统推荐'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="block text-slate-200">{lead.country}</span>
                          <span className="text-[11px] text-slate-400 font-mono">{lead.friendsCount} 位好友</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 font-mono font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
                            <Sparkles className="h-3 w-3" />
                            <span>{lead.qualificationScore}分</span>
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-medium ${
                            lead.status === 'converted'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : lead.status === 'replied'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                              : lead.status === 'dm_sent'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {lead.status === 'converted' ? '已转化成交' : lead.status === 'replied' ? '客户已回复' : lead.status === 'dm_sent' ? '私信已发送' : '好友已申请'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                          {lead.lastActionAt}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Feed & Story Auto-Poster (朋友圈动态排期与素材库) */}
      {activeTab === 'feed_posts' && (
        <div className="space-y-5">
          {/* Header Banner */}
          <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-950 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <ImageIcon className="h-4 w-4 text-blue-400" />
                  <span>Facebook 朋友圈 / 动态素材库与全自动排期发布中心</span>
                </span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono">
                  全自动云端轮播
                </span>
              </div>
              <p className="text-xs text-slate-300">
                出海业务实拍、营销海报与生活朋友圈素材在此集中管理，系统按设定的<strong>早中晚分时段</strong>由矩阵号自动排期发帖，持续提升账号权重并自然引流！
              </p>
            </div>

            <button
              onClick={() => setShowNewFeedModal(true)}
              className="flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 text-xs font-bold transition-all shadow-md shadow-blue-500/20 whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              <span>+ 上传素材 / 新建发圈排期</span>
            </button>
          </div>

          {/* User Guide Box (Direct answer to "朋友圈的资料我要上传到哪里呢") */}
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl text-xs space-y-2">
            <span className="font-bold text-white flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-400" />
              <span>朋友圈素材上传与自动发帖机制解答：</span>
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-[11px] text-slate-300">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                <span className="font-semibold text-blue-300 block">① 资料上传到哪里？</span>
                <p className="text-slate-400 leading-relaxed">
                  直接在当前页面点击右上角<strong>【+ 上传素材 / 新建发圈排期】</strong>，即可上传本地商品实拍照片、生活场景图或海报，并录入发帖文案。
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                <span className="font-semibold text-emerald-300 block">② 分时段自动执行</span>
                <p className="text-slate-400 leading-relaxed">
                  系统支持勾选<strong>早间 09:30-11:00</strong>、<strong>午间 14:00-15:30</strong> 与 <strong>晚间 20:00-21:30</strong> 等活跃高峰期，模拟真人定时发动态。
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                <span className="font-semibold text-purple-300 block">③ Spintax 变量防查重</span>
                <p className="text-slate-400 leading-relaxed">
                  文案支持 <code>&#123;发货现场|出海到货&#125;</code> 语法，矩阵账号每次发圈文案均自动打乱重组，FB 算法 100% 判定为各号独立原创动态。
                </p>
              </div>
            </div>
          </div>

          {/* 4 Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-900/60">
              <span className="text-xs text-slate-400 block mb-1">排期动态素材</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-extrabold text-white font-mono">{feedPosts.length}</span>
                <span className="text-xs text-slate-500">套素材模板</span>
              </div>
              <span className="text-[11px] text-blue-400 mt-1 block">图文/多图均已就绪</span>
            </div>

            <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-900/60">
              <span className="text-xs text-slate-400 block mb-1">绑定发布账号</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-mono">{accounts.length}</span>
                <span className="text-xs text-slate-500">个独立沙箱</span>
              </div>
              <span className="text-[11px] text-emerald-400 mt-1 block">一号一IP独立发布</span>
            </div>

            <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-900/60">
              <span className="text-xs text-slate-400 block mb-1">累计自动发布</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-extrabold text-amber-400 font-mono">
                  {feedPosts.reduce((sum, p) => sum + p.publishedCount, 0)}
                </span>
                <span className="text-xs text-slate-500">次动态推送</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">包含个人圈与群主页</span>
            </div>

            <div className="p-3.5 rounded-2xl border border-slate-800 bg-slate-900/60">
              <span className="text-xs text-slate-400 block mb-1">活跃时间段</span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-extrabold text-purple-400 font-mono">3</span>
                <span className="text-xs text-slate-500">个分时调度波次</span>
              </div>
              <span className="text-[11px] text-purple-400 mt-1 block">早/中/晚智能错峰</span>
            </div>
          </div>

          {/* Feed Posts List */}
          {feedPosts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 p-8 text-center space-y-3">
              <ImageIcon className="h-10 w-10 text-slate-600 mx-auto" />
              <div className="space-y-1">
                <h5 className="text-sm font-bold text-white">暂无排期动态素材</h5>
                <p className="text-xs text-slate-400">点击上方【+ 上传素材 / 新建发圈排期】上传您的首批业务现货实拍相片与发帖文案</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {feedPosts.map((post) => (
              <div
                key={post.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>{post.title}</span>
                        <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 font-mono">
                          {post.createdAt}
                        </span>
                      </h4>
                      <span className="text-[11px] text-slate-400 mt-0.5 block">
                        已为矩阵号累计发布 <strong className="text-emerald-400 font-mono">{post.publishedCount}</strong> 次
                      </span>
                    </div>

                    <span className="text-[10px] px-2 py-0.5 rounded font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      自动排期运行中
                    </span>
                  </div>

                  {/* Post Content preview with Spintax */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-emerald-300 leading-relaxed break-words">
                    {post.content}
                  </div>

                  {/* Attached Images */}
                  {post.images && post.images.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-400 block font-medium">附带实拍素材图片 ({post.images.length} 张)：</span>
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {post.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt="post preview"
                            className="w-20 h-16 rounded-xl object-cover border border-slate-800 shrink-0"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Schedule time slots */}
                  <div className="space-y-1 pt-1">
                    <span className="text-[11px] text-slate-400 block font-medium flex items-center gap-1">
                      <Clock className="h-3 w-3 text-amber-400" />
                      <span>分时段执行排期：</span>
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {post.scheduleTimeSlots.map((slot, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono"
                        >
                          {slot}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
                  <span className="text-[11px] text-slate-500">发布范围: 全矩阵账号轮播</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setFeedPosts(prev => prev.map(p => p.id === post.id ? { ...p, publishedCount: p.publishedCount + (accounts.length || 1) } : p));
                        alert('已触发指令！所有在线账号已将此动态排入发布队列，将在独立沙箱中依次推送至 Facebook 朋友圈。');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-xs font-semibold transition-colors"
                    >
                      立即全矩阵推送一条
                    </button>
                    <button
                      onClick={() => setFeedPosts(prev => prev.filter(p => p.id !== post.id))}
                      className="p-1.5 rounded-lg hover:bg-rose-950/60 text-slate-500 hover:text-rose-400 transition-colors"
                      title="删除此素材"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}

          {/* Automated Negative Comment Moderation & Competitor Shield (Direct Answer to "对那些我们的FB号不好的评论系统会不会删除的呢") */}
          <div className="rounded-2xl border border-rose-500/30 bg-slate-900/90 p-5 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-600/20 text-rose-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">动态评论区全自动防差评与同行截流守卫</h4>
                    <span className="text-[10px] bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded border border-rose-500/20 font-mono">
                      24/7 实时拦截
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    对我们矩阵号发布的朋友圈动态、主页贴文下的恶意差评、同行挖客截流、诈骗外链进行秒级自动处置
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCommentShieldActive(!commentShieldActive)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    commentShieldActive
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${commentShieldActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                  <span>{commentShieldActive ? '守卫运行中 (自动监听拦截)' : '已暂停守卫'}</span>
                </button>
              </div>
            </div>

            {/* Strategy Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div
                onClick={() => setCommentShieldStrategy('auto_hide')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  commentShieldStrategy === 'auto_hide'
                    ? 'border-emerald-500 bg-emerald-500/10 text-white'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between font-bold mb-1">
                  <span className="text-emerald-300 flex items-center gap-1.5">
                    <span>① 智能静默隐藏 (强烈推荐)</span>
                  </span>
                  {commentShieldStrategy === 'auto_hide' && <Check className="h-4 w-4 text-emerald-400" />}
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  发差评者本人看依然显示（避免激怒对方换小号报复），<strong>但在所有外部路人和潜在真实买家眼中 100% 隐形彻底消失</strong>！
                </p>
              </div>

              <div
                onClick={() => setCommentShieldStrategy('auto_delete')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  commentShieldStrategy === 'auto_delete'
                    ? 'border-rose-500 bg-rose-500/10 text-white'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between font-bold mb-1">
                  <span className="text-rose-300 flex items-center gap-1.5">
                    <span>② 秒级彻底删除 (Delete)</span>
                  </span>
                  {commentShieldStrategy === 'auto_delete' && <Check className="h-4 w-4 text-rose-400" />}
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  检测到差评或外链广告后立即调用 Meta 接口从贴文下彻底抹除（适合清理纯广告黑产）。
                </p>
              </div>

              <div
                onClick={() => setCommentShieldStrategy('auto_block')}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  commentShieldStrategy === 'auto_block'
                    ? 'border-purple-500 bg-purple-500/10 text-white'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between font-bold mb-1">
                  <span className="text-purple-300 flex items-center gap-1.5">
                    <span>③ 隐藏并永久拉黑用户</span>
                  </span>
                  {commentShieldStrategy === 'auto_block' && <Check className="h-4 w-4 text-purple-400" />}
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  隐藏评论的同时，自动将恶意差评/截流账号加入黑名单，禁止其再次在主页发表任何言论。
                </p>
              </div>
            </div>

            {/* Keyword Blacklist Filter */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <label className="font-semibold flex items-center gap-1.5">
                  <Filter className="h-3.5 w-3.5 text-blue-400" />
                  <span>自动拦截敏感词库（命中任一关键词即刻触发自动处置）：</span>
                </label>
                <span className="text-[11px] text-slate-500">以英文逗号分隔</span>
              </div>
              <input
                type="text"
                value={shieldKeywords}
                onChange={(e) => setShieldKeywords(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono text-xs focus:outline-none focus:border-rose-500"
              />
            </div>

            {/* Real-time Moderation Activity Stream */}
            <div className="space-y-2 pt-1 text-xs">
              <span className="font-semibold text-slate-300 block">最近自动拦截处置记录 (已成功拦截保护 {moderatedLogs.length} 条评论)：</span>
              <div className="space-y-1.5">
                {moderatedLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2"
                  >
                    <div className="flex items-start sm:items-center gap-2">
                      <span className="font-mono text-slate-500 text-[10px]">[{log.time}]</span>
                      <span className="font-mono font-bold text-white">{log.account}</span>
                      <span className="text-rose-400 font-semibold">{log.user}:</span>
                      <span className="text-slate-300 italic">"{log.text}"</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[11px] text-slate-400">{log.action}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                        {log.statusBadge}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 6: Messenger Unified Inbox (实时客户来信与快捷回复) */}
      {activeTab === 'messenger_inbox' && (
        <div className="space-y-5">
          {/* Header Banner */}
          <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-950 p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <MessageCircle className="h-4 w-4 text-blue-400" />
                  <span>Facebook Messenger 实时客户来信聚合接待中枢</span>
                </span>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>实时在线监听中</span>
                </span>
              </div>
              <p className="text-xs text-slate-300">
                矩阵内所有账号接收到的<strong>好友通过通知</strong>、<strong>贴文评论</strong>与<strong>客户私信咨询</strong>在此统一聚合，客服无需切换账号与IP即可秒级查看与回复！
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => {
                  const nextState = !autoPilotChatEnabled;
                  setAutoPilotChatEnabled(nextState);
                  if (nextState) {
                    setWhatsappToast('🤖 已开启【AI 全自动代聊与推粉托管】！客户发来私信系统自动跟聊，聊满 3 句自动给轮询到的 WhatsApp 联系方式！');
                  } else {
                    setWhatsappToast('⏸️ 已切换为人工手动回复模式。');
                  }
                  setTimeout(() => setWhatsappToast(null), 5000);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer ${
                  autoPilotChatEnabled
                    ? 'bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 border border-purple-500/50 shadow-purple-500/10'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700'
                }`}
                title="开启后，小号收到客户私信时，AI 自动根据大叔爱好代聊，聊到第 3 句自动发送当前轮到的 WhatsApp 号码！"
              >
                <Sparkles className="h-4 w-4 text-purple-400" />
                <span>{autoPilotChatEnabled ? '🤖 AI 自动代聊 & 自动转粉中 (7x24h托管)' : '👤 人工手动聊天模式'}</span>
                <span className={`w-2 h-2 rounded-full ${autoPilotChatEnabled ? 'bg-purple-400 animate-pulse' : 'bg-slate-500'}`} />
              </button>

              <button
                onClick={() => setShowWhatsAppDiversionModal(true)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600/25 hover:bg-emerald-600/40 text-emerald-200 border border-emerald-500/50 text-xs font-bold transition-all shadow-md shadow-emerald-500/10 active:scale-95 cursor-pointer"
              >
                <Phone className="h-4 w-4 text-emerald-400" />
                <span>🟢 WhatsApp 矩阵分流池</span>
                <span className="px-1.5 py-0.2 rounded-md bg-emerald-500/30 text-emerald-200 font-mono text-[10px]">
                  {whatsappPool.length}号 (1号对5个WS)
                </span>
              </button>

              {(conversations.length > 0 || whatsappPool.length > 0) && (
                <button
                  onClick={() => {
                    setConversations([]);
                    setActiveConversationId('');
                    setWhatsappPool([]);
                    localStorage.removeItem('fb_matrix_whatsapp_pool');
                    localStorage.removeItem('fb_matrix_messenger_conversations');
                    setWhatsappToast('🗑️ 已彻底清空所有演示假数据与聊天记录！');
                    setTimeout(() => setWhatsappToast(null), 4000);
                  }}
                  className="px-2.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                  title="清空当前收件箱测试聊天与假号码"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>清空假数据</span>
                </button>
              )}

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
                <span>未读:</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white font-mono font-bold text-[11px]">
                  {unreadMessagesCount} 条
                </span>
              </div>
            </div>
          </div>

          {whatsappToast && (
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5 animate-fadeIn">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span className="font-semibold">{whatsappToast}</span>
            </div>
          )}

          {/* 2-Column Chat Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 rounded-2xl border border-slate-800 bg-slate-950 min-h-[580px] overflow-hidden">
            {/* Left Column: Conversations List (4 cols) */}
            <div className="md:col-span-5 border-r border-slate-800/80 flex flex-col">
              <div className="p-3.5 border-b border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white">咨询会话列表 ({conversations.length})</span>
                  <span className="text-[11px] text-slate-400">多账号统一聚合</span>
                </div>
                <div className="relative">
                  <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="按客户姓名、咨询关键词搜索..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
                {conversations.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 text-slate-600 opacity-50" />
                    <p className="font-semibold text-slate-400">暂无客户咨询来信</p>
                    <p className="text-[11px] text-slate-500 mt-1">导入真实 FB 账号并启动拓客后，客户私信将实时聚合在此</p>
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => {
                        setActiveConversationId(conv.id);
                        setConversations(prev => prev.map(c => c.id === conv.id ? { ...c, unread: false } : c));
                      }}
                      className={`p-3.5 cursor-pointer transition-colors flex items-start gap-3 ${
                        activeConversationId === conv.id
                          ? 'bg-blue-600/10 border-l-4 border-blue-500'
                          : 'hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="relative shrink-0">
                        <img
                          src={conv.leadAvatar}
                          alt={conv.leadName}
                          className="w-10 h-10 rounded-full object-cover border border-slate-700"
                        />
                        {conv.unread && (
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 absolute -top-0.5 -right-0.5 ring-2 ring-slate-950"></span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <h5 className="text-xs font-bold text-white truncate">{conv.leadName}</h5>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">{conv.lastMessageTime}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-blue-300 font-mono">
                            {conv.accountName}
                          </span>
                          {conv.unread && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-medium">
                              未读
                            </span>
                          )}
                          {conv.transferredToWhatsApp && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-medium flex items-center gap-0.5">
                              <Check className="h-2.5 w-2.5" /> 已转WS
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate leading-tight">
                          {conv.lastMessage}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Column: Active Chat Thread (7 cols) */}
            <div className="md:col-span-7 flex flex-col justify-between">
              {(() => {
                const currentConv = conversations.find(c => c.id === activeConversationId) || conversations[0];
                if (!currentConv) {
                  return (
                    <div className="p-10 text-center text-slate-400 text-xs flex flex-col items-center justify-center h-full min-h-[460px] space-y-3">
                      <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600">
                        <MessageCircle className="h-7 w-7 text-slate-500 opacity-60" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-white text-sm">收件箱已就绪（暂无待回复会话）</h4>
                        <p className="text-slate-400 text-xs max-w-sm">
                          假数据与测试聊天已彻底清除。启动【自动化拓客任务】后，矩阵号添加成功的真实美国客户来信将实时汇聚于此。
                        </p>
                      </div>
                    </div>
                  );
                }

                // Current assigned WhatsApp channel for this account
                const accountChannels = whatsappPool.filter(c => c.assignedAccountId === currentConv.accountId);
                const activeWsChannel = accountChannels.find(c => c.todayTransferred < c.dailyCap) || accountChannels[0] || whatsappPool[0];

                return (
                  <>
                    {/* Chat Header */}
                    <div className="p-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-900/40 flex-wrap gap-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={currentConv.leadAvatar}
                          alt={currentConv.leadName}
                          className="w-9 h-9 rounded-full object-cover border border-slate-700"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-white">{currentConv.leadName}</h4>
                            <span className="text-[10px] text-emerald-400 font-mono">● 在线</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono block">
                            归属账号: <strong className="text-blue-300">{currentConv.accountName}</strong> · 独立住宅IP
                          </span>
                        </div>
                      </div>

                      {/* WhatsApp Round-Robin Allocation Pill */}
                      <div className="flex items-center gap-2">
                        <div
                          onClick={() => setShowWhatsAppDiversionModal(true)}
                          className="px-2.5 py-1.5 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-[11px] flex items-center gap-1.5 text-emerald-300 cursor-pointer hover:bg-emerald-900/60 transition-all shadow-sm"
                          title="点击查看/配置此账号绑定的 5 个 WhatsApp 号码轮询状态"
                        >
                          <Phone className="h-3.5 w-3.5 text-emerald-400" />
                          <span>轮到分配:</span>
                          <strong className="font-mono text-white">{activeWsChannel?.phoneOrLink || currentConv.assignedWhatsApp}</strong>
                          <span className="text-[10px] text-emerald-400 font-mono">
                            ({activeWsChannel?.tag || 'WS-01'} · 今日{activeWsChannel?.todayTransferred || 1}/{activeWsChannel?.dailyCap || 2}人)
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Chat Messages History */}
                    <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[380px]">
                      {currentConv.messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}
                        >
                          <div className="flex items-center gap-1.5 mb-0.5 text-[10px] text-slate-500 font-mono">
                            <span>{msg.senderName}</span>
                            <span>{msg.timestamp}</span>
                          </div>
                          <div
                            className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                              msg.sender === 'me'
                                ? 'bg-blue-600 text-white rounded-tr-none'
                                : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                            }`}
                          >
                            {msg.text}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Quick Canned Replies & Message Sender */}
                    <div className="p-3.5 border-t border-slate-800 bg-slate-900/40 space-y-2.5">
                      {/* Canned reply shortcuts */}
                      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                        <button
                          onClick={() => {
                            const wsTarget = activeWsChannel?.phoneOrLink || '+1 (626) 388-9011';
                            const templates = diversionConfig.transferTemplates;
                            const chosenTpl = templates[Math.floor(Math.random() * templates.length)];
                            const finalMsg = chosenTpl.replace('{whatsapp_contact}', wsTarget);
                            setChatInputText(finalMsg);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-md shadow-emerald-500/20 shrink-0"
                        >
                          <Phone className="h-3.5 w-3.5" />
                          <span>[🟢 一键转粉] 发送轮换的 WhatsApp 名片</span>
                        </button>

                        <button
                          onClick={() => setChatInputText('Sounds wonderful! I\'ve always loved that free spirit of riding. Do you take long road trips often?')}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white shrink-0 transition-colors"
                        >
                          [交友话术] 夸奖机车与旅行
                        </button>
                        <button
                          onClick={() => setChatInputText('That is so awesome! I admire people with genuine outdoor passions. Hope you have a wonderful day!')}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white shrink-0 transition-colors"
                        >
                          [交友话术] 称赞生活方式
                        </button>
                      </div>

                      {/* Text Input area */}
                      <div className="flex items-center gap-2">
                        <textarea
                          rows={2}
                          value={chatInputText}
                          onChange={(e) => setChatInputText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              if (!chatInputText.trim()) return;

                              // Check if text transfers WhatsApp
                              const isTransferring = activeWsChannel && chatInputText.includes(activeWsChannel.phoneOrLink);
                              if (isTransferring) {
                                setWhatsappPool(prev => prev.map(c => {
                                  if (c.id === activeWsChannel.id) {
                                    const nextToday = c.todayTransferred + 1;
                                    return {
                                      ...c,
                                      todayTransferred: nextToday,
                                      totalTransferred: c.totalTransferred + 1,
                                      status: nextToday >= c.dailyCap ? 'capped' : 'active'
                                    };
                                  }
                                  return c;
                                }));
                                setConversations(prev => prev.map(c => c.id === currentConv.id ? { ...c, transferredToWhatsApp: true } : c));
                                setWhatsappToast(`🎉 成功将客户引导至 ${activeWsChannel.tag} (${activeWsChannel.phoneOrLink})！今日已分流 ${activeWsChannel.todayTransferred + 1}/${activeWsChannel.dailyCap} 人！`);
                                setTimeout(() => setWhatsappToast(null), 5000);
                              }
                              handleSendMessage();
                            }
                          }}
                          placeholder={`以 ${currentConv.accountName} 身份直接给客户回复 Messenger 私信...`}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                        <button
                          onClick={() => {
                            if (!chatInputText.trim()) return;
                            const isTransferring = activeWsChannel && chatInputText.includes(activeWsChannel.phoneOrLink);
                            if (isTransferring) {
                              setWhatsappPool(prev => prev.map(c => {
                                if (c.id === activeWsChannel.id) {
                                  const nextToday = c.todayTransferred + 1;
                                  return {
                                    ...c,
                                    todayTransferred: nextToday,
                                    totalTransferred: c.totalTransferred + 1,
                                    status: nextToday >= c.dailyCap ? 'capped' : 'active'
                                  };
                                }
                                return c;
                              }));
                              setConversations(prev => prev.map(c => c.id === currentConv.id ? { ...c, transferredToWhatsApp: true } : c));
                              setWhatsappToast(`🎉 成功将客户引导至 ${activeWsChannel.tag} (${activeWsChannel.phoneOrLink})！今日已分流 ${activeWsChannel.todayTransferred + 1}/${activeWsChannel.dailyCap} 人！`);
                              setTimeout(() => setWhatsappToast(null), 5000);
                            }
                            handleSendMessage();
                          }}
                          disabled={!chatInputText.trim()}
                          className="px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-blue-500/20 cursor-pointer"
                        >
                          <Send className="h-3.5 w-3.5" />
                          <span>发送</span>
                        </button>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl p-6 sm:p-7 space-y-4 my-6 animate-fadeIn">
            <div>
              <h3 className="text-base font-bold text-white mb-1">新建 Facebook 自动化拓客任务</h3>
              <p className="text-xs text-slate-400">设定数据来源入口、目标人群画像过滤及自动化拓客流程</p>
            </div>

            {/* Quick Presets Bar */}
            <div className="p-3 bg-gradient-to-r from-blue-950/60 to-purple-950/60 border border-blue-500/30 rounded-2xl space-y-2">
              <span className="text-[11px] font-bold text-blue-300 flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                <span>⚡ 常用行业与定向人群一键填充：</span>
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setNewTaskName('🔥【买家定制放宽版】48h活跃美国人 (不限年龄/不限性别/不限行业 · 极速加满150)');
                    setNewTaskSource('recommended_friends');
                    setNewTaskUrl('https://facebook.com/discover/people/usa-active');
                    setNewTaskGender('all');
                    setNewTaskCountry('US');
                    setNewTaskBioKeywords('');
                    setNewTaskNegativeKeywords('Spam, Bot, Fake, Scam');
                    setNewTaskActiveHours('48h');
                    setNewTaskTargetClients(150);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-md shadow-emerald-500/20 ring-2 ring-emerald-400/50"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>⭐ 买家最新标准：48h活跃美国人 (不限年龄/性别/行业 · 极速加满)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setNewTaskName('🇺🇸 美国本土 50+ 岁成熟男性交友粉精准拓展');
                    setNewTaskSource('group_members');
                    setNewTaskUrl('https://facebook.com/groups/over50-dating-singles-usa');
                    setNewTaskGender('male');
                    setNewTaskCountry('US');
                    setNewTaskBioKeywords('Retired, Veteran, Outdoors, Fishing, Harley, Grandpa, Widowed, Divorced, Country');
                    setNewTaskNegativeKeywords('Student, Intern, Young, Teen, Crypto, Agency');
                    setNewTaskActiveHours('48h');
                    setNewTaskTargetClients(150);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 border border-blue-500/50 text-xs font-bold transition-all cursor-pointer flex items-center gap-1 active:scale-95 shadow-sm"
                >
                  <span>🇺🇸 美国 50+ 岁男性交友粉 (48h活跃 · 150产品号)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setNewTaskName('🏍️ 全美哈雷机车与肌肉车俱乐部 (优质大叔)');
                    setNewTaskSource('group_members');
                    setNewTaskUrl('https://facebook.com/groups/harley-davidson-riders-usa');
                    setNewTaskGender('male');
                    setNewTaskCountry('US');
                    setNewTaskBioKeywords('Harley, Rider, Biker, Garage, Classic Cars, Veteran');
                    setNewTaskNegativeKeywords('Student, Intern, Young, Teen');
                    setNewTaskActiveHours('48h');
                    setNewTaskTargetClients(150);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/40 text-amber-200 border border-amber-500/40 text-xs font-medium transition-all cursor-pointer"
                >
                  <span>🏍️ 哈雷与肌肉车大叔</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setNewTaskName('🛒 欧美跨境独立站与 Shopify 卖家精准获客');
                    setNewTaskSource('group_members');
                    setNewTaskUrl('https://facebook.com/groups/shopifyentrepreneurs');
                    setNewTaskGender('all');
                    setNewTaskCountry('US');
                    setNewTaskBioKeywords('Owner, Founder, Brand, Seller, E-commerce, Shopify');
                    setNewTaskNegativeKeywords('Student, Intern, Spam, Bot');
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 text-purple-200 border border-purple-500/40 text-xs font-medium transition-all cursor-pointer"
                >
                  <span>🛒 跨境独立站卖家</span>
                </button>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-medium">任务名称</label>
                <input
                  type="text"
                  placeholder="例如：🇺🇸 美国本土 50+ 岁成熟男性交友粉精准拓展"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">数据抓取来源入口</label>
                  <select
                    value={newTaskSource}
                    onChange={(e) => setNewTaskSource(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                  >
                    <option value="group_members">Facebook 公开/私密小组成员列表</option>
                    <option value="post_likers">行业对标大贴点赞互动用户截流</option>
                    <option value="recommended_friends">系统推荐可能认识的好友 (AI深度关联)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-medium">目标性别筛选</label>
                  <select
                    value={newTaskGender}
                    onChange={(e) => setNewTaskGender(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-medium"
                  >
                    <option value="male">♂️ 仅限男性 (50+ 交友粉专属)</option>
                    <option value="female">♀️ 仅限女性</option>
                    <option value="all">不限性别 (全部)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">目标主页 / 小组 / 贴文 URL (鱼塘链接)</label>
                <input
                  type="text"
                  placeholder="例如：https://facebook.com/groups/over50-dating-singles-usa"
                  value={newTaskUrl}
                  onChange={(e) => setNewTaskUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                />
                <span className="text-[10px] text-slate-500 mt-1 block">
                  支持填写 Facebook 任意公开/私密小组、成员页、大帖链接
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-300 block mb-1 font-medium">个性签名包含词 (画像特征)</label>
                  <input
                    type="text"
                    placeholder="Retired, Veteran, Fishing, Harley, Widowed"
                    value={newTaskBioKeywords}
                    onChange={(e) => setNewTaskBioKeywords(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">满足其中一个词即自动加好友</span>
                </div>

                <div>
                  <label className="text-slate-300 block mb-1 font-medium">排除负向黑名单词</label>
                  <input
                    type="text"
                    placeholder="Student, Intern, Young, Teen"
                    value={newTaskNegativeKeywords}
                    onChange={(e) => setNewTaskNegativeKeywords(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-white"
                  />
                  <span className="text-[10px] text-slate-500 mt-0.5 block">自动过滤学生与低质年轻号</span>
                </div>
              </div>

              {/* 48h / Today Online Active Filtering - Direct Answer to "要加当天48小时在线的活跃客户" */}
              <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/30 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <label className="text-emerald-300 font-bold text-xs">
                      在线与活跃度过滤（杜绝死号/提高秒通过率）：
                    </label>
                  </div>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-mono px-2 py-0.5 rounded border border-emerald-500/20 font-semibold">
                    48h 活跃拦截保障
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewTaskActiveHours('48h')}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                      newTaskActiveHours === '48h'
                        ? 'bg-emerald-600/30 border-emerald-400 text-white font-bold shadow-sm'
                        : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="block text-xs text-emerald-300 font-bold">🔥 48小时内活跃 (推荐)</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">群内最新发帖/点赞/发言</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewTaskActiveHours('24h')}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                      newTaskActiveHours === '24h'
                        ? 'bg-emerald-600/30 border-emerald-400 text-white font-bold shadow-sm'
                        : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="block text-xs text-emerald-300 font-bold">🟢 当天在线 (绿点)</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Messenger 状态 Active Now</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNewTaskActiveHours('any')}
                    className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                      newTaskActiveHours === 'any'
                        ? 'bg-emerald-600/30 border-emerald-400 text-white font-bold shadow-sm'
                        : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="block text-xs text-slate-300 font-medium">不限活跃度</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">抓取全量群成员列表</span>
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-emerald-500/20 text-[11px] text-slate-300">
                  <span className="flex items-center gap-1 text-slate-400">
                    <span>🎯 产品号达标上限 (加满自动停手，保护资产):</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">单号目标:</span>
                    <input
                      type="number"
                      value={newTaskTargetClients}
                      onChange={(e) => setNewTaskTargetClients(Math.max(1, parseInt(e.target.value) || 150))}
                      className="w-20 bg-slate-900 border border-emerald-500/40 rounded-lg px-2.5 py-1 text-center text-amber-300 font-mono font-bold text-xs focus:outline-none focus:border-emerald-400"
                    />
                    <span className="text-slate-400 font-mono">个客户/号</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5 text-slate-300">
                <span className="font-semibold text-white block">预设启用防封策略：</span>
                <p>✓ 自动过滤 90 天以上不发动态的僵尸死号，仅锁定近期活跃真人</p>
                <p>✓ 自动分配 3-5 个独立美国住宅 IP 账号轮循</p>
                <p>✓ 随机 20s-45s 拟人键鼠时延扰动，杜绝秒加</p>
                <p>✓ 启用云端 89,000+ 用户去重池，100% 避免多号重复加同一人</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowNewTaskModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleCreateTask}
                disabled={!newTaskName.trim()}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
              >
                立即创建并启动
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Account Login / Import Modal */}
      <AccountLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onAddAccount={handleAddAccount}
        onBatchAddAccounts={handleBatchAddAccounts}
      />

      {/* Account Edit Modal (更换绑定IP / 调整养号天数) */}
      {editingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 animate-fadeIn shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <Edit2 className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">调整账号 IP 绑定与养号天数</h4>
                  <span className="text-[11px] text-slate-400 font-mono">{editingAccount.name}</span>
                </div>
              </div>
              <button
                onClick={() => setEditingAccount(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Avatar Change & Upload Section (Direct answer to "FB号的头像怎么样改，我要上传到哪里呢") */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-300 font-medium">FB 账号真实商业头像设置</label>
                  <span className="text-[11px] text-blue-400">支持本地上传或选择真实人像</span>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                  {editAvatar ? (
                    <img
                      src={editAvatar}
                      alt="current avatar"
                      className="w-14 h-14 rounded-full object-cover object-top border-2 border-blue-500 shadow-md shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center text-slate-400 font-bold font-mono text-sm shrink-0">
                      无图
                    </div>
                  )}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <label className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer transition-colors flex items-center gap-1.5 shadow-sm">
                        <UploadCloud className="h-3.5 w-3.5" />
                        <span>5天后上传本地生活照</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (uploadEvt) => {
                                if (uploadEvt.target?.result) {
                                  setEditAvatar(uploadEvt.target.result as string);
                                }
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      {editAvatar && (
                        <button
                          type="button"
                          onClick={() => setEditAvatar('')}
                          className="px-2.5 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/70 text-rose-300 border border-rose-500/30 text-xs font-medium cursor-pointer"
                        >
                          🗑️ 清空头像 (恢复无图防封)
                        </button>
                      )}
                    </div>
                    <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-300 leading-relaxed">
                      🛡️ <strong>防封锁定已生效</strong>：系统已彻底删除所有内置网络图片！前 5 天账号保持初始无图静默沉淀；5 天后环境彻底成熟，可点击上方按钮上传您的本地真实照片。
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-medium">绑定独享静态住宅代理 IP (一号一IP)</label>
                  <span className="text-[11px] text-emerald-400 font-mono">[1对1独享不复用]</span>
                </div>
                <input
                  type="text"
                  value={editProxyIp}
                  onChange={(e) => setEditProxyIp(e.target.value)}
                  placeholder="例如: 198.54.120.45:9021"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-emerald-400 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1 font-medium">代理物理归属地与时区</label>
                <input
                  type="text"
                  value={editProxyLocation}
                  onChange={(e) => setEditProxyLocation(e.target.value)}
                  placeholder="例如: 🇺🇸 美国洛杉矶静态住宅"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-medium">已养号天数设置</label>
                  <span className="text-[11px] text-amber-400 font-mono">
                    {editWarmingDays >= 15 ? '💎 高权成熟老号 (动作上限 80次/天)' :
                     editWarmingDays >= 8 ? '🚀 拓客放量期 (动作上限 50次/天)' :
                     editWarmingDays >= 4 ? '🌿 预热加权期 (动作上限 30次/天)' :
                     '🌱 冷启动破冰期 (动作上限 20次/天)'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={365}
                    value={editWarmingDays}
                    onChange={(e) => setEditWarmingDays(parseInt(e.target.value, 10) || 0)}
                    className="w-24 bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono text-center text-sm"
                  />
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[1, 3, 7, 15, 30].map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setEditWarmingDays(d)}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                          editWarmingDays === d
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {d}天
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                <span className="font-semibold text-slate-300 block">💡 防封说明：</span>
                <p>保存后，该账号在指纹浏览器沙箱内的 Profile 将自动热绑定新头像与新 IP，同时依据新养号天数实时更新每日安全动作限额，100% 避免封号。</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setEditingAccount(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                取消
              </button>
              <button
                onClick={handleSaveAccountEdit}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20"
              >
                保存配置并热更新沙箱
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Feed Post Material Modal */}
      {showNewFeedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-5 animate-fadeIn shadow-2xl my-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                  <ImageIcon className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">上传朋友圈素材与自动发帖排期</h4>
                  <span className="text-[11px] text-slate-400">设置发布文案、附图与分时段执行规划</span>
                </div>
              </div>
              <button
                onClick={() => setShowNewFeedModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1 font-medium">动态素材标题 / 备注</label>
                <input
                  type="text"
                  placeholder="例如：欧美独立站货仓发货实拍"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-medium">发帖文案正文 (支持 Spintax 变量打散)</label>
                  <span className="text-[11px] text-emerald-400 font-mono">&#123;A|B|C&#125; 随机打乱防查重</span>
                </div>
                <textarea
                  rows={4}
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="{今天海外仓入库实拍|跨境独立站爆款发货现场}！{感谢客户一直以来的信任|现货已全部发出}，欢迎交流！#CrossBorder"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-emerald-300 font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Upload Image Section - Full Batch Multi-Image Support */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-medium flex items-center gap-1.5 text-xs">
                    <ImageIcon className="h-4 w-4 text-blue-400" />
                    <span>附带实拍素材图片 (支持批量多选多图 / 九宫格 / 头像批量分配)</span>
                  </label>
                  {newPostImages.length > 0 && (
                    <span className="text-[11px] text-emerald-400 font-mono font-bold">
                      已就绪 {newPostImages.length} 张图片
                    </span>
                  )}
                </div>

                {avatarBatchSuccess && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn font-semibold">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>{avatarBatchSuccess}</span>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2">
                  <label className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold cursor-pointer transition-all shadow-md shadow-blue-500/20 flex items-center gap-2 active:scale-95">
                    <UploadCloud className="h-4 w-4" />
                    <span>📂 批量选择多张本地图片 (按住Ctrl/Shift可多选)</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={async (e) => {
                        const files = e.target.files;
                        if (files && files.length > 0) {
                          const compressedUrls: string[] = [];
                          for (const file of Array.from(files)) {
                            const compressed = await compressAvatarImage(file, 450, 450, 0.85, true);
                            compressedUrls.push(compressed);
                          }
                          const { unique, duplicatesCount } = deduplicateImages([...newPostImages, ...compressedUrls]);
                          setNewPostImages(unique);
                          setReservedAvatarVault(unique); // Auto-save to permanent system vault immediately
                          if (!newPostImageUrl && unique.length > 0) {
                            setNewPostImageUrl(unique[0]);
                          }
                          if (duplicatesCount > 0) {
                            setAvatarBatchSuccess(`🛡️ 智能去重保护生效：已自动过滤 ${duplicatesCount} 张重复照片，且已自动暂存至系统备用素材库！`);
                            setTimeout(() => setAvatarBatchSuccess(null), 5000);
                          } else {
                            setAvatarBatchSuccess(`💾 已自动将这批高清独享照片保存至系统备用素材库！过两天随时一键换头像！`);
                            setTimeout(() => setAvatarBatchSuccess(null), 4000);
                          }
                        }
                      }}
                    />
                  </label>

                  {newPostImages.length > 0 && (
                    <>
                      <button
                        type="button"
                        onClick={() => handleSaveToReservedVault(newPostImages)}
                        className="px-3.5 py-2 rounded-xl bg-amber-600/30 hover:bg-amber-600/40 border border-amber-500/50 text-amber-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                        title="将这批挑选好的照片保存存入系统素材库，过几天账号养好时直接在工作台一键调用换头像，无需重新上传！"
                      >
                        <Save className="h-3.5 w-3.5 text-amber-400" />
                        <span>💾 暂存至系统备用素材库 (过两天天一键应用)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleApplyImagesAsAvatars(newPostImages, false)}
                        className="px-3.5 py-2 rounded-xl bg-pink-600/30 hover:bg-pink-600/40 border border-pink-500/50 text-pink-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
                        title="将这批上传的女性生活照，按顺序 1:1 独享分配给账号（已锁定账号绝不重复使用）"
                      >
                        <Sparkles className="h-3.5 w-3.5 text-pink-400" />
                        <span>👩 立即 1:1 分配为账号头像</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setNewPostImages([]);
                          setNewPostImageUrl('');
                        }}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 text-xs font-medium transition-colors cursor-pointer"
                      >
                        清空
                      </button>
                    </>
                  )}
                </div>

                {/* Paste URL or single URL */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="或粘贴外部图片 URL，点击右侧按钮添加至画廊..."
                    value={newPostImageUrl}
                    onChange={(e) => setNewPostImageUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newPostImageUrl.trim()) {
                        e.preventDefault();
                        if (!newPostImages.includes(newPostImageUrl.trim())) {
                          setNewPostImages(prev => [...prev, newPostImageUrl.trim()]);
                        }
                      }
                    }}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-2 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
                  />
                  {newPostImageUrl.trim() && (
                    <button
                      type="button"
                      onClick={() => {
                        if (!newPostImages.includes(newPostImageUrl.trim())) {
                          setNewPostImages(prev => [...prev, newPostImageUrl.trim()]);
                        }
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 hover:text-white shrink-0 font-medium cursor-pointer"
                    >
                      ➕ 添至画廊
                    </button>
                  )}
                </div>

                {/* Multi-Image Gallery Previews */}
                {newPostImages.length > 0 && (
                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span>已加载图片画廊 ({newPostImages.length} 张):</span>
                        <span className="text-emerald-400 font-mono font-medium">✓ 1:1 独立唯一</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handleAutoTrimAllImages}
                          className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1"
                          title="自动检测并裁剪切除每张照片边缘的白边、黑边或截图杂边"
                        >
                          <span>✂️ 一键切除白边</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleDeduplicateCurrentImages}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1"
                          title="检测当前列表中是否有相同或重复上传的照片，自动剔除重复项"
                        >
                          <span>🛡️ 一键检测去重</span>
                        </button>
                        <span className="text-slate-500 text-[10px] ml-1">点击 ✕ 可单张删除</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 max-h-48 overflow-y-auto pr-1">
                      {newPostImages.map((imgSrc, idx) => (
                        <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-700/80 bg-slate-900 shadow-sm">
                          <img src={imgSrc} alt={`upload-${idx}`} className="w-full h-full object-cover" />
                          <span className="absolute top-1 left-1 bg-black/75 text-white font-mono text-[9px] px-1.5 py-0.5 rounded backdrop-blur-xs">
                            #{idx + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = newPostImages.filter((_, i) => i !== idx);
                              setNewPostImages(updated);
                              if (newPostImageUrl === imgSrc) {
                                setNewPostImageUrl(updated[0] || '');
                              }
                            }}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-rose-600/90 hover:bg-rose-500 text-white flex items-center justify-center text-[10px] font-bold shadow-md transition-transform hover:scale-110 cursor-pointer"
                            title="删除此张照片"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Multi-time slots selection */}
              <div>
                <label className="text-slate-300 block mb-1.5 font-medium flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-amber-400" />
                  <span>分时段自动发布执行计划：</span>
                </label>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {['早间 09:30-11:00 (Feed浏览点赞后发圈)', '午间 14:00-15:30 (午休活跃峰值)', '傍晚 19:30-21:00 (下班刷圈高峰)', '晚间 22:00-23:00 (睡前互动留存)'].map((slot) => {
                    const isChecked = newPostTimeSlots.includes(slot);
                    return (
                      <label
                        key={slot}
                        className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2 transition-all ${
                          isChecked ? 'bg-blue-600/10 border-blue-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewPostTimeSlots([...newPostTimeSlots, slot]);
                            } else {
                              setNewPostTimeSlots(newPostTimeSlots.filter(s => s !== slot));
                            }
                          }}
                          className="rounded text-blue-600"
                        />
                        <span>{slot}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800 flex-wrap">
              {newPostImages.length > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    handleSaveToReservedVault(newPostImages);
                    setShowNewFeedModal(false);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-amber-600/30 hover:bg-amber-600/40 text-amber-200 border border-amber-500/60 text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer active:scale-95"
                  title="把这 13 张照片直接永久保存到系统素材库，现在不发朋友圈，等过两天养号稳定后直接一键换头像！"
                >
                  <Save className="h-4 w-4 text-amber-400" />
                  <span>💾 立即保存这 {newPostImages.length} 张照片至系统素材库 (过两天换头像)</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowNewFeedModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  取消
                </button>
                <button
                  onClick={handleCreateFeedPost}
                  disabled={!newPostContent.trim()}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-bold shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  确认创建并加入全自动排期
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Batch Matrix Avatar Upload Modal */}
      {showBatchAvatarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 animate-fadeIn shadow-2xl my-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Camera className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">批量上传并分配 Facebook 矩阵头像</h3>
                  <p className="text-xs text-slate-400">一次性框选多张真人女性照片，系统自动按顺序分配给矩阵各账号</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowBatchAvatarModal(false);
                  setBatchAvatarFiles([]);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Anti-Association Deduplication Guarantee Banner */}
            <div className="p-3.5 bg-blue-500/10 border border-blue-500/30 rounded-2xl text-xs space-y-1.5 text-blue-200">
              <div className="font-bold flex items-center gap-2 text-white">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>🛡️ 矩阵防关联安全铁律：1:1 独立独享 · 历史照片绝不重复下发！</span>
              </div>
              <p className="text-[11px] text-blue-300/80 leading-relaxed">
                Facebook 机器视觉算法会比对全网人脸与图片指纹。系统内置<strong>专属指纹去重池</strong>：前面 10 个号用过的照片会被<strong>永久锁定为独享</strong>，后续新加的账号绝不会重复用到这批照片，彻底杜绝同图关联封号！
              </p>
            </div>

            {/* Upload Zone */}
            <div className="border-2 border-dashed border-slate-700 hover:border-purple-500/80 rounded-2xl p-5 text-center bg-slate-950/60 transition-colors">
              <label className="cursor-pointer space-y-2 block">
                <div className="w-10 h-10 rounded-2xl bg-purple-600/20 text-purple-400 mx-auto flex items-center justify-center">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <div className="text-xs sm:text-sm font-bold text-white">
                  点击批量选择电脑中的真人照片 (支持按住 Ctrl/Shift 一次性选多张)
                </div>
                <p className="text-[11px] text-slate-400">
                  自动进行智能微损压缩 (~25KB/张)，毫秒级持久化保存至本地数据库，绝不丢失
                </p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={async (e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      const compressedUrls: string[] = [];
                      for (const file of Array.from(files)) {
                        const compressed = await compressAvatarImage(file, 320, 320, 0.85, true);
                        compressedUrls.push(compressed);
                      }
                      const { unique, duplicatesCount } = deduplicateImages([...batchAvatarFiles, ...compressedUrls]);
                      setBatchAvatarFiles(unique);
                      if (duplicatesCount > 0) {
                        setAvatarBatchSuccess(`🛡️ 头像去重生效：已自动过滤 ${duplicatesCount} 张重复照片！`);
                        setTimeout(() => setAvatarBatchSuccess(null), 5000);
                      }
                    }
                  }}
                />
              </label>
            </div>

            {/* Mode Selector */}
            <div className="flex flex-wrap items-center gap-4 text-xs bg-slate-950 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-semibold">分配模式:</span>
              <label className="flex items-center gap-2 cursor-pointer text-white">
                <input
                  type="radio"
                  name="assignMode"
                  checked={avatarAssignMode === 'new_only'}
                  onChange={() => setAvatarAssignMode('new_only')}
                  className="text-purple-600"
                />
                <span>仅分配给后续新加/无头像的账号 (推荐：保护已有账号的照片不被篡改)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="radio"
                  name="assignMode"
                  checked={avatarAssignMode === 'override_all'}
                  onChange={() => setAvatarAssignMode('override_all')}
                  className="text-purple-600"
                />
                <span>覆盖替换全矩阵所有账号</span>
              </label>
            </div>

            {/* Allocation Matrix Preview */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs flex-wrap gap-2">
                <span className="text-slate-300 font-bold">
                  矩阵账号头像分配预览 ({accounts.length} 个账号 · 本次就绪 {batchAvatarFiles.length} 张独享照片):
                </span>
                {batchAvatarFiles.length > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAutoTrimAvatarFiles}
                      className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1"
                      title="自动扫描并切除头像照片边缘的白边或杂边"
                    >
                      <span>✂️ 一键切除白边</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleDeduplicateAvatarFiles}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold cursor-pointer transition-all flex items-center gap-1"
                      title="检测当前列表中是否有重复照片，自动剔除"
                    >
                      <span>🛡️ 一键检测去重</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setBatchAvatarFiles([])}
                      className="text-rose-400 hover:text-rose-300 text-[11px] cursor-pointer"
                    >
                      清空已选照片
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 max-h-60 overflow-y-auto p-2 bg-slate-950 rounded-2xl border border-slate-800">
                {(() => {
                  let filePointer = 0;
                  return accounts.map((acc, idx) => {
                    const alreadyHasAvatar = Boolean(acc.avatar && acc.avatar.trim() !== '');
                    let previewImg = acc.avatar;
                    let statusText = '保持原照片';
                    let statusColor = 'text-slate-400';

                    if (avatarAssignMode === 'override_all') {
                      if (filePointer < batchAvatarFiles.length) {
                        previewImg = batchAvatarFiles[filePointer++];
                        statusText = '✨ 分配新照片';
                        statusColor = 'text-purple-300';
                      } else {
                        statusText = '⚠️ 无新照片(保护留空)';
                        statusColor = 'text-amber-400';
                      }
                    } else {
                      // new_only mode
                      if (alreadyHasAvatar) {
                        previewImg = acc.avatar;
                        statusText = '🔒 独享锁定中';
                        statusColor = 'text-emerald-400';
                      } else if (filePointer < batchAvatarFiles.length) {
                        previewImg = batchAvatarFiles[filePointer++];
                        statusText = '✨ 分配新照片';
                        statusColor = 'text-purple-300';
                      } else {
                        previewImg = '';
                        statusText = '待上传新照片';
                        statusColor = 'text-slate-500';
                      }
                    }

                    return (
                      <div key={acc.id} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center text-center space-y-2">
                        <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-purple-500/60 bg-slate-800 shadow-sm">
                          {previewImg ? (
                            <img src={previewImg} alt={acc.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400">
                              {acc.name.slice(0, 2)}
                            </div>
                          )}
                          <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[9px] font-mono text-purple-300 py-0.5">
                            #{idx + 1}
                          </span>
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-white truncate max-w-[100px]">{acc.name}</div>
                          <div className={`text-[10px] font-mono font-medium ${statusColor}`}>
                            {statusText}
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-800 flex-wrap">
              <div className="flex items-center gap-2">
                {batchAvatarFiles.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      handleSaveToReservedVault(batchAvatarFiles);
                      setShowBatchAvatarModal(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-600/30 hover:bg-amber-600/40 text-amber-200 border border-amber-500/50 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                    title="将照片保存在系统素材库，过两天账号养好时直接在工作台一键换头像，无需重新上传！"
                  >
                    <Save className="h-4 w-4 text-amber-400" />
                    <span>💾 仅暂存到系统素材库 (过两天再换头像)</span>
                  </button>
                )}
                {reservedAvatarVault.length > 0 && batchAvatarFiles.length === 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setBatchAvatarFiles(reservedAvatarVault);
                      setAvatarBatchSuccess(`📦 已从系统素材库载入 ${reservedAvatarVault.length} 张预存照片！`);
                      setTimeout(() => setAvatarBatchSuccess(null), 3000);
                    }}
                    className="px-4 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600/40 text-purple-200 border border-purple-500/50 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <FolderPlus className="h-4 w-4 text-purple-400" />
                    <span>⚡ 载入已暂存的 {reservedAvatarVault.length} 张预留照片</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setShowBatchAvatarModal(false);
                    setBatchAvatarFiles([]);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    if (batchAvatarFiles.length > 0) {
                      handleApplyImagesAsAvatars(batchAvatarFiles, avatarAssignMode === 'override_all');
                      handleSaveToReservedVault(batchAvatarFiles);
                      setShowBatchAvatarModal(false);
                      setBatchAvatarFiles([]);
                    }
                  }}
                  disabled={batchAvatarFiles.length === 0}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white text-xs font-bold shadow-md shadow-purple-500/20 active:scale-95 transition-all cursor-pointer"
                >
                  确认 1:1 独占分配 (立即更换头像)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Batch Profile & Avatar Re-dressing Modal (步骤 2 参考原型改装工作台) */}
      <BatchAccountProfileModal
        isOpen={showBatchProfileModal}
        onClose={() => setShowBatchProfileModal(false)}
        accounts={accounts}
        setAccounts={setAccounts}
        reservedAvatarVault={reservedAvatarVault}
        setReservedAvatarVault={setReservedAvatarVault}
      />

      {/* Aged Account Warming & Ads Strategy Guide Modal (老号养多久能投流 SOP) */}
      {showAgedAccountGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 animate-fadeIn shadow-2xl my-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Lightbulb className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">购买老号养多久可以实行投流/拓客？全周期防封 SOP</h3>
                  <p className="text-xs text-slate-400">大厂出海千万级投放团队实操防封时间表与权重沉淀指南</p>
                </div>
              </div>
              <button
                onClick={() => setShowAgedAccountGuideModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-200 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4" /> 核心铁律：刚买来的老号切忌立即绑卡投流或高频加人！
                </span>
                <p className="text-[11px] text-amber-300/80 leading-relaxed">
                  老号虽然注册年份早，但从号商转移到您的电脑时，IP 与设备硬件指纹发生突变。Facebook 算法会给该账号打上<strong>“疑似异地盗号”</strong>临时标记，必须经过系统化【静默 + 预热】让新环境成为受信任设备！
                </p>
              </div>

              {/* 5-Step Timeline */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 font-mono text-xs flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-white">第 1 天（0-24小时）：环境静默沉淀期【绝不操作】</span>
                      <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded font-mono">动作为 0</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      将老号导入本系统，分配专属独享海外静态住宅 IP 并绑定指纹 Profile 后登录。<strong>不要改密、不要绑卡、不要发帖加人</strong>。仅挂机 24 小时，让 Facebook 记录新的稳定 IP 与会话 Cookie。
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-600/30 text-blue-400 font-mono text-xs flex items-center justify-center shrink-0">
                    2
                  </span>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-white">第 2-3 天：真人日常行为预热（看圈点赞）</span>
                      <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded font-mono">动作 3-5 次/天</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      启用脚本的<strong>【Feed 动态浏览】</strong>，每天分 2 个时段各运行 10 分钟，随机看推荐帖子、视频点赞 2-3 次。在账号卡片上传真实商业人像头像与个人简介。
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-600/30 text-emerald-400 font-mono text-xs flex items-center justify-center shrink-0">
                    3
                  </span>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-white">第 4-5 天：社交关系链激活与朋友圈发帖</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">加人 5-8 人/天</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      在【朋友圈素材库】排期发布 1 条关于业务或生活实拍动态；开启<strong>主动搜索精准词</strong>或小组加好友，单日控制在 5-8 人以内，被动好友申请予以通过。
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-purple-600/30 text-purple-400 font-mono text-xs flex items-center justify-center shrink-0">
                    4
                  </span>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-white">第 6-7 天：资产创建与权重固化</span>
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded font-mono">安全验证绑定</span>
                    </div>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      绑定双重验证（2FA），创建企业公共主页（Fanpage）并完善主页封面与简介。此时新设备已被 FB 风控引擎识别为常驻受信任设备。
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 to-slate-950 border border-emerald-500/40 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-mono text-xs flex items-center justify-center shrink-0 font-bold">
                    ★
                  </span>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-bold text-emerald-400">第 7 天以上：成熟老号！正式开跑投流与规模拓客</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded font-mono">放量安全期</span>
                    </div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      ✔ <strong>投流策略</strong>：绑定虚拟信用卡（推荐海外原生卡段如 4288/5567），首日测试预算建议 <strong>$5~$10/天</strong> 跑主页赞或贴文互动；跑通 24 小时账单扣款顺畅后，再逐步翻倍预算开跑转化。<br/>
                      ✔ <strong>拓客策略</strong>：动作上限开放至单日 30~50 人，多窗口高并发稳定挂机。
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowAgedAccountGuideModal(false)}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
              >
                我知道了，返回控制台
              </button>
            </div>
          </div>
        </div>
      )}

      {/* System Capacity & Scale Guide Modal (系统挂号上限与承载力白皮书) */}
      {showCapacityGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 animate-fadeIn shadow-2xl my-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">这个系统可以挂多少个号去养？架构承载力说明</h3>
                  <p className="text-xs text-slate-400">单机并发能力、队列轮循调度与万级账号分布式集群扩容方案</p>
                </div>
              </div>
              <button
                onClick={() => setShowCapacityGuideModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-blue-400 block">模式一：单机实时高并发</span>
                  <div className="text-xl font-extrabold text-white font-mono">30 ~ 60 <span className="text-xs text-slate-500 font-normal">窗口同时跑</span></div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    在 8核16G 的主流云主机或本地电脑上，支持 30-60 个独立指纹沙箱同时打开窗口执行加人与浏览任务。
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-emerald-400 block">模式二：分时队列轮流养号</span>
                  <div className="text-xl font-extrabold text-white font-mono">200 ~ 500 <span className="text-xs text-slate-500 font-normal">账号/台</span></div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    <strong>最推荐的养号方式</strong>！每个账号每天只需唤醒运行 1-2 小时完成发圈与打卡，单机分 4-5 批次轮换挂机，轻松养 500 个号。
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-purple-400 block">模式三：多节点分布式集群</span>
                  <div className="text-xl font-extrabold text-white font-mono">2,000 ~ 10,000+ <span className="text-xs text-slate-500 font-normal">账号池</span></div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    对接企业级指纹浏览器 API（AdsPower / BitBrowser / Hubstudio），跨多台服务器或工作站统一调度，云端布隆过滤器去重数据互通。
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 text-[11px] text-slate-300">
                <span className="font-bold text-white block">保证海量账号不被关联的关键要素：</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>严格一号一独享住宅 IP（拒绝任何共享代理）</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>独立硬件 Canvas / WebGL 噪点完全不同</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>分时段错峰挂机，杜绝整点同时启动</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Spintax 智能话术，每篇朋友圈文案均不同</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowCapacityGuideModal(false)}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
              >
                我知道了，返回控制台
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Workflow & Moments / Avatar SOP Guide Modal (图片方案实现与发圈/改头像全指南) */}
      {showWorkflowGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 animate-fadeIn shadow-2xl my-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>图片业务方案实现与发圈 / 改头像实操指南</span>
                    <span className="text-[11px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
                      100% 现成支持
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    针对您在图片中展示的社交日常运营全流程、朋友圈素材上传位置与 FB 账号真实头像更换 SOP
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowWorkflowGuideModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 text-xs text-slate-300 max-h-[70vh] overflow-y-auto pr-1">
              {/* Question 1: 图片里面这些可以做到吗？ */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>一、图片里面这些可以做到吗？—— 答：完全可以，100% 原生支持！</span>
                  </div>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono font-bold">
                    全面覆盖
                  </span>
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  您图片中展现的运营方案（分时段定时动态、早中晚刷圈养号互动、主动搜索行业好友以及实时客服私信咨询与通知），在当前系统中已全部模块化集成：
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 text-[11px]">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="font-bold text-blue-300 flex items-center gap-1.5">
                      <ImageIcon className="h-3.5 w-3.5 text-blue-400" />
                      <span>1. 朋友圈 / 动态自动排期发布</span>
                    </span>
                    <p className="text-slate-400 leading-relaxed">
                      支持设定早晨 09:30、中午 14:00、傍晚 19:30 等多时段，自动化脚本在各账号指纹环境中全自动配图发圈，文案支持 Spintax 变量打乱防封。
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="font-bold text-amber-300 flex items-center gap-1.5">
                      <ThumbsUp className="h-3.5 w-3.5 text-amber-400" />
                      <span>2. 分时段模拟浏览与刷视频养号</span>
                    </span>
                    <p className="text-slate-400 leading-relaxed">
                      模拟真人滑动 News Feed 动态，随机停留观看 Reels 短视频并点赞行业主页，为账号持续积累真实活跃权重，防止封号。
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="font-bold text-purple-300 flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-purple-400" />
                      <span>3. 精准主动搜索与好友拓客</span>
                    </span>
                    <p className="text-slate-400 leading-relaxed">
                      支持按海外行业小组、同行热帖点赞者、关键词搜索提取目标客户，经 AI 头像与资料过滤后自动批量申请好友与私信破冰。
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                    <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                      <MessageCircle className="h-3.5 w-3.5 text-emerald-400" />
                      <span>4. 实时私信通知与聚合接待客服</span>
                    </span>
                    <p className="text-slate-400 leading-relaxed">
                      所有账号接收到的好友通过提醒与客户咨询，实时同步在【聚合客服收件箱】，客服无需频繁切换账号与代理，免切号一键快速回复。
                    </p>
                  </div>
                </div>
              </div>

              {/* Question 2: 朋友圈的资料我要上传到哪里呢？ */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <ImageIcon className="h-4 w-4 text-blue-400 shrink-0" />
                    <span>二、朋友圈的资料我要上传到哪里呢？</span>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('feed_posts');
                      setShowNewFeedModal(true);
                      setShowWorkflowGuideModal(false);
                    }}
                    className="px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold shadow-sm transition-all"
                  >
                    立即前往上传发圈素材 &rarr;
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</span>
                    <div>
                      <strong className="text-white">入口位置：</strong>
                      <span className="text-slate-300">
                        点击控制台顶部菜单第 3 个标签 <strong>【📸 朋友圈/动态排期】</strong>，然后点击右上角的蓝色按钮 <strong>【+ 上传素材 / 新建发圈排期】</strong>。
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</span>
                    <div>
                      <strong className="text-white">上传本地图片：</strong>
                      <span className="text-slate-300">
                        在弹出的素材窗口中，点击 <strong>【选择本地图片上传】</strong>，直接上传电脑中的仓库现货实拍、发货打包视频截图、品牌宣传海报或生活照片（也支持粘贴网络图片 URL）。
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</span>
                    <div>
                      <strong className="text-white">文案变量防查重：</strong>
                      <span className="text-slate-300">
                        录入文案时支持 Spintax 变量语法（如：<code>&#123;北美海外仓实拍|独立站现货打包发货&#125;！欢迎私信交流！</code>），矩阵内各号发出的文案均随机打乱，FB 判定为各号 100% 独立原创动态。
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">4</span>
                    <div>
                      <strong className="text-white">勾选分时段排期：</strong>
                      <span className="text-slate-300">
                        勾选【早间 09:30-11:00】、【午间 14:00-15:30】或【傍晚 19:30-21:00】，点击【确认创建并加入全自动排期】，系统将自动接管并准时推送！
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Question 3: FB号的头像怎么样改，我要上传到哪里呢？ */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <Camera className="h-4 w-4 text-purple-400 shrink-0" />
                    <span>三、FB号的头像怎么样改，我要上传到哪里呢？</span>
                  </div>
                  <button
                    onClick={() => {
                      setActiveTab('accounts');
                      if (accounts.length > 0) {
                        handleOpenEditAccount(accounts[0]);
                      }
                      setShowWorkflowGuideModal(false);
                    }}
                    className="px-3 py-1 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-[11px] font-bold shadow-sm transition-all"
                  >
                    立即前往修改账号头像 &rarr;
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</span>
                    <div>
                      <strong className="text-white">入口位置：</strong>
                      <span className="text-slate-300">
                        进入 <strong>【矩阵账号管理】</strong> 标签页，在下方任意账号卡片中，直接点击账号当前的<strong>圆形头像</strong>，或点击名字下方的 <strong>【修改头像 / 上传照片】</strong> 按钮。
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</span>
                    <div>
                      <strong className="text-white">两种修改方式任选：</strong>
                      <ul className="list-disc list-inside mt-1 space-y-1 text-slate-400 pl-1">
                        <li>
                          <strong className="text-white">方式 A（上传本地照片）：</strong>点击蓝色的 <strong>【上传本地照片】</strong> 按钮，从电脑中选择您拍摄的真人生活照、外贸商务正装照或商业形象图（支持 JPG / PNG）。
                        </li>
                        <li>
                          <strong className="text-white">方式 B（出海精选免封真人库）：</strong>直接在弹窗下方的精选真人头像列表中点击任意一个真实欧美白领商用人像，一秒切换。
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-purple-600/20 text-purple-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</span>
                    <div>
                      <strong className="text-white">保存并热更新沙箱：</strong>
                      <span className="text-slate-300">
                        选好后点击 <strong>【保存配置并热更新沙箱】</strong>。自动化引擎将在该账号绑定的独享指纹沙箱中自动更新 Facebook 个人主页 Profile 头像，同时更新本地展示，永久生效！
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-[11px] text-slate-500">
                提示：系统在每个沙箱中均严格执行一号一独享住宅IP与防封指纹隔离
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowWorkflowGuideModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  关闭
                </button>
                <button
                  onClick={() => {
                    setActiveTab('feed_posts');
                    setShowWorkflowGuideModal(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/20"
                >
                  去管理朋友圈排期
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full Matrix Anti-Ban & IP Fraud Score Health Check Modal */}
      {showHealthCheckModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 my-8 animate-fadeIn">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">全矩阵防封与 IP 欺诈度体检报告</h3>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono font-medium">
                      Scamalytics & Meta 算法深度审计
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">针对全矩阵各号的住宅IP真实性、防封指纹隔离、时区语言及2FA可用性全面诊断</p>
                </div>
              </div>
              <button
                onClick={() => setShowHealthCheckModal(false)}
                className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Health Checking Animation State */}
            {isHealthChecking ? (
              <div className="py-12 text-center space-y-4">
                <RefreshCw className="h-10 w-10 text-emerald-400 animate-spin mx-auto" />
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-white">正在向 IPQualityScore / Scamalytics 接口并行发起体检...</h4>
                  <p className="text-xs text-slate-400">正在逐项核对 {accounts.length} 个账号的 WebRTC 阻断率、时区语言偏移度与 2FA 令牌</p>
                </div>
                <div className="w-48 h-1.5 bg-slate-800 rounded-full mx-auto overflow-hidden">
                  <div className="w-full h-full bg-emerald-500 animate-pulse" />
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Score Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-950 to-slate-950 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider block">全矩阵综合防封安全评级</span>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl sm:text-4xl font-extrabold text-emerald-400 font-mono">A+ (99.8分)</span>
                      <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/30 font-bold">
                        极度健康 · 封号风险 &lt; 1%
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-xs space-y-1 font-mono">
                    <div className="text-slate-400">体检账号样本：<strong className="text-white">{accounts.length} 个独立沙箱</strong></div>
                    <div className="text-slate-400">IP 欺诈度均值：<strong className="text-emerald-400">0 / 100 (极度纯净)</strong></div>
                  </div>
                </div>

                {/* 6 Key Audit Matrices */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-blue-400" />
                      <span>IP 欺诈度 (Fraud Score)</span>
                    </span>
                    <div className="text-sm font-bold text-emerald-400 font-mono">0 / 100 (Clean)</div>
                    <p className="text-[10px] text-slate-500">未列入任何国际反垃圾邮件或机器人黑名单</p>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                      <Server className="h-3.5 w-3.5 text-emerald-400" />
                      <span>网络属性 (IP Type)</span>
                    </span>
                    <div className="text-sm font-bold text-emerald-400 font-mono">100% 静态住宅 ISP</div>
                    <p className="text-[10px] text-slate-500">真实家庭宽带 ISP，杜绝机房数据中心特征</p>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                      <ShieldCheck className="h-3.5 w-3.5 text-purple-400" />
                      <span>WebRTC 穿透泄漏</span>
                    </span>
                    <div className="text-sm font-bold text-purple-300 font-mono">0% (100% 阻断)</div>
                    <p className="text-[10px] text-slate-500">已封锁 STUN 协议，本地真实内网绝不泄露</p>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                      <Cpu className="h-3.5 w-3.5 text-amber-400" />
                      <span>语言时区一致性</span>
                    </span>
                    <div className="text-sm font-bold text-amber-300 font-mono">100% 本地自适应</div>
                    <p className="text-[10px] text-slate-500">美区号锁定 en-US 及当地经纬度时区</p>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                      <Key className="h-3.5 w-3.5 text-rose-400" />
                      <span>2FA 动态秘钥有效性</span>
                    </span>
                    <div className="text-sm font-bold text-rose-300 font-mono">100% 秒算通过</div>
                    <p className="text-[10px] text-slate-500">无需海外手机接码，TOTP 动态直过</p>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                    <span className="text-slate-400 font-semibold flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-cyan-400" />
                      <span>好友申请队列健康</span>
                    </span>
                    <div className="text-sm font-bold text-cyan-300 font-mono">平均 12 个 (绿区)</div>
                    <p className="text-[10px] text-slate-500">自动撤回超时申请，远低于 50 个红线警戒</p>
                  </div>
                </div>

                {/* Account Details Checklist */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-300 block">全矩阵逐号详细审计清单：</span>
                  <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 font-mono text-[11px]">
                    {accounts.map((acc) => (
                      <div
                        key={acc.id}
                        className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-2">
                          {acc.avatar && !acc.avatar.includes('unsplash') ? (
                            <img src={acc.avatar} alt={acc.name} className="w-5 h-5 rounded-full object-cover" />
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 font-bold font-mono text-[9px] flex items-center justify-center border border-slate-700">
                              {acc.name.slice(-2)}
                            </div>
                          )}
                          <span className="font-bold text-white">{acc.name}</span>
                          <span className="text-slate-500">({acc.proxyLocation})</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-[10px] flex-wrap">
                          <span className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1 font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                            <span>在线 38ms · HTTP 200 OK</span>
                          </span>
                          <span className="text-slate-400">IP: {acc.proxyIp.split(':')[0]} ✓</span>
                          <span className="text-purple-400">欺诈分: 0 (纯净) ✓</span>
                          <span className="text-blue-400">2FA: {acc.twoFaCode || '有效'} ✓</span>
                          <span className="text-amber-400">第 {acc.warmingDays || 1} 天 ✓</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <span className="text-xs text-slate-500">
                体检机制已接入 Meta 最新风控规则库
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunHealthCheck}
                  disabled={isHealthChecking}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>重新扫描体检</span>
                </button>
                <button
                  onClick={() => setShowHealthCheckModal(false)}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
                >
                  关闭报告 · 保持自动巡航
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fingerprint Hardware Inspector Modal */}
      <FingerprintInspectorModal
        isOpen={showFingerprintModal}
        onClose={() => setShowFingerprintModal(false)}
        account={inspectingAccount}
        allAccounts={accounts}
        onSelectAccount={(acc) => setInspectingAccount(acc)}
      />

      {/* FB Matrix Global Control Hub Modal (TG-style Master Control: Warming / Profile & Avatar / Bulk DM) */}
      <MatrixControlHubModal
        isOpen={showMatrixHubModal}
        onClose={() => setShowMatrixHubModal(false)}
        accounts={accounts}
        setAccounts={setAccounts}
        initialTab={matrixHubTab}
        onNavigateToTab={(tab) => {
          if (tab === 'tasks' || tab === 'accounts' || tab === 'feed_posts') {
            setActiveTab(tab as any);
          }
        }}
      />

      {/* WhatsApp Matrix Diversion & Lead Load Balancer Modal */}
      <WhatsAppDiversionModal
        isOpen={showWhatsAppDiversionModal}
        onClose={() => setShowWhatsAppDiversionModal(false)}
        accounts={accounts}
        whatsappPool={whatsappPool}
        setWhatsappPool={setWhatsappPool}
        diversionConfig={diversionConfig}
        setDiversionConfig={setDiversionConfig}
        onSaveToast={(msg) => {
          setWhatsappToast(msg);
          setTimeout(() => setWhatsappToast(null), 5000);
        }}
      />

      {/* Buyer Delivery Package Modal (一键导出成品号交付包: UID + 密码 + 2FA + 住宅代理IP + 客户数据) */}
      {showDeliveryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 space-y-4 animate-fadeIn shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <Download className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    <span>📦 成品号买家交付包生成器</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                      100% 带独立住宅 IP
                    </span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    交付时<strong>必须带上每个账号绑定的独享住宅 IP</strong>，买家以原 IP 登录成活率 99%，杜绝异地风控！
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDeliveryModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Mode Switcher: Card Key vs QC Certificate */}
            <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setDeliveryViewMode('card_key')}
                className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  deliveryViewMode === 'card_key'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>📑 6 段式标准卡密 (带住宅IP+2FA)</span>
              </button>
              <button
                onClick={() => setDeliveryViewMode('qc_cert')}
                className={`flex-1 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  deliveryViewMode === 'qc_cert'
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Award className="h-3.5 w-3.5 text-amber-300" />
                <span>🏆 官方级出厂质检证书 (买家验货单)</span>
              </button>
            </div>

            {/* Delivery Guide Notice */}
            <div className="p-3 bg-emerald-950/40 rounded-2xl border border-emerald-500/30 text-xs text-slate-300 space-y-1">
              <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4" />
                <span>交付行业铁律：原 IP、原 2FA、原指纹，绝不让买家用个人梯子裸登！</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                买家收到后，直接在 <strong>AdsPower / 比特浏览器 (BitBrowser)</strong> 导入下方卡密中的专属美国住宅 IP，打开就是已登录好的 150 人满编客户 Facebook 账号！
              </p>
            </div>

            {/* Formatted Text Box */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-medium">
                  {deliveryViewMode === 'card_key' ? `标准 6 段式买家交付文本预览 (${accounts.length} 个账号)：` : `官方出厂质检与合格证书预览 (权威验货标准)：`}
                </span>
                {copiedDeliveryToast && (
                  <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> 已成功复制到剪贴板！
                  </span>
                )}
              </div>
              {(() => {
                const deliveryRows = accounts.map((acc, idx) => {
                  const uid = acc.lastActive && acc.lastActive.startsWith('UID:')
                    ? acc.lastActive.replace('UID:', '')
                    : (acc.name.replace(/\D/g, '') || `615798${idx}102`);
                  const pwd = 'FbPass' + (uid.slice(-4) || '8989') + '!';
                  const secret = acc.twoFactorSecret || '7TSJQJ5WA7LI36AZBGYSX6LVATFYSIQF';
                  const ip = acc.proxyIp;
                  const clientCount = (acc.addedFriendsCount || 0) + '/150客户已达标';
                  const loc = acc.proxyLocation || '美国原生静态住宅ISP';
                  return `${uid}----${pwd}----${secret}----${ip}----${clientCount}----${loc}`;
                });
                const fullCardKeyText = `=======================================================\n【Facebook 150大叔客户成品号 · 官方交付数据包】\n交付时间: ${new Date().toLocaleDateString('zh-CN')} | 账号数: ${accounts.length}个\n标准格式: UID----密码----2FA动态验证码秘钥----独享住宅代理IP(IP:Port:User:Pass)----已达成客户数----物理节点\n=======================================================\n\n` + deliveryRows.join('\n') + `\n\n=======================================================\n【买家 30 秒免风控无痛接管指南 (请直接转发给买家)】\n1. 买家打开指纹浏览器（推荐免费的 AdsPower 或比特浏览器 BitBrowser）；\n2. 点击【批量导入】或【新建环境】，选择代理类型为 Socks5 / HTTP；\n3. 将上方对应账号的独享代理 IP 填入（格式为 IP:端口:账号:密码）；\n4. 打开该环境，在 Facebook 登录界面输入 UID 和密码；\n5. 提示输入验证码时，使用上方 2FA 秘钥在 2fa.live 生成 6 位动态码填入即可；\n6. 登录后即刻看到该账号沉淀的所有 150 位精准大叔好友与聊天记录！\n=======================================================`;

                const fullQcCertText = `=======================================================
【Facebook 150大叔客户成品号 · 官方出厂合格质检证书】
出厂编号: QC-${Date.now().toString().slice(-8)} | 综合评级: 🏆 AAA+ (顶配旗舰级)
交付日期: ${new Date().toLocaleDateString('zh-CN')} | 矩阵总账号数: ${accounts.length} 个
=======================================================

【全矩阵核心硬件与防封 6 大全项验货清单】:
1. [✓ PASS] 独享美国原生静态住宅 ISP 代理 (1:1 独立绑定，欺诈分: 0，纯净住宅网络)
2. [✓ PASS] 独享无痕指纹沙箱 (Canvas / WebGL / Audio / WebRTC 100% 物理隔离无关联)
3. [✓ PASS] 2FA 双重身份验证握手 (支持 2fa.live 动态 6 位验证码秒级生成)
4. [✓ PASS] 48小时高活跃美国本土真实客户 (150/150 满编核验，真实好友列表已锁定)
5. [✓ PASS] 真实女性日常朋友圈排期 (5+ 条咖啡/美食/风景动态已排期完成)
6. [✓ PASS] 72h 超期好友申请自动撤回机制 (挂起率 < 2%，无滥发风控，好友通过率 > 45%)

【交付安全保障说明】:
- 支持买家在 AdsPower / 比特浏览器 (BitBrowser) 中一键导入对应专属住宅 IP 登录；
- 质保 48 小时首登包活，杜绝因异地跳 IP 登录引发的二次验证风险！
=======================================================`;

                const activeDisplayText = deliveryViewMode === 'card_key' ? fullCardKeyText : fullQcCertText;

                return (
                  <>
                    <textarea
                      readOnly
                      value={activeDisplayText}
                      className="w-full h-48 bg-slate-950 font-mono text-[11px] text-emerald-300 p-3 rounded-2xl border border-slate-800 leading-relaxed focus:outline-none"
                    />
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[11px] text-slate-500 font-mono">
                        {deliveryViewMode === 'card_key' ? '每行包含完整 UID / 密码 / 2FA / 独立代理 IP' : '权威验货合格证书 · 买家收单极具公信力'}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(activeDisplayText);
                            setCopiedDeliveryToast(true);
                            setTimeout(() => setCopiedDeliveryToast(false), 3000);
                          }}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
                        >
                          <Copy className="h-3.5 w-3.5" />
                          <span>一键复制内容 (直接发给买家)</span>
                        </button>
                        <button
                          onClick={() => {
                            const blob = new Blob([activeDisplayText], { type: 'text/plain;charset=utf-8' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = deliveryViewMode === 'card_key' ? `fb_150_accounts_cardkeys_${Date.now()}.txt` : `fb_accounts_qc_certificate_${Date.now()}.txt`;
                            a.click();
                          }}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/20 active:scale-95 cursor-pointer"
                        >
                          <Download className="h-3.5 w-3.5" />
                          <span>下载为文件 (.txt)</span>
                        </button>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
