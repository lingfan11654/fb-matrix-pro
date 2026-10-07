/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { VideoFeatureShowcase } from './components/VideoFeatureShowcase';
import { DashboardView } from './components/DashboardView';
import { ArchitectureView } from './components/ArchitectureView';
import { ExecutionSimulatorModal } from './components/ExecutionSimulatorModal';
import { AccountLoginModal } from './components/AccountLoginModal';
import { RealWorkerModal } from './components/RealWorkerModal';
import { FBAccount, AutomationTask, Lead } from './types';
import { INITIAL_ACCOUNTS, INITIAL_TASKS, INITIAL_LEADS, FEMALE_NAMES_POOL } from './data/mockData';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'video_features' | 'dashboard' | 'architecture'>('video_features');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRealWorkerOpen, setIsRealWorkerOpen] = useState(false);
  const [projectedAccount, setProjectedAccount] = useState<FBAccount | null>(null);

  const handleOpenSimulator = (acc?: unknown) => {
    const validAcc = (acc && typeof acc === 'object' && 'name' in acc && 'id' in acc && !('nativeEvent' in acc))
      ? (acc as FBAccount)
      : (accounts[0] || INITIAL_ACCOUNTS[0]);
    setProjectedAccount(validAcc);
    setIsSimulatorOpen(true);
  };

  // Pure clean state with localStorage persistence for real user accounts
  const [accounts, setAccounts] = useState<FBAccount[]>(() => {
    try {
      const saved = localStorage.getItem('fb_matrix_real_accounts');
      if (saved) {
        const parsed: FBAccount[] = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const realNameMapByUid: Record<string, string> = {
            '61579759624561': 'Alicia Turner',
            '61579314527257': 'Linda Barrie',
            '61579080766710': 'Denise Hawkins',
            '61578798729746': 'Danielle Clive',
            '61578672255717': 'Joan Buckley',
            '61578964440233': 'Emily Clark',
            '61580110882668': 'Diana Hotz',
            '61579840616215': 'Kennedy Myers',
            '61578926384875': 'Jean Bennet',
            '61579084982377': 'Angela Sotomayor'
          };
          const femaleNameMap: Record<string, string> = {
            'FB-624561': 'Alicia Turner',
            'Emma Carter': 'Alicia Turner',
            'FB-527257': 'Linda Barrie',
            'Sophia Miller': 'Linda Barrie',
            'FB-766710': 'Denise Hawkins',
            'Olivia Davis': 'Denise Hawkins',
            'FB-729746': 'Danielle Clive',
            'Ava Johnson': 'Danielle Clive',
            'FB-255717': 'Joan Buckley',
            'Mia Wilson': 'Joan Buckley',
            'FB-440233': 'Emily Clark',
            'FB-882668': 'Diana Hotz',
            'Chloe Anderson': 'Diana Hotz',
            'FB-616215': 'Kennedy Myers',
            'Grace Taylor': 'Kennedy Myers',
            'FB-384875': 'Jean Bennet',
            'Lily Robinson': 'Jean Bennet',
            'FB-982377': 'Angela Sotomayor',
            'Hannah White': 'Angela Sotomayor'
          };
          return parsed.map((acc, idx) => {
            const matchedUid = Object.keys(realNameMapByUid).find(uid => acc.lastActive?.includes(uid));
            let mappedName = matchedUid ? realNameMapByUid[matchedUid] : (femaleNameMap[acc.name] || acc.name);
            const rawAdded = acc.addedFriendsCount ?? 0;
            // Clean away any abnormally high counts (such as 105 or 150) so accounts respect Day 1 safety limit (0~5)
            const cleanedAdded = (rawAdded > 5) ? 0 : rawAdded;
            return {
              ...acc,
              name: mappedName,
              avatar: acc.avatar || INITIAL_ACCOUNTS[idx % INITIAL_ACCOUNTS.length]?.avatar || '',
              warmingDays: acc.warmingDays || 2,
              addedFriendsCount: cleanedAdded,
              targetClientsGoal: 150
            };
          });
        }
      }
    } catch (e) {
      console.error('Failed to load accounts from storage', e);
    }
    return INITIAL_ACCOUNTS;
  });

  React.useEffect(() => {
    try {
      localStorage.setItem('fb_matrix_real_accounts', JSON.stringify(accounts));
    } catch (e) {
      console.error('Failed to save accounts to storage', e);
    }
  }, [accounts]);

  const [tasks, setTasks] = useState<AutomationTask[]>(() => INITIAL_TASKS);
  const [leads, setLeads] = useState<Lead[]>([]);

  const handleAddAccount = (newAccount: FBAccount) => {
    setAccounts((prev) => {
      const existsIndex = prev.findIndex(a => a.name === newAccount.name || (a.proxyIp && a.proxyIp === newAccount.proxyIp));
      if (existsIndex !== -1) {
        const next = [...prev];
        next[existsIndex] = { ...next[existsIndex], ...newAccount };
        return next;
      }
      return [newAccount, ...prev];
    });
  };

  const handleBatchAddAccounts = (newAccounts: FBAccount[]) => {
    setAccounts((prev) => {
      const existingNames = new Set(prev.map(a => a.name));
      const existingProxies = new Set(prev.map(a => a.proxyIp));
      const uniqueNew: FBAccount[] = [];

      for (const acc of newAccounts) {
        if (!existingNames.has(acc.name) && (!acc.proxyIp || !existingProxies.has(acc.proxyIp))) {
          uniqueNew.push(acc);
          existingNames.add(acc.name);
          if (acc.proxyIp) existingProxies.add(acc.proxyIp);
        }
      }

      return [...uniqueNew, ...prev];
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* Top Bar with 3-Zone Contract */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        accountsCount={accounts.length}
        onOpenSimulator={() => handleOpenSimulator()}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenRealWorker={() => setIsRealWorkerOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {currentTab === 'video_features' && (
          <VideoFeatureShowcase
            accounts={accounts}
            setAccounts={setAccounts}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
            onOpenSimulator={handleOpenSimulator}
            onOpenRealWorker={() => setIsRealWorkerOpen(true)}
          />
        )}

        {currentTab === 'dashboard' && (
          <DashboardView
            accounts={accounts}
            setAccounts={setAccounts}
            tasks={tasks}
            setTasks={setTasks}
            leads={leads}
            setLeads={setLeads}
            onOpenSimulator={handleOpenSimulator}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
          />
        )}

        {currentTab === 'architecture' && (
          <ArchitectureView
            onOpenSimulator={() => handleOpenSimulator()}
          />
        )}
      </main>

      {/* Real Automation Worker Modal */}
      <RealWorkerModal
        isOpen={isRealWorkerOpen}
        onClose={() => setIsRealWorkerOpen(false)}
        accounts={accounts}
      />

      {/* Global Quick Account Login Modal */}
      <AccountLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onAddAccount={handleAddAccount}
        onBatchAddAccounts={handleBatchAddAccounts}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 px-4 sm:px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">FBMatrix Enterprise Control Panel</span>
            <span>·</span>
            <span>Facebook 矩阵自动化拓客与防封云控系统</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>8大加人入口</span>
            <span>·</span>
            <span>AI人脸识别</span>
            <span>·</span>
            <span>Reels截流</span>
            <span>·</span>
            <span>多窗口集群并发</span>
            <span>·</span>
            <span>海外接码上号</span>
            <span>·</span>
            <span>独立指纹沙箱</span>
          </div>
        </div>
      </footer>

      {/* Real-time Execution Simulator Modal */}
      <ExecutionSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        account={projectedAccount}
      />
    </div>
  );
}
