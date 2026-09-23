import {
  ComputeTier,
  ExecutionTier,
  GradientTheme,
  InteractionMode,
  LocalAction,
  ReasoningResult,
  ReasoningStep,
} from '../types';
import { executeLocalEngine } from './localEngine';
import { isDeepReasoningQuery, isLiveDataQuery, routeQuery } from './router';

export type { ReasoningResult };

/**
 * Heuristics to auto-detect whether a user query requires multi-step analysis
 */
export function detectReasoningNeed(prompt: string): { needsReasoning: boolean; reason: string } {
  const needs = isDeepReasoningQuery(prompt);
  return {
    needsReasoning: needs,
    reason: needs ? 'Multi-step analytical breakdown required' : 'Direct synthesis appropriate',
  };
}

/**
 * Primary Dual-Tier Execution Router & Hybrid Reasoning Dispatcher
 * Automatically routes between:
 * 1. Local On-Device Mode (UI actions, device telemetry, RTC clock, offline fallback)
 * 2. Cloud API Fallback Router (Live data, sports scores, news, complex reasoning, dynamic LLM)
 */
export async function dispatchHybridReasoning(params: {
  prompt: string;
  computeTier: ComputeTier;
  autoDetect: boolean;
  mode: InteractionMode;
  activeTheme?: GradientTheme;
  soundEnabled?: boolean;
  onLocalAction?: (action: LocalAction) => void;
}): Promise<ReasoningResult> {
  const { prompt, computeTier, autoDetect, mode, activeTheme, soundEnabled = true, onLocalAction } = params;

  // Step 1: Query the Dual-Tier Router
  const decision = routeQuery({
    prompt,
    computeTier,
    mode,
    autoDetect,
  });

  // Step 2: If routed to Local On-Device Mode, execute directly via built-in engine
  if (decision.targetTier === 'local') {
    const localResult = await executeLocalEngine({
      prompt,
      action: decision.localAction,
      activeTheme,
      soundEnabled,
      mode,
    });

    // Invoke action callback if UI state mutation is needed
    if (onLocalAction && decision.localAction) {
      onLocalAction(decision.localAction);
    }

    return {
      ...localResult,
      effectiveTier: 'quick',
      executionTier: 'local',
      routeReason: decision.routeReason,
      autoTriggered: false,
    };
  }

  // Step 3: Cloud API Fallback Router
  // Route to live server LLM endpoint (/api/reason) with live data / search tools and CoT
  try {
    const response = await fetch('/api/reason', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        deepReasoning: decision.isDeepReasoning,
        autoTriggered: decision.autoTriggered,
        enableSearch: decision.isLiveData,
        mode,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.text) {
        return {
          text: data.text,
          thoughts: data.thoughts,
          reasoningSteps: data.reasoningSteps,
          effectiveTier: data.effectiveTier || (decision.isDeepReasoning ? 'deep' : 'quick'),
          executionTier: 'cloud',
          routeReason: data.routeReason || decision.routeReason,
          sources: data.sources,
          autoTriggered: data.autoTriggered ?? decision.autoTriggered,
          latencyMs: data.latencyMs ?? 650,
          tokensUsed: data.tokensUsed ?? 220,
          codeSnippet: data.codeSnippet,
        };
      }
    }
  } catch (err) {
    console.warn('Cloud API unavailable, failing over to Local On-Device Engine:', err);
  }

  // Step 4: Graceful On-Device Fallback if Cloud API call fails
  const localFallback = await executeLocalEngine({
    prompt,
    activeTheme,
    soundEnabled,
    mode,
  });

  return {
    ...localFallback,
    text: `${localFallback.text}\n\n*(Note: Cloud API was temporarily unreachable; query seamlessly resolved on-device via the Local Fallback Engine).*`,
    executionTier: 'local',
    routeReason: 'Local On-Device Engine (Offline Fallback)',
    effectiveTier: decision.isDeepReasoning ? 'deep' : 'quick',
    autoTriggered: decision.autoTriggered,
  };
}
