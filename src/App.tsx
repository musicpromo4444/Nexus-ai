import React, { useState, useEffect } from 'react';
import {
  AppPage,
  GradientTheme,
  InteractionMode,
  VoiceState,
  ChatMessage,
  ChatSession,
  ComputeTier,
  LocalAction,
} from './types';
import { DYNAMIC_GRADIENT_THEMES } from './constants/themes';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { VoiceInterface } from './components/VoiceInterface';
import { ChatInterface } from './components/ChatInterface';
import { ThemeCustomizer } from './components/ThemeCustomizer';
import { PagesDrawer } from './components/PagesDrawer';
import { SubscriptionPage } from './components/pages/SubscriptionPage';
import { RecommendationPage } from './components/pages/RecommendationPage';
import { CreationPage } from './components/pages/CreationPage';
import { ProfilePage } from './components/pages/ProfilePage';
import { MemoryRoutinesPage } from './components/pages/MemoryRoutinesPage';
import { SettingsPage } from './components/pages/SettingsPage';
import { DevicePage } from './components/pages/DevicePage';
import { playUiSound } from './utils/audio';
import { loadNexusState, saveNexusState } from './utils/persistence';
import { dispatchHybridReasoning } from './services/reasoningEngine';

const EMPTY_SESSION: ChatSession = {
  id: 'session-empty',
  title: 'New chat',
  category: 'today',
  timestamp: 'Just now',
  messageCount: 0,
};

export default function App() {
  // Theme state: defaults to Hyper Violet (first of 7 dynamic gradients)
  const [activeTheme, setActiveTheme] = useState<GradientTheme>(DYNAMIC_GRADIENT_THEMES[0]);
  const [glowIntensity, setGlowIntensity] = useState<'subtle' | 'vibrant' | 'radiant'>('vibrant');
  const [ambientAuraEnabled, setAmbientAuraEnabled] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isThemeCustomizerOpen, setIsThemeCustomizerOpen] = useState<boolean>(false);
  const [isPagesDrawerOpen, setIsPagesDrawerOpen] = useState<boolean>(false);
  const [activePage, setActivePage] = useState<AppPage>('assistant');

  // Hybrid Reasoning Engine state
  const [computeTier, setComputeTier] = useState<ComputeTier>('deep');
  const [autoDetectReasoning, setAutoDetectReasoning] = useState<boolean>(true);

  // Interaction Mode: 'voice' | 'offline-text'
  const [mode, setMode] = useState<InteractionMode>('voice');
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');

  // Sidebar navigation state
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Chat sessions & active messages
  const [sessions, setSessions] = useState<ChatSession[]>(() => loadNexusState('nexus_chat_sessions', [EMPTY_SESSION]));
  const [activeSessionId, setActiveSessionId] = useState<string>('session-empty');
  const [sessionMessages, setSessionMessages] = useState<Record<string, ChatMessage[]>>(() => loadNexusState('nexus_chat_messages', { 'session-empty': [] }));

  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Local reminder watcher: fires due reminders while Nexus is open.
  useEffect(() => {
    const handler = (event: Event) => {
      const page = (event as CustomEvent<{ page?: string }>).detail?.page;
      if (page) setActivePage(page as any);
    };
    window.addEventListener('nexus:navigate', handler);
    return () => window.removeEventListener('nexus:navigate', handler);
  }, []);

  useEffect(() => {
    const tick = () => {
      const reminders = loadNexusState<Array<{ id: string; title: string; dueAt: string; firedAt?: string }>>('nexus_reminders', []);
      const now = Date.now();
      let changed = false;
      const updated = reminders.map((reminder) => {
        if (!reminder.firedAt && Date.parse(reminder.dueAt) <= now) {
          changed = true;
          if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
            new Notification('Nexus reminder', { body: reminder.title });
          }
          return { ...reminder, firedAt: new Date().toISOString() };
        }
        return reminder;
      });
      if (changed) saveNexusState('nexus_reminders', updated);
    };
    tick();
    const timer = window.setInterval(tick, 15000);
    return () => window.clearInterval(timer);
  }, []);

  // Persist conversations locally so Nexus survives refreshes and app restarts.
  useEffect(() => {
    saveNexusState('nexus_chat_sessions', sessions);
  }, [sessions]);

  useEffect(() => {
    saveNexusState('nexus_chat_messages', sessionMessages);
  }, [sessionMessages]);

  // Keep sidebar counts synchronized with real conversation data.
  useEffect(() => {
    setSessions((prev) => prev.map((session) => ({
      ...session,
      messageCount: (sessionMessages[session.id] || []).length,
      timestamp: session.id === activeSessionId ? 'Just now' : session.timestamp,
    })));
  }, [sessionMessages, activeSessionId]);

  // Active messages list
  const currentMessages = sessionMessages[activeSessionId] || [];

  // Update dynamic CSS variables on body for smooth ambient glows
  useEffect(() => {
    document.documentElement.style.setProperty('--primary-glow', activeTheme.glowRgba);
    document.documentElement.style.setProperty('--primary-hex', activeTheme.primaryHex);
  }, [activeTheme]);

  // Handle mode toggle between voice-first and offline-text
  const handleToggleMode = (newMode: InteractionMode) => {
    setMode(newMode);
    if (newMode === 'voice') {
      setVoiceState('idle');
    }
  };

  // Create a new session
  const handleNewSession = () => {
    const newId = `session-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: `Nexus Session ${sessions.length + 1}`,
      category: 'today',
      timestamp: 'Just now',
      messageCount: 0,
    };

    setSessions([newSession, ...sessions]);
    setSessionMessages((prev) => ({ ...prev, [newId]: [] }));
    setActiveSessionId(newId);
  };

  // Delete a session
  const handleDeleteSession = (idToDelete: string) => {
    const updated = sessions.filter((s) => s.id !== idToDelete);
    setSessions(updated);
    if (activeSessionId === idToDelete && updated.length > 0) {
      setActiveSessionId(updated[0].id);
    }
  };

  // Handle local actions triggered by on-device mode
  const handleLocalAction = (action: LocalAction) => {
    if (action.type === 'CHANGE_THEME' && action.payload?.themeId) {
      const found = DYNAMIC_GRADIENT_THEMES.find((t) => t.id === action.payload.themeId);
      if (found) {
        setActiveTheme(found);
      }
    } else if (action.type === 'TOGGLE_SOUND') {
      const enable = action.payload?.enable ?? !soundEnabled;
      setSoundEnabled(enable);
    } else if (action.type === 'SWITCH_MODE' && action.payload?.mode) {
      setMode(action.payload.mode);
    } else if (action.type === 'CLEAR_CHAT') {
      setSessionMessages((prev) => ({
        ...prev,
        [activeSessionId]: [],
      }));
    }
  };

  // Handle user text message send with Dual-Tier Execution Router
  const handleSendMessage = async (text: string): Promise<ChatMessage | null> => {
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: nowStr,
      mode,
    };

    // Append user message immediately
    setSessionMessages((prev) => ({
      ...prev,
      [activeSessionId]: [...(prev[activeSessionId] || []), userMsg],
    }));

    setIsGenerating(true);

    try {
      // Execute through Dual-Tier Execution Router (Local Engine vs. Cloud API Fallback Router)
      const result = await dispatchHybridReasoning({
        prompt: text,
        computeTier,
        autoDetect: autoDetectReasoning,
        mode,
        activeTheme,
        soundEnabled,
        onLocalAction: handleLocalAction,
      });

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: result.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode,
        computeTier: result.effectiveTier,
        executionTier: result.executionTier,
        routeReason: result.routeReason,
        sources: result.sources,
        thoughts: result.thoughts,
        reasoningSteps: result.reasoningSteps,
        autoTriggered: result.autoTriggered,
        latencyMs: result.latencyMs,
        tokensUsed: result.tokensUsed,
        codeSnippet: result.codeSnippet,
      };

      setSessionMessages((prev) => ({
        ...prev,
        [activeSessionId]: [...(prev[activeSessionId] || []), assistantMsg],
      }));

      return assistantMsg;
    } catch {
      // Graceful fallback if anything unexpected occurs
      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: `I couldn't complete that request because the AI service is unavailable right now. You can still use local actions such as reminders, tasks, time, and settings.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mode,
        computeTier,
        executionTier: 'local',
        routeReason: 'Service unavailable: local fallback',
        
        latencyMs: 12,
      };

      setSessionMessages((prev) => ({
        ...prev,
        [activeSessionId]: [...(prev[activeSessionId] || []), assistantMsg],
      }));

      return assistantMsg;
    } finally {
      setIsGenerating(false);
      if (soundEnabled) {
        playUiSound('message');
      }
    }
  };

  // Handle voice query
  const handleSendVoiceQuery = async (query: string) => {
    return await handleSendMessage(query);
  };

  // Clear messages for active session
  const handleClearMessages = () => {
    setSessionMessages((prev) => ({
      ...prev,
      [activeSessionId]: [],
    }));
  };

  // Intensity glow modifier for styling
  const glowOpacity =
    glowIntensity === 'subtle' ? '0.25' : glowIntensity === 'radiant' ? '0.75' : '0.45';

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0b0d13] text-[#e2e8f0] relative font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Dynamic Ambient Background Aurora Mesh */}
      {ambientAuraEnabled && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
          <div
            className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[140px] transition-all duration-1000"
            style={{
              background: activeTheme.primaryHex,
              opacity: glowOpacity,
              transform: 'scale(1)',
            }}
          />
          <div
            className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full blur-[160px] transition-all duration-1000"
            style={{
              background: activeTheme.secondaryHex,
              opacity: Number(glowOpacity) * 0.7,
              transform: 'scale(1)',
            }}
          />
          {/* Subtle noise grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />
        </div>
      )}

      {/* Sleek Minimalist Sidebar */}
      <Sidebar
        activeTheme={activeTheme}
        mode={mode}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        soundEnabled={soundEnabled}
        onOpenThemeCustomizer={() => setIsThemeCustomizerOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative z-10">
        {/* Top Header with Mode Toggle, Theme Selector, and Hybrid Reasoning Switch */}
        <Header
          activeTheme={activeTheme}
          mode={mode}
          onToggleMode={handleToggleMode}
          voiceState={voiceState}
          onOpenThemeCustomizer={() => setIsThemeCustomizerOpen(true)}
          isPagesDrawerOpen={isPagesDrawerOpen}
          onTogglePagesDrawer={() => setIsPagesDrawerOpen(!isPagesDrawerOpen)}
          soundEnabled={soundEnabled}
          computeTier={computeTier}
          onToggleComputeTier={setComputeTier}
          autoDetectReasoning={autoDetectReasoning}
          onToggleAutoDetect={() => setAutoDetectReasoning(!autoDetectReasoning)}
          activePage={activePage}
          onSelectPage={setActivePage}
        />

        {/* View Switcher: Active Core Page vs Assistant Workspace */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">
          {activePage === 'subscription' && (
            <SubscriptionPage
              activeTheme={activeTheme}
              onBackToAssistant={() => setActivePage('assistant')}
              soundEnabled={soundEnabled}
            />
          )}

          {activePage === 'recommendation' && (
            <RecommendationPage
              activeTheme={activeTheme}
              onBackToAssistant={() => setActivePage('assistant')}
              onRunWorkflowPrompt={(prompt, deep) => {
                setActivePage('assistant');
                setMode('offline-text');
                if (deep) setComputeTier('deep');
                handleSendMessage(prompt);
              }}
              soundEnabled={soundEnabled}
            />
          )}

          {activePage === 'creation' && (
            <CreationPage
              activeTheme={activeTheme}
              onBackToAssistant={() => setActivePage('assistant')}
              soundEnabled={soundEnabled}
            />
          )}

          {activePage === 'profile' && (
            <ProfilePage
              activeTheme={activeTheme}
              onBackToAssistant={() => setActivePage('assistant')}
              soundEnabled={soundEnabled}
            />
          )}

          {(activePage === 'memory-routines' || activePage === 'neural-modules') && (
            <MemoryRoutinesPage
              activeTheme={activeTheme}
              onBackToAssistant={() => setActivePage('assistant')}
              onRunRoutinePrompt={(prompt) => {
                setActivePage('assistant');
                setMode('offline-text');
                handleSendMessage(prompt);
              }}
              soundEnabled={soundEnabled}
            />
          )}

          {activePage === 'device' && (
            <DevicePage activeTheme={activeTheme} onBackToAssistant={() => setActivePage('assistant')} soundEnabled={soundEnabled} />
          )}

          {activePage === 'settings' && (
            <SettingsPage
              activeTheme={activeTheme}
              onSelectTheme={setActiveTheme}
              onBackToAssistant={() => setActivePage('assistant')}
              soundEnabled={soundEnabled}
              onToggleSound={() => setSoundEnabled(!soundEnabled)}
              ambientAuraEnabled={ambientAuraEnabled}
              onToggleAmbientAura={() => setAmbientAuraEnabled(!ambientAuraEnabled)}
              computeTier={computeTier}
              onToggleComputeTier={setComputeTier}
              onOpenThemeCustomizer={() => setIsThemeCustomizerOpen(true)}
            />
          )}

          {activePage === 'assistant' && (
            mode === 'voice' ? (
              <VoiceInterface
                activeTheme={activeTheme}
                voiceState={voiceState}
                setVoiceState={setVoiceState}
                onSwitchToOfflineText={() => handleToggleMode('offline-text')}
                soundEnabled={soundEnabled}
                onSendVoiceQuery={handleSendVoiceQuery}
                computeTier={computeTier}
                onToggleComputeTier={setComputeTier}
                autoDetectReasoning={autoDetectReasoning}
              />
            ) : (
              <ChatInterface
                activeTheme={activeTheme}
                messages={currentMessages}
                onSendMessage={handleSendMessage}
                onClearMessages={handleClearMessages}
                onSwitchToVoice={() => handleToggleMode('voice')}
                soundEnabled={soundEnabled}
                isGenerating={isGenerating}
                computeTier={computeTier}
                onToggleComputeTier={setComputeTier}
                autoDetectReasoning={autoDetectReasoning}
                onToggleAutoDetect={() => setAutoDetectReasoning(!autoDetectReasoning)}
              />
            )
          )}
        </div>
      </main>

      {/* Sleek Floating Pages & Navigation Overlay Drawer */}
      <PagesDrawer
        isOpen={isPagesDrawerOpen}
        onClose={() => setIsPagesDrawerOpen(false)}
        activePage={activePage}
        onSelectPage={(page) => {
          setActivePage(page);
          setIsPagesDrawerOpen(false);
        }}
        activeTheme={activeTheme}
        onSelectTheme={setActiveTheme}
        soundEnabled={soundEnabled}
      />

      {/* Theme Customizer Modal */}
      <ThemeCustomizer
        isOpen={isThemeCustomizerOpen}
        onClose={() => setIsThemeCustomizerOpen(false)}
        activeTheme={activeTheme}
        onSelectTheme={setActiveTheme}
        glowIntensity={glowIntensity}
        onChangeGlowIntensity={setGlowIntensity}
        ambientAuraEnabled={ambientAuraEnabled}
        onToggleAmbientAura={() => setAmbientAuraEnabled(!ambientAuraEnabled)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
      />
    </div>
  );
}
