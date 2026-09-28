export type InteractionMode = 'voice' | 'offline-text';

export type AppPage =
  | 'assistant'
  | 'subscription'
  | 'recommendation'
  | 'creation'
  | 'profile'
  | 'memory-routines'
  | 'neural-modules'
  | 'settings'
  | 'device'
  | 'voice-environment';

export type ComputeTier = 'quick' | 'deep';

export type ExecutionTier = 'local' | 'cloud';

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

export interface LocalAction {
  type: 'CHANGE_THEME' | 'TOGGLE_SOUND' | 'SWITCH_MODE' | 'CLEAR_CHAT' | 'ADD_TASK' | 'SET_REMINDER' | 'OPEN_PAGE' | 'OPEN_URL' | 'NONE';
  payload?: any;
  executed?: boolean;
}

export interface LocalTask {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export interface GradientTheme {
  id: string;
  name: string;
  subtitle: string;
  // Primary CSS gradient string for buttons, text, and active highlights
  gradient: string;
  // Tailored Tailwind class combinations
  gradientClass: string;
  textGradientClass: string;
  // Hex and RGBA values for dynamic inline glows and canvas rendering
  primaryHex: string;
  secondaryHex: string;
  glowRgba: string;
  glowRgbaSubtle: string;
  borderHoverClass: string;
  activeRingClass: string;
  badgeBg: string;
  badgeText: string;
  previewColors: [string, string, string];
}

export interface ReasoningStep {
  step: number;
  title: string;
  details: string;
  status: 'completed' | 'in_progress';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  mode: InteractionMode;
  computeTier?: ComputeTier;
  executionTier?: ExecutionTier;
  routeReason?: string;
  sources?: Array<{ title: string; url: string }>;
  thoughts?: string;
  reasoningSteps?: ReasoningStep[];
  autoTriggered?: boolean;
  codeSnippet?: {
    language: string;
    code: string;
  };
  latencyMs?: number;
  tokensUsed?: number;
  isAudioPlaying?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  category: 'today' | 'earlier';
  timestamp: string;
  messageCount: number;
}

export interface ReasoningResult {
  text: string;
  thoughts?: string;
  reasoningSteps?: ReasoningStep[];
  effectiveTier: ComputeTier;
  executionTier: ExecutionTier;
  routeReason: string;
  sources?: Array<{ title: string; url: string }>;
  autoTriggered: boolean;
  latencyMs: number;
  tokensUsed: number;
  codeSnippet?: {
    language: string;
    code: string;
  };
  localAction?: LocalAction;
}

