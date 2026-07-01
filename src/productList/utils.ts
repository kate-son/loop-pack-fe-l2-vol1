import type { FilterValues } from './types';

export const buildSearchParams = (filter: FilterValues, page: number): URLSearchParams => {
  const params = new URLSearchParams();
  if (filter.category !== 'all') params.set('category', filter.category);
  if (filter.searchQuery) params.set('q', filter.searchQuery);
  if (page > 1) params.set('page', String(page));
  if (filter.sortBy !== 'latest') params.set('sort', filter.sortBy);
  if (filter.minPrice !== '') params.set('minPrice', String(filter.minPrice));
  if (filter.maxPrice !== '') params.set('maxPrice', String(filter.maxPrice));
  if (filter.inStockOnly) params.set('inStock', 'true');
  return params;
};
