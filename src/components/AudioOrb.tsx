import React, { useEffect, useRef } from 'react';
import { GradientTheme, VoiceState } from '../types';

interface AudioOrbProps {
  theme: GradientTheme;
  state: VoiceState;
  audioLevel?: number; // 0 to 1
  onClick?: () => void;
  size?: number;
}

export const AudioOrb: React.FC<AudioOrbProps> = ({
  theme,
  state,
  audioLevel = 0,
  onClick,
  size = 260,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Speed and amplitude based on voice state
      let speed = 0.02;
      let amplitude = 12;

      if (state === 'listening') {
        speed = 0.05 + audioLevel * 0.08;
        amplitude = 18 + audioLevel * 30;
      } else if (state === 'speaking') {
        speed = 0.04;
        amplitude = 22 + Math.sin(phase * 1.5) * 8;
      } else if (state === 'processing') {
        speed = 0.07;
        amplitude = 15;
      } else {
        // idle
        speed = 0.015;
        amplitude = 8;
      }

      phase += speed;

      // Draw multi-layered orbital rings with sinusoidal displacement
      const ringCount = 3;
      for (let r = 0; r < ringCount; r++) {
        ctx.beginPath();
        const baseRadius = (size * 0.28) + (r * 14);
        const segments = 64;

        for (let i = 0; i <= segments; i++) {
          const angle = (i / segments) * Math.PI * 2;
          const harmonic = Math.sin(angle * 4 + phase + r) * amplitude;
          const secondaryHarmonic = Math.cos(angle * 2 - phase * 1.2) * (amplitude * 0.5);
          const currentRadius = baseRadius + harmonic + secondaryHarmonic;

          const x = centerX + Math.cos(angle) * currentRadius;
          const y = centerY + Math.sin(angle) * currentRadius;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.closePath();

        // Create gradient stroke
        const grad = ctx.createLinearGradient(
          centerX - baseRadius,
          centerY - baseRadius,
          centerX + baseRadius,
          centerY + baseRadius
        );
        grad.addColorStop(0, theme.primaryHex);
        grad.addColorStop(0.5, theme.secondaryHex);
        grad.addColorStop(1, theme.primaryHex);

        ctx.strokeStyle = grad;
        ctx.lineWidth = r === 0 ? 2.5 : 1.2;
        ctx.globalAlpha = 0.45 - (r * 0.12);
        ctx.shadowColor = theme.primaryHex;
        ctx.shadowBlur = state === 'listening' || state === 'speaking' ? 22 : 12;
        ctx.stroke();
      }

      // Draw floating particles around the orb
      const particleCount = 18;
      for (let p = 0; p < particleCount; p++) {
        const pAngle = (p / particleCount) * Math.PI * 2 + (phase * 0.3) * (p % 2 === 0 ? 1 : -1);
        const pDist = (size * 0.38) + Math.sin(phase * 2 + p) * 16;
        const px = centerX + Math.cos(pAngle) * pDist;
        const py = centerY + Math.sin(pAngle) * pDist;
        const pSize = (p % 3 === 0 ? 2.5 : 1.5) + (state === 'speaking' ? Math.sin(phase * 3 + p) : 0);

        ctx.beginPath();
        ctx.arc(px, py, Math.max(0.8, pSize), 0, Math.PI * 2);
        ctx.fillStyle = p % 2 === 0 ? theme.primaryHex : theme.secondaryHex;
        ctx.globalAlpha = 0.6 + Math.sin(phase + p) * 0.3;
        ctx.shadowColor = theme.primaryHex;
        ctx.shadowBlur = 8;
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme, state, audioLevel, size]);

  return (
    <div
      onClick={onClick}
      className={`relative flex items-center justify-center cursor-pointer select-none transition-transform duration-300 hover:scale-105 active:scale-95 group`}
      style={{ width: size, height: size }}
      title={state === 'listening' ? 'Listening to voice...' : 'Click to interact with voice'}
    >
      {/* Outer ambient glow halo */}
      <div
        className="absolute inset-0 rounded-full blur-2xl transition-all duration-700 opacity-60 group-hover:opacity-85 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${theme.glowRgba} 0%, ${theme.glowRgbaSubtle} 60%, transparent 80%)`,
          transform: state === 'listening' || state === 'speaking' ? 'scale(1.25)' : 'scale(1)',
        }}
      />

      {/* Canvas wave loops */}
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="absolute inset-0 pointer-events-none z-10"
      />

      {/* Central Glass Spherical Core */}
      <div
        className="relative z-20 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 transition-all duration-500 shadow-2xl overflow-hidden"
        style={{
          width: size * 0.44,
          height: size * 0.44,
          background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.25) 0%, rgba(18,20,29,0.85) 60%, #0b0d13 100%)`,
          boxShadow: `0 0 35px ${theme.glowRgba}, inset 0 1px 1px rgba(255,255,255,0.4), inset 0 -4px 10px rgba(0,0,0,0.8)`,
        }}
      >
        {/* Internal refractive specular light */}
        <div
          className="absolute top-1.5 left-2 w-10 h-5 rounded-full bg-white/30 blur-[2px] transform -rotate-12 pointer-events-none"
        />

        {/* Dynamic center core pulsing dot */}
        <div
          className="w-5 h-5 rounded-full transition-all duration-300 relative flex items-center justify-center"
          style={{
            background: theme.gradient,
            boxShadow: `0 0 20px ${theme.primaryHex}`,
            transform: state === 'speaking' || state === 'listening' ? 'scale(1.35)' : 'scale(1)',
          }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping opacity-75" />
        </div>
      </div>
    </div>
  );
};
