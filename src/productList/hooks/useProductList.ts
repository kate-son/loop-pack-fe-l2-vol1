import { useQuery } from '@tanstack/react-query';
import type { FilterValues } from '../types';
import { PAGE_SIZE } from '../types';
import { productService } from '../services/productService';

export function useProductList(filter: FilterValues, page: number) {
  const { category, minPrice, maxPrice, sortBy, searchQuery, inStockOnly } = filter;

  const params = new URLSearchParams({
    category,
    sort: sortBy,
    q: searchQuery,
    page: String(page),
    size: String(PAGE_SIZE),
  });
  if (minPrice !== '') params.set('minPrice', String(minPrice));
  if (maxPrice !== '') params.set('maxPrice', String(maxPrice));
  if (inStockOnly) params.set('inStock', 'true');

  const { data, isPending, isFetching, error } = useQuery({
    queryKey: ['productList', filter, page],
    queryFn: () => productService.getProductList(params),
  });

  return {
    products: data?.products ?? [],
    totalCount: data?.totalCount ?? 0,
    isLoading: isPending,
    isRefetching: isFetching && !isPending,
    error,
  };
}
