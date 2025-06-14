import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
import type { Transcript as TranscriptT } from '@/types/types';
import {
  saveToOfflineQueue,
  loadOfflineQueue,
  clearOfflineQueue,
  type OfflineAction,
} from '@/utils/storageHelpers';
import {
  createTranscriptAsync,
  updateTranscriptAsync,
  deleteTranscriptAsync,
} from '@/hooks/useCreateTranscript';
import { debounce } from '@/utils/debounce';

const LOCALSTORAGE_KEY = 'offlineTranscripts';

export const saveTranscriptsToLocalStorage = (transcripts: TranscriptT[]) => {
  localStorage.setItem(LOCALSTORAGE_KEY, JSON.stringify(transcripts));
};

export const loadTranscriptsFromLocalStorage = (): TranscriptT[] => {
  const storedData = localStorage.getItem(LOCALSTORAGE_KEY);
  return storedData ? JSON.parse(storedData) : [];
};
export function useOfflineQueue(
  mergedTranscripts?: TranscriptT[],
  isOnline?: boolean,
) {
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);
  const [isProcessingOfflineQueue, setIsProcessingOfflineQueue] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [prevOnlineStatus, setPrevOnlineStatus] = useState<boolean>(isOnline ?? false);

  useEffect(() => {
    setOfflineQueueCount(loadOfflineQueue().length);
  }, []);

  const queueAction = useCallback((action: OfflineAction) => {
    saveToOfflineQueue(action);
    setOfflineQueueCount((prev) => prev + 1);
  }, []);

  const processQueue = useCallback(async () => {
    const queue = loadOfflineQueue();
    if (!queue.length) return;

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
  }, [toast, queryClient]);

  const debouncedSync = useMemo(
    () =>
      debounce(() => {
        if (mergedTranscripts && mergedTranscripts.length) {
          saveTranscriptsToLocalStorage(mergedTranscripts);

          // Process offline queue
          processQueue();
        }
      }, 1000),
    [mergedTranscripts, processQueue],
  );

  useEffect(() => {
    if (
      typeof isOnline === 'boolean' &&
      typeof prevOnlineStatus === 'boolean' &&
      isOnline !== prevOnlineStatus
    ) {
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
          description:
            'You are currently offline. Changes will be synced when your connection is restored.',
          variant: 'default',
        });
      }
      setPrevOnlineStatus(isOnline);
    }
  }, [isOnline, debouncedSync, prevOnlineStatus, toast]);

  return {
    offlineQueueCount,
    isProcessingOfflineQueue,
    queueAction,
    processQueue,
    setOfflineQueueCount,
  };
}

