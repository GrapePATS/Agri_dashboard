import { useQuery } from '@tanstack/react-query';
import { fetchYieldSummary } from '../lib/api';

export function useYieldSummary() {
  return useQuery({
    queryKey: ['yieldSummary'],
    queryFn: fetchYieldSummary,
    staleTime: 60_000,
  });
}
