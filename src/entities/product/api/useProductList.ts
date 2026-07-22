import { useEffect } from 'react';
import { keepPreviousData, queryOptions, useQuery, useQueryClient } from '@tanstack/react-query';
import type { ProductListQuery } from '../model/product';
import { fetchProductList } from './productsService';
import { PRODUCT_PRICE_GC_TIME, PRODUCT_PRICE_STALE_TIME } from '../model/constants';

const productsQueryOptions = (query: ProductListQuery) =>
  queryOptions({
    queryKey: ['products', query],
    queryFn: () => fetchProductList(query),
    staleTime: PRODUCT_PRICE_STALE_TIME,
    gcTime: PRODUCT_PRICE_GC_TIME,
    placeholderData: keepPreviousData,
  });

export function useProductList(query: ProductListQuery) {
  const result = useQuery(productsQueryOptions(query));
  const queryClient = useQueryClient();
  const { q, category, sort, page = 1 } = query;
  const isUnfiltered = !q && (category === undefined || category === 'all');

  useEffect(() => {
    if (!isUnfiltered || !result.data) return;

    const totalPages = Math.max(1, Math.ceil(result.data.totalCount / result.data.pageSize));
    const hasNextPage = page < totalPages;

    if (hasNextPage) {
      queryClient.prefetchQuery(useProductList.queryOptions({ q, category, sort, page: page + 1 }));
    }
  }, [isUnfiltered, result.data, page, q, category, sort, queryClient]);

  return result;
}

useProductList.queryOptions = productsQueryOptions;
