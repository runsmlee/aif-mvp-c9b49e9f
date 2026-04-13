import { useRouting } from '../context/RoutingContext';

export function ToastContainer() {
  const { toasts, removeToast } = useRouting();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
      role="status"
      aria-live="polite"
    >
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-xl text-sm font-medium shadow-xl shadow-black/20 backdrop-blur-sm min-w-[280px] cursor-pointer animate-slide-in-right border
            ${toast.type === 'success' ? 'bg-success/90 border-success/30 text-white' : ''}
            ${toast.type === 'error' ? 'bg-error/90 border-error/30 text-white' : ''}
            ${toast.type === 'info' ? 'bg-surface-elevated/90 border-border text-text-primary' : ''}
          `}
          onClick={() => removeToast(toast.id)}
          role="alert"
        >
          <div className="flex items-center gap-2.5">
            {toast.type === 'success' && (
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
            {toast.type === 'error' && (
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            )}
            {toast.type === 'info' && (
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
