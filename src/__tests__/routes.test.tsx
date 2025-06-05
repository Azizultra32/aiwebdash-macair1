import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/views/Dashboard', () => ({
  __esModule: true,
  default: () => <div data-testid="dashboard">Dashboard Mock</div>,
}));

vi.mock('@/components/prompt-editor/PromptVisualizer', () => ({
  __esModule: true,
  default: () => <div data-testid="prompt-visualizer">Visualizer Mock</div>,
}));

beforeEach(() => {
  process.env.VITE_BYPASS_AUTH = '1';
  vi.resetModules();
});

describe('application routes', () => {
  it('renders MoaDashboard on /moa-workflow', async () => {
    window.history.pushState({}, '', '/moa-workflow');
    const { default: Routes } = await import('@/components/Routes');
    render(<Routes />);
    expect(screen.getByText(/Task Management Dashboard/i)).toBeTruthy();
  });

  it('renders PromptVisualizer on /prompt-visualizer', async () => {
    window.history.pushState({}, '', '/prompt-visualizer');
    const { default: Routes } = await import('@/components/Routes');
    render(<Routes />);
    expect(screen.getByTestId('prompt-visualizer')).toBeTruthy();
  });
});
