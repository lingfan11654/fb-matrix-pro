import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, CheckCircle, ShieldAlert, Cpu, Terminal, ArrowRight, UserPlus, MessageSquare, ThumbsUp, Sparkles, Filter, User, Radio, Camera, Heart, Share2, Globe, ShieldCheck, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import { FBAccount } from '../types';

interface ExecutionSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  account?: FBAccount | null;
}

interface SimStep {
  id: number;
  time: string;
  type: 'browser' | 'scrape' | 'filter' | 'action' | 'dedup';
  title: string;
  detail: string;
  status: 'pending' | 'active' | 'done' | 'skip';
  targetUser?: {
    name: string;
    avatar: string;
    bio: string;
    country: string;
    friends: number;
    score: number;
  };
}

export const ExecutionSimulatorModal: React.FC<ExecutionSimulatorModalProps> = ({
  isOpen,
  onClose,
  account
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  // Default to profile view when an account is selected so user sees Emma Carter's actual avatar and name
  const [screenViewMode, setScreenViewMode] = useState<'profile' | 'rpa_automation'>('profile');

  // Fallback demo account if opened without specific account
  const currAcc = account || {
    id: 'fb-demo',
    name: 'Alicia Turner',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    proxyIp: '168.158.153.172:4002:user:pass',
    warmingDays: 7,
    lastActive: 'UID:61579759624561',
    proxyLocation: '美国洛杉矶 原生家庭宽带ISP',
    twoFaCode: '986089',
    healthScore: 98
  };

  const steps: SimStep[] = [
    {
      id: 1,
      time: '14:20:01',
      type: 'browser',
      title: `唤起独立指纹浏览器环境 · ${currAcc.name}`,
      detail: `分配环境 profile_${currAcc.name.toLowerCase().replace(/\s+/g, '_')} · 注入独立Canvas/WebGL指纹 · 绑定专属住宅代理 (${currAcc.proxyIp.split(':')[0]})`,
      status: 'done'
    },
    {
      id: 2,
      time: '14:20:05',
      type: 'browser',
      title: '登录校验与 Cookie 保活',
      detail: `${currAcc.name} (UID: ${currAcc.lastActive?.replace('UID:', '') || '61579759624561'}) Session 状态有效 · 注入美东作息拟人鼠标运动轨迹`,
      status: 'done'
    },
    {
      id: 3,
      time: '14:20:09',
      type: 'scrape',
      title: '进入目标群组提取 48h 活跃成员',
      detail: '访问群组 [USA Real Estate Investors (45+)] 成员列表 · 提取近 48h 活跃美国本土成员',
      status: 'done'
    },
    {
      id: 4,
      time: '14:20:13',
      type: 'filter',
      title: '候选人画像多维条件判定 (🇺🇸美国 | 👨男性 | 🎂45岁+)',
      detail: '检测目标客户：Robert M. Sterling (52岁·达拉斯) · 判定为高净值美国本土成熟男性，100%符合定向标准',
      status: 'done',
      targetUser: {
        name: 'Robert M. Sterling',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        bio: 'Commercial Real Estate Investor & Ranch Owner | Golf & Fly-Fishing Enthusiast | Dallas, TX',
        country: '🇺🇸 美国 (德州·达拉斯)',
        friends: 842,
        score: 98
      }
    },
    {
      id: 5,
      time: '14:20:18',
      type: 'action',
      title: '执行精准拓客动作 [加好友]',
      detail: `模拟 ${currAcc.name} 点击【加为好友】· 随机等待 23 秒模拟人类阅读间隔`,
      status: 'done'
    },
    {
      id: 6,
      time: '14:20:42',
      type: 'action',
      title: '互动养号与动态点赞',
      detail: '自动浏览其最新 2 条公开贴文并点击点赞交互，提升好友通过率至 55% 以上',
      status: 'done'
    },
    {
      id: 7,
      time: '14:20:55',
      type: 'action',
      title: '拟人互动与日常朋友圈排期',
      detail: `当前账号 ${currAcc.name} 主页已排期 5+ 条精致欧美女性生活动态，通过率极佳`,
      status: 'done'
    },
    {
      id: 8,
      time: '14:21:02',
      type: 'dedup',
      title: '分布式云端去重池入库',
      detail: '写入全局 Redis 去重哈希 · 确保全矩阵 10 个号永久不重复添加同一美国客户',
      status: 'done'
    }
  ];

  useEffect(() => {
    if (!isOpen) return;
    setCurrentStepIndex(1);
    const interval = setInterval(() => {
      if (isPlaying) {
        setCurrentStepIndex((prev) => {
          if (prev >= steps.length) {
            return steps.length;
          }
          return prev + 1;
        });
      }
    }, 2400);

    return () => clearInterval(interval);
  }, [isOpen, isPlaying, steps.length]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-5xl rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center shrink-0">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>🖥️ 云端指纹浏览器实机投屏</span>
                  <span className="text-blue-400 font-mono">[{currAcc.name}]</span>
                </h3>
                <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[11px] font-bold text-emerald-400 border border-emerald-500/20 font-mono">
                  ● 38ms 在线实机
                </span>
                <span className="rounded bg-purple-500/10 px-2 py-0.5 text-[11px] font-mono text-purple-300 border border-purple-500/20">
                  {currAcc.lastActive || `UID:61579759624561`}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                正在投屏账号 <strong>{currAcc.name}</strong> 的独立沙箱环境 · 独享美国住宅 IP: <span className="text-emerald-400 font-mono">{currAcc.proxyIp}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5 text-amber-400" /> : <Play className="h-3.5 w-3.5 text-emerald-400" />}
              <span>{isPlaying ? '暂停' : '继续'}</span>
            </button>
            <button
              onClick={() => setCurrentStepIndex(1)}
              className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-400" />
              <span>重放</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Clear Role Distinction Banner */}
        <div className="bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/70 px-6 py-2.5 border-b border-blue-500/30 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-blue-300 font-bold flex items-center gap-1 text-xs bg-blue-500/20 px-2 py-0.5 rounded border border-blue-500/30">
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              <span>投屏账号确认</span>
            </span>
            <span className="text-slate-300 text-[11px]">
              您当前投屏查看的是 <strong>【{currAcc.name}】</strong> 的专属指纹环境！右侧标签可切换查看<strong>【账号个人主页】</strong>与<strong>【正在添加的美国客户】</strong>：
            </span>
          </div>

          {/* Screen Tab Switcher */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
            <button
              onClick={() => setScreenViewMode('profile')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                screenViewMode === 'profile'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="h-3 w-3" />
              <span>👤 {currAcc.name} 个人主页与动态</span>
            </button>
            <button
              onClick={() => setScreenViewMode('rpa_automation')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                screenViewMode === 'rpa_automation'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Radio className="h-3 w-3" />
              <span>⚡ 拓客抓取实机画面 (正在加目标美国人)</span>
            </button>
          </div>
        </div>

        {/* Modal Body: Split View (Left: Mock Browser / Facebook UI, Right: Real-time Execution Pipeline) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 overflow-y-auto flex-1 p-6 gap-6">
          {/* Left Column: Simulated Browser Viewport (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-lg">
              {/* Browser Address Bar */}
              <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-400">
                  <div className="flex gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                  </div>
                  <span className="ml-2 font-mono text-[11px] text-slate-300">
                    {screenViewMode === 'profile' ? `https://www.facebook.com/${currAcc.name.toLowerCase().replace(/\s+/g, '.')}` : 'https://www.facebook.com/groups/shopifyentrepreneurs/members'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-emerald-400 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>独立沙箱: profile_{currAcc.name.toLowerCase().replace(/\s+/g, '_')}</span>
                </div>
              </div>

              {/* VIEW A: Account Profile & Timeline View */}
              {screenViewMode === 'profile' ? (
                <div className="p-4 bg-[#18191a] text-slate-100 min-h-[420px] flex flex-col justify-between space-y-4">
                  <div>
                    {/* Top Simulated Facebook Nav */}
                    <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
                          f
                        </div>
                        <span className="bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-[11px]">
                          搜索 Facebook...
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full overflow-hidden border border-slate-700">
                          {currAcc.avatar ? (
                            <img src={currAcc.avatar} alt={currAcc.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white">{currAcc.name.slice(-2)}</div>
                          )}
                        </div>
                        <span className="font-semibold text-white text-xs">{currAcc.name}</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      </div>
                    </div>

                    {/* Profile Banner & Header */}
                    <div className="relative mt-3">
                      {/* Cover Photo */}
                      <div className="h-28 w-full rounded-2xl bg-gradient-to-r from-teal-800 via-blue-900 to-indigo-900 overflow-hidden relative">
                        <img
                          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80"
                          alt="Cover"
                          className="w-full h-full object-cover opacity-60"
                        />
                        <div className="absolute top-2 right-2 bg-black/50 text-[10px] text-white px-2 py-0.5 rounded-md flex items-center gap-1 backdrop-blur-sm">
                          <Camera className="h-3 w-3" />
                          <span>更换封面</span>
                        </div>
                      </div>

                      {/* Avatar & User Info */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 px-3 -mt-9 relative z-10">
                        <div className="flex items-end gap-3">
                          <div className="w-20 h-20 rounded-full border-4 border-[#18191a] overflow-hidden bg-slate-800 shadow-xl shrink-0">
                            {currAcc.avatar ? (
                              <img src={currAcc.avatar} alt={currAcc.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xl">
                                {currAcc.name.slice(-2)}
                              </div>
                            )}
                          </div>
                          <div className="pb-1">
                            <h4 className="text-base font-extrabold text-white flex items-center gap-1.5">
                              <span>{currAcc.name}</span>
                              <CheckCircle2 className="h-4 w-4 text-blue-400 fill-blue-400/20" />
                            </h4>
                            <p className="text-[11px] text-emerald-400 font-mono mt-0.5">
                              {currAcc.lastActive || `UID:61579759624561`} · 养号第 {currAcc.warmingDays || 7} 天
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pb-1">
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-300 px-2.5 py-1 rounded-xl border border-emerald-500/20 font-mono flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3 text-emerald-400" />
                            <span>住宅IP: {currAcc.proxyIp.split(':')[0]}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bio & Safeguard Status Box */}
                    <div className="mt-3 p-3 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
                      <p className="text-slate-300 text-xs italic">
                        "Lifestyle & photography enthusiast. Living simply and loving sunny California ☕📸"
                      </p>
                      <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-slate-800 text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-amber-400" />
                          <span>美东作息锁: 08:30~22:30 白天在线保活</span>
                        </span>
                        <span className="text-emerald-400 font-bold">健康分: 98/100 (极度健康)</span>
                      </div>
                    </div>

                    {/* Published Feed Moments (朋友圈生活动态) */}
                    <div className="mt-3 space-y-2">
                      <span className="text-[11px] font-bold text-slate-300 flex items-center gap-1">
                        <span>📸 主页已发布的真实生活朋友圈 (增加买家验货权重):</span>
                      </span>

                      <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full overflow-hidden">
                              {currAcc.avatar ? (
                                <img src={currAcc.avatar} alt={currAcc.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full bg-blue-600 text-white font-bold text-[9px] flex items-center justify-center">{currAcc.name.slice(-2)}</div>
                              )}
                            </div>
                            <span className="font-semibold text-white">{currAcc.name}</span>
                            <span className="text-slate-500 text-[10px]">· 3小时前</span>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-mono">公开动态</span>
                        </div>
                        <p className="text-xs text-slate-200">
                          Morning coffee before another productive day ☕ Life is made of small sweet moments.
                        </p>
                        <div className="h-28 w-full rounded-lg overflow-hidden bg-slate-950">
                          <img
                            src="https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&auto=format&fit=crop&q=80"
                            alt="Coffee Post"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                          <span className="flex items-center gap-1 text-rose-400">
                            <Heart className="h-3 w-3 fill-rose-400" />
                            <span>28 次赞</span>
                          </span>
                          <span>4 条评论 · 1 次分享</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* VIEW B: RPA Automation Screen View (Scanning & Adding Target Lead) */
                <div className="p-4 bg-[#18191a] text-slate-100 min-h-[420px] flex flex-col justify-between">
                  <div>
                    {/* Operating Account Header Pill */}
                    <div className="bg-blue-950/80 p-2.5 rounded-xl border border-blue-500/40 mb-3 flex items-center justify-between text-xs shadow-md">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-blue-400 shrink-0">
                          {currAcc.avatar ? (
                            <img src={currAcc.avatar} alt={currAcc.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-blue-600 flex items-center justify-center font-bold text-white text-xs">{currAcc.name.slice(-2)}</div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] bg-blue-600 text-white px-1.5 py-0.2 rounded font-bold">当前操作账号 (您的号)</span>
                            <strong className="text-white font-mono">{currAcc.name}</strong>
                            <span className="text-emerald-400 font-mono text-[10px]">({currAcc.lastActive || 'UID:61579759624561'})</span>
                          </div>
                          <p className="text-[11px] text-slate-300 mt-0.5">
                            正在通过美国住宅 IP (<code className="text-amber-300 font-mono">{currAcc.proxyIp.split(':')[0]}</code>) 模拟人类向下方目标候选客户发起添加
                          </p>
                        </div>
                      </div>
                      <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono text-[10px] shrink-0">
                        38ms · 在线保活
                      </span>
                    </div>

                    {/* FB Group Target Header */}
                    <div className="flex items-center gap-3 pb-3 mb-3 border-b border-slate-800 text-xs">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-emerald-600 flex items-center justify-center font-bold text-white text-base">
                        R
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-white">USA Real Estate Investors & Landowners Network</h4>
                          <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded font-mono">45+男粉核心群</span>
                        </div>
                        <p className="text-[11px] text-slate-400">公开小组 · 89,400 位成员 · 每日新增90+高净值大叔贴文 (48h活跃美国男粉)</p>
                      </div>
                    </div>

                    {/* Scanned Lead Card Spotlight */}
                    <div className="rounded-xl border-2 border-emerald-500/80 bg-slate-900/90 p-3.5 shadow-xl relative transition-all">
                      <div className="absolute -top-3 right-3 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
                        <Sparkles className="h-3 w-3" />
                        <span>定向候选人：🇺🇸 美国本土 · 👨 男性 · 🎂 45岁+</span>
                      </div>

                      <div className="flex items-start gap-3.5">
                        <img
                          src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
                          alt="Robert M. Sterling"
                          className="w-12 h-12 rounded-full border-2 border-emerald-500 object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h5 className="font-bold text-sm text-white flex items-center gap-1.5">
                              <span>Robert M. Sterling</span>
                              <span className="text-[10px] bg-blue-600/30 text-blue-300 border border-blue-500/30 px-1.5 rounded">👨 52岁成熟男粉</span>
                            </h5>
                            <span className="text-xs text-emerald-400 font-mono">🇺🇸 美国 (德州·达拉斯)</span>
                          </div>
                          <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                            Commercial Real Estate Investor & Ranch Owner | Golf & Fly-Fishing Enthusiast | Dallas, TX
                          </p>
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
                            <span>好友数: <strong className="text-white font-mono">842</strong></span>
                            <span className="text-emerald-400">● 48h内有活跃发帖</span>
                            <span className="text-amber-400">已通过 45+ 购买力门槛</span>
                          </div>
                        </div>
                      </div>

                      {/* Simulated Automated Action Buttons */}
                      <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 rounded bg-blue-500/20 text-blue-300 text-xs px-2.5 py-1">
                            <UserPlus className="h-3.5 w-3.5" />
                            <span>{currAcc.name} 已自动发送好友申请</span>
                          </span>
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 text-emerald-300 text-xs px-2.5 py-1">
                            <ThumbsUp className="h-3.5 w-3.5" />
                            <span>已点赞2条动态</span>
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono">
                          拟人微扰时延: 23s
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Anti-detection status */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>风控防护等级：安全 (拟人贝塞尔移动与美东作息锁)</span>
                    </div>
                    <span className="font-mono text-emerald-400">
                      沙箱演示轮次: 正在模拟第 {Math.min(currentStepIndex, steps.length)}/{steps.length} 步骤
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom quick CTA */}
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 flex items-center justify-between">
              <div>
                <h5 className="text-xs font-semibold text-white">当前账号实机链路连通正常 · 延迟 38ms</h5>
                <p className="text-[11px] text-slate-400">环境与独立住宅 IP 深度绑定，支持随时无缝导入 AdsPower / 比特浏览器接管</p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 transition-colors shrink-0 shadow-md shadow-blue-500/20 cursor-pointer"
              >
                关闭投屏 · 返回工作台
              </button>
            </div>
          </div>

          {/* Right Column: Execution Terminal & Step Pipeline (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 flex-1 flex flex-col">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-xs font-semibold text-white">
                  <Terminal className="h-4 w-4 text-blue-400" />
                  <span>指纹环境底层日志 · [{currAcc.name}]</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  Step {Math.min(currentStepIndex, steps.length)}/{steps.length}
                </span>
              </div>

              {/* Steps Timeline */}
              <div className="space-y-3 overflow-y-auto max-h-[440px] pr-1">
                {steps.map((st, index) => {
                  const isCurrent = index + 1 === currentStepIndex;
                  const isDone = index + 1 < currentStepIndex;
                  return (
                    <div
                      key={st.id}
                      className={`p-3 rounded-xl border text-xs transition-all ${
                        isCurrent
                          ? 'border-blue-500 bg-blue-950/40 text-white shadow-md'
                          : isDone
                          ? 'border-slate-800/80 bg-slate-900/50 text-slate-300'
                          : 'border-slate-900 bg-slate-950 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isDone
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : isCurrent
                              ? 'bg-blue-500 text-white animate-pulse'
                              : 'bg-slate-800 text-slate-500'
                          }`}>
                            {isDone ? '✓' : st.id}
                          </span>
                          <span className="font-semibold">{st.title}</span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-500">{st.time}</span>
                      </div>
                      <p className="pl-6 text-[11px] text-slate-400 leading-relaxed">
                        {st.detail}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
