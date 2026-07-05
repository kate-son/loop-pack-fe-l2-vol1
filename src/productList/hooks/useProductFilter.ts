import type { FilterValues, SortBy } from '@/productList/types.ts';
import { useState } from 'react';

const INITIAL_FILTER_VALUES: FilterValues = {
  category: 'all',
  minPrice: '',
  maxPrice: '',
  sortBy: 'latest',
  searchQuery: '',
  inStockOnly: false,
};

export function useProductFilter() {
  const parseFilterFromURL = (): { filter: FilterValues; page: number } => {
    const params = new URLSearchParams(window.location.search);
    return {
      filter: {
        category:
          (params.get('category') as FilterValues['category']) ?? INITIAL_FILTER_VALUES.category,
        searchQuery: params.get('q') ?? INITIAL_FILTER_VALUES.searchQuery,
        sortBy: (params.get('sort') as SortBy) ?? INITIAL_FILTER_VALUES.sortBy,
        minPrice: params.get('minPrice')
          ? Number(params.get('minPrice'))
          : INITIAL_FILTER_VALUES.minPrice,
        maxPrice: params.get('maxPrice')
          ? Number(params.get('maxPrice'))
          : INITIAL_FILTER_VALUES.maxPrice,
        inStockOnly: (params.get('inStock') || INITIAL_FILTER_VALUES.inStockOnly) === 'true',
      },
      page: params.get('page') ? Number(params.get('page')) : 1,
    };
  };

  const [filterValues, setFilterValues] = useState<FilterValues>(() => parseFilterFromURL().filter);

  const applyFilters = (values: FilterValues) => {
    setFilterValues(values);
  };

  const resetFilter = () => {
    setFilterValues(INITIAL_FILTER_VALUES);
  };

  return {
    filterValues,
    resetFilter,
    applyFilters,
    parseFilterFromURL,
  };
}
