import { useQuery } from '@tanstack/react-query';
import { fetchReport } from '../lib/api';
import type { ReportPeriod } from '../lib/types';

export function useReport(period: ReportPeriod) {
  return useQuery({
    queryKey: ['report', period],
    queryFn: () => fetchReport(period),
    staleTime: 120_000,
  });
}
