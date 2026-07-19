import { queryOptions } from '@tanstack/react-query';
import type { ApiErrorResponse, HomeResponse } from '@/types/commerce';
import { PRODUCT_PRICE_GC_TIME, PRODUCT_PRICE_STALE_TIME } from './constants';

async function fetchHome(): Promise<HomeResponse> {
  const res = await fetch('/api/home');

  if (!res.ok) {
    const body: ApiErrorResponse = await res.json();
    throw new Error(body.message);
  }

  return res.json();
}

export const homeQueryOptions = () =>
  queryOptions({
    queryKey: ['home'],
    queryFn: fetchHome,
    staleTime: PRODUCT_PRICE_STALE_TIME,
    gcTime: PRODUCT_PRICE_GC_TIME,
  });
