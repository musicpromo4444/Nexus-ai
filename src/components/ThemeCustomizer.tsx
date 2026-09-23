import React from 'react';
import { Check, Sparkles, X, Sliders, Volume2, VolumeX, Eye } from 'lucide-react';
import { GradientTheme } from '../types';
import { DYNAMIC_GRADIENT_THEMES } from '../constants/themes';
import { playUiSound } from '../utils/audio';

interface ThemeCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTheme: GradientTheme;
  onSelectTheme: (theme: GradientTheme) => void;
  glowIntensity: 'subtle' | 'vibrant' | 'radiant';
  onChangeGlowIntensity: (intensity: 'subtle' | 'vibrant' | 'radiant') => void;
  ambientAuraEnabled: boolean;
  onToggleAmbientAura: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({
  isOpen,
  onClose,
  activeTheme,
  onSelectTheme,
  glowIntensity,
  onChangeGlowIntensity,
  ambientAuraEnabled,
  onToggleAmbientAura,
  soundEnabled,
  onToggleSound,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-md transition-opacity">
      <div
        className="relative w-full max-w-xl bg-[#11141d] border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{
          boxShadow: `0 0 40px ${activeTheme.glowRgbaSubtle}, 0 20px 40px rgba(0,0,0,0.8)`,
        }}
      >
        {/* Header decoration glow */}
        <div
          className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl pointer-events-none opacity-40"
          style={{ background: activeTheme.primaryHex }}
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/20 shadow-sm"
              style={{ background: activeTheme.gradient }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white tracking-tight">Theme & Accent Customizer</h2>
              <p className="text-xs text-slate-400">Personalize Nexus AI with 7 dynamic neural gradients</p>
            </div>
          </div>
          <button
            onClick={() => {
              if (soundEnabled) playUiSound('click');
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Close theme panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="py-4 space-y-6 overflow-y-auto pr-1">
          {/* Section: 7 Gradient Themes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-slate-400" />
                7 Dynamic Gradients
              </span>
              <span className="text-xs text-slate-400">
                Current: <strong className="text-white font-medium">{activeTheme.name}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {DYNAMIC_GRADIENT_THEMES.map((theme) => {
                const isSelected = activeTheme.id === theme.id;
                return (
                  <button
                    key={theme.id}
                    onClick={() => {
                      if (soundEnabled) playUiSound('glow');
                      onSelectTheme(theme);
                    }}
                    className={`relative text-left p-3 rounded-xl border transition-all duration-200 flex items-center justify-between group ${
                      isSelected
                        ? 'bg-white/[0.08] border-white/40 shadow-lg'
                        : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/20'
                    }`}
                    style={
                      isSelected
                        ? {
                            boxShadow: `0 0 16px ${theme.glowRgbaSubtle}, inset 0 0 12px ${theme.glowRgbaSubtle}`,
                          }
                        : undefined
                    }
                  >
                    <div className="flex items-center gap-3">
                      {/* Gradient preview swatch circle */}
                      <div
                        className="w-9 h-9 rounded-xl flex-shrink-0 shadow-md border border-white/30 flex items-center justify-center transition-transform group-hover:scale-105"
                        style={{ background: theme.gradient }}
                      >
                        {isSelected && <Check className="w-4 h-4 text-white drop-shadow-md" />}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white truncate">{theme.name}</span>
                          {isSelected && (
                            <span
                              className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                              style={{
                                background: theme.badgeBg,
                                color: theme.primaryHex,
                              }}
                            >
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1">{theme.subtitle}</p>
                      </div>
                    </div>

                    {/* Gradient mini dots */}
                    <div className="flex items-center -space-x-1 pl-2">
                      {theme.previewColors.map((hex, i) => (
                        <div
                          key={i}
                          className="w-2.5 h-2.5 rounded-full border border-black/50"
                          style={{ backgroundColor: hex }}
                        />
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Glow Intensity */}
          <div className="pt-2 border-t border-white/10">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block mb-2.5">
              Accent Glow Intensity
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(['subtle', 'vibrant', 'radiant'] as const).map((intensity) => {
                const isSelected = glowIntensity === intensity;
                return (
                  <button
                    key={intensity}
                    onClick={() => {
                      if (soundEnabled) playUiSound('toggle');
                      onChangeGlowIntensity(intensity);
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-medium capitalize border transition-all text-center ${
                      isSelected
                        ? 'border-white/40 text-white bg-white/10'
                        : 'border-white/5 text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                    }`}
                    style={
                      isSelected
                        ? {
                            borderColor: activeTheme.primaryHex,
                            color: '#ffffff',
                          }
                        : undefined
                    }
                  >
                    {intensity}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Toggles for Ambient Aura & Sound Effects */}
          <div className="pt-2 border-t border-white/10 space-y-3">
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
              Atmosphere & Feedback
            </span>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-slate-300">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Dynamic Aurora Backdrop</div>
                  <div className="text-[11px] text-slate-400">Soft radiating glow matching the active theme</div>
                </div>
              </div>
              <button
                onClick={() => {
                  if (soundEnabled) playUiSound('toggle');
                  onToggleAmbientAura();
                }}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 border ${
                  ambientAuraEnabled ? 'bg-white/20 border-white/30' : 'bg-white/5 border-white/10'
                }`}
                style={ambientAuraEnabled ? { backgroundColor: activeTheme.primaryHex } : undefined}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    ambientAuraEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-slate-300">
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-xs font-semibold text-white">Interactive Audio Tones</div>
                  <div className="text-[11px] text-slate-400">Futuristic auditory cues on interactions</div>
                </div>
              </div>
              <button
                onClick={() => {
                  onToggleSound();
                  playUiSound('click');
                }}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 border ${
                  soundEnabled ? 'bg-white/20 border-white/30' : 'bg-white/5 border-white/10'
                }`}
                style={soundEnabled ? { backgroundColor: activeTheme.primaryHex } : undefined}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    soundEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="pt-4 border-t border-white/10 flex items-center justify-between relative z-10">
          <span className="text-[11px] text-slate-400">Settings persist in session state</span>
          <button
            onClick={() => {
              if (soundEnabled) playUiSound('activate');
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all shadow-md active:scale-95"
            style={{
              background: activeTheme.gradient,
              boxShadow: `0 0 15px ${activeTheme.glowRgbaSubtle}`,
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
