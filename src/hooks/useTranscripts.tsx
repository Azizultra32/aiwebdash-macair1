import { useQuery } from '@tanstack/react-query';
import supabase from '@/supabase';
import { Transcript } from '@/types/types';

export default function useTranscripts() {
  return useQuery<Transcript[], Error>({
    queryKey: ['transcripts2'],
    queryFn: async () => {
      const { data, error } = await supabase.from('transcripts2').select().order('id', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];  // Return an empty array if data is null
    },
    staleTime: 1000 * 5,  // 5 seconds
    cacheTime: 1000 * 60 * 1,  // 1 minute
  });
}
