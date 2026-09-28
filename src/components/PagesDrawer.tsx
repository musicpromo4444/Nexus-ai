import React, { useEffect } from 'react';
import {
  X,
  Eye,
  CreditCard,
  Compass,
  Wand2,
  User,
  Brain,
  Settings,
  Bot,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Check,
  Activity,
  Layers,
  Smartphone
} from 'lucide-react';
import { AppPage, GradientTheme } from '../types';
import { playUiSound } from '../utils/audio';

interface PagesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activePage: AppPage;
  onSelectPage: (page: AppPage) => void;
  activeTheme: GradientTheme;
  onSelectTheme: (theme: GradientTheme) => void;
  soundEnabled: boolean;
}

export const PagesDrawer: React.FC<PagesDrawerProps> = ({
  isOpen,
  onClose,
  activePage,
  onSelectPage,
  activeTheme,
  onSelectTheme,
  soundEnabled,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (soundEnabled) playUiSound('click');
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, soundEnabled]);

  if (!isOpen) return null;

  const pagesList = [
    {
      id: 'subscription' as AppPage,
      name: 'Subscription',
      tagline: 'Manage tiers and credits',
      icon: CreditCard,
      badge: 'Pro Tier',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      description: 'Credit balance, tier comparison, billing cycles, and top-ups',
    },
    {
      id: 'recommendation' as AppPage,
      name: 'Recommendation',
      tagline: 'Personalized insights and workflow suggestions',
      icon: Compass,
      badge: 'Feed',
      badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      description: 'System architectural reviews, prompt recipes, and acoustic calibration',
    },
    {
      id: 'creation' as AppPage,
      name: 'Creation',
      tagline: 'AI media generation hub with prompt-to-picture, video, and text cards with built-in action buttons',
      icon: Wand2,
      badge: 'Multi-Modal',
      badgeColor: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
      description: 'Prompt-to-picture, prompt-to-video, and prompt-to-code studios',
    },
    {
      id: 'profile' as AppPage,
      name: 'Profile',
      tagline: 'User identity and account preferences',
      icon: User,
      badge: 'Operator ID',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      description: 'Personal credentials, interaction preferences, and local cache controls',
    },
    {
      id: 'memory-routines' as AppPage,
      name: 'Memory & Routines',
      tagline: 'Assistant memory vault & automated daily routines',
      icon: Sparkles,
      badge: 'Personalized',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      description: 'Saved user context, custom preferences, and automated morning/evening macros',
    },
    {
      id: 'device' as AppPage,
      name: 'Device & Permissions',
      tagline: 'See what Nexus can access on this device',
      icon: Smartphone,
      badge: 'Device',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      description: 'Real browser capability checks and permission boundaries',
    },
    {
      id: 'settings' as AppPage,
      name: 'Settings',
      tagline: 'App configurations',
      icon: Settings,
      badge: 'Atmosphere',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      description: 'Dynamic 7-gradient theme suite, procedural audio synthesizer, failover timeouts',
    },
  ];

  const handlePageClick = (pageId: AppPage) => {
    if (soundEnabled) playUiSound('click');
    onSelectPage(pageId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex overflow-hidden">
      {/* Semi-transparent Smooth Backdrop Overlay */}
      <div
        onClick={() => {
          if (soundEnabled) playUiSound('click');
          onClose();
        }}
        className="fixed inset-0 bg-black/75 backdrop-blur-md transition-opacity duration-300 animate-in fade-in"
      />

      {/* Slide-over Drawer Panel */}
      <div
        className="relative z-50 w-full max-w-lg md:max-w-xl h-full bg-[#0b0e17]/95 border-r border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-left duration-300"
        style={{
          boxShadow: `0 0 60px rgba(14, 165, 233, 0.25), 0 25px 50px -12px rgba(0,0,0,0.9)`,
        }}
      >
        {/* Dynamic Blue Eye Glow Accent in Drawer Header */}
        <div
          className="absolute -top-20 -left-20 w-56 h-56 rounded-full blur-3xl pointer-events-none opacity-30"
          style={{ background: '#0ea5e9' }}
        />

        {/* Drawer Header with Glowing Blue Eye Emblem */}
        <div className="h-18 px-5 py-4 border-b border-white/10 flex items-center justify-between flex-shrink-0 relative z-10 bg-[#0b0e17]/90 backdrop-blur-md">
          <div className="flex items-center gap-3">
            {/* Animated Glowing Blue Eye Avatar */}
            <div
              className="relative w-11 h-11 rounded-2xl flex items-center justify-center border border-cyan-400/40 shadow-lg flex-shrink-0 bg-gradient-to-br from-cyan-950/80 via-blue-900/60 to-slate-950"
              style={{
                boxShadow: '0 0 20px rgba(56, 189, 248, 0.5), inset 0 0 10px rgba(56, 189, 248, 0.2)',
              }}
            >
              <span className="absolute inset-0 rounded-2xl border border-cyan-400/30 animate-pulse" />
              <Eye className="w-6 h-6 text-cyan-300 animate-pulse" />
              <span className="absolute w-2 h-2 rounded-full bg-cyan-200 shadow-[0_0_8px_#38bdf8]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">Nexus Navigation Hub</h2>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                  Live Pages
                </span>
              </div>
              <p className="text-xs text-slate-400">Select any view to switch seamlessly</p>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={() => {
              if (soundEnabled) playUiSound('click');
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.08] border border-transparent hover:border-white/10 transition-colors"
            title="Close Hub (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Assistant Quick Switcher Banner */}
        <div className="px-5 py-3 border-b border-white/[0.06] bg-white/[0.02] flex-shrink-0">
          <button
            onClick={() => handlePageClick('assistant')}
            className={`w-full p-3 rounded-xl border flex items-center justify-between transition-all ${
              activePage === 'assistant'
                ? 'bg-white/[0.10] border-white/40 shadow-md'
                : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.06]'
            }`}
            style={
              activePage === 'assistant'
                ? {
                    borderColor: activeTheme.primaryHex,
                    boxShadow: `0 0 16px ${activeTheme.glowRgbaSubtle}`,
                  }
                : undefined
            }
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/20"
                style={{ background: activeTheme.gradient }}
              >
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>Assistant Workspace</span>
                  {activePage === 'assistant' && (
                    <span className="text-[10px] font-semibold text-emerald-400">● Active</span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400">Voice-First Synapse & Dual-Tier Chat Canvas</div>
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Scrollable List of the 6 Core Pages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Core Application Pages</span>
          </div>

          <div className="space-y-2.5">
            {pagesList.map((page, index) => {
              const Icon = page.icon;
              const isSelected = activePage === page.id;
              return (
                <button
                  key={page.id}
                  onClick={() => handlePageClick(page.id)}
                  className={`w-full p-3.5 rounded-2xl border text-left transition-all duration-200 flex items-start justify-between group ${
                    isSelected
                      ? 'bg-white/[0.10] border-white/40 shadow-lg'
                      : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.06]'
                  }`}
                  style={
                    isSelected
                      ? {
                          borderColor: activeTheme.primaryHex,
                          boxShadow: `0 0 20px ${activeTheme.glowRgbaSubtle}`,
                        }
                      : undefined
                  }
                >
                  <div className="flex items-start gap-3.5 min-w-0 flex-1">
                    {/* Page Icon in Glowing Bubble */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border transition-transform group-hover:scale-105 ${
                        isSelected
                          ? 'border-white/40 shadow-sm'
                          : 'border-white/10 bg-white/[0.05]'
                      }`}
                      style={isSelected ? { background: activeTheme.gradient } : undefined}
                    >
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'}`} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-slate-500">0{index + 1}.</span>
                        <h3 className="text-sm font-bold text-white group-hover:text-cyan-200 transition-colors">
                          {page.name}
                        </h3>
                        <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border ${page.badgeColor}`}>
                          {page.badge}
                        </span>
                      </div>

                      <p className="text-xs font-medium text-slate-300 mt-1 leading-snug">
                        {page.tagline}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        {page.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pl-2 flex-shrink-0 mt-1">
                    {isSelected ? (
                      <div
                        className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px]"
                        style={{ background: activeTheme.gradient }}
                      >
                        <Check className="w-3 h-3" />
                      </div>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-transform" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Drawer Footer with Theme Indicator */}
        <div className="p-4 border-t border-white/10 bg-[#0b0e17]/90 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Zero-Latency Seamless View Router</span>
          </div>

          <button
            onClick={() => {
              if (soundEnabled) playUiSound('click');
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white transition-all duration-200"
            style={{
              background: activeTheme.gradient,
              boxShadow: `0 0 14px ${activeTheme.glowRgbaSubtle}`,
            }}
          >
            Close Hub
          </button>
        </div>
      </div>
    </div>
  );
};
