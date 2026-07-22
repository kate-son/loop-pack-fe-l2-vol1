import { keepPreviousData, queryOptions } from '@tanstack/react-query';
import type { ProductListQuery } from '../model/product';
import { fetchProductList } from './productsService';
import { PRODUCT_PRICE_GC_TIME, PRODUCT_PRICE_STALE_TIME } from '../model/constants';

/** 훅을 전혀 쓰지 않는 순수 설정 함수 — Server Component에서도 안전하게 import 가능 */
export const productsQueryOptions = (query: ProductListQuery) =>
  queryOptions({
    queryKey: ['products', query],
    queryFn: () => fetchProductList(query),
    staleTime: PRODUCT_PRICE_STALE_TIME,
    gcTime: PRODUCT_PRICE_GC_TIME,
    placeholderData: keepPreviousData,
  });
