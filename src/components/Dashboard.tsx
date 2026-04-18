import { useState, useCallback, useMemo } from 'react';
import { useRouting } from '../context/RoutingContext';
import ConfidenceRouter from './ConfidenceRouter';
import FallbackChain from './FallbackChain';
import RoutingAnalytics from './RoutingAnalytics';
import CostSimulator from './CostSimulator';
import CodeSnippet from './CodeSnippet';
import RequestLogInspector from './RequestLogInspector';
import ProviderRegistry from './ProviderRegistry';
import { ToastContainer } from './Toast';

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
  const { fallbackChain } = useRouting();

  const hasRoutingRules = fallbackChain.length > 0;

  const handleTabChange = useCallback((tabId: TabId) => {
    setActiveTab(tabId);
  }, []);

  const renderContent = useMemo(() => {
    switch (activeTab) {
      case 'router':
        return (
          <div className="space-y-8">
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
            <ConfidenceRouter />
            <RequestLogInspector />
            <CostSimulator />
            <CodeSnippet />
          </div>
        );
      case 'fallbacks':
        return <FallbackChain />;
      case 'analytics':
        return <RoutingAnalytics />;
      case 'providers':
        return <ProviderRegistry />;
      default:
        return null;
    }
  }, [activeTab, hasRoutingRules]);

  return (
    <div className="min-h-screen bg-gray-950 text-text-primary">
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
          <div className="flex gap-1 overflow-x-auto -mb-px" role="tablist">
            {TABS.map(tab => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
                id={`tab-${tab.id}`}
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

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div
          role="tabpanel"
          id={`panel-${activeTab}`}
          aria-labelledby={`tab-${activeTab}`}
          className="animate-fade-in"
        >
          {renderContent}
        </div>
      </main>

      <ToastContainer />
    </div>
  );
}
