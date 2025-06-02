import { useEffect, useRef } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import supabase from '@/supabase';
import { TranscriptData, TranscriptTokenCount } from '@/types/types';
import { uuidv4 } from '@/lib/utils';
import { RealtimeChannel } from '@supabase/supabase-js';
import { debounce } from '@/utils/debounce';
import { logger } from '@/utils/logger';

export function useRealtimeTranscripts(enabled: boolean, onRealtimeUpdate?: () => void) {
  const queryClient = useQueryClient();
  const subscriptionRef = useRef<RealtimeChannel | null>(null);
  const restartRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    function start_up() {
      logger.debug('start_up');
      eventHandler();
      if (document.visibilityState === 'visible' && restartRef.current) {
        logger.debug('start stream');
        startStream();
        restartRef.current = false;
      }
    }

    const connectionErrorHandler = (status: string) => {
      restartRef.current = true;
      if (status !== 'CLOSED') {
        subscriptionRef.current?.unsubscribe();
        subscriptionRef.current = null;
      }
      logger.debug('disconnect', { status });
      if (document.visibilityState === 'visible') {
        start_up();
      }
    };

    const eventHandler = debounce(() => {
      queryClient.invalidateQueries(['transcripts2']);
      onRealtimeUpdate && onRealtimeUpdate();
    }, 1000);

    const startStream = debounce(() => {
      logger.debug('subscribing to realtime...');
      subscriptionRef.current = supabase
        .channel('room1')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'transcripts2',
          },
          eventHandler
        )
        .subscribe(status => {
          logger.debug('subscribed', { status });
          if (status !== 'SUBSCRIBED') {
            connectionErrorHandler(status);
          }
        });
    }, 2000);

    const visibilityHandler = () => {
      logger.debug('visibility change', { state: document.visibilityState });
      if (document.visibilityState === 'visible') {
        start_up();
      }
    };

    startStream();
    document.addEventListener('visibilitychange', visibilityHandler);

    return () => {
      document.removeEventListener('visibilitychange', visibilityHandler);
      subscriptionRef.current?.unsubscribe();
      subscriptionRef.current = null;
      restartRef.current = false;
    };
  }, [enabled, onRealtimeUpdate, queryClient]);
}

export async function deleteTranscriptAsync(mid: string) {
  const { error } = await supabase
    .from('transcripts2')
    .delete()
    .eq('mid', mid);
  if (error) {
    throw new Error(error.message);
  }
  return mid; 
}

export async function createTranscriptAsync(transcript: TranscriptData) {
  const { data, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error(sessionError?.message ?? 'Unknown error');
  }

  const user_id = data?.session?.user?.id;
  if (!user_id) {
    throw new Error('User ID not available');
  }

  const now = new Date();
  const now_utc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(),
            now.getUTCDate(), now.getUTCHours(),
            now.getUTCMinutes(), now.getUTCSeconds());
  const created_at = new Date(now_utc).toISOString();

  const token_count = transcript.token_count || 0;
  const patient_uuid = uuidv4();

  const response = await fetch('/api/createTranscript', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${data?.session?.access_token}`,
    },
    body: JSON.stringify({
      ...transcript,
      token_count,
      created_at,
      user_id,
      patient_uuid,
    }),
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }

  return transcript.mid;
}

export async function updateTranscriptAsync(transcript: TranscriptTokenCount) {
  const { error } = await supabase
    .from('transcripts2')
    .update({ ...transcript })
    .eq('mid', transcript.mid);

  if (error) {
    throw new Error(error?.message ?? 'Unknown error');
  }

  supabase.rpc('process_queue');

  return transcript.mid;
}

// Hook used to create a new transcript and keep the query cache in sync
export default function useCreateTranscript() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transcript: TranscriptData) => createTranscriptAsync(transcript),
    onSuccess: async () => {
      await queryClient.invalidateQueries(['transcripts2']);
    },
  });
}

// Hook used to update a transcript and keep the query cache in sync
export function useUpdateTranscript() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (transcript: TranscriptTokenCount) => updateTranscriptAsync(transcript),
    onSuccess: async () => {
      await queryClient.invalidateQueries(['transcripts2']);
    },
  });
}
