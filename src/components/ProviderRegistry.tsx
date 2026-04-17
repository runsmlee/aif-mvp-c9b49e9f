import { useState, useCallback } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { DEFAULT_PROVIDERS } from '../data/mockData';
import type { Provider } from '../types';

const STORAGE_KEY = 'routeforge-providers';

export default function ProviderRegistry() {
  const [providers, setProviders] = useLocalStorage<Provider[]>(STORAGE_KEY, DEFAULT_PROVIDERS);
  const [editingProvider, setEditingProvider] = useState<string | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);

  const addProvider = useCallback((providerId: string) => {
    setEditingProvider(providerId);
    setApiKeyInput('');
  }, []);

  const testConnection = useCallback((providerId: string) => {
    // Mark as testing
    setProviders(prev =>
      prev.map(p => p.id === providerId ? { ...p, status: 'testing' as const } : p)
    );

    // Simulate connection test
    setTimeout(() => {
      setProviders(prev =>
        prev.map(p =>
          p.id === providerId
            ? { ...p, status: 'connected' as const, apiKey: apiKeyInput }
            : p
        )
      );
    }, 500);
  }, [apiKeyInput, setProviders]);

  const saveApiKey = useCallback((providerId: string) => {
    if (apiKeyInput.trim()) {
      setProviders(prev =>
        prev.map(p =>
          p.id === providerId ? { ...p, apiKey: apiKeyInput } : p
        )
      );
      testConnection(providerId);
      setEditingProvider(null);
    }
  }, [apiKeyInput, setProviders, testConnection]);

  const removeProvider = useCallback((providerId: string) => {
    setProviders(prev =>
      prev.map(p =>
        p.id === providerId
          ? { ...p, status: 'disconnected' as const, apiKey: undefined }
          : p
      )
    );
    setConfirmRemove(null);
  }, [setProviders]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2.5 mb-2">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="2" width="20" height="8" rx="2" ry="2" /><rect x="2" y="14" width="20" height="8" rx="2" ry="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" />
          </svg>
        </div>
        <div>
          <h2 className="text-base font-semibold text-text-primary">Model Providers</h2>
          <p className="text-xs text-text-muted mt-0.5">
            Manage your LLM provider connections and API keys
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        {providers.map(provider => (
          <div
            key={provider.id}
            className={`bg-surface rounded-xl border p-5 transition-colors duration-200 ${
              provider.status === 'connected' ? 'border-success/20' : 'border-border-subtle hover:border-border'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${
                      provider.status === 'connected' ? 'bg-success' :
                      provider.status === 'testing' ? 'bg-warning animate-[pulse-dot_1.5s_ease-in-out_infinite]' :
                      'bg-text-muted'
                    }`}
                    aria-label={`Status: ${provider.status}`}
                  />
                  {provider.status === 'connected' && (
                    <div className="absolute inset-0 w-2.5 h-2.5 rounded-full bg-success/40 animate-ping" />
                  )}
                </div>
                <h3 className="font-medium text-text-primary text-sm">{provider.name}</h3>
                <span className="text-xs text-text-muted bg-surface-alt px-2 py-0.5 rounded-md tabular-nums">
                  {provider.models.length} models
                </span>
              </div>

              <div className="flex items-center gap-2">
                {provider.status !== 'connected' && (
                  <button
                    onClick={() => addProvider(provider.id)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface-elevated text-text-primary hover:bg-primary hover:text-white transition-colors duration-200 min-h-[32px] border border-border-subtle"
                    aria-label="Add Provider"
                  >
                    Add Provider
                  </button>
                )}
                {provider.status === 'connected' && (
                  <button
                    onClick={() => setConfirmRemove(provider.id)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg text-error hover:bg-error/10 transition-colors duration-200 min-h-[32px]"
                    aria-label="Remove Provider"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            {/* API Key Form */}
            {editingProvider === provider.id && (
              <div className="mt-0 pt-4 border-t border-border-subtle animate-fade-in">
                <label htmlFor={`api-key-${provider.id}`} className="block text-xs text-text-muted mb-2 font-medium">
                  API Key
                </label>
                <div className="flex gap-2">
                  <input
                    id={`api-key-${provider.id}`}
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder="sk-..."
                    className="flex-1 px-3 py-2 bg-surface-alt border border-border rounded-lg text-sm text-text-primary font-mono placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary/30 focus:outline-none transition-all duration-150"
                    aria-label="API key"
                  />
                  <button
                    onClick={() => saveApiKey(provider.id)}
                    className="px-4 py-2 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors duration-200 min-h-[44px] shadow-sm shadow-primary/20"
                    aria-label="Test Connection"
                  >
                    Test Connection
                  </button>
                </div>
              </div>
            )}

            {/* Models list */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {provider.models.map(model => (
                <span
                  key={model.id}
                  className="px-2.5 py-1 text-xs bg-surface-alt/80 rounded-md text-text-secondary border border-border-subtle font-mono"
                >
                  {model.name}
                </span>
              ))}
            </div>

            {/* Remove Confirmation */}
            {confirmRemove === provider.id && (
              <div className="mt-4 pt-4 border-t border-border-subtle bg-error/5 -mx-5 px-5 -mb-5 pb-5 rounded-b-xl animate-fade-in">
                <p className="text-sm text-text-secondary mb-3">
                  Are you sure you want to remove <span className="font-medium text-text-primary">{provider.name}</span>? This will disconnect the provider.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => removeProvider(provider.id)}
                    className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-error text-white hover:bg-error/90 transition-colors duration-150 min-h-[32px]"
                  >
                    Yes, Remove
                  </button>
                  <button
                    onClick={() => setConfirmRemove(null)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-surface-elevated text-text-primary hover:bg-surface-alt transition-colors duration-150 min-h-[32px] border border-border-subtle"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
