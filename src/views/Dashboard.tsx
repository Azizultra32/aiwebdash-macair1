import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useMediaQuery } from 'usehooks-ts';
import DashboardLayout from '@/components/DashboardLayout';
import FormCreateTranscript from '@/components/FormCreateTranscript';
import TranscriptList from '@/components/TranscriptList';
import { logger } from '@/utils/logger';
import useTranscripts from '@/hooks/useTranscripts';
import useCreateTranscript, { useRealtimeTranscripts, deleteTranscriptAsync, updateTranscriptAsync } from '@/hooks/useCreateTranscript';
import Transcript from '@/components/Transcript';
import { Loading } from '@/components/Loading';
import type { Transcript as TranscriptT, TranscriptData } from '@/types/types';
import AudioRecorder from '@/components/ui/recorder';
import { checkMicrophonePermissions, uuidv4 } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import 'regenerator-runtime/runtime'
import { useSpeechRecognition } from 'react-speech-recognition';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import {
  loadFromLocalStorage,
  saveToLocalStorage,
} from '@/utils/storageHelpers';
import { useOfflineQueue } from '@/hooks/useOfflineQueue';
import { useServiceWorkerReload } from '@/hooks/useServiceWorkerReload';
import { useTranscriptSelection } from '@/hooks/useTranscriptSelection';
import SpeechCommandDialog from '@/components/SpeechCommandDialog';
import StatusBanner from '@/components/StatusBanner';
import FloatingWidget from '@/components/FloatingWidget';
import FloatingAfterscribeManager from '@/components/FloatingAfterscribeManager';

let clientSideMid: string | undefined = undefined;

const Dashboard = () => {
  const [clientTranscripts, setClientTranscripts] = useState<TranscriptT[]>();
  const { data: onlineTranscripts, isLoading: isLoadingTranscripts } = useTranscripts();
  const { toast } = useToast();
  const isOnline = useOnlineStatus();
  // Hook for creating new transcripts on the server
  const { mutateAsync: createTranscript } = useCreateTranscript();

  const patientTag = useMemo(() => {
    // Combine online and local transcripts, removing duplicates by mid
    const allTranscripts = [...(onlineTranscripts || []), ...(clientTranscripts || [])];
    const uniqueTranscripts = Array.from(new Map(allTranscripts.map(t => [t.mid, t])).values());

    // Get the highest tag number
    const tags = uniqueTranscripts.map(t => t.patient_tag);
    if (!tags.length) return 1;

    return Math.max(...tags) + 1;
  }, [onlineTranscripts, clientTranscripts]);

  const mergedTranscripts = useMemo(() => {
    if (!onlineTranscripts && !clientTranscripts) return [] as TranscriptT[];
    const merged = [...(onlineTranscripts || []), ...(clientTranscripts || [])];
    return merged
      .filter((transcript, index, self) =>
        index === self.findIndex(t => t.mid === transcript.mid),
      )
      .sort(
        (a: TranscriptT, b: TranscriptT) =>
          +new Date(b.created_at) - +new Date(a.created_at),
      );
  }, [onlineTranscripts, clientTranscripts]);

  const {
    offlineQueueCount,
    isProcessingOfflineQueue,
    queueAction,
  } = useOfflineQueue(mergedTranscripts, isOnline);

  const defaultPatientData = { patient_code: 'Patient', patient_tag: patientTag, mid: uuidv4(), language: 'auto', token_count: 0 };
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  // Duplicate toggleSidebar removed; see implementation below
  // const toggleSidebar = useCallback(() => {
  //   setShowSidebar((prev) => !prev);
  // }, [showSidebar]);
  const toggleSidebar = useCallback(() => {
    setShowSidebar((prev) => !prev);
  }, [isDesktop, showSidebar]);
  const [newPatient, setNewPatient] = useState<TranscriptData>();
  const [defaultPatientCode, setDefaultPatientCode] = useState<string>("");
  const [status, setStatus] = useState<string>("Ready");
  const [hasMicrophoneAccess, setHasMicrophoneAccess] = useState<boolean>(false);
  const [recordingPatientMidUUID, setRecordingPatientMidUUID] = useState<string>('');
  const [uploadingPatientMidUUID, setUploadingPatientMidUUID] = useState<string>('');
  const [speechCommandActivated, setSpeechCommandActivated] = useState<number>(0);
  const {
    selectedTranscript,
    patientData,
    setSelectedTranscript,
    setPatientData,
    selectTranscript,
  } = useTranscriptSelection(
    isDesktop,
    recordingPatientMidUUID,
    uploadingPatientMidUUID,
    setStatus,
    toggleSidebar,
    defaultPatientData,
  );

  const terminateRecording = useCallback(async ({ mid, token_count }: { mid: string, token_count: number }) => {
    logger.debug('completing transcript', { patientId: mid });
    const saveOffline = () => {
      queueAction({ type: 'update', data: { mid, token_count } });
    };
    const updateData = {
      mid,
      token_count,
    };
    if (isOnline) {
      try {
        await updateTranscriptAsync(updateData);
      } catch (error) {
        console.error('Error updating transcript:', error);
        saveOffline();
      }
    }
    else {
      saveOffline();
    }
  }, [isOnline]);

  const getLastNCharacters = (str: string, n: number) => {
    const length = str.length;
    let result = '';
    if (n > length) {
      n = length;
    }
    for (let i = length - n; i < length; i++) {
      result += str[i];
    }

    return result;
  };

  const { transcript, listening, browserSupportsSpeechRecognition } = useSpeechRecognition();

  // Add this at the beginning of the Dashboard component
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const localStorageTranscripts = loadFromLocalStorage();
    setClientTranscripts(localStorageTranscripts);
    setIsInitializing(false);

    if (localStorageTranscripts.length && !selectedTranscript) {
      selectTranscript(localStorageTranscripts[0]);
    }
  }, []);


  const onDeleteTranscript = async ({ mid, patient_code }: TranscriptData) => {
    if (mid !== undefined && confirm(`Delete patient '${patient_code}'?`)) {
      if (isOnline) {
        try {
          await deleteTranscriptAsync(mid);
        } catch (error) {
          console.error('Error deleting transcript:', error);
          toast({
            title: 'Error',
            description: 'Failed to delete transcript. Please try again.',
            variant: 'destructive',
          });
          return;
        }
      } else {
        queueAction({ type: 'delete', data: { mid } });
      }
      const updatedTranscripts = clientTranscripts?.filter(t => t.mid !== mid) || [];
      setClientTranscripts(updatedTranscripts);
      saveToLocalStorage(updatedTranscripts);
      setSelectedTranscript(undefined);
      if (clientSideMid === mid) {
        clientSideMid = undefined;
        setNewPatient(undefined);
      }
    }
  };

  useRealtimeTranscripts(isOnline);

  useEffect(() => {
    // Initialize with local storage data immediately
    const localStorageTranscripts = loadFromLocalStorage();
    setClientTranscripts(localStorageTranscripts);

    if (!isDesktop) {
      setShowSidebar(!selectedTranscript);
    }

    const t0 = (localStorageTranscripts && newPatient?.mid === clientSideMid)
      ? localStorageTranscripts.find(x => x.mid === clientSideMid)
      : undefined;

    // Merge online and local transcripts
    let updatedTranscripts = localStorageTranscripts || [];
    if (onlineTranscripts) {
      updatedTranscripts = [...updatedTranscripts, ...onlineTranscripts].reduce<TranscriptT[]>((acc, current) => {
        const x = acc.find(item => item.mid === current.mid);
        if (!x) {
          return acc.concat([current]);
        }
        return acc;
      }, []);
    }

    let didCreateClientPatient = false;
    let didClearClientPatient = false;

    if (t0 == undefined && newPatient && newPatient.mid && updatedTranscripts.find(x => x.mid === newPatient.mid) == undefined) {
      const now = new Date();
      const now_utc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(),
        now.getUTCDate(), now.getUTCHours(),
        now.getUTCMinutes(), now.getUTCSeconds());
      const created_at = new Date(now_utc).toISOString();
      updatedTranscripts.unshift({
        ...newPatient,
        mid: newPatient.mid,
        id: -1,
        user_id: "",
        token_count: 0,
        transcript: undefined,
        created_at,
      });
      didCreateClientPatient = true;
    }
    else if (newPatient && newPatient.mid && newPatient.mid === clientSideMid) {
      if (updatedTranscripts.find(x => x.mid === newPatient.mid)) {
        setNewPatient(undefined);
        didClearClientPatient = true;
      }
    }

    const sortedClientTranscripts = updatedTranscripts.sort((a: TranscriptT, b: TranscriptT) =>
      +new Date(b.created_at) - +new Date(a.created_at)
    );

    setClientTranscripts(sortedClientTranscripts);
    saveToLocalStorage(sortedClientTranscripts);

    if (!sortedClientTranscripts.length || !isDesktop || (selectedTranscript && !didCreateClientPatient && !didClearClientPatient)) {
      return;
    }

    const t = sortedClientTranscripts.find(x => x.mid === clientSideMid);

    if (t) {
      selectTranscript(t);
    }
    else {
      selectTranscript(sortedClientTranscripts[0]);
    }
  }, [onlineTranscripts, isDesktop, newPatient]);

  useEffect(() => {
    if (!isDesktop && showSidebar) {
      setSelectedTranscript(undefined);
    }
  }, [showSidebar]);

    const onRecording = useCallback(async (patient: TranscriptData) => {
      setStatus("Listening...");
      setRecordingPatientMidUUID(patient.mid ?? '');
      clientSideMid = patient.mid;
    if (patient.token_count === 0) {
      if ((patient?.patient_code ?? "").length <= 0) {
        patient.patient_code = 'Patient';
      }
      setNewPatient(patient);
      setDefaultPatientCode(patient?.patient_code ?? 'Patient');

      if (isOnline) {
        try {
          await createTranscript(patient);
        }
        catch (error) {
          console.error('Error creating transcript:', error);
          queueAction({ type: 'create', data: patient });
        }
      }
      else {
        queueAction({ type: 'create', data: patient });
      }
    }
  }, [isOnline]);

    const onStopRecording = useCallback((t: TranscriptData) => {
      terminateRecording({ token_count: t.token_count, mid: t.mid ?? '' });

    clientSideMid = t.mid;
    setDefaultPatientCode('');
    setRecordingPatientMidUUID('');
      setPatientData({ patient_code: 'Patient', patient_tag: patientTag, mid: uuidv4(), language: t.language, token_count: 0 });
      setUploadingPatientMidUUID(t.mid ?? '');
    setStatus("Uploading...");
  }, [patientTag, isOnline, terminateRecording]);

    const onUploadComplete = useCallback((t: TranscriptData) => {
      clientSideMid = t.mid;
      setUploadingPatientMidUUID('');
    }, []);

  useEffect(() => {
    checkMicrophonePermissions()
      .then(hasMicrophoneAccess => setHasMicrophoneAccess(hasMicrophoneAccess));
  }, []);

  const onSpeechCommand = useCallback((command: number, text?: string) => {
    setSpeechCommandActivated(command);
    setTimeout(() => setSpeechCommandActivated(0), 3000);
    if (command === 1) {
      toast({
        title: 'Recording',
        description: 'Recording started',
      });
    } else if (command === 2) {
      toast({
        title: 'Paused',
        description: 'Recording paused',
      })
    }
    else if (command === 3) {
      toast({
        title: 'Stopped',
        description: 'Recording stopped',
      })
    }
    else if (command === 4) {
      if (text) {
        setDefaultPatientCode(text);
        if (patientData) {
          setPatientData({ ...patientData, patient_code: text });
        }
      }
      toast({
        title: 'Patient Name',
        description: `Patient named ${text ?? ''}`,
      })
    }
  }, [patientData]);

  const speechStatus = (browserSupportsSpeechRecognition && listening && transcript?.length > 3)
    ? `SPEECH ACTIVATED: ${getLastNCharacters(transcript, 20)}`
    : (browserSupportsSpeechRecognition && listening)
      ? `SPEECH UNKNOWN`
      : `SPEECH DISABLED`;

  // Load initial data from localStorage
  useEffect(() => {
    const localStorageTranscripts = loadFromLocalStorage();
    setClientTranscripts(localStorageTranscripts);
  }, []);


  useEffect(() => {
    const mid = selectedTranscript?.mid;
    const t = mergedTranscripts?.find(x => x.mid === mid);
    setSelectedTranscript(t);
    if (t) {
      setPatientData(t);
    }
  }, [mergedTranscripts, selectedTranscript?.mid]);

  useServiceWorkerReload(recordingPatientMidUUID);

  const MemoizedTranscriptList = memo(TranscriptList);

  const [newPatientData, setNewPatientData] = useState<TranscriptData>(defaultPatientData);

  return (
    <>
      <SpeechCommandDialog speechCommandActivated={speechCommandActivated} />
        <DashboardLayout
          recording={recordingPatientMidUUID !== ''}
          showSidebar={showSidebar}
          isDesktop={isDesktop}
          sidebar={
          <>
            <div className="grow min-h-0 bg-background/90 backdrop-blur z-10">
              {(isLoadingTranscripts && isOnline) || isProcessingOfflineQueue || isInitializing ? (
                <div className="py-24 flex justify-center items-center">
                  <Loading />
                </div>
              ) : clientTranscripts && clientTranscripts.length ? (
                <MemoizedTranscriptList
                  selectedTranscript={selectedTranscript}
                  transcripts={mergedTranscripts}
                  onSelectTranscript={selectTranscript}
                  onDeleteTranscript={onDeleteTranscript}
                  recordingPatientMidUUID={recordingPatientMidUUID}
                  uploadingPatientMidUUID={uploadingPatientMidUUID}
                  offlineQueueCount={offlineQueueCount}
                />
              ) : (
                <p className="h-full flex items-center  justify-center py-8 px-4 text-center">
                  <em>No transcripts found</em>
                </p>
              )}
            </div>
            <AudioRecorder
              patientTag={patientTag}
              patientData={patientData ?? defaultPatientData}
              newPatientData={newPatientData}
              onRecording={onRecording}
              onStopRecording={onStopRecording}
              onUploadComplete={onUploadComplete}
              hasMicrophoneAccess={hasMicrophoneAccess}
              onSpeechCommand={onSpeechCommand}
            />
            <div className="flex-grow-0 px-4 lg:px-6 pb-4 lg:pb-6">
              <StatusBanner status={status} speechStatus={speechStatus} isOnline={isOnline} />
              <FormCreateTranscript status="" patient_code={defaultPatientCode} onUpdate={(pc: string, language: string) => {
                const newPatientData = { patient_code: pc, patient_tag: patientTag, mid: uuidv4(), language, token_count: 0 };
                setNewPatientData(newPatientData);
              }} disabled={false} />
            </div>
          </>
        }
        onlineTranscripts={onlineTranscripts}
        clientTranscripts={clientTranscripts}
      >
        {selectedTranscript && <Transcript transcript={selectedTranscript}
          recordingPatientMidUUID={recordingPatientMidUUID}
          uploadingPatientMidUUID={uploadingPatientMidUUID} />}
      </DashboardLayout>
      <FloatingWidget
        show
        isActivated={recordingPatientMidUUID !== ''}
        actions={[{ label: 'Hide', onClick: () => {} }]}
      />
      <FloatingAfterscribeManager />
    </>
  );
};

export default Dashboard;
