import React, { useState } from 'react';
import {
  CreditCard,
  Zap,
  Check,
  ArrowRight,
  Shield,
  Sparkles,
  RefreshCw,
  TrendingUp,
  Activity,
  Award,
  ChevronLeft
} from 'lucide-react';
import { GradientTheme } from '../../types';
import { playUiSound } from '../../utils/audio';

interface SubscriptionPageProps {
  activeTheme: GradientTheme;
  onBackToAssistant: () => void;
  soundEnabled: boolean;
}

export const SubscriptionPage: React.FC<SubscriptionPageProps> = ({
  activeTheme,
  onBackToAssistant,
  soundEnabled,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [credits] = useState<number | null>(null);
  const [isAddingCredits] = useState<boolean>(false);
  const [autoRefill, setAutoRefill] = useState<boolean>(false);
  const maxCredits = 25000;

  const handleAddCredits = () => {
    if (soundEnabled) playUiSound('click');
  };

  const plans = [
    {
      id: 'starter',
      name: 'Starter Tier',
      tagline: 'Local offline engine & essential inference',
      price: billingCycle === 'monthly' ? '$0' : '$0',
      period: '/forever',
      credits: '5,000 credits/mo',
      active: false,
      features: [
        'Local on-device execution',
        'Standard text synthesis',
        'Basic audio soundscapes',
        'Local browser storage vault',
      ],
      badge: null,
      ctaText: 'Downgrade to Free',
    },
    {
      id: 'pro',
      name: 'Pro Neural Tier',
      tagline: 'Dual-tier hybrid intelligence & deep CoT reasoning',
      price: billingCycle === 'monthly' ? '$29' : '$24',
      period: billingCycle === 'monthly' ? '/month' : '/month, billed annually',
      credits: '25,000 compute credits/mo',
      active: true,
      features: [
        'Everything in Starter',
        '4-Stage Chain-of-Thought reasoning',
        'Sub-second voice synapse & speech',
        'Full 7-gradient theme suite',
        'High-concurrency cloud failover',
        'Priority prompt generation',
      ],
      badge: 'Current Plan',
      ctaText: 'Current Active Plan',
    },
    {
      id: 'enterprise',
      name: 'Enterprise Neural Node',
      tagline: 'Air-gapped private LLMs & unlimited compute',
      price: billingCycle === 'monthly' ? '$99' : '$79',
      period: '/month',
      credits: 'Unlimited credits',
      active: false,
      features: [
        'Everything in Pro Neural',
        'Dedicated isolated cloud containers',
        'Custom local vector fine-tuning',
        'Encrypted multi-seat team vault',
        'Zero-retention telemetry guarantee',
        '24/7 dedicated AI engineer support',
      ],
      badge: 'Extreme Compute',
      ctaText: 'Upgrade to Enterprise',
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8 max-w-6xl mx-auto w-full space-y-8 animate-in fade-in duration-300">
      {/* Top Breadcrumb & Return to Assistant */}
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

      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center border border-white/20 shadow-md"
            style={{
              background: activeTheme.gradient,
              boxShadow: `0 0 20px ${activeTheme.glowRgbaSubtle}`,
            }}
          >
            <CreditCard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              Subscription & Neural Credits
              <span
                className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                style={{ background: activeTheme.badgeBg, color: activeTheme.primaryHex }}
              >
                Pro Plan Active
              </span>
            </h1>
            <p className="text-sm text-slate-400">
              Manage compute quotas, billing cycles, and high-concurrency neural credit reserves.
            </p>
          </div>
        </div>
      </div>

      {/* Current Balance Card */}
      <div
        className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 relative overflow-hidden backdrop-blur-md"
        style={{
          boxShadow: `0 0 40px ${activeTheme.glowRgbaSubtle}`,
        }}
      >
        <div
          className="absolute -right-20 -bottom-20 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-20"
          style={{ background: activeTheme.primaryHex }}
        />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Active Compute Credit Allocation</span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-extrabold text-white font-mono">Not connected</span>
              <span className="text-sm text-slate-400 font-medium">Payment/account service not connected</span>
            </div>

            {/* Visual Credit Bar */}
            <div className="w-full max-w-md h-2.5 rounded-full bg-white/10 overflow-hidden"><div className="h-full w-0" /></div>
            <p className="text-xs text-slate-400">Connect an account and payment provider before credits, billing, or auto-refill can be shown as active.</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleAddCredits}
              disabled={true}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs text-white transition-all shadow-md"
              style={{
                background: activeTheme.gradient,
                boxShadow: `0 0 16px ${activeTheme.glowRgbaSubtle}`,
              }}
            >
              <Zap className={`w-4 h-4 ${isAddingCredits ? 'animate-bounce' : ''}`} />
              <span>{isAddingCredits ? 'Allocating Credits...' : 'Top-Up unavailable'}</span>
            </button>

            <button
              onClick={() => { if (soundEnabled) playUiSound('click'); }}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${autoRefill ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span>Auto-Refill: {autoRefill ? 'Enabled' : 'Disabled'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Monthly / Yearly Toggle */}
      <div className="flex items-center justify-center gap-3">
        <span className={`text-xs font-semibold ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-400'}`}>
          Monthly Billing
        </span>
        <button
          onClick={() => {
            if (soundEnabled) playUiSound('toggle');
            setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly');
          }}
          className="w-12 h-6 rounded-full bg-white/10 p-1 flex items-center transition-colors border border-white/20"
        >
          <div
            className={`w-4 h-4 rounded-full transition-transform ${
              billingCycle === 'yearly' ? 'translate-x-6 bg-cyan-400' : 'translate-x-0 bg-white'
            }`}
          />
        </button>
        <span className={`text-xs font-semibold flex items-center gap-1.5 ${billingCycle === 'yearly' ? 'text-white' : 'text-slate-400'}`}>
          Annual Billing
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
            Save 20%
          </span>
        </span>
      </div>

      {/* Tier Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrent = plan.active;
          return (
            <div
              key={plan.id}
              className={`p-6 rounded-2xl border flex flex-col justify-between transition-all duration-300 relative ${
                isCurrent
                  ? 'bg-white/[0.06] border-white/30 shadow-xl'
                  : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
              }`}
              style={
                isCurrent
                  ? {
                      borderColor: activeTheme.primaryHex,
                      boxShadow: `0 0 30px ${activeTheme.glowRgbaSubtle}`,
                    }
                  : undefined
              }
            >
              {plan.badge && (
                <div
                  className="absolute -top-3 left-6 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider text-white shadow-sm"
                  style={{ background: activeTheme.gradient }}
                >
                  {plan.badge}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 min-h-[32px]">{plan.tagline}</p>
                </div>

                <div className="flex items-baseline gap-1 py-2 border-y border-white/5">
                  <span className="text-3xl font-extrabold text-white">{plan.price}</span>
                  <span className="text-xs text-slate-400">{plan.period}</span>
                </div>

                <div className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{plan.credits}</span>
                </div>

                {/* Feature Checklist */}
                <ul className="space-y-2.5 pt-2">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Card Action Button */}
              <div className="pt-6 mt-4 border-t border-white/10">
                <button
                  onClick={() => {
                    if (soundEnabled) playUiSound('click');
                  }}
                  disabled={isCurrent}
                  className={`w-full py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isCurrent
                      ? 'bg-white/10 text-white cursor-default border border-white/20'
                      : 'hover:text-white text-slate-200 bg-white/[0.05] hover:bg-white/15 border border-white/10'
                  }`}
                  style={
                    !isCurrent
                      ? {
                          hover: { borderColor: activeTheme.primaryHex },
                        }
                      : undefined
                  }
                >
                  {plan.ctaText}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
