/**
 * Vercel serverless function for LogRoute prompt routing analysis.
 *
 * Takes a prompt, computes a deterministic confidence score based on
 * prompt characteristics, and returns the routing decision along with
 * model selection based on the caller's fallback chain configuration.
 */

interface RoutePromptRequest {
  prompt: string;
  threshold: number;
  primaryModel: {
    id: string;
    name: string;
    provider: string;
    costPer1kTokens: number;
    avgLatencyMs: number;
    qualityScore: number;
  };
  fallbackChain: Array<{
    id: string;
    model: {
      id: string;
      name: string;
      provider: string;
      costPer1kTokens: number;
      avgLatencyMs: number;
      qualityScore: number;
    };
    conditionType: 'confidence' | 'timeout' | 'error_code' | 'cost_ceiling';
    conditionValue: string;
  }>;
  avgTokensPerRequest?: number;
}

interface RoutePromptResponse {
  id: string;
  timestamp: string;
  prompt: string;
  primaryModel: string;
  fallbackModel?: string;
  confidenceScore: number;
  latencyMs: number;
  decision: 'accepted' | 'escalated';
  costUsd: number;
}

/**
 * Computes a deterministic confidence score (average logprob) based on
 * prompt characteristics. Identical logic to the client-side version
 * to ensure consistency.
 */
function computeConfidenceScore(prompt: string): number {
  const trimmed = prompt.trim();
  if (trimmed.length === 0) return -0.1;

  const words = trimmed.split(/\s+/);
  const wordCount = words.length;

  const uniqueWords = new Set(words.map(w => w.toLowerCase()));
  const uniquenessRatio = uniqueWords.size / wordCount;

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

  let score = -0.1;
  score -= (wordCount / 10) * 0.15;
  score -= uniquenessRatio * 0.8;
  score -= techTermCount * 0.5;

  return Math.max(-4.0, Math.min(0.0, Number(score.toFixed(2))));
}

function shouldEscalate(confidenceScore: number, threshold: number): boolean {
  const cutoffLogprob = -4.0 * (1 - threshold);
  return confidenceScore < cutoffLogprob;
}

function selectFallback(
  fallbackChain: RoutePromptRequest['fallbackChain'],
  confidenceScore: number,
  latencyMs: number,
  costPer1kTokens: number,
): RoutePromptRequest['fallbackChain'][number] | undefined {
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
        return entry;
    }
  }
  return undefined;
}

function computeLatency(baseLatencyMs: number, prompt: string): number {
  let hash = 0;
  for (let i = 0; i < prompt.length; i++) {
    hash = ((hash << 5) - hash + prompt.charCodeAt(i)) | 0;
  }
  const jitter = Math.abs(hash % 200);
  return baseLatencyMs + jitter;
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    const body = await req.json() as RoutePromptRequest;

    if (!body.prompt?.trim()) {
      return new Response(JSON.stringify({ error: 'Prompt is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { prompt, threshold, primaryModel, fallbackChain = [], avgTokensPerRequest = 500 } = body;

    // Compute confidence score deterministically
    const confidenceScore = computeConfidenceScore(prompt);

    // Compute primary model latency
    const primaryLatency = computeLatency(primaryModel.avgLatencyMs, prompt);

    // Determine routing decision
    const isEscalated = shouldEscalate(confidenceScore, threshold);

    let fallbackModelName: string | undefined;
    let totalLatency = primaryLatency;
    let totalCost = (primaryModel.costPer1kTokens * avgTokensPerRequest) / 1000;

    if (isEscalated) {
      // Try to find a fallback from the configured chain
      const fallback = selectFallback(
        fallbackChain,
        confidenceScore,
        primaryLatency,
        primaryModel.costPer1kTokens,
      );

      if (fallback) {
        fallbackModelName = fallback.model.name;
        const fallbackLatency = computeLatency(fallback.model.avgLatencyMs, prompt);
        totalLatency = primaryLatency + fallbackLatency;
        totalCost += (fallback.model.costPer1kTokens * avgTokensPerRequest) / 1000;
      } else if (fallbackChain.length > 0) {
        // Chain exists but no condition matched — use first fallback as default
        const defaultFallback = fallbackChain[0];
        fallbackModelName = defaultFallback.model.name;
        const fallbackLatency = computeLatency(defaultFallback.model.avgLatencyMs, prompt);
        totalLatency = primaryLatency + fallbackLatency;
        totalCost += (defaultFallback.model.costPer1kTokens * avgTokensPerRequest) / 1000;
      }
    }

    const result: RoutePromptResponse = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      prompt: prompt.trim(),
      primaryModel: primaryModel.name,
      ...(fallbackModelName ? { fallbackModel: fallbackModelName } : {}),
      confidenceScore,
      latencyMs: Math.round(totalLatency),
      decision: isEscalated && fallbackModelName ? 'escalated' : 'accepted',
      costUsd: Number(totalCost.toFixed(4)),
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
