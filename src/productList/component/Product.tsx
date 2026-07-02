import type { Product as ProductType } from '../types';
import { useProduct } from '../hooks/useProduct';
import { highlightMatch } from '@/common/utils/utils.ts';
import { useProductListStore } from '../store/productListStore';

type ProductProps = {
  /** 렌더링할 상품 */
  product: ProductType;
  /** 검색어 하이라이팅용 */
  searchQuery: string;
};

export function Product({ product, searchQuery }: ProductProps) {
  const { toggleWishlist, addRecentlyViewed, wishlist } = useProductListStore();
  const isWished = wishlist.includes(product.id);
  const {
    discountRate,
    formattedPrice,
    formattedOriginal,
    isSoldOut,
    isAlmostSoldOut,
    isHot,
    isBest,
    isFreeShipping,
    isNew,
  } = useProduct(product);

  return (
    <article className="product-card" onClick={() => addRecentlyViewed(product.id)}>
      <div className="image-wrap">
        <img src={product.imageUrl} alt={product.name} loading="lazy" />
        {discountRate > 0 && <span className="badge badge-discount">{discountRate}% 할인</span>}
        {isNew && <span className="badge badge-new">NEW</span>}
        {isHot && <span className="badge badge-hot">특가</span>}
        {isBest && <span className="badge badge-best">BEST</span>}
        {isSoldOut && <span className="badge badge-soldout">품절</span>}
        {!isSoldOut && isAlmostSoldOut && <span className="badge badge-warning">품절 임박</span>}
      </div>

      <div className="card-body">
        <h3 className="product-name">
          <>
            {highlightMatch(product.name, searchQuery).map((part: string, i: number) =>
              part.toLowerCase() === searchQuery.toLowerCase() ? (
                <mark key={i} style={{ background: '#fff176', padding: 0 }}>
                  {part}
                </mark>
              ) : (
                part
              ),
            )}
          </>
        </h3>
        <div className="price-area">
          {formattedOriginal && <span className="original-price">{formattedOriginal}</span>}
          <span className="price">{formattedPrice}</span>
          {isFreeShipping && (
            <span style={{ marginLeft: 6, fontSize: 11, color: '#2e7d32', fontWeight: 600 }}>
              무료배송
            </span>
          )}
        </div>
        <div className="rating-area">
          <span className="rating">★ {product.rating.toFixed(1)}</span>
          <span className="review-count">({product.reviewCount.toLocaleString()})</span>
          <button
            style={{
              marginLeft: 'auto',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 16,
            }}
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product.id);
            }}
            aria-label="위시리스트 토글"
          >
            {isWished ? '♥' : '♡'}
          </button>
        </div>
      </div>
    </article>
  );
}
