import { useState, useCallback, useMemo, useRef, lazy, Suspense } from 'react';
import { useRouting } from '../context/RoutingContext';
import { calculateStats } from '../utils/routing';
import { ErrorBoundary } from './ErrorBoundary';
import { LoadingSkeleton } from './LoadingSkeleton';
import { ToastContainer } from './Toast';
import { HeroStats } from './HeroStats';

// All sections are lazy-loaded to minimize initial bundle size
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
  icon: string;
}

const TABS: Tab[] = [
  { id: 'router', label: 'Router', icon: '⚡' },
  { id: 'fallbacks', label: 'Fallbacks', icon: '🔗' },
  { id: 'analytics', label: 'Analytics', icon: '📊' },
  { id: 'providers', label: 'Providers', icon: '🔌' },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<TabId>('router');
  const { fallbackChain, events } = useRouting();
  const tabPanelRef = useRef<HTMLDivElement>(null);

  const hasRoutingRules = fallbackChain.length > 0;
  const stats = useMemo(() => calculateStats(events), [events]);

  const handleTabChange = useCallback((tabId: TabId) => {
    setActiveTab(tabId);
    // Move focus to the tab panel for screen readers after tab switch
    requestAnimationFrame(() => {
      tabPanelRef.current?.focus();
    });
  }, []);

  const renderContent = useMemo(() => {
    switch (activeTab) {
      case 'router':
        return (
          <div className="space-y-8">
            {/* Hero Summary Bar */}
            <HeroStats stats={stats} />

            {!hasRoutingRules && (
              <div className="bg-surface rounded-xl border border-dashed border-border p-6 text-center">
                <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-5 h-5 text-warning" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <p className="text-text-secondary text-sm font-medium mb-1">No routing rules configured</p>
                <p className="text-text-muted text-xs">
                  Add models to your fallback chain to get started.
                </p>
              </div>
            )}

            {/* Quick-Start Guide */}
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
                <div className="p-4 bg-surface-alt/60 rounded-lg border border-border-subtle" data-testid="quick-step-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-primary bg-primary/10 rounded-md">1</span>
                    <span className="text-sm font-medium text-text-primary">Connect Provider</span>
                  </div>
                  <p className="text-xs text-text-muted">Add your LLM provider API key in the Providers tab to enable routing.</p>
                </div>
                <div className="p-4 bg-surface-alt/60 rounded-lg border border-border-subtle" data-testid="quick-step-2">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-primary bg-primary/10 rounded-md">2</span>
                    <span className="text-sm font-medium text-text-primary">Set Threshold</span>
                  </div>
                  <p className="text-xs text-text-muted">Configure the confidence threshold below. Requests below it auto-escalate.</p>
                </div>
                <div className="p-4 bg-surface-alt/60 rounded-lg border border-border-subtle" data-testid="quick-step-3">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="flex items-center justify-center w-6 h-6 text-xs font-bold text-primary bg-primary/10 rounded-md">3</span>
                    <span className="text-sm font-medium text-text-primary">Build Chain</span>
                  </div>
                  <p className="text-xs text-text-muted">Create a fallback chain with 3+ models for optimal cost-quality balance.</p>
                </div>
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
  }, [activeTab, hasRoutingRules, stats]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    const tabIds: TabId[] = ['router', 'fallbacks', 'analytics', 'providers'];
    const currentIndex = tabIds.indexOf(activeTab);
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % tabIds.length;
      setActiveTab(tabIds[nextIndex]);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + tabIds.length) % tabIds.length;
      setActiveTab(tabIds[prevIndex]);
    }
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-gray-950 text-text-primary">
      {/* Skip to content link for accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:text-sm focus:font-medium focus:outline-none"
      >
        Skip to content
      </a>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/80 bg-surface/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <h1 className="text-lg font-bold text-text-primary tracking-tight">
                Log<span className="text-primary">Route</span>
              </h1>
            </div>
            <span className="text-xs text-text-muted hidden sm:flex items-center gap-1.5 bg-surface-alt px-3 py-1.5 rounded-full border border-border-subtle">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-[pulse-dot_2s_ease-in-out_infinite]" />
              The insurance layer for your LLM stack
            </span>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="border-b border-border bg-surface/60 backdrop-blur-sm" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto -mb-px" role="tablist" onKeyDown={handleKeyDown}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
                id={`tab-${tab.id}`}
                tabIndex={activeTab === tab.id ? 0 : -1}
                onClick={() => handleTabChange(tab.id)}
                className={`relative px-4 py-3 text-sm font-medium whitespace-nowrap min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors duration-200
                  ${
                    activeTab === tab.id
                      ? 'text-primary'
                      : 'text-text-muted hover:text-text-secondary'
                  }
                `}
              >
                <span className="mr-1.5 text-sm" aria-hidden="true">{tab.icon}</span>
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute inset-x-2 -bottom-px h-0.5 bg-primary rounded-full" />
                )}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Screen reader live region for tab changes */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {TABS.find(t => t.id === activeTab)?.label ?? ''} tab selected
      </div>

      {/* Content */}
      <main id="main-content" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          tabIndex={-1}
          ref={tabPanelRef}
          onFocus={() => {
            // Redirect focus to the active tab button when panel receives focus
            const activeTabEl = document.getElementById(`tab-${activeTab}`);
            if (activeTabEl) {
              // Keep focus on panel for screen reader announcement
            }
          }}
          className="animate-fade-in outline-none"
        >
          {renderContent}
        </div>
      </main>

      <ToastContainer />
    </div>
  );
}
