'use client';

import { useQueryStates } from 'nuqs';
import type { CategoryId } from '@/entities/category/model/category';
import type { ProductSort } from '@/entities/product/model/product';
import { productSearchParams } from './productSearchParams';

export function useProductListParams() {
  const [param, setParam] = useQueryStates(productSearchParams, { history: 'push', scroll: true });

  // 디바운스로 계속 갱신되는 검색어는 매번 push하면 히스토리가 스팸처럼 쌓여서, replace로 덮어쓴다
  const setQuery = (q: string) => setParam({ q, page: 1 }, { history: 'replace' });
  const setCategory = (category: CategoryId | 'all') => setParam({ category, page: 1 });
  const setSort = (sort: ProductSort) => setParam({ sort, page: 1 });
  const setPage = (page: number) => setParam({ page });

  return { ...param, setQuery, setCategory, setSort, setPage };
}
