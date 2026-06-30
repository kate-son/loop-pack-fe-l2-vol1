import { useState, useEffect } from 'react';
import type { Product } from '../types';
import { MAX_RECENTLY_VIEWED } from '../types';
import { Product as ProductCard } from '../component/Product';

type ProductGridProps = {
  /** 렌더링할 상품 목록 */
  products: Product[];
  /** 검색어 하이라이팅용 */
  searchQuery: string;
  /** 그리드/리스트 보기 모드 */
  viewMode: 'grid' | 'list';
  /** 백그라운드 로딩 여부 */
  isLoading: boolean;
};

export function ProductSection({ products, searchQuery, viewMode, isLoading }: ProductGridProps) {
  const [wishlist, setWishlist] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem('wishlist');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [recentlyViewed, setRecentlyViewed] = useState<number[]>(() => {
    try {
      const stored = localStorage.getItem('recentlyViewed');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    } catch {
      // localStorage 사용 불가 시 무시
    }
  }, [wishlist]);

  useEffect(() => {
    try {
      localStorage.setItem('recentlyViewed', JSON.stringify(recentlyViewed));
    } catch {
      // localStorage 사용 불가 시 무시
    }
  }, [recentlyViewed]);

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

  return (
    <>
      <section
        className="product-grid"
        style={viewMode === 'list' ? { gridTemplateColumns: '1fr' } : undefined}
      >
        {products.length === 0 ? (
          <div className="empty">조건에 맞는 상품이 없습니다.</div>
        ) : (
          products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              searchQuery={searchQuery}
              isWished={wishlist.includes(product.id)}
              onWishlistToggle={handleWishlistToggle}
              onClick={handleProductClick}
            />
          ))
        )}
      </section>

      {isLoading && products.length > 0 && (
        <div className="background-loading">데이터 갱신 중...</div>
      )}
    </>
  );
}
