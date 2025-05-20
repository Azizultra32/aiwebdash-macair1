import { useCallback, useState, useEffect, useRef } from 'react';
import supabase from '@/supabase';
import { useMemo } from 'react';
import { getAudioMimeType, uuidv4 } from '@/lib/utils';
import { ReactMic } from '@/lib/react-mic';
import { ChunkNumberWrapper } from '@/types/types';
import NoSleep from 'nosleep.js';
import 'regenerator-runtime/runtime'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';
import { initIndexedDB, saveAudioChunk, getAudioChunks, clearAudioChunks, closeIndexedDB, getAllPatientMids } from '@/utils/indexedDB';
import { MyLiveKitRoom } from '../MyLiveKitRoom';

let blobMap: Map<Promise<any>, any[]> = new Map<Promise<any>, any[]>();
let uploadMap: Map<string, Promise<any>[]> = new Map<string, Promise<any>[]>();
const noSleep = new NoSleep();
let didEnableNoSleep = false;

function AudioRecorder(_props: any) {
  const [recording, setRecording] = useState<boolean>(false);
  const [recordingPaused, setRecordingPaused] = useState<boolean>(false);
  const [isRecordButtonDisabled, setRecordingButtonDisabled] = useState<boolean>(false);
  const [isAddendum, setIsAddendum] = useState<boolean>(false);
  const [isVoiceChat, setIsVoiceChat] = useState<boolean>(false);
  const isOnline = useOnlineStatus();
  const prevOnlineStatus = useRef(isOnline);
  const { toast } = useToast();
  const [isDbReady, setIsDbReady] = useState(false);
  const truncate = ( str : string, n : number, useWordBoundary : boolean ) => {
    if (str.length <= n) { return str; }
    const subString = str.slice(0, n-1);
    return (useWordBoundary 
      ? subString.slice(0, subString.lastIndexOf(" ")) 
      : subString);
  };
  const mimeType = getAudioMimeType();
  const { patientData, newPatientData, hasMicrophoneAccess, onRecording, onStopRecording, onUploadComplete, selectPatient } = _props;
  const patientTag = _props.patientTag;
  const patient = useMemo(() => {
    const pd = isAddendum ? patientData : newPatientData;
    const result = {
      patient_code: pd?.patient_code ?? 'Patient',
      patient_tag: isAddendum ? pd?.patient_tag : patientTag,
      mid: pd?.mid ?? uuidv4(),
      language: pd?.language ?? 'auto',
      token_count: pd?.token_count ?? 0,
    };
    console.log('isAddendum', isAddendum, JSON.stringify(result));
    return result;
  }, [patientData, newPatientData, patientTag, isAddendum]);

  const [chunkNumberWrapper, setChunkNumberWrapper] = useState<ChunkNumberWrapper>({ chunkNumber: 0 });

  useEffect(() => {
    initIndexedDB().then(() => {
      setIsDbReady(true);
    }).catch(error => {
      console.error("Failed to initialize IndexedDB:", error);
    });
    return () => {
      closeIndexedDB();
    };
  }, []);

  const doUpload = useCallback((path : string, blb : Blob) => {
    return supabase.storage
    .from('armada-voice2')
    .upload(path, blb, {
      cacheControl: '3600',
      upsert: false,
    });
  }, []);

  const onData = useCallback(async (blob: Blob, soundDetected: boolean) => {
    if (!soundDetected) {
      return;
    }

    const userUUID: any = await supabase.auth.getSession();
    const patientMidUUID = patient.mid;

    let chunk = ++chunkNumberWrapper.chunkNumber;
    if (isAddendum) {
      chunk = patient.token_count + chunk;
    }
    const path = `${userUUID.data.session.user.id}/${patientMidUUID}-${chunk}.wav`;

    console.log(`handling chunk ${path}, size ${blob.size} bytes, blob type ${blob.type}, mimeType ${mimeType}, chunk ${chunk}`);
    
    if (isOnline) {
      if (!uploadMap.get(patientMidUUID)) {
        uploadMap.set(patientMidUUID, []);
      }
      const uploadTask = doUpload(path, blob);
      uploadMap.get(patientMidUUID)!.push(uploadTask);
      blobMap.set(uploadTask, [path, blob]);
    } else if (isDbReady) {
      try {
        await saveAudioChunk(patientMidUUID, chunk, blob);
      } catch (error) {
        console.error('Error saving audio chunk:', error);
      }
    } else {
      console.error('IndexedDB is not ready. Unable to save audio chunk.');
    }

    setChunkNumberWrapper({ chunkNumber: chunk - (isAddendum ? patient.token_count : 0) });

    console.log(`set next chunk number ${chunk}`)
  }, [patient, chunkNumberWrapper, isOnline, isDbReady, mimeType, doUpload, isAddendum]);

  const onStopCallback = useCallback(async (blob: Blob, recordingPaused: boolean, soundDetected: boolean) => {
    if (onStopRecording && !recordingPaused) {
      if (isAddendum) {
        onStopRecording({ ...patient });
      }
      else {
        onStopRecording({ ...patient, token_count: chunkNumberWrapper.chunkNumber + 1 });
      }
    }

    setRecordingButtonDisabled(false);

    if (blob && soundDetected) {
      await onData(blob, soundDetected);
    }
    else if (!soundDetected) {
      const emptyBlob = new Blob([], {type : 'audio/mp3'});
      await onData(emptyBlob, true);
    }

    if (!recordingPaused) {
      const patientMidUUID = patient.mid;
      if (isOnline) {
        let maxRetries : number = 3;
        let retries : Promise<any>[] = [];
        do {
          console.log(`retry ${3 - maxRetries} for patient ${patientMidUUID}...`);
          try {
            const uploadPromises = uploadMap.get(patientMidUUID) ?? [];
            retries = [];
            for (let i in uploadPromises) {
              const promise = uploadPromises[i];
              const [path, blb] = blobMap.get(promise)!;
              try {
                const r = await promise;
                if (r.error) {
                  const uploadTask = doUpload(path, blb);
                  retries.push(uploadTask);
                  blobMap.set(uploadTask, [path, blb]);
                }
              }
              catch (err) {
                const uploadTask = doUpload(path, blb);
                retries.push(uploadTask);
                blobMap.set(uploadTask, [path, blb]);
              }
              finally {
                blobMap.delete(promise);
              }
            }
          }
          catch (err) {
            console.error('An error occurred while uploading audio', err);
          }
          finally {
            uploadMap.delete(patientMidUUID);
            uploadMap.set(patientMidUUID, retries);
          }
        }
        while (retries.length > 0 && maxRetries-- > 0);
      } else {
        console.log(`Recording completed offline for patient ${patientMidUUID}`);
      }
      if (onUploadComplete) {
        onUploadComplete(patient);
      }
    }

  }, [patient, onStopRecording, chunkNumberWrapper, isOnline, onData, doUpload, onUploadComplete, isAddendum]);

  const onStop = useCallback(async (blob: Blob, soundDetected: boolean) => {
    onStopCallback(blob, recordingPaused, soundDetected);
  }, [onStopCallback, recordingPaused]);

  const cStartRecording = useCallback(() => {
    console.log(`start recording`);
    if (!didEnableNoSleep) {
      didEnableNoSleep = true;
      noSleep.enable();
    }
    if (!recordingPaused) {
      setChunkNumberWrapper({ chunkNumber: 0 });
    }
    setRecording(true);
    setRecordingButtonDisabled(true);
    isOnline && supabase.from('transcripts2').update({ is_paused: false }).eq('mid', patient.mid);
  }, [recordingPaused, patient.mid, isAddendum]);

  const cStopRecording = useCallback(async () => {
    console.log(`stop recording`);
    if (didEnableNoSleep) {
      didEnableNoSleep = false;
      noSleep.disable();
    }
    if (recordingPaused) {
      const emptyBlob = new Blob([], {type : 'audio/mp3'});
      onStopCallback(emptyBlob, false, true);
    }
    else {
      setRecording(false);
    }
    setRecordingPaused(false);
    setRecordingButtonDisabled(true);
    isOnline && await supabase.from('transcripts2').update({ is_paused: false }).eq('mid', patient.mid);
  }, [recordingPaused, patient.mid, onStopCallback]);

  const cPauseRecording = useCallback(() => {
    console.log(`pause recording`);
    setRecordingPaused(true);
    setRecording(false);
    setRecordingButtonDisabled(true);
    isOnline && supabase.from('transcripts2').update({ is_paused: true }).eq('mid', patient.mid);
  }, [patient.mid]);

  const onStart = useCallback(async () => {
    if (!recordingPaused) {
      const patientMidUUID = patient.mid;
      if (!isAddendum) {
        console.log(`creating patient ${patientMidUUID}...`);
        const initialPatient = {
          ...patient,
          patient_tag: patientTag
        };
        console.log('initialPatient', JSON.stringify(initialPatient));
        if (onRecording) {
          onRecording(initialPatient);
        }
      }
      else {
        const initialPatient = {
          ...patient,
        };
        console.log('initialPatient', JSON.stringify(initialPatient));
        if (onRecording) {
          onRecording(initialPatient);
        }
      }
    }
    setRecordingButtonDisabled(false);
    setRecordingPaused(false);
  }, [patient, onRecording, recordingPaused, patientTag, isAddendum]);

  const micPermissionFailed = useCallback(() => {
    alert("Sorry, recording could not begin. Please ensure that your browser has enabled microphone permission for this site.")
  }, []);

  const commands = [
    {
      command: ['start recording'],
      callback: useCallback(() => {
        if (!recording || recordingPaused) {
          cStartRecording();
          _props?.onSpeechCommand(1);
        }
      }, [recording, recordingPaused, cStartRecording, _props]),
      matchInterim: true,
    },
    {
      command: ['pause recording'],
      callback: useCallback(() => {
        if (recording && !recordingPaused) {
          cPauseRecording();
          _props?.onSpeechCommand(2);
        }
      }, [recording, recordingPaused, cPauseRecording, _props]),
      matchInterim: true,
    },
    {
      command: ['stop recording', 'end recording'],
      callback: useCallback(() => {
        if (recording || recordingPaused) {
          cStopRecording();
          _props?.onSpeechCommand(3);
        }
      }, [recording, recordingPaused, cStopRecording, _props]),
      matchInterim: true,
    },
    {
      command: ['patient label (is) *', 'label patient *'],
      callback: useCallback((patientName : string) => {
        patientName = truncate(patientName, 12, true);
        console.log('rename patient', patientName, 'recording', recording, 'paused', recordingPaused, 'mid', patient.mid);
        if (recording || recordingPaused) {
          if (patient.mid != null) {
            supabase.from('transcripts2').update({ patient_code: patientName }).eq('mid', patient.mid).then((_ : any) => {
            });
          }
        }
        patient.patient_code = patientName;
        _props?.onSpeechCommand(4, patientName);
      }, [recording, recordingPaused, patient, _props, truncate]),
    },
  ];
  
  useSpeechRecognition({ commands });

  useEffect(() => {
    if (hasMicrophoneAccess) {
      SpeechRecognition.startListening({ continuous: true });
    }
  }, [hasMicrophoneAccess]);

  useEffect(() => {
    if (isOnline !== prevOnlineStatus.current) {
      if (isOnline) {
        toast({
          title: 'Online',
          description: 'Your connection has been restored.',
          variant: 'default',
        });
        // When coming back online, upload any stored offline chunks for all patients
        if (isDbReady) {
          const uploadOfflineChunks = async () => {
            try {
              const userUUID: any = await supabase.auth.getSession();
              const patientMids = await getAllPatientMids();
              console.log(`Found ${patientMids.length} patients with offline recordings`);
              
              for (const patientMid of patientMids) {
                try {
                  console.log(`Processing offline recordings for patient ${patientMid}`);
                  const chunks = await getAudioChunks(patientMid);
                  console.log(`Found ${chunks.length} chunks for patient ${patientMid}`);
                  
                  for (let i = 0; i < chunks.length; i++) {
                    const path = `${userUUID.data.session.user.id}/${patientMid}-${i + 1}.wav`;
                    try {
                      await doUpload(path, chunks[i]);
                      console.log(`Successfully uploaded chunk ${i + 1} for patient ${patientMid}`);
                    } catch (error) {
                      console.error(`Failed to upload chunk ${i + 1} for patient ${patientMid}:`, error);
                      // Continue with next chunk even if one fails
                    }
                  }
                  
                  await clearAudioChunks(patientMid);
                  console.log(`Cleared offline chunks for patient ${patientMid}`);
                } catch (error) {
                  console.error(`Error processing patient ${patientMid}:`, error);
                  // Continue with next patient even if one fails
                }
              }
              
              console.log('Completed processing all offline recordings');
            } catch (error) {
              console.error('Error uploading offline chunks:', error);
            }
          };
          uploadOfflineChunks();
        }
      } else {
        toast({
          title: 'Offline',
          description: 'You are currently offline. Changes will be synced when your connection is restored.',
          variant: 'default',
        });
      }
      prevOnlineStatus.current = isOnline;
    }
  }, [isOnline, isDbReady, doUpload, toast]);

  return (
    <>
      {!isVoiceChat && (
        <ReactMic
          record={recording}
          className="frequencyBars"
          onStart={onStart}
          onData={onData}
          onStop={onStop}
          channelCount={2}
          autoGainControl={true}
          audioBitsPerSecond={128000}
          sampleRate={32000}
          timeSlice={60000}
          mimeType={mimeType}
          strokeColor="#000000"
          backgroundColor="#F1F5F9" />
      )}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '2px',
        }}
      >
        {!isVoiceChat && (
          <>
            <div style={{ display: (!isAddendum && (recording || recordingPaused || !hasMicrophoneAccess)) ? 'none' : 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: '8px',
                cursor: (recording || recordingPaused || !hasMicrophoneAccess) ? 'pointer' : 'not-allowed'
              }}>
                <label className="text-sm font-medium">Addendum</label>
                <Switch
                  checked={isAddendum}
                  disabled={recording || recordingPaused || !hasMicrophoneAccess}
                  onCheckedChange={setIsAddendum}
                />
              </div>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '8px',
              cursor: (recording || recordingPaused) ? 'not-allowed' : 'pointer'
            }}>
              <label className="text-sm font-medium">Voice Chat</label>
              <Switch
                checked={isVoiceChat}
                disabled={recording || recordingPaused}
                onCheckedChange={setIsVoiceChat}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button onClick={hasMicrophoneAccess ? ((recording && !recordingPaused) ? cPauseRecording : cStartRecording) : micPermissionFailed} style={{width: "60px", height: "60px"}} disabled={isRecordButtonDisabled}>
                {(recording && !recordingPaused) ?
                <svg height="60px" width="100%" viewBox="0 0 64 64" enableBackground="new 0 0 64 64">
                  <path d="M30,2C15.432,2,2,15.432,2,32c0,16.569,13.432,30,30,30s30-13.431,30-30C62,15.432,48.568,2,32,2z M47,47H17V17h30V47z" fill="red"/>
                  <g transform="translate(12.5 16) scale(0.6 0.6)">
                    <path d="M23,45c0,1,0.9,2,2,2h4c1.1,0,2-1.1,2-2V9c0-1-0.9-2-2-2h-4c-1.1,0-2,1.1-2,2V43z" fill="red"/>
                    <path d="M35,45c0,1,0.9,2,2,2h4c1.1,0,2-1.1,2-2V9c0-1-0.9-2-2-2h-4c-1.1,0-2,1.1-2,2V43z" fill="red"/>
                  </g>
                </svg>
                :
                <svg height="60px" width="100%">
                  <circle cx="30" cy="30" r="25" stroke="black" strokeWidth="3" fill={(hasMicrophoneAccess ? "#009B33" : "#9B9B9B")} />
                </svg>}
              </button>
              <button onClick={cStopRecording} style={{width: "60px", height: "60px"}} hidden={(!recording && !recordingPaused)}>
                <svg height="60px" width="100%" viewBox="0 0 64 64" enableBackground="new 0 0 64 64">
                  <path d="M30,2C15.432,2,2,15.432,2,32c0,16.569,13.432,30,30,30s30-13.431,30-30C62,15.432,48.568,2,32,2z M47,47H17V17h30V47z" fill="red"/>
                </svg>
              </button>
            </div>
          </>
        )}
        {isVoiceChat && (
          <MyLiveKitRoom
            mid={patientData.mid}
            onDisconnected={() => setIsVoiceChat(false)}
            selectPatient={selectPatient}
          />
        )}
      </div>
    </>
  );
}

export default AudioRecorder;
