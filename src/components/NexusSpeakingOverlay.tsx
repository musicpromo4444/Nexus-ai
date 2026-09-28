import React from 'react';
import { GradientTheme } from '../types';
import { AudioOrb } from './AudioOrb';

interface NexusSpeakingOverlayProps {
  theme: GradientTheme;
  text: string;
}

export const NexusSpeakingOverlay: React.FC<NexusSpeakingOverlayProps> = ({ theme, text }) => {
  const size = Math.min(360, Math.floor(window.innerWidth * 0.78));
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-hidden bg-[#07080d]/96 backdrop-blur-xl">
      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(circle at center, ' + theme.glowRgba + ' 0%, ' + theme.glowRgbaSubtle + ' 28%, transparent 68%)'
      }} />
      <div className="relative z-10 flex w-full max-w-2xl flex-col items-center px-6 text-center">
        <div className="mb-5 text-xs uppercase tracking-[0.35em] text-slate-400">Nexus is speaking</div>
        <AudioOrb theme={theme} state="speaking" audioLevel={0.85} size={size} />
        <div className="mt-7 max-w-xl text-lg sm:text-2xl font-medium leading-relaxed text-white">{text}</div>
      </div>
    </div>
  );
};
