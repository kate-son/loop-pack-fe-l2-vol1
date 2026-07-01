import { useState, useEffect } from 'react';
import './ProductListPage.css';
import type { FilterValues } from './types';
import { PAGE_SIZE } from './types';
import { FilterSection } from './section/FilterSection';
import { ProductSection } from './section/ProductSection';
import { PaginationSection } from './section/PaginationSection';
import { useWishList } from './hooks/useWishList';
import { useProductList, INITIAL_FILTER_VALUES } from './hooks/useProductList';

export function ProductListPage() {
  const { wishlist, toggleWishlist } = useWishList();
  const [filterValues, setFilterValues] = useState<FilterValues>(INITIAL_FILTER_VALUES);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);

  const { products, totalCount, isLoading, error } = useProductList(filterValues, page);

  const { category, minPrice, maxPrice, sortBy, searchQuery, inStockOnly } = filterValues;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (category !== 'all') params.set('category', category);
    if (searchQuery) params.set('q', searchQuery);
    if (page > 1) params.set('page', String(page));
    if (sortBy !== 'latest') params.set('sort', sortBy);
    if (minPrice !== '') params.set('minPrice', String(minPrice));
    if (maxPrice !== '') params.set('maxPrice', String(maxPrice));
    if (inStockOnly) params.set('inStock', 'true');
    window.history.replaceState(null, '', `?${params.toString()}`);
  }, [category, searchQuery, page, sortBy, minPrice, maxPrice, inStockOnly]);

  const handleFilterChange = (values: FilterValues) => {
    setFilterValues(values);
    setPage(1);
  };

  const handlePageChange = (next: number) => {
    setPage(next);
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
        onFilterChange={handleFilterChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      <ProductSection
        products={products}
        searchQuery={searchQuery}
        viewMode={viewMode}
        isLoading={isLoading}
        wishlist={wishlist}
        onWishlistToggle={toggleWishlist}
      />

      <PaginationSection page={page} totalPages={totalPages} onPageChange={handlePageChange} />
    </div>
  );
}
