import { useCallback, useRef, useState } from 'react';
import supabase from '@/supabase';
import MicRecorder from '@/lib/react-mic/libs/mic-recorder';
import AudioContext from '@/lib/react-mic/libs/AudioContext';
import { logger } from '@/utils/logger';
import { ChunkNumberWrapper } from '@/types/types';
import { uuidv4 } from '@/lib/utils';

type Transcription = { text: string };
export type RecordCallback = (transcription: Transcription) => void;

export default function useAudioRecorder(onTranscription: RecordCallback) {
  const [isRecording, setIsRecording] = useState(false);
  const chunkNumberRef = useRef<ChunkNumberWrapper>({ chunkNumber: 0 });
  const recorderRef = useRef(new MicRecorder({ bitRate: 128 }));
  // Holds the active interval for collecting audio chunks
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const segmentsRef = useRef<string[]>([]);
  const flashUUIDRef = useRef<string | null>(null);

  const doUpload = useCallback((path: string, blb: Blob) => {
    return supabase.storage
      .from('armada-flash')
      .upload(path, blb, {
        cacheControl: '3600',
        upsert: false,
      });
  }, []);

  const transcribe = useCallback(
    async (blob: Blob, soundDetected: boolean, userId: string | undefined) => {
      if (!soundDetected) return;
      chunkNumberRef.current.chunkNumber++;
      const path = `${flashUUIDRef.current}-${chunkNumberRef.current.chunkNumber}.mp3`;
      const key = `${userId}/${path}`;
      await doUpload(key, blob);
      const { data } = await supabase.functions.invoke('flash', {
        body: JSON.stringify({ path }),
      });
      segmentsRef.current.push(data.text);
      onTranscription({ text: segmentsRef.current.join(' ') });
    },
    [doUpload, onTranscription]
  );

  const record = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    const recorder = recorderRef.current;

    if (!isRecording) {
      flashUUIDRef.current = uuidv4();
      recorder.start().catch((e: unknown) => logger.error('Recorder start error', e));
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      intervalRef.current = setInterval(() => {
        recorder
          .getMp3()
          .then((result) => {
            // getMp3 returns [buffer, Blob] according to library docs
            const [, blob] = result as [unknown, Blob];
            const soundDetected = AudioContext.getSoundDetected();
            AudioContext.setSoundDetected(false);
            transcribe(blob, soundDetected, data.session?.user?.id);
          })
          .catch((e: unknown) => logger.error('Recorder error', e));
      }, 3000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      recorder
        .stop()
        .getMp3()
        .then((result) => {
          // getMp3 returns [buffer, Blob] according to library docs
          const [, blob] = result as [unknown, Blob];
          const soundDetected = AudioContext.getSoundDetected();
          AudioContext.setSoundDetected(false);
          transcribe(blob, soundDetected, data.session?.user?.id);
        })
        .catch((e: unknown) => logger.error('Recorder stop error', e));
    }
    setIsRecording(!isRecording);
  }, [isRecording, transcribe]);

  return { isRecording, handleRecord: record };
}
