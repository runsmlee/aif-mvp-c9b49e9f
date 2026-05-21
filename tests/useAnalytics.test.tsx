import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { useAnalytics, trackEvent } from '../src/hooks/useAnalytics';

function Harness() {
  useAnalytics();
  return <div>test</div>;
}

describe('useAnalytics', () => {
  beforeEach(() => {
    delete (window as unknown as Record<string, unknown>).aif;
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
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

  it('retries page_view when window.aif is not initially available', () => {
    // aif is not available on mount
    const track = vi.fn();

    render(<Harness />);

    // After first attempt failed, simulate aif loading after delay
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Still no aif — no call yet
    expect(track).not.toHaveBeenCalled();

    // Now make aif available
    (window as unknown as { aif: typeof window.aif }).aif = { track };

    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Should have been called on the retry
    expect(track).toHaveBeenCalledTimes(1);
    expect(track).toHaveBeenCalledWith('page_view', expect.objectContaining({
      path: window.location.pathname,
    }));
  });

  it('tracks page_view immediately when aif is already loaded', () => {
    const track = vi.fn();
    (window as unknown as { aif: typeof window.aif }).aif = { track };

    render(<Harness />);

    // Should fire immediately without any timer advancement
    expect(track).toHaveBeenCalledTimes(1);
  });
});
