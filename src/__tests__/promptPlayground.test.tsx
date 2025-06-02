import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

vi.mock('@/components/prompt-editor/PromptFlow', () => ({
  __esModule: true,
  default: () => <div data-testid="prompt-flow">Workflow Diagram Mock</div>
}));

vi.mock('@/components/prompt-editor/PromptManager', () => ({
  __esModule: true,
  default: () => <div data-testid="prompt-manager">Prompt Manager Mock</div>
}));

import PromptPlayground from '@/views/PromptPlayground';

describe('PromptPlayground', () => {
  it.skip('switches tabs between Workflow Diagram and Manage Prompts', () => {
    render(<PromptPlayground />);

    // Workflow Diagram should be visible initially
    expect(screen.getByTestId('prompt-flow')).toBeTruthy();
    expect(screen.queryByTestId('prompt-manager')).toBeNull();

    // Switch to Manage Prompts
    fireEvent.click(screen.getByRole('button', { name: 'Manage Prompts' }));
    expect(screen.getByTestId('prompt-manager')).toBeTruthy();
    expect(screen.queryByTestId('prompt-flow')).toBeNull();

    // Switch back to Workflow Diagram
    fireEvent.click(screen.getByRole('button', { name: 'Workflow Diagram' }));
    expect(screen.getByTestId('prompt-flow')).toBeTruthy();
    expect(screen.queryByTestId('prompt-manager')).toBeNull();
  });
});
