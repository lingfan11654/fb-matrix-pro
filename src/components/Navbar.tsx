import React from 'react';
import { LayoutDashboard, Cpu, Sparkles, Smartphone, Play, Zap, UploadCloud } from 'lucide-react';

interface NavbarProps {
  currentTab: 'video_features' | 'dashboard' | 'architecture';
  setCurrentTab: (tab: 'video_features' | 'dashboard' | 'architecture') => void;
  accountsCount?: number;
  onOpenSimulator: () => void;
  onOpenLoginModal?: () => void;
  onOpenRealWorker?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  accountsCount = 0,
  onOpenSimulator,
  onOpenLoginModal,
  onOpenRealWorker
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-bold text-white shadow-md shadow-blue-500/20">
            <span className="text-lg">F</span>
          </div>
          <a
            href="#"
            onClick={(e) => { e.preventDefault(); setCurrentTab('video_features'); }}
            className="text-lg font-bold tracking-tight text-white hover:text-blue-400 transition-colors"
          >
            FBMatrix
          </a>
          <span className="text-xs text-slate-500 font-normal hidden sm:inline">
            多场景精准获客与社交矩阵系统
          </span>
        </div>

        {/* Zone 2: Navigation Links / Segmented Mode Switcher */}
        <nav className="flex items-center gap-1 rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs sm:text-sm font-medium">
          <button
            onClick={() => setCurrentTab('video_features')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors whitespace-nowrap ${
              currentTab === 'video_features'
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Zap className="h-4 w-4" />
            <span>自动化拓客中枢</span>
          </button>
          <button
            onClick={() => setCurrentTab('dashboard')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors whitespace-nowrap ${
              currentTab === 'dashboard'
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>矩阵云控工作台</span>
          </button>
          <button
            onClick={() => setCurrentTab('architecture')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition-colors whitespace-nowrap ${
              currentTab === 'architecture'
                ? 'bg-blue-600 text-white shadow-sm font-semibold'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Cpu className="h-4 w-4" />
            <span>防封与养号策略</span>
          </button>
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenLoginModal}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-[11px] font-mono text-slate-300 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            title="点击查看已接入账号或导入新账号"
          >
            <span className={`w-2 h-2 rounded-full shrink-0 ${accountsCount > 0 ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            <span className="whitespace-nowrap">{accountsCount > 0 ? `已接入 ${accountsCount} 个矩阵账号` : '就绪等待账号接入 (点击导号)'}</span>
          </button>

          {onOpenRealWorker && (
            <button
              onClick={onOpenRealWorker}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 text-xs font-bold transition-all shadow-md shadow-emerald-500/20 whitespace-nowrap animate-pulse"
              title="点击打开真实加人自动化脚本与真机执行指南"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>⚡ 真实加人 (Real)</span>
            </button>
          )}

          <button
            onClick={onOpenLoginModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white px-3.5 py-1.5 text-xs font-bold transition-all shadow-md shadow-blue-500/20 whitespace-nowrap"
            title="点击拉入 TXT/CSV 文件批量导入 FB 账号卡密"
          >
            <UploadCloud className="h-3.5 w-3.5" />
            <span>+ 导入 FB 账号</span>
          </button>

          <button
            onClick={onOpenSimulator}
            className="hidden md:inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-slate-600 hover:bg-slate-800 transition-colors whitespace-nowrap shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5 text-blue-400" />
            <span>实时沙箱</span>
          </button>
        </div>
      </div>
    </header>
  );
};
