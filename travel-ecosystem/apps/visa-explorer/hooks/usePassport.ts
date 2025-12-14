// usePassport.ts
import { useQuery } from '@tanstack/react-query';
import { fetchPassports } from '../lib/api';

export function usePassports() {
  return useQuery(['passports'], fetchPassports, {
    staleTime: 1000 * 60 * 60 * 24,
    retry: 2,
  });
}
