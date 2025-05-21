import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { unregisterServiceWorker } from '@/utils/serviceWorker';

export function useServiceWorkerReload(recordingPatientMidUUID: string) {
  const { toast } = useToast();

  const reloadIfNotRecording = useCallback(async () => {
    const isRecording = recordingPatientMidUUID !== '';
    toast({
      title: 'Update Available',
      description: isRecording
        ? 'Reload to get the latest version.'
        : 'Reloading in 3 seconds to get the latest version.',
    });
    await unregisterServiceWorker();
    if (!isRecording) {
      setTimeout(() => window.location.reload(), 3000);
    }
  }, [recordingPatientMidUUID, toast]);

  const reloadHandler = useCallback(
    (event: MessageEvent) => {
      if (event.data.type === 'UPDATE_AVAILABLE') {
        reloadIfNotRecording();
      }
    },
    [reloadIfNotRecording],
  );

  const [previousReloadHandler, setPreviousReloadHandler] = useState<
    (event: MessageEvent) => void
  >();

  useEffect(() => {
    if (previousReloadHandler !== reloadHandler && 'serviceWorker' in navigator) {
      if (previousReloadHandler) {
        navigator.serviceWorker.removeEventListener('message', previousReloadHandler);
      }
      navigator.serviceWorker.addEventListener('message', reloadHandler);
      setPreviousReloadHandler(() => reloadHandler);
    }

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', reloadHandler);
      }
      setPreviousReloadHandler(undefined);
    };
  }, [reloadHandler]);
}

