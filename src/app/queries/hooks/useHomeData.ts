import { queryOptions, useQuery } from '@tanstack/react-query';
import { fetchHome } from '../services/homeService';
import { PRODUCT_PRICE_GC_TIME, PRODUCT_PRICE_STALE_TIME } from '../constants';

export function useHomeData() {
  const homeQueryOptions = queryOptions({
    queryKey: ['home'],
    queryFn: fetchHome,
    staleTime: PRODUCT_PRICE_STALE_TIME,
    gcTime: PRODUCT_PRICE_GC_TIME,
  });
  return useQuery(homeQueryOptions);
}
