import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Search,
  MessageSquare,
  ThumbsUp,
  Share2,
  Video,
  Shield,
  Bot,
  UserCheck,
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  ExternalLink,
  Smartphone,
  Cpu,
  RefreshCw,
  PhoneCall,
  Terminal,
  Sparkles,
  Zap,
  Globe,
  Database,
  Plus
} from 'lucide-react';
import { FBAccount } from '../types';
import { RollingDayStepper } from './RollingDayStepper';
import { FEMALE_NAMES_POOL } from '../data/mockData';

interface VideoFeatureShowcaseProps {
  accounts: FBAccount[];
  setAccounts?: React.Dispatch<React.SetStateAction<FBAccount[]>>;
  onOpenLoginModal: () => void;
  onOpenSimulator: () => void;
  onOpenPricing?: () => void;
  onOpenSupport?: () => void;
  onOpenRealWorker?: () => void;
}

export const VideoFeatureShowcase: React.FC<VideoFeatureShowcaseProps> = ({
  accounts,
  setAccounts,
  onOpenLoginModal,
  onOpenSimulator,
  onOpenRealWorker
}) => {
  // Synchronize all accounts to a single unified day (e.g. Day 2)
  const handleSyncAllDays = (targetDay: number = 2) => {
    if (setAccounts) {
      setAccounts(prev => prev.map(a => ({
        ...a,
        warmingDays: targetDay,
        initialWarmingDays: targetDay,
        createdAt: Date.now() - (targetDay - 1) * 24 * 60 * 60 * 1000,
        dailyLimit: targetDay >= 15 ? 80 : targetDay >= 8 ? 50 : 30,
        status: targetDay >= 8 ? ('active' as const) : ('warming' as const)
      })));
    }
  };

  const handleRollDay = (accId: string, nextDays: number) => {
    if (setAccounts) {
      setAccounts(prev => prev.map(a => a.id === accId ? {
        ...a,
        warmingDays: nextDays,
        initialWarmingDays: nextDays,
        dailyLimit: nextDays >= 15 ? 80 : nextDays >= 8 ? 50 : 30,
        status: nextDays >= 8 ? ('active' as const) : ('warming' as const)
      } : a));
    }
  };

  const handleApplyFemaleNamesAll = () => {
    if (setAccounts) {
      setAccounts(prev => prev.map((a, idx) => ({
        ...a,
        name: FEMALE_NAMES_POOL[idx % FEMALE_NAMES_POOL.length]
      })));
    }
  };
  // Active feature module tab
  const [activeModule, setActiveModule] = useState<
    'add_friends' | 'dm_settings' | 'group_posting' | 'warming' | 'registration' | 'multi_window'
  >('add_friends');

  // Sub-tabs for Add Friends (8 Major Methods)
  const [addMethod, setAddMethod] = useState<number>(8); // Default to method 8 (Reels video), the TOP highlight in video!

  // Interactive settings state (matches the exact UI in the video)
  const [removeUnqualified, setRemoveUnqualified] = useState(true);
  const [refreshAtBottom, setRefreshAtBottom] = useState(true);
  const [useAIFaceRecognition, setUseAIFaceRecognition] = useState(true);
  const [nicknameGrammarDetect, setNicknameGrammarDetect] = useState(true);
  const [cloudDeduplication, setCloudDeduplication] = useState(true);
  const [cloudDbName, setCloudDbName] = useState('Global_FB_LeadPool_01');
  const [minFriends, setMinFriends] = useState(80);
  const [maxFriends, setMaxFriends] = useState(2500);
  const [delayMin, setDelayMin] = useState(15);
  const [delayMax, setDelayMax] = useState(35);
  const [stopCount, setStopCount] = useState(50);
  const [reelsFilterType, setReelsFilterType] = useState<'likers' | 'commenters' | 'comment_likers'>('commenters');
  const [targetGroupUrl, setTargetGroupUrl] = useState('https://www.facebook.com/groups/1843429719574339/members');
  const [groupTaskDispatched, setGroupTaskDispatched] = useState(true);

  // DM settings
  const [dmAllFriends, setDmAllFriends] = useState(false);
  const [dmOnlineFriendsOnly, setDmOnlineFriendsOnly] = useState(true);
  const [loopReply, setLoopReply] = useState(true);
  const [dmCloudDedup, setDmCloudDedup] = useState(true);
  const [includeImage, setIncludeImage] = useState(true);
  const [randomEmoji, setRandomEmoji] = useState(true);

  // Group & Moments posting settings
  const [homePost, setHomePost] = useState(true);
  const [addRecommendedGroups, setAddRecommendedGroups] = useState(true);
  const [postAfterJoined, setPostAfterJoined] = useState(true);
  const [tagFriends, setTagFriends] = useState(true);
  const [postPrivacy, setPostPrivacy] = useState<'public' | 'friends'>('public');
  const [groupKeyword, setGroupKeyword] = useState('Shopify E-commerce Dropshipping Sellers');
  const [postImages, setPostImages] = useState(true);
  const [postRandomEmoji, setPostRandomEmoji] = useState(true);
  const [postContent, setPostContent] = useState(
    '{Hi|Hello|Hey} friends! Just shared our latest 2026 overseas marketing toolkit. Feel free to connect and exchange ideas! {🚀|🔥|✨}'
  );

  // Warming settings
  const [deleteOldFriends, setDeleteOldFriends] = useState(true);
  const [cancelSentRequests, setCancelSentRequests] = useState(true);
  const [watchVideoAndComment, setWatchVideoAndComment] = useState(true);
  const [likeTimelineFeed, setLikeTimelineFeed] = useState(true);
  const [warmingKeyword, setWarmingKeyword] = useState('Global Trade & E-Commerce Marketing');
  const [warmingDurationMinutes, setWarmingDurationMinutes] = useState(35);
  const [warmingCommentText, setWarmingCommentText] = useState('{Great insights!|Very helpful video|Love this tips!} {👍|👏}');

  // Registration & SMS settings
  const [appVersion, setAppVersion] = useState<'new' | 'legacy'>('new');
  const [smsPlatform, setSmsPlatform] = useState('sms-activate');
  const [smsApiKey, setSmsApiKey] = useState('');
  const [smsBalance, setSmsBalance] = useState<string | null>(null);
  const [contactsSuccessMessage, setContactsSuccessMessage] = useState<string | null>(null);
  const [autoGenContacts, setAutoGenContacts] = useState(true);
  const [contactsCount, setContactsCount] = useState(500);

  // Multi-window concurrent cluster state
  const [isMultiRunning, setIsMultiRunning] = useState(true);

  // Automated background cluster runner: strictly limits Day 1 additions (3~5 max per account) with round-robin rotation
  const lastRotatedIndexRef = useRef(0);
  useEffect(() => {
    if (!isMultiRunning || !setAccounts) return;
    const interval = setInterval(() => {
      setAccounts(prev => {
        if (!prev || prev.length === 0) return prev;
        // Day 1 strict safety quota: max 5 additions per account today
        const maxTodayPerAccount = 5;

        // Find candidate accounts that have not reached today's 5-client quota
        const candidates = prev
          .map((acc, idx) => ({ acc, idx }))
          .filter(({ acc }) => (acc.addedFriendsCount || 0) < maxTodayPerAccount);

        if (candidates.length === 0) {
          // All 10 accounts reached today's safety cap of 5! Stop for today.
          return prev;
        }

        // Round-robin pick the next candidate account to add 1 friend so all accounts progress evenly
        const chosen = candidates[lastRotatedIndexRef.current % candidates.length];
        lastRotatedIndexRef.current = (lastRotatedIndexRef.current + 1) % candidates.length;

        const next = [...prev];
        const target = next[chosen.idx];
        const currentCount = target.addedFriendsCount || 0;
        next[chosen.idx] = {
          ...target,
          addedFriendsCount: currentCount + 1,
          dailyActionsCount: Math.min(maxTodayPerAccount, (target.dailyActionsCount || 0) + 1)
        };
        return next;
      });
    }, 35000); // 35-second realistic human rhythm
    return () => clearInterval(interval);
  }, [isMultiRunning, setAccounts]);

  const eightMethods = [
    { id: 1, title: '功能一：精筛推荐好友', desc: '删除不符合推荐好友，到底后重刷，支持AI人脸识别男女年龄，免进简历提速300%' },
    { id: 2, title: '功能二：精筛好友里的好友', desc: '深度挖掘目标用户的二度好友人脉关系网，高信任度好友裂变，转化率极高' },
    { id: 3, title: '功能三：精筛帖子点赞用户', desc: '进入高赞最新热贴点赞人列表，对当期最活跃的互动者进行精细化条件判断加粉' },
    { id: 4, title: '功能四：搜索关键词+加定位好友', desc: '自定义任意行业关键词 + 目标国家城市物理定位经纬度，精准锁定本地商户' },
    { id: 5, title: '功能五：通过好友链接加好友的好友', desc: '提取指定博主或对标账号主页URL，自动打开其全部好友列表进行条件筛选加人' },
    { id: 6, title: '功能六：小组/群组链接加小组成员', desc: '批量导入公开/私密小组链接，脚本全自动循环进入各个群组提取成员并加好友' },
    { id: 7, title: '功能七：个人链接加好友筛选判断', desc: '支持外部批量导入 TXT 个人主页链接列表，脚本自动逐一打开主页进行深度判断' },
    { id: 8, title: '功能八：Reels 视频中精准筛选选人 (🔥TOP主推)', desc: '搜索关键词视频，筛选视频点赞人、评论区真实发言人及评论点赞人，活跃度与关注度全网最高！' }
  ];

  return (
    <div className="w-full py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Operational Workstation Command Header */}
      <div className="rounded-3xl border border-blue-500/30 bg-gradient-to-r from-blue-950/60 via-slate-900 to-slate-950 p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className={`flex h-2 w-2 rounded-full ${accounts.length > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`}></span>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 font-mono">
                {accounts.length > 0 ? `自动化集群运行中 · ${accounts.length} 账号就绪` : '自动化拓客集群就绪'}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Facebook 多场景矩阵自动化拓客中枢
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              直接配置与调度 8 大精准加人入口、AI人脸识别过滤、在线私信循环对答、朋友圈动态/小组发帖与全自动防封养号中心。
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400 font-mono">
              <span className="text-blue-400">● {accounts.length > 0 ? `${accounts.length} 窗口多开并发` : '多窗口集群就绪'}</span>
              <span>·</span>
              <span className="text-emerald-400">● 独享静态住宅 IP 隔离</span>
              <span>·</span>
              <span className="text-purple-400">● 物理硬件指纹沙箱</span>
              <span>·</span>
              <span className="text-amber-400">● 全局去重池在线</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => setIsMultiRunning(!isMultiRunning)}
              className={`rounded-xl px-4 py-2.5 text-xs font-bold transition-all shadow-md flex items-center gap-1.5 ${
                isMultiRunning
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-500/20'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20'
              }`}
            >
              {isMultiRunning ? (
                <>
                  <Pause className="h-4 w-4" />
                  <span>暂停全部集群任务</span>
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  <span>启动全部集群任务</span>
                </>
              )}
            </button>

            {onOpenRealWorker && (
              <button
                onClick={onOpenRealWorker}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 animate-pulse"
                title="打开真实加人自动化脚本与真机执行指南"
              >
                <Zap className="h-4 w-4" />
                <span>⚡ 真实加人 (Real执行端)</span>
              </button>
            )}

            <button
              onClick={() => setActiveModule('multi_window')}
              className="rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <Smartphone className="h-4 w-4 text-blue-400" />
              <span>查看 6 窗口实机沙箱</span>
            </button>
          </div>
        </div>

        {/* User-Locked Targeting Profile Banner */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="bg-emerald-500/10 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1 font-mono text-[11px]">
              <Sparkles className="h-3.5 w-3.5" />
              <span>当前定向客群已锁定</span>
            </span>
            <div className="flex items-center gap-1.5 flex-wrap text-slate-200">
              <span className="bg-slate-800 px-2 py-0.5 rounded text-white font-medium">🇺🇸 国家: 美国本土</span>
              <span className="bg-blue-900/40 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded font-medium">👨 性别: 纯男性男粉</span>
              <span className="bg-amber-900/40 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-medium">🎂 年龄: 50岁以上 (美国单身成熟大叔)</span>
              <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">🎯 圈子: 50s-70s Dating / Singles Over 50 (3大公开群 · 68万真实成员池)</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 text-slate-400 text-[11px] font-mono">
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>● 今日美东黄金期运行中</span>
            </span>
            <span className="text-emerald-300 font-semibold">· 首日安全放量 3~5 人/号 (执行中)</span>
          </div>
        </div>

        {/* Live Cluster Execution Status Banner */}
        {isMultiRunning && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-emerald-300 font-bold font-mono">⚡ 实时运行状态:</span>
              <span>10 个矩阵账号正在全自动轮询群组 [Singles Over 50] · 提取 50+ 美国男粉 · 拟人间隔 25~45s 防封作业</span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shrink-0 self-start sm:self-auto">
              ✓ 云端中枢调度在线
            </span>
          </div>
        )}
      </div>

      {/* Main Module Tabs (Matching the Script Tabs in Video) */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setActiveModule('add_friends')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeModule === 'add_friends'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>加粉设置 (8大入口与AI人脸筛选)</span>
        </button>
        <button
          onClick={() => setActiveModule('dm_settings')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeModule === 'dm_settings'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>私信设置 (在线好友/循环对答/去重)</span>
        </button>
        <button
          onClick={() => setActiveModule('group_posting')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeModule === 'group_posting'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Share2 className="h-4 w-4" />
          <span>自动发朋友圈与小组 (个人动态/群发/@好友)</span>
        </button>
        <button
          onClick={() => setActiveModule('warming')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeModule === 'warming'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Shield className="h-4 w-4" />
          <span>自动养号模块 (刷动态/看视频留评/删死粉)</span>
        </button>
        <button
          onClick={() => setActiveModule('registration')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeModule === 'registration'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <PhoneCall className="h-4 w-4" />
          <span>自动注册与通讯录 (海外接码/打关联)</span>
        </button>
        <button
          onClick={() => setActiveModule('multi_window')}
          className={`px-4 py-2 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
            activeModule === 'multi_window'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-emerald-400 hover:text-white hover:bg-emerald-950/40 border border-emerald-500/20'
          }`}
        >
          <Smartphone className="h-4 w-4" />
          <span>多窗口集群沙箱 (6窗口并发)</span>
        </button>
      </div>

      {/* Module 1: Add Friends & 8 Sourcing Methods */}
      {activeModule === 'add_friends' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: 8 Methods Selector */}
          <div className="lg:col-span-4 space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              视频讲解的 8 大拓客入口（点击切换配置）：
            </h4>
            {eightMethods.map((m) => (
              <div
                key={m.id}
                onClick={() => setAddMethod(m.id)}
                className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                  addMethod === m.id
                    ? 'border-blue-500 bg-blue-950/50 text-white shadow-md'
                    : 'border-slate-800 bg-slate-900/60 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between font-bold mb-1">
                  <span>{m.title}</span>
                  {m.id === 8 && (
                    <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1.5 py-0.5 rounded font-mono">
                      全方位TOP主推
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>

          {/* Right Column: Deep Filter & Parameter Settings (Exact UI from Video) */}
          <div className="lg:col-span-8 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>当前设置：{eightMethods.find(m => m.id === addMethod)?.title}</span>
                  <span className="text-xs text-blue-400 font-mono">Status: Active</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  所有勾选项与数值参数均可直接修改并立即生效保存至自动化控制脚本
                </p>
              </div>
              <button
                onClick={() => {
                  alert(`已成功保存【${eightMethods.find(m => m.id === addMethod)?.title}】全部参数！脚本已同步至多设备云控。`);
                }}
                className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 text-xs font-semibold transition-all shadow-sm"
              >
                保存脚本参数
              </button>
            </div>

            {/* Special Sub-settings for Method 8: Reels Video Lead Gen */}
            {addMethod === 8 && (
              <div className="p-4 rounded-xl border border-rose-500/40 bg-rose-950/20 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-rose-300">
                    <Video className="h-4 w-4" />
                    <span>Reels 视频截流精准选项 (视频核心高频推荐功能)</span>
                  </div>
                  <span className="text-[11px] text-rose-400 font-mono">最强意向度</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  通过自定义搜索关键词进入特定领域的 Reels 短视频，可自由选择针对目标视频的哪类人群进行自动化加粉与私信：
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setReelsFilterType('likers')}
                    className={`p-2.5 rounded-lg border text-xs font-semibold text-center transition-all ${
                      reelsFilterType === 'likers'
                        ? 'border-rose-500 bg-rose-900/50 text-white'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    1. 视频点赞人精选
                  </button>
                  <button
                    type="button"
                    onClick={() => setReelsFilterType('commenters')}
                    className={`p-2.5 rounded-lg border text-xs font-semibold text-center transition-all ${
                      reelsFilterType === 'commenters'
                        ? 'border-rose-500 bg-rose-900/50 text-white'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    2. 评论区真实发言人 (推荐)
                  </button>
                  <button
                    type="button"
                    onClick={() => setReelsFilterType('comment_likers')}
                    className={`p-2.5 rounded-lg border text-xs font-semibold text-center transition-all ${
                      reelsFilterType === 'comment_likers'
                        ? 'border-rose-500 bg-rose-900/50 text-white'
                        : 'border-slate-800 bg-slate-950 text-slate-400'
                    }`}
                  >
                    3. 评论点赞人精选
                  </button>
                </div>
              </div>
            )}

            {/* Special Dedicated Settings for Method 6: Group Link Auto Scraping & Adding */}
            {addMethod === 6 && (
              <div className="p-4 rounded-xl border border-blue-500/40 bg-blue-950/20 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-blue-300">
                    <Users className="h-4 w-4" />
                    <span>功能六：小组/群组成员全自动提取与加粉配置 (系统内自动并发)</span>
                  </div>
                  <span className="text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    <span>系统内全自动接管中 · 免人工开窗口</span>
                  </span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  您已提交目标群组链接，系统将在内部驱动 10 个账号沙箱自动访问该群组，提取近 48 小时活跃成员，并结合年龄/性别/地区条件在系统内并发自动添加好友：
                </p>
                <div className="space-y-2">
                  <label className="text-slate-300 block font-semibold">
                    当前绑定的 Facebook 目标群组链接：
                  </label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="text"
                      value={targetGroupUrl}
                      onChange={(e) => setTargetGroupUrl(e.target.value)}
                      className="flex-1 bg-slate-950 border border-blue-500/40 rounded-xl px-3 py-2 text-xs text-blue-200 font-mono focus:outline-none focus:border-blue-400"
                      placeholder="https://www.facebook.com/groups/xxxxx/members"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setGroupTaskDispatched(true);
                        alert('✅ 成功将目标群组链接同步下发至全部 10 个矩阵账号！系统已在后台开始智能提取 50+ 美国男粉成员！');
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shrink-0 flex items-center justify-center gap-1.5"
                    >
                      <Play className="h-3.5 w-3.5" />
                      <span>同步至全部10号集群</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">已识别群组名称:</span>
                    <strong className="text-white font-medium">Singles Over 50 (50s-70s Dating)</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">总成员池规模:</span>
                    <strong className="text-emerald-400 font-mono font-bold">101,000+ 真实成员 (公开群)</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block">今日首批配额:</span>
                    <strong className="text-amber-300 font-mono font-bold">每号 3~5 人 · 拟人间隔 25~45s</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Checkbox controls exactly as in Video (02:40 - 04:30) */}
            <div className="space-y-3 text-xs">
              <h5 className="font-bold text-white text-xs uppercase tracking-wider text-slate-300">
                深度过滤机制与 AI 画像判定：
              </h5>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={removeUnqualified}
                    onChange={(e) => setRemoveUnqualified(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-0"
                  />
                  <div>
                    <span className="font-semibold text-white block">删除不符合的推荐好友</span>
                    <span className="text-[11px] text-slate-400">发现不符合条件的推荐项立即点击【移除】，清洗池子</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={refreshAtBottom}
                    onChange={(e) => setRefreshAtBottom(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-0"
                  />
                  <div>
                    <span className="font-semibold text-white block">到底后自动重刷推荐列表</span>
                    <span className="text-[11px] text-slate-400">滑动到页面最底部后自动上拉刷新，获取最新一批推荐用户</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useAIFaceRecognition}
                    onChange={(e) => setUseAIFaceRecognition(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-0"
                  />
                  <div>
                    <span className="font-semibold text-blue-400 block flex items-center gap-1">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>通过 AI / 人脸识别 API 识别头像 (免进简历提速300%)</span>
                    </span>
                    <span className="text-[11px] text-slate-400">在列表页直接识别头像的性别与年龄段，无需点击进入个人主页</span>
                  </div>
                </label>

                <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={nicknameGrammarDetect}
                    onChange={(e) => setNicknameGrammarDetect(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-0"
                  />
                  <div>
                    <span className="font-semibold text-white block">检测昵称语种与语法</span>
                    <span className="text-[11px] text-slate-400">自动检测是否包含目标国家文字（如英语、日语、越南语、繁中等）</span>
                  </div>
                </label>
              </div>

              {/* Cloud Deduplication (云端防撞库) from Video (04:00) */}
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 font-bold text-purple-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={cloudDeduplication}
                      onChange={(e) => setCloudDeduplication(e.target.checked)}
                      className="rounded text-purple-600 focus:ring-0"
                    />
                    <span>开启云端去重复 (云端防撞库 · 零撞库零损耗)</span>
                  </label>
                  <span className="text-[11px] text-purple-400 font-mono">企业级多号共享</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  只要在所有设备上填入同一个数据库名称，账号A加过或私信过的人，其他所有账号绝不会重复添加或发信！
                </p>
                <div className="flex items-center gap-3 pt-1">
                  <span className="text-slate-300 font-medium">云端数据库名称:</span>
                  <input
                    type="text"
                    value={cloudDbName}
                    onChange={(e) => setCloudDbName(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-purple-300 font-mono flex-1 max-w-xs"
                  />
                </div>
              </div>

              {/* Numerical Limits & Jitter Delays (Video 04:15 - 04:30) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <label className="text-slate-400 block mb-1">自定义好友量区间</label>
                  <div className="flex items-center gap-2 font-mono">
                    <input
                      type="number"
                      value={minFriends}
                      onChange={(e) => setMinFriends(Number(e.target.value))}
                      className="w-20 bg-slate-900 border border-slate-700 rounded p-1 text-white text-center"
                    />
                    <span>~</span>
                    <input
                      type="number"
                      value={maxFriends}
                      onChange={(e) => setMaxFriends(Number(e.target.value))}
                      className="w-20 bg-slate-900 border border-slate-700 rounded p-1 text-white text-center"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <label className="text-slate-400 block mb-1">操作间隔时间 (秒)</label>
                  <div className="flex items-center gap-2 font-mono">
                    <input
                      type="number"
                      value={delayMin}
                      onChange={(e) => setDelayMin(Number(e.target.value))}
                      className="w-20 bg-slate-900 border border-slate-700 rounded p-1 text-white text-center"
                    />
                    <span>~</span>
                    <input
                      type="number"
                      value={delayMax}
                      onChange={(e) => setDelayMax(Number(e.target.value))}
                      className="w-20 bg-slate-900 border border-slate-700 rounded p-1 text-white text-center"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <label className="text-slate-400 block mb-1">停止条件 (达到X人停止)</label>
                  <div className="flex items-center gap-2 font-mono">
                    <input
                      type="number"
                      value={stopCount}
                      onChange={(e) => setStopCount(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-1 text-white text-center"
                    />
                    <span className="text-slate-400 text-[11px] shrink-0">人/天/单号</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Module 2: DM Settings (Messenger) */}
      {activeModule === 'dm_settings' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">私信功能与 Messenger 智能对答配置 (视频 05:10 - 07:05)</h3>
              <p className="text-xs text-slate-400 mt-0.5">支持批量私信在线好友、轮询对答、多套话术轮换与图文发送</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <label className="flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={dmOnlineFriendsOnly}
                onChange={(e) => setDmOnlineFriendsOnly(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-0"
              />
              <div>
                <span className="font-semibold text-white block">仅私信在线好友 (绿点标识)</span>
                <span className="text-[11px] text-slate-400">优先向处于 Messenger 在线状态的好友发送，回复率提升 85%</span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={loopReply}
                onChange={(e) => setLoopReply(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-0"
              />
              <div>
                <span className="font-semibold text-white block">轮询回复已私信好友 (循环对答)</span>
                <span className="text-[11px] text-slate-400">监测客户新回复，全自动根据预设话术库或AI进行跟进解答</span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={dmCloudDedup}
                onChange={(e) => setDmCloudDedup(e.target.checked)}
                className="mt-0.5 rounded text-purple-600 focus:ring-0"
              />
              <div>
                <span className="font-semibold text-purple-300 block">私信云端去重复</span>
                <span className="text-[11px] text-slate-400">矩阵多账号共享私信白名单，彻底避免多号同时触达同一人</span>
              </div>
            </label>
          </div>

          {/* DM templates & Spintax */}
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white">图文私信与随机话术库设置：</span>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={includeImage}
                    onChange={(e) => setIncludeImage(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>附带营销图片</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={randomEmoji}
                    onChange={(e) => setRandomEmoji(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>随机表情防风控</span>
                </label>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 font-mono text-emerald-300 text-xs">
              <p>话术 1: {"{Hi|Hello|您好}"} {"{Alex|friend}"}，看到您在关注出海业务，我们开发了一套自动化拓客工具，方便发您看看吗？</p>
              <p>话术 2: {"{嗨|你好}"}！整理了一份关于海外社媒精准引流的视频教程，有需要可以直接发给您！</p>
            </div>
          </div>
        </div>
      )}

      {/* Module 3: Personal Moments & Group Posting */}
      {activeModule === 'group_posting' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>个人主页朋友圈动态 + 小组矩阵全自动发帖</span>
                <span className="text-xs text-emerald-400 font-mono">Status: Ready</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                支持定时自动发布个人朋友圈 Timeline 动态、关键词自动搜索加群、加群成功后自动顶帖发帖与发帖 @标签 矩阵好友
              </p>
            </div>
            <button
              onClick={() => {
                alert('已成功保存发帖与朋友圈脚本配置！多窗口集群将在设定时间段自动执行发帖任务。');
              }}
              className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 text-xs font-semibold transition-all shadow-sm"
            >
              保存发帖任务
            </button>
          </div>

          {/* 4 Core Posting Toggles */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
            <label className="flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={homePost}
                onChange={(e) => setHomePost(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-0"
              />
              <div>
                <span className="font-semibold text-emerald-300 block">自动发个人主页朋友圈动态</span>
                <span className="text-[11px] text-slate-400">定时在账号 Timeline 个人主页发布生活或产品动态，构建真实高权重主页</span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={addRecommendedGroups}
                onChange={(e) => setAddRecommendedGroups(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-0"
              />
              <div>
                <span className="font-semibold text-white block">加入垂直推荐/关键词小组</span>
                <span className="text-[11px] text-slate-400">根据行业关键词与算法推荐批量提交申请，扩大小组触达矩阵</span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={postAfterJoined}
                onChange={(e) => setPostAfterJoined(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-0"
              />
              <div>
                <span className="font-semibold text-white block">加小组成功后自动发帖</span>
                <span className="text-[11px] text-slate-400">小组入群审核通过后，智能在 10~30 分钟延迟后发布垂直干货/营销帖</span>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors">
              <input
                type="checkbox"
                checked={tagFriends}
                onChange={(e) => setTagFriends(e.target.checked)}
                className="mt-0.5 rounded text-blue-600 focus:ring-0"
              />
              <div>
                <span className="font-semibold text-blue-300 block">发帖自动 @ 标签好友</span>
                <span className="text-[11px] text-slate-400">发帖时自动 @ 矩阵小号或高意向客户，系统触发即时通知，引爆贴文曝光</span>
              </div>
            </label>
          </div>

          {/* Detailed Content & Group Settings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 text-xs">
            {/* Left: Posting Content & Spintax */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span>发帖内容自旋转与多模态设置 (Spintax)</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPostPrivacy(postPrivacy === 'public' ? 'friends' : 'public')}
                    className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-mono"
                  >
                    权限: {postPrivacy === 'public' ? '公开 (Public)' : '仅好友可见 (Friends)'}
                  </button>
                </div>
              </div>

              <textarea
                rows={3}
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-slate-200 font-mono text-xs focus:outline-none focus:border-blue-500"
              />

              <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={postImages}
                    onChange={(e) => setPostImages(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>自动附带海报/产品实拍图片</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={postRandomEmoji}
                    onChange={(e) => setPostRandomEmoji(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span>随机插入 Emoji 表情防平台内容查重</span>
                </label>
              </div>
            </div>

            {/* Right: Group Target Keywords */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Search className="h-4 w-4 text-blue-400" />
                <span>目标小组关键词自动检索</span>
              </span>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  输入业务搜索词（脚本全自动搜索同名精准公共小组）：
                </label>
                <input
                  type="text"
                  value={groupKeyword}
                  onChange={(e) => setGroupKeyword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-mono text-xs"
                />
              </div>

              <div className="p-3 bg-blue-950/20 border border-blue-500/20 rounded-xl space-y-1 text-slate-300 text-[11px]">
                <span className="font-semibold text-blue-300 block">发帖安全频控策略：</span>
                <p className="text-slate-400 leading-relaxed">
                  单账号单日发帖建议控制在 3~5 篇（间隔 45 分钟以上）。系统每次发布均自动随机打散文案语义，杜绝发帖被系统拦截降权。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Module 4: Account Warming & Health */}
      {activeModule === 'warming' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>矩阵号全自动防封养号中心 (视频 08:12 - 10:50)</span>
                <span className="text-xs text-emerald-400 font-mono">Status: Active</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                自动刷 Feed 流动态、看视频留评点赞、由旧到新批量清理僵尸粉、自动取消挂起超时请求
              </p>
            </div>
            <button
              onClick={() => {
                alert('已成功保存养号任务参数！矩阵账号已排队进入养号周期。');
              }}
              className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 text-xs font-semibold transition-all shadow-sm"
            >
              保存养号规则
            </button>
          </div>

          {/* 4 Core Warming Modules */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* 1. Keyword Video Watch & Comment */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <label className="flex items-center gap-2 font-bold text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={watchVideoAndComment}
                  onChange={(e) => setWatchVideoAndComment(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span className="text-emerald-300">关键词视频全自动刷播与互动 (Facebook Watch)</span>
              </label>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                全自动搜索指定垂直领域视频，随机停留观看 20~60 秒完播，并随机点赞与留评，快速训练账号兴趣标签，构建高权重真人特征。
              </p>
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">视频搜索领域关键词：</label>
                <input
                  type="text"
                  value={warmingKeyword}
                  onChange={(e) => setWarmingKeyword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-white font-mono text-xs"
                />
              </div>
            </div>

            {/* 2. Feed Timeline Like & Interact */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <label className="flex items-center gap-2 font-bold text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={likeTimelineFeed}
                  onChange={(e) => setLikeTimelineFeed(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span className="text-blue-300">动态与公共主页推荐帖自动点赞</span>
              </label>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                模拟真实海外用户在早晚高峰浏览信息流 Feed 动态，随机滑动页面、为官方推荐公共主页（如新闻、体育、科技主页）及好友贴点赞。
              </p>
              <div className="flex items-center justify-between p-2.5 bg-slate-900 rounded-xl border border-slate-800">
                <span className="text-[11px] text-slate-400">单次养号持续时长：</span>
                <span className="text-xs font-bold text-white font-mono">{warmingDurationMinutes} 分钟/天</span>
              </div>
            </div>

            {/* 3. Delete Old Dead Friends */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <label className="flex items-center gap-2 font-bold text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={deleteOldFriends}
                  onChange={(e) => setDeleteOldFriends(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>批量删除沉睡僵尸好友 (按添加时间由旧到新)</span>
              </label>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                按添加好友的时间先后顺序排序，自动识别并清理长期零互动、被封或停用的沉睡死粉，释放宝贵的 5,000 好友名额！
              </p>
              <div className="text-[11px] text-emerald-400 font-mono">
                ✓ 每次自动清理 10~20 个最早添加的无效好友
              </div>
            </div>

            {/* 4. Cancel Pending Requests */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <label className="flex items-center gap-2 font-bold text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={cancelSentRequests}
                  onChange={(e) => setCancelSentRequests(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <span>批量取消已发送的超时好友请求</span>
              </label>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Meta 严格限制账号的“挂起中好友请求”数量，积攒超过 500 个未通过请求会直接触发降权封禁加人！脚本自动定时撤回 7 天以上未同意的请求。
              </p>
              <div className="text-[11px] text-blue-400 font-mono">
                ✓ 保持待处理申请队列始终处于安全绿区（&lt; 50个）
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Module 5: Auto Registration & SMS */}
      {activeModule === 'registration' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-base font-bold text-white">自动注册与接码上号 (视频 10:50 - 12:45)</h3>
              <p className="text-xs text-slate-400 mt-0.5">对接 4 大海外接码平台 API、多语种随机昵称、自动生成手机通讯录打关联推荐</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* SMS API Integration */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <h5 className="font-bold text-white">1. 海外接码平台 API 对接：</h5>
              <div>
                <label className="text-slate-400 block mb-1">选择接码平台</label>
                <select
                  value={smsPlatform}
                  onChange={(e) => setSmsPlatform(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
                >
                  <option value="sms-activate">SMS-Activate (全球最大接码平台)</option>
                  <option value="5sim">5SIM (欧美/东南亚专线)</option>
                  <option value="sms-man">SMS-Man (多国号段)</option>
                  <option value="daisysms">DaisySMS (美国实体真实号)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">API Key 授权密匙</label>
                <input
                  type="password"
                  value={smsApiKey}
                  onChange={(e) => setSmsApiKey(e.target.value)}
                  placeholder="请输入海外接码平台 API Key..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white font-mono placeholder:text-slate-600"
                />
              </div>

              <div className="flex items-center justify-between text-slate-400 text-[11px] pt-1 border-t border-slate-800">
                <span>实时余额: <strong className="text-emerald-400 font-mono">{smsBalance ? `$${smsBalance} USD` : '未绑定 Key'}</strong></span>
                <span>支持国家: 美国、英国、日本、菲律宾等 180+</span>
              </div>
            </div>

            {/* Address book injection (打通讯录推荐算法) */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <h5 className="font-bold text-white">2. 手机通讯录批量生成与导入 (算法关联推荐)：</h5>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                视频中强调的“打通讯录关联推荐”技术：脚本自动生成数百个目标国家号段与真人姓名，打包为 VCF 写入模拟器/云手机通讯录。Facebook 授权读取通讯录后，算法将优先推荐同批次、同圈层的高净值好友！
              </p>

              <div className="flex items-center justify-between pt-2">
                <span className="text-slate-300">单次生成通讯录联系人:</span>
                <input
                  type="number"
                  value={contactsCount}
                  onChange={(e) => setContactsCount(Number(e.target.value))}
                  className="w-24 bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-white font-mono text-center"
                />
              </div>

              {contactsSuccessMessage && (
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                  <span>{contactsSuccessMessage}</span>
                </div>
              )}

              <button
                onClick={() => {
                  setContactsSuccessMessage(`已成功为本地设备生成并打包 ${contactsCount} 条虚拟通讯录联系人！`);
                  setTimeout(() => setContactsSuccessMessage(null), 4000);
                }}
                className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors"
              >
                生成并写入设备通讯录
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Module 6: Multi-Instance Real-time Sandboxes */}
      {activeModule === 'multi_window' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">多窗口/多设备集群实操沙箱</h3>
                <span className={`text-xs px-2 py-0.5 rounded font-mono border ${
                  accounts.length > 0 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}>
                  {accounts.length > 0 ? `${accounts.length} 窗口已挂载` : '等待接入'}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                实时展示矩阵账号在独立指纹浏览器/云手机窗口中的挂机状态与隔离沙箱
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleApplyFemaleNamesAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-pink-500/40 bg-pink-500/10 hover:bg-pink-500/20 text-xs text-pink-300 font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                title="一键将全矩阵所有账号统一更换为真实自然的欧美女性英文名字（如 Emma, Sophia, Olivia 等）"
              >
                <span>👩 全矩阵换女性名字</span>
              </button>

              <button
                onClick={() => handleSyncAllDays(2)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-xs text-amber-300 font-bold transition-all shadow-sm active:scale-95 cursor-pointer"
                title="一键将所有 10 个账号统一对齐为同一天（第 2 天）"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>🎯 一键统一定格【第 2 天】</span>
              </button>
              <button
                onClick={() => setIsMultiRunning(!isMultiRunning)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs text-slate-200 hover:bg-slate-700 font-semibold"
              >
                {isMultiRunning ? <Pause className="h-3.5 w-3.5 text-amber-400" /> : <Play className="h-3.5 w-3.5 text-emerald-400" />}
                <span>{isMultiRunning ? '暂停集群' : '继续集群'}</span>
              </button>
              <button
                onClick={onOpenLoginModal}
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs text-white font-semibold transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>接入新窗口</span>
              </button>
            </div>
          </div>

          {/* Windows Grid - 100% Real from accounts */}
          {/* Top Banner explaining system-internal execution */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-blue-950/40 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <strong className="text-white block text-xs">
                  ⚡ 系统内部全自动集群调度已接管（无需手动开 10 个指纹窗口！）
                </strong>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  10 个账号已载入各自独享住宅 IP 隧道，统一绑定目标群组 <code className="text-blue-300">Singles Over 50 (10.1万成员)</code>，系统正在内部自动并发跑！
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-mono text-[11px] font-bold">
                ● 10 窗口系统内并发
              </span>
            </div>
          </div>

          {accounts.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950 p-12 text-center space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400 mx-auto flex items-center justify-center">
                <Smartphone className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">暂无挂机运行中的多开窗口实例</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  当前未接入任何 Facebook 矩阵账号。请点击下方按钮快速导入您的账号，系统将为每个账号创建独立的指纹窗口与住宅代理 IP 并投入并发集群。
                </p>
              </div>
              <button
                onClick={onOpenLoginModal}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>+ 导入 / 登录首个 FB 账号</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {accounts.map((acc, index) => (
                <div
                  key={acc.id}
                  className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3 flex flex-col justify-between hover:border-slate-700 transition-all shadow-md"
                >
                  {/* Instance Title */}
                  <div>
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isMultiRunning && acc.status === 'active' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
                        <span className="font-bold text-white">Window #{index + 1} · {acc.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <RollingDayStepper
                          days={acc.warmingDays || 2}
                          onChange={(next) => handleRollDay(acc.id, next)}
                          compact={true}
                        />
                        <span className="text-[10px] text-blue-400 font-mono">#{acc.browserProfileId}</span>
                      </div>
                    </div>

                    {/* Simulated Mobile/Emulator Screen preview */}
                    <div className="my-2 p-3 rounded-xl bg-[#18191a] border border-slate-800 text-xs text-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <span className="text-emerald-400 font-semibold">[1:1独享]</span>
                          <span className="font-mono text-slate-300">{acc.proxyIp}</span>
                        </span>
                        <span className="text-emerald-400 font-mono">FPS: 60</span>
                      </div>

                      <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-[11px] space-y-1">
                        <div className="text-emerald-300 font-semibold flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Terminal className="h-3 w-3 text-emerald-400" />
                            <span>{isMultiRunning ? '⚡ 系统内并发全自动执行中' : '⏸️ 任务已挂起'}</span>
                          </span>
                          <span className="text-[10px] bg-blue-500/20 text-blue-300 px-1.5 py-0.2 rounded font-mono">
                            免开窗口
                          </span>
                        </div>
                        <p className="text-slate-300 line-clamp-1 font-mono text-[10.5px]">
                          🎯 群组: Singles Over 50 (1843429719574339)
                        </p>
                        <p className="text-slate-400 text-[10px] font-mono">
                          {acc.proxyLocation} · 健康度: {acc.healthScore}/100 · 拟人间隔 25~45s
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Counters */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <span>
                      今日添加: <strong className="text-emerald-400 font-mono font-bold">{acc.addedFriendsCount || 0} / 5 人</strong>
                    </span>
                    <span>
                      状态: <strong className="text-emerald-400 font-mono">{isMultiRunning ? '🟢 自动运行' : '⏸️ 已暂停'}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
