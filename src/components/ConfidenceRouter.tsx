import { useRouting } from '../context/RoutingContext';
import { AVAILABLE_MODELS } from '../data/mockData';
import { shouldEscalate } from '../utils/routing';

export default function ConfidenceRouter() {
  const { events, threshold, setThreshold } = useRouting();

  const escalationEvents = events.filter(e => e.decision === 'escalated');

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
          {AVAILABLE_MODELS.slice(0, 2).map(model => {
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
                      acceptanceRate >= 80 ? 'bg-success ring-success/30' : acceptanceRate >= 50 ? 'bg-warning ring-warning/30' : 'bg-error ring-error/30'
                    }`}
                    aria-label={`Confidence indicator: ${acceptanceRate}% acceptance rate`}
                  />
                  <div>
                    <span className="font-medium text-text-primary text-sm">{model.name}</span>
                    <span className="text-xs text-text-muted ml-2">{model.provider}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-text-secondary text-xs tabular-nums">{modelEvents.length} req</span>
                  <span className={`text-xs font-semibold tabular-nums ${acceptanceRate >= 80 ? 'text-success' : acceptanceRate >= 50 ? 'text-warning' : 'text-error'}`}>
                    {acceptanceRate}%
                  </span>
                  {escalations > 0 && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-warning/15 text-warning rounded-full border border-warning/20">
                      {escalations} esc
                    </span>
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
