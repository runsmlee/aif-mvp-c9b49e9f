import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RoutingProvider } from '../src/context/RoutingContext';
import RequestLogInspector from '../src/components/RequestLogInspector';

function renderWithProvider(ui: React.ReactElement) {
  return render(<RoutingProvider>{ui}</RoutingProvider>);
}

describe('RequestLogInspector', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  it('renders a table with columns: Timestamp, Model, Confidence, Latency, Decision', () => {
    renderWithProvider(<RequestLogInspector />);
    expect(screen.getByRole('columnheader', { name: /timestamp/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /model/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /confidence/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /latency/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /decision/i })).toBeInTheDocument();
  });

  it('displays at least 10 mock log entries', () => {
    renderWithProvider(<RequestLogInspector />);
    const rows = screen.getAllByRole('row');
    // +1 for header row
    expect(rows.length).toBeGreaterThanOrEqual(11);
  });

  it('filter by model name narrows visible entries correctly', async () => {
    renderWithProvider(<RequestLogInspector />);
    const filterInput = screen.getByLabelText(/filter by model/i);
    await userEvent.type(filterInput, 'GPT-4o Mini');

    const rows = screen.getAllByRole('row');
    // All data rows should reference GPT-4o Mini
    const dataRows = rows.slice(1); // skip header
    dataRows.forEach(row => {
      expect(row.textContent).toContain('GPT-4o Mini');
    });
  });

  it('filter by decision type (accepted/escalated) narrows entries correctly', async () => {
    renderWithProvider(<RequestLogInspector />);
    const escalatedFilter = screen.getByLabelText(/filter by decision/i);
    await userEvent.selectOptions(escalatedFilter, 'escalated');

    const rows = screen.getAllByRole('row');
    const dataRows = rows.slice(1);
    dataRows.forEach(row => {
      expect(row.textContent).toMatch(/escalated/i);
    });
  });

  it('filter updates render within 200ms threshold', async () => {
    renderWithProvider(<RequestLogInspector />);
    const filterInput = screen.getByLabelText(/filter by model/i);

    const start = performance.now();
    await userEvent.type(filterInput, 'Claude');
    // Re-render should be near-instant in test env
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(200);
  });

  it('empty filter results show "No matching requests" message', async () => {
    renderWithProvider(<RequestLogInspector />);
    const filterInput = screen.getByLabelText(/filter by model/i);
    await userEvent.type(filterInput, 'NonExistentModel');

    expect(screen.getByText(/no matching requests/i)).toBeInTheDocument();
  });
});
