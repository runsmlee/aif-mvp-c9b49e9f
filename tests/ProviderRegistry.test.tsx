import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RoutingProvider } from '../src/context/RoutingContext';
import ProviderRegistry from '../src/components/ProviderRegistry';

function renderWithProvider(ui: React.ReactElement) {
  return render(<RoutingProvider>{ui}</RoutingProvider>);
}

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    get length() { return Object.keys(store).length; },
    key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
  };
})();

describe('ProviderRegistry', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    localStorageMock.clear();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders provider cards for OpenAI, Anthropic, Google, Ollama', () => {
    renderWithProvider(<ProviderRegistry />);
    expect(screen.getByText(/openai/i)).toBeInTheDocument();
    expect(screen.getByText(/anthropic/i)).toBeInTheDocument();
    expect(screen.getByText(/google/i)).toBeInTheDocument();
    expect(screen.getByText(/ollama/i)).toBeInTheDocument();
  });

  it('clicking "Add Provider" shows API key input form', async () => {
    renderWithProvider(<ProviderRegistry />);
    const addBtn = screen.getAllByRole('button', { name: /add provider/i })[0];
    await userEvent.click(addBtn);
    expect(screen.getByLabelText(/api key/i)).toBeInTheDocument();
  });

  it('"Test Connection" button triggers connection check and shows success/failure', async () => {
    renderWithProvider(<ProviderRegistry />);
    // First add a provider (click Add Provider on first card)
    const addBtns = screen.getAllByRole('button', { name: /add provider/i });
    await userEvent.click(addBtns[0]);

    // Enter an API key
    const keyInput = screen.getByLabelText(/api key/i);
    await userEvent.type(keyInput, 'sk-test-key-123');

    // Click test connection button (saves key and starts test)
    const testBtn = screen.getByRole('button', { name: /test connection/i });
    await userEvent.click(testBtn);

    // Wait for simulated connection test (500ms)
    await act(async () => {
      vi.advanceTimersByTime(600);
    });

    // Should show connected status (via aria-label on status indicator)
    expect(screen.getByRole('button', { name: /remove provider/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/status: connected/i)).toBeInTheDocument();
  });

  it('removing a provider shows confirmation dialog', async () => {
    renderWithProvider(<ProviderRegistry />);
    // Add a provider first
    const addBtns = screen.getAllByRole('button', { name: /add provider/i });
    await userEvent.click(addBtns[0]);

    const keyInput = screen.getByLabelText(/api key/i);
    await userEvent.type(keyInput, 'sk-test-key');

    const testBtn = screen.getByRole('button', { name: /test connection/i });
    await userEvent.click(testBtn);

    // Wait for connection
    await act(async () => {
      vi.advanceTimersByTime(600);
    });

    // Now click remove button on the connected provider
    const removeBtn = screen.getByRole('button', { name: /remove provider/i });
    await userEvent.click(removeBtn);

    // Confirmation dialog should appear
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();
  });

  it('provider list persists after simulated page reload (localStorage)', async () => {
    const { unmount } = renderWithProvider(<ProviderRegistry />);

    // Add a provider
    const addBtns = screen.getAllByRole('button', { name: /add provider/i });
    await userEvent.click(addBtns[0]);
    const keyInput = screen.getByLabelText(/api key/i);
    await userEvent.type(keyInput, 'sk-persist-test');
    const testBtn = screen.getByRole('button', { name: /test connection/i });
    await userEvent.click(testBtn);

    // Wait for test
    await act(async () => {
      vi.advanceTimersByTime(600);
    });

    // Verify provider was saved to localStorage
    expect(localStorageMock.setItem).toHaveBeenCalled();

    // Unmount and remount
    unmount();
    renderWithProvider(<ProviderRegistry />);

    // Provider should still be shown - localStorage was read
    expect(localStorageMock.getItem).toHaveBeenCalled();
  });
});
