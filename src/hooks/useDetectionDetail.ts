import { useQuery } from '@tanstack/react-query';
import { fetchDetectionById } from '../lib/api';

export function useDetectionDetail(id: string) {
  return useQuery({
    queryKey: ['detection', id],
    queryFn: () => fetchDetectionById(id),
    enabled: !!id,
    staleTime: 60_000,
  });
}
