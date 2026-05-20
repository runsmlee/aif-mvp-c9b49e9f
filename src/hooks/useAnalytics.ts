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
  }
}

/**
 * Hook that fires a `page_view` analytics event on initial mount.
 * This is the minimum required analytics integration per the platform
 * contract — it supplements the auto-tracking done by aif.js from
 * the HTML meta tags.
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
    trackEvent('page_view', {
      path: window.location.pathname,
      ...(mvpId ? { mvp_id: mvpId } : {}),
    });
  }, []);
}
