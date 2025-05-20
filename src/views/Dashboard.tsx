import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useMediaQuery } from 'usehooks-ts';
import DashboardLayout from '@/components/DashboardLayout';
import FormCreateTranscript from '@/components/FormCreateTranscript';
import TranscriptList from '@/components/TranscriptList';
import useTranscripts from '@/hooks/useTranscripts';
import useCreateTransript from '@/hooks/useCreateTranscript';
import { realtimeTranscripts, deleteTranscriptAsync, createTranscriptAsync, updateTranscriptAsync } from '@/hooks/useCreateTranscript';
import Transcript from '@/components/Transcript';
import { Loading } from '@/components/Loading';
import type { Transcript as TranscriptT, TranscriptData } from '@/types/types';
import AudioRecorder from '@/components/ui/recorder';
import { useQueryClient } from '@tanstack/react-query';
import { checkMicrophonePermissions, uuidv4 } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';
import * as Dialog from '@radix-ui/react-dialog';
import 'regenerator-runtime/runtime'
import { useSpeechRecognition } from 'react-speech-recognition';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { debounce } from '@/utils/debounce';
import { unregisterServiceWorker } from '@/utils/serviceWorker';

let clientSideMid: string | undefined = undefined;

const LOCALSTORAGE_KEY = 'offlineTranscripts';
const OFFLINE_QUEUE_KEY = 'offlineQueue';

const saveToLocalStorage = (transcripts: TranscriptT[]) => {
  localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(transcripts));
};

const loadFromLocalStorage = (): TranscriptT[] => {
  const storedData = localStorage.getItem(LOCALSTORAGE_KEY);
  return storedData ? JSON.parse(storedData) : [];
};

type OfflineAction =
  | { type: 'create'; data: TranscriptData }
  | { type: 'update'; data: { mid: string; token_count: number } }
  | { type: 'delete'; data: { mid: string } };

const saveToOfflineQueue = (action: OfflineAction) => {
  const queue = JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
  queue.push(action);
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
};

const loadOfflineQueue = (): OfflineAction[] => {
  return JSON.parse(localStorage.getItem(OFFLINE_QUEUE_KEY) || '[]');
};

const clearOfflineQueue = () => {
  localStorage.removeItem(OFFLINE_QUEUE_KEY);
};

const Dashboard = () => {
  const [selectedTranscript, setSelectedTranscript] = useState<TranscriptT>();
  const [clientTranscripts, setClientTranscripts] = useState<TranscriptT[]>();
  const { data: onlineTranscripts, isLoading: isLoadingTranscripts } = useTranscripts();
  const { toast } = useToast();
  const isOnline = useOnlineStatus();
  const [prevOnlineStatus, setPrevOnlineStatus] = useState<Boolean>(isOnline);
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);
  const [isProcessingOfflineQueue, setIsProcessingOfflineQueue] = useState(false);
  const { mutateAsync: createTranscript } = useCreateTransript();

  const patientTag = useMemo(() => {
    // Combine online and local transcripts, removing duplicates by mid
    const allTranscripts = [...(onlineTranscripts || []), ...(clientTranscripts || [])];
    const uniqueTranscripts = Array.from(new Map(allTranscripts.map(t => [t.mid, t])).values());

    // Get the highest tag number
    const tags = uniqueTranscripts.map(t => t.patient_tag);
    if (!tags.length) return 1;

    return Math.max(...tags) + 1;
  }, [onlineTranscripts, clientTranscripts]);

  const defaultPatientData = { patient_code: 'Patient', patient_tag: patientTag, mid: uuidv4(), language: 'auto', token_count: 0 };
  const [patientData, setPatientData] = useState<TranscriptData>(defaultPatientData);
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  const [newPatient, setNewPatient] = useState<TranscriptData>();
  const [defaultPatientCode, setDefaultPatientCode] = useState<string>("");
  const [status, setStatus] = useState<string>("Ready");
  const [hasMicrophoneAccess, setHasMicrophoneAccess] = useState<boolean>(false);
  const [recordingPatientMidUUID, setRecordingPatientMidUUID] = useState<string>('');
  const [uploadingPatientMidUUID, setUploadingPatientMidUUID] = useState<string>('');
  const [speechCommandActivated, setSpeechCommandActivated] = useState<number>(0);

  const terminateRecording = useCallback(async ({ mid, token_count }: { mid: string, token_count: number }) => {
    console.log(`completing transcript for patient ${mid}...`);
    const saveOffline = () => {
      saveToOfflineQueue({ type: 'update', data: { mid, token_count } });
      setOfflineQueueCount(prev => prev + 1);
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
    let length = str.length;
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

  const toggleSidebar = useCallback(() => {
    setShowSidebar((prev) => !prev);
  }, [isDesktop, showSidebar]);

  const selectTranscript = useCallback(
    (transcript: TranscriptT) => {
      setSelectedTranscript(transcript);
      setPatientData(transcript);
      if (transcript && transcript.ai_summary == null) {
        setStatus('Analyzing...');
      }
      else if ((isDesktop && transcript && transcript?.mid === recordingPatientMidUUID) || (!isDesktop && recordingPatientMidUUID)) {
        setStatus("Listening...");
      }
      else if ((isDesktop && transcript && transcript?.mid === uploadingPatientMidUUID) || (!isDesktop && uploadingPatientMidUUID)) {
        setStatus("Uploading...");
      }
      else {
        setStatus('Ready');
      }
      !isDesktop && toggleSidebar();
    },
    [isDesktop, recordingPatientMidUUID, uploadingPatientMidUUID],
  );

  const queryClient = useQueryClient();

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
        saveToOfflineQueue({ type: 'delete', data: { mid } });
        setOfflineQueueCount(prev => prev + 1);
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

  useEffect(() => {
    if (isOnline) {
      realtimeTranscripts(queryClient);
    }
  }, [isOnline]);

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

    if (t0 == undefined && newPatient && newPatient.mid && updatedTranscripts.find(x => x.mid === newPatient.mid!) == undefined) {
      const now = new Date();
      const now_utc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(),
        now.getUTCDate(), now.getUTCHours(),
        now.getUTCMinutes(), now.getUTCSeconds());
      const created_at = new Date(now_utc).toISOString();
      updatedTranscripts.unshift({
        ...newPatient,
        mid: newPatient.mid!,
        id: -1,
        user_id: "",
        token_count: 0,
        transcript: undefined,
        created_at,
      });
      didCreateClientPatient = true;
    }
    else if (newPatient && newPatient.mid && newPatient.mid === clientSideMid) {
      if (updatedTranscripts.find(x => x.mid === newPatient.mid!)) {
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
    setRecordingPatientMidUUID(patient.mid!);
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
          saveToOfflineQueue({ type: 'create', data: patient });
          setOfflineQueueCount(prev => prev + 1);
        }
      }
      else {
        saveToOfflineQueue({ type: 'create', data: patient });
        setOfflineQueueCount(prev => prev + 1);
      }
    }
  }, [isOnline]);

  const onStopRecording = useCallback((t: TranscriptData) => {
    terminateRecording({ token_count: t.token_count, mid: t.mid! });

    clientSideMid = t.mid;
    setDefaultPatientCode('');
    setRecordingPatientMidUUID('');
    setPatientData({ patient_code: 'Patient', patient_tag: patientTag, mid: uuidv4(), language: t.language, token_count: 0 });
    setUploadingPatientMidUUID(t.mid!);
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

  const onSpeechCommand = useCallback((command: number, text: string) => {
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
      setDefaultPatientCode(text);
      setPatientData({ ...patientData, patient_code: text });
      toast({
        title: 'Patient Name',
        description: `Patient named ${text}`,
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
    setOfflineQueueCount(loadOfflineQueue().length);
  }, []);

  // 1. Memoize the merged transcripts calculation
  const mergedTranscripts = useMemo(() => {
    if (!onlineTranscripts && !clientTranscripts) return [];
    const merged = [...(onlineTranscripts || []), ...(clientTranscripts || [])];
    return merged.filter((transcript, index, self) =>
      index === self.findIndex((t) => t.mid === transcript.mid)
    ).sort((a: TranscriptT, b: TranscriptT) =>
      +new Date(b.created_at) - +new Date(a.created_at)
    );
  }, [onlineTranscripts, clientTranscripts]);

  useEffect(() => {
    const mid = selectedTranscript?.mid;
    const t = mergedTranscripts?.find(x => x.mid === mid);
    setSelectedTranscript(t);
    if (t) {
      setPatientData(t!);
    }
  }, [mergedTranscripts, selectedTranscript?.mid]);

  const debouncedSync = useMemo(
    () =>
      debounce(() => {
        if (mergedTranscripts && mergedTranscripts.length) {
          saveToLocalStorage(mergedTranscripts);

          // Process offline queue
          const offlineQueue = loadOfflineQueue();
          if (offlineQueue.length > 0) {
            processOfflineQueue(offlineQueue);
          }
        }
      }, 1000),
    [mergedTranscripts]
  );

  // Sync local data with online data when connection is restored
  useEffect(() => {
    if (isOnline !== prevOnlineStatus) {
      if (isOnline) {
        toast({
          title: 'Online',
          description: 'Your connection has been restored.',
          variant: 'default',
        });

        debouncedSync();
      } else {
        toast({
          title: 'Offline',
          description: 'You are currently offline. Changes will be synced when your connection is restored.',
          variant: 'default',
        });
      }
      setPrevOnlineStatus(isOnline);
    }
  }, [isOnline, debouncedSync, prevOnlineStatus]);

  const processOfflineQueue = async (queue: OfflineAction[]) => {
    setIsProcessingOfflineQueue(true);
    let shouldClearQueue = true;
    for (const action of queue) {
      try {
        switch (action.type) {
          case 'create':
            await createTranscriptAsync(action.data);
            break;
          case 'update':
            await updateTranscriptAsync(action.data);
            break;
          case 'delete':
            await deleteTranscriptAsync(action.data.mid);
            break;
        }
      } catch (error) {
        shouldClearQueue = false;
        console.error('Error processing offline action:', error);
        toast({
          title: 'Sync Error',
          description: `Failed to sync ${action.type} action. Please try again later.`,
          variant: 'destructive',
        });
        break;
      }
    }
    if (shouldClearQueue) {
      clearOfflineQueue();
      setOfflineQueueCount(0);
    }
    setIsProcessingOfflineQueue(false);
    queryClient.invalidateQueries(['transcripts2']);
  };

  //useEffect(() => debouncedSync(), [debouncedSync]);

  const reloadIfNotRecording = useCallback(async () => {
    const isRecording = recordingPatientMidUUID !== '';
    toast({
      title: 'Update Available',
      description: isRecording ? 'Reload to get the latest version.' : 'Reloading in 3 seconds to get the latest version.',
    });
    await unregisterServiceWorker();
    if (!isRecording) {
      // Reload the page to get new version
      setTimeout(() => window.location.reload(), 3000);
    }
  }, [recordingPatientMidUUID]);

  const reloadHandler = useCallback((event: MessageEvent) => {
    if (event.data.type === 'UPDATE_AVAILABLE') {
      reloadIfNotRecording();
    }
  }, [reloadIfNotRecording]);

  const [previousReloadHandler, setPreviousReloadHandler] = useState<(event: MessageEvent) => void>();

  useEffect(() => {
    if (previousReloadHandler !== reloadHandler) {
      if ('serviceWorker' in navigator) {
        if (previousReloadHandler) {
          navigator.serviceWorker.removeEventListener('message', previousReloadHandler);
        }
        setPreviousReloadHandler(() => reloadHandler);
        navigator.serviceWorker.addEventListener('message', reloadHandler);
      }
    }
  }, [reloadHandler, previousReloadHandler]);

  const MemoizedTranscriptList = memo(TranscriptList);

  const [newPatientData, setNewPatientData] = useState<TranscriptData>(defaultPatientData);

  return (
    <>
      <Dialog.Root open={(speechCommandActivated !== 0)}>
        <Dialog.Trigger />
        <Dialog.Portal>
          <Dialog.Overlay className="DialogOverlay z-20">
            <Dialog.Content className="DialogContent" style={(speechCommandActivated === 0)
              ? {}
              : (speechCommandActivated === 1 || speechCommandActivated === 4)
                ? { backgroundColor: "#4CBB17", width: "100%", height: "100%", opacity: 0.5 }
                : (speechCommandActivated === 2)
                  ? { backgroundColor: "#FFBF00", width: "100%", height: "100%", opacity: 0.5 }
                  : (speechCommandActivated === 3)
                    ? { backgroundColor: "#D22B2B", width: "100%", height: "100%", opacity: 0.5 }
                    : {}}>
            </Dialog.Content>
          </Dialog.Overlay>
        </Dialog.Portal>
      </Dialog.Root>
      <DashboardLayout
        recording={recordingPatientMidUUID !== ''}
        showSidebar={showSidebar}
        isDesktop={isDesktop}
        toggleSidebar={toggleSidebar}
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
              patientData={patientData}
              newPatientData={newPatientData}
              onRecording={onRecording}
              onStopRecording={onStopRecording}
              onUploadComplete={onUploadComplete}
              hasMicrophoneAccess={hasMicrophoneAccess}
              onSpeechCommand={onSpeechCommand}
              selectPatient={(patientTag: number) => {
                const t = mergedTranscripts.find(x => x.patient_tag === patientTag);
                selectTranscript(t);
              }}
            />
            <div className="flex-grow-0 px-4 lg:px-6 pb-4 lg:pb-6">
              <FormCreateTranscript status={`${status} ${speechStatus} ${isOnline ? '(Online)' : '(Offline)'}`} patient_code={defaultPatientCode} onUpdate={(pc: string, language: string) => {
                const newPatientData = { patient_code: pc, patient_tag: patientTag, mid: uuidv4(), language, token_count: 0 };
                setNewPatientData(newPatientData);
              }} disabled={false} />
            </div>
          </>
        }
        selectedTranscript={selectedTranscript}
        onlineTranscripts={onlineTranscripts}
        clientTranscripts={clientTranscripts}
      >
        {selectedTranscript && <Transcript transcript={selectedTranscript}
          recordingPatientMidUUID={recordingPatientMidUUID}
          uploadingPatientMidUUID={uploadingPatientMidUUID} />}
      </DashboardLayout>
    </>
  );
};

export default Dashboard;
