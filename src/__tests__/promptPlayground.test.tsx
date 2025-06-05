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
  it('switches tabs between Flow and Editor', async () => {
    render(<PromptPlayground />);

    // Editor tab content should be visible initially
    expect(screen.getByTestId('prompt-manager')).toBeTruthy();
    expect(screen.queryByTestId('prompt-flow')).toBeNull();

    // Switch to Flow tab
    const flowTab = screen.getByRole('tab', { name: 'Flow' });
    fireEvent.mouseDown(flowTab);
    fireEvent.click(flowTab);
    expect(await screen.findByTestId('prompt-flow')).toBeTruthy();
    expect(screen.queryByTestId('prompt-manager')).toBeNull();

    // Switch back to Editor tab
    const editorTab = screen.getByRole('tab', { name: 'Editor' });
    fireEvent.mouseDown(editorTab);
    fireEvent.click(editorTab);
    expect(await screen.findByTestId('prompt-manager')).toBeTruthy();
    expect(screen.queryByTestId('prompt-flow')).toBeNull();
  });

  it('renders the tester tab', async () => {
    render(<PromptPlayground />);

    const testerTab = screen.getByRole('tab', { name: 'Tester' });
    fireEvent.mouseDown(testerTab);
    fireEvent.click(testerTab);
    expect(await screen.findByTestId('prompt-tester')).toBeTruthy();
  });
});
