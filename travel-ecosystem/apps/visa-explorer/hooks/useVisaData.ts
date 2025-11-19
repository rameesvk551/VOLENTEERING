// useVisaData.ts
import { useQuery } from '@tanstack/react-query';
import { fetchVisaMap, fetchVisaRule } from '../lib/api';

export function useVisaMap(from: string) {
  return useQuery(['visaMap', from], () => fetchVisaMap(from), {
    staleTime: 1000 * 60 * 60,
    retry: 2,
  });
}

export function useVisaRule(from: string, to: string) {
  return useQuery(['visaRule', from, to], () => fetchVisaRule(from, to), {
    staleTime: 1000 * 60 * 60,
    retry: 2,
  });
}
