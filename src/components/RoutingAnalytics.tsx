import { useMemo } from 'react';
import { useRouting } from '../context/RoutingContext';
import { calculateStats } from '../utils/routing';

export default function RoutingAnalytics() {
  const { events } = useRouting();

  const stats = useMemo(() => calculateStats(events), [events]);

  const chartData = useMemo(() => {
    const hourMap = new Map<string, { accepted: number; escalated: number }>();
    events.forEach(event => {
      const hour = event.timestamp.slice(0, 13);
      const existing = hourMap.get(hour) || { accepted: 0, escalated: 0 };
      if (event.decision === 'accepted') existing.accepted++;
      else existing.escalated++;
      hourMap.set(hour, existing);
    });
    return Array.from(hourMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([hour, counts]) => ({ hour, ...counts }));
  }, [events]);

  const maxRequests = useMemo(() => {
    return Math.max(...chartData.map(d => d.accepted + d.escalated), 1);
  }, [chartData]);

  const modelBreakdown = useMemo(() => {
    const modelMap = new Map<string, { total: number; accepted: number; escalated: number; totalLatency: number; totalCost: number }>();
    events.forEach(event => {
      const existing = modelMap.get(event.primaryModel) || { total: 0, accepted: 0, escalated: 0, totalLatency: 0, totalCost: 0 };
      existing.total++;
      existing.totalLatency += event.latencyMs;
      existing.totalCost += event.costUsd;
      if (event.decision === 'accepted') existing.accepted++;
      else existing.escalated++;
      modelMap.set(event.primaryModel, existing);
    });
    return Array.from(modelMap.entries())
      .sort((a, b) => b[1].total - a[1].total)
      .map(([model, data]) => ({
        model,
        total: data.total,
        accepted: data.accepted,
        escalated: data.escalated,
        avgLatency: Math.round(data.totalLatency / data.total),
        acceptRate: Math.round((data.accepted / data.total) * 100),
        totalCost: data.totalCost,
      }));
  }, [events]);

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-14 h-14 rounded-full bg-surface-alt flex items-center justify-center mb-4">
          <svg className="w-7 h-7 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12c0 1.2-4 6-9 6s-9-4.8-9-6c0-1.2 4-6 9-6s9 4.8 9 6z" /><circle cx="12" cy="12" r="3" />
          </svg>
        </div>
        <p className="text-text-secondary text-sm font-medium mb-1">No routing data yet</p>
        <p className="text-text-muted text-xs">Start sending requests to see analytics</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-testid="analytics-cards" aria-label="Analytics overview">
        <StatCard
          label="Total Requests"
          value={stats.totalRequests.toLocaleString()}
          subtext={`${events.length} events logged`}
          icon="request"
        />
        <StatCard
          label="Escalations"
          value={`${stats.escalations} (${stats.escalationRate.toFixed(1)}%)`}
          subtext={`${stats.escalations} of ${stats.totalRequests} requests`}
          dataTestId="escalation-rate"
          icon="escalation"
        />
        <StatCard
          label="Avg Latency"
          value={`${stats.avgLatencyMs}ms`}
          subtext="across all requests"
          icon="latency"
        />
        <StatCard
          label="Cost Savings"
          value={`$${stats.costSavingsUsd.toFixed(2)}`}
          subtext="vs. always-frontier"
          dataTestId="cost-savings-value"
          highlight
          icon="savings"
        />
      </div>

      {/* Request Volume Chart */}
      <section className="bg-surface rounded-xl border border-border p-6" aria-label="Request volume chart">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-text-primary">Request Volume</h2>
              <p className="text-xs text-text-muted">Accepted vs escalated over time</p>
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs text-text-secondary">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-success/80 inline-block" />
              Accepted
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-warning/80 inline-block" />
              Escalated
            </span>
          </div>
        </div>
        <div className="flex items-end gap-2 h-48" data-testid="request-chart">
          {chartData.map(({ hour, accepted, escalated }) => {
            const total = accepted + escalated;
            const barHeight = Math.max((total / maxRequests) * 100, 8);
            const acceptedPercent = total > 0 ? (accepted / total) * 100 : 0;
            const escalatedPercent = total > 0 ? (escalated / total) * 100 : 0;

            return (
              <div key={hour} className="flex-1 flex flex-col items-center gap-1 group/bar" title={`${hour}: ${total} requests`}>
                <span className="text-[10px] text-text-muted tabular-nums opacity-0 group-hover/bar:opacity-100 transition-opacity">{total}</span>
                <div className="w-full relative" style={{ height: '140px' }}>
                  <div
                    className="absolute bottom-0 w-full rounded-t overflow-hidden transition-all duration-300 hover:opacity-90"
                    style={{ height: `${barHeight}%` }}
                  >
                    <div className="bg-success/70" style={{ height: `${acceptedPercent}%` }} />
                    <div className="bg-warning/70" style={{ height: `${escalatedPercent}%` }} />
                  </div>
                </div>
                <span className="text-[9px] text-text-muted tabular-nums mt-1 truncate max-w-full">{hour.slice(11)}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Per-Model Breakdown */}
      <section className="bg-surface rounded-xl border border-border p-6" aria-label="Per-model breakdown" data-testid="per-model-breakdown">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
                <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
                <line x1="6" y1="6" x2="6.01" y2="6" />
                <line x1="6" y1="18" x2="6.01" y2="18" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-text-primary">Per-Model Performance</h2>
              <p className="text-xs text-text-muted">Detailed breakdown by model</p>
            </div>
          </div>
        </div>
        <div className="grid gap-3">
          {modelBreakdown.map(({ model, total, accepted, escalated, avgLatency, acceptRate, totalCost }) => (
            <div
              key={model}
              className="p-4 bg-surface-alt/60 rounded-lg border border-border-subtle hover:border-border transition-colors duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    acceptRate >= 80 ? 'bg-success' : acceptRate >= 50 ? 'bg-warning' : 'bg-error'
                  }`} />
                  <span className="text-sm font-medium text-text-primary">{model}</span>
                  <span className="text-xs text-text-muted tabular-nums bg-surface px-2 py-0.5 rounded-md">{total} req</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-text-muted tabular-nums">{avgLatency}ms avg</span>
                  <span className="font-mono text-text-secondary tabular-nums">${totalCost.toFixed(4)}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-surface-elevated rounded-full overflow-hidden">
                  <div className="h-full flex">
                    <div
                      className="bg-success/70 rounded-l-full transition-all duration-500"
                      style={{ width: `${acceptRate}%` }}
                    />
                    <div
                      className="bg-warning/70 rounded-r-full transition-all duration-500"
                      style={{ width: `${100 - acceptRate}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs min-w-[120px] justify-end">
                  <span className="text-success tabular-nums">{accepted} OK</span>
                  <span className="text-text-muted">/</span>
                  <span className="text-warning tabular-nums">{escalated} esc</span>
                  <span className={`font-bold tabular-nums min-w-[36px] text-right ${
                    acceptRate >= 80 ? 'text-success' : acceptRate >= 50 ? 'text-warning' : 'text-error'
                  }`}>
                    {acceptRate}%
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  subtext,
  dataTestId,
  highlight = false,
  icon,
}: {
  label: string;
  value: string;
  subtext: string;
  dataTestId?: string;
  highlight?: boolean;
  icon?: string;
}) {
  const iconColor = highlight ? 'text-success' : 'text-text-muted';
  const iconBg = highlight ? 'bg-success/10' : 'bg-surface-elevated/50';
  const borderColor = highlight ? 'border-success/20' : 'border-border-subtle hover:border-border';

  return (
    <div className={`bg-surface rounded-xl border p-5 transition-all duration-200 ${borderColor}`}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-text-muted uppercase tracking-wider font-medium">{label}</p>
        <div className={`w-7 h-7 rounded-md ${iconBg} flex items-center justify-center`}>
          {icon === 'request' && (
            <svg className={`w-3.5 h-3.5 ${iconColor}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
            </svg>
          )}
          {icon === 'escalation' && (
            <svg className={`w-3.5 h-3.5 ${iconColor}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            </svg>
          )}
          {icon === 'latency' && (
            <svg className={`w-3.5 h-3.5 ${iconColor}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
          )}
          {icon === 'savings' && (
            <svg className={`w-3.5 h-3.5 ${iconColor}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          )}
        </div>
      </div>
      <p
        className={`text-2xl font-bold tabular-nums ${
          highlight ? 'text-success' : 'text-text-primary'
        }`}
        data-testid={dataTestId}
      >
        {value}
      </p>
      <p className="text-xs text-text-muted mt-1.5">{subtext}</p>
    </div>
  );
}
