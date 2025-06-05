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

import PromptEditor from '@/views/PromptEditor';

describe('PromptEditor', () => {
  it('renders the tester tab', async () => {
    render(<PromptEditor />);

    const testerTab = screen.getByRole('tab', { name: 'Tester' });
    fireEvent.mouseDown(testerTab);
    fireEvent.click(testerTab);

    expect(await screen.findByTestId('prompt-tester')).toBeTruthy();
  });
});
