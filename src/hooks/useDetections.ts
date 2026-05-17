import { useQuery } from '@tanstack/react-query';
import { fetchDetections } from '../lib/api';
import type { DetectionType } from '../lib/types';

interface UseDetectionsParams {
  zone_id?: string;
  type?: DetectionType;
  status?: 'active' | 'resolved';
  limit?: number;
}

export function useDetections(params?: UseDetectionsParams) {
  return useQuery({
    queryKey: ['detections', params],
    queryFn: () => fetchDetections(params),
    staleTime: 30_000,
  });
}
