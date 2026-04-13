import type { RoutingEvent, RoutingStats } from '../types';

const CONFIDENCE_THRESHOLD_LOGPROB = -1.5;

export function shouldEscalate(confidenceScore: number, threshold: number): boolean {
  return confidenceScore < CONFIDENCE_THRESHOLD_LOGPROB && threshold >= 0.5;
}

export function calculateStats(events: RoutingEvent[]): RoutingStats {
  const totalRequests = events.length;
  const escalations = events.filter(e => e.decision === 'escalated').length;
  const escalationRate = totalRequests > 0 ? escalations / totalRequests : 0;
  const avgLatencyMs = totalRequests > 0
    ? events.reduce((sum, e) => sum + e.latencyMs, 0) / totalRequests
    : 0;

  const frontierCost = events.reduce((sum, e) => sum + (500 / 1000) * 15.00, 0);
  const actualCost = events.reduce((sum, e) => sum + e.costUsd, 0);
  const costSavingsUsd = frontierCost - actualCost;

  return {
    totalRequests,
    escalations,
    escalationRate,
    avgLatencyMs: Math.round(avgLatencyMs),
    costSavingsUsd: Math.round(costSavingsUsd * 100) / 100,
  };
}
