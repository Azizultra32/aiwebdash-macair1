import { useCallback, useEffect, useMemo, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import supabase from '@/supabase';
import { uuidv4 } from '@/lib/utils';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import useRecorderState from '@/hooks/useRecorderState';
import RecorderControls from './RecorderControls';
import { TranscriptData } from '@/types/types';
import { toast } from '@/components/ui/use-toast';
import { logger } from '@/utils/logger';
import 'regenerator-runtime/runtime';

interface AudioRecorderProps {
  patientTag: number;
  patientData: TranscriptData;
  newPatientData: TranscriptData;
  hasMicrophoneAccess: boolean;
  onRecording: (patient: TranscriptData) => Promise<void>;
  onStopRecording: (patient: TranscriptData) => void;
  onUploadComplete?: (patient: TranscriptData) => void;
  onSpeechCommand?: (command: number, text?: string) => void;
}

export default function AudioRecorder(props: AudioRecorderProps) {
  const {
    patientData,
    newPatientData,
    hasMicrophoneAccess,
    onRecording,
    onStopRecording,
    onUploadComplete,
  } = props;
  const patientTag = props.patientTag;

  const [isAddendum] = useState(false);

  const isOnline = useOnlineStatus();

  const patient = useMemo(() => {
    const pd = isAddendum ? patientData : newPatientData;
    return {
      patient_code: pd?.patient_code ?? 'Patient',
      patient_tag: isAddendum ? pd?.patient_tag : patientTag,
      mid: pd?.mid ?? uuidv4(),
      language: pd?.language ?? 'auto',
      token_count: pd?.token_count ?? 0,
    } as TranscriptData;
  }, [patientData, newPatientData, patientTag, isAddendum]);

  const {
    recording,
    setRecording,
    recordingPaused,
    setRecordingPaused,
    // Destructure other properties from useRecorderState as needed, or access via recorder.propertyName
    ...recorder // Keep other recorder properties accessible via recorder.property
  } = useRecorderState({
    patient,
    patientTag,
    isAddendum,
    onRecording,
    onStopRecording,
    onUploadComplete,
    isOnline,
  });

  const truncate = (str: string, n: number, useWordBoundary: boolean) => {
    if (str.length <= n) return str;
    const subString = str.slice(0, n - 1);
    return useWordBoundary ? subString.slice(0, subString.lastIndexOf(' ')) : subString;
  };

  const commands = [
    {
      command: ['start recording'],
      callback: useCallback(() => {
        if (!recording || recordingPaused) { // Changed here
          recorder.cStartRecording();
          props.onSpeechCommand?.(1);
        }
      }, [recording, recordingPaused, recorder.cStartRecording, props]), // Changed here
      matchInterim: true,
    },
    {
      command: ['pause recording'],
      callback: useCallback(() => {
        if (recording && !recordingPaused) { // Changed here
          recorder.cPauseRecording();
          props.onSpeechCommand?.(2);
        }
      }, [recording, recordingPaused, recorder.cPauseRecording, props]), // Changed here
      matchInterim: true,
    },
    {
      command: ['stop recording', 'end recording'],
      callback: useCallback(() => {
        if (recording || recordingPaused) { // Changed here
          recorder.cStopRecording();
          props.onSpeechCommand?.(3);
        }
      }, [recording, recordingPaused, recorder.cStopRecording, props]), // Changed here
      matchInterim: true,
    },
    {
      command: ['patient label (is) *', 'label patient *'],
      callback: useCallback(
        async (patientName: string) => {
          patientName = truncate(patientName, 12, true);
          if (recording || recordingPaused) { // Changed here
            if (patient.mid != null) {
              const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
              if (!sessionError) {
                try {
                  const response = await fetch('/api/updateTranscript', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: `Bearer ${sessionData?.session?.access_token}`,
                    },
                    body: JSON.stringify({ mid: patient.mid, patient_code: patientName }),
                  });
                  if (!response.ok) {
                    logger.error('Failed to update patient label', { status: response.status });
                    toast({
                      title: 'Error',
                      description: 'Failed to update transcript status',
                      variant: 'destructive',
                    });
                  }
                } catch (error) {
                  logger.error('Failed to update patient label', error);
                  toast({
                    title: 'Error',
                    description: 'Failed to update transcript status',
                    variant: 'destructive',
                  });
                }
              }
            }
          }
          patient.patient_code = patientName;
          props.onSpeechCommand?.(4, patientName);
        },
        [recording, recordingPaused, patient, props, recorder.cStartRecording, recorder.cPauseRecording, recorder.cStopRecording], // Added recorder methods to dependency array for completeness, though not directly used in this specific callback logic, they are part of the 'recorder' context often changed together.
      ),
    },
  ];

  useSpeechRecognition({ commands });

  useEffect(() => {
    if (hasMicrophoneAccess) {
      SpeechRecognition.startListening({ continuous: true });
    }
  }, [hasMicrophoneAccess]);

  const [, setRecordingBlob] = useState<Blob | null>(null);
  const [microphoneError] = useState<string>('');
  const hasApiKey = true; // Placeholder - should be managed properly

  return (
    <RecorderControls
      setIsRecording={setRecording}
      setIsPaused={setRecordingPaused}
      setRecordingBlob={setRecordingBlob}
      hasApiKey={hasApiKey}
      microphoneError={microphoneError}
      // Note: hasMicrophoneAccess is used internally by RecorderControls via useAudioRecorder, 
      // but it's not an explicit prop of RecorderControls itself. 
      // The original RecorderControls component definition shows it expects these props.
    />
  );
}

