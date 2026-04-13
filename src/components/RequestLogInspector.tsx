import { useState, useMemo } from 'react';
import { useRouting } from '../context/RoutingContext';

export default function RequestLogInspector() {
  const { events } = useRouting();
  const [modelFilter, setModelFilter] = useState('');
  const [decisionFilter, setDecisionFilter] = useState<string>('all');

  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesModel = modelFilter === '' || event.primaryModel.toLowerCase().includes(modelFilter.toLowerCase());
      const matchesDecision = decisionFilter === 'all' || event.decision === decisionFilter;
      return matchesModel && matchesDecision;
    });
  }, [events, modelFilter, decisionFilter]);

  const uniqueModels = useMemo(() => {
    const models = new Set(events.map(e => e.primaryModel));
    return Array.from(models);
  }, [events]);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <section className="bg-surface rounded-xl border border-border-subtle p-4" aria-label="Request log filters">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label htmlFor="model-filter" className="block text-xs text-text-muted mb-1.5 font-medium">
              Filter by Model
            </label>
            <input
              id="model-filter"
              type="text"
              value={modelFilter}
              onChange={(e) => setModelFilter(e.target.value)}
              placeholder="e.g. GPT-4o Mini"
              className="w-full px-3 py-2 bg-surface-alt border border-border-subtle rounded-lg text-sm text-text-primary placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary/30 focus:outline-none transition-all duration-150"
              aria-label="Filter by model"
              list="model-suggestions"
            />
            <datalist id="model-suggestions">
              {uniqueModels.map(model => (
                <option key={model} value={model} />
              ))}
            </datalist>
          </div>
          <div className="min-w-[180px]">
            <label htmlFor="decision-filter" className="block text-xs text-text-muted mb-1.5 font-medium">
              Filter by Decision
            </label>
            <select
              id="decision-filter"
              value={decisionFilter}
              onChange={(e) => setDecisionFilter(e.target.value)}
              className="w-full px-3 py-2 bg-surface-alt border border-border-subtle rounded-lg text-sm text-text-primary focus:border-primary focus:ring-1 focus:ring-primary/30 focus:outline-none transition-all duration-150"
              aria-label="Filter by decision"
            >
              <option value="all">All Decisions</option>
              <option value="accepted">Accepted</option>
              <option value="escalated">Escalated</option>
            </select>
          </div>
        </div>
      </section>

      {/* Log Table */}
      <section className="bg-surface rounded-xl border border-border overflow-hidden" aria-label="Request log table">
        <div className="overflow-x-auto">
          <table className="w-full text-sm" role="table">
            <thead>
              <tr className="bg-surface-alt/50 border-b border-border">
                <th className="text-left py-3 px-4 text-text-muted font-medium text-xs uppercase tracking-wider">
                  Timestamp
                </th>
                <th className="text-left py-3 px-4 text-text-muted font-medium text-xs uppercase tracking-wider">
                  Model
                </th>
                <th className="text-left py-3 px-4 text-text-muted font-medium text-xs uppercase tracking-wider">
                  Confidence
                </th>
                <th className="text-left py-3 px-4 text-text-muted font-medium text-xs uppercase tracking-wider">
                  Latency
                </th>
                <th className="text-left py-3 px-4 text-text-muted font-medium text-xs uppercase tracking-wider">
                  Decision
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-text-muted">
                    <div className="flex flex-col items-center">
                      <svg className="w-8 h-8 text-text-muted/50 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                      </svg>
                      <p className="text-sm">No matching requests</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEvents.map(event => (
                  <tr
                    key={event.id}
                    className="border-b border-border-subtle last:border-0 hover:bg-surface-alt/40 transition-colors duration-150"
                  >
                    <td className="py-3 px-4 font-mono text-xs text-text-muted tabular-nums">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <span className="text-text-primary font-medium text-sm">{event.primaryModel}</span>
                        {event.fallbackModel && (
                          <span className="block text-xs text-text-muted mt-0.5">
                            <svg className="w-3 h-3 inline -mt-0.5 mr-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="9 18 15 12 9 6" />
                            </svg>
                            {event.fallbackModel}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`font-mono text-xs px-2 py-1 rounded-md font-medium ${
                          event.confidenceScore < -1.5
                            ? 'bg-warning/15 text-warning border border-warning/20'
                            : 'bg-success/15 text-success border border-success/20'
                        }`}
                      >
                        {event.confidenceScore}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-text-muted tabular-nums">
                      {event.latencyMs}ms
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full ${
                          event.decision === 'accepted'
                            ? 'bg-success/15 text-success border border-success/20'
                            : 'bg-warning/15 text-warning border border-warning/20'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${event.decision === 'accepted' ? 'bg-success' : 'bg-warning'}`} />
                        {event.decision}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filteredEvents.length > 0 && (
          <div className="px-4 py-2.5 bg-surface-alt/30 border-t border-border-subtle text-xs text-text-muted tabular-nums">
            Showing {filteredEvents.length} of {events.length} requests
          </div>
        )}
      </section>
    </div>
  );
}
