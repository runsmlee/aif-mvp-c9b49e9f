import type { RoutingEvent, RoutingStats, FallbackEntry } from '../types';

/**
 * Computes a deterministic confidence score (average logprob) based on
 * prompt characteristics. The score is derived from:
 *   - Prompt length (longer prompts → lower confidence)
 *   - Vocabulary complexity (unique word ratio)
 *   - Presence of technical/domain-specific terms
 *
 * Returns a value roughly in the range [-4.0, 0.0], where 0 is highest confidence.
 */
export function computeConfidenceScore(prompt: string): number {
  const trimmed = prompt.trim();
  if (trimmed.length === 0) return -0.1;

  const words = trimmed.split(/\s+/);
  const wordCount = words.length;

  // Unique word ratio (higher = more diverse vocabulary → harder)
  const uniqueWords = new Set(words.map(w => w.toLowerCase()));
  const uniquenessRatio = uniqueWords.size / wordCount;

  // Technical term detection: domain-specific language reduces confidence
  const technicalTerms = [
    'quantum', 'entangle', 'neural', 'gradient', 'optim', 'tensorflow',
    'pytorch', 'microservice', 'kubernetes', 'docker', 'graphql', 'rest',
    'database', 'schema', 'kafka', 'event-driven', 'distributed', 'consensus',
    'encryption', 'cryptograph', 'blockchain', 'typescript', 'generic',
    'debug', 'compile', 'runtime', 'algorithm', 'complexity', 'recursion',
    'concurrent', 'parallel', 'async', 'middleware', 'proxy', 'websocket',
    'streaming', 'vector', 'embed', 'transformer', 'attention', 'fine-tun',
    'deploy', 'infrastruct', 'terraform', 'serverless', 'latency', 'throughput',
  ];
  const techTermCount = technicalTerms.filter(term =>
    trimmed.toLowerCase().includes(term)
  ).length;

  // Base score: start near 0 (high confidence)
  let score = -0.1;

  // Length penalty: longer prompts tend to need more nuanced responses
  // Every 10 words adds roughly -0.15 to the score
  score -= (wordCount / 10) * 0.15;

  // Uniqueness penalty: diverse vocabulary suggests complex topics
  score -= uniquenessRatio * 0.8;

  // Technical term penalty: each matching domain term drops confidence
  score -= techTermCount * 0.5;

  // Clamp to realistic logprob range [-4.0, 0.0]
  return Math.max(-4.0, Math.min(0.0, Number(score.toFixed(2))));
}

/**
 * Determines whether a request should be escalated based on its confidence score
 * and the user-configured threshold.
 *
 * The threshold (0-1 slider) maps to a logprob cutoff:
 *   - threshold 0.0 → cutoff -4.0 (never escalate)
 *   - threshold 0.5 → cutoff -2.0
 *   - threshold 1.0 → cutoff 0.0 (always escalate)
 *
 * A request is escalated when its confidence score falls below the cutoff.
 */
export function shouldEscalate(confidenceScore: number, threshold: number): boolean {
  // Map 0-1 threshold to a logprob cutoff in [-4.0, 0.0]
  const cutoffLogprob = -4.0 * (1 - threshold);
  return confidenceScore < cutoffLogprob;
}

/**
 * Selects a fallback model from the user's configured fallback chain.
 * Returns the first model whose condition is met, or undefined if none match.
 */
export function selectFallbackModel(
  fallbackChain: FallbackEntry[],
  confidenceScore: number,
  latencyMs: number,
  costPer1kTokens: number,
): FallbackEntry | undefined {
  for (const entry of fallbackChain) {
    const value = parseFloat(entry.conditionValue);
    if (isNaN(value)) continue;

    switch (entry.conditionType) {
      case 'confidence':
        if (confidenceScore < value) return entry;
        break;
      case 'timeout':
        if (latencyMs > value) return entry;
        break;
      case 'cost_ceiling':
        if (costPer1kTokens > value) return entry;
        break;
      case 'error_code':
        // Error code fallback is used for retry scenarios
        return entry;
    }
  }
  return undefined;
}

/**
 * Computes latency for a model based on its average latency plus a deterministic
 * jitter derived from prompt characteristics (not random).
 */
export function computeLatency(baseLatencyMs: number, prompt: string): number {
  // Deterministic "jitter" based on prompt length hash
  let hash = 0;
  for (let i = 0; i < prompt.length; i++) {
    hash = ((hash << 5) - hash + prompt.charCodeAt(i)) | 0;
  }
  const jitter = Math.abs(hash % 200);
  return baseLatencyMs + jitter;
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
