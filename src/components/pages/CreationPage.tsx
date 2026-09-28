import React, { useState } from 'react';
import {
  Wand2,
  Image as ImageIcon,
  Video,
  FileText,
  Sparkles,
  ChevronLeft,
  Copy,
  Download,
  Play,
  RotateCw,
  Check,
  Zap,
  Layers,
  Sliders,
  Maximize2,
  Smartphone,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { GradientTheme } from '../../types';
import { playUiSound } from '../../utils/audio';

interface CreationPageProps {
  activeTheme: GradientTheme;
  onBackToAssistant: () => void;
  soundEnabled: boolean;
}

export const CreationPage: React.FC<CreationPageProps> = ({
  activeTheme,
  onBackToAssistant,
  soundEnabled,
}) => {
  // Picture generator state
  const [imagePrompt, setImagePrompt] = useState<string>('Cybernetic glowing obsidian orb floating over liquid mercury reflections, volumetric lighting, 8k');
  const [imageStyle, setImageStyle] = useState<string>('Cyberpunk Holographic');
  const [aspectRatio, setAspectRatio] = useState<string>('16:9');
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80');

  // Video generator state
  const [videoPrompt, setVideoPrompt] = useState<string>('Cinematic drone orbit around futuristic quantum computing spire with neon conduits pulse');
  const [cameraMove, setCameraMove] = useState<string>('Orbital Pan');
  const [motionSpeed, setMotionSpeed] = useState<number>(75);
  const [isSynthesizingVideo, setIsSynthesizingVideo] = useState<boolean>(false);
  const [videoStatus, setVideoStatus] = useState<string | null>(null);

  // Text / Code scaffold state
  const [textPrompt, setTextPrompt] = useState<string>('TypeScript WebSocket audio stream pipeline with backpressure buffer');
  const [textFormat, setTextFormat] = useState<'TypeScript' | 'Markdown' | 'Architecture'>('TypeScript');
  const [isScaffoldingText, setIsScaffoldingText] = useState<boolean>(false);
  const [generatedScaffold, setGeneratedScaffold] = useState<string | null>(
    `// Nexus Audio Stream Pipeline Buffer\nexport class AudioStreamBuffer {\n  private chunks: Float32Array[] = [];\n  constructor(private maxBufferSize: number = 4096) {}\n  public push(chunk: Float32Array): void {\n    if (this.chunks.length < this.maxBufferSize) {\n      this.chunks.push(chunk);\n    }\n  }\n}`
  );
  const [copiedScaffold, setCopiedScaffold] = useState<boolean>(false);
  const [showAppBuilder, setShowAppBuilder] = useState(false);
  const [appStep, setAppStep] = useState(0);
  const [appAnswers, setAppAnswers] = useState({ type: '', platforms: '', features: '', design: '' });
  const [appQuote, setAppQuote] = useState<number | null>(null);

  const appQuestions = [
    { key: 'type', title: 'What do you want to build?', options: ['Mobile app', 'Web app', 'Mobile + web app', 'AI app', 'Marketplace'] },
    { key: 'platforms', title: 'Where should it work?', options: ['Android', 'iPhone', 'Android + iPhone', 'Web + mobile'] },
    { key: 'features', title: 'What should it do?', options: ['Simple', 'Business', 'Advanced', 'AI-powered', 'Marketplace / payments'] },
    { key: 'design', title: 'What level of design do you want?', options: ['Clean & simple', 'Premium', 'Custom brand design'] },
  ] as const;

  const chooseAppAnswer = (value: string) => {
    const key = appQuestions[appStep].key;
    setAppAnswers((current) => ({ ...current, [key]: value }));
    if (appStep < appQuestions.length - 1) setAppStep((step) => step + 1);
    else {
      const complexity = value.includes('Custom') ? 100 : value.includes('Premium') ? 50 : 0;
      const featureValue = appAnswers.features.includes('Marketplace') || appAnswers.features.includes('AI') ? 150 : appAnswers.features.includes('Advanced') ? 100 : 0;
      const platformValue = appAnswers.platforms.includes('+') ? 100 : 0;
      setAppQuote(150 + complexity + featureValue + platformValue);
    }
  };

  const handleGenerateImage = () => {
    if (soundEnabled) playUiSound('activate');
    setIsGeneratingImage(true);
    setTimeout(() => {
      // Mock instant preview generation
      setGeneratedImage('https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80');
      setIsGeneratingImage(false);
      if (soundEnabled) playUiSound('glow');
    }, 1200);
  };

  const handleSynthesizeVideo = () => {
    if (soundEnabled) playUiSound('activate');
    setIsSynthesizingVideo(true);
    setVideoStatus('Analyzing scene trajectory...');
    setTimeout(() => {
      setVideoStatus('Rendering keyframes with 60 FPS motion...');
    }, 800);
    setTimeout(() => {
      setVideoStatus('Video clip ready (1080p 60fps ProRes encoded)');
      setIsSynthesizingVideo(false);
      if (soundEnabled) playUiSound('glow');
    }, 1800);
  };

  const handleScaffoldText = () => {
    if (soundEnabled) playUiSound('activate');
    setIsScaffoldingText(true);
    setTimeout(() => {
      setGeneratedScaffold(
        `// Generated by Nexus Creation Studio (${textFormat})\nexport interface NeuralStreamProtocol {\n  streamId: string;\n  sampleRateHz: 48000;\n  channels: 2;\n  latencyTargetMs: 12;\n  authenticate(token: string): Promise<boolean>;\n  dispatch(payload: Uint8Array): void;\n}`
      );
      setIsScaffoldingText(false);
      if (soundEnabled) playUiSound('glow');
    }, 900);
  };

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 max-w-6xl mx-auto w-full space-y-8 animate-in fade-in duration-300">
      {/* Navigation Header */}
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

      {/* ALWAYS-VISIBLE APP BUILDER */}
      <button
        onClick={() => { setShowAppBuilder(true); setAppStep(0); setAppQuote(null); if (soundEnabled) playUiSound('activate'); }}
        className="w-full p-5 rounded-2xl border border-white/15 bg-white/[0.05] hover:bg-white/[0.08] transition-all text-left flex items-center justify-between shadow-lg"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center border border-white/20" style={{ background: activeTheme.gradient }}>
            <Smartphone className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2"><h2 className="text-lg font-bold text-white">Create an App</h2><span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/20">FREE TO START</span></div>
            <p className="text-xs text-slate-400 mt-1">Tell Nexus what you want. Nexus asks the questions, plans it, then gives you the build price.</p>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-slate-400" />
      </button>

      {showAppBuilder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl bg-[#10151a] border border-white/10 p-6 shadow-2xl">
            {!appQuote ? <>
              <div className="flex items-center justify-between mb-5"><div><p className="text-[10px] uppercase tracking-widest text-slate-500">Create an App</p><h2 className="text-xl font-bold text-white mt-1">{appQuestions[appStep].title}</h2></div><button onClick={() => setShowAppBuilder(false)} className="text-slate-400">✕</button></div>
              <div className="space-y-2">{appQuestions[appStep].options.map((option) => <button key={option} onClick={() => chooseAppAnswer(option)} className="w-full p-3 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/25 text-left text-sm text-white flex items-center justify-between"><span>{option}</span><ArrowRight className="w-4 h-4 text-slate-500" /></button>)}</div>
              <p className="text-[10px] text-slate-500 mt-4">Step {appStep + 1} of {appQuestions.length} • No charge for this consultation.</p>
            </> : <>
              <div className="flex items-center gap-3 mb-5"><CheckCircle2 className="w-7 h-7 text-emerald-400" /><div><p className="text-[10px] uppercase tracking-widest text-emerald-400">Plan complete</p><h2 className="text-xl font-bold text-white">Your starting build price</h2></div></div>
              <div className="text-4xl font-black text-white mb-2">$ {appQuote.toLocaleString()}</div>
              <p className="text-sm text-slate-400">Starting at $150. The exact price is calculated from the requirements you gave Nexus.</p>
              <div className="mt-5 p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-xs text-slate-300 space-y-2">{Object.entries(appAnswers).map(([key, value]) => <div key={key} className="flex justify-between gap-3"><span className="capitalize text-slate-500">{key}</span><span>{value}</span></div>)}</div>
              <button onClick={() => setShowAppBuilder(false)} className="w-full mt-5 py-3 rounded-xl text-sm font-bold text-white" style={{ background: activeTheme.gradient }}>Continue with this app plan</button>
            </>}
          </div>
        </div>
      )}

      {/* Title */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/20 shadow-md"
            style={{
              background: activeTheme.gradient,
              boxShadow: `0 0 20px ${activeTheme.glowRgbaSubtle}`,
            }}
          >
            <Wand2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              Creation & Media Hub
            </h1>
            <p className="text-sm text-slate-400">
              Transform high-level prompts into visuals, motion cinematography, and architectural code scaffolds.
            </p>
          </div>
        </div>
      </div>

      {/* 3 Core Interactive Media Generation Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CARD 1: PROMPT-TO-PICTURE */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 flex flex-col justify-between space-y-4">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-pink-500/20 border border-pink-500/30 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4 text-pink-400" />
                </div>
                <h3 className="text-sm font-bold text-white">Prompt-to-Picture</h3>
              </div>
              <span className="text-[10px] font-semibold text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-full border border-pink-500/20">
                SDXL / Imagen
              </span>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-400">Creative Visual Prompt</label>
              <textarea
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                rows={3}
                className="mt-1 w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors resize-none"
                placeholder="Describe your scene or image..."
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-medium text-slate-400">Aesthetic Style</label>
                <select
                  value={imageStyle}
                  onChange={(e) => setImageStyle(e.target.value)}
                  className="mt-1 w-full p-2 rounded-lg bg-black/50 border border-white/10 text-xs text-slate-200 focus:outline-none"
                >
                  <option>Cyberpunk Holographic</option>
                  <option>Photorealistic 8K</option>
                  <option>Minimal 3D Render</option>
                  <option>Dark Synthwave</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-medium text-slate-400">Aspect Ratio</label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="mt-1 w-full p-2 rounded-lg bg-black/50 border border-white/10 text-xs text-slate-200 focus:outline-none"
                >
                  <option>16:9 (Landscape)</option>
                  <option>1:1 (Square)</option>
                  <option>9:16 (Portrait)</option>
                  <option>21:9 (Cinematic)</option>
                </select>
              </div>
            </div>

            {/* Generated Image Preview Area */}
            {generatedImage && (
              <div className="relative rounded-xl overflow-hidden border border-white/10 group aspect-video bg-black/40">
                <img
                  src={generatedImage}
                  alt="Generated visual"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-2.5">
                  <span className="text-[10px] text-white font-mono">{aspectRatio} • {imageStyle}</span>
                  <a
                    href={generatedImage}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1 rounded bg-white/20 hover:bg-white/30 text-white"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleGenerateImage}
            disabled={isGeneratingImage}
            className="w-full py-2.5 rounded-xl font-semibold text-xs text-white flex items-center justify-center gap-2 transition-all shadow-md"
            style={{
              background: activeTheme.gradient,
              boxShadow: `0 0 14px ${activeTheme.glowRgbaSubtle}`,
            }}
          >
            <Sparkles className={`w-4 h-4 ${isGeneratingImage ? 'animate-spin' : ''}`} />
            <span>{isGeneratingImage ? 'Synthesizing Visual...' : 'Generate Picture'}</span>
          </button>
        </div>

        {/* CARD 2: PROMPT-TO-VIDEO */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 flex flex-col justify-between space-y-4">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                  <Video className="w-4 h-4 text-cyan-400" />
                </div>
                <h3 className="text-sm font-bold text-white">Prompt-to-Video</h3>
              </div>
              <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
                Veo / Sora
              </span>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-400">Cinematic Motion Prompt</label>
              <textarea
                value={videoPrompt}
                onChange={(e) => setVideoPrompt(e.target.value)}
                rows={3}
                className="mt-1 w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors resize-none"
                placeholder="Describe scene dynamics and camera motion..."
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] font-medium text-slate-400">Camera Direction</label>
                <select
                  value={cameraMove}
                  onChange={(e) => setCameraMove(e.target.value)}
                  className="mt-1 w-full p-2 rounded-lg bg-black/50 border border-white/10 text-xs text-slate-200 focus:outline-none"
                >
                  <option>Orbital Pan</option>
                  <option>Dolly Zoom Forward</option>
                  <option>FPV Flythrough</option>
                  <option>Static High-Angle</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-medium text-slate-400">Motion Velocity</label>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={motionSpeed}
                  onChange={(e) => setMotionSpeed(Number(e.target.value))}
                  className="mt-2 w-full accent-cyan-400"
                />
              </div>
            </div>

            {/* Video Status / Preview Box */}
            <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 aspect-video flex flex-col items-center justify-center text-center space-y-2 relative overflow-hidden">
              <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <Play className="w-4 h-4 text-cyan-400 ml-0.5" />
              </div>
              <p className="text-xs text-slate-300 font-medium">
                {videoStatus || 'Camera motion path locked. 6-second render.'}
              </p>
              <span className="text-[10px] text-slate-500">ProRes 422 • 1080p 60fps</span>
            </div>
          </div>

          <button
            onClick={handleSynthesizeVideo}
            disabled={isSynthesizingVideo}
            className="w-full py-2.5 rounded-xl font-semibold text-xs text-white flex items-center justify-center gap-2 transition-all shadow-md"
            style={{
              background: activeTheme.gradient,
              boxShadow: `0 0 14px ${activeTheme.glowRgbaSubtle}`,
            }}
          >
            <Video className={`w-4 h-4 ${isSynthesizingVideo ? 'animate-spin' : ''}`} />
            <span>{isSynthesizingVideo ? 'Rendering Video Keyframes...' : 'Synthesize Video'}</span>
          </button>
        </div>

        {/* CARD 3: PROMPT-TO-TEXT & CODE SCAFFOLD */}
        <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-white/20 flex flex-col justify-between space-y-4">
          <div className="space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                  <FileText className="w-4 h-4 text-purple-400" />
                </div>
                <h3 className="text-sm font-bold text-white">Prompt-to-Code & Spec</h3>
              </div>
              <span className="text-[10px] font-semibold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                Nexus CoT
              </span>
            </div>

            <div>
              <label className="text-[11px] font-medium text-slate-400">Spec or Code Intent</label>
              <textarea
                value={textPrompt}
                onChange={(e) => setTextPrompt(e.target.value)}
                rows={3}
                className="mt-1 w-full p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors resize-none"
                placeholder="What code module or documentation spec to scaffold?"
              />
            </div>

            <div className="flex items-center gap-1.5">
              {(['TypeScript', 'Markdown', 'Architecture'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setTextFormat(fmt)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${
                    textFormat === fmt
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold'
                      : 'text-slate-400 bg-white/5 hover:text-white'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>

            {/* Generated Code Display with Copy Button */}
            {generatedScaffold && (
              <div className="relative rounded-xl overflow-hidden border border-white/10 bg-black/60 p-3 max-h-36 overflow-y-auto">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5">
                  <span className="text-[10px] text-purple-300 font-mono">module.ts</span>
                  <button
                    onClick={() => {
                      if (soundEnabled) playUiSound('click');
                      navigator.clipboard.writeText(generatedScaffold);
                      setCopiedScaffold(true);
                      setTimeout(() => setCopiedScaffold(false), 2000);
                    }}
                    className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-white"
                  >
                    {copiedScaffold ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedScaffold ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="text-[11px] text-slate-300 font-mono leading-relaxed overflow-x-auto whitespace-pre">
                  {generatedScaffold}
                </pre>
              </div>
            )}
          </div>

          <button
            onClick={handleScaffoldText}
            disabled={isScaffoldingText}
            className="w-full py-2.5 rounded-xl font-semibold text-xs text-white flex items-center justify-center gap-2 transition-all shadow-md"
            style={{
              background: activeTheme.gradient,
              boxShadow: `0 0 14px ${activeTheme.glowRgbaSubtle}`,
            }}
          >
            <Zap className={`w-4 h-4 ${isScaffoldingText ? 'animate-spin' : ''}`} />
            <span>{isScaffoldingText ? 'Scaffolding Architecture...' : 'Scaffold Code & Spec'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
