import { useCallback, useEffect, useRef, useState } from 'react';
import supabase from '@/supabase';
import { useToast } from '@/components/ui/use-toast';
import {
  clearAudioChunks,
  closeIndexedDB,
  getAllPatientMids,
  getAudioChunks,
  initIndexedDB,
  saveAudioChunk,
} from '@/utils/indexedDB';

interface UseIndexedDbUploadResult {
  isDbReady: boolean;
  handleChunk: (patientMid: string, chunk: number, blob: Blob) => Promise<void>;
  finalizeUploads: (patientMid: string) => Promise<void>;
}

const blobMap = new Map<Promise<any>, [string, Blob]>();
const uploadMap = new Map<string, Promise<any>[]>();

export function useIndexedDbUpload(
  isOnline: boolean,
): UseIndexedDbUploadResult {
  const { toast } = useToast();
  const [isDbReady, setIsDbReady] = useState(false);
  const prevOnlineStatus = useRef(isOnline);

  useEffect(() => {
    initIndexedDB()
      .then(() => setIsDbReady(true))
      .catch((error) => {
        console.error('Failed to initialize IndexedDB:', error);
      });
    return () => {
      closeIndexedDB();
    };
  }, []);

  const doUpload = useCallback((path: string, blb: Blob) => {
    return supabase.storage
      .from('armada-voice2')
      .upload(path, blb, {
        cacheControl: '3600',
        upsert: false,
      });
  }, []);

  const handleChunk = useCallback(
    async (patientMid: string, chunk: number, blob: Blob) => {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) throw new Error('No user ID found in session');
      const path = `${userId}/${patientMid}-${chunk}.wav`;
      if (isOnline) {
        if (!uploadMap.get(patientMid)) {
          uploadMap.set(patientMid, []);
        }
        const uploadTask = doUpload(path, blob);
        uploadMap.get(patientMid)!.push(uploadTask);
        blobMap.set(uploadTask, [path, blob]);
      } else if (isDbReady) {
        try {
          await saveAudioChunk(patientMid, chunk, blob);
        } catch (error) {
          console.error('Error saving audio chunk:', error);
        }
      } else {
        console.error('IndexedDB is not ready. Unable to save audio chunk.');
      }
    },
    [isOnline, isDbReady, doUpload],
  );

  const finalizeUploads = useCallback(
    async (patientMid: string) => {
      if (!isOnline) return;
      let maxRetries = 3;
      let retries: Promise<any>[] = [];
      do {
        try {
          const uploadPromises = uploadMap.get(patientMid) ?? [];
          retries = [];
          for (const promise of uploadPromises) {
            const [path, blb] = blobMap.get(promise)!;
            try {
              const r = await promise;
              if (r.error) {
                const uploadTask = doUpload(path, blb);
                retries.push(uploadTask);
                blobMap.set(uploadTask, [path, blb]);
              }
            } catch (err) {
              const uploadTask = doUpload(path, blb);
              retries.push(uploadTask);
              blobMap.set(uploadTask, [path, blb]);
            } finally {
              blobMap.delete(promise);
            }
          }
        } catch (err) {
          console.error('An error occurred while uploading audio', err);
        } finally {
          uploadMap.delete(patientMid);
          uploadMap.set(patientMid, retries);
        }
      } while (retries.length > 0 && maxRetries-- > 0);
    },
    [isOnline, doUpload],
  );

  const uploadOfflineChunks = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) throw new Error('No user ID found in session');
      const patientMids = await getAllPatientMids();
      for (const patientMid of patientMids) {
        try {
          const chunks = await getAudioChunks(patientMid);
          for (let i = 0; i < chunks.length; i++) {
            const path = `${userId}/${patientMid}-${i + 1}.wav`;
            try {
              await doUpload(path, chunks[i]);
            } catch (error) {
              console.error(
                `Failed to upload chunk ${i + 1} for patient ${patientMid}:`,
                error,
              );
            }
          }
          await clearAudioChunks(patientMid);
        } catch (error) {
          console.error(`Error processing patient ${patientMid}:`, error);
        }
      }
    } catch (error) {
      console.error('Error uploading offline chunks:', error);
    }
  }, [doUpload]);

  useEffect(() => {
    if (isOnline !== prevOnlineStatus.current) {
      if (isOnline) {
        toast({
          title: 'Online',
          description: 'Your connection has been restored.',
          variant: 'default',
        });
        if (isDbReady) {
          uploadOfflineChunks();
        }
      } else {
        toast({
          title: 'Offline',
          description:
            'You are currently offline. Changes will be synced when your connection is restored.',
          variant: 'default',
        });
      }
      prevOnlineStatus.current = isOnline;
    }
  }, [isOnline, isDbReady, toast, uploadOfflineChunks]);

  return { isDbReady, handleChunk, finalizeUploads };
}

export default useIndexedDbUpload;
