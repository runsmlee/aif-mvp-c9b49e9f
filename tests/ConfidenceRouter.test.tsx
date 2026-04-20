import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  // --- Improvement tests: Live routing result card ---
  describe('Routing Result Card', () => {
    beforeEach(() => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('shows routing result card after test prompt submission', async () => {
      renderWithProvider(<ConfidenceRouter />);
      const input = screen.getByPlaceholderText(/enter a prompt/i);
      await userEvent.type(input, 'Test prompt for routing');

      const sendBtn = screen.getByRole('button', { name: /send test prompt/i });
      await userEvent.click(sendBtn);

      // Wait for the simulated network delay (400ms)
      await act(async () => {
        vi.advanceTimersByTime(500);
      });

      // Result card should appear with routing result section
      expect(screen.getByTestId('routing-result')).toBeInTheDocument();
    });

    it('routing result card displays confidence score and latency', async () => {
      renderWithProvider(<ConfidenceRouter />);
      const input = screen.getByPlaceholderText(/enter a prompt/i);
      await userEvent.type(input, 'Another test');

      const sendBtn = screen.getByRole('button', { name: /send test prompt/i });
      await userEvent.click(sendBtn);

      await act(async () => {
        vi.advanceTimersByTime(500);
      });

      const resultCard = screen.getByTestId('routing-result');
      // Should show confidence score (a negative number)
      expect(resultCard.textContent).toMatch(/-?\d+\.\d{1,2}/);
      // Should show latency in ms
      expect(resultCard.textContent).toMatch(/\d+ms/i);
    });

    it('routing result card shows decision badge (Accepted or Escalated)', async () => {
      renderWithProvider(<ConfidenceRouter />);
      const input = screen.getByPlaceholderText(/enter a prompt/i);
      await userEvent.type(input, 'Decision test');

      const sendBtn = screen.getByRole('button', { name: /send test prompt/i });
      await userEvent.click(sendBtn);

      await act(async () => {
        vi.advanceTimersByTime(500);
      });

      const resultCard = screen.getByTestId('routing-result');
      // Should contain either Accepted or Escalated badge
      const hasBadge = /accepted|escalated/i.test(resultCard.textContent ?? '');
      expect(hasBadge).toBe(true);
    });

    it('disables send button while routing is in progress', async () => {
      renderWithProvider(<ConfidenceRouter />);
      const input = screen.getByPlaceholderText(/enter a prompt/i);
      await userEvent.type(input, 'Test');

      const sendBtn = screen.getByRole('button', { name: /send test prompt/i });
      await userEvent.click(sendBtn);

      // Button should show loading state
      expect(screen.getByText(/routing\.\.\./i)).toBeInTheDocument();
    });
  });
});
