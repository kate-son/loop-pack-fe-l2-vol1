import { queryOptions } from '@tanstack/react-query';
import { fetchHome } from '../api/homeService';
import {
  PRODUCT_PRICE_GC_TIME,
  PRODUCT_PRICE_STALE_TIME,
} from '@/entities/product/model/constants';

/** 훅을 전혀 쓰지 않는 순수 설정 함수 — Server Component에서도 안전하게 import 가능 */
export const homeQueryOptions = () =>
  queryOptions({
    queryKey: ['home'],
    queryFn: fetchHome,
    staleTime: PRODUCT_PRICE_STALE_TIME,
    gcTime: PRODUCT_PRICE_GC_TIME,
  });
