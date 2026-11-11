import React from 'react';
import { 
  FileText, 
  Sparkles, 
  MessageSquare, 
  HardDrive, 
  Cloud, 
  LogOut, 
  UserCircle
} from 'lucide-react';
import { UserAccount } from '../types';

interface HeaderProps {
  user: UserAccount | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  onOpenAuth: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  activeTab,
  setActiveTab,
  onLogout,
  onOpenAuth,
}) => {
  const navTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: FileText },
    { id: 'summarize', label: 'Summarizer', icon: Sparkles },
    { id: 'chat', label: 'Document Q&A', icon: MessageSquare },
    { id: 'history', label: 'History & Storage', icon: HardDrive },
    { id: 'supabase', label: 'Cloud Settings', icon: Cloud },
  ];

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-md sticky top-0 z-50 shadow-lg shadow-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 min-h-[70px] flex items-center justify-between gap-4">
        {/* Brand Logo & Name with Subtitle */}
        <div className="flex items-center gap-3.5 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500 via-indigo-600 to-blue-600 p-[1px] shadow-md shadow-fuchsia-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-fuchsia-400" />
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-slate-100 via-fuchsia-200 to-blue-400 bg-clip-text text-transparent">
                Cloud AI Summarizer
              </span>
              <span className="hidden xl:inline-flex text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/30">
                Supabase
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-400 tracking-wide mt-0.5 hidden sm:block">
              AI Document Summarization & Cloud Storage
            </p>
          </div>
        </div>

        {/* Primary Project Navigation Tabs */}
        <nav className="hidden lg:flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 shrink-0 shadow-inner">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-fuchsia-600 to-blue-600 text-white shadow-md shadow-fuchsia-500/25'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Controls: Cloud Status & User Profile */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Cloud Status Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-fuchsia-400 shadow-[0_0_8px_rgba(217,70,239,0.8)] animate-pulse" />
            <span className="text-slate-300 font-mono text-[11px]">Cloud Active</span>
          </div>

          {/* User Profile / Auth Button */}
          {user ? (
            <div className="flex items-center gap-2.5 pl-1 sm:pl-2">
              <div className="hidden md:flex items-center gap-2 text-right">
                <UserCircle className="w-7 h-7 text-fuchsia-400/80 shrink-0" />
                <div className="text-left">
                  <div className="text-xs font-bold text-slate-200 truncate max-w-[120px]">
                    {user.email.split('@')[0]}
                  </div>
                  <div className="text-[10px] text-fuchsia-400 font-medium">Supabase Auth</div>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/30 transition-colors cursor-pointer"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-blue-600 hover:from-fuchsia-500 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-fuchsia-600/30 transition-all cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>
      </div>

      {/* Responsive Navigation Bar for medium & mobile screens */}
      <div className="lg:hidden flex overflow-x-auto gap-1.5 px-4 py-2.5 bg-slate-950 border-t border-slate-900 scrollbar-none">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-fuchsia-600 to-blue-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:bg-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
