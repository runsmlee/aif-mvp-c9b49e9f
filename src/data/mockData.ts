import type { Model, RoutingEvent, Provider, CostSimulationResult } from '../types';

export const AVAILABLE_MODELS: Model[] = [
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', costPer1kTokens: 0.15, avgLatencyMs: 320, qualityScore: 0.82 },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', costPer1kTokens: 2.50, avgLatencyMs: 890, qualityScore: 0.94 },
  { id: 'claude-sonnet-4', name: 'Claude Sonnet 4', provider: 'Anthropic', costPer1kTokens: 3.00, avgLatencyMs: 1050, qualityScore: 0.95 },
  { id: 'claude-opus-4', name: 'Claude Opus 4', provider: 'Anthropic', costPer1kTokens: 15.00, avgLatencyMs: 2100, qualityScore: 0.98 },
  { id: 'gemini-pro', name: 'Gemini Pro', provider: 'Google', costPer1kTokens: 0.50, avgLatencyMs: 450, qualityScore: 0.85 },
  { id: 'llama-3.1-70b', name: 'Llama 3.1 70B', provider: 'Ollama', costPer1kTokens: 0.00, avgLatencyMs: 280, qualityScore: 0.78 },
];

export const DEFAULT_PROVIDERS: Provider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    status: 'disconnected',
    models: AVAILABLE_MODELS.filter(m => m.provider === 'OpenAI'),
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    status: 'disconnected',
    models: AVAILABLE_MODELS.filter(m => m.provider === 'Anthropic'),
  },
  {
    id: 'google',
    name: 'Google',
    status: 'disconnected',
    models: AVAILABLE_MODELS.filter(m => m.provider === 'Google'),
  },
  {
    id: 'ollama',
    name: 'Ollama',
    status: 'disconnected',
    models: AVAILABLE_MODELS.filter(m => m.provider === 'Ollama'),
  },
];

export const MOCK_ROUTING_EVENTS: RoutingEvent[] = [
  { id: '1', timestamp: '2026-04-13T10:00:00Z', prompt: 'What is the capital of France?', primaryModel: 'GPT-4o Mini', confidenceScore: -0.3, latencyMs: 310, decision: 'accepted', costUsd: 0.0005 },
  { id: '2', timestamp: '2026-04-13T10:01:00Z', prompt: 'Explain quantum entanglement simply', primaryModel: 'GPT-4o Mini', fallbackModel: 'GPT-4o', confidenceScore: -2.1, latencyMs: 1200, decision: 'escalated', costUsd: 0.0035 },
  { id: '3', timestamp: '2026-04-13T10:02:00Z', prompt: 'Write a Python fibonacci function', primaryModel: 'GPT-4o Mini', confidenceScore: -0.8, latencyMs: 340, decision: 'accepted', costUsd: 0.0006 },
  { id: '4', timestamp: '2026-04-13T10:03:00Z', prompt: 'Compare REST vs GraphQL for microservices', primaryModel: 'GPT-4o Mini', fallbackModel: 'Claude Sonnet 4', confidenceScore: -2.8, latencyMs: 1380, decision: 'escalated', costUsd: 0.0042 },
  { id: '5', timestamp: '2026-04-13T10:04:00Z', prompt: 'What is 2+2?', primaryModel: 'GPT-4o Mini', confidenceScore: -0.1, latencyMs: 290, decision: 'accepted', costUsd: 0.0004 },
  { id: '6', timestamp: '2026-04-13T10:05:00Z', prompt: 'Summarize the key points of machine learning', primaryModel: 'GPT-4o Mini', confidenceScore: -1.8, latencyMs: 1150, decision: 'escalated', costUsd: 0.0032 },
  { id: '7', timestamp: '2026-04-13T10:06:00Z', prompt: 'How do I install Node.js?', primaryModel: 'GPT-4o Mini', confidenceScore: -0.2, latencyMs: 305, decision: 'accepted', costUsd: 0.0005 },
  { id: '8', timestamp: '2026-04-13T10:07:00Z', prompt: 'Design a database schema for an e-commerce app', primaryModel: 'GPT-4o Mini', fallbackModel: 'GPT-4o', confidenceScore: -2.5, latencyMs: 1280, decision: 'escalated', costUsd: 0.0038 },
  { id: '9', timestamp: '2026-04-13T10:08:00Z', prompt: 'What color is the sky?', primaryModel: 'GPT-4o Mini', confidenceScore: -0.05, latencyMs: 285, decision: 'accepted', costUsd: 0.0004 },
  { id: '10', timestamp: '2026-04-13T10:09:00Z', prompt: 'Write a Kafka consumer in Go', primaryModel: 'GPT-4o Mini', fallbackModel: 'Claude Sonnet 4', confidenceScore: -3.2, latencyMs: 1450, decision: 'escalated', costUsd: 0.0045 },
  { id: '11', timestamp: '2026-04-13T10:10:00Z', prompt: 'Explain Docker networking', primaryModel: 'GPT-4o Mini', confidenceScore: -1.2, latencyMs: 380, decision: 'accepted', costUsd: 0.0007 },
  { id: '12', timestamp: '2026-04-13T10:11:00Z', prompt: 'Debug this TypeScript generic type error', primaryModel: 'GPT-4o Mini', fallbackModel: 'GPT-4o', confidenceScore: -2.0, latencyMs: 1100, decision: 'escalated', costUsd: 0.0033 },
];

export function generateCostSimulation(monthlyRequests: number): CostSimulationResult[] {
  const avgTokensPerRequest = 500;
  const frontierCostPer1k = 15.00;
  const cheapestCostPer1k = 0.15;
  const routedAvgCostPer1k = 1.80;

  const alwaysFrontierTotal = (monthlyRequests * avgTokensPerRequest / 1000) * frontierCostPer1k;
  const alwaysCheapestTotal = (monthlyRequests * avgTokensPerRequest / 1000) * cheapestCostPer1k;
  const routedTotal = (monthlyRequests * avgTokensPerRequest / 1000) * routedAvgCostPer1k;

  return [
    {
      strategy: 'Always Cheapest',
      totalCost: Number(alwaysCheapestTotal.toFixed(2)),
      avgQualityScore: 0.78,
      savingsPercent: Number(((1 - alwaysCheapestTotal / alwaysFrontierTotal) * 100).toFixed(1)),
    },
    {
      strategy: 'Always Best (Frontier)',
      totalCost: Number(alwaysFrontierTotal.toFixed(2)),
      avgQualityScore: 0.98,
      savingsPercent: 0,
    },
    {
      strategy: 'Confidence-Routed',
      totalCost: Number(routedTotal.toFixed(2)),
      avgQualityScore: 0.92,
      savingsPercent: Number(((1 - routedTotal / alwaysFrontierTotal) * 100).toFixed(1)),
    },
  ];
}
