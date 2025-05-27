import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

vi.mock('@/supabase', () => ({
  __esModule: true,
  default: {
    auth: { getUser: vi.fn() },
  },
}));

import PromptManager from '@/components/prompt-editor/PromptManager';
import supabase from '@/supabase';

describe('PromptManager access control', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('denies access when user id is not authorized', async () => {
    (supabase.auth.getUser as any).mockResolvedValue({ data: { user: { id: 'xyz' } }, error: null });
    render(<PromptManager />);
    expect(await screen.findByText(/Access denied/i)).toBeTruthy();
  });
});
