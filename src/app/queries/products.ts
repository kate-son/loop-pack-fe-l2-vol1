import { queryOptions } from '@tanstack/react-query';
import type { ApiErrorResponse, ProductListQuery, ProductListResponse } from '@/types/commerce';
import { PRODUCT_PRICE_GC_TIME, PRODUCT_PRICE_STALE_TIME } from './constants';

const DEFAULT_PAGE_SIZE = 12;

function buildProductListParams(query: ProductListQuery): URLSearchParams {
  const params = new URLSearchParams();

  if (query.q) params.set('q', query.q);
  if (query.category && query.category !== 'all') params.set('category', query.category);
  params.set('sort', query.sort ?? 'latest');
  params.set('page', String(query.page ?? 1));
  params.set('pageSize', String(query.pageSize ?? DEFAULT_PAGE_SIZE));

  return params;
}

async function fetchProductList(query: ProductListQuery): Promise<ProductListResponse> {
  const params = buildProductListParams(query);
  const res = await fetch(`/api/products?${params.toString()}`);

  if (!res.ok) {
    const body: ApiErrorResponse = await res.json();
    throw new Error(body.message);
  }

  return res.json();
}

export const productsQueryOptions = (query: ProductListQuery) =>
  queryOptions({
    queryKey: ['products', query],
    queryFn: () => fetchProductList(query),
    staleTime: PRODUCT_PRICE_STALE_TIME,
    gcTime: PRODUCT_PRICE_GC_TIME,
  });
