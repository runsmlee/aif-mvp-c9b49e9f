import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CodeSnippet from '../src/components/CodeSnippet';

describe('CodeSnippet', () => {
  beforeEach(() => {
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('renders a syntax-highlighted code block with integration example', () => {
    render(<CodeSnippet />);
    const codeBlock = screen.getByRole('region', { name: /code/i });
    expect(codeBlock).toBeInTheDocument();
  });

  it('code block contains exactly 5 lines of implementation code', () => {
    render(<CodeSnippet />);
    const codeBlock = screen.getByTestId('code-content');
    // Each line is rendered as a child div
    const lineElements = codeBlock.children;
    expect(lineElements.length).toBe(5);
  });

  it('"Copy to Clipboard" button copies snippet text to clipboard', async () => {
    render(<CodeSnippet />);
    const copyBtn = screen.getByRole('button', { name: /copy to clipboard/i });
    await userEvent.click(copyBtn);
    expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
  });

  it('shows "Copied!" confirmation for 2 seconds after copy', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    render(<CodeSnippet />);
    const copyBtn = screen.getByRole('button', { name: /copy to clipboard/i });

    await userEvent.click(copyBtn);
    expect(screen.getByText(/copied!/i)).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(2100);
    });
    expect(screen.queryByText(/copied!/i)).not.toBeInTheDocument();

    vi.useRealTimers();
  });
});
