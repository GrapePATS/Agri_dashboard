import { useQuery } from '@tanstack/react-query';
import { fetchFarmSummary } from '../lib/api';

export function useFarmSummary() {
  return useQuery({
    queryKey: ['farmSummary'],
    queryFn: fetchFarmSummary,
    staleTime: 60_000,
  });
}
