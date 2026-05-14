import type { RoutingStats } from '../types';

interface HeroStatsProps {
  stats: RoutingStats;
}

export function HeroStats({ stats }: HeroStatsProps) {
  const escalationRate = stats.totalRequests > 0
    ? ((stats.escalations / stats.totalRequests) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3" aria-label="Quick stats overview">
      <div className="relative bg-surface rounded-xl border border-border-subtle p-4 hover:border-border transition-all duration-200 group overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-text-muted uppercase tracking-wider font-medium">Requests</p>
            <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center">
              <svg className="w-3 h-3 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-text-primary tabular-nums">{stats.totalRequests.toLocaleString()}</p>
          <p className="text-[10px] text-text-muted mt-1">routed requests</p>
        </div>
      </div>
      <div className="relative bg-surface rounded-xl border border-border-subtle p-4 hover:border-border transition-all duration-200 group overflow-hidden">
        <div className="absolute inset-0 bg-warning/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-text-muted uppercase tracking-wider font-medium">Escalated</p>
            <div className="w-6 h-6 rounded-md bg-warning/10 flex items-center justify-center">
              <svg className="w-3 h-3 text-warning" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-warning tabular-nums">{stats.escalations}</p>
          <p className="text-[10px] text-text-muted mt-1">{escalationRate}% escalation rate</p>
        </div>
      </div>
      <div className="relative bg-surface rounded-xl border border-border-subtle p-4 hover:border-border transition-all duration-200 group overflow-hidden">
        <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-text-muted uppercase tracking-wider font-medium">Avg Latency</p>
            <div className="w-6 h-6 rounded-md bg-blue-500/10 flex items-center justify-center">
              <svg className="w-3 h-3 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-text-primary tabular-nums">{stats.avgLatencyMs}<span className="text-sm font-normal text-text-muted">ms</span></p>
          <p className="text-[10px] text-text-muted mt-1">across all models</p>
        </div>
      </div>
      <div className="relative bg-surface rounded-xl border border-success/20 p-4 hover:border-success/30 transition-all duration-200 group overflow-hidden">
        <div className="absolute inset-0 bg-success/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        <div className="relative">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-text-muted uppercase tracking-wider font-medium">Saved</p>
            <div className="w-6 h-6 rounded-md bg-success/10 flex items-center justify-center">
              <svg className="w-3 h-3 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
          </div>
          <p className="text-2xl font-bold text-success tabular-nums">${stats.costSavingsUsd.toFixed(2)}</p>
          <p className="text-[10px] text-text-muted mt-1">vs. always-frontier</p>
        </div>
      </div>
    </div>
  );
}
