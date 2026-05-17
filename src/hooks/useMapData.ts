import { useQuery } from '@tanstack/react-query';
import { fetchMapData } from '../lib/api';

export function useMapData() {
  return useQuery({
    queryKey: ['mapData'],
    queryFn: fetchMapData,
    staleTime: 60_000,
  });
}
