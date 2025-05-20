import { useQueryClient } from '@tanstack/react-query';

import { Transcript } from '@/types/types';

export default function useUpdateTranscript(transcript: Transcript) {
  const queryClient = useQueryClient();

  queryClient.setQueryData(['transcripts2'], (oldTranscripts: Transcript[] | undefined) => {
    if (!oldTranscripts) return;

    const newTranscripts = oldTranscripts.map((oldTranscript) => {
      if (oldTranscript.mid === transcript.mid) {
        return transcript;
      }

      return oldTranscript;
    });

    return newTranscripts;
  });
}
