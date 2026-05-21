import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ErrorBoundary, TopLevelErrorBoundary } from '../src/components/ErrorBoundary';

function ThrowingChild({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test error message');
  }
  return <div data-testid="child-content">Child rendered successfully</div>;
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders children when no error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={false} />
      </ErrorBoundary>,
    );
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('renders error UI when child throws', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('displays error message in error state', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    render(
      <ErrorBoundary fallback={<div>Custom fallback</div>}>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByText('Custom fallback')).toBeInTheDocument();
  });

  it('error state has role="alert" for accessibility', () => {
    render(
      <ErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </ErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});

describe('TopLevelErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('renders children when no error occurs', () => {
    render(
      <TopLevelErrorBoundary>
        <ThrowingChild shouldThrow={false} />
      </TopLevelErrorBoundary>,
    );
    expect(screen.getByTestId('child-content')).toBeInTheDocument();
  });

  it('renders full-page error state when child throws', () => {
    render(
      <TopLevelErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </TopLevelErrorBoundary>,
    );
    expect(screen.getByText('RouteForge failed to load')).toBeInTheDocument();
  });

  it('shows reload button in error state', () => {
    render(
      <TopLevelErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </TopLevelErrorBoundary>,
    );
    expect(screen.getByRole('button', { name: /reload page/i })).toBeInTheDocument();
  });

  it('displays error message in error state', () => {
    render(
      <TopLevelErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </TopLevelErrorBoundary>,
    );
    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });

  it('error state has role="alert" for accessibility', () => {
    render(
      <TopLevelErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </TopLevelErrorBoundary>,
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('reload button is present and clickable in error state', async () => {
    render(
      <TopLevelErrorBoundary>
        <ThrowingChild shouldThrow={true} />
      </TopLevelErrorBoundary>,
    );

    const reloadButton = screen.getByRole('button', { name: /reload page/i });
    expect(reloadButton).toBeInTheDocument();
    expect(reloadButton).toBeEnabled();
  });
});
