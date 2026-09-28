import React, { useEffect, useState } from 'react';
import { Smartphone, Mic, Bell, ShieldCheck, CheckCircle2, XCircle, ChevronLeft, RefreshCw, Lock } from 'lucide-react';
import { GradientTheme } from '../../types';
import { playUiSound } from '../../utils/audio';
import { getDeviceBridgeStatus, requestNativeDeviceAction } from '../../services/localEngine';

interface DevicePageProps {
  activeTheme: GradientTheme;
  onBackToAssistant: () => void;
  soundEnabled: boolean;
}

type Capability = { label: string; detail: string; available: boolean };

export const DevicePage: React.FC<DevicePageProps> = ({ activeTheme, onBackToAssistant, soundEnabled }) => {
  const [capabilities, setCapabilities] = useState<Capability[]>([]);
  const [checking, setChecking] = useState(false);
  const [bridgeConnected, setBridgeConnected] = useState(false);
  const [permissionMessage, setPermissionMessage] = useState('');
  const [nativeActionMessage, setNativeActionMessage] = useState('');
  const [bridgePermissions, setBridgePermissions] = useState<string[]>([]);

  const checkCapabilities = async () => {
    setChecking(true);
    const bridge = getDeviceBridgeStatus();
    setBridgeConnected(bridge.connected);
    setBridgePermissions(bridge.permissions);
    const notification = typeof window !== 'undefined' && 'Notification' in window;
    const speech = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
    const media = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;
    const secure = typeof window !== 'undefined' && window.isSecureContext;
    setCapabilities([
      { label: 'Microphone access', detail: media ? 'Browser can request microphone permission.' : 'Microphone API is unavailable here.', available: media },
      { label: 'Voice recognition', detail: speech ? 'Browser speech recognition is available.' : 'Speech recognition is not available in this browser.', available: speech },
      { label: 'Notifications', detail: notification ? 'Browser notifications can be requested.' : 'Notifications are unavailable here.', available: notification },
      { label: 'Secure device bridge', detail: secure ? 'Secure context detected. Native device control still requires the Android bridge.' : 'Open Nexus over HTTPS to use protected browser APIs.', available: secure },
    ]);
    setChecking(false);
  };

  useEffect(() => { checkCapabilities(); }, []);

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 max-w-5xl mx-auto w-full space-y-7 animate-in fade-in duration-300">
      <button onClick={() => { if (soundEnabled) playUiSound('click'); onBackToAssistant(); }}
        className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10">
        <ChevronLeft className="w-4 h-4" /> Return to Assistant
      </button>

      <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 w-56 h-56 rounded-full blur-3xl opacity-20" style={{ background: activeTheme.primaryHex }} />
        <div className="relative flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center border border-white/20" style={{ background: activeTheme.gradient }}>
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Device & Permissions</h1>
            <p className="text-sm text-slate-400 mt-1">See what this browser can actually give Nexus access to. Nothing is claimed until the device grants it.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {capabilities.map((item) => (
          <div key={item.label} className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 flex gap-4">
            {item.available ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <XCircle className="w-5 h-5 text-slate-500 shrink-0" />}
            <div>
              <div className="text-sm font-semibold text-white">{item.label}</div>
              <div className="text-xs text-slate-400 mt-1">{item.detail}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-white">Permission actions</h2>
            <p className="text-xs text-slate-400 mt-1">{bridgeConnected ? `Android bridge connected${bridgePermissions.length ? ` • ${bridgePermissions.length} permission(s)` : ''}.` : 'Browser-only mode. Native phone control is not connected.'}</p>
          </div>
          <span className={`text-[10px] px-2 py-1 rounded-full border ${bridgeConnected ? 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10' : 'text-slate-400 border-white/10 bg-white/5'}`}>{bridgeConnected ? 'ANDROID' : 'BROWSER'}</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={async () => { try { await navigator.mediaDevices?.getUserMedia({audio:true}); setPermissionMessage('Microphone permission granted.'); } catch { setPermissionMessage('Microphone permission was denied or unavailable.'); } }} className="px-3 py-2 rounded-xl text-xs font-semibold text-white border border-white/10 hover:bg-white/[0.06]">Allow microphone</button>
          <button onClick={async () => { if (!('Notification' in window)) { setPermissionMessage('Notifications are unavailable in this browser.'); return; } const p = await Notification.requestPermission(); setPermissionMessage(`Notification permission: ${p}.`); }} className="px-3 py-2 rounded-xl text-xs font-semibold text-white border border-white/10 hover:bg-white/[0.06]">Allow notifications</button>
          <button onClick={() => { if ('Notification' in window && Notification.permission === 'granted') new Notification('Nexus', { body:'Notification test successful.' }); setPermissionMessage(('Notification' in window && Notification.permission === 'granted') ? 'Notification sent.' : 'Allow notifications first.'); }} className="px-3 py-2 rounded-xl text-xs font-semibold text-white border border-white/10 hover:bg-white/[0.06]">Test notification</button>
        </div>
        {permissionMessage && <p className="text-xs text-cyan-300">{permissionMessage}</p>}
      </div>

      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
        <div>
          <h2 className="text-sm font-bold text-white">Native device actions</h2>
          <p className="text-xs text-slate-400 mt-1">These controls only execute when the Android bridge is actually connected and the device grants the required permission.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button key="open_app" disabled={!bridgeConnected} onClick={async () => { const result = await requestNativeDeviceAction('open_app', {}); setNativeActionMessage(result.success ? 'Open app executed.' : result.reason); }} className="px-3 py-2 rounded-xl text-xs font-semibold border border-white/10 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/[0.06]">Open app</button><button key="make_call" disabled={!bridgeConnected} onClick={async () => { const result = await requestNativeDeviceAction('make_call', {}); setNativeActionMessage(result.success ? 'Make call executed.' : result.reason); }} className="px-3 py-2 rounded-xl text-xs font-semibold border border-white/10 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/[0.06]">Make call</button><button key="send_message" disabled={!bridgeConnected} onClick={async () => { const result = await requestNativeDeviceAction('send_message', {}); setNativeActionMessage(result.success ? 'Send message executed.' : result.reason); }} className="px-3 py-2 rounded-xl text-xs font-semibold border border-white/10 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/[0.06]">Send message</button><button key="set_alarm" disabled={!bridgeConnected} onClick={async () => { const result = await requestNativeDeviceAction('set_alarm', {}); setNativeActionMessage(result.success ? 'Set alarm executed.' : result.reason); }} className="px-3 py-2 rounded-xl text-xs font-semibold border border-white/10 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/[0.06]">Set alarm</button><button key="control_media" disabled={!bridgeConnected} onClick={async () => { const result = await requestNativeDeviceAction('control_media', {}); setNativeActionMessage(result.success ? 'Media executed.' : result.reason); }} className="px-3 py-2 rounded-xl text-xs font-semibold border border-white/10 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/[0.06]">Media</button><button key="read_screen" disabled={!bridgeConnected} onClick={async () => { const result = await requestNativeDeviceAction('read_screen', {}); setNativeActionMessage(result.success ? 'Read screen executed.' : result.reason); }} className="px-3 py-2 rounded-xl text-xs font-semibold border border-white/10 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/[0.06]">Read screen</button><button key="tap_screen" disabled={!bridgeConnected} onClick={async () => { const result = await requestNativeDeviceAction('tap_screen', {}); setNativeActionMessage(result.success ? 'Tap screen executed.' : result.reason); }} className="px-3 py-2 rounded-xl text-xs font-semibold border border-white/10 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white/[0.06]">Tap screen</button>
        </div>
        {nativeActionMessage && <p className="text-xs text-cyan-300">{nativeActionMessage}</p>}
      </div>

      <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
        <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-cyan-400" /><h2 className="text-sm font-bold text-white">Permission principles</h2></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-400">
          <div className="p-3 rounded-xl bg-black/20 border border-white/5"><Mic className="w-4 h-4 text-cyan-400 mb-2" />Microphone is requested only when voice features need it.</div>
          <div className="p-3 rounded-xl bg-black/20 border border-white/5"><Bell className="w-4 h-4 text-amber-400 mb-2" />Notifications are used for reminders after permission.</div>
          <div className="p-3 rounded-xl bg-black/20 border border-white/5"><Lock className="w-4 h-4 text-emerald-400 mb-2" />Sensitive phone actions will require the future Android permission layer.</div>
        </div>
        <button onClick={checkCapabilities} disabled={checking} className="px-4 py-2 rounded-xl text-xs font-semibold text-white border border-white/10 hover:bg-white/[0.06] flex items-center gap-2">
          <RefreshCw className={checking ? 'w-4 h-4 animate-spin' : 'w-4 h-4'} /> {checking ? 'Checking…' : 'Check again'}
        </button>
      </div>
    </div>
  );
};
