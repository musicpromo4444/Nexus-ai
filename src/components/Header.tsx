import React from 'react';
import {
  Mic,
  MessageSquareCode,
  Palette,
  Eye,
  WifiOff,
  Sparkles,
  Brain,
  Zap,
  ChevronRight,
  Bot
} from 'lucide-react';
import { AppPage, ComputeTier, GradientTheme, InteractionMode, VoiceState } from '../types';
import { playUiSound } from '../utils/audio';

interface HeaderProps {
  activeTheme: GradientTheme;
  mode: InteractionMode;
  onToggleMode: (newMode: InteractionMode) => void;
  voiceState: VoiceState;
  onOpenThemeCustomizer: () => void;
  isPagesDrawerOpen: boolean;
  onTogglePagesDrawer: () => void;
  soundEnabled: boolean;
  computeTier: ComputeTier;
  onToggleComputeTier: (newTier: ComputeTier) => void;
  autoDetectReasoning: boolean;
  onToggleAutoDetect: () => void;
  activePage?: AppPage;
  onSelectPage?: (page: AppPage) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTheme,
  mode,
  onToggleMode,
  voiceState,
  onOpenThemeCustomizer,
  isPagesDrawerOpen,
  onTogglePagesDrawer,
  soundEnabled,
  computeTier,
  onToggleComputeTier,
  autoDetectReasoning,
  onToggleAutoDetect,
  activePage = 'assistant',
  onSelectPage,
}) => {
  const pageTitles: Record<AppPage, string> = {
    assistant: 'Assistant Workspace',
    subscription: 'Subscription',
    recommendation: 'Recommendations',
    creation: 'Creation Studio',
    profile: 'Operator Profile',
    'memory-routines': 'Memory & Routines',
    'neural-modules': 'Memory & Routines',
    settings: 'App Settings',
  };

  return (
    <header className="h-16 px-3 sm:px-5 md:px-6 border-b border-white/[0.08] bg-[#0d0f16]/90 backdrop-blur-lg flex items-center justify-between z-30 flex-shrink-0 gap-2">
      {/* Left section: Animated Glowing Floating Blue Eye Icon + Breadcrumb */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Animated Glowing Floating Blue Eye Icon Button */}
        <button
          onClick={() => {
            if (soundEnabled) playUiSound('glow');
            onTogglePagesDrawer();
          }}
          className={`relative px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-2xl border transition-all duration-300 flex items-center gap-2 group backdrop-blur-xl hover:scale-105 active:scale-95 cursor-pointer ${
            isPagesDrawerOpen
              ? 'bg-cyan-500/20 border-cyan-400 text-white shadow-2xl'
              : 'bg-white/[0.04] hover:bg-cyan-500/15 text-cyan-300 hover:text-white border-cyan-500/30 hover:border-cyan-400 shadow-md'
          }`}
          style={{
            boxShadow: isPagesDrawerOpen
              ? `0 0 24px rgba(56, 189, 248, 0.8), 0 0 45px rgba(14, 165, 233, 0.45), inset 0 0 12px rgba(56, 189, 248, 0.4)`
              : `0 0 16px rgba(56, 189, 248, 0.35), 0 0 26px ${activeTheme.glowRgbaSubtle}, inset 0 0 8px rgba(56, 189, 248, 0.15)`,
          }}
          title="Toggle Nexus Pages & Views Hub (Floating Blue Eye)"
          aria-label="Toggle Nexus Pages & Views Hub"
        >
          {/* Subtle outer pulsing halo */}
          <span className="absolute inset-0 rounded-2xl bg-cyan-400/20 animate-ping pointer-events-none opacity-40 duration-1000" />

          {/* Floating Glowing Eye Icon Container */}
          <div className="relative flex items-center justify-center w-5 h-5">
            <Eye className="w-5 h-5 text-cyan-300 group-hover:text-cyan-100 transition-colors drop-shadow-[0_0_8px_rgba(56,189,248,0.9)] animate-pulse" />
            {/* Glowing Blue Pupil */}
            <span
              className="absolute w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#38bdf8] transition-transform group-hover:scale-125"
            />
          </div>

          <span className="text-xs font-bold tracking-tight text-cyan-200 group-hover:text-white hidden sm:inline">
            Pages
          </span>

          {/* Micro indicator dot showing active vibrant blue glow */}
          <span
            className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_6px_#38bdf8]"
          />
        </button>

        {/* Current Active Page Breadcrumb Indicator */}
        {activePage !== 'assistant' && onSelectPage && (
          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => {
                if (soundEnabled) playUiSound('click');
                onSelectPage('assistant');
              }}
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-1"
            >
              <Bot className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">Assistant</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <span className="font-bold text-white px-2 py-0.5 rounded-lg bg-white/[0.05] border border-white/10">
              {pageTitles[activePage]}
            </span>
          </div>
        )}

        {/* Status Indicator */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.03] border border-white/10 text-xs">
          {mode === 'voice' ? (
            <>
              <span className="relative flex h-2 w-2">
                <span
                  className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                  style={{ backgroundColor: activeTheme.primaryHex }}
                />
                <span
                  className="relative inline-flex rounded-full h-2 w-2"
                  style={{ backgroundColor: activeTheme.primaryHex }}
                />
              </span>
              <span className="text-slate-300 font-medium">
                Voice Synapse:{' '}
                <span className="text-white capitalize">
                  {voiceState === 'listening' ? 'Listening...' : voiceState === 'speaking' ? 'Speaking...' : 'Ready'}
                </span>
              </span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-300 font-medium">
                Offline Mode: <span className="text-emerald-400">Zero-Latency Fallback</span>
              </span>
            </>
          )}
        </div>
      </div>

      {/* Center section: Dual Interaction Mode Switcher + Hybrid Reasoning Compute Tier */}
      <div className="flex items-center gap-2">
        {/* Interaction Mode Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-[#141824] border border-white/10 shadow-inner">
          <button
            onClick={() => {
              if (mode !== 'voice') {
                if (soundEnabled) playUiSound('activate');
                onToggleMode('voice');
              }
            }}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${
              mode === 'voice'
                ? 'text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            style={
              mode === 'voice'
                ? {
                    background: activeTheme.gradient,
                    boxShadow: `0 0 16px ${activeTheme.glowRgbaSubtle}`,
                  }
                : undefined
            }
          >
            <Mic className={`w-3.5 h-3.5 ${mode === 'voice' ? 'animate-pulse' : ''}`} />
            <span className="hidden sm:inline">Voice-First</span>
            <span className="sm:hidden">Voice</span>
          </button>

          <button
            onClick={() => {
              if (mode !== 'offline-text') {
                if (soundEnabled) playUiSound('toggle');
                onToggleMode('offline-text');
              }
            }}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${
              mode === 'offline-text'
                ? 'text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            style={
              mode === 'offline-text'
                ? {
                    background: activeTheme.gradient,
                    boxShadow: `0 0 16px ${activeTheme.glowRgbaSubtle}`,
                  }
                : undefined
            }
          >
            <MessageSquareCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Offline Text Fallback</span>
            <span className="sm:hidden">Offline</span>
          </button>
        </div>

        {/* Compute Tier / Deep Reasoning Engine Switch */}
        <div className="hidden md:flex items-center p-1 rounded-xl bg-[#141824]/90 border border-white/10 shadow-inner">
          <button
            onClick={() => {
              if (computeTier !== 'quick') {
                if (soundEnabled) playUiSound('click');
                onToggleComputeTier('quick');
              }
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              computeTier === 'quick'
                ? 'bg-white/10 text-white font-semibold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Fast Cache Mode: Instant local response, token efficient (<20ms)"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Fast Cache</span>
          </button>

          <button
            onClick={() => {
              if (computeTier !== 'deep') {
                if (soundEnabled) playUiSound('glow');
                onToggleComputeTier('deep');
              }
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              computeTier === 'deep'
                ? 'text-white font-semibold shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            style={
              computeTier === 'deep'
                ? {
                    background: activeTheme.gradient,
                    boxShadow: `0 0 12px ${activeTheme.glowRgbaSubtle}`,
                  }
                : undefined
            }
            title="Deep Reasoning Mode: 4-stage Chain-of-Thought decomposition"
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Deep Reasoning</span>
          </button>

          {/* Auto-Detect Switch */}
          <button
            onClick={() => {
              if (soundEnabled) playUiSound('click');
              onToggleAutoDetect();
            }}
            className={`ml-1 px-2 py-1 rounded-md text-[10px] font-semibold border transition-all ${
              autoDetectReasoning
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-white/[0.04] text-slate-400 border-white/10 hover:text-slate-200'
            }`}
            title="Auto-Detect: Automatically route multi-step analytical prompts through Deep Reasoning"
          >
            Auto-Detect: {autoDetectReasoning ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Right section: Theme Customizer button & audio indicator */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            if (soundEnabled) playUiSound('glow');
            onOpenThemeCustomizer();
          }}
          className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] transition-all group"
          style={{
            borderColor: `${activeTheme.primaryHex}40`,
          }}
          title="Open Theme & Gradient Customizer"
        >
          {/* Active Gradient Swatch Dot */}
          <div
            className="w-4 h-4 rounded-full border border-white/40 shadow-sm transition-transform group-hover:scale-110 flex items-center justify-center"
            style={{
              background: activeTheme.gradient,
              boxShadow: `0 0 8px ${activeTheme.glowRgba}`,
            }}
          >
            <Sparkles className="w-2.5 h-2.5 text-white opacity-80" />
          </div>
          <span className="hidden lg:inline text-xs font-semibold text-slate-200 group-hover:text-white">
            {activeTheme.name}
          </span>
          <Palette className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
        </button>
      </div>
    </header>
  );
};

