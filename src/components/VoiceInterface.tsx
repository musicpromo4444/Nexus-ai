import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  ArrowRight,
  RefreshCw,
  MessageSquareCode,
  Radio,
  Sliders,
  Brain,
  Zap
} from 'lucide-react';
import { ChatMessage, ComputeTier, GradientTheme, VoiceState } from '../types';
import { AudioOrb } from './AudioOrb';
import { playUiSound, speakText, stopSpeaking } from '../utils/audio';

interface VoiceInterfaceProps {
  activeTheme: GradientTheme;
  voiceState: VoiceState;
  setVoiceState: (state: VoiceState) => void;
  onSwitchToOfflineText: () => void;
  soundEnabled: boolean;
  onSendVoiceQuery: (query: string) => Promise<ChatMessage | null> | void;
  computeTier: ComputeTier;
  onToggleComputeTier: (tier: ComputeTier) => void;
  autoDetectReasoning: boolean;
}

export const VoiceInterface: React.FC<VoiceInterfaceProps> = ({
  activeTheme,
  voiceState,
  setVoiceState,
  onSwitchToOfflineText,
  soundEnabled,
  onSendVoiceQuery,
  computeTier,
  onToggleComputeTier,
  autoDetectReasoning,
}) => {
  const [transcript, setTranscript] = useState<string>('');
  const [assistantSpokenText, setAssistantSpokenText] = useState<string>(
    'Nexus voice synapse ready. Ask me anything, or select a vocal command below.'
  );
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [audioLevel, setAudioLevel] = useState<number>(0.2);
  const [waveformBars, setWaveformBars] = useState<number[]>(new Array(24).fill(10));
  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<string>('');
  const audioAnimationRef = useRef<number | null>(null);

  // Quick Voice Prompts
  const quickVoicePrompts = [
    'Break down our offline architecture step-by-step',
    'Compare fast cache versus deep reasoning',
    'What are my priority tasks for today?',
    'Run offline system diagnostics',
  ];

  // Dynamic audio waveform simulation or reaction
  useEffect(() => {
    const updateWaveform = () => {
      if (voiceState === 'listening') {
        const level = 0.3 + Math.random() * 0.7;
        setAudioLevel(level);
        setWaveformBars(
          Array.from({ length: 24 }, (_, i) => {
            const distFromCenter = Math.abs(i - 12);
            const factor = Math.max(0.2, 1 - distFromCenter / 12);
            return Math.floor(10 + Math.random() * 45 * factor);
          })
        );
      } else if (voiceState === 'speaking') {
        const level = 0.4 + Math.sin(Date.now() / 150) * 0.3;
        setAudioLevel(level);
        setWaveformBars(
          Array.from({ length: 24 }, (_, i) => {
            const harmonic = Math.sin((i / 24) * Math.PI * 4 + Date.now() / 200);
            return Math.floor(12 + Math.abs(harmonic) * 35);
          })
        );
      } else if (voiceState === 'processing') {
        setAudioLevel(0.15);
        setWaveformBars(
          Array.from({ length: 24 }, (_, i) => {
            const wave = Math.sin((i / 24) * Math.PI * 2 + Date.now() / 100);
            return Math.floor(14 + Math.abs(wave) * 16);
          })
        );
      } else {
        setAudioLevel(0.08);
        setWaveformBars(
          Array.from({ length: 24 }, (_, i) => {
            return 8 + Math.floor(Math.sin((i / 24) * Math.PI + Date.now() / 1000) * 4);
          })
        );
      }

      audioAnimationRef.current = requestAnimationFrame(updateWaveform);
    };

    audioAnimationRef.current = requestAnimationFrame(updateWaveform);

    return () => {
      if (audioAnimationRef.current) cancelAnimationFrame(audioAnimationRef.current);
    };
  }, [voiceState]);

  // Voice recognition and activation
  useEffect(() => { transcriptRef.current = transcript; }, [transcript]);

  const stopRecognition = () => {
    try { recognitionRef.current?.stop?.(); } catch { /* ignore */ }
    recognitionRef.current = null;
  };

  useEffect(() => () => stopRecognition(), []);

  const handleToggleListening = () => {
    if (voiceState === 'listening') {
      stopRecognition();
      setVoiceState('idle');
      if (soundEnabled) playUiSound('toggle');
    } else {
      if (soundEnabled) playUiSound('activate');
      setVoiceState('listening');
      setTranscript('');
      setAssistantSpokenText('Listening carefully to your voice...');

      // Try browser speech recognition if supported
      const SpeechRecognition =
        (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition ||
        (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).webkitSpeechRecognition;

      if (SpeechRecognition && !isMuted) {
        try {
          const recognition = new SpeechRecognition();
          recognitionRef.current = recognition;
          recognition.continuous = false;
          recognition.interimResults = true;
          recognition.lang = 'en-US';

          recognition.onresult = (event: any) => {
            const current = event.resultIndex;
            const text = event.results[current][0].transcript;
            transcriptRef.current = text;
            setTranscript(text);
          };

          recognition.onend = () => {
            recognitionRef.current = null;
            setVoiceState('processing');
            setTimeout(() => {
              processQuery(transcriptRef.current || 'Nexus, status report on today');
            }, 250);
          };

          recognition.onerror = () => {
            recognitionRef.current = null;
            fallbackSimulatedVoice();
          };

          recognition.start();
          return;
        } catch {
          // fall through to simulation
        }
      }

      fallbackSimulatedVoice();
    }
  };

  const fallbackSimulatedVoice = () => {
    setVoiceState('idle');
    setAssistantSpokenText('Voice recognition is not available in this browser. Switch to Offline Text to continue.');
  };

  const processQuery = async (query: string) => {
    setVoiceState('processing');

    try {
      const assistantMsg = (await onSendVoiceQuery(query)) as ChatMessage | null;
      const rawText = assistantMsg?.text || 'Command processed.';

      // Prepare clear concise spoken representation
      let spokenSummary = rawText;
      if (spokenSummary.includes('###')) {
        // Strip markdown headers and long tables for clean vocal speech
        spokenSummary = spokenSummary
          .replace(/###/g, '')
          .replace(/####/g, '')
          .replace(/\*\*/g, '')
          .replace(/\|[\s\S]*?\|/g, '')
          .split('\n\n')[0] || rawText.slice(0, 240);
      }
      if (spokenSummary.length > 280) {
        spokenSummary = spokenSummary.slice(0, 276) + '...';
      }

      setAssistantSpokenText(spokenSummary);
      setVoiceState('speaking');

      if (soundEnabled && !isMuted) {
        speakText(spokenSummary, () => {
          setVoiceState('idle');
        });
      } else {
        setTimeout(() => {
          setVoiceState('idle');
        }, 4000);
      }
    } catch {
      const fallbackText = 'I could not complete that voice request. Please try again or switch to Offline Text.';
      setAssistantSpokenText(fallbackText);
      setVoiceState('speaking');
      if (soundEnabled && !isMuted) {
        speakText(fallbackText, () => setVoiceState('idle'));
      } else {
        setTimeout(() => setVoiceState('idle'), 3000);
      }
    }
  };

  const handleSelectQuickPrompt = (prompt: string) => {
    if (soundEnabled) playUiSound('click');
    setTranscript(prompt);
    processQuery(prompt);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-between p-4 sm:p-8 max-w-4xl mx-auto w-full relative z-10 overflow-y-auto">
      {/* Top Voice Header Notice */}
      <div className="flex flex-col items-center text-center space-y-2 pt-2">
        <div className="inline-flex flex-wrap items-center justify-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs text-slate-300 shadow-sm">
          <div className="flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 animate-pulse" style={{ color: activeTheme.primaryHex }} />
            <span>Voice Synapse</span>
            <span className="text-slate-500">•</span>
            <span className="capitalize font-medium text-white">{voiceState}</span>
          </div>

          <span className="text-slate-600 hidden sm:inline">|</span>

          {/* Compute Tier Pill in Voice View */}
          <button
            onClick={() => {
              if (soundEnabled) playUiSound('toggle');
              onToggleComputeTier(computeTier === 'quick' ? 'deep' : 'quick');
            }}
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 border transition-all ${
              computeTier === 'deep'
                ? 'bg-cyan-950/40 text-cyan-300 border-cyan-500/30'
                : 'bg-amber-950/40 text-amber-300 border-amber-500/30'
            }`}
          >
            {computeTier === 'deep' ? <Brain className="w-2.5 h-2.5" /> : <Zap className="w-2.5 h-2.5" />}
            <span>{computeTier === 'deep' ? 'Deep CoT Reasoning' : 'Fast Cache Tier'}</span>
          </button>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          Speak with{' '}
          <span className={activeTheme.textGradientClass}>Nexus Assistant</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-md">
          Natural voice interaction with browser-supported speech recognition and spoken responses.
        </p>
      </div>

      {/* Central Interactive Audio Orb */}
      <div className="my-6 sm:my-10 flex flex-col items-center justify-center relative">
        <AudioOrb
          theme={activeTheme}
          state={voiceState}
          audioLevel={audioLevel}
          onClick={handleToggleListening}
          size={240}
        />

        {/* Live Audio Waveform Bars */}
        <div className="flex items-center justify-center gap-1 mt-6 h-12 w-64 px-2">
          {waveformBars.map((height, idx) => (
            <div
              key={idx}
              className="w-1.5 rounded-full transition-all duration-100"
              style={{
                height: `${Math.max(4, height)}px`,
                backgroundColor:
                  voiceState === 'listening' || voiceState === 'speaking'
                    ? activeTheme.primaryHex
                    : 'rgba(255, 255, 255, 0.15)',
                boxShadow:
                  voiceState === 'listening' || voiceState === 'speaking'
                    ? `0 0 8px ${activeTheme.glowRgba}`
                    : 'none',
              }}
            />
          ))}
        </div>
      </div>

      {/* Spoken Transcription & Output Area */}
      <div className="w-full max-w-xl space-y-4">
        {/* Assistant Speech Card */}
        <div
          className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md transition-all relative overflow-hidden"
          style={{
            boxShadow: `0 0 24px ${activeTheme.glowRgbaSubtle}`,
            borderColor: `${activeTheme.primaryHex}30`,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" style={{ color: activeTheme.primaryHex }} />
              <span className="text-xs font-semibold text-white tracking-wide">Nexus Synthesis</span>
            </div>
            <span className="text-[10px] text-slate-300 font-mono uppercase">
              {voiceState === 'speaking' ? 'Synthesizing Audio' : 'Audio Cache Active'}
            </span>
          </div>

          <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
            {assistantSpokenText}
          </p>

          {transcript && (
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2 text-xs text-slate-400">
              <Mic className="w-3.5 h-3.5 text-slate-300" />
              <span className="italic">"{transcript}"</span>
            </div>
          )}
        </div>

        {/* Action Controls Bar */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleToggleListening}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-semibold text-white transition-all duration-200 shadow-lg active:scale-95 group"
            style={{
              background: activeTheme.gradient,
              boxShadow: `0 0 20px ${activeTheme.glowRgba}`,
            }}
          >
            {voiceState === 'listening' ? (
              <>
                <MicOff className="w-4 h-4 animate-bounce" />
                <span>Stop Listening</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span>Start Speaking</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              if (soundEnabled) playUiSound('toggle');
              setIsMuted(!isMuted);
              if (!isMuted) stopSpeaking();
            }}
            className={`p-3 rounded-xl border transition-colors ${
              isMuted
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                : 'bg-white/[0.04] border-white/10 text-slate-300 hover:text-white hover:bg-white/[0.08]'
            }`}
            title={isMuted ? 'Unmute Assistant Voice' : 'Mute Assistant Voice'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => {
              if (soundEnabled) playUiSound('toggle');
              onSwitchToOfflineText();
            }}
            className="flex items-center gap-2 px-4 py-3 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] text-xs font-medium text-slate-300 hover:text-white transition-colors"
            title="Switch to Offline Text Fallback Mode"
          >
            <MessageSquareCode className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Offline Text Fallback</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-300" />
          </button>
        </div>

        {/* Quick vocal trigger suggestions */}
        <div className="pt-2">
          <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block text-center mb-2.5">
            Recommended Vocal Commands
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {quickVoicePrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSelectQuickPrompt(prompt)}
                className="text-xs px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/5 hover:border-white/20 text-slate-300 hover:text-white hover:bg-white/[0.07] transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 text-slate-300" />
                <span>{prompt}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
