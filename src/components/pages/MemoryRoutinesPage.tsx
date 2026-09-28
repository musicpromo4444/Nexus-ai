import React, { useState, useEffect } from 'react';
import {
  ChevronLeft,
  Sparkles,
  Lock,
  Unlock,
  Trash2,
  Plus,
  Clock,
  Zap,
  Play,
  Check,
  ShieldCheck,
  RotateCcw,
  Sliders,
  Calendar,
  X,
  Volume2
} from 'lucide-react';
import { GradientTheme } from '../../types';
import { playUiSound } from '../../utils/audio';
import { loadNexusState, saveNexusState } from '../../utils/persistence';

interface MemoryItem {
  id: string;
  category: 'Communication' | 'Work Context' | 'Schedule' | 'Preferences';
  title: string;
  content: string;
  isLocked: boolean;
  createdAt: string;
}

interface RoutineItem {
  id: string;
  title: string;
  trigger: string;
  triggerType: 'schedule' | 'voice' | 'event';
  description: string;
  prompt: string;
  enabled: boolean;
}

interface MemoryRoutinesPageProps {
  activeTheme: GradientTheme;
  onBackToAssistant: () => void;
  onRunRoutinePrompt: (prompt: string) => void;
  soundEnabled: boolean;
}

export const MemoryRoutinesPage: React.FC<MemoryRoutinesPageProps> = ({
  activeTheme,
  onBackToAssistant,
  onRunRoutinePrompt,
  soundEnabled,
}) => {
  // Memories state with localStorage persistence
  const [memories, setMemories] = useState<MemoryItem[]>(() => loadNexusState('nexus_memories_vault', []));

  // Routines state with localStorage persistence
  const [routines, setRoutines] = useState<RoutineItem[]>(() => loadNexusState('nexus_custom_routines', []));

  const [activeRunId, setActiveRunId] = useState<string | null>(null);
  const [isAddingMemory, setIsAddingMemory] = useState(false);
  const [isAddingRoutine, setIsAddingRoutine] = useState(false);

  // New Memory Form
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<MemoryItem['category']>('Preferences');
  const [newIsLocked, setNewIsLocked] = useState(false);

  // New Routine Form
  const [newRoutineTitle, setNewRoutineTitle] = useState('');
  const [newRoutineTrigger, setNewRoutineTrigger] = useState('Daily at 9:00 AM');
  const [newRoutineDesc, setNewRoutineDesc] = useState('');
  const [newRoutinePrompt, setNewRoutinePrompt] = useState('');

  // Persist memories safely across refreshes.
  useEffect(() => {
    saveNexusState('nexus_memories_vault', memories);
  }, [memories]);

  // Persist routines safely across refreshes.
  useEffect(() => {
    saveNexusState('nexus_custom_routines', routines);
  }, [routines]);

  const handleToggleLock = (id: string) => {
    if (soundEnabled) playUiSound('toggle');
    setMemories((prev) =>
      prev.map((m) => (m.id === id ? { ...m, isLocked: !m.isLocked } : m))
    );
  };

  const handleDeleteMemory = (id: string) => {
    if (soundEnabled) playUiSound('click');
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  const handleClearUnlocked = () => {
    if (soundEnabled) playUiSound('click');
    setMemories((prev) => prev.filter((m) => m.isLocked));
  };

  const handleResetMemories = () => {
    if (soundEnabled) playUiSound('activate');
    setMemories([]);
  };

  const handleAddMemorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;
    if (soundEnabled) playUiSound('activate');

    const newItem: MemoryItem = {
      id: `mem-${Date.now()}`,
      title: newTitle.trim(),
      content: newContent.trim(),
      category: newCategory,
      isLocked: newIsLocked,
      createdAt: 'Just now',
    };

    setMemories([newItem, ...memories]);
    setNewTitle('');
    setNewContent('');
    setIsAddingMemory(false);
  };

  const handleToggleRoutine = (id: string) => {
    if (soundEnabled) playUiSound('toggle');
    setRoutines((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const handleRunRoutine = (id: string, prompt: string) => {
    if (soundEnabled) playUiSound('activate');
    setActiveRunId(id);
    setTimeout(() => {
      onRunRoutinePrompt(prompt);
    }, 350);
  };

  const handleAddRoutineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoutineTitle.trim() || !newRoutinePrompt.trim()) return;
    if (soundEnabled) playUiSound('activate');

    const newRoutine: RoutineItem = {
      id: `rt-${Date.now()}`,
      title: newRoutineTitle.trim(),
      trigger: newRoutineTrigger.trim(),
      triggerType: 'schedule',
      description: newRoutineDesc.trim() || 'Custom user automation',
      prompt: newRoutinePrompt.trim(),
      enabled: true,
    };

    setRoutines([...routines, newRoutine]);
    setNewRoutineTitle('');
    setNewRoutineDesc('');
    setNewRoutinePrompt('');
    setIsAddingRoutine(false);
  };

  const lockedCount = memories.filter((m) => m.isLocked).length;

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 max-w-6xl mx-auto w-full space-y-10 animate-in fade-in duration-300">
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
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide uppercase">
              MEMORY & ROUTINES
            </h1>
            <p className="text-sm text-slate-400">
              Manage what your assistant remembers about you and configure automated daily workflows.
            </p>
          </div>
        </div>
      </div>

      {/* SECTION 1: Assistant Memory Vault */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Assistant Memory Vault
            </h2>
            <span
              className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
              style={{ background: activeTheme.badgeBg, color: activeTheme.primaryHex }}
            >
              {memories.length} Stored ({lockedCount} Locked)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {memories.length > lockedCount && (
              <button
                onClick={handleClearUnlocked}
                className="text-xs text-slate-400 hover:text-rose-300 px-3 py-1.5 rounded-xl bg-white/[0.03] hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/20 transition-all flex items-center gap-1.5"
                title="Purge all memories not locked"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear Unlocked</span>
              </button>
            )}

            <button
              onClick={() => {
                if (soundEnabled) playUiSound('click');
                setIsAddingMemory(!isAddingMemory);
              }}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl text-white flex items-center gap-1.5 transition-all shadow-sm"
              style={{
                background: activeTheme.gradient,
                boxShadow: `0 0 12px ${activeTheme.glowRgbaSubtle}`,
              }}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Memory</span>
            </button>
          </div>
        </div>

        {/* Add Memory Inline Form */}
        {isAddingMemory && (
          <form
            onSubmit={handleAddMemorySubmit}
            className="p-5 rounded-2xl bg-white/[0.04] border border-white/15 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                <span>Save New Assistant Memory</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddingMemory(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Title / Topic</label>
                <input
                  type="text"
                  placeholder="e.g. Favorite Language, Communication Tone"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-400"
                >
                  <option value="Preferences">Preferences</option>
                  <option value="Communication">Communication</option>
                  <option value="Work Context">Work Context</option>
                  <option value="Schedule">Schedule</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Memory Instruction / Detail</label>
              <textarea
                placeholder="What should the assistant remember in future sessions?"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 resize-none"
                required
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={newIsLocked}
                  onChange={(e) => setNewIsLocked(e.target.checked)}
                  className="rounded border-white/20 bg-black/40 text-cyan-500 focus:ring-0"
                />
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  Lock memory to prevent automatic purge
                </span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingMemory(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-cyan-500 hover:bg-cyan-400 transition-colors shadow-sm"
                >
                  Save to Vault
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Memories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {memories.map((mem) => (
            <div
              key={mem.id}
              className={`p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between space-y-3 group ${
                mem.isLocked
                  ? 'bg-white/[0.04] border-white/15'
                  : 'bg-white/[0.02] border-white/5 hover:border-white/15 hover:bg-white/[0.03]'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/5 text-slate-400 border border-white/5">
                    {mem.category}
                  </span>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500">{mem.createdAt}</span>
                    <button
                      onClick={() => handleToggleLock(mem.id)}
                      className={`p-1.5 rounded-lg border transition-all ${
                        mem.isLocked
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                          : 'bg-white/5 border-white/5 text-slate-400 hover:text-white'
                      }`}
                      title={mem.isLocked ? 'Locked (Click to unlock)' : 'Unlocked (Click to lock)'}
                    >
                      {mem.isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleDeleteMemory(mem.id)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-rose-500/10 border border-white/5 hover:border-rose-500/20 text-slate-400 hover:text-rose-400 transition-all"
                      title="Delete this memory"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                  {mem.title}
                  {mem.isLocked && (
                    <span className="text-[10px] text-amber-400/80 font-normal px-1.5 py-0.2 rounded bg-amber-400/10 border border-amber-400/20">
                      Locked
                    </span>
                  )}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  "{mem.content}"
                </p>
              </div>

              <div className="pt-2 border-t border-white/[0.04] flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Stored in local browser vault
                </span>
                <span className={mem.isLocked ? 'text-amber-400/90' : 'text-slate-400'}>
                  {mem.isLocked ? 'Protected' : 'Auto-sync eligible'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {memories.length === 0 && (
          <div className="p-8 rounded-2xl bg-white/[0.02] border border-dashed border-white/10 text-center space-y-3">
            <p className="text-sm text-slate-400">Your memory vault is currently empty.</p>
            <button
              onClick={handleResetMemories}
              className="text-xs text-cyan-400 hover:underline inline-flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Restore default memory templates
            </button>
          </div>
        )}
      </section>

      {/* SECTION 2: Custom Routines & Automations */}
      <section className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Custom Routines & Automations
            </h2>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {routines.filter((r) => r.enabled).length} Active
            </span>
          </div>

          <button
            onClick={() => {
              if (soundEnabled) playUiSound('click');
              setIsAddingRoutine(!isAddingRoutine);
            }}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl text-white flex items-center gap-1.5 transition-all shadow-sm self-start sm:self-auto"
            style={{
              background: activeTheme.gradient,
              boxShadow: `0 0 12px ${activeTheme.glowRgbaSubtle}`,
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Routine</span>
          </button>
        </div>

        {/* Add Routine Inline Form */}
        {isAddingRoutine && (
          <form
            onSubmit={handleAddRoutineSubmit}
            className="p-5 rounded-2xl bg-white/[0.04] border border-white/15 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-cyan-400" />
                <span>Create New Custom Routine</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddingRoutine(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Routine Name</label>
                <input
                  type="text"
                  placeholder="e.g. Daily Standup Summary"
                  value={newRoutineTitle}
                  onChange={(e) => setNewRoutineTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 block">Trigger / Schedule</label>
                <input
                  type="text"
                  placeholder="e.g. Daily at 9:00 AM, Voice: 'Start Standup'"
                  value={newRoutineTrigger}
                  onChange={(e) => setNewRoutineTrigger(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Description</label>
              <input
                type="text"
                placeholder="Short description of what this automation accomplishes"
                value={newRoutineDesc}
                onChange={(e) => setNewRoutineDesc(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Assistant Prompt</label>
              <textarea
                placeholder="The exact prompt Nexus AI runs when this routine triggers..."
                value={newRoutinePrompt}
                onChange={(e) => setNewRoutinePrompt(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-400 resize-none"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingRoutine(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-slate-400 hover:text-white bg-white/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-cyan-500 hover:bg-cyan-400 transition-colors shadow-sm"
              >
                Create Routine
              </button>
            </div>
          </form>
        )}

        {/* Routines List */}
        <div className="space-y-3">
          {routines.map((routine) => {
            const isRunning = activeRunId === routine.id;
            return (
              <div
                key={routine.id}
                className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-1.5 max-w-xl">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                      {routine.title}
                    </h3>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-white/5 text-cyan-400 border border-cyan-500/20 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {routine.trigger}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {routine.description}
                  </p>

                  <div className="text-[11px] text-slate-400 bg-black/30 px-2.5 py-1 rounded-lg border border-white/5 inline-block font-mono">
                    "{routine.prompt}"
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-center">
                  {/* Run Now Button */}
                  <button
                    onClick={() => handleRunRoutine(routine.id, routine.prompt)}
                    disabled={isRunning}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white transition-all flex items-center gap-1.5 bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 hover:border-white/20 active:scale-95"
                    style={{
                      boxShadow: isRunning ? `0 0 16px ${activeTheme.glowRgbaSubtle}` : undefined,
                    }}
                  >
                    <Play className={`w-3.5 h-3.5 text-cyan-400 ${isRunning ? 'animate-spin' : ''}`} />
                    <span>{isRunning ? 'Running...' : 'Run Now'}</span>
                  </button>

                  {/* One-Tap Status Toggle Switch */}
                  <button
                    onClick={() => handleToggleRoutine(routine.id)}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none p-0.5 ${
                      routine.enabled ? 'bg-cyan-500' : 'bg-slate-700'
                    }`}
                    style={
                      routine.enabled
                        ? {
                            background: activeTheme.gradient,
                            boxShadow: `0 0 10px ${activeTheme.glowRgbaSubtle}`,
                          }
                        : undefined
                    }
                    title={routine.enabled ? 'Routine is active' : 'Routine is disabled'}
                  >
                    <div
                      className={`w-5 h-5 rounded-full bg-white transition-transform duration-200 shadow-md ${
                        routine.enabled ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
