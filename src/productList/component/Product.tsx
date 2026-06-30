import type { Product as ProductType } from '../types';
import {
  HOT_DISCOUNT_RATE,
  BEST_MIN_RATING,
  BEST_MIN_REVIEW_COUNT,
  FREE_SHIPPING_THRESHOLD,
  ALMOST_SOLD_OUT_STOCK,
  NEW_PRODUCT_DAYS,
  MS_PER_DAY,
} from '../types';

type ProductProps = {
  /** 렌더링할 상품 */
  product: ProductType;
  /** 검색어 하이라이팅용 */
  searchQuery: string;
  /** 위시리스트 포함 여부 */
  isWished: boolean;
  /** 위시리스트 토글 시 호출 */
  onWishlistToggle: (id: number) => void;
  /** 상품 클릭 시 호출 */
  onClick: (id: number) => void;
};

export function Product({
  product,
  searchQuery,
  isWished,
  onWishlistToggle,
  onClick,
}: ProductProps) {
  const discountRate = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;
  const formattedPrice = product.price.toLocaleString() + '원';
  const formattedOriginal = product.originalPrice
    ? product.originalPrice.toLocaleString() + '원'
    : null;
  const isAlmostSoldOut = product.stock > 0 && product.stock <= ALMOST_SOLD_OUT_STOCK;
  const isSoldOut = product.stock === 0;
  const isHot = discountRate >= HOT_DISCOUNT_RATE;
  const isBest = product.rating >= BEST_MIN_RATING && product.reviewCount >= BEST_MIN_REVIEW_COUNT;
  const isFreeShipping = product.price >= FREE_SHIPPING_THRESHOLD;
  const daysSinceCreated = Math.floor(
    (new Date().getTime() - new Date(product.createdAt).getTime()) / MS_PER_DAY,
  );
  const isNew = daysSinceCreated <= NEW_PRODUCT_DAYS;

  const highlightMatch = (text: string) => {
    if (!searchQuery) return <>{text}</>;
    const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
    return (
      <>
        {parts.map((part, i) =>
          part.toLowerCase() === searchQuery.toLowerCase() ? (
            <mark key={i} style={{ background: '#fff176', padding: 0 }}>
              {part}
            </mark>
          ) : (
            part
          ),
        )}
      </>
    );
  };

  return (
    <article className="product-card" onClick={() => onClick(product.id)}>
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
        <h3 className="product-name">{highlightMatch(product.name)}</h3>
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
              onWishlistToggle(product.id);
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
