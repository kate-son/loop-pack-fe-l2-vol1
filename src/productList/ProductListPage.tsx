import { useState, useEffect } from 'react';
import './ProductListPage.css';
import type { FilterValues } from './types';
import { PAGE_SIZE } from './types';
import { FilterSection } from './section/FilterSection';
import { ProductSection } from './section/ProductSection';
import { PaginationSection } from './section/PaginationSection';
import { useProductList } from './hooks/useProductList';
import { useProductListStore } from './store/productListStore';
import { useProductFilter } from '@/productList/hooks/useProductFilter.ts';

const buildSearchParams = (filter: FilterValues, page: number): URLSearchParams => {
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

export function ProductListPage() {
  const { wishlist } = useProductListStore();
  const { filterValues, applyFilters, resetFilter } = useProductFilter();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);

  const { products, totalCount, isLoading, isRefetching, error } = useProductList(
    filterValues,
    page,
  );

  const { searchQuery } = filterValues;

  useEffect(() => {
    window.history.replaceState(null, '', `?${buildSearchParams(filterValues, page)}`);
  }, [filterValues, page]);

  const handlePageChange = (next: number) => {
    setPage(next);
  };

  const handleFilterChange = (values: FilterValues) => {
    applyFilters(values);
    setPage(1);
  };

  const handleResetFilter = () => {
    resetFilter();
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  if (isLoading && products.length === 0) {
    return <div className="loading">로딩 중...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>오류가 발생했습니다: {error.message}</p>
        <button onClick={() => window.location.reload()}>다시 시도</button>
      </div>
    );
  }

  return (
    <div className="product-list-page">
      <header className="page-header">
        <h1>상품 목록</h1>
        <p className="total-count">
          총 {totalCount.toLocaleString()}개의 상품
          {wishlist.length > 0 && <span> · 위시리스트 {wishlist.length}개</span>}
        </p>
      </header>

      <FilterSection
        filter={filterValues}
        onResetFilter={handleResetFilter}
        onFilterChange={handleFilterChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <ProductSection products={products} searchQuery={searchQuery} viewMode={viewMode} />

      <PaginationSection page={page} totalPages={totalPages} onPageChange={handlePageChange} />

      {isRefetching && <div className="background-loading">데이터 갱신 중...</div>}
    </div>
  );
}
