import type { FilterValues } from '@/productList/types.ts';
import { useState } from 'react';

export function useProductFilter() {
  const INITIAL_FILTER_VALUES: FilterValues = {
    category: 'all',
    minPrice: '',
    maxPrice: '',
    sortBy: 'latest',
    searchQuery: '',
    inStockOnly: false,
  };
  const [filterValues, setFilterValues] = useState<FilterValues>(INITIAL_FILTER_VALUES);

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
  };
}
