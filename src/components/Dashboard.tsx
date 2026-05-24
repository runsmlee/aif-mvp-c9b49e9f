import { useState, useCallback, useMemo, useRef, lazy, Suspense } from 'react';
import { useRouting } from '../context/RoutingContext';
import { calculateStats } from '../utils/routing';
import { ErrorBoundary } from './ErrorBoundary';
import { LoadingSkeleton } from './LoadingSkeleton';
import { ToastContainer } from './Toast';
import { HeroStats } from './HeroStats';

const ConfidenceRouter = lazy(() => import('./ConfidenceRouter'));
const RequestLogInspector = lazy(() => import('./RequestLogInspector'));
const CostSimulator = lazy(() => import('./CostSimulator'));
const CodeSnippet = lazy(() => import('./CodeSnippet'));
const FallbackChain = lazy(() => import('./FallbackChain'));
const RoutingAnalytics = lazy(() => import('./RoutingAnalytics'));
const ProviderRegistry = lazy(() => import('./ProviderRegistry'));

type TabId = 'router' | 'fallbacks' | 'analytics' | 'providers';

interface Tab {
  id: TabId;
  label: string;
  iconPath: string;
  description: string;
}

const TABS: Tab[] = [
  {
    id: 'router',
    label: 'Router',
    iconPath: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
    description: 'Configure confidence routing and test prompts',
  },
  {
    id: 'fallbacks',
    label: 'Fallbacks',
    iconPath: 'M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5',
    description: 'Manage fallback chain order and conditions',
  },
  {
    id: 'analytics',
    label: 'Analytics',
    iconPath: 'M18 20V10M12 20V4M6 20v-6',
    description: 'View routing metrics and cost analysis',
  },
  {
    id: 'providers',
    label: 'Providers',
    iconPath: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5',
    description: 'Connect and manage LLM providers',
  },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('router');
  const { fallbackChain, events } = useRouting();
  const tabPanelRef = useRef<HTMLDivElement>(null);

  const hasRoutingRules = fallbackChain.length > 0;
  const stats = useMemo(() => calculateStats(events), [events]);

  const handleTabChange = useCallback((tabId: TabId) => {
    setActiveTab(tabId);
    requestAnimationFrame(() => {
      tabPanelRef.current?.focus();
    });
  }, []);

  const renderContent = useMemo(() => {
    switch (activeTab) {
      case 'router':
        return (
          <div className="space-y-8">
            <HeroStats stats={stats} />

            {!hasRoutingRules && (
              <div className="bg-surface rounded-xl border border-dashed border-border p-6 text-center" data-testid="empty-rules">
                <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-warning" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <p className="text-text-secondary text-sm font-medium mb-1">No routing rules configured</p>
                <p className="text-text-muted text-xs max-w-sm mx-auto">
                  Navigate to the Fallbacks tab to add models to your routing chain and start optimizing costs.
                </p>
                <button
                  type="button"
                  onClick={() => handleTabChange('fallbacks')}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors duration-200 shadow-sm shadow-primary/20"
                  aria-label="Go to Fallbacks tab"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Set Up Fallback Chain
                </button>
              </div>
            )}

            <section className="bg-surface rounded-xl border border-border p-6" aria-label="Quick start guide" data-testid="quick-start">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-base font-semibold text-text-primary">Get Started in 3 Steps</h2>
                  <p className="text-xs text-text-muted mt-0.5">Set up intelligent routing for your LLM calls</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => handleTabChange('providers')}
                  className="text-left p-4 bg-surface-alt/60 rounded-lg border border-border-subtle hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 group"
                  data-testid="quick-step-1"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-primary bg-primary/10 rounded-md group-hover:bg-primary group-hover:text-white transition-colors duration-200">1</span>
                    <span className="text-sm font-medium text-text-primary">Connect Provider</span>
                  </div>
                  <p className="text-xs text-text-muted">Add your LLM provider API key in the Providers tab to enable routing.</p>
                </button>
                <div className="p-4 bg-surface-alt/60 rounded-lg border border-border-subtle" data-testid="quick-step-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-primary bg-primary/10 rounded-md">2</span>
                    <span className="text-sm font-medium text-text-primary">Set Threshold</span>
                  </div>
                  <p className="text-xs text-text-muted">Configure the confidence threshold below. Requests below it auto-escalate.</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleTabChange('fallbacks')}
                  className="text-left p-4 bg-surface-alt/60 rounded-lg border border-border-subtle hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 group"
                  data-testid="quick-step-3"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-primary bg-primary/10 rounded-md group-hover:bg-primary group-hover:text-white transition-colors duration-200">3</span>
                    <span className="text-sm font-medium text-text-primary">Build Chain</span>
                  </div>
                  <p className="text-xs text-text-muted">Create a fallback chain with 3+ models for optimal cost-quality balance.</p>
                </button>
              </div>
            </section>
            <ErrorBoundary>
              <Suspense fallback={<LoadingSkeleton />}>
                <ConfidenceRouter />
              </Suspense>
            </ErrorBoundary>
            <ErrorBoundary>
              <Suspense fallback={<LoadingSkeleton />}>
                <RequestLogInspector />
              </Suspense>
            </ErrorBoundary>
            <ErrorBoundary>
              <Suspense fallback={<LoadingSkeleton />}>
                <CostSimulator />
              </Suspense>
            </ErrorBoundary>
            <ErrorBoundary>
              <Suspense fallback={<LoadingSkeleton />}>
                <CodeSnippet />
              </Suspense>
            </ErrorBoundary>
          </div>
        );
      case 'fallbacks':
        return (
          <ErrorBoundary>
            <Suspense fallback={<LoadingSkeleton />}>
              <FallbackChain />
            </Suspense>
          </ErrorBoundary>
        );
      case 'analytics':
        return (
          <ErrorBoundary>
            <Suspense fallback={<LoadingSkeleton />}>
              <RoutingAnalytics />
            </Suspense>
          </ErrorBoundary>
        );
      case 'providers':
        return (
          <ErrorBoundary>
            <Suspense fallback={<LoadingSkeleton />}>
              <ProviderRegistry />
            </Suspense>
          </ErrorBoundary>
        );
      default:
        return null;
    }
  }, [activeTab, hasRoutingRules, stats, handleTabChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const tabIds: TabId[] = ['router', 'fallbacks', 'analytics', 'providers'];
    const currentIndex = tabIds.indexOf(activeTab);
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % tabIds.length;
      handleTabChange(tabIds[nextIndex]);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + tabIds.length) % tabIds.length;
      handleTabChange(tabIds[prevIndex]);
    }
  }, [activeTab, handleTabChange]);

  return (
    <div className="min-h-screen bg-gray-950 text-text-primary flex flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:text-sm focus:font-medium focus:outline-none"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-border/80 bg-surface/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm shadow-primary/30">
                <svg className="w-4.5 h-4.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-text-primary tracking-tight leading-none">
                  Log<span className="text-primary">Route</span>
                </h1>
                <p className="text-xs text-text-muted leading-none mt-0.5 hidden sm:block">Confidence-based routing for LLM stacks</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-2 bg-surface-alt px-2.5 sm:px-3 py-1.5 rounded-full border border-border-subtle">
                <span className="w-1.5 h-1.5 rounded-full bg-success animate-[pulse-dot_2s_ease-in-out_infinite]" />
                <span className="text-xs text-text-secondary tabular-nums">{stats.totalRequests}<span className="hidden sm:inline"> requests routed</span></span>
              </div>
              <div className="flex items-center gap-1.5 bg-success/10 px-2.5 sm:px-3 py-1.5 rounded-full border border-success/20">
                <svg className="w-3.5 h-3.5 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <span className="text-xs font-medium text-success tabular-nums">${stats.costSavingsUsd.toFixed(2)}<span className="hidden sm:inline"> saved</span></span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <nav className="border-b border-border bg-surface/60 backdrop-blur-sm" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-0.5 overflow-x-auto -mb-px" role="tablist" onKeyDown={handleKeyDown}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
                id={`tab-${tab.id}`}
                tabIndex={activeTab === tab.id ? 0 : -1}
                onClick={() => handleTabChange(tab.id)}
                className={`relative px-4 py-3 text-sm font-medium whitespace-nowrap min-w-[44px] min-h-[44px] flex items-center justify-center gap-2 transition-colors duration-200 rounded-t-lg
                  ${
                    activeTab === tab.id
                      ? 'text-primary bg-surface-alt/50'
                      : 'text-text-muted hover:text-text-secondary hover:bg-surface-alt/30'
                  }
                `}
                title={tab.description}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={tab.iconPath} />
                </svg>
                <span className="hidden sm:inline">{tab.label}</span>
                {activeTab === tab.id && (
                  <span className="absolute inset-x-2 -bottom-px h-0.5 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {TABS.find(t => t.id === activeTab)?.label ?? ''} tab selected
      </div>

      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24 sm:pb-8 flex-1 w-full">
        <div
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          tabIndex={-1}
          ref={tabPanelRef}
          className="animate-fade-in outline-none"
        >
          {renderContent}
        </div>
      </main>

      <footer className="border-t border-border/50 bg-surface/30 mt-auto hidden sm:block">
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

      {/* Mobile bottom tab bar */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-surface/95 backdrop-blur-md border-t border-border" aria-label="Mobile navigation">
        <div className="flex items-center justify-around h-16">
          {TABS.map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabChange(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 min-w-[44px] min-h-[44px] flex-1 transition-colors duration-200 ${
                activeTab === tab.id ? 'text-primary' : 'text-text-muted'
              }`}
              aria-label={tab.label}
              aria-current={activeTab === tab.id ? 'page' : undefined}
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d={tab.iconPath} />
              </svg>
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <ToastContainer />
    </div>
  );
}
