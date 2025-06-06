vi.mock('nosleep.js', () => ({ default: vi.fn(() => ({ enable: vi.fn(), disable: vi.fn() })) }));
vi.mock('@/hooks/useIndexedDbUpload', () => ({
  useIndexedDbUpload: () => ({ handleChunk: vi.fn(), finalizeUploads: vi.fn() }),
}));
let toastMock: any;
vi.mock('@/components/ui/use-toast', () => {
  toastMock = vi.fn();
  return {
    useToast: () => ({ toast: toastMock }),
    toast: toastMock,
  };
});
vi.mock('@/utils/logger', () => ({
  logger: { error: vi.fn(), debug: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));
vi.mock('@/supabase', () => ({
  __esModule: true,
  default: { auth: { getSession: vi.fn() } },
}));

import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useRecorderState from '@/hooks/useRecorderState';
import supabase from '@/supabase';
import { toast } from '@/components/ui/use-toast';
import { logger } from '@/utils/logger';

const patient = { patient_code: 'test', patient_tag: 1, mid: '1', language: 'en', token_count: 0 } as any;

function setup() {
  return renderHook(() =>
    useRecorderState({
      patient,
      patientTag: 1,
      isAddendum: false,
      onRecording: vi.fn(),
      onStopRecording: vi.fn(),
      isOnline: true,
    }),
  );
}

describe('useRecorderState fetch error handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (supabase.auth.getSession as any).mockResolvedValue({ data: { session: { access_token: 'tok' } }, error: null });
  });

  it('logs error when updateTranscript request fails', async () => {
    (global.fetch as any) = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    const { result } = setup();
    await act(async () => {
      await result.current.cStartRecording();
    });
    expect(logger.error).toHaveBeenCalled();
    expect(toast).toHaveBeenCalled();
  });

  it('handles fetch rejection gracefully', async () => {
    (global.fetch as any) = vi.fn().mockRejectedValue(new Error('fail'));
    const { result } = setup();
    await act(async () => {
      await result.current.cStartRecording();
    });
    expect(logger.error).toHaveBeenCalled();
    expect(toast).toHaveBeenCalled();
  });
});
