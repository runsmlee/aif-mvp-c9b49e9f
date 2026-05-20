import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { useAnalytics, trackEvent } from '../src/hooks/useAnalytics';

function Harness() {
  useAnalytics();
  return <div>test</div>;
}

describe('useAnalytics', () => {
  beforeEach(() => {
    delete (window as unknown as Record<string, unknown>).aif;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls window.aif.track with "page_view" on mount', () => {
    const track = vi.fn();
    (window as unknown as { aif: typeof window.aif }).aif = { track };

    render(<Harness />);

    expect(track).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith('page_view', expect.objectContaining({
      path: window.location.pathname,
    }));
  });

  it('does not throw when window.aif is undefined', () => {
    expect(() => render(<Harness />)).not.toThrow();
  });

  it('fires page_view exactly once even if the component re-renders', () => {
    const track = vi.fn();
    (window as unknown as { aif: typeof window.aif }).aif = { track };

    const { rerender } = render(<Harness />);
    rerender(<Harness />);

    expect(track).toHaveBeenCalledTimes(1);
  });

  it('trackEvent is a no-op when window.aif is not available', () => {
    expect(() => trackEvent('test_event', { foo: 'bar' })).not.toThrow();
  });

  it('trackEvent delegates to window.aif.track when available', () => {
    const track = vi.fn();
    (window as unknown as { aif: typeof window.aif }).aif = { track };

    trackEvent('custom_event', { key: 'value' });
    expect(track).toHaveBeenCalledWith('custom_event', { key: 'value' });
  });
});
