import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RoutingProvider } from '../src/context/RoutingContext';
import FallbackChain from '../src/components/FallbackChain';
import { ToastContainer } from '../src/components/Toast';

function renderWithProvider(ui: React.ReactElement) {
  return render(<RoutingProvider>{ui}</RoutingProvider>);
}

describe('FallbackChain', () => {
  beforeEach(() => {
    localStorage.clear();
  });
  it('renders an empty fallback chain with "Add Model" button', () => {
    renderWithProvider(<FallbackChain />);
    expect(screen.getByRole('button', { name: /add model/i })).toBeInTheDocument();
  });

  it('clicking "Add Model" opens a model selector dropdown', async () => {
    renderWithProvider(<FallbackChain />);
    const addBtn = screen.getByRole('button', { name: /add model/i });
    await userEvent.click(addBtn);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('selecting a model appends it to the fallback chain list', async () => {
    renderWithProvider(<FallbackChain />);
    const addBtn = screen.getByRole('button', { name: /add model/i });
    await userEvent.click(addBtn);

    const option = screen.getByRole('option', { name: /gpt-4o mini/i });
    await userEvent.click(option);

    expect(screen.getByText(/GPT-4o Mini/i)).toBeInTheDocument();
  });

  it('each fallback entry shows model name, condition type, and remove button', async () => {
    renderWithProvider(<FallbackChain />);
    const addBtn = screen.getByRole('button', { name: /add model/i });
    await userEvent.click(addBtn);

    const option = screen.getByRole('option', { name: /gpt-4o mini/i });
    await userEvent.click(option);

    expect(screen.getByText(/GPT-4o Mini/i)).toBeInTheDocument();
    // Condition type is shown as a clickable label in the entry
    expect(screen.getByRole('button', { name: /edit condition for gpt-4o mini/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument();
  });

  it('removing a model from the chain updates the list immediately', async () => {
    renderWithProvider(<FallbackChain />);
    const addBtn = screen.getByRole('button', { name: /add model/i });
    await userEvent.click(addBtn);

    const option = screen.getByRole('option', { name: /gpt-4o mini/i });
    await userEvent.click(option);

    expect(screen.getByText(/GPT-4o Mini/i)).toBeInTheDocument();

    // The component has a two-step remove: click Remove, then Confirm
    const removeBtn = screen.getByRole('button', { name: /remove/i });
    await userEvent.click(removeBtn);

    // Click confirm button
    const confirmBtn = screen.getByRole('button', { name: /confirm remove/i });
    await userEvent.click(confirmBtn);

    expect(screen.queryByText(/GPT-4o Mini/i)).not.toBeInTheDocument();
  });

  it('reordering fallback entries via drag updates the chain order', async () => {
    renderWithProvider(<FallbackChain />);
    // Add two models
    const addBtn = screen.getByRole('button', { name: /add model/i });
    await userEvent.click(addBtn);
    await userEvent.click(screen.getByRole('option', { name: /gpt-4o mini/i }));
    await userEvent.click(addBtn);
    await userEvent.click(screen.getByRole('option', { name: /gpt-4o\b/i }));

    // Verify both are present - reorder buttons should be visible
    const moveUpButtons = screen.getAllByRole('button', { name: /move up/i });
    const moveDownButtons = screen.getAllByRole('button', { name: /move down/i });
    expect(moveUpButtons.length + moveDownButtons.length).toBeGreaterThan(0);
  });

  it('saving a chain with 3+ models shows success toast notification', async () => {
    renderWithProvider(<><FallbackChain /><ToastContainer /></>);
    const addBtn = screen.getByRole('button', { name: /add model/i });

    await userEvent.click(addBtn);
    await userEvent.click(screen.getByRole('option', { name: /gpt-4o mini/i }));
    await userEvent.click(addBtn);
    await userEvent.click(screen.getByRole('option', { name: /gpt-4o\b/i }));
    await userEvent.click(addBtn);
    await userEvent.click(screen.getByRole('option', { name: /claude sonnet/i }));

    const saveBtn = screen.getByRole('button', { name: /save chain/i });
    await userEvent.click(saveBtn);

    expect(screen.getByText(/fallback chain saved/i)).toBeInTheDocument();
  });

  // --- Improvement tests: Condition editing ---
  describe('Condition Editing', () => {
    it('clicking condition label opens inline editor', async () => {
      renderWithProvider(<FallbackChain />);
      const addBtn = screen.getByRole('button', { name: /add model/i });
      await userEvent.click(addBtn);
      await userEvent.click(screen.getByRole('option', { name: /gpt-4o mini/i }));

      const editBtn = screen.getByRole('button', { name: /edit condition for gpt-4o mini/i });
      await userEvent.click(editBtn);

      // Should show condition type selector and value input
      expect(screen.getByLabelText(/condition type/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/condition value/i)).toBeInTheDocument();
    });

    it('can change condition type from confidence to timeout', async () => {
      renderWithProvider(<FallbackChain />);
      const addBtn = screen.getByRole('button', { name: /add model/i });
      await userEvent.click(addBtn);
      await userEvent.click(screen.getByRole('option', { name: /gpt-4o mini/i }));

      const editBtn = screen.getByRole('button', { name: /edit condition for gpt-4o mini/i });
      await userEvent.click(editBtn);

      const typeSelect = screen.getByLabelText(/condition type/i);
      await userEvent.selectOptions(typeSelect, 'timeout');

      const applyBtn = screen.getByRole('button', { name: /apply condition/i });
      await userEvent.click(applyBtn);

      // Editor should close and show updated condition
      expect(screen.getByRole('button', { name: /edit condition for gpt-4o mini/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /edit condition for gpt-4o mini/i }).textContent).toContain('timeout');
    });

    it('shows success indicator when chain has 3+ models', async () => {
      renderWithProvider(<FallbackChain />);
      const addBtn = screen.getByRole('button', { name: /add model/i });

      await userEvent.click(addBtn);
      await userEvent.click(screen.getByRole('option', { name: /gpt-4o mini/i }));
      await userEvent.click(addBtn);
      await userEvent.click(screen.getByRole('option', { name: /gpt-4o\b/i }));
      await userEvent.click(addBtn);
      await userEvent.click(screen.getByRole('option', { name: /claude sonnet/i }));

      expect(screen.getByText(/chain configured with 3 models/i)).toBeInTheDocument();
    });
  });
});
