import { useCallback, useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/components/ui/use-toast';
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

export function useOfflineQueue() {
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);
  const [isProcessingOfflineQueue, setIsProcessingOfflineQueue] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

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

  return {
    offlineQueueCount,
    isProcessingOfflineQueue,
    queueAction,
    processQueue,
    setOfflineQueueCount,
  };
}

