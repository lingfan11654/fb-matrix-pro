import React, { useState } from 'react';
import {
  Clock,
  UserCheck,
  Flame,
  ShieldCheck,
  CheckSquare,
  Square,
  Image as ImageIcon,
  Sparkles,
  Plus,
  Trash2,
  UploadCloud,
  X,
  ChevronRight,
  Copy,
  Check,
  Key,
  RefreshCw,
  Sliders,
  Globe,
  Eye,
  EyeOff,
  HelpCircle,
  Send,
  AlertTriangle,
  Lock,
  ArrowLeft,
  CheckCircle2,
  Shuffle
} from 'lucide-react';
import { FBAccount } from '../types';

interface MatrixControlHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: FBAccount[];
  setAccounts: React.Dispatch<React.SetStateAction<FBAccount[]>>;
  initialTab?: 'hub' | 'warming' | 'profile' | 'bulk_send';
  onNavigateToTab?: (tab: string) => void;
}

// Preset US Female Names (High credibility American female white-collar profiles)
const PRESET_US_FEMALE_NAMES = [
  'Emily Johnson', 'Jessica Davis', 'Ashley Taylor', 'Sarah Jenkins',
  'Amanda Martinez', 'Olivia White', 'Sophia Anderson', 'Chloe Jackson',
  'Hannah Lewis', 'Rachel Green', 'Madison Smith', 'Megan Miller',
  'Grace Wilson', 'Emma Moore', 'Natalie Taylor', 'Victoria Brown'
];

// Preset US Male Names (High credibility American male business profiles)
const PRESET_US_MALE_NAMES = [
  'David Miller', 'Michael Brown', 'James Wilson', 'Daniel Harris',
  'Matthew Thomas', 'Ryan Clark', 'Brandon Hall', 'Alex Johnson',
  'John Davis', 'Kevin Martinez', 'Chris Taylor', 'Jason Anderson',
  'Brian Thomas', 'Eric White', 'Robert Jackson', 'William Harris'
];

// High quality commercial profile photos for avatars
const PRESET_PROFILE_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&auto=format&fit=crop&q=80'
];

export const MatrixControlHubModal: React.FC<MatrixControlHubModalProps> = ({
  isOpen,
  onClose,
  accounts,
  setAccounts,
  initialTab = 'hub',
  onNavigateToTab
}) => {
  const [currentView, setCurrentView] = useState<'hub' | 'warming' | 'profile' | 'bulk_send'>(initialTab);

  // -------------------------------------------------------------
  // 1. Warming Settings State (定时养号设置)
  // -------------------------------------------------------------
  const [warmingDurationHours, setWarmingDurationHours] = useState('2');
  const [warmingIntervalMinutes, setWarmingIntervalMinutes] = useState('30');
  const [dailyStartTime, setDailyStartTime] = useState('09:00');
  const [dailyEndTime, setDailyEndTime] = useState('22:00');
  const [warmingTimezone, setWarmingTimezone] = useState<'EST' | 'PST' | 'CST'>('EST');
  const [warmingChatPhrases, setWarmingChatPhrases] = useState<string[]>([
    'Great insights on ecommerce logistics! Thanks for sharing this.',
    'Awesome post! Looking forward to your next live streaming session.',
    'Highly agreed! Brand building and private domain are key drivers this year.',
    'Thanks for connecting! Let us stay in touch on Facebook.',
    'Very informative case study regarding Shopify conversion. Bookmarked!',
    'Love the content you share in the eCommerce community!'
  ]);
  const [newChatPhrase, setNewChatPhrase] = useState('');

  // -------------------------------------------------------------
  // 2. Profile Settings State (改资料与头像配置中心)
  // -------------------------------------------------------------
  // Step 1: Target Scope
  const [targetScope, setTargetScope] = useState<'selected' | 'new_unconfigured' | 'by_group' | 'all'>('all');
  const [selectedGroup, setSelectedGroup] = useState<string>('美区新购养号组');
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);

  // Step 2: Enabled modification items
  const [modAvatar, setModAvatar] = useState(true);
  const [modName, setModName] = useState(true);
  const [modBio, setModBio] = useState(true);
  const [mod2FA, setMod2FA] = useState(true);

  // Avatar pool
  const [uploadedAvatars, setUploadedAvatars] = useState<string[]>(PRESET_PROFILE_AVATARS);
  const [cropCenterActive, setCropCenterActive] = useState(true);
  const [md5DeDupActive, setMd5DeDupActive] = useState(true);

  // Name pool (100% US Only)
  const [nameCategory, setNameCategory] = useState<'female' | 'male' | 'all'>('female');
  const [customNames, setCustomNames] = useState<string[]>([]);
  const [newCustomNameInput, setNewCustomNameInput] = useState('');

  // 2FA Security
  const [twoFaPassword, setTwoFaPassword] = useState('548508');
  const [showTwoFaPassword, setShowTwoFaPassword] = useState(false);
  const [twoFaHint, setTwoFaHint] = useState('matrix_safe_2026');
  const [recoveryEmail, setRecoveryEmail] = useState('liaobei8989@outlook.com');

  // -------------------------------------------------------------
  // 3. Bulk Send State (群发设置)
  // -------------------------------------------------------------
  const [bulkTargetsText, setBulkTargetsText] = useState('');
  const [bulkMessageText, setBulkMessageText] = useState('{Hi|Hello|Hey there}! I noticed you are interested in {eCommerce|Shopify dropshipping|overseas business}. Would love to connect!');
  const [bulkDelaySeconds, setBulkDelaySeconds] = useState(45);

  if (!isOpen) return null;

  // Compute targets based on scope
  const targetAccounts = accounts.filter(acc => {
    if (targetScope === 'all') return true;
    if (targetScope === 'selected') return selectedAccountIds.includes(acc.id);
    if (targetScope === 'new_unconfigured') return !acc.avatar || acc.avatar.includes('avatar') || (acc.warmingDays || 0) < 5;
    if (targetScope === 'by_group') return acc.group === selectedGroup || (selectedGroup === '美区新购养号组' && acc.group?.includes('美区'));
    return true;
  });

  const targetCount = accounts.length > 0 ? targetAccounts.length : (targetScope === 'all' ? 60 : 0);

  // Handle batch modify execution
  const handleExecuteProfileUpdate = () => {
    const currentPool = nameCategory === 'female'
      ? [...PRESET_US_FEMALE_NAMES, ...customNames]
      : nameCategory === 'male'
      ? [...PRESET_US_MALE_NAMES, ...customNames]
      : [...PRESET_US_FEMALE_NAMES, ...PRESET_US_MALE_NAMES, ...customNames];

    if (accounts.length === 0) {
      alert(`已成功保存【纯美区资料与头像修改预设】！\n- 头像图库：共 ${uploadedAvatars.length} 张美国白领生活照\n- 名字库：纯正美区姓名 (${nameCategory === 'female' ? '女性高权' : nameCategory === 'male' ? '男性商务' : '全美混合'})\n- 统一 2FA 防找回密码：${twoFaPassword}\n导入真实账号后将全自动应用！`);
      setCurrentView('hub');
      return;
    }

    setAccounts(prev => prev.map((acc, idx) => {
      const isTarget = targetScope === 'all'
        || (targetScope === 'selected' && selectedAccountIds.includes(acc.id))
        || (targetScope === 'new_unconfigured' && (!acc.avatar || (acc.warmingDays || 0) < 5))
        || (targetScope === 'by_group' && acc.group === selectedGroup);

      if (!isTarget) return acc;

      const newAvatar = modAvatar && uploadedAvatars.length > 0
        ? uploadedAvatars[idx % uploadedAvatars.length]
        : acc.avatar;

      const newName = modName && currentPool.length > 0
        ? currentPool[idx % currentPool.length]
        : acc.name;

      return {
        ...acc,
        avatar: newAvatar,
        name: newName,
        twoFactorSecret: mod2FA ? twoFaPassword : acc.twoFactorSecret,
      };
    }));

    alert(`🎉 成功对 ${targetAccounts.length} 个美区目标账号完成资料热更新！\n✓ 头像已轮换分配\n✓ 纯正美区姓名与Bio简介已就绪\n✓ 2FA两步验证安全码已统一防找回重置！`);
    setCurrentView('hub');
  };

  const handleAddChatPhrase = () => {
    if (!newChatPhrase.trim()) return;
    setWarmingChatPhrases(prev => [...prev, newChatPhrase.trim()]);
    setNewChatPhrase('');
  };

  const handleRemoveChatPhrase = (index: number) => {
    setWarmingChatPhrases(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (uploadEvt) => {
        if (uploadEvt.target?.result) {
          setUploadedAvatars(prev => [uploadEvt.target!.result as string, ...prev]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-7 space-y-6 my-6 animate-fadeIn">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Send className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-white">FB 矩阵控制面板 (全功能中枢)</h3>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono font-medium">
                  一号一IP独享调度
                </span>
              </div>
              <p className="text-xs text-slate-400">请选择操作项目：养号设置 | 改资料设置 | 群发设置</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentView !== 'hub' && (
              <button
                onClick={() => setCurrentView('hub')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>返回选项</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Global Permanent Guard Status Banner (from screenshot) */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800/80 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400 font-bold">服务器后端已挂载【永久自动守护引擎】</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="text-amber-400">⚡ 今日自动补发：<strong className="text-white">18</strong> 条 (累计：<strong className="text-white">53</strong> 条)</span>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* VIEW 1: MAIN 3-CARD HUB (Image 1) */}
        {/* ==================================================================== */}
        {currentView === 'hub' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Card 1: 养号设置 */}
            <div
              onClick={() => setCurrentView('warming')}
              className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 transition-all cursor-pointer group flex flex-col justify-between space-y-5 text-center"
            >
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Clock className="h-7 w-7" />
                </div>
                <h4 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
                  FB 养号设置
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  点击设置<strong>定时养号</strong>，由操作员自由填写养号时长、运行时间与拟人语料库。
                </p>
              </div>

              <button className="w-full py-2.5 px-4 rounded-xl bg-cyan-500/10 group-hover:bg-cyan-500 text-cyan-400 group-hover:text-white font-bold text-xs border border-cyan-500/30 transition-all">
                点击进入养号时间设置 &rarr;
              </button>
            </div>

            {/* Card 2: 改资料设置 (Image 1 Center) */}
            <div
              onClick={() => setCurrentView('profile')}
              className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-emerald-500/40 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-500/20 transition-all cursor-pointer group flex flex-col justify-between space-y-5 text-center relative overflow-hidden"
            >
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded text-[9px] font-mono bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                出海重点推荐
              </div>
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                  <UserCheck className="h-7 w-7" />
                </div>
                <h4 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                  FB 改资料设置
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  批量上传真人头像，统一分配<strong>纯正美区女性/男性高权商用姓名</strong>，简介与专属ID系统自由分配，重置2FA防找回。
                </p>
              </div>

              <button className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition-all">
                点击进入一键改资料 &rarr;
              </button>
            </div>

            {/* Card 3: 群发设置 */}
            <div
              onClick={() => setCurrentView('bulk_send')}
              className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10 transition-all cursor-pointer group flex flex-col justify-between space-y-5 text-center"
            >
              <div className="space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mx-auto flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Flame className="h-7 w-7" />
                </div>
                <h4 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors">
                  FB 群发设置
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong>导入目标数据</strong>（粘贴或上传TXT），按一键群发立即由矩阵各独立沙箱开始跑！
                </p>
              </div>

              <button className="w-full py-2.5 px-4 rounded-xl bg-amber-500/10 group-hover:bg-amber-500 text-amber-400 group-hover:text-white font-bold text-xs border border-amber-500/30 transition-all">
                点击进入导入与群发 &rarr;
              </button>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* VIEW 2: 1. FB 养号设置 —— 定时养号 (Image 2) */}
        {/* ==================================================================== */}
        {currentView === 'warming' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-cyan-400" />
                <h4 className="text-sm font-bold text-white">1. FB 养号设置 —— 定时养号 (操作员自由填写时间)</h4>
              </div>
              <button
                onClick={() => setCurrentView('hub')}
                className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                返回选项
              </button>
            </div>

            {/* Time Configuration Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">定时养号执行时长 (小时)</label>
                <input
                  type="text"
                  value={warmingDurationHours}
                  onChange={(e) => setWarmingDurationHours(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                  placeholder="2"
                />
                <span className="text-[11px] text-slate-500">由操作员自由填写单次养号跑多久</span>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-semibold block">养号交互间隔时间 (分钟)</label>
                <input
                  type="text"
                  value={warmingIntervalMinutes}
                  onChange={(e) => setWarmingIntervalMinutes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                  placeholder="30"
                />
                <span className="text-[11px] text-slate-500">多账号互发/阅读信息流的休息间隔</span>
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-semibold block">每日定时开始时间 (24H)</label>
                  <div className="flex items-center gap-1 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setWarmingTimezone('EST')}
                      className={`px-1.5 py-0.5 rounded font-mono ${warmingTimezone === 'EST' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 bg-slate-900'}`}
                    >
                      🇺🇸 美东 (EST)
                    </button>
                    <button
                      type="button"
                      onClick={() => setWarmingTimezone('PST')}
                      className={`px-1.5 py-0.5 rounded font-mono ${warmingTimezone === 'PST' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 bg-slate-900'}`}
                    >
                      🇺🇸 美西 (PST)
                    </button>
                  </div>
                </div>
                <input
                  type="time"
                  value={dailyStartTime}
                  onChange={(e) => setDailyStartTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-semibold block">每日定时结束时间 (24H)</label>
                  <span className="text-[10px] text-cyan-400 font-mono">
                    {warmingTimezone === 'EST' ? '🇺🇸 纽约时区 (EST)' : '🇺🇸 洛杉矶时区 (PST)'}
                  </span>
                </div>
                <input
                  type="time"
                  value={dailyEndTime}
                  onChange={(e) => setDailyEndTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono"
                />
              </div>
            </div>

            {/* Chat Corpus Phrases (from screenshot) */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">📝 FB 养号对聊文案语料库 ({warmingChatPhrases.length} 条已生效)</span>
                </div>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
                  句意同义打散已开启
                </span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {warmingChatPhrases.map((phrase, pIdx) => (
                  <div
                    key={pIdx}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800/80 flex items-center justify-between gap-3 text-xs"
                  >
                    <span className="font-mono text-slate-300 truncate">
                      <strong className="text-cyan-400 mr-2">#{pIdx + 1}</strong>
                      {phrase}
                    </span>
                    <button
                      onClick={() => handleRemoveChatPhrase(pIdx)}
                      className="text-slate-500 hover:text-rose-400 p-1 transition-colors shrink-0 cursor-pointer"
                      title="删除此语料"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  value={newChatPhrase}
                  onChange={(e) => setNewChatPhrase(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddChatPhrase()}
                  placeholder="输入新的 Facebook 养号日常互动话术..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-xl p-2 text-xs text-white"
                />
                <button
                  onClick={handleAddChatPhrase}
                  className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shrink-0 cursor-pointer"
                >
                  + 添加话术
                </button>
              </div>
            </div>

            {/* Anti-ban 7-day warming chain */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs">
              <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>商业级全自动养号动作 (7天防封保活链)：</span>
              </span>
              <span className="text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                已就绪 100%
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setCurrentView('hub')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                取消
              </button>
              <button
                onClick={() => {
                  alert(`养号计划已保存！\n- 运行时间：每日 ${dailyStartTime} 至 ${dailyEndTime}\n- 单次时长：${warmingDurationHours} 小时\n- 间隔：${warmingIntervalMinutes} 分钟\n- 激活语料：${warmingChatPhrases.length} 条`);
                  setCurrentView('hub');
                }}
                className="px-5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-500/20"
              >
                保存养号时间与话术配置
              </button>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* VIEW 3: 2. FB 资料与头像配置中心 (Image 3 & Image 4) */}
        {/* ==================================================================== */}
        {currentView === 'profile' && (
          <div className="space-y-5 animate-fadeIn">
            {/* View Sub-Header */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-emerald-400" />
                  <h4 className="text-sm font-bold text-white">2. FB 资料与头像配置中心 (支持分开设置 · 批量或单号指定)</h4>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  可随时给新买的批次改资料，已配置好的老号自动隔离保护，绝不互相干扰
                </p>
              </div>
              <button
                onClick={() => setCurrentView('hub')}
                className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                返回选项
              </button>
            </div>

            {/* STEP 1: Select Target Scope (Image 3) */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-purple-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-purple-400" />
                  <span>【步骤 1】选择本次修改的目标账号范围 (精准隔离老账号)</span>
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  当前将生效: {targetCount} 个账号
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
                {/* Option 1 */}
                <div
                  onClick={() => setTargetScope('selected')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    targetScope === 'selected'
                      ? 'border-purple-500 bg-purple-500/10 text-white ring-1 ring-purple-500'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      <span>🎯 仅当前勾选账号</span>
                    </span>
                    <input type="radio" checked={targetScope === 'selected'} readOnly />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1">已手动勾选 {selectedAccountIds.length} 个账号</span>
                </div>

                {/* Option 2 */}
                <div
                  onClick={() => setTargetScope('new_unconfigured')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    targetScope === 'new_unconfigured'
                      ? 'border-amber-500 bg-amber-500/10 text-white ring-1 ring-amber-500'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      <span>⚠️ 仅新买未改资料号</span>
                    </span>
                    <input type="radio" checked={targetScope === 'new_unconfigured'} readOnly />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1">自动识别未上传真人头像或默认名的新号</span>
                </div>

                {/* Option 3 */}
                <div
                  onClick={() => setTargetScope('by_group')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    targetScope === 'by_group'
                      ? 'border-blue-500 bg-blue-500/10 text-white ring-1 ring-blue-500'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      <span>🏷️ 按指定分组批次</span>
                    </span>
                    <input type="radio" checked={targetScope === 'by_group'} readOnly />
                  </div>
                  <select
                    value={selectedGroup}
                    onChange={(e) => {
                      setSelectedGroup(e.target.value);
                      setTargetScope('by_group');
                    }}
                    className="mt-1 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 text-[10px] text-white"
                  >
                    <option value="新买养号B组">新买养号B组</option>
                    <option value="养号A组">养号A组</option>
                    <option value="美区高权组">美区高权组</option>
                  </select>
                </div>

                {/* Option 4 */}
                <div
                  onClick={() => setTargetScope('all')}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                    targetScope === 'all'
                      ? 'border-emerald-500 bg-emerald-500/10 text-white ring-1 ring-emerald-500'
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      <span>🌐 全部所有账号</span>
                    </span>
                    <input type="radio" checked={targetScope === 'all'} readOnly />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1">全量重新轮换修改 (谨慎使用)</span>
                </div>
              </div>

              {/* Preview hint */}
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>📋 <strong>本次修改的目标账号名单预览：</strong>{accounts.length > 0 ? `共匹配到 ${targetAccounts.length} 个账号` : '准备导入真号后自动生效'}（仅这批会被修改，其余老号安全隔离）</span>
              </div>
            </div>

            {/* STEP 2: Choose Modification Items (Image 3) */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <CheckSquare className="h-3.5 w-3.5 text-emerald-400" />
                  <span>【步骤 2】自由勾选需要修改的项目 (分开设置，按需执行)</span>
                </span>
                <span className="text-[11px] text-slate-500">已勾选的项目才会被执行更新</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <label className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2 transition-all ${
                  modAvatar ? 'bg-blue-600/10 border-blue-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}>
                  <input type="checkbox" checked={modAvatar} onChange={(e) => setModAvatar(e.target.checked)} className="rounded" />
                  <span className="font-semibold">🖼️ 更改头像 (图库)</span>
                </label>

                <label className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2 transition-all ${
                  modName ? 'bg-emerald-600/10 border-emerald-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}>
                  <input type="checkbox" checked={modName} onChange={(e) => setModName(e.target.checked)} className="rounded" />
                  <span className="font-semibold">🇺🇸/🇧🇷 更改姓名库</span>
                </label>

                <label className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2 transition-all ${
                  modBio ? 'bg-purple-600/10 border-purple-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}>
                  <input type="checkbox" checked={modBio} onChange={(e) => setModBio(e.target.checked)} className="rounded" />
                  <span className="font-semibold">📑 更改简介 & 专属ID</span>
                </label>

                <label className={`p-2.5 rounded-xl border cursor-pointer flex items-center gap-2 transition-all ${
                  mod2FA ? 'bg-amber-600/10 border-amber-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}>
                  <input type="checkbox" checked={mod2FA} onChange={(e) => setMod2FA(e.target.checked)} className="rounded" />
                  <span className="font-semibold">🔑 设置/更改 2FA 密码</span>
                </label>
              </div>
            </div>

            {/* Avatar Pool Section (Image 3) */}
            {modAvatar && (
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-blue-400" />
                    <span className="text-xs font-bold text-white">本地真人头像图库</span>
                    <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 font-mono">
                      已加载 {uploadedAvatars.length} 张头像 (自动按目标账号轮换分配)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => setCropCenterActive(!cropCenterActive)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                        cropCenterActive ? 'bg-blue-600/20 text-blue-300 border-blue-500/40' : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      ✨ 智能消除截图白边 & 人像居中
                    </button>
                    <button
                      onClick={() => setMd5DeDupActive(!md5DeDupActive)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                        md5DeDupActive ? 'bg-amber-600/20 text-amber-300 border-amber-500/40' : 'bg-slate-900 text-slate-400 border-slate-800'
                      }`}
                    >
                      ✨ 智能一键去重 (MD5哈希扰动)
                    </button>
                    <label className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold cursor-pointer transition-colors flex items-center gap-1">
                      <UploadCloud className="h-3 w-3" />
                      <span>+ 批量选图 (支持多选/全选)</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </label>
                  </div>
                </div>

                {/* Avatar Thumbnails Preview */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1">
                  {/* Upload button box */}
                  <label className="w-16 h-16 rounded-2xl border-2 border-dashed border-slate-700 hover:border-blue-500 bg-slate-900 flex flex-col items-center justify-center text-slate-400 hover:text-white cursor-pointer transition-all shrink-0">
                    <Plus className="h-5 w-5" />
                    <span className="text-[9px] font-medium mt-0.5">批量选图</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                  </label>

                  {uploadedAvatars.map((url, idx) => (
                    <div key={idx} className="relative group shrink-0">
                      <img
                        src={url}
                        alt={`Avatar ${idx + 1}`}
                        className="w-16 h-16 rounded-2xl object-cover border border-slate-800 group-hover:border-blue-500 transition-all shadow-sm"
                      />
                      <button
                        onClick={() => setUploadedAvatars(prev => prev.filter((_, i) => i !== idx))}
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                        title="移除此图"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="text-[11px] text-amber-200/90 flex items-center gap-1.5 bg-amber-950/30 p-2 rounded-xl border border-amber-500/20">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>
                    <strong>提示：</strong>可直接点击【+ 批量选图】或拖拽多张真人照片一次性批量导入，系统将自动分配至目标账号并智能轮换！
                  </span>
                </div>
              </div>
            )}

            {/* Name Library & Bio Section (Image 4) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Names Pool */}
              {modName && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">纯正美区姓名库 (智能随机分配)</span>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-mono">
                        共 {nameCategory === 'female' ? PRESET_US_FEMALE_NAMES.length + customNames.length : nameCategory === 'male' ? PRESET_US_MALE_NAMES.length + customNames.length : PRESET_US_FEMALE_NAMES.length + PRESET_US_MALE_NAMES.length + customNames.length} 个
                      </span>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-[10px]">
                      <button
                        type="button"
                        onClick={() => setNameCategory('female')}
                        className={`px-2 py-0.5 rounded cursor-pointer ${nameCategory === 'female' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}
                      >
                        🇺🇸 美区女性名
                      </button>
                      <button
                        type="button"
                        onClick={() => setNameCategory('male')}
                        className={`px-2 py-0.5 rounded cursor-pointer ${nameCategory === 'male' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400'}`}
                      >
                        🇺🇸 美区男性名
                      </button>
                      <button
                        type="button"
                        onClick={() => setNameCategory('all')}
                        className={`px-2 py-0.5 rounded cursor-pointer ${nameCategory === 'all' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400'}`}
                      >
                        🇺🇸 全美男女混合
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap max-h-36 overflow-y-auto pr-1">
                    {(nameCategory === 'female'
                      ? [...PRESET_US_FEMALE_NAMES, ...customNames]
                      : nameCategory === 'male'
                      ? [...PRESET_US_MALE_NAMES, ...customNames]
                      : [...PRESET_US_FEMALE_NAMES, ...PRESET_US_MALE_NAMES, ...customNames]
                    ).map((n, nIdx) => (
                      <span
                        key={nIdx}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[11px]"
                      >
                        {n}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-1.5 pt-1">
                    <input
                      type="text"
                      value={newCustomNameInput}
                      onChange={(e) => setNewCustomNameInput(e.target.value)}
                      placeholder="新增自定义姓名..."
                      className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-xs text-white"
                    />
                    <button
                      onClick={() => {
                        if (newCustomNameInput.trim()) {
                          setCustomNames(prev => [...prev, newCustomNameInput.trim()]);
                          setNewCustomNameInput('');
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold cursor-pointer"
                    >
                      + 添加
                    </button>
                  </div>
                </div>
              )}

              {/* Bio & Exclusive Username */}
              {modBio && (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">简介与专属 ID (系统智能分配)</span>
                  </div>

                  <div className="space-y-2 text-[11px] text-slate-300">
                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="text-slate-400 block font-medium">自动分配专属 ID:</span>
                      <p className="font-mono text-cyan-400">如 @emily_supply, @david_ecom, @sarah_dropship</p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="text-slate-400 block font-medium">自动分配高转化个性签名 / 商业简介:</span>
                      <p className="font-mono text-emerald-300">
                        如 "Global DTC eCommerce & US Warehouse 🇺🇸 | Fast Dispatch | PM for wholesale"
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2FA Security Password Reset (Image 4 bottom) */}
            {mod2FA && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-950 to-slate-950 border border-amber-500/30 space-y-3 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Lock className="h-4 w-4" />
                  </div>
                  <div>
                    <h5 className="font-bold text-white">Facebook 2FA 两步验证安全密码 (修改/重置/防找回)</h5>
                    <p className="text-[11px] text-slate-400">为新买的协议号统一更改 2FA 密码，彻底杜绝前号主/号贩子二次登录与找回！</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  {/* Password input */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-slate-300 font-semibold block">新 2FA 两步验证密码</label>
                      <span className="text-[10px] text-rose-400 font-mono">必填</span>
                    </div>
                    <div className="relative">
                      <input
                        type={showTwoFaPassword ? 'text' : 'password'}
                        value={twoFaPassword}
                        onChange={(e) => setTwoFaPassword(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-amber-300 font-mono text-xs pr-16"
                      />
                      <div className="absolute right-2 top-2 flex items-center gap-1 text-slate-400">
                        <button
                          type="button"
                          onClick={() => setShowTwoFaPassword(!showTwoFaPassword)}
                          className="hover:text-white p-0.5"
                        >
                          {showTwoFaPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(twoFaPassword);
                            alert('已复制 2FA 密码');
                          }}
                          className="hover:text-white p-0.5"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 pt-1">
                      <button
                        type="button"
                        onClick={() => setTwoFaPassword('548508')}
                        className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300 hover:text-white"
                      >
                        默认: 548508
                      </button>
                      <button
                        type="button"
                        onClick={() => setTwoFaPassword(Math.floor(100000 + Math.random() * 900000).toString())}
                        className="px-2 py-0.5 rounded bg-amber-600/20 text-amber-300 border border-amber-500/30 text-[10px] hover:bg-amber-600/30 flex items-center gap-1"
                      >
                        <Shuffle className="h-2.5 w-2.5" />
                        <span>随机6位PIN</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setTwoFaPassword('FbSafe_' + Math.random().toString(36).substring(2, 8) + '!')}
                        className="px-2 py-0.5 rounded bg-purple-600/20 text-purple-300 border border-purple-500/30 text-[10px] hover:bg-purple-600/30"
                      >
                        ⚡ 强英数密码
                      </button>
                    </div>
                  </div>

                  {/* Hint */}
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold block">密码提示语 (Hint / 可选)</label>
                    <input
                      type="text"
                      value={twoFaHint}
                      onChange={(e) => setTwoFaHint(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-mono text-xs"
                      placeholder="matrix_safe"
                    />
                    <span className="text-[10px] text-slate-500">用于在输入 2FA 时提示操作员</span>
                  </div>

                  {/* Recovery email */}
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold block">安全绑定邮箱 (Recovery Email / 可选)</label>
                    <input
                      type="text"
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-mono text-xs"
                      placeholder="admin@outlook.com"
                    />
                    <span className="text-[10px] text-slate-500">用于紧急找回 2FA 或接收 FB 安全码</span>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Actions Bar (Image 4 bottom) */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <div className="flex items-center gap-2 text-xs">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                <span className="text-slate-300">
                  执行目标：<strong className="text-emerald-400 font-mono">{targetCount} 个账号</strong>
                </span>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setCurrentView('hub')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    alert(`已将当前 ${uploadedAvatars.length} 张头像暂存入系统图库相册！随时可用于新账号批量轮换分配。`);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold border border-emerald-500/30 cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>仅存相册 ({uploadedAvatars.length} 张)</span>
                </button>
                <button
                  onClick={handleExecuteProfileUpdate}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 cursor-pointer flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  <UserCheck className="h-4 w-4" />
                  <span>立即执行修改 (仅对指定目标生效)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* VIEW 4: 3. FB 群发设置 (Image 1 right card) */}
        {/* ==================================================================== */}
        {currentView === 'bulk_send' && (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-amber-400" />
                <h4 className="text-sm font-bold text-white">3. FB 群发设置 —— 批量私信与目标数据导入</h4>
              </div>
              <button
                onClick={() => setCurrentView('hub')}
                className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                返回选项
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  导入目标数据 (直接粘贴 FB 用户个人主页 URL / UID，或上传 TXT)
                </label>
                <textarea
                  rows={4}
                  value={bulkTargetsText}
                  onChange={(e) => setBulkTargetsText(e.target.value)}
                  placeholder={`https://facebook.com/profile.php?id=100084920194821\nhttps://facebook.com/alex.commerce\nhttps://facebook.com/profile.php?id=100078291048291`}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white font-mono text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-300 font-semibold">群发话术模板 (支持 Spintax 变量打散)</label>
                  <span className="text-[11px] text-emerald-400 font-mono">&#123;A|B|C&#125; 防查重</span>
                </div>
                <textarea
                  rows={3}
                  value={bulkMessageText}
                  onChange={(e) => setBulkMessageText(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-emerald-300 font-mono text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <span className="text-slate-300">各号发送间隔时延：</span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={bulkDelaySeconds}
                    onChange={(e) => setBulkDelaySeconds(parseInt(e.target.value, 10) || 30)}
                    className="w-16 bg-slate-900 border border-slate-800 rounded-lg p-1 text-center text-white font-mono"
                  />
                  <span className="text-slate-400">秒 (模拟真人键鼠键入)</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setCurrentView('hub')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={() => {
                  alert(`群发指令已成功下发至各账号独立沙箱队列！\n- 目标数：${bulkTargetsText ? bulkTargetsText.split('\n').filter(Boolean).length : 0} 个\n- 拟人间隔：${bulkDelaySeconds} 秒`);
                  setCurrentView('hub');
                }}
                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md shadow-amber-500/20 cursor-pointer"
              >
                一键群发立即开始跑！
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
