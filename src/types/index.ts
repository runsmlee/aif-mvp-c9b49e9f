export interface Model {
  id: string;
  name: string;
  provider: string;
  costPer1kTokens: number;
  avgLatencyMs: number;
  qualityScore: number;
}

export interface FallbackEntry {
  id: string;
  model: Model;
  conditionType: 'confidence' | 'timeout' | 'error_code' | 'cost_ceiling';
  conditionValue: string;
}

export interface RoutingEvent {
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

export interface Provider {
  id: string;
  name: string;
  apiKey?: string;
  status: 'connected' | 'disconnected' | 'testing';
  models: Model[];
}

export interface RoutingStats {
  totalRequests: number;
  escalations: number;
  escalationRate: number;
  avgLatencyMs: number;
  costSavingsUsd: number;
}

export interface CostSimulationResult {
  strategy: string;
  totalCost: number;
  avgQualityScore: number;
  savingsPercent: number;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
