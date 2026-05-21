import { Component, type ReactNode, type ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="bg-error/10 border border-error/20 rounded-xl p-6 text-center" role="alert">
          <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-3">
            <svg className="w-5 h-5 text-error" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="text-error text-sm font-medium mb-1">Something went wrong</p>
          <p className="text-text-muted text-xs">{this.state.error?.message || 'An unexpected error occurred'}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Top-level error boundary that wraps the entire application.
 * If the app fails to render for any reason, this shows a full-page
 * visible error state instead of a blank white screen.
 */
interface TopLevelProps {
  children: ReactNode;
}

interface TopLevelState {
  hasError: boolean;
  error: Error | null;
}

export class TopLevelErrorBoundary extends Component<TopLevelProps, TopLevelState> {
  constructor(props: TopLevelProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): TopLevelState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[RouteForge] Fatal render error:', error, errorInfo);
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '2rem',
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
            color: '#F9FAFB',
            background: '#030712',
            textAlign: 'center',
          }}
          role="alert"
        >
          <div style={{ marginBottom: '1.5rem' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#B91C1C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
            RouteForge failed to load
          </h1>
          <p style={{ color: '#9CA3AF', maxWidth: '24rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            The application encountered an unexpected error. Please try reloading the page.
          </p>
          {this.state.error && (
            <p style={{ color: '#6B7280', fontSize: '0.75rem', marginBottom: '1.5rem', maxWidth: '24rem', wordBreak: 'break-word' }}>
              {this.state.error.message}
            </p>
          )}
          <button
            type="button"
            onClick={this.handleReload}
            style={{
              padding: '0.5rem 1.5rem',
              background: '#B91C1C',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
