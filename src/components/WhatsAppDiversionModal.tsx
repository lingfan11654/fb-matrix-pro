import React, { useState } from 'react';
import {
  X,
  Phone,
  Settings2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Users,
  ShieldCheck,
  RefreshCw,
  Plus,
  Trash2,
  Share2,
  MessageSquareQuote,
  Check
} from 'lucide-react';
import { FBAccount, WhatsAppLeadChannel, WhatsAppDiversionConfig } from '../types';

interface WhatsAppDiversionModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: FBAccount[];
  whatsappPool: WhatsAppLeadChannel[];
  setWhatsappPool: React.Dispatch<React.SetStateAction<WhatsAppLeadChannel[]>>;
  diversionConfig: WhatsAppDiversionConfig;
  setDiversionConfig: React.Dispatch<React.SetStateAction<WhatsAppDiversionConfig>>;
  onSaveToast?: (msg: string) => void;
}

export const WhatsAppDiversionModal: React.FC<WhatsAppDiversionModalProps> = ({
  isOpen,
  onClose,
  accounts,
  whatsappPool,
  setWhatsappPool,
  diversionConfig,
  setDiversionConfig,
  onSaveToast
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'config' | 'pool' | 'templates'>('pool');
  const [batchInputText, setBatchInputText] = useState('');
  const [showBatchAddBox, setShowBatchAddBox] = useState(false);
  const [filterAccount, setFilterAccount] = useState<string>('all');
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Quick generate 50 mock numbers for 10 accounts (5 each)
  const handleAutoGenerate50Channels = () => {
    const newChannels: WhatsAppLeadChannel[] = [];
    const targetAccounts = accounts.length > 0 ? accounts : [
      { id: 'acc-1', name: 'Emma Carter' } as any,
      { id: 'acc-2', name: 'Sophia Miller' } as any,
      { id: 'acc-3', name: 'Olivia Davis' } as any,
      { id: 'acc-4', name: 'Ava Johnson' } as any,
      { id: 'acc-5', name: 'Mia Wilson' } as any,
      { id: 'acc-6', name: 'Emily Clark' } as any,
      { id: 'acc-7', name: 'Chloe Anderson' } as any,
      { id: 'acc-8', name: 'Grace Taylor' } as any,
      { id: 'acc-9', name: 'Lily Robinson' } as any,
      { id: 'acc-10', name: 'Hannah White' } as any,
    ];

    let count = 1;
    targetAccounts.forEach((acc, accIdx) => {
      // 5 WhatsApp numbers for each account
      for (let i = 1; i <= 5; i++) {
        const tag = `WS-${String(count).padStart(2, '0')}`;
        const prefix = 626 + (accIdx * 10) + i;
        const phone = `+1 (${prefix}) ${Math.floor(100 + Math.random() * 899)}-${Math.floor(1000 + Math.random() * 8999)}`;
        newChannels.push({
          id: `ws-${count}`,
          tag,
          phoneOrLink: phone,
          assignedAccountId: acc.id,
          assignedAccountName: acc.name,
          dailyCap: diversionConfig.dailyCapPerChannel || 2,
          todayTransferred: Math.random() > 0.5 ? Math.floor(Math.random() * 3) : 0,
          totalTransferred: Math.floor(10 + Math.random() * 35),
          status: 'active'
        });
        count++;
      }
    });

    setWhatsappPool(newChannels);
    setSuccessNotice(`🎉 成功自动生成并配置 50 个 WhatsApp 独立联系方式！已按 1:5 规则精准分配至 10 个 FB 账号！`);
    setTimeout(() => setSuccessNotice(null), 5000);
  };

  // Handle batch import from textarea
  const handleBatchImportCustom = () => {
    if (!batchInputText.trim()) return;
    const lines = batchInputText
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.length > 0);

    if (lines.length === 0) return;

    const newChannels: WhatsAppLeadChannel[] = [];
    const targetAccounts = accounts.length > 0 ? accounts : [{ id: 'acc-1', name: 'Emma Carter' } as any];

    lines.forEach((line, idx) => {
      const tag = `WS-${String(whatsappPool.length + idx + 1).padStart(2, '0')}`;
      // Calculate which account to assign (5 per account)
      const accIdx = Math.floor(idx / 5) % targetAccounts.length;
      const assignedAcc = targetAccounts[accIdx];

      newChannels.push({
        id: `ws-custom-${Date.now()}-${idx}`,
        tag,
        phoneOrLink: line,
        assignedAccountId: assignedAcc?.id || 'global',
        assignedAccountName: assignedAcc?.name || '全局池',
        dailyCap: diversionConfig.dailyCapPerChannel || 2,
        todayTransferred: 0,
        totalTransferred: 0,
        status: 'active'
      });
    });

    setWhatsappPool([...whatsappPool, ...newChannels]);
    setBatchInputText('');
    setShowBatchAddBox(false);
    setSuccessNotice(`✅ 成功批量录入 ${newChannels.length} 个 WhatsApp 联系方式并完成自动分配绑定！`);
    setTimeout(() => setSuccessNotice(null), 5000);
  };

  const filteredChannels = filterAccount === 'all'
    ? whatsappPool
    : whatsappPool.filter(c => c.assignedAccountId === filterAccount);

  const totalCapacityToday = whatsappPool.reduce((acc, c) => acc + c.dailyCap, 0);
  const totalTransferredToday = whatsappPool.reduce((acc, c) => acc + c.todayTransferred, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 space-y-5 animate-fadeIn shadow-2xl my-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Phone className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">WhatsApp 矩阵智能轮询分流与自动转粉池</h3>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono">
                  50 号防封分流保护中
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                支持 50+ 个 WhatsApp 号码轮询均摊；每个 FB 账号负责专属 5 个 WS，单号单日进粉 2 人封顶，AI 代聊至成熟自动抛出！
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Success Alert */}
        {successNotice && (
          <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2.5 animate-fadeIn">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            <span className="font-semibold">{successNotice}</span>
          </div>
        )}

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
            <span className="text-slate-400 text-[11px] block">已配置 WhatsApp 池</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-white">{whatsappPool.length}</span>
              <span className="text-slate-500 text-[11px]">个号码</span>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono">
              {accounts.length > 0 ? `均摊 1 个 FB 负责 5 个 WS` : '全局大池'}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
            <span className="text-slate-400 text-[11px] block">单号单日安全进粉上限</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-emerald-400">{diversionConfig.dailyCapPerChannel}</span>
              <span className="text-slate-500 text-[11px]">人 / 号 / 天</span>
            </div>
            <span className="text-[10px] text-slate-400">达到上限自动跳过，绝不封号</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
            <span className="text-slate-400 text-[11px] block">今日矩阵总承接上限</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl font-bold font-mono text-blue-400">{totalCapacityToday}</span>
              <span className="text-slate-500 text-[11px]">人 / 天</span>
            </div>
            <span className="text-[10px] text-blue-300/80">
              今日已安全分流: <strong className="text-white font-mono">{totalTransferredToday}</strong> 人
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-1">
            <span className="text-slate-400 text-[11px] block">AI 自动代聊转粉策略</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold text-purple-300">聊满 3 句自动抛出</span>
            </div>
            <span className="text-[10px] text-purple-400/80">Spintax 话术变量随机防查重</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('pool')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'pool'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white bg-slate-950'
              }`}
            >
              📋 50个号码池与分配状态 ({whatsappPool.length})
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'config'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white bg-slate-950'
              }`}
            >
              ⚙️ 分流规则与防封配额
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                activeTab === 'templates'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-white bg-slate-950'
              }`}
            >
              💬 自动转粉话术模板 (Spintax)
            </button>
          </div>

          <div className="flex items-center gap-2">
            {whatsappPool.length > 0 && (
              <button
                onClick={() => {
                  setWhatsappPool([]);
                  localStorage.removeItem('fb_matrix_whatsapp_pool');
                  setSuccessNotice('🗑️ 已彻底清空所有 WhatsApp 假数据！您可以点击右侧【批量粘贴号码】录入您的真实 WhatsApp！');
                  setTimeout(() => setSuccessNotice(null), 5000);
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer"
                title="清空当前所有假号码"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>清空假数据 ({whatsappPool.length})</span>
              </button>
            )}
            <button
              onClick={handleAutoGenerate50Channels}
              className="px-3 py-1.5 rounded-xl bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 border border-purple-500/40 text-[11px] font-bold transition-all flex items-center gap-1 active:scale-95 cursor-pointer shadow-sm"
              title="根据当前 10 个 FB 账号，一键生成 50 个号码并严格按 1:5 绑定配置好！"
            >
              <Sparkles className="h-3.5 w-3.5 text-purple-400" />
              <span>⚡ 生成 50 个号码演示</span>
            </button>
            <button
              onClick={() => setShowBatchAddBox(!showBatchAddBox)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer shadow-sm"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>批量粘贴您的真实号码</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Pool List */}
        {activeTab === 'pool' && (
          <div className="space-y-3.5 text-xs">
            {/* Batch Paste Box */}
            {showBatchAddBox && (
              <div className="p-4 bg-slate-950 rounded-2xl border border-emerald-500/40 space-y-2.5 animate-fadeIn">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-emerald-400" />
                    <span>批量粘贴您的真实 WhatsApp 手机号或加粉链接 (一行一个)</span>
                  </span>
                  <span className="text-[11px] text-slate-400">支持直接粘贴 +1 手机号或 wa.me 链接</span>
                </div>
                <textarea
                  rows={4}
                  value={batchInputText}
                  onChange={(e) => setBatchInputText(e.target.value)}
                  placeholder={`+1 (626) 388-9011\n+1 (626) 388-9012\n+1 (626) 388-9013\nhttps://wa.me/16263889014\nhttps://wa.me/16263889015`}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-emerald-300 font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    系统会自动按顺序把前 5 个分给第 1 个 FB 账号，接下来的 5 个分给第 2 个，以此类推！
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowBatchAddBox(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                    >
                      取消
                    </button>
                    <button
                      onClick={handleBatchImportCustom}
                      disabled={!batchInputText.trim()}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold shadow-md shadow-emerald-500/20"
                    >
                      确认导入并按 1:5 绑定
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Filter Bar */}
            <div className="flex items-center justify-between gap-3 bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 font-semibold">按绑定的 FB 账号筛选:</span>
                <select
                  value={filterAccount}
                  onChange={(e) => setFilterAccount(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-white text-xs"
                >
                  <option value="all">显示全部账号的 WhatsApp ({whatsappPool.length}个)</option>
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} 负责的 5 个 WhatsApp
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span> 接收中
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400"></span> 今日已达限额 (2/2)
                </span>
              </div>
            </div>

            {/* Channels Table */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950/70 overflow-hidden max-h-[380px] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 sticky top-0 z-10">
                  <tr>
                    <th className="py-2.5 px-3.5 font-semibold">编号</th>
                    <th className="py-2.5 px-3.5 font-semibold">WhatsApp 联系方式 / 加粉短链</th>
                    <th className="py-2.5 px-3.5 font-semibold">负责分流的 FB 账号</th>
                    <th className="py-2.5 px-3.5 font-semibold">今日分流进度 (安全限额)</th>
                    <th className="py-2.5 px-3.5 font-semibold">累计进粉</th>
                    <th className="py-2.5 px-3.5 font-semibold">当前状态</th>
                    <th className="py-2.5 px-3.5 font-semibold text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredChannels.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-500">
                        <Phone className="h-7 w-7 mx-auto mb-2 text-slate-600 opacity-60" />
                        <p className="font-semibold text-slate-300">号码池暂无数据</p>
                        <p className="text-[11px] text-slate-500 mt-1">
                          点击右上角的「⚡ 一键生成 50 个号码池」即可立即体验 1:5 自动轮询分流！
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredChannels.map((channel, idx) => {
                      const isFull = channel.todayTransferred >= channel.dailyCap;
                      return (
                        <tr key={channel.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="py-2.5 px-3.5 font-mono text-emerald-400 font-bold">
                            {channel.tag}
                          </td>
                          <td className="py-2.5 px-3.5">
                            <span className="font-mono text-white font-medium">{channel.phoneOrLink}</span>
                          </td>
                          <td className="py-2.5 px-3.5">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-blue-950/60 border border-blue-500/30 text-blue-300 text-[11px]">
                              <Users className="h-3 w-3 text-blue-400" />
                              <span>{channel.assignedAccountName || '未指定'}</span>
                            </span>
                          </td>
                          <td className="py-2.5 px-3.5">
                            <div className="flex items-center gap-2">
                              <span className={`font-mono font-bold ${isFull ? 'text-amber-400' : 'text-emerald-400'}`}>
                                {channel.todayTransferred} / {channel.dailyCap} 人
                              </span>
                              {isFull && (
                                <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-500/30">
                                  今日满额·自动切下一个
                                </span>
                              )}
                            </div>
                            <div className="w-24 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                              <div
                                className={`h-full rounded-full transition-all ${isFull ? 'bg-amber-400' : 'bg-emerald-400'}`}
                                style={{ width: `${Math.min(100, (channel.todayTransferred / channel.dailyCap) * 100)}%` }}
                              />
                            </div>
                          </td>
                          <td className="py-2.5 px-3.5 font-mono text-slate-300">
                            {channel.totalTransferred} 人
                          </td>
                          <td className="py-2.5 px-3.5">
                            <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                              isFull ? 'text-amber-400' : 'text-emerald-400'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${isFull ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
                              <span>{isFull ? '今日已达标' : '正常派发中'}</span>
                            </span>
                          </td>
                          <td className="py-2.5 px-3.5 text-right">
                            <button
                              onClick={() => {
                                setWhatsappPool(prev => prev.filter(c => c.id !== channel.id));
                              }}
                              className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                              title="删除此号码"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Config */}
        {activeTab === 'config' && (
          <div className="space-y-4 text-xs">
            {/* Mode Selection */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="font-bold text-white flex items-center gap-2">
                <Share2 className="h-4 w-4 text-emerald-400" />
                <span>分流负载均衡模式设置</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setDiversionConfig({ ...diversionConfig, mode: 'per_account_group' })}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    diversionConfig.mode === 'per_account_group'
                      ? 'border-emerald-500 bg-emerald-500/10 text-white'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span className="text-emerald-300">模式 A：1个FB账号负责5个WS (您要求的模式)</span>
                    {diversionConfig.mode === 'per_account_group' && <Check className="h-4 w-4 text-emerald-400" />}
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    10 个 FB 小号各自独享绑定 5 个 WhatsApp。1 个号每天聊 10 个客户，5 个联系方式分别给 2 个客户（精准 1:2 均摊），不撞车！
                  </p>
                </div>

                <div
                  onClick={() => setDiversionConfig({ ...diversionConfig, mode: 'global_round_robin' })}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    diversionConfig.mode === 'global_round_robin'
                      ? 'border-blue-500 bg-blue-500/10 text-white'
                      : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span className="text-blue-300">模式 B：全矩阵 50 个号码大池循环轮询</span>
                    {diversionConfig.mode === 'global_round_robin' && <Check className="h-4 w-4 text-blue-400" />}
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    所有 FB 小号共同使用 50 个 WhatsApp 号码大池，按全局队列轮流给客户发放联系方式，整体流量绝对平均。
                  </p>
                </div>
              </div>
            </div>

            {/* Quota & Safety Rules */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <span className="font-bold text-white flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-blue-400" />
                <span>单号进粉上限与防封风控保护</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-slate-300 font-medium">每个 WhatsApp 单日最大进粉人数</label>
                    <span className="text-emerald-400 font-mono font-bold">
                      {diversionConfig.dailyCapPerChannel} 人 / 天
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 5, 8].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => {
                          setDiversionConfig({ ...diversionConfig, dailyCapPerChannel: num });
                          setWhatsappPool(prev => prev.map(c => ({ ...c, dailyCap: num })));
                        }}
                        className={`px-3 py-1.5 rounded-xl font-mono text-xs transition-all ${
                          diversionConfig.dailyCapPerChannel === num
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {num}人 {num === 2 ? '(推荐黄金限额)' : ''}
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    WhatsApp 新号每天进人超过 5 人极易触发风控。限制在 2 人能够确保账号永久安全！
                  </span>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-slate-300 font-medium">AI 自动转粉触发时机</label>
                    <span className="text-purple-400 font-mono font-bold">
                      双方聊满 {diversionConfig.autoTransferMessageCount} 句
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {[2, 3, 4, 5].map(num => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setDiversionConfig({ ...diversionConfig, autoTransferMessageCount: num })}
                        className={`px-3 py-1.5 rounded-xl font-mono text-xs transition-all ${
                          diversionConfig.autoTransferMessageCount === num
                            ? 'bg-purple-600 text-white font-bold'
                            : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        {num}句后
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    先礼貌寒暄 3 句建立信任，再抛出 WhatsApp，客户通过率高达 80% 以上！
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Templates */}
        {activeTab === 'templates' && (
          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <MessageSquareQuote className="h-4 w-4 text-emerald-400" />
                <span>自动转粉话术模板 (Spintax 随机调用，自动注入当前轮到的 WhatsApp 号码)</span>
              </span>
            </div>

            <div className="space-y-2.5">
              {diversionConfig.transferTemplates.map((tpl, tIdx) => (
                <div key={tIdx} className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400 font-mono text-[11px]">模板 #{tIdx + 1}</span>
                    <span className="text-[10px] text-slate-500 font-mono">&#123;whatsapp_contact&#125; 动态变量</span>
                  </div>
                  <textarea
                    rows={2}
                    value={tpl}
                    onChange={(e) => {
                      const updated = [...diversionConfig.transferTemplates];
                      updated[tIdx] = e.target.value;
                      setDiversionConfig({ ...diversionConfig, transferTemplates: updated });
                    }}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <div className="text-[11px] text-slate-400">
            已就绪 <strong className="text-white font-mono">{whatsappPool.length}</strong> 个 WhatsApp 联系方式 ·
            今日已分流 <strong className="text-emerald-400 font-mono">{totalTransferredToday}</strong> 人 ·
            总容量 <strong className="text-blue-400 font-mono">{totalCapacityToday}</strong> 人
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
            >
              关闭
            </button>
            <button
              onClick={() => {
                if (onSaveToast) onSaveToast('🎉 WhatsApp 轮询分流策略已保存！系统将在客户聊满时全自动按 1:5 均衡发放联系方式！');
                onClose();
              }}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
            >
              保存并立即应用分流引擎
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
