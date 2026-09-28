import { DYNAMIC_GRADIENT_THEMES } from '../constants/themes';
import { ComputeTier, InteractionMode, LocalAction } from '../types';

export interface RouteDecision {
  targetTier: 'local' | 'cloud';
  routeReason: string;
  isLiveData: boolean;
  isDeepReasoning: boolean;
  autoTriggered: boolean;
  localAction?: LocalAction;
}

/**
 * Detects basic UI actions like theme changes, muting audio, mode switching, or clearing chat
 */
export function detectLocalUIAction(prompt: string): LocalAction | undefined {
  const p = prompt.toLowerCase().trim();

  // 1. Theme switching
  if (p.includes('theme') || p.includes('palette') || p.includes('color scheme')) {
    for (const theme of DYNAMIC_GRADIENT_THEMES) {
      if (p.includes(theme.id) || p.includes(theme.name.toLowerCase())) {
        return {
          type: 'CHANGE_THEME',
          payload: { themeId: theme.id },
          executed: false,
        };
      }
    }
    if (p.includes('switch theme') || p.includes('change theme') || p.includes('next theme')) {
      return {
        type: 'CHANGE_THEME',
        payload: { themeId: 'cyber-neon' },
        executed: false,
      };
    }
  }

  // 2. Audio muting / unmuting
  if (
    p === 'mute' ||
    p.includes('mute audio') ||
    p.includes('turn off sound') ||
    p.includes('silence') ||
    p.includes('disable audio') ||
    p.includes('mute sound')
  ) {
    return {
      type: 'TOGGLE_SOUND',
      payload: { enable: false },
      executed: false,
    };
  }
  if (
    p === 'unmute' ||
    p.includes('unmute audio') ||
    p.includes('turn on sound') ||
    p.includes('enable audio') ||
    p.includes('sound on')
  ) {
    return {
      type: 'TOGGLE_SOUND',
      payload: { enable: true },
      executed: false,
    };
  }

  // 3. Mode switching
  if (p.includes('switch to voice') || p.includes('voice mode') || p.includes('open voice')) {
    return {
      type: 'SWITCH_MODE',
      payload: { mode: 'voice' },
      executed: false,
    };
  }
  if (
    p.includes('switch to text') ||
    p.includes('text mode') ||
    p.includes('offline mode') ||
    p.includes('offline text')
  ) {
    return {
      type: 'SWITCH_MODE',
      payload: { mode: 'offline-text' },
      executed: false,
    };
  }

  // 4. Open Nexus pages
  const pageMatch = p.match(/(?:open|go to|show)\s+(settings|profile|memory|memories|routines|recommendations|creation|subscription|device|assistant)/i);
  if (pageMatch) {
    const map: Record<string,string> = { settings:'settings', profile:'profile', memory:'memory-routines', memories:'memory-routines', routines:'memory-routines', recommendations:'recommendation', creation:'creation', subscription:'subscription', device:'device', assistant:'assistant' };
    return { type: 'OPEN_PAGE', payload: { page: map[pageMatch[1].toLowerCase()] }, executed: false };
  }

  const urlMatch = prompt.match(/(?:open|visit|go to)\s+(https?:\/\/\S+)/i);
  if (urlMatch) return { type: 'OPEN_URL', payload: { url: urlMatch[1] }, executed: false };

  // 5. Clear chat
  if (
    p.includes('clear chat') ||
    p.includes('clear history') ||
    p.includes('clear messages') ||
    p.includes('reset conversation') ||
    p.includes('reset chat')
  ) {
    return {
      type: 'CLEAR_CHAT',
      payload: {},
      executed: false,
    };
  }

  // 6. Add task
  const addTaskMatch = prompt.match(/(?:add task|new task|create task|todo:?)\s+(.+)/i);
  if (addTaskMatch && addTaskMatch[1]) {
    return {
      type: 'ADD_TASK',
      payload: { title: addTaskMatch[1].trim() },
      executed: false,
    };
  }

  return undefined;
}

/**
 * Checks if a query is asking for local device status, time, arithmetic, or local tasks
 */
export function isLocalDeviceQuery(prompt: string): { isMatch: boolean; reason: string } {
  const p = prompt.toLowerCase().trim();

  // Basic UI Action check
  const uiAction = detectLocalUIAction(prompt);
  if (uiAction) {
    return { isMatch: true, reason: 'Local UI Action' };
  }

  // Real-time local clock
  if (
    p.includes('what time') ||
    p.includes('current time') ||
    p.includes('what is the time') ||
    p.includes("what's the time") ||
    p.includes('what date') ||
    p.includes("today's date") ||
    p === 'time' ||
    p === 'date'
  ) {
    return { isMatch: true, reason: 'Local On-Device Mode: Real-Time Clock RTC' };
  }

  // Device telemetry
  if (
    p.includes('device status') ||
    p.includes('battery status') ||
    p.includes('system health') ||
    p.includes('memory usage') ||
    p.includes('cache size') ||
    p.includes('storage usage') ||
    p.includes('system diagnostic') ||
    p.includes('ping test') ||
    p === 'status' ||
    p === 'diagnostics'
  ) {
    return { isMatch: true, reason: 'Local On-Device Mode: System Telemetry' };
  }

  // Tasks / Agenda
  if (
    p.includes('what are my tasks') ||
    p.includes('list tasks') ||
    p.includes('show tasks') ||
    p.includes('my agenda') ||
    p === 'tasks' ||
    p === 'agenda'
  ) {
    return { isMatch: true, reason: 'Local On-Device Mode: Task Storage' };
  }

  // Simple math arithmetic
  if (/^[\d\s\+\-\*\/\.\(\)\%\^xX=]+$/.test(p) && /[\+\-\*\/\%\^xX]/.test(p)) {
    return { isMatch: true, reason: 'Local On-Device Mode: Arithmetic Core' };
  }

  // Privacy / Air gap check
  if (p.includes('air-gap') || p.includes('airgap') || p.includes('privacy audit') || p.includes('is this secure')) {
    return { isMatch: true, reason: 'Local On-Device Mode: Privacy Audit' };
  }

  return { isMatch: false, reason: '' };
}

/**
 * Detects if a query asks for Live Data (sports scores, current news, real-time facts)
 */
export function isLiveDataQuery(prompt: string): boolean {
  const p = prompt.toLowerCase();
  const liveKeywords = [
    // Sports
    'score', 'scores', 'who won', 'game result', 'match result', 'final score',
    'nba', 'nfl', 'mlb', 'nhl', 'premier league', 'la liga', 'champions league',
    'super bowl', 'world cup', 'olympics', 'standings', 'tournament',
    'playoffs', 'mvp', 'lakers', 'celtics', 'chiefs', 'arsenal', 'real madrid',
    // News & Current Events
    'latest news', 'current news', 'breaking news', 'headlines', 'today news',
    'what happened today', 'current price', 'stock price', 'crypto price',
    'weather today', 'weather tomorrow', 'current weather', 'forecast',
    // Real-time facts
    'who is the current', 'who is currently', 'current president',
    'current prime minister', 'current ceo', 'latest update', 'recent events',
    'released in 2024', 'released in 2025', 'released in 2026', 'this week', 'this month'
  ];

  return liveKeywords.some((kw) => p.includes(kw));
}

/**
 * Detects if a query requires Deep Cognitive Reasoning
 */
export function isDeepReasoningQuery(prompt: string): boolean {
  const p = prompt.toLowerCase();
  const deepKeywords = [
    'step by step', 'break down', 'analyze', 'analysis', 'architecture',
    'compare', 'trade-offs', 'tradeoffs', 'algorithm', 'implement',
    'system design', 'debug', 'proof', 'deduce', 'root cause',
    'deep reasoning', 'multi-step', 'pros and cons', 'comprehensive',
    'evaluate', 'synthesize', 'optimize', 'scalability'
  ];

  if (deepKeywords.some((kw) => p.includes(kw))) {
    return true;
  }

  // Structural complexity checks
  if (prompt.length > 150) return true;
  if ((prompt.match(/\?/g) || []).length >= 2) return true;
  if (prompt.includes('\n') && prompt.split('\n').length >= 3) return true;

  return false;
}

/**
 * Main Dual-Tier Execution Router
 * Classifies queries between Local On-Device Mode vs Cloud API Fallback Router
 */
export function routeQuery(params: {
  prompt: string;
  computeTier: ComputeTier;
  mode: InteractionMode;
  autoDetect: boolean;
}): RouteDecision {
  const { prompt, computeTier, autoDetect } = params;

  // 1. Check for Local UI Action (always executed locally)
  const localAction = detectLocalUIAction(prompt);
  if (localAction) {
    return {
      targetTier: 'local',
      routeReason: 'Local UI Action: Built-in State Engine',
      isLiveData: false,
      isDeepReasoning: false,
      autoTriggered: false,
      localAction,
    };
  }

  // 2. Check for Local Device Query (telemetry, RTC clock, local tasks, arithmetic)
  const localDeviceCheck = isLocalDeviceQuery(prompt);
  if (localDeviceCheck.isMatch) {
    return {
      targetTier: 'local',
      routeReason: localDeviceCheck.reason || 'Local On-Device Mode',
      isLiveData: false,
      isDeepReasoning: false,
      autoTriggered: false,
    };
  }

  // 3. Check for Live Data (sports scores, current news, live facts) -> Cloud API with search grounding
  const isLive = isLiveDataQuery(prompt);
  if (isLive) {
    return {
      targetTier: 'cloud',
      routeReason: 'Cloud API Router: Live Sports & Web Grounding',
      isLiveData: true,
      isDeepReasoning: computeTier === 'deep',
      autoTriggered: false,
    };
  }

  // 4. Check for Deep Reasoning / Multi-step analysis
  const requiresDeep = computeTier === 'deep' || (autoDetect && isDeepReasoningQuery(prompt));
  if (requiresDeep) {
    return {
      targetTier: 'cloud',
      routeReason: computeTier === 'deep'
        ? 'Cloud API Router: Explicit Deep Reasoning'
        : 'Cloud API Router: Auto-Detected Multi-Step Reasoning',
      isLiveData: false,
      isDeepReasoning: true,
      autoTriggered: computeTier !== 'deep',
    };
  }

  // 5. Local reminder commands
  const reminder = prompt.match(/(?:remind me|set a reminder)\s+(?:in\s+)?(\d+)\s*(minute|minutes|min|hour|hours|hr|hrs)\s*(?:to|that)\s+(.+)/i);
  if (reminder) {
    const amount = Number(reminder[1]);
    const unit = reminder[2].toLowerCase();
    const title = reminder[3].trim();
    const minutes = unit.startsWith('hour') || unit.startsWith('hr') ? amount * 60 : amount;
    return {
      targetTier: 'local',
      routeReason: 'Local On-Device Mode: Reminder Scheduler',
      isLiveData: false,
      isDeepReasoning: false,
      autoTriggered: false,
      localAction: { type: 'SET_REMINDER', payload: { title, minutes }, executed: false },
    };
  }

  // 5. Default to Cloud API for dynamic questions (knowledge, coding, conversation)
  // This ensures questions actually get answered dynamically instead of returning static canned text!
  return {
    targetTier: 'cloud',
    routeReason: 'Cloud API Router: Dynamic LLM Synthesis',
    isLiveData: false,
    isDeepReasoning: false,
    autoTriggered: false,
  };
}
