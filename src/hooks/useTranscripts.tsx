import { useQuery } from '@tanstack/react-query';
import { Transcript } from '@/types/types';

export default function useTranscripts() {
  return useQuery<Transcript[], Error>({
    queryKey: ['transcripts2'],
    queryFn: async () => {
      const response = await fetch('/api/transcripts');
      if (!response.ok) {
        throw new Error(await response.text());
      }

      const data = (await response.json()) as Transcript[];
      return data || []; // Return an empty array if data is null
    },
    staleTime: 1000 * 5,  // 5 seconds
    cacheTime: 1000 * 60 * 1,  // 1 minute
  });
}
