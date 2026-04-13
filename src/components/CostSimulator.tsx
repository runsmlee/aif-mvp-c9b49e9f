import { useState, useCallback } from 'react';
import { generateCostSimulation } from '../data/mockData';
import type { CostSimulationResult } from '../types';

export default function CostSimulator() {
  const [volume, setVolume] = useState('10000');
  const [results, setResults] = useState<CostSimulationResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSimulate = useCallback(() => {
    const numVolume = parseInt(volume, 10);
    if (isNaN(numVolume) || numVolume <= 0) {
      setError('Please enter a positive number for monthly request volume');
      setResults(null);
      return;
    }
    setError(null);
    setResults(generateCostSimulation(numVolume));
  }, [volume]);

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <section className="bg-surface rounded-xl border border-border p-6" aria-label="Cost simulator input">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-text-primary">Cost Simulator</h2>
            <p className="text-xs text-text-muted mt-0.5">
              Compare routing strategies to find the optimal cost-quality balance
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-5">
          <div className="flex-1">
            <label htmlFor="volume-input" className="block text-xs text-text-muted mb-1.5 font-medium">
              Monthly Request Volume
            </label>
            <input
              id="volume-input"
              type="number"
              value={volume}
              onChange={(e) => setVolume(e.target.value)}
              className="w-full px-4 py-2 bg-surface-alt border border-border-subtle rounded-lg text-text-primary font-mono text-sm focus:border-primary focus:ring-1 focus:ring-primary/30 focus:outline-none transition-all duration-150 tabular-nums"
              placeholder="e.g. 10000"
              aria-label="Monthly request volume"
              min="1"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleSimulate}
              className="w-full sm:w-auto px-6 py-2.5 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors duration-200 active:scale-[0.97] min-h-[44px] shadow-sm shadow-primary/20"
              aria-label="Simulate"
            >
              Simulate
            </button>
          </div>
        </div>
        {error && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 bg-error/10 border border-error/20 rounded-lg" role="alert">
            <svg className="w-4 h-4 text-error flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p className="text-sm text-error">{error}</p>
          </div>
        )}
      </section>

      {/* Results Table */}
      {results && (
        <section className="bg-surface rounded-xl border border-border p-6 animate-fade-in" aria-label="Simulation results">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-success" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h2 className="text-base font-semibold text-text-primary">Strategy Comparison</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-text-muted font-medium text-xs uppercase tracking-wider">Strategy</th>
                  <th className="text-right py-3 px-4 text-text-muted font-medium text-xs uppercase tracking-wider">Total Cost</th>
                  <th className="text-right py-3 px-4 text-text-muted font-medium text-xs uppercase tracking-wider">Avg Quality</th>
                  <th className="text-right py-3 px-4 text-text-muted font-medium text-xs uppercase tracking-wider">Savings</th>
                </tr>
              </thead>
              <tbody>
                {results.map(result => (
                  <tr
                    key={result.strategy}
                    className={`border-b border-border-subtle last:border-0 transition-colors duration-150 ${
                      result.strategy === 'Confidence-Routed' ? 'bg-success/5' : 'hover:bg-surface-alt/40'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-medium text-text-primary text-sm">
                      {result.strategy}
                      {result.strategy === 'Confidence-Routed' && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 text-xs font-semibold bg-success/15 text-success rounded-full border border-success/20">
                          <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Recommended
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-text-primary tabular-nums">
                      ${result.totalCost.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-text-secondary tabular-nums">
                      {result.avgQualityScore.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums" data-testid={`savings-${result.strategy.toLowerCase().replace(/\s+/g, '-')}`}>
                      <span className={result.savingsPercent > 0 ? 'text-success font-semibold' : 'text-text-muted'}>
                        {result.savingsPercent > 0 ? `${result.savingsPercent}%` : '—'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}
