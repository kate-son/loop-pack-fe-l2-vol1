import type { Product } from '../types';
import { Product as ProductCard } from '../component/Product';

type ProductGridProps = {
  /** 렌더링할 상품 목록 */
  products: Product[];
  /** 검색어 하이라이팅용 */
  searchQuery: string;
  /** 그리드/리스트 보기 모드 */
  viewMode: 'grid' | 'list';
};

export function ProductSection({ products, searchQuery, viewMode }: ProductGridProps) {
  return (
    <section
      className="product-grid"
      style={viewMode === 'list' ? { gridTemplateColumns: '1fr' } : undefined}
    >
      {products.length === 0 ? (
        <div className="empty">조건에 맞는 상품이 없습니다.</div>
      ) : (
        products.map((product) => (
          <ProductCard key={product.id} product={product} searchQuery={searchQuery} />
        ))
      )}
    </section>
  );
}
