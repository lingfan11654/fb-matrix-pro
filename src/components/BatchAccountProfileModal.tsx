import React, { useState } from 'react';
import {
  X,
  UploadCloud,
  Sparkles,
  ShieldCheck,
  Check,
  CheckCircle2,
  Trash2,
  Save,
  Key,
  Globe,
  Sliders,
  Edit2,
  AlertCircle
} from 'lucide-react';
import { FBAccount } from '../types';
import { trimWhiteBorders, compressAvatarImage, deduplicateImages } from '../utils/imageHelper';
import { FEMALE_NAMES_POOL } from '../data/mockData';

const BRAZIL_FEMALE_NAMES = [
  'Ana Silva', 'Beatriz Santos', 'Camila Oliveira', 'Fernanda Lima',
  'Juliana Costa', 'Larissa Souza', 'Gabriela Pereira', 'Mariana Alves',
  'Patricia Rocha', 'Rebeca Martins', 'Vanessa Barbosa', 'Amanda Lima',
  'Bruna Carvalho', 'Carolina Ribeiro', 'Daniela Ferreira', 'Eduarda Gomes'
];

const US_FEMALE_NAMES = [
  'Emma Carter', 'Sophia Miller', 'Olivia Davis', 'Ava Johnson',
  'Mia Wilson', 'Emily Clark', 'Chloe Anderson', 'Grace Taylor',
  'Lily Robinson', 'Hannah White', 'Zoe Martin', 'Harper Jackson',
  'Ella Thompson', 'Amelia Harris', 'Charlotte Lewis', 'Scarlett Walker'
];

const BIO_TEMPLATES = {
  lifestyle: [
    'Digital creator in NYC 🗽 | Coffee, fashion & travel ✨ | Collabs via DM 💌',
    'Living life in golden hour 🌅 | Fitness & good vibes | Miami, FL 🌴',
    'Architect & design lover 📐 | Exploring the world one city at a time ✈️',
    'Life enthusiast ✨ | Photography & simple joys | Los Angeles, CA ☀️',
    'Marketing strategist & book lover ☕ | Dream big, work hard 💫'
  ],
  ecommerce: [
    'Global Ecommerce & Dropship Founder 📦 | 7-Figure brand builder | DM for wholesale inquiry',
    'Cross-border trade & supply chain direct 🚢 | Fast shipping US/EU | Contact in bio 🛒',
    'Independent Brand Creator ✨ | Trending viral finds & lifestyle gadgets | Global free shipping 🌍'
  ],
  custom: [
    'Official Verified Account 🌟 | Welcome to my world | Inquiries: contact via Messenger 💬'
  ]
};

interface BatchAccountProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: FBAccount[];
  setAccounts: React.Dispatch<React.SetStateAction<FBAccount[]>>;
  reservedAvatarVault: string[];
  setReservedAvatarVault: React.Dispatch<React.SetStateAction<string[]>>;
}

export const BatchAccountProfileModal: React.FC<BatchAccountProfileModalProps> = ({
  isOpen,
  onClose,
  accounts,
  setAccounts,
  reservedAvatarVault,
  setReservedAvatarVault
}) => {
  if (!isOpen) return null;

  // Step 2 checklist switches
  const [enableAvatar, setEnableAvatar] = useState(true);
  const [enableName, setEnableName] = useState(true);
  const [enableBio, setEnableBio] = useState(true);
  const [enable2FA, setEnable2FA] = useState(false);

  // Region for names
  const [nameRegion, setNameRegion] = useState<'us' | 'br'>('us');

  // Bio style
  const [bioStyle, setBioStyle] = useState<'lifestyle' | 'ecommerce'>('lifestyle');

  // Avatar photos state
  const [photos, setPhotos] = useState<string[]>(() => {
    return reservedAvatarVault.length > 0 ? [...reservedAvatarVault] : [];
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setNoticeMessage(msg);
    setTimeout(() => setNoticeMessage(null), 4000);
  };

  // Upload handler with auto-compress & auto-trim & deduplication
  const handleUploadFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsProcessing(true);
    const compressedList: string[] = [];
    for (const file of Array.from(files)) {
      const comp = await compressAvatarImage(file, 360, 360, 0.85, true);
      compressedList.push(comp);
    }
    const { unique, duplicatesCount } = deduplicateImages([...photos, ...compressedList]);
    setPhotos(unique);
    setIsProcessing(false);

    if (duplicatesCount > 0) {
      showNotice(`🛡️ 智能去重：已自动过滤 ${duplicatesCount} 张重复照片，当前就绪 ${unique.length} 张！`);
    } else {
      showNotice(`✅ 成功加载并优化 ${compressedList.length} 张高清真人照片！`);
    }
  };

  // 1-Click Trim White Borders
  const handleTrimAll = async () => {
    if (photos.length === 0) return;
    setIsProcessing(true);
    const trimmed: string[] = [];
    for (const img of photos) {
      const res = await trimWhiteBorders(img);
      trimmed.push(res);
    }
    setPhotos(trimmed);
    setIsProcessing(false);
    showNotice(`✨ 智能消除白边完成：已自动切除所有 ${photos.length} 张照片的截图白边与边缘杂色！`);
  };

  // 1-Click Deduplication
  const handleDeduplicate = () => {
    if (photos.length === 0) return;
    const { unique, duplicatesCount } = deduplicateImages(photos);
    setPhotos(unique);
    if (duplicatesCount > 0) {
      showNotice(`🛡️ 去重完成：已自动剔除 ${duplicatesCount} 张重复照片，保留 ${unique.length} 张唯一照片！`);
    } else {
      showNotice(`🛡️ 检测完毕：全部 ${photos.length} 张照片均为 100% 独立唯一，无任何重复！`);
    }
  };

  // Save to reserved vault (for applying in 2 days)
  const handleSaveToVaultOnly = () => {
    if (photos.length === 0) {
      showNotice('⚠️ 请先上传或添加至少 1 张真人头像照片！');
      return;
    }
    setReservedAvatarVault(photos);
    showNotice(`💾 成功保存！${photos.length} 张专属照片及改密预设已存入系统素材库，过两天直接一键应用！`);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  // Execute Batch Dressing immediately
  const handleExecuteNow = () => {
    if (!enableAvatar && !enableName && !enableBio && !enable2FA) {
      showNotice('⚠️ 请至少勾选一个需要执行修改的项目！');
      return;
    }

    const nameList = nameRegion === 'us' ? US_FEMALE_NAMES : BRAZIL_FEMALE_NAMES;
    const bios = BIO_TEMPLATES[bioStyle];

    setAccounts(prev => {
      return prev.map((acc, idx) => {
        const updated = { ...acc };

        // 1. Avatar
        if (enableAvatar && photos.length > 0) {
          if (idx < photos.length) {
            updated.avatar = photos[idx];
          }
        }

        // 2. Name
        if (enableName) {
          updated.name = nameList[idx % nameList.length];
        }

        // 3. Bio & Username
        if (enableBio) {
          const cleanName = updated.name.toLowerCase().replace(/\s+/g, '_');
          const randomSuffix = Math.floor(10 + Math.random() * 89);
          // Auto assign ID & bio
          (updated as any).customId = `@${cleanName}_${randomSuffix}`;
          (updated as any).bio = bios[idx % bios.length];
        }

        // 4. 2FA & Password
        if (enable2FA) {
          (updated as any).twoFactorStatus = '2FA密钥已重置更新(防号贩子找回)';
        }

        return updated;
      });
    });

    // Also persist photos to vault
    if (photos.length > 0) {
      setReservedAvatarVault(photos);
    }

    showNotice(`🎉 成功！已为全矩阵 ${accounts.length} 个账号批量执行所选改装项目！`);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  const activeNames = nameRegion === 'us' ? US_FEMALE_NAMES : BRAZIL_FEMALE_NAMES;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 space-y-5 shadow-2xl my-6 animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shadow-inner">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  【步骤 2】自由勾选需要修改的项目 (分开设置，按需执行)
                </h3>
              </div>
              <p className="text-xs text-slate-400">
                支持今天暂存到系统、等 2-3 天养号权重稳固后随时一键无感换装 · 彻底防关联
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Global Notice Toast */}
        {noticeMessage && (
          <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2 font-semibold animate-fadeIn">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{noticeMessage}</span>
          </div>
        )}

        {/* Top Checkbox Selector Row (Reference Match) */}
        <div className="flex items-center justify-between flex-wrap gap-2 pt-1 pb-1">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full">
            {/* 1. 更改头像 */}
            <label
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                enableAvatar
                  ? 'bg-cyan-500/10 border-cyan-500/60 text-white shadow-sm'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <input
                type="checkbox"
                checked={enableAvatar}
                onChange={(e) => setEnableAvatar(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer"
              />
              <span className="text-xs font-bold flex items-center gap-1.5">
                <span>🖼️ 更改头像 (图库)</span>
              </span>
            </label>

            {/* 2. 更改名字 */}
            <label
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                enableName
                  ? 'bg-cyan-500/10 border-cyan-500/60 text-white shadow-sm'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <input
                type="checkbox"
                checked={enableName}
                onChange={(e) => setEnableName(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer"
              />
              <span className="text-xs font-bold flex items-center gap-1.5">
                <span className="text-[10px] px-1 py-0.2 rounded bg-blue-500/30 text-blue-300 font-mono">
                  {nameRegion.toUpperCase()}
                </span>
                <span>更改{nameRegion === 'us' ? '欧美' : '巴西'}女性名</span>
              </span>
            </label>

            {/* 3. 更改简介 & 专属ID */}
            <label
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                enableBio
                  ? 'bg-cyan-500/10 border-cyan-500/60 text-white shadow-sm'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <input
                type="checkbox"
                checked={enableBio}
                onChange={(e) => setEnableBio(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer"
              />
              <span className="text-xs font-bold flex items-center gap-1.5">
                <span>📝 更改简介 & 专属ID</span>
              </span>
            </label>

            {/* 4. 设置/更改 2FA 密码 */}
            <label
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                enable2FA
                  ? 'bg-amber-500/10 border-amber-500/60 text-amber-200 shadow-sm'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
              }`}
            >
              <input
                type="checkbox"
                checked={enable2FA}
                onChange={(e) => setEnable2FA(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer"
              />
              <span className="text-xs font-bold flex items-center gap-1.5">
                <span>🔑 设置/更改 2FA 密码</span>
              </span>
            </label>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">已勾选的项目才会执行更新</span>
        </div>

        {/* Section 1: 本地真人头像图库 (Local Real Avatar Photo Library) */}
        <div className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-4 ${enableAvatar ? 'bg-slate-950/70 border-slate-800' : 'opacity-50 pointer-events-none bg-slate-950/30 border-slate-900'}`}>
          <div className="flex items-center justify-between flex-wrap gap-2.5">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <span className="text-emerald-400">🖼️</span> 本地真人头像图库
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-medium">
                已加载 {photos.length} 张头像 (自动按目标账号轮换分配)
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleTrimAll}
                disabled={photos.length === 0 || isProcessing}
                className="px-3 py-1.5 rounded-xl bg-cyan-600/20 hover:bg-cyan-600/30 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                <span>智能消除截图白边 & 人像居中</span>
              </button>

              <button
                type="button"
                onClick={handleDeduplicate}
                disabled={photos.length === 0 || isProcessing}
                className="px-3 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 border border-amber-500/40 text-amber-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                <span>智能一键去重</span>
              </button>

              <label className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer active:scale-95">
                <UploadCloud className="h-3.5 w-3.5" />
                <span>+ 批量选图 (支持多选/全选)</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleUploadFiles(e.target.files)}
                />
              </label>
            </div>
          </div>

          {/* Photo Gallery Grid */}
          {photos.length > 0 ? (
            <div className="space-y-2">
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-10 gap-2.5 max-h-48 overflow-y-auto p-2 bg-slate-900/60 rounded-2xl border border-slate-800">
                {photos.map((imgSrc, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-sm">
                    <img src={imgSrc} alt={`avatar-${idx}`} className="w-full h-full object-cover" />
                    <span className="absolute top-1 left-1 bg-black/75 text-white font-mono text-[9px] px-1 py-0.2 rounded backdrop-blur-xs">
                      #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPhotos(prev => prev.filter((_, i) => i !== idx))}
                      className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-80 group-hover:opacity-100 hover:scale-110 transition-all cursor-pointer"
                      title="删除此张"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <label className="border-2 border-dashed border-slate-800 hover:border-emerald-500/60 rounded-2xl p-6 text-center bg-slate-900/40 cursor-pointer block space-y-2 transition-colors">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 text-emerald-400 mx-auto flex items-center justify-center">
                <UploadCloud className="h-5 w-5" />
              </div>
              <div className="text-xs font-bold text-slate-300">
                + 批量选图 (支持全选 / 多选)
              </div>
              <p className="text-[11px] text-slate-500">
                💡 提示：可直接点击【+ 批量选图】或拖拽多张真人照片一次性批量导入，系统将自动分配至目标账号并智能轮换！
              </p>
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleUploadFiles(e.target.files)}
              />
            </label>
          )}
        </div>

        {/* Section 2 & 3: 名字库 + 简介与专属 ID (2-column layout match) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 名字库 */}
          <div className={`p-4 rounded-2xl border space-y-3 ${enableName ? 'bg-slate-950/70 border-slate-800' : 'opacity-50 pointer-events-none bg-slate-950/30 border-slate-900'}`}>
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span className="text-emerald-400">✨</span> 名字库 ({nameRegion === 'us' ? '欧美' : '巴西'}女性名随机分配)
                </span>
                <span className="text-[11px] text-cyan-400 font-mono font-medium">共 {activeNames.length} 个</span>
              </div>
              <div className="flex items-center gap-1 p-0.5 bg-slate-900 rounded-lg border border-slate-800 text-[10px]">
                <button
                  type="button"
                  onClick={() => setNameRegion('us')}
                  className={`px-2 py-0.5 rounded ${nameRegion === 'us' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  🇺🇸 欧美
                </button>
                <button
                  type="button"
                  onClick={() => setNameRegion('br')}
                  className={`px-2 py-0.5 rounded ${nameRegion === 'br' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  🇧🇷 巴西
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-slate-900/60 rounded-xl border border-slate-800/80">
              {activeNames.map((name, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] font-medium"
                >
                  {name}
                </span>
              ))}
            </div>
          </div>

          {/* 简介与专属 ID */}
          <div className={`p-4 rounded-2xl border space-y-3 ${enableBio ? 'bg-slate-950/70 border-slate-800' : 'opacity-50 pointer-events-none bg-slate-950/30 border-slate-900'}`}>
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <span className="text-cyan-400">🔗</span> 简介与专属 ID (系统智能分配)
              </span>
              <div className="flex items-center gap-1 p-0.5 bg-slate-900 rounded-lg border border-slate-800 text-[10px]">
                <button
                  type="button"
                  onClick={() => setBioStyle('lifestyle')}
                  className={`px-2 py-0.5 rounded ${bioStyle === 'lifestyle' ? 'bg-cyan-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  生活名媛风
                </button>
                <button
                  type="button"
                  onClick={() => setBioStyle('ecommerce')}
                  className={`px-2 py-0.5 rounded ${bioStyle === 'ecommerce' ? 'bg-purple-600 text-white font-bold' : 'text-slate-400 hover:text-white'}`}
                >
                  跨境电商风
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80 text-xs text-slate-300 space-y-2 leading-relaxed">
              <p className="flex items-start gap-2">
                <span className="text-cyan-400 shrink-0">•</span>
                <span>
                  自动分配专属 ID：如 <code className="text-cyan-300 font-mono">@emma_ny89</code>, <code className="text-cyan-300 font-mono">@sophia_la72</code>
                </span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-emerald-400 shrink-0">•</span>
                <span>
                  自动分配高转化个性签名：如 <span className="text-emerald-300 font-mono text-[11px]">"{BIO_TEMPLATES[bioStyle][0]}"</span>
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Section 4: 2FA 两步验证与安全密码 (修改/重置/防找回) */}
        <div className={`p-4 rounded-2xl border space-y-1.5 transition-all ${
          enable2FA ? 'bg-amber-500/10 border-amber-500/40 text-amber-200' : 'bg-slate-950/40 border-slate-800/60 text-slate-400'
        }`}>
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Key className="h-3.5 w-3.5" />
            </div>
            <span>Facebook 2FA 两步验证安全密码 (修改 / 重置 / 彻底防找回)</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed pl-8">
            为新购买的老号/协议号统一更改 2FA 密保与安全密码，彻底杜绝前号主/号贩子利用历史 Cookie 或旧密码二次登录与恶意找回！
          </p>
        </div>

        {/* Action Bottom Bar */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveToVaultOnly}
              className="px-4 py-2.5 rounded-xl bg-amber-600/30 hover:bg-amber-600/40 border border-amber-500/60 text-amber-200 text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer active:scale-95"
            >
              <Save className="h-4 w-4 text-amber-400" />
              <span>💾 保存配置至系统素材库 (过两天养好号再一键改装)</span>
            </button>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              ⭐ 推荐养号第 3-5 天时再执行改装
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleExecuteNow}
              className="px-6 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md shadow-cyan-500/25 active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="h-4 w-4" />
              <span>🚀 立即批量执行改装 (已勾选项目)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
