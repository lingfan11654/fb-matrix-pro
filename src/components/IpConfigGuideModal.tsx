import React, { useState } from 'react';
import { X, ShieldCheck, AlertTriangle, Check, Info, Calculator, Zap, Globe, Cpu, Smartphone } from 'lucide-react';

interface IpConfigGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPricing: () => void;
}

export const IpConfigGuideModal: React.FC<IpConfigGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenPricing
}) => {
  const [accountCount, setAccountCount] = useState<number>(10);
  const [accountType, setAccountType] = useState<'new' | 'warmed' | 'aged'>('warmed');
  const [proxyType, setProxyType] = useState<'static_residential' | 'mobile_4g' | 'dynamic_residential'>('static_residential');

  if (!isOpen) return null;

  // Calculations based on industry best practices
  const getIpRatio = () => {
    if (accountType === 'new') return 1; // 1:1 strict for new accounts
    if (accountType === 'warmed') return proxyType === 'mobile_4g' ? 0.5 : 1; // 1:1 for static res, 1:2 for mobile
    return proxyType === 'mobile_4g' ? 0.33 : 0.5; // Aged accounts can share 1:2 on good static res
  };

  const ipCount = Math.ceil(accountCount * getIpRatio());
  const estimatedCostPerIp = proxyType === 'static_residential' ? 3.0 : proxyType === 'mobile_4g' ? 25.0 : 2.0;
  const totalCost = (ipCount * estimatedCostPerIp).toFixed(0);

  const getRiskLevel = () => {
    if (accountType === 'new' && getIpRatio() < 1) return { level: '高风险', color: 'text-rose-400', bg: 'bg-rose-950/30 border-rose-800' };
    return { level: '极低风险 (安全推荐)', color: 'text-emerald-400', bg: 'bg-emerald-950/30 border-emerald-800' };
  };

  const risk = getRiskLevel();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl border border-slate-700 bg-slate-900 shadow-2xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                权威风控指南与实战 SOP
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Facebook 养号需要“一号一IP”吗？全维度解答与配置计算器
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              深度解析 Meta 风控关联机制、各类型 IP 优劣对比及最具性价比的矩阵起号配置方案
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Core Direct Answer Card */}
        <div className="p-5 rounded-2xl border border-blue-500/40 bg-blue-950/30 space-y-3">
          <div className="flex items-center gap-2 text-blue-300 font-bold text-sm">
            <Info className="h-5 w-5 text-blue-400 shrink-0" />
            <span>核心结论：新号批量养殖必须「1号1IP」，成熟老号可「1IP承载1~2号」</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            <strong>绝对不要多号共用同一个普通机房 IP！</strong>
            Facebook 会对 IP 地址的历史信誉、ASN 归属属性及活跃设备指纹进行全天候聚类分析。如果同一 IP 下多个账号同时进行自动化加粉或私信，一旦其中一个账号被风控检测，会导致该 IP 下的所有关联账号被<strong>“连锁风控 / 连带封停”</strong>。
          </p>
        </div>

        {/* 3 Principles */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold mb-2">
              01
            </div>
            <h5 className="font-bold text-white text-sm">必须是「原生住宅 IP」</h5>
            <p className="text-slate-400 leading-relaxed">
              坚决杜绝机房/数据中心 IP（如阿里云、腾讯云、AWS 等机房号段）。必须使用海外家庭宽带住宅 IP（AT&T、Comcast、Verizon 等），模拟真实居民上网。
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold mb-2">
              02
            </div>
            <h5 className="font-bold text-white text-sm">「IP + 指纹环境」强绑定</h5>
            <p className="text-slate-400 leading-relaxed">
              单换 IP 是不够的！每个账号必须独占一个独立的指纹浏览器环境（Canvas、WebGL、WebRTC、时区、系统字体）或独立安卓云机/模拟器，做到完全物理隔离。
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold mb-2">
              03
            </div>
            <h5 className="font-bold text-white text-sm">阶段式递增，错峰调度</h5>
            <p className="text-slate-400 leading-relaxed">
              若后期成熟老号 1 个静态住宅 IP 挂 2 个号，必须错峰运行（号A上午执行，号B下午执行），坚决避免同一时段向 FB 服务器发起并发请求。
            </p>
          </div>
        </div>

        {/* Interactive IP & Cost Calculator */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-slate-950 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Calculator className="h-5 w-5 text-emerald-400" />
            <h4 className="text-sm font-bold text-white">您的矩阵规模 · IP 方案与成本精准测算</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-slate-300 block mb-1.5 font-medium">矩阵挂机账号总数</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="2"
                  max="100"
                  value={accountCount}
                  onChange={(e) => setAccountCount(Number(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <span className="font-mono font-bold text-white bg-slate-900 px-2 py-1 rounded border border-slate-800 text-center w-14">
                  {accountCount} 个
                </span>
              </div>
            </div>

            <div>
              <label className="text-slate-300 block mb-1.5 font-medium">账号所处阶段</label>
              <select
                value={accountType}
                onChange={(e) => setAccountType(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
              >
                <option value="new">新注册白号 / 刚购入新号 (0~7天)</option>
                <option value="warmed">养护半月以上稳定号 (7~21天)</option>
                <option value="aged">海外半年/多年权重老号 (21天+)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-300 block mb-1.5 font-medium">拟选代理类型</label>
              <select
                value={proxyType}
                onChange={(e) => setProxyType(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
              >
                <option value="static_residential">静态独享住宅 ISP 代理 (最推荐)</option>
                <option value="mobile_4g">海外 4G/5G 移动蜂窝代理 (抗封最强)</option>
                <option value="dynamic_residential">高纯净动态住宅代理池 (按流量计费)</option>
              </select>
            </div>
          </div>

          {/* Calculator Output */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800 text-xs">
            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block mb-0.5">建议所需独立 IP 数</span>
              <div className="text-xl font-extrabold text-emerald-400 font-mono">{ipCount} 个独立IP</div>
              <span className="text-[10px] text-slate-500">配比: 1 IP 对应 {(accountCount / ipCount).toFixed(1)} 账号</span>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block mb-0.5">风控安全评级</span>
              <div className="text-sm font-bold text-emerald-400 mt-1">{risk.level}</div>
              <span className="text-[10px] text-slate-500">极低风控连带率</span>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block mb-0.5">每日单号安全加粉</span>
              <div className="text-xl font-extrabold text-white font-mono">
                {accountType === 'new' ? '10~15' : accountType === 'warmed' ? '25~35' : '40~60'} 人/天
              </div>
              <span className="text-[10px] text-slate-500">全矩阵日增约 {ipCount * (accountType === 'new' ? 12 : 30)} 人</span>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800/80">
              <span className="text-slate-400 block mb-0.5">代理预估总成本</span>
              <div className="text-xl font-extrabold text-blue-400 font-mono">≈ ${totalCost} /月</div>
              <span className="text-[10px] text-slate-500">折合每号约 ${(Number(totalCost) / accountCount).toFixed(1)}/月</span>
            </div>
          </div>
        </div>

        {/* Step-by-Step Warming Timeline (SOP) */}
        <div className="p-5 rounded-2xl border border-slate-800 bg-slate-950 space-y-3 text-xs text-slate-300">
          <h4 className="font-bold text-white flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-400" />
            <span>Facebook 养号 21 天安全过渡流程 (防死号黄金法则)</span>
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <span className="text-amber-400 font-bold block">第 1 ~ 7 天 (静默冷启动期)</span>
              <p className="text-[11px] text-slate-400">
                固定 1 号 1 静态住宅 IP，每天挂机 30 分钟。只刷推荐视频、动态点赞、完善资料。<strong>严禁批量加好友、严禁发外链私信</strong>。
              </p>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <span className="text-blue-400 font-bold block">第 8 ~ 14 天 (破冰活跃期)</span>
              <p className="text-[11px] text-slate-400">
                开启脚本自动加入 1~2 个相关小组，每天添加 5~10 位推荐好友，随机给好友动态留言，建立真人社交图谱。
              </p>
            </div>
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
              <span className="text-emerald-400 font-bold block">第 15 ~ 21 天 (成熟拓客期)</span>
              <p className="text-[11px] text-slate-400">
                全面启用 Reels 视频截流、小组提取、Spintax 私信直发。每天单号加好友 30~50 人，私信 25 封，进入全自动矩阵获客常态。
              </p>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-slate-400">本系统已内置独立指纹与住宅代理一键绑定及防封熔断机制</span>
          <button
            onClick={() => { onClose(); onOpenPricing(); }}
            className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 text-xs font-semibold transition-all shadow-sm"
          >
            获取系统授权与代理配置包 ➔
          </button>
        </div>
      </div>
    </div>
  );
};
