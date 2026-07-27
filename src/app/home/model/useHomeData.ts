import { queryOptions, useQuery } from '@tanstack/react-query';
import { fetchHome } from '../api/homeService';
import {
  PRODUCT_PRICE_GC_TIME,
  PRODUCT_PRICE_STALE_TIME,
} from '@/entities/product/model/constants';

const homeQueryOptions = () =>
  queryOptions({
    queryKey: ['home'],
    queryFn: fetchHome,
    staleTime: PRODUCT_PRICE_STALE_TIME,
    gcTime: PRODUCT_PRICE_GC_TIME,
  });

export function useHomeData() {
  return useQuery(homeQueryOptions());
}

useHomeData.queryOptions = homeQueryOptions;
