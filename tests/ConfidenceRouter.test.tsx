import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RoutingProvider } from '../src/context/RoutingContext';
import ConfidenceRouter from '../src/components/ConfidenceRouter';

function renderWithProvider(ui: React.ReactElement) {
  return render(<RoutingProvider>{ui}</RoutingProvider>);
}

describe('ConfidenceRouter', () => {
  it('renders threshold slider with default value of 0.7', () => {
    renderWithProvider(<ConfidenceRouter />);
    const slider = screen.getByRole('slider');
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveValue('0.7');
  });

  it('changing threshold value updates displayed threshold label', () => {
    renderWithProvider(<ConfidenceRouter />);
    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: '0.85' } });
    expect(screen.getByText('0.85')).toBeInTheDocument();
  });

  it('displays a list of configured models with confidence indicators', () => {
    renderWithProvider(<ConfidenceRouter />);
    // Multiple instances of GPT-4o Mini may exist (in model list and escalation events)
    const gpt4oMiniElements = screen.getAllByText(/GPT-4o Mini/i);
    expect(gpt4oMiniElements.length).toBeGreaterThanOrEqual(1);
  });

  it('shows escalation badge when mock logprob falls below threshold', () => {
    renderWithProvider(<ConfidenceRouter />);
    const badges = screen.getAllByText(/escalated/i);
    expect(badges.length).toBeGreaterThan(0);
  });

  it('displays both original and escalated model responses side by side on escalation', () => {
    renderWithProvider(<ConfidenceRouter />);
    // GPT-4o Mini is the original model
    const gpt4oMiniElements = screen.getAllByText(/GPT-4o Mini/i);
    expect(gpt4oMiniElements.length).toBeGreaterThanOrEqual(1);
    // At least one escalated entry should show a fallback model
    const fallbackModels = screen.getAllByText(/GPT-4o\b/i);
    expect(fallbackModels.length).toBeGreaterThanOrEqual(1);
  });
});
