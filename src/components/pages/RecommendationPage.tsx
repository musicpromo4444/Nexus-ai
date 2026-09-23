import React, { useState } from 'react';
import {
  Compass,
  ArrowRight,
  ChevronLeft,
  Lightbulb,
  Cpu,
  Brain,
  Zap,
  CheckCircle2,
  Workflow,
  Copy,
  Clock,
  ThumbsUp
} from 'lucide-react';
import { GradientTheme } from '../../types';
import { playUiSound } from '../../utils/audio';

interface RecommendationPageProps {
  activeTheme: GradientTheme;
  onBackToAssistant: () => void;
  onRunWorkflowPrompt: (prompt: string, deep: boolean) => void;
  soundEnabled: boolean;
}

export const RecommendationPage: React.FC<RecommendationPageProps> = ({
  activeTheme,
  onBackToAssistant,
  onRunWorkflowPrompt,
  soundEnabled,
}) => {
  const [appliedId, setAppliedId] = useState<string | null>(null);

  const recommendations = [
    {
      id: 'rec-1',
      title: 'Architectural Blueprint Deconstruction',
      category: 'architecture',
      description:
        'Decompose complex distributed systems into decoupled, fault-tolerant microservices using 4-stage deductive Chain-of-Thought.',
      suggestedPrompt:
        'Perform a multi-stage architectural tradeoff analysis comparing client-side local vector caching against edge-rendered streaming for voice AI assistants.',
      deep: true,
      tag: 'AI Recommended',
      impact: 'High Accuracy',
      latency: '~2.8s',
    },
    {
      id: 'rec-2',
      title: 'Real-Time Acoustic Calibration',
      category: 'productivity',
      description:
        'Calibrate the procedural sine-wave audio frequency and noise-gate thresholds to optimize voice synthesis on noisy microphones.',
      suggestedPrompt:
        'Analyze audio input noise floor and generate optimal Web Audio API biquad filter settings for clear real-time vocal recognition.',
      deep: false,
      tag: 'Instant Cache',
      impact: 'Sub-second',
      latency: '< 400ms',
    },
    {
      id: 'rec-3',
      title: 'Air-Gapped Vector Index Expansion',
      category: 'reasoning',
      description:
        'Pre-cache full-stack TypeScript snippets and developer diagnostics into the local encrypted browser vault for zero-network latency.',
      suggestedPrompt:
        'Scaffold a zero-dependency high-throughput TypeScript vector search class using Cosine Similarity on float32 arrays.',
      deep: true,
      tag: 'Developer Recipe',
      impact: 'Zero Egress',
      latency: '~1.9s',
    },
    {
      id: 'rec-4',
      title: 'Automated Prompt Optimizer & System Persona',
      category: 'productivity',
      description:
        'Refine raw user queries into structured few-shot instructions with negative constraints and unambiguous output schemas.',
      suggestedPrompt:
        'Transform this raw prompt into an optimized high-precision LLM instruction with role definition, explicit boundary constraints, and JSON schema.',
      deep: false,
      tag: 'Workflow Accelerator',
      impact: '10x Clarity',
      latency: '< 600ms',
    },
    {
      id: 'rec-5',
      title: 'Full-Stack Performance Profiler',
      category: 'architecture',
      description:
        'Diagnose frontend hydration bottlenecks, memory leaks, and React re-render cascades using browser performance APIs.',
      suggestedPrompt:
        'Identify common causes of React 18 concurrent mode re-rendering bottlenecks in real-time audio canvas dashboards and propose targeted fixes.',
      deep: true,
      tag: 'Engineering Suite',
      impact: '60 FPS Smoothness',
      latency: '~3.1s',
    },
  ];

  const handleApply = (id: string, prompt: string, deep: boolean) => {
    if (soundEnabled) playUiSound('activate');
    setAppliedId(id);
    setTimeout(() => {
      onRunWorkflowPrompt(prompt, deep);
    }, 400);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 max-w-6xl mx-auto w-full space-y-8 animate-in fade-in duration-300">
      {/* Top Navigation Breadcrumb */}
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

      {/* Prominent Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/20 shadow-md"
            style={{
              background: activeTheme.gradient,
              boxShadow: `0 0 20px ${activeTheme.glowRgbaSubtle}`,
            }}
          >
            <Compass className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide uppercase">
              AI RECOMMENDATIONS
            </h1>
            <p className="text-sm text-slate-400">
              Contextual suggestions, curated reasoning flows, and 1-click execution recipes.
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {recommendations.map((rec) => {
          const isApplied = appliedId === rec.id;
          return (
            <div
              key={rec.id}
              className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/25 hover:bg-white/[0.05] transition-all duration-200 flex flex-col justify-between space-y-4 group"
              style={{
                boxShadow: isApplied ? `0 0 25px ${activeTheme.glowRgbaSubtle}` : undefined,
              }}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className="text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider"
                    style={{ background: activeTheme.badgeBg, color: activeTheme.primaryHex }}
                  >
                    {rec.tag}
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{rec.latency}</span>
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-200 transition-colors">
                    {rec.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{rec.description}</p>
                </div>

                {/* Prompt Preview Snippet */}
                <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-300 font-mono italic">
                  "{rec.suggestedPrompt}"
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 flex items-center justify-between border-t border-white/5">
                <span className="text-[11px] text-slate-400">
                  Tier: <strong className="text-white capitalize">{rec.deep ? 'Cognitive CoT' : 'Instant Cache'}</strong>
                </span>

                <button
                  onClick={() => handleApply(rec.id, rec.suggestedPrompt, rec.deep)}
                  disabled={isApplied}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white transition-all shadow-sm"
                  style={{
                    background: activeTheme.gradient,
                    boxShadow: `0 0 12px ${activeTheme.glowRgbaSubtle}`,
                  }}
                >
                  {isApplied ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Launching...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-3.5 h-3.5" />
                      <span>Launch Workflow</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
