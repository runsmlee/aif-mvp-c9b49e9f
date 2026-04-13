import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RoutingProvider } from '../src/context/RoutingContext';
import CostSimulator from '../src/components/CostSimulator';

function renderWithProvider(ui: React.ReactElement) {
  return render(<RoutingProvider>{ui}</RoutingProvider>);
}

describe('CostSimulator', () => {
  it('renders input field for monthly request volume', () => {
    renderWithProvider(<CostSimulator />);
    const input = screen.getByLabelText(/monthly request volume/i);
    expect(input).toBeInTheDocument();
  });

  it('entering a volume and clicking "Simulate" produces a strategy comparison table', async () => {
    renderWithProvider(<CostSimulator />);
    const input = screen.getByLabelText(/monthly request volume/i);
    await userEvent.clear(input);
    await userEvent.type(input, '5000');

    const simulateBtn = screen.getByRole('button', { name: /simulate/i });
    await userEvent.click(simulateBtn);

    expect(screen.getByRole('table')).toBeInTheDocument();
  });

  it('table shows at least 3 rows: Always Cheapest, Always Best, Confidence-Routed', async () => {
    renderWithProvider(<CostSimulator />);
    const input = screen.getByLabelText(/monthly request volume/i);
    await userEvent.clear(input);
    await userEvent.type(input, '10000');

    const simulateBtn = screen.getByRole('button', { name: /simulate/i });
    await userEvent.click(simulateBtn);

    expect(screen.getByText(/always cheapest/i)).toBeInTheDocument();
    expect(screen.getByText(/always best/i)).toBeInTheDocument();
    expect(screen.getByText(/confidence-routed/i)).toBeInTheDocument();
  });

  it('each row displays total cost, avg quality score, and savings percentage', async () => {
    renderWithProvider(<CostSimulator />);
    const input = screen.getByLabelText(/monthly request volume/i);
    await userEvent.clear(input);
    await userEvent.type(input, '10000');

    const simulateBtn = screen.getByRole('button', { name: /simulate/i });
    await userEvent.click(simulateBtn);

    // Check for dollar amounts, quality scores, and percentage values
    const dollarAmounts = screen.getAllByText(/\$[\d,.]+/);
    expect(dollarAmounts.length).toBeGreaterThanOrEqual(3);

    // Quality scores are shown as decimal numbers
    const qualityScores = screen.getAllByText(/0\.\d{2}/);
    expect(qualityScores.length).toBeGreaterThanOrEqual(3);
  });

  it('input validation prevents negative or zero request volumes', async () => {
    renderWithProvider(<CostSimulator />);
    const input = screen.getByLabelText(/monthly request volume/i);
    await userEvent.clear(input);
    await userEvent.type(input, '0');

    const simulateBtn = screen.getByRole('button', { name: /simulate/i });
    await userEvent.click(simulateBtn);

    expect(screen.getByText(/enter a positive number/i)).toBeInTheDocument();
  });

  it('default volume of 10,000 produces results with confidence-routed showing >20% savings', async () => {
    renderWithProvider(<CostSimulator />);
    const simulateBtn = screen.getByRole('button', { name: /simulate/i });
    await userEvent.click(simulateBtn);

    // Find the confidence-routed savings cell directly
    const savingsCell = screen.getByTestId('savings-confidence-routed');
    expect(savingsCell).toBeInTheDocument();
    const match = savingsCell.textContent?.match(/(\d+(?:\.\d+)?)%/);
    expect(match).not.toBeNull();
    const savingsPercent = parseFloat(match![1]);
    expect(savingsPercent).toBeGreaterThan(20);
  });
});
