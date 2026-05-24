import { trackEvent } from '../hooks/useAnalytics';

interface LandingPageProps {
  onLaunchDashboard: () => void;
}

const FEATURES = [
  {
    icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
    title: 'Smart Routing',
    description: 'Route LLM requests based on confidence scores. Low-confidence responses automatically escalate to stronger models.',
  },
  {
    icon: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
    title: '30-60% Cost Savings',
    description: 'Stop paying GPT-4 prices for every request. Route simple queries to cheaper models and save dramatically.',
  },
  {
    icon: 'M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5',
    title: 'Fallback Chains',
    description: 'Build multi-model chains so your app never breaks. If one model fails, the next one takes over automatically.',
  },
  {
    icon: 'M18 20V10M12 20V4M6 20v-6',
    title: 'Real-time Analytics',
    description: 'Track routing decisions, latency, and cost savings across all your models in one dashboard.',
  },
  {
    icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    title: 'Multi-Provider',
    description: 'Connect OpenAI, Anthropic, Google, and local models. Compare performance and cost side by side.',
  },
  {
    icon: '<path d="M16 18l6-6-6-6"/><path d="M8 6l-6 6 6 6"/>',
    title: 'Quick Integration',
    description: 'Copy a 5-line code snippet and start routing. Works with any LLM API — no vendor lock-in.',
  },
] as const;

export function LandingPage({ onLaunchDashboard }: LandingPageProps) {
  const handleLaunch = () => {
    trackEvent('cta_click', { button: 'launch_dashboard', position: 'hero' });
    onLaunchDashboard();
  };

  return (
    <div className="min-h-screen bg-gray-950 text-text-primary">
      {/* Header */}
      <header className="border-b border-border/50 bg-surface/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm shadow-primary/30">
                <svg className="w-4.5 h-4.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <h1 className="text-lg font-bold text-text-primary tracking-tight leading-none">
                Log<span className="text-primary">Route</span>
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              <span className="text-xs text-text-muted">All systems operational</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden" aria-label="Hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-medium mb-6">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            Confidence-based LLM routing
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-tight mb-2">
            Reduce LLM API costs with
            <br />
            <span className="text-primary">confidence-based routing</span>
          </h2>

          <p className="text-text-muted text-sm sm:text-base max-w-xl mx-auto mb-3 leading-relaxed italic">
            The insurance layer for your LLM stack
          </p>

          <p className="text-text-secondary text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            Route requests across GPT-4, Claude, and Gemini — save 30-60% without sacrificing output quality.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button
              type="button"
              onClick={handleLaunch}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors duration-200 shadow-lg shadow-primary/25 min-w-[44px] min-h-[44px]"
              aria-label="Launch the LogRoute dashboard"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              Launch Dashboard
            </button>
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium rounded-lg border border-border text-text-secondary hover:text-text-primary hover:border-text-muted transition-colors duration-200 min-h-[44px]"
            >
              See how it works
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </a>
          </div>

          {/* Trust signals */}
          <div className="mt-12 flex flex-wrap justify-center gap-3">
            <span className="px-3 py-1.5 bg-surface-alt/60 rounded-lg text-xs text-text-secondary border border-border-subtle">⚡ Smart routing</span>
            <span className="px-3 py-1.5 bg-surface-alt/60 rounded-lg text-xs text-text-secondary border border-border-subtle">💰 30-60% savings</span>
            <span className="px-3 py-1.5 bg-surface-alt/60 rounded-lg text-xs text-text-secondary border border-border-subtle">🔒 Fallback chains</span>
            <span className="px-3 py-1.5 bg-surface-alt/60 rounded-lg text-xs text-text-secondary border border-border-subtle">📊 Real-time analytics</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border/50 bg-surface/30" aria-label="Features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">How LogRoute works</h3>
            <p className="text-text-secondary max-w-xl mx-auto">Route every LLM call through an intelligent layer that balances cost, speed, and quality automatically.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((feature) => (
              <div
                key={feature.title}
                className="bg-surface rounded-xl border border-border-subtle p-5 hover:border-border transition-colors duration-200"
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                  <svg className="w-5 h-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d={feature.icon} />
                  </svg>
                </div>
                <h4 className="text-sm font-semibold text-text-primary mb-1.5">{feature.title}</h4>
                <p className="text-xs text-text-muted leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works - 3 steps */}
      <section className="border-t border-border/50" aria-label="How it works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">Get started in 3 steps</h3>
            <p className="text-text-secondary">Set up intelligent routing for your LLM calls in minutes.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold mx-auto mb-3">1</div>
              <h4 className="text-sm font-semibold text-text-primary mb-1">Connect Provider</h4>
              <p className="text-xs text-text-muted">Add your LLM provider API key to enable routing.</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold mx-auto mb-3">2</div>
              <h4 className="text-sm font-semibold text-text-primary mb-1">Set Threshold</h4>
              <p className="text-xs text-text-muted">Configure the confidence score that triggers escalation.</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold mx-auto mb-3">3</div>
              <h4 className="text-sm font-semibold text-text-primary mb-1">Build Chain</h4>
              <p className="text-xs text-text-muted">Create a fallback chain with multiple models for resilience.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/50 bg-surface/50" aria-label="Get started">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">Ready to cut LLM costs?</h3>
          <p className="text-text-secondary max-w-lg mx-auto mb-8">
            Launch the interactive dashboard to configure routing, test prompts, and see real-time cost savings.
          </p>
          <button
            type="button"
            onClick={handleLaunch}
            className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors duration-200 shadow-lg shadow-primary/25 min-h-[44px]"
            aria-label="Launch the LogRoute dashboard"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            Launch Dashboard
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-surface/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
                <svg className="w-3 h-3 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <span className="text-xs text-text-muted">
                Log<span className="text-text-secondary">Route</span> &middot; The insurance layer for your LLM stack
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs text-text-muted">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                All systems operational
              </span>
              <span className="text-text-muted/50">&middot;</span>
              <span>v1.0.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
