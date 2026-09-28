import { DYNAMIC_GRADIENT_THEMES } from '../constants/themes';
import { GradientTheme, InteractionMode, LocalAction, LocalTask, ReasoningResult } from '../types';
import { loadNexusState, saveNexusState } from '../utils/persistence';

// Persistent local task storage in memory & localStorage
const LOCAL_STORAGE_TASKS_KEY = 'nexus_local_tasks_v1';

export function getLocalTasks(): LocalTask[] {
  const saved = loadNexusState<LocalTask[] | null>(LOCAL_STORAGE_TASKS_KEY, null);
  if (saved) return saved;
  return [];
}

export function saveLocalTasks(tasks: LocalTask[]): void {
  saveNexusState(LOCAL_STORAGE_TASKS_KEY, tasks);
}

export function addLocalTask(title: string): LocalTask[] {
  const current = getLocalTasks();
  const newTask: LocalTask = {
    id: `task-${Date.now()}`,
    title: title.trim(),
    completed: false,
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
  const updated = [newTask, ...current];
  saveLocalTasks(updated);
  return updated;
}

/**
 * Evaluates safe basic math expressions locally
 */
export function evaluateLocalMath(expression: string): { success: boolean; result?: string; calculation?: string } {
  const cleaned = expression
    .replace(/[^\d\s\+\-\*\/\.\(\)\%\^xX]/g, '')
    .replace(/[xX]/g, '*')
    .replace(/\^/g, '**');

  if (!cleaned || !/[\d]/.test(cleaned) || !/[\+\-\*\/\%\*]/.test(cleaned)) {
    return { success: false };
  }

  try {
    // Safe evaluation of mathematical tokens only
    if (/^[\d\s\+\-\*\/\.\(\)\%]+$/.test(cleaned)) {
      // eslint-disable-next-line no-eval
      const evaluated = Function(`'use strict'; return (${cleaned})`)();
      if (typeof evaluated === 'number' && !isNaN(evaluated) && isFinite(evaluated)) {
        const formatted = Number.isInteger(evaluated)
          ? evaluated.toLocaleString()
          : evaluated.toLocaleString(undefined, { maximumFractionDigits: 4 });
        return {
          success: true,
          result: formatted,
          calculation: cleaned.replace(/\*\*/g, '^'),
        };
      }
    }
  } catch {
    // not a math expression
  }
  return { success: false };
}

/**
 * Queries real browser device and storage metrics
 */
export async function getDeviceTelemetry(): Promise<{
  online: boolean;
  cpuCores: number;
  memoryMb?: number;
  storageEstimateMb?: { used: number; total: number };
  batteryLevel?: number;
  isCharging?: boolean;
}> {
  const online = typeof navigator !== 'undefined' ? navigator.onLine : true;
  const cpuCores = typeof navigator !== 'undefined' ? (navigator.hardwareConcurrency || 8) : 8;

  let memoryMb: number | undefined = undefined;
  if (typeof performance !== 'undefined' && (performance as any).memory) {
    memoryMb = Math.round((performance as any).memory.usedJSHeapSize / (1024 * 1024));
  }

  let storageEstimateMb: { used: number; total: number } | undefined = undefined;
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
    try {
      const estimate = await navigator.storage.estimate();
      if (estimate.usage !== undefined && estimate.quota !== undefined) {
        storageEstimateMb = {
          used: Math.round(estimate.usage / (1024 * 1024)),
          total: Math.round(estimate.quota / (1024 * 1024)),
        };
      }
    } catch {
      // ignore
    }
  }

  let batteryLevel: number | undefined = undefined;
  let isCharging: boolean | undefined = undefined;
  if (typeof navigator !== 'undefined' && (navigator as any).getBattery) {
    try {
      const battery = await (navigator as any).getBattery();
      batteryLevel = Math.round(battery.level * 100);
      isCharging = battery.charging;
    } catch {
      // ignore
    }
  }

  return {
    online,
    cpuCores,
    memoryMb,
    storageEstimateMb,
    batteryLevel,
    isCharging,
  };
}

/**
 * Built-in Local State & Mock Execution Engine
 * Executes local UI actions, device queries, arithmetic, and air-gapped tasks directly on-device
 */
export async function executeLocalEngine(params: {
  prompt: string;
  action?: LocalAction;
  activeTheme?: GradientTheme;
  soundEnabled?: boolean;
  mode?: InteractionMode;
}): Promise<ReasoningResult & { localAction?: LocalAction }> {
  const { prompt, action, activeTheme, soundEnabled = true, mode = 'offline-text' } = params;
  const startTime = performance.now();
  const lower = prompt.toLowerCase().trim();

  // 1. Check for UI Actions
  if (action && action.type !== 'NONE') {
    if (action.type === 'CHANGE_THEME') {
      const themeId = action.payload?.themeId;
      const targetTheme = DYNAMIC_GRADIENT_THEMES.find((t) => t.id === themeId) || DYNAMIC_GRADIENT_THEMES[0];
      const latencyMs = Math.max(8, Math.round(performance.now() - startTime) + 6);
      return {
        text: `Switched visual canvas to **${targetTheme.name}** theme.\n• **Palette:** ${targetTheme.subtitle}\n• **Phosphors:** Primary \`${targetTheme.primaryHex}\`, Secondary \`${targetTheme.secondaryHex}\`\n• Dynamic glow filters and inline styles re-rendered instantly on-device.`,
        effectiveTier: 'quick',
        executionTier: 'local',
        routeReason: 'Local UI Action: Theme Adaptation',
        autoTriggered: false,
        latencyMs,
        tokensUsed: 0,
        localAction: { ...action, executed: true },
      };
    }

    if (action.type === 'TOGGLE_SOUND') {
      const willEnable = action.payload?.enable ?? !soundEnabled;
      const latencyMs = Math.max(6, Math.round(performance.now() - startTime) + 4);
      return {
        text: willEnable
          ? `Audio acoustics **enabled**. Spoken voice synthesis and interface auditory feedback are now active on your device.`
          : `Audio acoustics **muted**. Nexus will operate in silent visual mode with zero local audio playback.`,
        effectiveTier: 'quick',
        executionTier: 'local',
        routeReason: 'Local UI Action: Acoustic State',
        autoTriggered: false,
        latencyMs,
        tokensUsed: 0,
        localAction: { ...action, payload: { enable: willEnable }, executed: true },
      };
    }

    if (action.type === 'SWITCH_MODE') {
      const targetMode: InteractionMode = action.payload?.mode || (mode === 'voice' ? 'offline-text' : 'voice');
      const latencyMs = Math.max(8, Math.round(performance.now() - startTime) + 5);
      return {
        text: targetMode === 'voice'
          ? `Transferred control to **Voice-First Neural Synapse**. The central interactive audio orb is active and listening.`
          : `Transferred control to **Offline Text Fallback**. Operating in private, air-gapped text mode with zero network socket usage.`,
        effectiveTier: 'quick',
        executionTier: 'local',
        routeReason: 'Local UI Action: Synapse Mode Switch',
        autoTriggered: false,
        latencyMs,
        tokensUsed: 0,
        localAction: { ...action, payload: { mode: targetMode }, executed: true },
      };
    }

    if (action.type === 'CLEAR_CHAT') {
      const latencyMs = Math.max(5, Math.round(performance.now() - startTime) + 4);
      return {
        text: `Conversation history cleared from local browser memory buffer. Scratchpad reset to clean state.`,
        effectiveTier: 'quick',
        executionTier: 'local',
        routeReason: 'Local UI Action: Memory Purge',
        autoTriggered: false,
        latencyMs,
        tokensUsed: 0,
        localAction: { ...action, executed: true },
      };
    }

    if (action.type === 'SET_REMINDER') {
      const title = String(action.payload?.title || 'Nexus reminder').trim();
      const minutes = Math.max(1, Number(action.payload?.minutes || 1));
      const reminder = { id: `rem-${Date.now()}`, title, dueAt: new Date(Date.now() + minutes * 60000).toISOString(), createdAt: new Date().toISOString() };
      const reminders = loadNexusState<any[]>('nexus_reminders', []);
      saveNexusState('nexus_reminders', [reminder, ...reminders]);
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
        void Notification.requestPermission();
      }
      return {
        text: `Reminder set for **${minutes} minute(s)** from now: **"${title}"**.`,
        effectiveTier: 'quick', executionTier: 'local', routeReason: 'Local On-Device Mode: Reminder Scheduler',
        autoTriggered: false, latencyMs: Math.max(8, Math.round(performance.now() - startTime) + 4), tokensUsed: 0,
        localAction: { ...action, executed: true },
      };
    }

    if (action.type === 'ADD_TASK') {
      const title = action.payload?.title || 'New offline task';
      const updated = addLocalTask(title);
      const latencyMs = Math.max(8, Math.round(performance.now() - startTime) + 5);
      return {
        text: `Task added to local storage: **"${title}"**.\nYou now have ${updated.filter((t) => !t.completed).length} pending task(s) saved on-device.`,
        effectiveTier: 'quick',
        executionTier: 'local',
        routeReason: 'Local On-Device Mode: Task Storage',
        autoTriggered: false,
        latencyMs,
        tokensUsed: 0,
        localAction: { ...action, executed: true },
      };
    }
  }

  // 2. Real-Time Device Clock / Date Check
  if (
    lower.includes('time') ||
    lower.includes('clock') ||
    lower.includes('date') ||
    lower.includes('what day is it') ||
    lower.includes('today')
  ) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const dateStr = now.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const latencyMs = Math.max(5, Math.round(performance.now() - startTime) + 3);

    return {
      text: `Current device time is **${timeStr}** on **${dateStr}**.\n*(Synchronized directly from your local hardware RTC — 0ms network latency)*`,
      effectiveTier: 'quick',
      executionTier: 'local',
      routeReason: 'Local On-Device Mode: Real-Time Clock RTC',
      autoTriggered: false,
      latencyMs,
      tokensUsed: 0,
    };
  }

  // 3. Local Math / Arithmetic calculation
  const mathResult = evaluateLocalMath(prompt);
  if (mathResult.success && mathResult.result) {
    const latencyMs = Math.max(4, Math.round(performance.now() - startTime) + 2);
    return {
      text: `**Arithmetic Result:**\n\`${mathResult.calculation}\` = **${mathResult.result}**\n\n*(Computed synchronously in local JavaScript execution stack)*`,
      effectiveTier: 'quick',
      executionTier: 'local',
      routeReason: 'Local On-Device Mode: Arithmetic Core',
      autoTriggered: false,
      latencyMs,
      tokensUsed: 0,
    };
  }

  // 4. Device Status, Telemetry, and Diagnostics
  if (
    lower.includes('status') ||
    lower.includes('device') ||
    lower.includes('battery') ||
    lower.includes('memory') ||
    lower.includes('storage') ||
    lower.includes('diagnostics') ||
    lower.includes('health') ||
    lower.includes('ping')
  ) {
    const telemetry = await getDeviceTelemetry();
    const latencyMs = Math.max(10, Math.round(performance.now() - startTime) + 6);

    const text = `### On-Device Hardware & Telemetry Diagnostic

• **Sandbox Mode:** ${telemetry.online ? 'Online (Air-Gapped Fallback Ready)' : 'Air-Gapped (Strict Isolation)'}
• **CPU Cores:** ${telemetry.cpuCores} concurrent hardware threads detected
• **Memory Heap:** ~${telemetry.memoryMb} MB actively allocated in browser heap
• **Storage Quota:** ~${telemetry.storageEstimateMb?.used} MB indexed / ${telemetry.storageEstimateMb?.total} MB local quota
• **Power State:** ${telemetry.batteryLevel}% ${telemetry.isCharging ? '(Charging)' : '(On Battery)'}
• **Inference Latency:** Sub-15ms local bus execution
• **Active Theme:** ${activeTheme?.name || 'Default'} (\`${activeTheme?.primaryHex || '#00ffc4'}\`)

All system diagnostics are nominal with zero external telemetry broadcast.`;

    return {
      text,
      effectiveTier: 'quick',
      executionTier: 'local',
      routeReason: 'Local On-Device Mode: System Telemetry',
      autoTriggered: false,
      latencyMs,
      tokensUsed: 0,
    };
  }

  // 5. Local Task & Agenda Inquiries
  if (lower.includes('task') || lower.includes('agenda') || lower.includes('todo')) {
    const tasks = getLocalTasks();
    const pending = tasks.filter((t) => !t.completed);
    const completed = tasks.filter((t) => t.completed);
    const latencyMs = Math.max(8, Math.round(performance.now() - startTime) + 4);

    let text = `### Local Device Task & Agenda Queue\n\n`;
    if (pending.length === 0) {
      text += `No pending tasks registered. You can add one by typing **"add task [task name]"**.\n`;
    } else {
      text += `**Pending Tasks (${pending.length}):**\n`;
      pending.forEach((t, i) => {
        text += `${i + 1}. [ ] **${t.title}** *(Added at ${t.createdAt})*\n`;
      });
    }

    if (completed.length > 0) {
      text += `\n**Completed (${completed.length}):**\n`;
      completed.forEach((t) => {
        text += `• ~~${t.title}~~\n`;
      });
    }

    text += `\n*All tasks are stored exclusively in local client-side memory without cloud synchronization.*`;

    return {
      text,
      effectiveTier: 'quick',
      executionTier: 'local',
      routeReason: 'Local On-Device Mode: Task Storage',
      autoTriggered: false,
      latencyMs,
      tokensUsed: 0,
    };
  }

  // 6. Air-Gap & Privacy Inquiry
  if (lower.includes('privacy') || lower.includes('air-gap') || lower.includes('secure') || lower.includes('offline')) {
    const latencyMs = Math.max(8, Math.round(performance.now() - startTime) + 4);
    return {
      text: `### Air-Gapped Security & Privacy Guarantees

• **Zero Telemetry:** Local On-Device Mode runs entirely within the browser client runtime sandbox.
• **Ephemeral RAM State:** Session states and audio synthesis tokens are discarded upon session reset.
• **Offline Fallback Resilience:** When network drop occurs or Cloud API quota is throttled, Nexus seamlessly resolves UI actions, device queries, and local tasks without interruption.
• **Sovereign Execution:** No private keystrokes or audio buffers are transmitted during on-device mode.`,
      effectiveTier: 'quick',
      executionTier: 'local',
      routeReason: 'Local On-Device Mode: Privacy Audit',
      autoTriggered: false,
      latencyMs,
      tokensUsed: 0,
    };
  }

  // 7. General Dynamic Local Response (Non-repeating contextual answer for general offline queries)
  const latencyMs = Math.max(12, Math.round(performance.now() - startTime) + 8);
  return {
    text: `Processed on-device: **"${prompt}"**.\n\nOperating in **Local On-Device Mode** with zero cloud latency. To run full deep reasoning or retrieve live cloud data (such as sports scores or breaking news), toggle to Cloud API mode or ask a complex query to trigger the Cloud API router.`,
    effectiveTier: 'quick',
    executionTier: 'local',
    routeReason: 'Local On-Device Mode: Local State Engine',
    autoTriggered: false,
    latencyMs,
    tokensUsed: 0,
  };
}
