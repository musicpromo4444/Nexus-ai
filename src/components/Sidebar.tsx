import React from 'react';
import {
  Plus,
  MessageSquare,
  Mic,
  HardDrive,
  Cpu,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Zap,
  Trash2,
  Terminal,
  Layers,
  Database
} from 'lucide-react';
import { ChatSession, GradientTheme, InteractionMode } from '../types';
import { playUiSound } from '../utils/audio';

interface SidebarProps {
  activeTheme: GradientTheme;
  mode: InteractionMode;
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  soundEnabled: boolean;
  onOpenThemeCustomizer: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTheme,
  mode,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
  soundEnabled,
  onOpenThemeCustomizer,
}) => {
  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 flex flex-col bg-[#0e1018] border-r border-white/[0.08] transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${isCollapsed ? 'w-20' : 'w-72'}`}
      >
        {/* App Header & Logo */}
        <div className="h-16 px-4 border-b border-white/[0.08] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Hexagonal Geometric Icon */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden border border-white/20 shadow-md"
              style={{
                background: activeTheme.gradient,
                boxShadow: `0 0 14px ${activeTheme.glowRgbaSubtle}`,
              }}
            >
              <Zap className="w-5 h-5 text-white" />
              <div className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity" />
            </div>

            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold tracking-tight text-white text-base">Nexus</span>
                  <span
                    className="text-xs font-semibold px-1.5 py-0.2 rounded-md uppercase tracking-wider"
                    style={{
                      background: activeTheme.badgeBg,
                      color: activeTheme.primaryHex,
                    }}
                  >
                    AI
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 truncate">Personal Neural Assistant</span>
              </div>
            )}
          </div>

          {/* Collapse toggle button on desktop */}
          <button
            onClick={() => {
              if (soundEnabled) playUiSound('click');
              onToggleCollapse();
            }}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Mode Status Pill */}
        {!isCollapsed && (
          <div className="px-4 pt-3 pb-1">
            <div
              className="px-3 py-2 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between"
              style={{ borderColor: `${activeTheme.primaryHex}20` }}
            >
              <div className="flex items-center gap-2">
                {mode === 'voice' ? (
                  <Mic className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                ) : (
                  <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span className="text-xs text-slate-300 font-medium">
                  {mode === 'voice' ? 'Voice Synapse Active' : 'Offline Cache Fallback'}
                </span>
              </div>
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: activeTheme.primaryHex }}
              />
            </div>
          </div>
        )}

        {/* New Session Action */}
        <div className="p-3 flex-shrink-0">
          <button
            onClick={() => {
              if (soundEnabled) playUiSound('click');
              onNewSession();
              if (window.innerWidth < 768) onClose();
            }}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 border border-white/10 hover:border-white/30 text-white ${
              isCollapsed ? 'px-0' : 'px-4'
            } group`}
            style={{
              background: 'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
            }}
            title="Start New Conversation Session"
          >
            <Plus className="w-4 h-4 text-slate-300 group-hover:text-white group-hover:rotate-90 transition-all duration-300" />
            {!isCollapsed && <span>New Session</span>}
          </button>
        </div>

        {/* Scrollable Conversation Sessions List */}
        <div className="flex-1 overflow-y-auto px-3 py-1 space-y-4">
          <div>
            {!isCollapsed && (
              <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider px-2 mb-2 flex items-center justify-between">
                <span>Recent Conversations</span>
                <span className="text-[10px] text-slate-300">{sessions.length} sessions</span>
              </div>
            )}

            <div className="space-y-1">
              {sessions.map((session) => {
                const isActive = session.id === activeSessionId;
                return (
                  <div
                    key={session.id}
                    onClick={() => {
                      if (soundEnabled) playUiSound('click');
                      onSelectSession(session.id);
                      if (window.innerWidth < 768) onClose();
                    }}
                    className={`group relative flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all ${
                      isActive
                        ? 'bg-white/[0.08] text-white border border-white/15'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                    }`}
                    style={
                      isActive
                        ? {
                            boxShadow: `0 0 12px ${activeTheme.glowRgbaSubtle}`,
                            borderColor: `${activeTheme.primaryHex}40`,
                          }
                        : undefined
                    }
                    title={session.title}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <MessageSquare className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-white' : 'text-slate-300'}`} />
                      {!isCollapsed && (
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium truncate">{session.title}</p>
                          <p className="text-[10px] text-slate-300">{session.timestamp}</p>
                        </div>
                      )}
                    </div>

                    {!isCollapsed && sessions.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (soundEnabled) playUiSound('click');
                          onDeleteSession(session.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-400 transition-opacity"
                        title="Delete session"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Neural Tools / Assistant Features */}
          {!isCollapsed && (
            <div className="pt-2 border-t border-white/[0.06]">
              <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider px-2 mb-2">
                Neural Modules
              </div>
              <div className="space-y-1 text-xs text-slate-300">
                <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/[0.03] transition-colors cursor-pointer">
                  <Terminal className="w-3.5 h-3.5 text-slate-300" />
                  <span>Code & System Sandbox</span>
                </div>
                <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/[0.03] transition-colors cursor-pointer">
                  <Database className="w-3.5 h-3.5 text-slate-300" />
                  <span>Offline Knowledge Vault</span>
                </div>
                <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/[0.03] transition-colors cursor-pointer">
                  <Layers className="w-3.5 h-3.5 text-slate-300" />
                  <span>Neural Context Cache</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Telemetry & System Status Footer */}
        {!isCollapsed && (
          <div className="p-3 border-t border-white/[0.08] bg-black/30">
            <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Cpu className="w-3 h-3 text-slate-300" />
                  Local Engine Load
                </span>
                <span className="text-emerald-400 font-mono font-medium">1.8%</span>
              </div>
              {/* Progress mini bar */}
              <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: '32%',
                    background: activeTheme.gradient,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] text-slate-300">
                <span>Inference: 14ms</span>
                <span>Cache: 142MB</span>
              </div>
            </div>
          </div>
        )}

        {/* Profile & Theme Trigger */}
        <div className="p-3 border-t border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-8 h-8 rounded-full border border-white/30 flex items-center justify-center font-bold text-xs text-white shadow-inner flex-shrink-0"
              style={{
                background: activeTheme.gradient,
              }}
            >
              NX
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">Personal Workspace</p>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Synchronized
                </p>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <button
              onClick={() => {
                if (soundEnabled) playUiSound('click');
                onOpenThemeCustomizer();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Theme Customizer"
            >
              <Sparkles className="w-4 h-4 text-slate-400 hover:text-white" />
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
