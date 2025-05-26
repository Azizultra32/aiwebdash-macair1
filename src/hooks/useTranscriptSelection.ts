import { useCallback, useState } from 'react';
import type { Transcript as TranscriptT, TranscriptData } from '@/types/types';

export function useTranscriptSelection(
  isDesktop: boolean,
  recordingPatientMidUUID: string,
  uploadingPatientMidUUID: string,
  setStatus: (status: string) => void,
  toggleSidebar: () => void,
  initialPatientData?: TranscriptData,
) {
  const [selectedTranscript, setSelectedTranscript] = useState<TranscriptT>();
  const [patientData, setPatientData] = useState<TranscriptData | undefined>(initialPatientData);

  const selectTranscript = useCallback(
    (transcript: TranscriptT | undefined) => {
      if (!transcript) return;

      setSelectedTranscript(transcript);
      setPatientData(transcript);

      if (transcript.ai_summary == null) {
        setStatus('Analyzing...');
      } else if (
        (isDesktop && transcript.mid === recordingPatientMidUUID) ||
        (!isDesktop && recordingPatientMidUUID)
      ) {
        setStatus('Listening...');
      } else if (
        (isDesktop && transcript.mid === uploadingPatientMidUUID) ||
        (!isDesktop && uploadingPatientMidUUID)
      ) {
        setStatus('Uploading...');
      } else {
        setStatus('Ready');
      }

      if (!isDesktop) toggleSidebar();
    },
    [
      isDesktop,
      recordingPatientMidUUID,
      uploadingPatientMidUUID,
      setStatus,
      toggleSidebar,
    ],
  );

  return {
    selectedTranscript,
    patientData,
    setSelectedTranscript,
    setPatientData,
    selectTranscript,
  };
}

