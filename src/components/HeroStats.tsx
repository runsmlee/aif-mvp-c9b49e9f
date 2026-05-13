import type { RoutingStats } from '../types';

interface HeroStatsProps {
  stats: RoutingStats;
}

export function HeroStats({ stats }: HeroStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" aria-label="Quick stats overview">
      <div className="bg-surface rounded-xl border border-border-subtle p-4 hover:border-border transition-colors duration-200">
        <p className="text-xs text-text-muted uppercase tracking-wider font-medium mb-1">Requests</p>
        <p className="text-xl font-bold text-text-primary tabular-nums">{stats.totalRequests}</p>
      </div>
      <div className="bg-surface rounded-xl border border-border-subtle p-4 hover:border-border transition-colors duration-200">
        <p className="text-xs text-text-muted uppercase tracking-wider font-medium mb-1">Escalated</p>
        <p className="text-xl font-bold text-warning tabular-nums">{stats.escalations}</p>
      </div>
      <div className="bg-surface rounded-xl border border-border-subtle p-4 hover:border-border transition-colors duration-200">
        <p className="text-xs text-text-muted uppercase tracking-wider font-medium mb-1">Avg Latency</p>
        <p className="text-xl font-bold text-text-primary tabular-nums">{stats.avgLatencyMs}ms</p>
      </div>
      <div className="bg-surface rounded-xl border border-success/20 p-4 hover:border-success/30 transition-colors duration-200">
        <p className="text-xs text-text-muted uppercase tracking-wider font-medium mb-1">Saved</p>
        <p className="text-xl font-bold text-success tabular-nums">${stats.costSavingsUsd.toFixed(2)}</p>
      </div>
    </div>
  );
}
