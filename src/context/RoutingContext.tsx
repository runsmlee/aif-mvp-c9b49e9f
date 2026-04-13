import { createContext, useContext, useState, useCallback, type ReactNode, type Dispatch, type SetStateAction } from 'react';
import type { RoutingEvent, FallbackEntry, ToastMessage } from '../types';
import { MOCK_ROUTING_EVENTS } from '../data/mockData';

interface RoutingContextType {
  events: RoutingEvent[];
  addEvent: (event: RoutingEvent) => void;
  fallbackChain: FallbackEntry[];
  setFallbackChain: Dispatch<SetStateAction<FallbackEntry[]>>;
  threshold: number;
  setThreshold: (t: number) => void;
  toasts: ToastMessage[];
  showToast: (message: string, type?: ToastMessage['type']) => void;
  removeToast: (id: string) => void;
}

const RoutingContext = createContext<RoutingContextType | null>(null);

export function RoutingProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<RoutingEvent[]>(MOCK_ROUTING_EVENTS);
  const [fallbackChain, setFallbackChain] = useState<FallbackEntry[]>([]);
  const [threshold, setThreshold] = useState(0.7);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addEvent = useCallback((event: RoutingEvent) => {
    setEvents(prev => [event, ...prev]);
  }, []);

  const showToast = useCallback((message: string, type: ToastMessage['type'] = 'success') => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <RoutingContext.Provider value={{
      events,
      addEvent,
      fallbackChain,
      setFallbackChain,
      threshold,
      setThreshold,
      toasts,
      showToast,
      removeToast,
    }}>
      {children}
    </RoutingContext.Provider>
  );
}

export function useRouting(): RoutingContextType {
  const ctx = useContext(RoutingContext);
  if (!ctx) throw new Error('useRouting must be used within RoutingProvider');
  return ctx;
}
