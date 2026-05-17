import { useMutation } from '@tanstack/react-query';
import { fetchAISummary } from '../lib/api';

export function useAISummary() {
  return useMutation({
    mutationFn: (zoneId?: string | null) => fetchAISummary(zoneId),
  });
}
