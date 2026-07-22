import { queryOptions, useQuery } from '@tanstack/react-query';
import type { ProductListQuery } from '../model/product';
import { fetchProductList } from './productsService';
import { PRODUCT_PRICE_GC_TIME, PRODUCT_PRICE_STALE_TIME } from '../model/constants';

const productsQueryOptions = (query: ProductListQuery) =>
  queryOptions({
    queryKey: ['products', query],
    queryFn: () => fetchProductList(query),
    staleTime: PRODUCT_PRICE_STALE_TIME,
    gcTime: PRODUCT_PRICE_GC_TIME,
  });

/* AI-generated */
export function useProductList(query: ProductListQuery) {
  return useQuery(productsQueryOptions(query));
}
