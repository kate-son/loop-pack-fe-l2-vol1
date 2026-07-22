import type { ProductListQuery, ProductListResponse } from '../model/product';
import { apiResponseResult } from '@/shared/api/response';

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

export async function fetchProductList(query: ProductListQuery): Promise<ProductListResponse> {
  const params = buildProductListParams(query);
  return apiResponseResult(`/api/products?${params.toString()}`);
}
