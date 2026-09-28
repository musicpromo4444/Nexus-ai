import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, Volume2, VolumeX, Mic, ShieldCheck, AlertTriangle } from 'lucide-react';
import { GradientTheme } from '../../types';
import { playUiSound } from '../../utils/audio';

interface Props { activeTheme: GradientTheme; onBackToAssistant: () => void; soundEnabled: boolean; }

export const VoiceEnvironmentPage: React.FC<Props> = ({ activeTheme, onBackToAssistant, soundEnabled }) => {
  const [level, setLevel] = useState(0);
  const [running, setRunning] = useState(false);
  const [supported, setSupported] = useState(true);
  const [permission, setPermission] = useState<'unknown'|'granted'|'denied'>('unknown');
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  const stop = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setRunning(false);
    setLevel(0);
  };

  const start = async () => {
    if (!navigator.mediaDevices?.getUserMedia) { setSupported(false); return; }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setPermission('granted');
      setRunning(true);
      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      const data = new Uint8Array(analyser.fftSize);
      const tick = () => {
        analyser.getByteTimeDomainData(data);
        let sum = 0;
        for (const v of data) { const x = (v - 128) / 128; sum += x * x; }
        setLevel(Math.min(100, Math.round(Math.sqrt(sum / data.length) * 240)));
        rafRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch { setPermission('denied'); stop(); }
  };

  useEffect(() => () => stop(), []);

  const noisy = level >= 48;

  return <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 max-w-5xl mx-auto w-full space-y-7">
    <button onClick={() => { if (soundEnabled) playUiSound('click'); onBackToAssistant(); }} className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10">
      <ChevronLeft className="w-4 h-4"/> Return to Assistant
    </button>
    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10">
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{background:activeTheme.gradient}}><Mic className="w-5 h-5 text-white"/></div>
        <div><h1 className="text-2xl font-bold text-white">Voice Environment</h1><p className="text-sm text-slate-400 mt-1">Nexus checks sound activity locally. It does not identify people or store audio.</p></div>
      </div>
    </div>
    <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-6">
      <div className="flex items-center justify-between"><span className="text-sm font-semibold text-white">Ambient sound level</span><span className="text-sm text-slate-400">{running ? level + '%' : 'Not monitoring'}</span></div>
      <div className="h-4 rounded-full bg-black/40 border border-white/10 overflow-hidden"><div className="h-full transition-all duration-100" style={{width: `${level}%`, background:activeTheme.gradient}}/></div>
      {running && <div className={`p-4 rounded-xl border ${noisy ? 'border-amber-500/30 bg-amber-500/10' : 'border-emerald-500/20 bg-emerald-500/5'}`}>
        {noisy ? <><AlertTriangle className="w-5 h-5 text-amber-400 mb-2"/><p className="text-sm font-semibold text-white">A quieter place may improve the conversation.</p><p className="text-xs text-slate-400 mt-1">This is a sound-level estimate only; Nexus cannot tell who is speaking.</p></> : <><ShieldCheck className="w-5 h-5 text-emerald-400 mb-2"/><p className="text-sm font-semibold text-white">Environment looks reasonably quiet.</p></>}
      </div>}
      {!supported && <p className="text-sm text-rose-300">This browser does not expose microphone monitoring.</p>}
      {permission === 'denied' && <p className="text-sm text-amber-300">Microphone permission was denied. Allow it in browser settings and try again.</p>}
      <button onClick={running ? stop : start} className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2" style={{background:activeTheme.gradient}}>
        {running ? <><VolumeX className="w-4 h-4"/> Stop monitoring</> : <><Volume2 className="w-4 h-4"/> Start local check</>}
      </button>
    </div>
  </div>;
};
