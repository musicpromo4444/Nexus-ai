import React, { useState } from 'react';
import {
  Settings,
  Sliders,
  Sparkles,
  Volume2,
  VolumeX,
  Shield,
  ChevronLeft,
  Check,
  Zap,
  HardDrive,
  Globe,
  Keyboard,
  Activity,
  Cpu
} from 'lucide-react';
import { GradientTheme, ComputeTier } from '../../types';
import { DYNAMIC_GRADIENT_THEMES } from '../../constants/themes';
import { playUiSound } from '../../utils/audio';

interface SettingsPageProps {
  activeTheme: GradientTheme;
  onSelectTheme: (theme: GradientTheme) => void;
  onBackToAssistant: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  ambientAuraEnabled: boolean;
  onToggleAmbientAura: () => void;
  computeTier: ComputeTier;
  onToggleComputeTier: (tier: ComputeTier) => void;
  onOpenThemeCustomizer: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  activeTheme,
  onSelectTheme,
  onBackToAssistant,
  soundEnabled,
  onToggleSound,
  ambientAuraEnabled,
  onToggleAmbientAura,
  computeTier,
  onToggleComputeTier,
  onOpenThemeCustomizer,
}) => {
  const [offlineGracePeriod, setOfflineGracePeriod] = useState<number>(1200);
  const [telemetryOptIn, setTelemetryOptIn] = useState<boolean>(false);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 max-w-5xl mx-auto w-full space-y-8 animate-in fade-in duration-300">
      {/* Navigation Header */}
      <div className="flex items-center">
        <button
          onClick={() => {
            if (soundEnabled) playUiSound('click');
            onBackToAssistant();
          }}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Return to Assistant</span>
        </button>
      </div>

      {/* Page Title */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/20 shadow-md"
            style={{
              background: activeTheme.gradient,
              boxShadow: `0 0 20px ${activeTheme.glowRgbaSubtle}`,
            }}
          >
            <Settings className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              System Settings & Atmosphere
            </h1>
            <p className="text-sm text-slate-400">
              Customize interface audio synthesis, theme gradients, neural thresholds, and telemetry privacy.
            </p>
          </div>
        </div>
      </div>

      {/* Atmosphere & 7-Gradient Theme Selector */}
      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4 backdrop-blur-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">Dynamic 7-Gradient Themes</h2>
          </div>

          <button
            onClick={() => {
              if (soundEnabled) playUiSound('click');
              onOpenThemeCustomizer();
            }}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:underline"
          >
            Open Advanced Palette
          </button>
        </div>

        <p className="text-xs text-slate-400">
          Select your ambient neural aesthetic. All glows, buttons, and status rings adapt immediately.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {DYNAMIC_GRADIENT_THEMES.map((theme) => {
            const isSelected = activeTheme.id === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => {
                  if (soundEnabled) playUiSound('glow');
                  onSelectTheme(theme);
                }}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-white/[0.08] border-white/40 shadow-lg'
                    : 'bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.04]'
                }`}
                style={
                  isSelected
                    ? {
                        borderColor: theme.primaryHex,
                        boxShadow: `0 0 16px ${theme.glowRgbaSubtle}`,
                      }
                    : undefined
                }
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-7 h-7 rounded-full border border-white/20 flex-shrink-0 flex items-center justify-center shadow-sm"
                    style={{ background: theme.gradient }}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold text-white truncate">{theme.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{theme.subtitle}</div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Audio & Canvas Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tactile Audio Synthesizer */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
              <h3 className="text-sm font-bold text-white">Procedural UI Synthesizer</h3>
            </div>
            <p className="text-xs text-slate-400">
              Harmonic sine chimes on activations, clicks, and state transitions.
            </p>
          </div>

          <button
            onClick={() => {
              onToggleSound();
              if (!soundEnabled) playUiSound('activate');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              soundEnabled ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-white/10 text-slate-400'
            }`}
          >
            {soundEnabled ? 'Enabled' : 'Muted'}
          </button>
        </div>

        {/* Ambient Aurora Glow Canvas */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Ambient Aurora Canvas</h3>
            </div>
            <p className="text-xs text-slate-400">
              GPU-accelerated atmospheric background glow reacting to active theme.
            </p>
          </div>

          <button
            onClick={() => {
              if (soundEnabled) playUiSound('toggle');
              onToggleAmbientAura();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              ambientAuraEnabled ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-white/10 text-slate-400'
            }`}
          >
            {ambientAuraEnabled ? 'Active' : 'Disabled'}
          </button>
        </div>
      </div>

      {/* Compute Engine & Privacy */}
      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-purple-400" />
          Default Compute Tier & Failover Thresholds
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2">
            <span className="text-xs font-semibold text-slate-300">Default Reasoning Strategy</span>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => {
                  if (soundEnabled) playUiSound('toggle');
                  onToggleComputeTier('deep');
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  computeTier === 'deep' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'bg-white/5 text-slate-400'
                }`}
              >
                Deep CoT (4-Stage)
              </button>
              <button
                onClick={() => {
                  if (soundEnabled) playUiSound('toggle');
                  onToggleComputeTier('quick');
                }}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  computeTier === 'quick' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-white/5 text-slate-400'
                }`}
              >
                Fast Tier (&lt; 1.2s)
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-black/30 border border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Cloud Timeout Before Local Fallback</span>
              <span className="font-mono text-cyan-400">{offlineGracePeriod}ms</span>
            </div>
            <input
              type="range"
              min="500"
              max="3000"
              step="100"
              value={offlineGracePeriod}
              onChange={(e) => setOfflineGracePeriod(Number(e.target.value))}
              className="w-full accent-cyan-400 mt-2"
            />
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Guide */}
      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <Keyboard className="w-4 h-4 text-slate-400" />
          <span>Quick Keyboard Accelerators</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between">
            <span className="text-slate-400">Pages Hub:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px] text-slate-200">Esc / Tap Eye</kbd>
          </div>
          <div className="p-2 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between">
            <span className="text-slate-400">Toggle Mic:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px] text-slate-200">Space</kbd>
          </div>
          <div className="p-2 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between">
            <span className="text-slate-400">Send Query:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px] text-slate-200">Enter</kbd>
          </div>
          <div className="p-2 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between">
            <span className="text-slate-400">CoT Toggle:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px] text-slate-200">⌘+D</kbd>
          </div>
        </div>
      </div>
    </div>
  );
};
