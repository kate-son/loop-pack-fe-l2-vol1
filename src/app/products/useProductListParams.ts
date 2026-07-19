'use client';

import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs';
import type { CategoryId, ProductSort } from '@/types/commerce';

const CATEGORY_VALUES: (CategoryId | 'all')[] = [
  'all',
  'casual',
  'fashion',
  'goods',
  'home',
  'digital',
];

const SORT_VALUES: ProductSort[] = ['latest', 'popular', 'price-asc', 'price-desc'];

const productListSearchParams = {
  q: parseAsString.withDefault(''),
  category: parseAsStringEnum(CATEGORY_VALUES).withDefault('all'),
  sort: parseAsStringEnum(SORT_VALUES).withDefault('latest'),
  page: parseAsInteger.withDefault(1),
};

/* AI-generated */
export function useProductListParams() {
  const [params, setParams] = useQueryStates(productListSearchParams, {
    history: 'push',
  });

  const setQuery = (q: string) => setParams({ q, page: 1 });
  const setCategory = (category: CategoryId | 'all') => setParams({ category, page: 1 });
  const setSort = (sort: ProductSort) => setParams({ sort, page: 1 });
  const setPage = (page: number) => setParams({ page });

  return { ...params, setQuery, setCategory, setSort, setPage };
}
