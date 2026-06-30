import { useState, useEffect } from 'react';
import './ProductListPage.css';
import type { Product, ProductListResponse, SortBy } from './types';
import { PAGE_SIZE, MAX_RECENTLY_VIEWED } from './types';
import { FilterSection } from './FilterSection';
import { ProductGrid } from './ProductGrid';
import { Pagination } from './Pagination';

export function ProductListPage() {
  // ─── 서버 상태 (직접 관리) ──────────────────────────────
  const [products, setProducts] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // ─── 필터 상태 ──────────────────────────────────────────
  const [category, setCategory] = useState<'all' | Product['category']>('all');
  const [minPrice, setMinPrice] = useState<number | ''>('');
  const [maxPrice, setMaxPrice] = useState<number | ''>('');
  const [sortBy, setSortBy] = useState<SortBy>('latest');

  // ─── 검색 상태 ──────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState('');

  // ─── 페이지네이션 상태 ──────────────────────────────────
  const [page, setPage] = useState(1);

  // ─── 옵션 토글 ──────────────────────────────────────────
  const [inStockOnly, setInStockOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // ─── 위시리스트 (localStorage 동기화) ───────────────────
  const [wishlist, setWishlist] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem('wishlist');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // ─── 최근 본 상품 (localStorage 동기화) ─────────────────
  const [recentlyViewed, setRecentlyViewed] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem('recentlyViewed');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

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
      try {
        const res = await fetch(`/api/products?${params.toString()}`);
        if (!res.ok) throw new Error(`API 호출 실패 (status: ${res.status})`);
        const data: ProductListResponse = await res.json();
        // 클라이언트에서 추가 필터링 — "재고 있는 것만" 토글
        const filtered = inStockOnly ? data.products.filter((p) => p.stock > 0) : data.products;
        setProducts(filtered);
        setTotalCount(data.totalCount);
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [category, minPrice, maxPrice, sortBy, searchQuery, page, inStockOnly]);

  // ─── 위시리스트가 바뀔 때마다 localStorage 동기화 ───────
  useEffect(() => {
    try {
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    } catch {
      // localStorage 사용 불가 시 무시
    }
  }, [wishlist]);

  // ─── 최근 본 상품도 localStorage 동기화 ─────────────────
  useEffect(() => {
    try {
      localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
    } catch {
      // localStorage 사용 불가 시 무시
    }
  }, [recentlyViewed]);

  // ─── 페이지가 바뀔 때 스크롤 맨 위로 ────────────────────
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [page]);

  // ─── 필터·검색·페이지 상태가 바뀔 때마다 URL 쿼리 동기화 ──
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

  const handleCategoryChange = (cat: 'all' | Product['category']) => {
    setCategory(cat);
    setPage(1);
  };

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setMinPrice(v === '' ? '' : Number(v));
    setPage(1);
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setMaxPrice(v === '' ? '' : Number(v));
    setPage(1);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as SortBy);
    setPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handleInStockToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInStockOnly(e.target.checked);
    setPage(1);
  };

  const handlePageChange = (next: number) => {
    setPage(next);
  };

  const handleResetFilters = () => {
    setCategory('all');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('latest');
    setSearchQuery('');
    setInStockOnly(false);
    setPage(1);
  };

  const handleWishlistToggle = (productId: number) => {
    setWishlist((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    );
  };

  const handleProductClick = (productId: number) => {
    setRecentlyViewed((prev) => {
      const without = prev.filter((id) => id !== productId);
      return [productId, ...without].slice(0, MAX_RECENTLY_VIEWED);
    });
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
        values={{ category, minPrice, maxPrice, sortBy, searchQuery, inStockOnly, viewMode }}
        handlers={{
          onCategoryChange: handleCategoryChange,
          onMinPriceChange: handleMinPriceChange,
          onMaxPriceChange: handleMaxPriceChange,
          onSortChange: handleSortChange,
          onSearchChange: handleSearchChange,
          onInStockToggle: handleInStockToggle,
          onResetFilters: handleResetFilters,
          onViewModeChange: (mode) => setViewMode(mode),
        }}
      />

      <ProductGrid
        products={products}
        searchQuery={searchQuery}
        wishlist={wishlist}
        viewMode={viewMode}
        isLoading={isLoading}
        onWishlistToggle={handleWishlistToggle}
        onProductClick={handleProductClick}
      />

      <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
    </div>
  );
}
