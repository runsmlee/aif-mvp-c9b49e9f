import { useEffect, useRef } from 'react';

/**
 * Tracks a custom analytics event via the aif.js analytics snippet.
 * Events are only sent when window.aif is available (i.e., the aif.js
 * script has loaded). Uses optional chaining to avoid errors when the
 * script is blocked or fails to load.
 */
export function trackEvent(event: string, props?: Record<string, unknown>): void {
  if (typeof window !== 'undefined' && window.aif?.track) {
    window.aif.track(event, props);
    console.log('[aif] event tracked:', event, props);
  } else {
    console.warn('[aif] window.aif not available — event not tracked:', event);
  }
}

/** Maximum number of retries to wait for the analytics script to load. */
const MAX_RETRIES = 10;
/** Delay between retries in milliseconds. */
const RETRY_DELAY_MS = 500;

/**
 * Attempt to fire the page_view event, retrying if the analytics
 * script has not loaded yet. This handles the race condition where
 * the async aif.js script loads after the React app mounts.
 */
function firePageViewWithRetry(mvpId: string | undefined, attempt: number = 0): void {
  if (window.aif?.track) {
    window.aif.track('page_view', {
      path: window.location.pathname,
      ...(mvpId ? { mvp_id: mvpId } : {}),
    });
    console.log('[aif] page_view tracked successfully (attempt ' + (attempt + 1) + ')');
    return;
  }

  if (attempt < MAX_RETRIES) {
    setTimeout(() => firePageViewWithRetry(mvpId, attempt + 1), RETRY_DELAY_MS);
  } else {
    console.warn('[aif] page_view not tracked after ' + MAX_RETRIES + ' retries — analytics script may have failed to load');
  }
}

/**
 * Hook that fires a `page_view` analytics event on initial mount.
 * Uses a retry mechanism to handle the race condition between the
 * async aif.js script and the React app mounting.
 *
 * The MVP ID is read from import.meta.env.VITE_MVP_ID so that even
 * if the HTML `%VITE_MVP_ID%` placeholder was not replaced at build
 * time (e.g., missing env var), the JS-level value is still passed
 * as a prop, giving the analytics backend a second chance to
 * attribute the event correctly.
 */
export function useAnalytics(): void {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    const mvpId = import.meta.env.VITE_MVP_ID;
    firePageViewWithRetry(mvpId);
  }, []);
}
