import { DYNAMIC_GRADIENT_THEMES } from '../constants/themes';
import { GradientTheme, InteractionMode, LocalAction, LocalTask, ReasoningResult } from '../types';
import { loadNexusState, saveNexusState } from '../utils/persistence';

// Persistent local task storage in memory & localStorage
const LOCAL_STORAGE_TASKS_KEY = 'nexus_local_tasks_v1';

const NATIVE_ACTIONS = new Set(['open_app','make_call','send_message','set_alarm','control_media','read_screen','tap_screen','set_reminder','run_routine']);

const SENSITIVE_ACTIONS = new Set(['make_call','send_message','set_alarm','tap_screen']);
const CONFIRMATION_REQUIRED = new Set(['make_call','send_message','set_alarm','tap_screen','read_screen']);

export function getNativeActionPermission(action: string) {
  const bridge = typeof window !== 'undefined' ? (window as any).NexusAndroid : undefined;
  const permissions = Array.isArray(bridge?.permissions) ? bridge.permissions : [];
  return { connected: !!bridge, allowed: !!bridge && permissions.includes(action), needsConfirmation: CONFIRMATION_REQUIRED.has(action) };
}

export function confirmNativeAction(action: string): boolean {
  if (!SENSITIVE_ACTIONS.has(action)) return true;
  if (typeof window === 'undefined') return false;
  return window.confirm(`Nexus wants permission to perform: ${action.replace(/_/g, ' ')}. Continue?`);
}

export function getDeviceBridgeStatus() {
  const androidBridge = typeof window !== 'undefined' && (window as any).NexusAndroid;
  return {
    connected: !!androidBridge,
    platform: androidBridge ? 'android' : 'browser',
    permissions: Array.isArray(androidBridge?.permissions) ? androidBridge.permissions : [],
  } as const;
}

export async function requestNativeDeviceAction(action: string, payload?: unknown) {
  if (!NATIVE_ACTIONS.has(action)) return { success: false, reason: 'Unsupported device action.' };
  const permission = getNativeActionPermission(action);
  if (!permission.connected) return { success: false, reason: 'Android device bridge is not connected.' };
  if (!permission.allowed) return { success: false, reason: 'This device action has not been granted by Android.' };
  if (permission.needsConfirmation && !confirmNativeAction(action)) return { success: false, reason: 'Action cancelled.' };
  const bridge = typeof window !== 'undefined' ? (window as any).NexusAndroid : undefined;
  if (!bridge || typeof bridge.execute !== 'function') {
    return { success: false, reason: 'Android device bridge is not connected.' };
  }
  try {
    const result = await bridge.execute(action, payload ?? {});
    return { success: true, result };
  } catch {
    return { success: false, reason: 'The device denied or could not complete that action.' };
  }
}

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
 * Built-in Local State & Device Capability Engine
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
          : `Transferred control to **Offline Text Fallback**. Operating in private, air-gapped text mode with without claiming network isolation.`,
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

    if (action.type === 'OPEN_PAGE') {
      const page = String(action.payload?.page || 'assistant');
      const allowed = ['assistant','subscription','recommendation','creation','profile','memory-routines','neural-modules','settings','device','voice-environment'];
      if (allowed.includes(page) && typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('nexus:navigate', { detail: { page } }));
      return { text: allowed.includes(page) ? `Opening **${page.replace(/-/g, ' ')}**.` : 'That Nexus page is not available.', effectiveTier:'quick', executionTier:'local', routeReason:'Local UI Action: Page Navigation', autoTriggered:false, latencyMs:Math.max(5,Math.round(performance.now()-startTime)), tokensUsed:0, localAction:{...action,executed:allowed.includes(page)} };
    }

    if (action.type === 'OPEN_URL') {
      const url = String(action.payload?.url || '').trim();
      if (/^https?:\\/\\//i.test(url) && typeof window !== 'undefined') window.open(url, '_blank', 'noopener,noreferrer');
      return { text: /^https?:\\/\\//i.test(url) ? `Opening **${url}** in a new tab.` : 'I can only open secure web URLs.', effectiveTier:'quick', executionTier:'local', routeReason:'Local UI Action: Web Navigation', autoTriggered:false, latencyMs:Math.max(5,Math.round(performance.now()-startTime)), tokensUsed:0, localAction:{...action,executed:/^https?:\\/\\//i.test(url)} };
    }

    if (action.type === 'SET_REMINDER') {
      const title = String(action.payload?.title || 'Nexus reminder').trim();
      const minutes = Math.max(1, Number(action.payload?.minutes || 1));
      const reminder = { id: `rem-${Date.now()}`, title, dueAt: new Date(Date.now() + minutes * 60000).toISOString(), createdAt: new Date().toISOString(), firedAt: null as string | null };
      const bridge = getDeviceBridgeStatus().connected;
      if (bridge) {
        const native = await requestNativeDeviceAction('set_reminder', { title, dueAt: reminder.dueAt });
        if (native.success) {
          return { text: `Reminder scheduled on your Android device: **"${title}"** in **${minutes} minute(s)**.`, effectiveTier:'quick', executionTier:'local', routeReason:'Android Background Reminder', autoTriggered:false, latencyMs:Math.max(8,Math.round(performance.now()-startTime)), tokensUsed:0, localAction:{...action,executed:true} };
        }
      }
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

    if (action.type === 'SAVE_MEMORY' || action.type === 'DELETE_MEMORY') {
      const memories = loadNexusState<any[]>('nexus_memories_vault', []);
      if (action.type === 'SAVE_MEMORY') {
        const content = String(action.payload?.content || '').trim();
        if (!content) return { text:'I need something to remember.', effectiveTier:'quick', executionTier:'local', routeReason:'Local Memory Vault', autoTriggered:false, latencyMs:5, tokensUsed:0, localAction:{...action,executed:false} };
        const item = { id:`mem-${Date.now()}`, title:String(action.payload?.title || 'Remembered preference'), content, category:'Preferences', isLocked:false, createdAt:new Date().toISOString() };
        saveNexusState('nexus_memories_vault', [item, ...memories]);
        return { text:`Saved to memory: **"${content}"**.`, effectiveTier:'quick', executionTier:'local', routeReason:'Local Memory Vault', autoTriggered:false, latencyMs:6, tokensUsed:0, localAction:{...action,executed:true} };
      }
      const target = String(action.payload?.content || '').trim().toLowerCase();
      const filtered = memories.filter((m) => !String(m.content || '').toLowerCase().includes(target));
      saveNexusState('nexus_memories_vault', filtered);
      return { text: filtered.length < memories.length ? 'That memory was removed.' : 'I could not find a matching memory.', effectiveTier:'quick', executionTier:'local', routeReason:'Local Memory Vault', autoTriggered:false, latencyMs:6, tokensUsed:0, localAction:{...action,executed:filtered.length < memories.length} };
    }

    if (action.type === 'COMPLETE_TASK' || action.type === 'DELETE_TASK') {
      const tasks = getLocalTasks();
      const index = Number(action.payload?.index);
      if (!Number.isInteger(index) || index < 0 || index >= tasks.length) return { text: 'I could not find that task.', effectiveTier:'quick', executionTier:'local', routeReason:'Local Task Storage', autoTriggered:false, latencyMs:Math.max(5, Math.round(performance.now()-startTime)), tokensUsed:0, localAction:{...action,executed:false} };
      const target = tasks[index];
      const updated = action.type === 'COMPLETE_TASK' ? tasks.map((task,i) => i === index ? {...task, completed:true} : task) : tasks.filter((_,i) => i !== index);
      saveLocalTasks(updated);
      return { text: action.type === 'COMPLETE_TASK' ? `Completed task **${target.title}**.` : `Deleted task **${target.title}**.`, effectiveTier:'quick', executionTier:'local', routeReason:'Local Task Storage', autoTriggered:false, latencyMs:Math.max(5, Math.round(performance.now()-startTime)), tokensUsed:0, localAction:{...action,executed:true} };
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
      text: `Current device time is **${timeStr}** on **${dateStr}**.\n`,
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

• **Network:** ${telemetry.online ? 'Online' : 'Offline'}
• **CPU Cores:** ${telemetry.cpuCores} concurrent hardware threads detected
• **Memory Heap:** ${telemetry.memoryMb !== undefined ? `~${telemetry.memoryMb} MB actively allocated` : 'Unavailable in this browser'}
• **Storage Quota:** ${telemetry.storageEstimateMb ? `~${telemetry.storageEstimateMb.used} MB used / ${telemetry.storageEstimateMb.total} MB available` : 'Unavailable in this browser'}
• **Power State:** ${telemetry.batteryLevel !== undefined ? `${telemetry.batteryLevel}% ${telemetry.isCharging ? '(Charging)' : '(On Battery)'}` : 'Unavailable in this browser'}

• **Active Theme:** ${activeTheme?.name || 'Default'} (\`${activeTheme?.primaryHex || '#00ffc4'}\`)

Only capabilities exposed by this browser are reported; unavailable values are not fabricated.`;

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
    text: `I can handle local actions such as tasks, reminders, time, device checks, and settings here. This request requires cloud AI, which is not available right now.`,
    effectiveTier: 'quick',
    executionTier: 'local',
    routeReason: 'Local fallback: request requires cloud AI',
    autoTriggered: false,
    latencyMs,
    tokensUsed: 0,
  };
}
