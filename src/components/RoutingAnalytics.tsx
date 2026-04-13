import { useMemo } from 'react';
import { useRouting } from '../context/RoutingContext';
import { calculateStats } from '../utils/routing';

export default function RoutingAnalytics() {
  const { events } = useRouting();

  const stats = useMemo(() => calculateStats(events), [events]);

  const chartData = useMemo(() => {
    // Aggregate by hour for chart bars
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
          value={stats.totalRequests.toString()}
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
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-text-primary">Request Volume</h2>
        </div>
        <div className="flex items-end gap-1.5 h-48" data-testid="request-chart">
          {chartData.map(({ hour, accepted, escalated }) => {
            const total = accepted + escalated;
            const acceptedHeight = (accepted / total) * 100;
            const escalatedHeight = (escalated / total) * 100;
            return (
              <div key={hour} className="flex-1 flex flex-col gap-0.5 group/bar" title={`${hour}: ${total} requests`}>
                <div className="text-center text-[10px] text-text-muted mb-1 opacity-0 group-hover/bar:opacity-100 transition-opacity tabular-nums">{total}</div>
                <div className="flex flex-col-reverse gap-px rounded-t overflow-hidden" style={{ height: '140px' }}>
                  <div
                    className="bg-success/80 hover:bg-success rounded-t transition-colors duration-150"
                    style={{ height: `${acceptedHeight}%` }}
                    aria-label={`${accepted} accepted`}
                  />
                  <div
                    className="bg-warning/80 hover:bg-warning rounded-t transition-colors duration-150"
                    style={{ height: `${escalatedHeight}%` }}
                    aria-label={`${escalated} escalated`}
                  />
                </div>
                <div className="text-center text-[9px] text-text-muted mt-1.5 truncate tabular-nums">{hour.slice(11)}</div>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-5 mt-5 text-xs text-text-secondary">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-success/80 inline-block" />
            Accepted
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-warning/80 inline-block" />
            Escalated
          </span>
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

  return (
    <div className={`bg-surface rounded-xl border p-5 transition-colors duration-200 ${highlight ? 'border-success/20' : 'border-border-subtle hover:border-border'}`}>
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
