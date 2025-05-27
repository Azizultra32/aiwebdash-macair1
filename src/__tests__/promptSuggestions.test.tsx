import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('@/lib/v0', () => ({
  __esModule: true,
  getPromptSuggestions: vi.fn().mockResolvedValue(['one', 'two'])
}));

import PromptSuggestions from '@/components/prompt-editor/PromptSuggestions';
import { getPromptSuggestions } from '@/lib/v0';

describe('PromptSuggestions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches and displays suggestions', async () => {
    render(<PromptSuggestions prompt="hello" />);
    fireEvent.click(screen.getByRole('button'));
    expect(getPromptSuggestions).toHaveBeenCalledWith('hello');
    await screen.findByText('one');
    expect(screen.getByText('two')).toBeTruthy();
  });
});
