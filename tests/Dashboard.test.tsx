import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RoutingProvider } from '../src/context/RoutingContext';
import Dashboard from '../src/components/Dashboard';

function renderWithProvider(ui: React.ReactElement) {
  return render(<RoutingProvider>{ui}</RoutingProvider>);
}

describe('Dashboard', () => {
  it('renders without crash', () => {
    renderWithProvider(<Dashboard />);
    expect(screen.getByText((_content, element) => element?.tagName === 'H1' && element?.textContent === 'LogRoute', { exact: false })).toBeInTheDocument();
  });

  it('displays all four main navigation tabs: Router, Fallbacks, Analytics, Providers', () => {
    renderWithProvider(<Dashboard />);
    expect(screen.getByRole('tab', { name: /router/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /fallbacks/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /analytics/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /providers/i })).toBeInTheDocument();
  });

  it('active tab highlights correctly on click', async () => {
    renderWithProvider(<Dashboard />);
    const fallbacksTab = screen.getByRole('tab', { name: /fallbacks/i });

    expect(fallbacksTab).toHaveAttribute('aria-selected', 'false');
    await userEvent.click(fallbacksTab);
    expect(fallbacksTab).toHaveAttribute('aria-selected', 'true');
  });

  it('shows "No routing rules configured" when no rules exist', () => {
    renderWithProvider(<Dashboard />);
    expect(screen.getByText(/no routing rules configured/i)).toBeInTheDocument();
  });
});
