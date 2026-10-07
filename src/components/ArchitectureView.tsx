import React, { useState } from 'react';
import {
  Cpu,
  Server,
  Shield,
  Layers,
  Bot,
  Database,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Code,
  Terminal,
  Globe,
  Wifi,
  Smartphone,
  AlertTriangle,
  HelpCircle,
  Check,
  X,
  Calculator,
  ShieldCheck,
  Flame,
  Users,
  RefreshCw,
  Clock,
  Layers as LayersIcon
} from 'lucide-react';

interface ArchitectureViewProps {
  onOpenPricing?: () => void;
  onOpenSimulator: () => void;
}

export const ArchitectureView: React.FC<ArchitectureViewProps> = ({
  onOpenPricing,
  onOpenSimulator
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'architecture' | 'ip_warming_guide'>('ip_warming_guide');
  const [accountScale, setAccountScale] = useState<number>(30); // 10, 30, 50, 100, 200
  const [warmingPhase, setWarmingPhase] = useState<'day1_3' | 'day4_7' | 'day8_14' | 'day15_plus'>('day1_3');

  // Calculator logic for IP costs and recommendation
  const calculateProxyPlan = (count: number) => {
    // Recommendation: For scale <= 20: 100% Static ISP
    // For scale 21-80: 70% Static ISP + 30% Mobile 4G
    // For scale > 80: 50% Static ISP + 50% Mobile 4G (pool)
    if (count <= 20) {
      return {
        strategy: '100% 独享静态住宅 ISP（一号一独立IP）',
        ispCount: count,
        mobileCount: 0,
        estMonthlyCostUsd: count * 3.5, // ~$3.5/IP/month
        banRiskScore: '极低 (< 2%)',
        dailyLeadPotential: count * 35,
        concurrencyMode: '全天候独立并发运行，互不干扰',
        summary: '起步与测试阶段，强烈建议严格【一号一独立IP + 一独立指纹环境】，彻底杜绝任何关联连坐风险。'
      };
    } else if (count <= 60) {
      const ispCount = Math.round(count * 0.7);
      const mobileCount = Math.ceil((count - ispCount) / 2); // 1 mobile proxy supports 2 mature accounts
      return {
        strategy: '混合架构：70% 静态住宅 ISP + 30% 优质 4G 移动代理',
        ispCount,
        mobileCount,
        estMonthlyCostUsd: Math.round(ispCount * 3.5 + mobileCount * 35),
        banRiskScore: '低安全级别 (< 5%)',
        dailyLeadPotential: count * 35,
        concurrencyMode: '静态IP并发，移动代理按时间片错峰轮流运行',
        summary: '适合中小型获客团队：主力老号采用移动基站代理降低单号边际成本，新号/养号期严格使用独享静态 ISP。'
      };
    } else {
      const ispCount = Math.round(count * 0.5);
      const mobileCount = Math.ceil((count - ispCount) / 2.5); // 1 mobile proxy supports 2.5 accounts rotating
      return {
        strategy: '工业级矩阵方案：50% 核心独享 ISP + 50% 动态4G基站代理池',
        ispCount,
        mobileCount,
        estMonthlyCostUsd: Math.round(ispCount * 3.2 + mobileCount * 30),
        banRiskScore: '稳定受控 (< 6%)',
        dailyLeadPotential: count * 30,
        concurrencyMode: '云控调度中心自动管理休眠、唤醒与时段错峰',
        summary: '百号以上规模：通过多指纹独立环境 + 移动基站 CGNAT 天然多用户掩护，在保障高存活率的前提下大幅缩减网络开销。'
      };
    }
  };

  const proxyCalc = calculateProxyPlan(accountScale);

  return (
    <div className="w-full py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Top Banner */}
      <div className="rounded-3xl border border-blue-500/40 bg-gradient-to-r from-blue-950/60 via-slate-900 to-slate-950 p-6 sm:p-8">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
              工程交付与防封运维白皮书
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            “养号需要一号一IP吗？” —— Facebook 矩阵防封网络架构全景解析
          </h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            <strong className="text-emerald-400 font-semibold">权威实战结论：</strong>
            在<strong>“养号期”（前 7~14 天）必须严格做到【一号一独立住宅IP + 一号一独立指纹浏览器】</strong>！只有当账号进入权重成熟期后，结合特定网络类型（如 4G/5G 移动基站代理）才可适度错峰复用。
          </p>

          {/* Sub-tabs Switcher */}
          <div className="flex flex-wrap items-center gap-2 mt-6">
            <button
              onClick={() => setActiveSubTab('ip_warming_guide')}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all flex items-center gap-2 ${
                activeSubTab === 'ip_warming_guide'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-400/50'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-750 border border-slate-700'
              }`}
            >
              <Wifi className="h-3.5 w-3.5" />
              <span>养号与 IP 防封决策指南（本专题）</span>
            </button>
            <button
              onClick={() => setActiveSubTab('architecture')}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all flex items-center gap-2 ${
                activeSubTab === 'architecture'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 ring-2 ring-blue-400/50'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-750 border border-slate-700'
              }`}
            >
              <Cpu className="h-3.5 w-3.5" />
              <span>平台全栈技术拓扑架构</span>
            </button>
            <button
              onClick={onOpenSimulator}
              className="rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 text-xs font-semibold transition-all ml-auto flex items-center gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              <span>查看实时脚本沙箱监控</span>
            </button>
          </div>
        </div>
      </div>

      {activeSubTab === 'ip_warming_guide' && (
        <div className="space-y-8 animate-fadeIn">
          {/* Quick Answer Key Takeaways Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/20 p-5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm mb-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>养号期（第 1~14 天）：必须一号一IP</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                新注册号或刚迁移环境的账号处于 Meta 极高敏感风控期。<strong>必须严格分配 1 个独享静态原生住宅 IP</strong>，且绑定固定指纹浏览器窗口。绝不可多个新号共用一个 IP，否则一人违规全员连带封禁！
              </p>
            </div>

            <div className="rounded-2xl border border-blue-500/30 bg-blue-950/20 p-5">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-sm mb-2">
                <Smartphone className="h-4 w-4" />
                <span>成熟期（15天以上老号）：有限度复用</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                仅限使用<strong>海外 4G/5G 移动蜂窝基站代理（Mobile Proxy）</strong>时，可 1 个 IP 承载 2~3 个权重老号。因为真实世界中一个基站天然有上千手机共用出口，但<strong>绝不能同时并发</strong>，需错峰作业。
              </p>
            </div>

            <div className="rounded-2xl border border-rose-500/30 bg-rose-950/20 p-5">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-sm mb-2">
                <AlertTriangle className="h-4 w-4" />
                <span>绝对红线禁区：机房 IP 与频繁跳跃</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong>严禁使用机房/数据中心 IP（Data Center）或机场节点</strong>！Meta 拥有全球机房 ASN 库，新号登录基本秒出验证码或封停。同时严禁动态代理每几分钟在全球城市间大距离漂移。
              </p>
            </div>
          </div>

          {/* Deep-dive: Why does Facebook link accounts? */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-blue-400" />
                  <span>Facebook 关联封禁（Linkage Penalty）的底层风控模型</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Meta 的 Sentinel 与 Gatekeeper 防欺诈引擎是如何判定多个账号属于“同一个人或同一个矩阵”的？
                </p>
              </div>
              <span className="text-[11px] font-mono text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20 self-start sm:self-auto">
                防封黄金法则：一号 · 一IP · 一环境
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2">
                <div className="text-xs font-mono text-purple-400 font-semibold flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-[10px]">1</span>
                  <span>IP 类型与 ASN 纯净度</span>
                </div>
                <h4 className="text-sm font-bold text-white">网络源头识别</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Meta 会查询接入 IP 的 ASN 属性。家庭宽带（ISP/Residential 如 Comcast、AT&T）信誉最高；机房 Hosting（如 AWS、阿里云）直接被判定为爬虫与营销脚本，直接下发强管控。
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2">
                <div className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-[10px]">2</span>
                  <span>浏览器设备硬件指纹</span>
                </div>
                <h4 className="text-sm font-bold text-white">硬件特征采集</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  就算换了 IP，如果 Canvas、WebGL 显卡渲染特征、AudioContext、系统字体库完全相同，或 WebRTC 泄露了中国内网真实局域网 IP，Meta 会立刻合并判定为“同一台物理设备”。
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2">
                <div className="text-xs font-mono text-amber-400 font-semibold flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px]">3</span>
                  <span>时区与语言基线对齐</span>
                </div>
                <h4 className="text-sm font-bold text-white">环境一致性校验</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  如果使用美国加州洛杉矶的代理 IP（UTC-7），但指纹浏览器的系统时区显示为 UTC+8（中国时区），或浏览器主语言为中文简中，Meta 会直接将此异常列为高危被黑/批量注册嫌疑。
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2">
                <div className="text-xs font-mono text-cyan-400 font-semibold flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 flex items-center justify-center text-[10px]">4</span>
                  <span>行为时间序列与动作突增</span>
                </div>
                <h4 className="text-sm font-bold text-white">拟人化行为审计</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  新注册的账号在几分钟内连续添加 20 个好友，点击间隔都是精准的 3000ms（机械性规律），或者同一 IP 下多个账号同时并发向同一个群组成员狂发私信，必然触发行为连击风控。
                </p>
              </div>
            </div>
          </div>

          {/* Proxy Types Matrix Comparison Table */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-5">
            <div>
              <h3 className="text-lg font-bold text-white">主流 4 类代理网络在 Facebook 养号中的实操评级</h3>
              <p className="text-xs text-slate-400 mt-1">选对代理网络是养号成功率超过 90% 的第一道生死线：</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                    <th className="py-3 px-4 rounded-l-xl">代理网络类型</th>
                    <th className="py-3 px-4">单 IP 建议承载账号数</th>
                    <th className="py-3 px-4">防封安全性</th>
                    <th className="py-3 px-4">月度单价参考</th>
                    <th className="py-3 px-4">养号期适用性</th>
                    <th className="py-3 px-4 rounded-r-xl">核心实战建议</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr className="bg-emerald-950/10 hover:bg-emerald-950/20 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      独享静态住宅 ISP (Static Residential)
                    </td>
                    <td className="py-3.5 px-4 font-mono text-emerald-400 font-semibold">1 号 1 IP（固定绑定）</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-medium border border-emerald-500/30">
                        ★★★★★ 极高
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">$3.0 ~ $4.5 / 个 / 月</td>
                    <td className="py-3.5 px-4 text-emerald-400 font-medium">强烈推荐（首选）</td>
                    <td className="py-3.5 px-4 text-slate-400">
                      IP 长期固定不换，模拟海外本土真实宽带家庭用户，账号权重沉淀最稳。
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                      4G / 5G 移动蜂窝代理 (Mobile Proxy)
                    </td>
                    <td className="py-3.5 px-4 font-mono text-blue-400">2 ~ 3 个老号（需错峰轮流）</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-medium border border-blue-500/30">
                        ★★★★☆ 很高
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">$30 ~ $50 / 条 / 月 (无限流量)</td>
                    <td className="py-3.5 px-4 text-blue-400">老号阶段性价比之王</td>
                    <td className="py-3.5 px-4 text-slate-400">
                      基于真实海外移动基站（CGNAT），Meta 不敢封移动 IP；1 条线可通过指纹环境轮换带 2~3 个账号。
                    </td>
                  </tr>

                  <tr className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                      动态住宅代理 (Rotating Residential - Sticky)
                    </td>
                    <td className="py-3.5 px-4 font-mono text-amber-400">每次会话独占，按时轮换</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[11px] font-medium border border-amber-500/30">
                        ★★★☆☆ 中等
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono">$2.5 ~ $4.0 / GB 流量</td>
                    <td className="py-3.5 px-4 text-amber-400">仅限设置 30-60min 会话保持</td>
                    <td className="py-3.5 px-4 text-slate-400">
                      不可在一次登录中频繁变换城市；如果每次打开都在不同国家，会直接触发安全锁。
                    </td>
                  </tr>

                  <tr className="bg-rose-950/10 hover:bg-rose-950/20 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-400 flex items-center gap-2 line-through">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      机房 / 数据中心代理 (Data Center / VPS)
                    </td>
                    <td className="py-3.5 px-4 font-mono text-rose-400">严禁使用</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[11px] font-medium border border-rose-500/30">
                        ★☆☆☆☆ 极度危险
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">$0.8 ~ $1.5 / 个</td>
                    <td className="py-3.5 px-4 text-rose-400 font-bold">100% 严禁用于新号养号</td>
                    <td className="py-3.5 px-4 text-rose-300/80">
                      ASN 属于机房网段，秒触发上传人脸自拍验证或直接停用，贪图便宜会导致号款全亏。
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Interactive Calculator for Team Scale */}
          <div className="rounded-3xl border border-blue-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/40 p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-blue-400" />
                  <span>矩阵规模与 IP 配比方案计算器</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  选择你计划运营的 Facebook 矩阵账号规模，系统将自动测算最佳网络架构、IP 数量与预算配比：
                </p>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {[10, 30, 60, 100, 200].map((num) => (
                  <button
                    key={num}
                    onClick={() => setAccountScale(num)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      accountScale === num
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {num} 个号
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">推荐网络拓扑模式</span>
                <span className="text-sm font-bold text-white leading-snug">{proxyCalc.strategy}</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">网络 IP 配套建议</span>
                <div className="text-sm font-bold text-emerald-400">
                  {proxyCalc.ispCount > 0 && <span>{proxyCalc.ispCount} 个独享静态住宅 ISP</span>}
                  {proxyCalc.mobileCount > 0 && <span className="block text-blue-400">+{proxyCalc.mobileCount} 条4G移动专线</span>}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">预计网络月度投入</span>
                <div className="text-xl font-extrabold text-white">
                  ${proxyCalc.estMonthlyCostUsd} <span className="text-xs font-normal text-slate-400">/ 月</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  折合单号网络成本约 ${(proxyCalc.estMonthlyCostUsd / accountScale).toFixed(1)}/月
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">预期风控安全水平</span>
                <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" />
                  <span>{proxyCalc.banRiskScore}</span>
                </div>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  日均预期拓客潜能: ~{proxyCalc.dailyLeadPotential} 人次/天
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/90 border border-blue-500/20 flex items-start gap-3 text-xs text-slate-300">
              <Sparkles className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold text-white">架构师实操诊断：</span>
                <p className="text-slate-300 leading-relaxed">{proxyCalc.summary}</p>
                <p className="text-slate-400 text-[11px]">
                  <strong>运行并发机制：</strong>
                  {proxyCalc.concurrencyMode}
                </p>
              </div>
            </div>
          </div>

          {/* 14-Day SOP Step-by-Step Guide */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Flame className="h-4 w-4 text-amber-400" />
                <h3 className="text-lg font-bold text-white">Facebook 账号 14 天阶梯式养号标准 SOP (防封核心)</h3>
              </div>
              <p className="text-xs text-slate-400">
                刚买来的账号或新注册账号，前两周绝不能直接跑批量加人脚本！请严格按照以下周期阶梯式建立权重：
              </p>
            </div>

            {/* Phase Selector */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => setWarmingPhase('day1_3')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  warmingPhase === 'day1_3'
                    ? 'border-blue-500 bg-blue-950/40 text-white'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-[11px] font-mono text-blue-400 font-bold">第 1 ~ 3 天</div>
                <div className="text-xs font-bold mt-1 text-white">静置与浏览沉淀期</div>
              </button>

              <button
                onClick={() => setWarmingPhase('day4_7')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  warmingPhase === 'day4_7'
                    ? 'border-blue-500 bg-blue-950/40 text-white'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-[11px] font-mono text-blue-400 font-bold">第 4 ~ 7 天</div>
                <div className="text-xs font-bold mt-1 text-white">画像完善与轻社交</div>
              </button>

              <button
                onClick={() => setWarmingPhase('day8_14')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  warmingPhase === 'day8_14'
                    ? 'border-blue-500 bg-blue-950/40 text-white'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-[11px] font-mono text-blue-400 font-bold">第 8 ~ 14 天</div>
                <div className="text-xs font-bold mt-1 text-white">精准拓客与互动破冰</div>
              </button>

              <button
                onClick={() => setWarmingPhase('day15_plus')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  warmingPhase === 'day15_plus'
                    ? 'border-blue-500 bg-blue-950/40 text-white'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="text-[11px] font-mono text-emerald-400 font-bold">第 15 天及以后</div>
                <div className="text-xs font-bold mt-1 text-white">全自动化矩阵放量期</div>
              </button>
            </div>

            {/* Phase Content Details */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
              {warmingPhase === 'day1_3' && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                    <Clock className="h-4 w-4" />
                    <span>阶段核心任务：建立浏览器设备 Cookie、模拟真实海外居民自然行为</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                      <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5" /> 允许的操作：
                      </span>
                      <ul className="list-disc list-inside text-slate-400 space-y-1 leading-relaxed">
                        <li>导入 Cookie 或使用 2FA 登录指纹浏览器后，静置 2~4 小时。</li>
                        <li>每天打开 1~2 次，滚动 Feed 流刷 3-5 分钟新闻。</li>
                        <li>观看 1 个 Facebook Watch 短视频，给 1 条系统推荐的官方公共主页（如 CNN, BBC, Nike）点赞。</li>
                        <li>保持同一固定 IP，不切换代理节点。</li>
                      </ul>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                      <span className="font-semibold text-rose-400 flex items-center gap-1.5">
                        <X className="h-3.5 w-3.5" /> 绝对禁止的行为（高危秒封）：
                      </span>
                      <ul className="list-disc list-inside text-slate-400 space-y-1 leading-relaxed">
                        <li><strong>严禁主动添加任何好友或发送任何私信！</strong></li>
                        <li>严禁修改绑定邮箱、修改密码或频繁更改个人名字。</li>
                        <li>严禁加入大量群组或发布外链广告贴。</li>
                        <li>严禁多个账号在同一浏览器实例中切换登录。</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {warmingPhase === 'day4_7' && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                    <Clock className="h-4 w-4" />
                    <span>阶段核心任务：完善个人信用画像，建立基础真人社交关系链</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                      <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5" /> 允许的操作：
                      </span>
                      <ul className="list-disc list-inside text-slate-400 space-y-1 leading-relaxed">
                        <li>上传一张高质量、自然无水印的生活化头像及背景图。</li>
                        <li>补充基础资料（居住城市与当前 IP 所在国家一致，学校/工作单位）。</li>
                        <li>加入 1 个与业务相关的公开小组（不要马上发帖），浏览组内动态。</li>
                        <li>接受来自系统推荐的有共同好友的 2~3 个联系人申请。</li>
                      </ul>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                      <span className="font-semibold text-rose-400 flex items-center gap-1.5">
                        <X className="h-3.5 w-3.5" /> 严格风控限制：
                      </span>
                      <ul className="list-disc list-inside text-slate-400 space-y-1 leading-relaxed">
                        <li>每天主动加人不得超过 3 人，必须从“推荐好友”中筛选。</li>
                        <li>严禁直接群发任何包含 WhatsApp 链接、独立站网址的私信。</li>
                        <li>不要在群组中发布含有价格、Telegram 号的广告帖。</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {warmingPhase === 'day8_14' && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                    <Clock className="h-4 w-4" />
                    <span>阶段核心任务：小剂量业务测试，沉淀双向互动与 Messenger 权重</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                      <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5" /> 允许的操作：
                      </span>
                      <ul className="list-disc list-inside text-slate-400 space-y-1 leading-relaxed">
                        <li>每天可以通过本系统的【小组精准成员】或【Reels互动粉】小批量添加 5~10 人。</li>
                        <li>操作间隔设置在 25s~50s 之间，开启贝塞尔鼠标移动与随机延迟。</li>
                        <li>对已通过的好友，发送使用 Spintax 打散的自然破冰问候（不带硬广链接）。</li>
                        <li>如客户回复，及时进行自然交流（Meta 极为看重双向会话率）。</li>
                      </ul>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                      <span className="font-semibold text-rose-400 flex items-center gap-1.5">
                        <X className="h-3.5 w-3.5" /> 严格风控限制：
                      </span>
                      <ul className="list-disc list-inside text-slate-400 space-y-1 leading-relaxed">
                        <li>如果某天出现加人“未响应”或提示“请求过于频繁”，立即停止加人 48 小时。</li>
                        <li>每日主动发起新会话限制在 8~12 人以内。</li>
                        <li>不要连续加单向拒绝率高的陌生号码。</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {warmingPhase === 'day15_plus' && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                    <Clock className="h-4 w-4" />
                    <span>阶段核心任务：权重建立完毕，可挂接自动化云控系统正式规模化拓客</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                      <span className="font-semibold text-emerald-400 flex items-center gap-1.5">
                        <Check className="h-3.5 w-3.5" /> 推荐正式矩阵作业参数：
                      </span>
                      <ul className="list-disc list-inside text-slate-400 space-y-1 leading-relaxed">
                        <li>单号每日加好友上限：30 ~ 45 人（分 2~3 个时间段执行）。</li>
                        <li>单号每日发私信上限：25 ~ 35 人（开启 Spintax 变量自旋转与防重过滤）。</li>
                        <li>开启云端 Redis Bloom Filter 去重，确保矩阵内多账号永不撞客。</li>
                        <li>老号在 4G 移动代理下可平稳运作，单日产生稳定获客线索。</li>
                      </ul>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                      <span className="font-semibold text-amber-400 flex items-center gap-1.5">
                        <Shield className="h-3.5 w-3.5" /> 长期健康运维准则：
                      </span>
                      <ul className="list-disc list-inside text-slate-400 space-y-1 leading-relaxed">
                        <li>每周设置 1 天“无脚本自然休息日”，仅模拟浏览不发广告。</li>
                        <li>定期清理 7 天以上未通过的加好友申请（降低待处理挂起率）。</li>
                        <li>若 IP 供应商出现故障需更换 IP，新 IP 尽量保持在同一国家与城市。</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'architecture' && (
        <div className="space-y-8 animate-fadeIn">
          {/* 4-Tier Architecture Diagram */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">平台全栈技术拓扑架构</h3>
                <p className="text-xs text-slate-400">模块化解耦设计，高可用、防封号、易维护</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Tier 1 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center mb-3">
                    <Bot className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-mono text-blue-400">Layer 1: 触达与销售端</span>
                  <h4 className="text-base font-bold text-white mt-1 mb-2">Telegram Bot & Web 前端</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    基于 Node.js / Telegraf 框架搭建的 Telegram 销售机器人。支持 Inline Keyboard 交互、脚本演示视窗唤起、USDT/支付宝/微信自动秒发卡密与AI客服支持。
                  </p>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300">
                  Tech: Telegraf · Express · React · Tailwind
                </div>
              </div>

              {/* Tier 2 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center mb-3">
                    <Cpu className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-mono text-purple-400">Layer 2: 任务与风控层</span>
                  <h4 className="text-base font-bold text-white mt-1 mb-2">自动化引擎与指纹防封</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    Puppeteer-Stealth / Playwright 驱动，对接 AdsPower / BitBrowser 本地指纹 API。环境隔离 Canvas/WebGL/WebRTC，结合动态拟人按键与随机时延微扰。
                  </p>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300">
                  Tech: Playwright · AdsPower API · Socks5
                </div>
              </div>

              {/* Tier 3 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center mb-3">
                    <Database className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400">Layer 3: 存储与去重中枢</span>
                  <h4 className="text-base font-bold text-white mt-1 mb-2">分布式去重与 CRM 线索</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    百万级全局布隆过滤器 (Redis Bloom Filter) 毫秒级去重，矩阵账号跨号绝不重复添加；PostgreSQL 记录客户线索生命周期（采集→判定→私信→回复→成单）。
                  </p>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300">
                  Tech: Redis Bloom · PostgreSQL · Prisma
                </div>
              </div>

              {/* Tier 4 */}
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center mb-3">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] font-mono text-amber-400">Layer 4: AI 智能赋能</span>
                  <h4 className="text-base font-bold text-white mt-1 mb-2">Gemini 意图判定与 Spintax</h4>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">
                    接入 Google Gemini 3.8 Flash 模型。全自动对用户公开资料 Bio 进行商业相关度打分（0-100分），并自动生成上千种组合的 Spintax 防封私信话术。
                  </p>
                </div>
                <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300">
                  Tech: Gemini 3.8 Flash · Spintax Engine
                </div>
              </div>
            </div>
          </div>

          {/* Anti-ban In-Depth Explainer */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 sm:p-8">
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-400" />
              <span>核心优势：为什么这套系统的防封号能力远超普通脚本？</span>
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Facebook 对自动化行为的检测主要基于浏览器指纹、IP纯净度、行为时间特征与内容重复度。本平台从底层逐一击破：
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs text-slate-300">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <h5 className="font-bold text-white mb-1.5 flex items-center gap-2">
                  <span className="text-blue-400 font-mono">01.</span>
                  <span>指纹浏览器底层隔离 (Browser Fingerprint Isolation)</span>
                </h5>
                <p className="text-slate-400 leading-relaxed">
                  每个 Facebook 账号独占一个完全独立的指纹 Profile，严格隔离 Cookie、LocalStorage、Canvas、WebGL 指纹与系统字体，避免平台产生跨账号设备关联。
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <h5 className="font-bold text-white mb-1.5 flex items-center gap-2">
                  <span className="text-blue-400 font-mono">02.</span>
                  <span>独享海外动态/静态住宅代理 (Residential SOCKS5 Proxy)</span>
                </h5>
                <p className="text-slate-400 leading-relaxed">
                  精准绑定目标国家（如美国 AT&T、英国 Vodafone）家庭宽带 IP，拒绝数据中心机房 IP，模拟真实海外本地居民上网环境。
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <h5 className="font-bold text-white mb-1.5 flex items-center gap-2">
                  <span className="text-blue-400 font-mono">03.</span>
                  <span>贝塞尔拟人键鼠轨迹与高斯随机时延 (Human-Like Jitter Delays)</span>
                </h5>
                <p className="text-slate-400 leading-relaxed">
                  彻底摒弃机械式瞬时点击。每次翻页、移动鼠标、按键输入均带有贝塞尔微动物理曲线，操作间隔在 15s~45s 之间波动，彻底抹消脚本特征。
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <h5 className="font-bold text-white mb-1.5 flex items-center gap-2">
                  <span className="text-blue-400 font-mono">04.</span>
                  <span>Spintax 自旋转文案引擎 (Anti-Spam Dynamic Text)</span>
                </h5>
                <p className="text-slate-400 leading-relaxed">
                  每次私信发送随机展开数百种句式组合与同义词替换，使发出的每一封私信在 Facebook 服务器眼中文本指纹各不相同，杜绝发信频控与封私信权限。
                </p>
              </div>
            </div>
          </div>

          {/* Deployment & Delivery Roadmap */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Server className="h-5 w-5 text-blue-400" />
              <span>私有化部署与交付实施计划</span>
            </h3>
            <p className="text-xs text-slate-400 mb-6">如需自建独立平台或商业化运营，交付时间表如下：</p>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h5 className="font-bold text-white">第 1 天：基础云设施与 Telegram 机器人上线</h5>
                  <p className="text-slate-400 mt-0.5 leading-relaxed">
                    配置独立 Ubuntu 服务器、Docker 容器化环境、部署 PostgreSQL & Redis。配置 Telegram BotFather Token 与 Webhook，实现如同截图所示的展示与支付卡密自动发货。
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h5 className="font-bold text-white">第 2~3 天：Facebook 自动化核心脚本与指纹浏览器联调</h5>
                  <p className="text-slate-400 mt-0.5 leading-relaxed">
                    集成 AdsPower / BitBrowser API，接入 Facebook 小组抓取、推荐好友过滤、帖子点赞截流模块，完成住宅代理 IP 自动轮巡测试与风控安全时延微调。
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h5 className="font-bold text-white">第 4 天：AI 画像判定与 Spintax 文案引擎接入</h5>
                  <p className="text-slate-400 mt-0.5 leading-relaxed">
                    集成 Gemini API，支持对抓取到的目标用户资料进行多语言意图评估，训练定制化行业破冰话术模板，完成云端百万级去重池联调。
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="w-6 h-6 rounded-full bg-blue-600/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  4
                </div>
                <div>
                  <h5 className="font-bold text-white">第 5 天：验收交付、全套源码移交与技术团队培训</h5>
                  <p className="text-slate-400 mt-0.5 leading-relaxed">
                    移交完整 Git 仓库与部署脚本，提供 1对1 远程视频环境搭建指导、FB 账号养号避坑指南与 1 年技术售后保障。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
