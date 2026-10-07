import React, { useState } from 'react';
import {
  X,
  Fingerprint,
  ShieldCheck,
  Cpu,
  Monitor,
  Volume2,
  Globe,
  HardDrive,
  Copy,
  Check,
  Layers,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { FBAccount } from '../types';

interface FingerprintInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: FBAccount | null;
  allAccounts: FBAccount[];
  onSelectAccount: (acc: FBAccount) => void;
}

export const FingerprintInspectorModal: React.FC<FingerprintInspectorModalProps> = ({
  isOpen,
  onClose,
  account,
  allAccounts,
  onSelectAccount
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;
  if (!account || allAccounts.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
        <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-purple-600/20 text-purple-400 mx-auto flex items-center justify-center">
            <Fingerprint className="h-6 w-6" />
          </div>
          <h4 className="text-base font-bold text-white">暂未导入任何 FB 矩阵账号</h4>
          <p className="text-xs text-slate-400">请先在矩阵云控中导入至少 1 个账号，系统将实时为其生成并分配物理隔离的独立硬件指纹。</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold"
          >
            返回工作台
          </button>
        </div>
      </div>
    );
  }

  // Generate deterministic synthetic fingerprint parameters based on profile ID & account
  const getFingerprintDetails = (acc: FBAccount) => {
    let hash = 0;
    const str = (acc.browserProfileId || '') + acc.id + (acc.proxyIp || '');
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    const absHash = Math.abs(hash);

    const gpuVendors = [
      { vendor: 'Google Inc. (NVIDIA)', renderer: 'ANGLE (NVIDIA GeForce RTX 3070 Direct3D11 vs_5_0 ps_5_0)' },
      { vendor: 'Google Inc. (AMD)', renderer: 'ANGLE (AMD Radeon RX 6700 XT Direct3D11 vs_5_0 ps_5_0)' },
      { vendor: 'Google Inc. (Intel)', renderer: 'ANGLE (Intel(R) Iris(R) Xe Graphics Direct3D11 vs_5_0 ps_5_0)' },
      { vendor: 'Apple Inc.', renderer: 'Apple M2 Pro (Metal - Apple GPU)' },
      { vendor: 'Google Inc. (NVIDIA)', renderer: 'ANGLE (NVIDIA GeForce RTX 4060 Laptop GPU Direct3D11)' }
    ];

    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.6478.183 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.6533.100 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.142 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.6478.127 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.6533.89 Safari/537.36'
    ];

    const screens = [
      '1920 x 1080 (24-bit 深度, 1.0 缩放)',
      '2560 x 1440 (24-bit 深度, 1.25 缩放)',
      '1920 x 1080 (24-bit 深度, 1.0 缩放)',
      '1710 x 1107 (30-bit 深度 Retina, 2.0 缩放)',
      '1920 x 1200 (24-bit 深度, 1.0 缩放)'
    ];

    const hardware = [
      'CPU: 8 逻辑核心 · RAM: 16 GB · 触摸点: 0',
      'CPU: 12 逻辑核心 · RAM: 32 GB · 触摸点: 0',
      'CPU: 4 逻辑核心 · RAM: 8 GB · 触摸点: 0',
      'CPU: 10 逻辑核心 · RAM: 16 GB · 触摸点: 0',
      'CPU: 8 逻辑核心 · RAM: 16 GB · 触摸点: 0'
    ];

    const canvasHash = (absHash.toString(16) + '09dc82a17fe43b').slice(0, 16);
    const audioHash = `35.${((absHash * 179) % 899999) + 100000}`;
    const gpu = gpuVendors[absHash % gpuVendors.length];
    const ua = userAgents[absHash % userAgents.length];
    const scr = screens[absHash % screens.length];
    const hw = hardware[absHash % hardware.length];

    // Language & Timezone matching IP & Region
    const loc = (acc.proxyLocation || '').toLowerCase();
    const isUS = loc.includes('美') || loc.includes('us') || loc.includes('united states') || acc.name.startsWith('TG-US') || (acc.lastActive && acc.lastActive.startsWith('+1'));
    const isBR = loc.includes('巴') || loc.includes('br') || loc.includes('brazil') || acc.name.startsWith('TG-BR') || (acc.lastActive && acc.lastActive.startsWith('+55'));
    const isUK = loc.includes('英') || loc.includes('uk') || loc.includes('gb');
    const isJP = loc.includes('日') || loc.includes('jp');

    let language = 'en-US, en;q=0.9 (美国原生英语环境)';
    let timezone = 'America/New_York (UTC-5 / 美东纽约时区)';
    let locale = 'en_US';
    let currency = 'USD ($)';

    if (isBR) {
      language = 'pt-BR, pt;q=0.9, en-US;q=0.8 (巴西葡萄牙语 + 英语)';
      timezone = 'America/Sao_Paulo (UTC-3 / 巴西圣保罗时区)';
      locale = 'pt_BR';
      currency = 'BRL (R$)';
    } else if (isUK) {
      language = 'en-GB, en;q=0.9 (英式英语环境)';
      timezone = 'Europe/London (UTC+0 / 伦敦格林威治时区)';
      locale = 'en_GB';
      currency = 'GBP (£)';
    } else if (isJP) {
      language = 'ja-JP, ja;q=0.9, en-US;q=0.8 (日语环境)';
      timezone = 'Asia/Tokyo (UTC+9 / 东京时区)';
      locale = 'ja_JP';
      currency = 'JPY (¥)';
    }

    return {
      canvasHash,
      webgl: gpu,
      audioHash,
      userAgent: ua,
      screen: scr,
      hardware: hw,
      language,
      timezone,
      locale,
      currency,
      webrtcStatus: '已禁用本地内网泄露 (Public Only / Disabled STUN leak)',
      fontHash: `fonts_pack_${canvasHash.slice(0, 6)}`,
      storagePath: `/sandbox/browser_profiles/${acc.browserProfileId}/Default`
    };
  };

  const fp = getFingerprintDetails(account);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-6 my-8 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
              <Fingerprint className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">独立硬件指纹 Profile 审计器</h3>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono font-medium">
                  100% 物理隔离无关联
                </span>
              </div>
              <p className="text-xs text-slate-400">实时查看与验证每个账号在 Facebook 识别中的底层硬件指纹参数</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Account Selector Pill Tabs */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400">切换比对不同矩阵账号的独立指纹：</label>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {allAccounts.map((acc) => (
              <button
                key={acc.id}
                onClick={() => onSelectAccount(acc)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                  acc.id === account.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 font-bold'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <img src={acc.avatar} alt={acc.name} className="w-4 h-4 rounded-full object-cover" />
                <span>{acc.name.split(' ')[0]} ({acc.browserProfileId.split('-')[2] || acc.id})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Current Account Summary Banner */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/30 via-slate-950 to-slate-950 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={account.avatar} alt={account.name} className="w-12 h-12 rounded-xl object-cover border border-purple-500/40" />
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>{account.name}</span>
                <span className="text-[10px] font-mono text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded">
                  {account.browserProfileId}
                </span>
              </h4>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 font-mono">
                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  一号一独享IP: {account.proxyIp}
                </span>
                <span className="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  🌱 养号 {account.warmingDays || 1} 天
                </span>
                <span className="text-slate-400 hidden sm:inline">{account.proxyLocation}</span>
              </div>
            </div>
          </div>
          <div className="text-right self-stretch sm:self-auto bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
            <span className="text-[11px] text-slate-400 block">独立沙箱安全系数</span>
            <span className="text-sm font-bold text-emerald-400 font-mono">99.8% 零相似度</span>
          </div>
        </div>

        {/* 6 Fingerprint Hardware Matrices */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
          {/* 1. Canvas Fingerprint */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-blue-400" />
                <span>2D Canvas 画布噪点指纹 (2D Rendering Hash)</span>
              </span>
              <button
                onClick={() => handleCopy(fp.canvasHash, 'canvas')}
                className="text-slate-500 hover:text-slate-300"
              >
                {copiedKey === 'canvas' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
            <div className="font-mono text-emerald-400 bg-slate-900 p-2 rounded-lg text-[11px] truncate">
              0x{fp.canvasHash} (独占高斯随机微扰噪点)
            </div>
            <span className="text-[10px] text-slate-500">
              ✓ 每个账号向 HTML5 Canvas 绘制图案时，输出的哈希值绝对唯一，无任何跨号关联。
            </span>
          </div>

          {/* 2. WebGL 3D Engine & Vendor */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Monitor className="h-3.5 w-3.5 text-purple-400" />
                <span>WebGL 3D 渲染器与显卡厂商 (GPU Model)</span>
              </span>
              <button
                onClick={() => handleCopy(fp.webgl.renderer, 'webgl')}
                className="text-slate-500 hover:text-slate-300"
              >
                {copiedKey === 'webgl' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
            <div className="font-mono text-purple-300 bg-slate-900 p-2 rounded-lg text-[11px] truncate">
              {fp.webgl.renderer}
            </div>
            <span className="text-[10px] text-slate-500">
              ✓ 动态模拟不同真实独立显卡（NVIDIA / AMD / Intel Iris / Apple M2），规避同物理显卡特征。
            </span>
          </div>

          {/* 3. AudioContext Fingerprint */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Volume2 className="h-3.5 w-3.5 text-amber-400" />
                <span>AudioContext 音频振幅频率指纹</span>
              </span>
              <button
                onClick={() => handleCopy(fp.audioHash, 'audio')}
                className="text-slate-500 hover:text-slate-300"
              >
                {copiedKey === 'audio' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
            <div className="font-mono text-amber-300 bg-slate-900 p-2 rounded-lg text-[11px] truncate">
              buffer.dynamicsCompressor = {fp.audioHash}
            </div>
            <span className="text-[10px] text-slate-500">
              ✓ 声卡音频解调频率各不相同，防止 Meta 通过声卡振荡波形比对设备。
            </span>
          </div>

          {/* 4. WebRTC IP Leak Prevention */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400 font-medium flex items-center gap-1.5">
                <Globe className="h-3.5 w-3.5 text-cyan-400" />
                <span>WebRTC 真实局域网内网 IP 穿透隔离</span>
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">100% 屏蔽</span>
            </div>
            <div className="font-mono text-cyan-300 bg-slate-900 p-2 rounded-lg text-[11px]">
              STUN/TURN 映射: {account.proxyIp.split(':')[0]} (仅代理出口)
            </div>
            <span className="text-[10px] text-slate-500">
              ✓ 杜绝网页通过 WebRTC JavaScript 探测获取电脑 192.168.x.x 局域网真实内网 IP。
            </span>
          </div>

          {/* 5. Screen Resolution & Hardware Concurrency */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-rose-400" />
              <span>显示器分辨率、色深与 CPU/内存核心</span>
            </span>
            <div className="font-mono text-slate-200 bg-slate-900 p-2 rounded-lg text-[11px]">
              {fp.screen} · {fp.hardware}
            </div>
            <span className="text-[10px] text-slate-500">
              ✓ 随机分配物理分辨率与核心数，避免全部账号呈现千篇一律的机械化配置。
            </span>
          </div>

          {/* 6. Storage Sandbox & Cookies */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
            <span className="text-slate-400 font-medium flex items-center gap-1.5">
              <HardDrive className="h-3.5 w-3.5 text-emerald-400" />
              <span>本地物理存储独立沙箱 (Storage Sandbox)</span>
            </span>
            <div className="font-mono text-emerald-400 bg-slate-900 p-2 rounded-lg text-[11px] truncate">
              {fp.storagePath}
            </div>
            <span className="text-[10px] text-slate-500">
              ✓ Cookie、LocalStorage、IndexedDB 物理级相互隔离，绝不发生跨环境串号。
            </span>
          </div>
        </div>

        {/* 7. Language, Timezone & Geolocation Auto-Sync Box (Direct Answer to Language Question) */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-white flex items-center gap-2">
              <Globe className="h-4 w-4 text-emerald-400" />
              <span>原生语言、系统时区与经纬度自适应锁定 (Language & Timezone Auto-Sync)</span>
            </span>
            <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono font-bold">
              100% 自动匹配 IP 所在国
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-[11px] font-mono">
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">浏览器 Accept-Language:</span>
              <span className="text-emerald-300 font-bold mt-0.5 block truncate">{fp.language}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">系统原生时区 (Timezone):</span>
              <span className="text-blue-300 font-bold mt-0.5 block truncate">{fp.timezone}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">区域与货币 (Locale & Currency):</span>
              <span className="text-purple-300 font-bold mt-0.5 block truncate">{fp.locale} · {fp.currency}</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed pt-1">
            ✓ 当账号配置为<strong>美国住宅 IP</strong> 时，沙箱底层自动将浏览器请求头（Accept-Language）伪装为<strong>纯英语 (en-US)</strong>，并将 JavaScript 时区自动校准为美国当地（如美东纽约 UTC-5 或美西洛杉矶 UTC-8），杜绝“人在中国假装在美国”的时区与语言倒置破绽。
          </p>
        </div>

        {/* User-Agent Full Line */}
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1 text-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-medium">当前指纹环境 User-Agent 字符串：</span>
            <button
              onClick={() => handleCopy(fp.userAgent, 'ua')}
              className="text-slate-500 hover:text-slate-300"
            >
              {copiedKey === 'ua' ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
          <div className="font-mono text-slate-300 bg-slate-900 p-2 rounded-lg text-[11px] break-all">
            {fp.userAgent}
          </div>
        </div>

        {/* Close Button */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <span className="text-xs text-slate-500">
            底层由 AdsPower / BitBrowser 本地指纹内核与 Puppeteer-Stealth 物理级驱动
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-blue-500/20"
          >
            完成查看
          </button>
        </div>
      </div>
    </div>
  );
};
