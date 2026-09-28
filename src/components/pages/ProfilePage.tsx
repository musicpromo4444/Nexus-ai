import React, { useState } from 'react';
import {
  User,
  Shield,
  Key,
  Database,
  Sliders,
  ChevronLeft,
  Check,
  Smartphone,
  Globe,
  Bell,
  HardDrive,
  Trash2,
  RefreshCw,
  LogOut,
  Mail
} from 'lucide-react';
import { GradientTheme } from '../../types';
import { playUiSound } from '../../utils/audio';
import { loadNexusState, saveNexusState } from '../../utils/persistence';

interface ProfilePageProps {
  activeTheme: GradientTheme;
  onBackToAssistant: () => void;
  soundEnabled: boolean;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  activeTheme,
  onBackToAssistant,
  soundEnabled,
}) => {
  const [userName, setUserName] = useState<string>(() => loadNexusState('nexus_profile_name', ''));
  const [userTitle, setUserTitle] = useState<string>(() => loadNexusState('nexus_profile_title', ''));
  const [userEmail, setUserEmail] = useState<string>(() => loadNexusState('nexus_profile_email', ''));
  const [autoVoiceTranscription, setAutoVoiceTranscription] = useState<boolean>(true);
  const [soundFeedback, setSoundFeedback] = useState<boolean>(soundEnabled);
  const [hardwareAcceleration, setHardwareAcceleration] = useState<boolean>(true);
  const [vaultEncryption, setVaultEncryption] = useState<boolean>(true);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [clearedCache, setClearedCache] = useState<boolean>(false);

  const handleSavePreferences = () => {
    if (soundEnabled) playUiSound('activate');
    saveNexusState('nexus_profile_name', userName.trim());
    saveNexusState('nexus_profile_title', userTitle.trim());
    saveNexusState('nexus_profile_email', userEmail.trim());
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const handleClearCache = () => {
    if (soundEnabled) playUiSound('toggle');
    try {
      ['nexus_chat_sessions','nexus_chat_messages','nexus_local_tasks_v1','nexus_reminders'].forEach((key) => localStorage.removeItem(key));
    } catch {}
    setClearedCache(true);
    setTimeout(() => setClearedCache(false), 3000);
  };

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

      {/* Profile Banner Card */}
      <div
        className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 relative overflow-hidden backdrop-blur-md"
        style={{
          boxShadow: `0 0 35px ${activeTheme.glowRgbaSubtle}`,
        }}
      >
        <div
          className="absolute -right-16 -top-16 w-52 h-52 rounded-full blur-3xl pointer-events-none opacity-25"
          style={{ background: activeTheme.primaryHex }}
        />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-4">
            {/* Avatar with Theme Ring */}
            <div className="relative">
              <div
                className="w-16 h-16 rounded-2xl p-0.5 shadow-lg"
                style={{ background: activeTheme.gradient }}
              >
                <div className="w-full h-full rounded-2xl bg-[#0e111a] flex items-center justify-center overflow-hidden">
                  <User className="w-8 h-8 text-white" />
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#0e111a]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-white tracking-tight">{userName}</h1>
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase"
                  style={{ background: activeTheme.badgeBg, color: activeTheme.primaryHex }}
                >
                  Pro Operator
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{userTitle}</p>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1.5">
                <Mail className="w-3 h-3 text-slate-500" />
                <span>{userEmail}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleSavePreferences}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all shadow-md"
            style={{
              background: activeTheme.gradient,
              boxShadow: `0 0 14px ${activeTheme.glowRgbaSubtle}`,
            }}
          >
            {isSaved ? <Check className="w-4 h-4 text-emerald-300" /> : <Shield className="w-4 h-4" />}
            <span>{isSaved ? 'Preferences Saved!' : 'Save Preferences'}</span>
          </button>
        </div>
      </div>

      {/* Account Details & Customization Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Identity Details */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-400" />
            Operator Identity
          </h2>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-400">Display Name</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="mt-1 w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400">Role / Designation</label>
              <input
                type="text"
                value={userTitle}
                onChange={(e) => setUserTitle(e.target.value)}
                className="mt-1 w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400">Default Interaction Mode</label>
              <select className="mt-1 w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-slate-200 focus:outline-none">
                <option>Voice-First Synapse (Sub-second audio)</option>
                <option>Offline Text Fallback (Code execution canvas)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security & Vault Preferences */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            Security & Vault Preferences
          </h2>

          <div className="space-y-3 pt-1">
            {/* Toggle 1: Auto Voice Transcription */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/30 border border-white/5">
              <div>
                <div className="text-xs font-semibold text-white">Continuous Voice Transcription</div>
                <div className="text-[10px] text-slate-400">Live speech-to-text preview in speech orb</div>
              </div>
              <button
                onClick={() => setAutoVoiceTranscription(!autoVoiceTranscription)}
                className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                  autoVoiceTranscription ? 'bg-cyan-500' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    autoVoiceTranscription ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 2: WebGPU Acceleration */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/30 border border-white/5">
              <div>
                <div className="text-xs font-semibold text-white">WebGPU Canvas Acceleration</div>
                <div className="text-[10px] text-slate-400">Hardware shader rendering for speech waveform</div>
              </div>
              <button
                onClick={() => setHardwareAcceleration(!hardwareAcceleration)}
                className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                  hardwareAcceleration ? 'bg-emerald-500' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    hardwareAcceleration ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 3: Local Vault Encryption */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/30 border border-white/5">
              <div>
                <div className="text-xs font-semibold text-white">Local Vault AES-256 Encryption</div>
                <div className="text-[10px] text-slate-400">Encrypt on-device memory blocks & chat history</div>
              </div>
              <button
                onClick={() => setVaultEncryption(!vaultEncryption)}
                className={`w-10 h-5 rounded-full p-0.5 transition-colors ${
                  vaultEncryption ? 'bg-purple-500' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    vaultEncryption ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Storage & Data Retention Box */}
      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-white">
            <HardDrive className="w-4 h-4 text-slate-400" />
            <span>Local Browser Storage & Cache</span>
          </div>
          <p className="text-xs text-slate-400">
            Current cache size: <strong>14.2 MB</strong> (12 chat sessions, 4 sandbox snippets, encrypted vector keys).
          </p>
        </div>

        <button
          onClick={handleClearCache}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-rose-300 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{clearedCache ? 'Storage Purged!' : 'Purge Local Cache'}</span>
        </button>
      </div>
    </div>
  );
};
