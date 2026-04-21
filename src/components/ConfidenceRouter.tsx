import { useState, useCallback } from 'react';
import { useRouting } from '../context/RoutingContext';
import { AVAILABLE_MODELS } from '../data/mockData';
import { shouldEscalate } from '../utils/routing';
import type { RoutingEvent } from '../types';

export default function ConfidenceRouter() {
  const { events, threshold, setThreshold, addEvent } = useRouting();
  const [testPrompt, setTestPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<RoutingEvent | null>(null);

  const escalationEvents = events.filter(e => e.decision === 'escalated');

  const handleTestPrompt = useCallback(() => {
    if (!testPrompt.trim()) return;
    setIsSubmitting(true);

    // Simulate a routing decision with mock data
    const primaryModel = AVAILABLE_MODELS[0];
    const fallbackModel = AVAILABLE_MODELS[1];
    const confidenceScore = shouldEscalate(-2.0, threshold) ? -2.0 + Math.random() * -1.5 : -0.3 + Math.random() * 0.5;
    const isEscalated = shouldEscalate(confidenceScore, threshold);

    const event: RoutingEvent = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      prompt: testPrompt,
      primaryModel: primaryModel.name,
      ...(isEscalated ? { fallbackModel: fallbackModel.name } : {}),
      confidenceScore: Number(confidenceScore.toFixed(2)),
      latencyMs: Math.round(primaryModel.avgLatencyMs + (isEscalated ? fallbackModel.avgLatencyMs : 0) + Math.random() * 200),
      decision: isEscalated ? 'escalated' : 'accepted',
      costUsd: Number(((primaryModel.costPer1kTokens * 500 / 1000) + (isEscalated ? fallbackModel.costPer1kTokens * 500 / 1000 : 0)).toFixed(4)),
    };

    // Simulate network delay
    setTimeout(() => {
      addEvent(event);
      setLastResult(event);
      setTestPrompt('');
      setIsSubmitting(false);
    }, 400);
  }, [testPrompt, threshold, addEvent]);

  return (
    <div className="space-y-6">
      {/* Threshold Control */}
      <section className="bg-surface rounded-xl border border-border p-6" aria-label="Confidence threshold">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-text-primary">Confidence Threshold</h2>
            <p className="text-xs text-text-muted mt-0.5">Set the minimum logprob for automatic acceptance</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <label htmlFor="threshold-slider" className="text-sm text-text-secondary min-w-[100px]">
            Logprob cutoff
          </label>
          <input
            id="threshold-slider"
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            className="flex-1"
            role="slider"
            aria-valuemin={0}
            aria-valuemax={1}
            aria-valuenow={threshold}
            aria-valuetext={`Threshold: ${threshold}`}
          />
          <span className="text-sm font-mono font-bold text-primary min-w-[48px] text-right bg-primary/10 px-2.5 py-1 rounded-md" data-testid="threshold-value">
            {threshold}
          </span>
        </div>
        <p className="text-xs text-text-muted mt-3 flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          Requests with avg logprob &lt; -1.5 will be escalated when threshold &ge; 0.5
        </p>
      </section>

      {/* Test Prompt Submission */}
      <section className="bg-surface rounded-xl border border-border p-6" aria-label="Test prompt submission">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-text-primary">Test Routing</h2>
            <p className="text-xs text-text-muted mt-0.5">Send a test prompt to see the routing decision in action</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label htmlFor="test-prompt" className="sr-only">Enter a test prompt</label>
            <input
              id="test-prompt"
              type="text"
              value={testPrompt}
              onChange={(e) => setTestPrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleTestPrompt(); }}
              placeholder="Enter a prompt to test routing..."
              className="w-full px-4 py-2.5 bg-surface-alt border border-border-subtle rounded-lg text-text-primary text-sm placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary/30 focus:outline-none transition-all duration-150"
              disabled={isSubmitting}
            />
          </div>
          <button
            type="button"
            onClick={handleTestPrompt}
            disabled={isSubmitting || !testPrompt.trim()}
            className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-hover transition-all duration-200 active:scale-[0.97] min-h-[44px] shadow-sm shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex items-center justify-center gap-2"
            aria-label="Send test prompt"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" aria-hidden="true" />
                Routing...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
                </svg>
                Send
              </>
            )}
          </button>
        </div>
      </section>

      {/* Live Routing Result */}
      {lastResult && (
        <section
          className="bg-surface rounded-xl border border-border p-6 animate-fade-in"
          aria-label="Routing result"
          data-testid="routing-result"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                lastResult.decision === 'accepted' ? 'bg-success/10' : 'bg-warning/10'
              }`}>
                {lastResult.decision === 'accepted' ? (
                  <svg className="w-4 h-4 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-warning" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                )}
              </div>
              <div>
                <h2 className="text-base font-semibold text-text-primary">Routing Result</h2>
                <p className="text-xs text-text-muted mt-0.5">Latest test routing decision</p>
              </div>
            </div>
            <span
              className={`px-2.5 py-1 text-xs font-bold rounded-full border ${
                lastResult.decision === 'accepted'
                  ? 'bg-success/15 text-success border-success/20'
                  : 'bg-warning/15 text-warning border-warning/20'
              }`}
            >
              {lastResult.decision === 'accepted' ? 'Accepted' : 'Escalated'}
            </span>
          </div>

          <div className="p-4 bg-surface-alt/60 rounded-lg border border-border-subtle mb-3">
            <p className="text-xs text-text-muted uppercase tracking-wider font-medium mb-1.5">Prompt</p>
            <p className="text-sm text-text-primary truncate">{lastResult.prompt}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <div className="flex items-center gap-2.5 p-3 bg-surface-alt/40 rounded-lg">
              <span className="text-xs text-text-muted">Model</span>
              <span className="text-sm font-medium text-text-primary">{lastResult.primaryModel}</span>
            </div>
            <div className="flex items-center gap-2.5 p-3 bg-surface-alt/40 rounded-lg">
              <span className="text-xs text-text-muted">Confidence</span>
              <span className={`text-sm font-mono font-medium ${
                lastResult.confidenceScore < -1.5 ? 'text-warning' : 'text-success'
              }`}>
                {lastResult.confidenceScore}
              </span>
            </div>
            <div className="flex items-center gap-2.5 p-3 bg-surface-alt/40 rounded-lg">
              <span className="text-xs text-text-muted">Latency</span>
              <span className="text-sm font-mono text-text-secondary">{lastResult.latencyMs}ms</span>
            </div>
          </div>

          {lastResult.fallbackModel && (
            <div className="flex items-center gap-3 p-3 bg-warning/5 rounded-lg border border-warning/10">
              <svg className="w-4 h-4 text-warning flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
              <span className="text-sm text-text-secondary">
                Escalated to <span className="font-medium text-text-primary">{lastResult.fallbackModel}</span>
              </span>
              <span className="text-xs font-mono text-text-muted ml-auto">${lastResult.costUsd.toFixed(4)}</span>
            </div>
          )}
        </section>
      )}

      {/* Model List with Confidence Indicators */}
      <section className="bg-surface rounded-xl border border-border p-6" aria-label="Model confidence status">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-text-primary">Model Confidence Status</h2>
            <p className="text-xs text-text-muted mt-0.5">Acceptance rate across active models</p>
          </div>
        </div>
        <div className="grid gap-3">
          {AVAILABLE_MODELS.map(model => {
            const modelEvents = events.filter(e => e.primaryModel === model.name);
            const escalations = modelEvents.filter(e => e.decision === 'escalated').length;
            const accepted = modelEvents.filter(e => e.decision === 'accepted').length;
            const acceptanceRate = modelEvents.length > 0
              ? Math.round((accepted / modelEvents.length) * 100)
              : 0;

            return (
              <div
                key={model.id}
                className="flex items-center justify-between p-4 bg-surface-alt/60 rounded-lg border border-border-subtle hover:border-border transition-colors duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ring-2 ring-offset-1 ring-offset-surface-alt ${
                      acceptanceRate >= 80 ? 'bg-success ring-success/30' : acceptanceRate >= 50 ? 'bg-warning ring-warning/30' : modelEvents.length === 0 ? 'bg-text-muted ring-text-muted/30' : 'bg-error ring-error/30'
                    }`}
                    aria-label={`Confidence indicator: ${acceptanceRate}% acceptance rate`}
                  />
                  <div>
                    <span className="font-medium text-text-primary text-sm">{model.name}</span>
                    <span className="text-xs text-text-muted ml-2">{model.provider}</span>
                    <span className="hidden sm:inline text-xs text-text-muted ml-2">
                      &middot; ${model.costPer1kTokens}/1k tokens
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-text-secondary text-xs tabular-nums">{modelEvents.length} req</span>
                  {modelEvents.length > 0 && (
                    <>
                      <span className={`text-xs font-semibold tabular-nums ${acceptanceRate >= 80 ? 'text-success' : acceptanceRate >= 50 ? 'text-warning' : 'text-error'}`}>
                        {acceptanceRate}%
                      </span>
                      {escalations > 0 && (
                        <span className="px-2 py-0.5 text-xs font-medium bg-warning/15 text-warning rounded-full border border-warning/20">
                          {escalations} esc
                        </span>
                      )}
                    </>
                  )}
                  {modelEvents.length === 0 && (
                    <span className="text-xs text-text-muted">No data</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Escalation Results */}
      {escalationEvents.length > 0 && (
        <section className="bg-surface rounded-xl border border-border p-6" aria-label="Escalation results">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center">
                <svg className="w-4 h-4 text-warning" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-semibold text-text-primary">Recent Escalations</h2>
                <p className="text-xs text-text-muted mt-0.5">Low-confidence requests routed to fallback models</p>
              </div>
            </div>
            <span className="px-2.5 py-1 text-xs font-bold bg-primary/15 text-primary rounded-full border border-primary/20 tabular-nums">
              {escalationEvents.length}
            </span>
          </div>
          <div className="grid gap-3">
            {escalationEvents.slice(0, 5).map(event => (
              <div
                key={event.id}
                className="p-4 bg-surface-alt/60 rounded-lg border border-border-subtle hover:border-border transition-colors duration-200"
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-primary">{event.primaryModel}</span>
                    <svg className="w-3.5 h-3.5 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                    <span className="text-sm font-medium text-primary">{event.fallbackModel}</span>
                  </div>
                  <span
                    className="px-2 py-0.5 text-xs font-semibold bg-warning/15 text-warning rounded-full border border-warning/20"
                    data-testid="escalation-badge"
                  >
                    Escalated
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="text-text-muted">Confidence</span>
                    <span className={`font-mono font-medium ${shouldEscalate(event.confidenceScore, threshold) ? 'text-warning' : 'text-success'}`}>
                      {event.confidenceScore}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-text-muted">Latency</span>
                    <span className="font-mono text-text-secondary">{event.latencyMs}ms</span>
                  </div>
                </div>
                <p className="text-xs text-text-muted mt-2.5 truncate border-t border-border-subtle pt-2.5">
                  {event.prompt}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
