import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  Copy,
  Check,
  Volume2,
  Sparkles,
  WifiOff,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Paperclip,
  Code,
  ShieldCheck,
  Terminal,
  Brain,
  Zap,
  CheckCircle2,
  Layers,
  ArrowRight,
  Cloud,
  Shield,
  Globe,
  ExternalLink,
  Cpu,
} from 'lucide-react';
import { ChatMessage, ComputeTier, GradientTheme } from '../types';
import { playUiSound, speakText } from '../utils/audio';
import { detectReasoningNeed } from '../services/reasoningEngine';

interface ChatInterfaceProps {
  activeTheme: GradientTheme;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onClearMessages: () => void;
  onSwitchToVoice: () => void;
  soundEnabled: boolean;
  isGenerating?: boolean;
  computeTier: ComputeTier;
  onToggleComputeTier: (newTier: ComputeTier) => void;
  autoDetectReasoning: boolean;
  onToggleAutoDetect: () => void;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  activeTheme,
  messages,
  onSendMessage,
  onClearMessages,
  onSwitchToVoice,
  soundEnabled,
  isGenerating = false,
  computeTier,
  onToggleComputeTier,
  autoDetectReasoning,
  onToggleAutoDetect,
}) => {
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedThoughts, setExpandedThoughts] = useState<Record<string, boolean>>({});
  const [expandedCoT, setExpandedCoT] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Dynamic detection for currently typed text
  const detectionResult = inputText.trim().length > 8 ? detectReasoningNeed(inputText) : null;
  const willAutoRouteToDeep = Boolean(
    computeTier === 'quick' && autoDetectReasoning && detectionResult?.needsReasoning
  );

  // Auto-scroll on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const handleSend = () => {
    if (!inputText.trim() || isGenerating) return;
    if (soundEnabled) playUiSound('message');
    onSendMessage(inputText.trim());
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    if (soundEnabled) playUiSound('click');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleThoughts = (id: string) => {
    if (soundEnabled) playUiSound('click');
    setExpandedThoughts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleCoT = (id: string) => {
    if (soundEnabled) playUiSound('click');
    setExpandedCoT((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const quickPrompts = [
    { label: 'On-Device Status', prompt: 'Device status and telemetry diagnostic', tag: 'On-Device' },
    { label: 'UI Action: Theme', prompt: 'Change theme to Cyber Neon', tag: 'UI Action' },
    { label: 'Live Sports Score', prompt: 'Who won the 2024 NBA finals and who was MVP?', tag: 'Cloud Live' },
    { label: 'Deep Architecture', prompt: 'Analyze the architectural tradeoffs of client-side cache versus edge server rendering for a voice AI assistant', tag: 'Cloud CoT' },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0b0d13] overflow-hidden relative">
      {/* Offline Mode & Hybrid Reasoning Engine Banner */}
      <div className="px-4 py-2.5 bg-gradient-to-r from-[#111420] via-[#0d101a] to-[#111420] border-b border-white/[0.08] flex flex-wrap items-center justify-between gap-2 text-xs z-20 flex-shrink-0">
        {/* Left: Compute Tier Switch */}
        <div className="flex items-center gap-2">
          <div className="flex items-center p-0.5 rounded-lg bg-black/40 border border-white/10">
            <button
              onClick={() => {
                if (soundEnabled) playUiSound('click');
                onToggleComputeTier('quick');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                computeTier === 'quick'
                  ? 'bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Fast Tier: Instant local resolution, saves tokens (<20ms)"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Fast Cache</span>
            </button>

            <button
              onClick={() => {
                if (soundEnabled) playUiSound('glow');
                onToggleComputeTier('deep');
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                computeTier === 'deep'
                  ? 'text-white font-semibold shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              style={
                computeTier === 'deep'
                  ? {
                      background: activeTheme.gradient,
                      boxShadow: `0 0 10px ${activeTheme.glowRgbaSubtle}`,
                    }
                  : undefined
              }
              title="Deep Reasoning Mode: 4-stage Chain-of-Thought decomposition"
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Deep Reasoning</span>
            </button>
          </div>

          {/* Auto-Detect Trigger Switch */}
          <button
            onClick={() => {
              if (soundEnabled) playUiSound('click');
              onToggleAutoDetect();
            }}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
              autoDetectReasoning
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                : 'bg-white/[0.03] text-slate-400 border-white/10 hover:text-slate-200'
            }`}
            title="Auto-Detect: Automatically route multi-step analytical prompts to Deep Reasoning"
          >
            <span className={`w-1.5 h-1.5 rounded-full ${autoDetectReasoning ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            <span>Auto-Detect: {autoDetectReasoning ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* Right: Engine Telemetry / Air-Gapped Status */}
        <div className="flex items-center gap-2">
          <span className="hidden sm:flex items-center gap-1 text-[11px] text-slate-300 bg-white/[0.03] px-2.5 py-0.5 rounded-full border border-white/10">
            {computeTier === 'deep' ? (
              <>
                <Brain className="w-3 h-3 text-cyan-400" />
                <span>Multi-Step CoT Routing</span>
              </>
            ) : (
              <>
                <Zap className="w-3 h-3 text-amber-400" />
                <span>Lightweight Cached Inference</span>
              </>
            )}
          </span>

          <span className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
            <ShieldCheck className="w-3 h-3" />
            Air-Gapped
          </span>

          <button
            onClick={() => {
              if (soundEnabled) playUiSound('click');
              onClearMessages();
            }}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Clear Chat History"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          const isThoughtsOpen = expandedThoughts[msg.id];
          const isCoTOpen = expandedCoT[msg.id] ?? true; // expanded by default for rich visibility
          const isDeepReasoning = msg.computeTier === 'deep' || Boolean(msg.reasoningSteps && msg.reasoningSteps.length > 0);

          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
            >
              {/* Avatar Icon */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold shadow-md ${
                  isUser
                    ? 'bg-slate-800 text-slate-200 border border-white/10'
                    : 'text-white border border-white/20'
                }`}
                style={
                  !isUser
                    ? {
                        background: activeTheme.gradient,
                        boxShadow: `0 0 12px ${activeTheme.glowRgbaSubtle}`,
                      }
                    : undefined
                }
              >
                {isUser ? 'ME' : isDeepReasoning ? <Brain className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              </div>

              {/* Message Bubble & Content */}
              <div className={`space-y-2 max-w-[85%] sm:max-w-xl ${isUser ? 'items-end text-right' : ''}`}>
                {/* Header info */}
                <div className={`flex flex-wrap items-center gap-2 text-[11px] text-slate-400 ${isUser ? 'justify-end' : ''}`}>
                  <span className="font-semibold text-slate-300">
                    {isUser ? 'You' : 'Nexus AI'}
                  </span>
                  <span>{msg.timestamp}</span>

                  {/* Dual-Tier Router Badge */}
                  {!isUser && msg.executionTier && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 border ${
                        msg.executionTier === 'local'
                          ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                          : 'bg-indigo-950/40 text-indigo-300 border-indigo-500/30'
                      }`}
                    >
                      {msg.executionTier === 'local' ? (
                        <>
                          <Shield className="w-2.5 h-2.5 text-emerald-400" />
                          <span>On-Device</span>
                        </>
                      ) : (
                        <>
                          <Cloud className="w-2.5 h-2.5 text-indigo-400" />
                          <span>Cloud API</span>
                        </>
                      )}
                    </span>
                  )}

                  {/* Compute Tier Badge */}
                  {!isUser && (
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 border ${
                        isDeepReasoning
                          ? 'bg-cyan-950/40 text-cyan-300 border-cyan-500/30'
                          : 'bg-amber-950/40 text-amber-300 border-amber-500/30'
                      }`}
                    >
                      {isDeepReasoning ? (
                        <>
                          <Brain className="w-2.5 h-2.5" />
                          <span>Deep CoT</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-2.5 h-2.5" />
                          <span>Fast Cache</span>
                        </>
                      )}
                    </span>
                  )}

                  {/* Auto-Triggered Indicator */}
                  {msg.autoTriggered && !isUser && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Auto-Triggered
                    </span>
                  )}

                  {/* Route Reason Pill */}
                  {!isUser && msg.routeReason && (
                    <span
                      className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[9px] font-mono bg-white/[0.04] text-slate-400 border border-white/5 truncate max-w-[180px]"
                      title={msg.routeReason}
                    >
                      {msg.routeReason}
                    </span>
                  )}

                  {/* Telemetry (latency & tokens) */}
                  {msg.latencyMs && (
                    <span className="text-[10px] text-slate-400 font-mono">
                      • {msg.latencyMs}ms
                    </span>
                  )}
                  {msg.tokensUsed && (
                    <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                      • {msg.tokensUsed} tokens
                    </span>
                  )}
                </div>

                {/* Structured Chain-of-Thought (CoT) Visual Trace */}
                {!isUser && msg.reasoningSteps && msg.reasoningSteps.length > 0 && (
                  <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-[#0e1726]/70 to-[#0b101c]/90 overflow-hidden shadow-lg text-left">
                    <button
                      onClick={() => toggleCoT(msg.id)}
                      className="w-full px-3.5 py-2 flex items-center justify-between text-xs font-semibold text-cyan-300 hover:text-white bg-cyan-500/[0.08] hover:bg-cyan-500/[0.12] transition-colors border-b border-cyan-500/10"
                    >
                      <div className="flex items-center gap-2">
                        <Brain className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                        <span>Structured Chain-of-Thought</span>
                        <span className="text-[10px] text-cyan-200/60 font-mono font-normal">
                          ({msg.reasoningSteps.length} Stages Resolved)
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-cyan-300/80 font-mono">
                          {isCoTOpen ? 'Collapse Trace' : 'Expand Trace'}
                        </span>
                        {isCoTOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </div>
                    </button>

                    {isCoTOpen && (
                      <div className="p-3.5 space-y-2.5">
                        {msg.reasoningSteps.map((step) => (
                          <div
                            key={step.step}
                            className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-cyan-500/20 transition-all text-xs"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                                {step.step}
                              </span>
                              <span className="font-semibold text-slate-200">
                                {step.title}
                              </span>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-auto flex-shrink-0" />
                            </div>
                            <p className="text-slate-400 pl-7 leading-relaxed font-sans text-[11.5px]">
                              {step.details}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Raw Thought Process Accordion (if thoughts present without steps) */}
                {msg.thoughts && !isUser && (!msg.reasoningSteps || msg.reasoningSteps.length === 0) && (
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden text-left">
                    <button
                      onClick={() => toggleThoughts(msg.id)}
                      className="w-full px-3 py-1.5 flex items-center justify-between text-[11px] text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <Terminal className="w-3 h-3 text-slate-300" />
                        Neural Logic Trace
                      </span>
                      {isThoughtsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    {isThoughtsOpen && (
                      <div className="px-3 py-2 text-xs text-slate-400 border-t border-white/5 font-mono bg-black/40 whitespace-pre-wrap">
                        {msg.thoughts}
                      </div>
                    )}
                  </div>
                )}

                {/* Primary Message Body */}
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    isUser
                      ? 'bg-[#1a1f30] text-white border border-white/10 rounded-tr-sm'
                      : 'bg-[#121624] text-slate-200 border border-white/10 rounded-tl-sm shadow-lg text-left'
                  }`}
                  style={
                    !isUser
                      ? {
                          boxShadow: `0 4px 20px rgba(0,0,0,0.5), 0 0 1px ${activeTheme.glowRgbaSubtle}`,
                        }
                      : undefined
                  }
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Code Snippet if present */}
                  {msg.codeSnippet && (
                    <div className="mt-3 rounded-xl overflow-hidden border border-white/10 bg-[#090b10] font-mono text-xs">
                      <div className="flex items-center justify-between px-3 py-1.5 bg-white/[0.05] border-b border-white/10 text-[11px] text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Code className="w-3.5 h-3.5 text-slate-300" />
                          {msg.codeSnippet.language}
                        </span>
                        <button
                          onClick={() => handleCopy(msg.codeSnippet!.code, msg.id)}
                          className="flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                      <pre className="p-3 overflow-x-auto text-slate-300">
                        <code>{msg.codeSnippet.code}</code>
                      </pre>
                    </div>
                  )}

                  {/* Live Grounded Web Sources if present */}
                  {!isUser && msg.sources && msg.sources.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-white/[0.08]">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-cyan-300 mb-1.5">
                        <Globe className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Grounded Live Sources</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.sources.map((src, idx) => (
                          <a
                            key={idx}
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-cyan-500/10 border border-white/10 hover:border-cyan-500/30 text-[11px] text-slate-300 hover:text-cyan-200 transition-colors"
                          >
                            <span className="truncate max-w-[200px]">{src.title}</span>
                            <ExternalLink className="w-3 h-3 text-cyan-400/70 flex-shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action footer for assistant responses */}
                {!isUser && (
                  <div className="flex items-center gap-2 pt-1 text-slate-400">
                    <button
                      onClick={() => {
                        if (soundEnabled) playUiSound('activate');
                        speakText(msg.text);
                      }}
                      className="p-1 rounded hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1 text-[11px]"
                      title="Read aloud via Speech Synthesis"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>Speak</span>
                    </button>
                    <button
                      onClick={() => handleCopy(msg.text, `msg-${msg.id}`)}
                      className="p-1 rounded hover:text-white hover:bg-white/5 transition-colors flex items-center gap-1 text-[11px]"
                      title="Copy response"
                    >
                      {copiedId === `msg-${msg.id}` ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      <span>Copy</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Generating Typing Bubble Indicator */}
        {isGenerating && (
          <div className="flex gap-3 max-w-3xl mr-auto">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold text-white shadow-md"
              style={{
                background: activeTheme.gradient,
              }}
            >
              {computeTier === 'deep' ? <Brain className="w-4 h-4 animate-pulse" /> : <Sparkles className="w-4 h-4 animate-spin" />}
            </div>
            <div className="p-4 rounded-2xl bg-[#121624] border border-white/10 rounded-tl-sm space-y-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="text-xs text-slate-300 font-medium ml-2">
                  {computeTier === 'deep'
                    ? 'Nexus Deep Reasoning: Executing 4-stage Chain-of-Thought decomposition...'
                    : 'Nexus Fast Tier: Resolving against local cache dictionary...'}
                </span>
              </div>
              {computeTier === 'deep' && (
                <div className="text-[11px] text-cyan-400/80 pl-2 font-mono border-l-2 border-cyan-500/40">
                  Deconstructing problem scope → Identifying constraints → Resolving logic
                </div>
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Carousel */}
      <div className="px-4 sm:px-8 py-2 border-t border-white/[0.06] bg-[#0d0f17]/80 backdrop-blur-md flex items-center gap-2 overflow-x-auto no-scrollbar flex-shrink-0">
        <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider whitespace-nowrap flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-slate-300" />
          Prompts:
        </span>
        {quickPrompts.map((item, i) => (
          <button
            key={i}
            onClick={() => {
              if (soundEnabled) playUiSound('click');
              onSendMessage(item.prompt);
            }}
            className="text-xs px-2.5 py-1 rounded-lg bg-white/[0.03] border border-white/10 hover:border-white/20 text-slate-300 hover:text-white hover:bg-white/[0.07] whitespace-nowrap transition-colors flex items-center gap-1.5"
          >
            <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-white/[0.08] text-slate-400">
              {item.tag}
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-4 sm:px-8 sm:pb-6 bg-[#0b0d13] border-t border-white/[0.08] flex-shrink-0">
        {/* Real-time Auto-Detect Cue */}
        {willAutoRouteToDeep && (
          <div className="mb-2 px-3 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>
                <strong>Auto-Detect Triggered:</strong> {detectionResult?.reason} → Routing through Deep Reasoning Mode
              </span>
            </div>
            <span className="text-[10px] text-cyan-200/60 font-mono hidden sm:inline">CoT 4-Stage Breakdown</span>
          </div>
        )}

        <div
          className="rounded-2xl border border-white/10 bg-[#121520] p-2 sm:p-3 transition-all focus-within:border-white/30 relative shadow-2xl"
          style={{
            boxShadow: `0 0 20px rgba(0,0,0,0.6), inset 0 1px 1px rgba(255,255,255,0.05)`,
          }}
        >
          {/* Text Input */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
            }}
            onKeyDown={handleKeyDown}
            placeholder={
              computeTier === 'deep'
                ? 'Enter complex prompt for step-by-step Chain-of-Thought analysis...'
                : 'Message Nexus AI (Instant Fast Cache, press Enter to send)...'
            }
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none resize-none px-2 py-1 max-h-36"
          />

          {/* Action Toolbar */}
          <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] mt-1">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  if (soundEnabled) playUiSound('click');
                  onSwitchToVoice();
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors flex items-center gap-1 text-xs"
                title="Switch to Voice-First interaction mode"
              >
                <Mic className="w-4 h-4 text-rose-400" />
                <span className="hidden sm:inline">Voice Mode</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (soundEnabled) playUiSound('click');
                  setInputText((prev) => prev + ' [Attached: system_schema.json]');
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                title="Attach local context snippet"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* In-toolbar Tier Toggle for quick switching */}
              <button
                type="button"
                onClick={() => {
                  if (soundEnabled) playUiSound('toggle');
                  onToggleComputeTier(computeTier === 'quick' ? 'deep' : 'quick');
                }}
                className={`p-1.5 px-2.5 rounded-lg text-xs flex items-center gap-1 border transition-all ${
                  computeTier === 'deep'
                    ? 'bg-cyan-950/50 text-cyan-300 border-cyan-500/30'
                    : 'bg-white/[0.04] text-slate-400 border-white/10 hover:text-slate-200'
                }`}
                title="Toggle between Fast Cache and Deep Reasoning"
              >
                {computeTier === 'deep' ? (
                  <>
                    <Brain className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="hidden sm:inline">Deep Reasoning Mode</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">Fast Cache Mode</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 hidden md:inline">
                {computeTier === 'deep' ? '4-Stage CoT Active' : 'Sub-20ms Fast Tier'}
              </span>

              <button
                type="button"
                onClick={handleSend}
                disabled={!inputText.trim() || isGenerating}
                className={`p-2 rounded-xl text-white transition-all duration-200 shadow-md flex items-center justify-center ${
                  inputText.trim() && !isGenerating
                    ? 'opacity-100 active:scale-95 cursor-pointer'
                    : 'opacity-40 cursor-not-allowed'
                }`}
                style={{
                  background: activeTheme.gradient,
                  boxShadow: inputText.trim() ? `0 0 15px ${activeTheme.glowRgba}` : 'none',
                }}
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

