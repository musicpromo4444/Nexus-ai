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

  // Step 3: Production cloud inference with timeout + one controlled retry.
  const requestBody = {
    prompt,
    deepReasoning: decision.isDeepReasoning,
    autoTriggered: decision.autoTriggered,
    enableSearch: decision.isLiveData,
    mode,
  };

  const requestCloud = async () => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), decision.isLiveData ? 25000 : 18000);
    try {
      const response = await fetch('/api/reason', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      const data = await response.json().catch(() => null);
      if (response.ok && data?.text) {
        return {
          text: data.text,
          thoughts: data.thoughts,
          reasoningSteps: data.reasoningSteps,
          effectiveTier: data.effectiveTier || (decision.isDeepReasoning ? 'deep' : 'quick'),
          executionTier: 'cloud' as const,
          routeReason: data.routeReason || decision.routeReason,
          sources: data.sources,
          autoTriggered: data.autoTriggered ?? decision.autoTriggered,
          latencyMs: data.latencyMs,
          tokensUsed: data.tokensUsed,
          codeSnippet: data.codeSnippet,
        };
      }

      throw new Error(data?.error || `Cloud inference returned HTTP ${response.status}`);
    } finally {
      window.clearTimeout(timeout);
    }
  };

  try {
    return await requestCloud();
  } catch (firstError) {
    console.warn('Nexus cloud inference retry:', firstError);
    await new Promise((resolve) => window.setTimeout(resolve, 500));
    try {
      return await requestCloud();
    } catch (secondError) {
      console.warn('Nexus cloud inference unavailable:', secondError);
    }
  }

  // Dynamic questions must not receive fabricated local answers.
  return {
    text: 'Nexus could not reach the AI service right now. Please try again in a moment.',
    executionTier: 'cloud',
    routeReason: 'Cloud API unavailable after retry',
    effectiveTier: decision.isDeepReasoning ? 'deep' : 'quick',
    autoTriggered: decision.autoTriggered,
    latencyMs: 0,
    tokensUsed: 0,
  };

}
