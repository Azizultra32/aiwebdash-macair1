import 'regenerator-runtime/runtime';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Outlet } from 'react-router-dom';

// Mock Supabase to avoid environment variable requirements
vi.mock('@/supabase', () => ({
  __esModule: true,
  default: {
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
  },
}));

vi.mock('@/components/AuthRoute', () => ({
  __esModule: true,
  default: () => <Outlet />,
}));

vi.mock('@/views/Dashboard', () => ({
  __esModule: true,
  default: () => <div>Dashboard</div>,
}));

vi.mock('@/views/MoaDashboard', () => ({
  __esModule: true,
  default: () => <div data-testid="moa-dashboard">MOA Dashboard</div>,
}));

vi.mock('@/components/prompt-editor/PromptVisualizer', () => ({
  __esModule: true,
  default: () => <div data-testid="prompt-visualizer">Prompt Visualizer</div>,
}));

import Routes from '@/components/Routes';

describe('application routes', () => {
  it('renders MoaDashboard at /moa-workflow', async () => {
    window.history.pushState({}, '', '/moa-workflow');
    window.dispatchEvent(new PopStateEvent('popstate'));
    render(<Routes />);
    expect(await screen.findByTestId('moa-dashboard')).toBeTruthy();
  });

  it('renders PromptVisualizer at /prompt-visualizer', async () => {
    window.history.pushState({}, '', '/prompt-visualizer');
    window.dispatchEvent(new PopStateEvent('popstate'));
    render(<Routes />);
    expect(await screen.findByTestId('prompt-visualizer')).toBeTruthy();
  });
});
