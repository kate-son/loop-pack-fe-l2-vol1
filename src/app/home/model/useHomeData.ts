import { useQuery } from '@tanstack/react-query';
import { homeQueryOptions } from './homeQueryOptions';

export function useHomeData() {
  return useQuery(homeQueryOptions());
}
