import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouting } from '../context/RoutingContext';
import { AVAILABLE_MODELS } from '../data/mockData';
import type { FallbackEntry, Model } from '../types';

const CONDITION_TYPES = [
  { value: 'confidence', label: 'Confidence', unit: 'logprob', placeholder: '-1.5' },
  { value: 'timeout', label: 'Timeout', unit: 'ms', placeholder: '5000' },
  { value: 'error_code', label: 'Error Code', unit: 'code', placeholder: '429,500' },
  { value: 'cost_ceiling', label: 'Cost Ceiling', unit: '$/1k tokens', placeholder: '5.00' },
] as const;

export default function FallbackChain() {
  const { fallbackChain, setFallbackChain, showToast } = useRouting();
  const [showDropdown, setShowDropdown] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [editingCondition, setEditingCondition] = useState<string | null>(null);
  const [editConditionType, setEditConditionType] = useState<FallbackEntry['conditionType']>('confidence');
  const [editConditionValue, setEditConditionValue] = useState('-1.5');
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const updateCondition = useCallback((entryId: string, type: FallbackEntry['conditionType'], value: string) => {
    setFallbackChain(prev =>
      prev.map(e => e.id === entryId ? { ...e, conditionType: type, conditionValue: value } : e)
    );
    setEditingCondition(null);
  }, [setFallbackChain]);

  const startEditCondition = useCallback((entry: FallbackEntry) => {
    setEditingCondition(entry.id);
    setEditConditionType(entry.conditionType);
    setEditConditionValue(entry.conditionValue);
  }, []);

  const handleSave = useCallback(() => {
    if (fallbackChain.length >= 3) {
      showToast('Fallback chain saved successfully');
    }
  }, [fallbackChain.length, showToast]);

  const availableModels = AVAILABLE_MODELS.filter(
    m => !fallbackChain.some(e => e.model.id === m.id)
  );

  const getConditionLabel = (type: FallbackEntry['conditionType']): string => {
    return CONDITION_TYPES.find(c => c.value === type)?.label ?? type;
  };

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
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-muted bg-surface-alt px-2.5 py-1 rounded-md border border-border-subtle tabular-nums">
                {fallbackChain.length} model{fallbackChain.length !== 1 ? 's' : ''}
              </span>
              <button
                type="button"
                onClick={handleSave}
                disabled={fallbackChain.length < 3}
                className="px-4 py-2.5 text-sm font-medium rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors duration-200 active:scale-[0.97] shadow-sm shadow-primary/20 min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Save chain"
              >
                Save Chain
              </button>
            </div>
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
              className={`bg-surface-alt/60 rounded-lg border transition-all duration-200 group ${
                editingCondition === entry.id ? 'border-primary/40 p-3.5' : 'border-border-subtle hover:border-border p-3.5'
              }`}
              role="listitem"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-7 h-7 text-xs font-mono font-bold text-text-muted bg-surface rounded-md border border-border-subtle group-hover:border-primary/30 transition-colors duration-200">
                    {index + 1}
                  </span>
                  <div>
                    <span className="text-sm font-medium text-text-primary">{entry.model.name}</span>
                    {editingCondition !== entry.id && (
                      <button
                        type="button"
                        onClick={() => startEditCondition(entry)}
                        className="text-xs text-primary/70 hover:text-primary ml-2 transition-colors duration-150 underline decoration-dotted underline-offset-2"
                        aria-label={`Edit condition for ${entry.model.name}`}
                      >
                        when {getConditionLabel(entry.conditionType).toLowerCase()} &lt; {entry.conditionValue}
                      </button>
                    )}
                  </div>
                  {/* Connection line between entries */}
                  {index < fallbackChain.length - 1 && editingCondition !== entry.id && (
                    <span className="hidden sm:inline text-text-muted/40 text-xs ml-2">
                      &rarr;
                    </span>
                  )}
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

              {/* Inline condition editor */}
              {editingCondition === entry.id && (
                <div className="mt-3 pt-3 border-t border-border-subtle animate-fade-in">
                  <p className="text-xs text-text-muted mb-2 font-medium">Escalation Condition</p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="sm:w-40">
                      <label htmlFor={`cond-type-${entry.id}`} className="sr-only">Condition type</label>
                      <select
                        id={`cond-type-${entry.id}`}
                        value={editConditionType}
                        onChange={(e) => {
                          const newType = e.target.value as FallbackEntry['conditionType'];
                          setEditConditionType(newType);
                          const condInfo = CONDITION_TYPES.find(c => c.value === newType);
                          if (condInfo) setEditConditionValue(condInfo.placeholder);
                        }}
                        className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary focus:border-primary focus:ring-1 focus:ring-primary/30 focus:outline-none"
                      >
                        {CONDITION_TYPES.map(ct => (
                          <option key={ct.value} value={ct.value}>{ct.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label htmlFor={`cond-val-${entry.id}`} className="sr-only">Condition value</label>
                      <input
                        id={`cond-val-${entry.id}`}
                        type="text"
                        value={editConditionValue}
                        onChange={(e) => setEditConditionValue(e.target.value)}
                        placeholder={CONDITION_TYPES.find(c => c.value === editConditionType)?.placeholder}
                        className="w-full px-3 py-2 bg-surface border border-border rounded-lg text-sm text-text-primary font-mono placeholder:text-text-muted focus:border-primary focus:ring-1 focus:ring-primary/30 focus:outline-none"
                      />
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => updateCondition(entry.id, editConditionType, editConditionValue)}
                        className="px-3 py-2 text-xs font-medium rounded-lg bg-primary text-white hover:bg-primary-hover transition-colors duration-200 min-h-[36px]"
                        aria-label="Apply condition"
                      >
                        Apply
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCondition(null)}
                        className="px-3 py-2 text-xs font-medium rounded-lg bg-surface-elevated text-text-primary hover:bg-surface-alt transition-colors duration-200 min-h-[36px] border border-border-subtle"
                        aria-label="Cancel editing"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
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
                  className="w-full text-left px-4 py-2.5 text-sm text-text-primary hover:bg-surface-elevated transition-colors duration-150 first:rounded-t-lg last:rounded-b-lg border-b border-border-subtle last:border-0 flex items-center justify-between"
                  role="option"
                  aria-selected={false}
                >
                  <span>
                    <span className="font-medium">{model.name}</span>
                    <span className="text-text-muted ml-2 text-xs">({model.provider})</span>
                  </span>
                  <span className="text-xs text-text-muted font-mono">${model.costPer1kTokens}/1k</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chain recommendation */}
        {fallbackChain.length > 0 && fallbackChain.length < 3 && (
          <div className="mt-4 p-3 bg-warning/5 border border-warning/10 rounded-lg flex items-start gap-2">
            <svg className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <div>
              <p className="text-xs font-medium text-warning">Recommended: Add at least 3 models with distinct conditions</p>
              <p className="text-xs text-text-muted mt-0.5">Use different condition types (confidence, timeout, error code, cost ceiling) for robust fallback coverage. Click a condition to edit it.</p>
            </div>
          </div>
        )}

        {/* Chain overview when fully configured */}
        {fallbackChain.length >= 3 && (
          <div className="mt-4 p-3 bg-success/5 border border-success/10 rounded-lg flex items-start gap-2">
            <svg className="w-4 h-4 text-success flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <div>
              <p className="text-xs font-medium text-success">Chain configured with {fallbackChain.length} models</p>
              <p className="text-xs text-text-muted mt-0.5">
                {fallbackChain.filter((e, i, arr) => arr.findIndex(x => x.conditionType === e.conditionType) === i).length} distinct condition type{fallbackChain.filter((e, i, arr) => arr.findIndex(x => x.conditionType === e.conditionType) === i).length !== 1 ? 's' : ''} active. Click any condition label to customize.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
