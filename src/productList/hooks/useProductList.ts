import { useState, useEffect } from 'react';
import type { FilterValues, ProductListResponse } from '../types';
import { PAGE_SIZE } from '../types';

export const INITIAL_FILTER_VALUES: FilterValues = {
  category: 'all',
  minPrice: '',
  maxPrice: '',
  sortBy: 'latest',
  searchQuery: '',
  inStockOnly: false,
};

export function useProductList(filter: FilterValues, page: number) {
  const [products, setProducts] = useState<ProductListResponse['products']>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const { category, minPrice, maxPrice, sortBy, searchQuery, inStockOnly } = filter;

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      setError(null);
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
      try {
        const res = await fetch(`/api/products?${params.toString()}`);
        if (!res.ok) throw new Error(`API 호출 실패 (status: ${res.status})`);
        const data: ProductListResponse = await res.json();
        setProducts(data.products);
        setTotalCount(data.totalCount);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [category, minPrice, maxPrice, sortBy, searchQuery, page, inStockOnly]);

  return { products, totalCount, isLoading, error };
}
