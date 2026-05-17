import { useQuery } from '@tanstack/react-query';
import { fetchDroneStatus, fetchScanHistory } from '../lib/api';

export function useDroneStatus() {
  return useQuery({
    queryKey: ['droneStatus'],
    queryFn: fetchDroneStatus,
    staleTime: 30_000,
  });
}

export function useScanHistory() {
  return useQuery({
    queryKey: ['scanHistory'],
    queryFn: fetchScanHistory,
    staleTime: 60_000,
  });
}
