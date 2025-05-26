import { useCallback, useEffect, useMemo, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import supabase from '@/supabase';
import { uuidv4 } from '@/lib/utils';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import useRecorderState from '@/hooks/useRecorderState';
import RecorderControls from './RecorderControls';
import { TranscriptData } from '@/types/types';
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
  selectPatient: (patientTag: number) => void;
}

export default function AudioRecorder(props: AudioRecorderProps) {
  const {
    patientData,
    newPatientData,
    hasMicrophoneAccess,
    onRecording,
    onStopRecording,
    onUploadComplete,
    selectPatient,
  } = props;
  const patientTag = props.patientTag;

  const [isAddendum, setIsAddendum] = useState(false);
  const [isVoiceChat, setIsVoiceChat] = useState(false);

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

  const recorder = useRecorderState({
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
        if (!recorder.recording || recorder.recordingPaused) {
          recorder.cStartRecording();
          props.onSpeechCommand?.(1);
        }
      }, [recorder, props]),
      matchInterim: true,
    },
    {
      command: ['pause recording'],
      callback: useCallback(() => {
        if (recorder.recording && !recorder.recordingPaused) {
          recorder.cPauseRecording();
          props.onSpeechCommand?.(2);
        }
      }, [recorder, props]),
      matchInterim: true,
    },
    {
      command: ['stop recording', 'end recording'],
      callback: useCallback(() => {
        if (recorder.recording || recorder.recordingPaused) {
          recorder.cStopRecording();
          props.onSpeechCommand?.(3);
        }
      }, [recorder, props]),
      matchInterim: true,
    },
    {
      command: ['patient label (is) *', 'label patient *'],
      callback: useCallback(
        (patientName: string) => {
          patientName = truncate(patientName, 12, true);
          if (recorder.recording || recorder.recordingPaused) {
            if (patient.mid != null) {
              supabase
                .from('transcripts2')
                .update({ patient_code: patientName })
                .eq('mid', patient.mid);
            }
          }
          patient.patient_code = patientName;
          props.onSpeechCommand?.(4, patientName);
        },
        [recorder, patient, props],
      ),
    },
  ];

  useSpeechRecognition({ commands });

  useEffect(() => {
    if (hasMicrophoneAccess) {
      SpeechRecognition.startListening({ continuous: true });
    }
  }, [hasMicrophoneAccess]);

  return (
    <RecorderControls
      recording={recorder.recording}
      recordingPaused={recorder.recordingPaused}
      isRecordButtonDisabled={recorder.isRecordButtonDisabled}
      hasMicrophoneAccess={hasMicrophoneAccess}
      onStart={recorder.onStart}
      onData={recorder.onData}
      onStop={recorder.onStop}
      startRecording={recorder.cStartRecording}
      pauseRecording={recorder.cPauseRecording}
      stopRecording={recorder.cStopRecording}
      isAddendum={isAddendum}
      setIsAddendum={setIsAddendum}
      isVoiceChat={isVoiceChat}
      setIsVoiceChat={setIsVoiceChat}
      mimeType={recorder.mimeType}
      patientData={patientData}
      selectPatient={selectPatient}
    />
  );
}

