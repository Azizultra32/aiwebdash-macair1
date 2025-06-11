vi.mock('@/components/ui/RecorderControls', () => ({
  __esModule: true,
  default: () => <div>controls</div>,
}));
let capturedCommands: any[] = [];
vi.mock('react-speech-recognition', () => ({
  __esModule: true,
  default: { startListening: vi.fn() },
  useSpeechRecognition: (config: any) => {
    capturedCommands = config.commands;
    return {};
  },
}));
vi.mock('@/hooks/useRecorderState', () => ({
  __esModule: true,
  default: vi.fn(() => ({
    recording: true,
    setRecording: vi.fn(),
    recordingPaused: false,
    setRecordingPaused: vi.fn(),
    cStartRecording: vi.fn(),
    cStopRecording: vi.fn(),
    cPauseRecording: vi.fn(),
  })),
}));
const toastMock = vi.fn();
vi.mock('@/components/ui/use-toast', () => {
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
import { render } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import AudioRecorder from '@/components/ui/recorder';
import supabase from '@/supabase';
import { toast } from '@/components/ui/use-toast';
import { logger } from '@/utils/logger';

const patient = { patient_code: 'test', patient_tag: 1, mid: '1', language: 'en', token_count: 0 } as any;

function renderComponent() {
  return render(
    <AudioRecorder
      patientTag={1}
      patientData={patient}
      newPatientData={patient}
      hasMicrophoneAccess={false}
      onRecording={vi.fn()}
      onStopRecording={vi.fn()}
      selectPatient={vi.fn()}
    />,
  );
}

describe('AudioRecorder command fetch error', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedCommands = [];
    (supabase.auth.getSession as any).mockResolvedValue({ data: { session: { access_token: 'tok' } }, error: null });
  });

  it('handles fetch failure for patient label command', async () => {
    (global.fetch as any) = vi.fn().mockResolvedValue({ ok: false, status: 500 });
    renderComponent();
    await capturedCommands.find((c: any) => c.command[0] === 'patient label (is) *').callback('bob');
    expect(logger.error).toHaveBeenCalled();
    expect(toast).toHaveBeenCalled();
  });
});
