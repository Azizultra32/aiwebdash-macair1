import { useCallback, useState } from 'react';
import NoSleep from 'nosleep.js';
import { getAudioMimeType } from '@/lib/utils';
import { ChunkNumberWrapper, TranscriptData } from '@/types/types';
import { logger } from '@/utils/logger';
import { useIndexedDbUpload } from './useIndexedDbUpload';

interface UseRecorderStateProps {
  patient: TranscriptData;
  patientTag: number;
  isAddendum: boolean;
  onRecording: (patient: TranscriptData) => Promise<void>;
  onStopRecording: (patient: TranscriptData) => void;
  onUploadComplete?: (patient: TranscriptData) => void;
  isOnline: boolean;
}

export function useRecorderState({
  patient,
  patientTag,
  isAddendum,
  onRecording,
  onStopRecording,
  onUploadComplete,
  isOnline,
}: UseRecorderStateProps) {
  const [recording, setRecording] = useState(false);
  const [recordingPaused, setRecordingPaused] = useState(false);
  const [isRecordButtonDisabled, setRecordingButtonDisabled] = useState(false);
  const [chunkNumberWrapper, setChunkNumberWrapper] = useState<ChunkNumberWrapper>({
    chunkNumber: 0,
  });
  const mimeType = getAudioMimeType();

  const { handleChunk, finalizeUploads } = useIndexedDbUpload(isOnline);

  const onData = useCallback(
    async (blob: Blob, soundDetected: boolean) => {
      if (!soundDetected) return;

      let chunk = ++chunkNumberWrapper.chunkNumber;
      if (isAddendum) {
        chunk = patient.token_count + chunk;
      }
      await handleChunk(patient.mid, chunk, blob);
      setChunkNumberWrapper({ chunkNumber: chunk - (isAddendum ? patient.token_count : 0) });
    },
    [chunkNumberWrapper, handleChunk, patient, isAddendum, patient.token_count],
  );

  const onStopCallback = useCallback(
    async (blob: Blob, paused: boolean, soundDetected: boolean) => {
      if (onStopRecording && !paused) {
        if (isAddendum) {
          onStopRecording({ ...patient });
        } else {
          onStopRecording({ ...patient, token_count: chunkNumberWrapper.chunkNumber + 1 });
        }
      }

      setRecordingButtonDisabled(false);

      if (blob && soundDetected) {
        await onData(blob, soundDetected);
      } else if (!soundDetected) {
        const emptyBlob = new Blob([], { type: 'audio/mp3' });
        await onData(emptyBlob, true);
      }

      if (!paused) {
        if (isOnline) {
          await finalizeUploads(patient.mid);
        } else {
          logger.debug('Recording completed offline', { patientId: patient.mid });
        }
        if (onUploadComplete) {
          onUploadComplete(patient);
        }
      }
    },
    [onStopRecording, isAddendum, patient, chunkNumberWrapper, onData, finalizeUploads, onUploadComplete, isOnline],
  );

  const onStop = useCallback(
    async (blob: Blob, soundDetected: boolean) => {
      onStopCallback(blob, recordingPaused, soundDetected);
    },
    [onStopCallback, recordingPaused],
  );

  const noSleep = new NoSleep();
  let didEnableNoSleep = false;

  const cStartRecording = useCallback(() => {
    if (!didEnableNoSleep) {
      didEnableNoSleep = true;
      noSleep.enable();
    }
    if (!recordingPaused) {
      setChunkNumberWrapper({ chunkNumber: 0 });
    }
    setRecording(true);
    setRecordingButtonDisabled(true);
    isOnline &&
      fetch('/api/updateTranscript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mid: patient.mid, is_paused: false }),
      });
  }, [recordingPaused, patient.mid, isOnline]);

  const cStopRecording = useCallback(async () => {
    if (didEnableNoSleep) {
      didEnableNoSleep = false;
      noSleep.disable();
    }
    if (recordingPaused) {
      const emptyBlob = new Blob([], { type: 'audio/mp3' });
      onStopCallback(emptyBlob, false, true);
    } else {
      setRecording(false);
    }
    setRecordingPaused(false);
    setRecordingButtonDisabled(true);
    isOnline &&
      (await fetch('/api/updateTranscript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mid: patient.mid, is_paused: false }),
      }));
  }, [recordingPaused, patient.mid, onStopCallback, isOnline]);

  const cPauseRecording = useCallback(() => {
    setRecordingPaused(true);
    setRecording(false);
    setRecordingButtonDisabled(true);
    isOnline &&
      fetch('/api/updateTranscript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mid: patient.mid, is_paused: true }),
      });
  }, [patient.mid, isOnline]);

  const onStart = useCallback(async () => {
    if (!recordingPaused) {
      if (!isAddendum) {
        const initialPatient = {
          ...patient,
          patient_tag: patientTag,
        };
        if (onRecording) {
          onRecording(initialPatient);
        }
      } else {
        const initialPatient = {
          ...patient,
        };
        if (onRecording) {
          onRecording(initialPatient);
        }
      }
    }
    setRecordingButtonDisabled(false);
    setRecordingPaused(false);
  }, [patient, onRecording, recordingPaused, patientTag, isAddendum]);

  return {
    mimeType,
    recording,
    recordingPaused,
    isRecordButtonDisabled,
    cStartRecording,
    cStopRecording,
    cPauseRecording,
    onStart,
    onStop,
    onData,
    setRecording, // Add this
    setRecordingPaused, // Add this
  };
}

export default useRecorderState;
