import { QueryClient, useMutation, useQueryClient } from '@tanstack/react-query';
import supabase from '@/supabase';
import { TranscriptData, TranscriptTokenCount } from '@/types/types';
import { uuidv4 } from '@/lib/utils';
import { RealtimeChannel } from '@supabase/supabase-js';
import { debounce } from '@/utils/debounce';

let _didSubscribe: Boolean = false;
let _onRealtimeUpdate: Function | undefined = undefined;
let _queryClient: QueryClient | undefined = undefined;
let _restart: Boolean = false;
let _mySubscription: RealtimeChannel | undefined = undefined;

export function realtimeTranscripts(queryClient: QueryClient, onRealtimeUpdate: Function | undefined = undefined) {
  _onRealtimeUpdate = onRealtimeUpdate;
  _queryClient = queryClient;
  if (_didSubscribe) {
    return;
  }
  _didSubscribe = true;
  _restart = false;
  _mySubscription = undefined;

  const connectionErrorHandler = async (status: string) => {
    _restart = true;
    if (status !== 'CLOSED') {
      _mySubscription?.unsubscribe();
      _mySubscription = undefined;
    }
    console.log('disconnect', status);
    if (document.visibilityState === 'visible') {
        start_up(); // got an error, but tab still running so restart
    }
  };

  const eventHandler = debounce(() => {
    _queryClient?.invalidateQueries(['transcripts2']);
    _onRealtimeUpdate && _onRealtimeUpdate();
  }, 1000);

  const startStream = debounce(async () => {
    console.log('subscribing to realtime...');
    _mySubscription = supabase
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
      .subscribe((status) => {
        console.log(`subscribed ==> ${status}`);
        if (status === 'SUBSCRIBED') {
          // Connection established
        }
        else {
          connectionErrorHandler(status);
        }
      });
  }, 2000);

  startStream();

  const start_up = async () => {
    console.log('start_up');
    eventHandler();
    if (document.visibilityState === 'visible' && _restart) {
      console.log('start stream');
      startStream();
      _restart = false;
    }
  };

  document.onvisibilitychange = () => {
    console.log('visibility change', document.visibilityState)
    if (document.visibilityState === 'visible') {
        start_up();
    }
  };
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

  const { error } = await supabase
    .from('transcripts2')
    .insert([{ ...transcript, token_count, created_at, user_id, patient_uuid }]);

  if (error) {
    throw new Error(error?.message ?? 'Unknown error');
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
