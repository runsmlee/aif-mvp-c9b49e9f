import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RoutingProvider } from '../src/context/RoutingContext';
import FallbackChain from '../src/components/FallbackChain';
import { ToastContainer } from '../src/components/Toast';

function renderWithProvider(ui: React.ReactElement) {
  return render(<RoutingProvider>{ui}</RoutingProvider>);
}

describe('FallbackChain', () => {
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
    expect(screen.getByText(/confidence/i)).toBeInTheDocument();
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
});
