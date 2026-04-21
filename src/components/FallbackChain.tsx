import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouting } from '../context/RoutingContext';
import { AVAILABLE_MODELS } from '../data/mockData';
import type { FallbackEntry, Model } from '../types';

export default function FallbackChain() {
  const { fallbackChain, setFallbackChain, showToast } = useRouting();
  const [showDropdown, setShowDropdown] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside or Escape key
  useEffect(() => {
    if (!showDropdown) return;

    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }

    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setShowDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showDropdown]);

  const addModel = useCallback((model: Model) => {
    const entry: FallbackEntry = {
      id: crypto.randomUUID(),
      model,
      conditionType: 'confidence',
      conditionValue: '-1.5',
    };
    setFallbackChain(prev => [...prev, entry]);
    setShowDropdown(false);
  }, [setFallbackChain]);

  const removeModel = useCallback((id: string) => {
    setFallbackChain(prev => prev.filter(e => e.id !== id));
    setConfirmRemove(null);
  }, [setFallbackChain]);

  const moveEntry = useCallback((index: number, direction: 'up' | 'down') => {
    setFallbackChain(prev => {
      const next = [...prev];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
      return next;
    });
  }, [setFallbackChain]);

  const handleSave = useCallback(() => {
    if (fallbackChain.length >= 3) {
      showToast('Fallback chain saved successfully');
    }
  }, [fallbackChain.length, showToast]);

  const availableModels = AVAILABLE_MODELS.filter(
    m => !fallbackChain.some(e => e.model.id === m.id)
  );

  return (
    <div className="space-y-6">
      <section className="bg-surface rounded-xl border border-border p-6" aria-label="Fallback chain editor">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <svg className="w-4 h-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <line x1="10" y1="6" x2="21" y2="6" /><path d="M21 6l-3-3" /><path d="M21 6l-3 3" /><line x1="3" y1="12" x2="14" y2="12" /><path d="M14 12l-3-3" /><path d="M14 12l-3 3" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-text-primary">Fallback Chain</h2>
              <p className="text-sm text-text-muted mt-0.5">
                Define the ordered list of models for escalation
              </p>
            </div>
          </div>
          {fallbackChain.length > 0 && (
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-2.5 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors duration-200 active:scale-[0.97] shadow-sm shadow-primary/20 min-h-[44px]"
              aria-label="Save chain"
            >
              Save Chain
            </button>
          )}
        </div>

        {/* Chain entries */}
        <div className="space-y-2 mb-4" role="list" aria-label="Fallback chain entries">
          {fallbackChain.length === 0 && (
            <div className="text-center py-12 text-text-muted">
              <div className="w-12 h-12 rounded-full bg-surface-alt flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
                </svg>
              </div>
              <p className="text-sm font-medium text-text-secondary mb-1">No models in fallback chain</p>
              <p className="text-xs">Click &quot;Add Model&quot; to get started</p>
            </div>
          )}

          {fallbackChain.map((entry, index) => (
            <div
              key={entry.id}
              className="flex items-center justify-between p-3.5 bg-surface-alt/60 rounded-lg border border-border-subtle hover:border-border transition-colors duration-200 group"
              role="listitem"
            >
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-7 h-7 text-xs font-mono font-bold text-text-muted bg-surface rounded-md border border-border-subtle">
                  {index + 1}
                </span>
                <div>
                  <span className="text-sm font-medium text-text-primary">{entry.model.name}</span>
                  <span className="text-xs text-text-muted ml-2">
                    when {entry.conditionType} &lt; {entry.conditionValue}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={() => moveEntry(index, 'up')}
                  disabled={index === 0}
                  className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-elevated rounded-md disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all duration-150 min-w-[32px] min-h-[32px] flex items-center justify-center"
                  aria-label="Move up"
                  title="Move up"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => moveEntry(index, 'down')}
                  disabled={index === fallbackChain.length - 1}
                  className="p-2 text-text-muted hover:text-text-primary hover:bg-surface-elevated rounded-md disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all duration-150 min-w-[32px] min-h-[32px] flex items-center justify-center"
                  aria-label="Move down"
                  title="Move down"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {confirmRemove === entry.id ? (
                  <button
                    type="button"
                    onClick={() => removeModel(entry.id)}
                    className="px-3 py-1.5 text-xs font-semibold text-error hover:bg-error/10 rounded-md transition-colors duration-150 min-h-[32px]"
                    aria-label="Confirm remove"
                  >
                    Confirm
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmRemove(entry.id)}
                    className="p-2 text-text-muted hover:text-error hover:bg-error/10 rounded-md transition-all duration-150 min-w-[32px] min-h-[32px] flex items-center justify-center"
                    aria-label="Remove"
                    title="Remove from chain"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add Model */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            disabled={availableModels.length === 0}
            className="w-full px-4 py-2.5 text-sm font-medium rounded-lg border border-dashed border-border text-text-secondary hover:border-primary/50 hover:text-primary hover:bg-primary/5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border disabled:hover:text-text-secondary disabled:hover:bg-transparent min-h-[44px]"
            aria-label="Add Model"
            aria-haspopup="listbox"
            aria-expanded={showDropdown}
          >
            <span className="flex items-center justify-center gap-1.5">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Model
            </span>
          </button>

          {showDropdown && availableModels.length > 0 && (
            <div
              className="absolute z-10 mt-1.5 w-full bg-surface-alt border border-border rounded-lg shadow-xl shadow-black/30 max-h-48 overflow-y-auto animate-fade-in"
              role="listbox"
              aria-label="Select a model"
            >
              {availableModels.map(model => (
                <button
                  type="button"
                  key={model.id}
                  onClick={() => addModel(model)}
                  className="w-full text-left px-4 py-2.5 text-sm text-text-primary hover:bg-surface-elevated transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg border-b border-border-subtle last:border-0"
                  role="option"
                  aria-selected={false}
                >
                  <span className="font-medium">{model.name}</span>
                  <span className="text-text-muted ml-2 text-xs">({model.provider})</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
