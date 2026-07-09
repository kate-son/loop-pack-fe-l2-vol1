import type { Product as ProductType } from '../types';
import { useProduct } from '../hooks/useProduct';
import { highlightMatch } from '@/common/utils/utils.ts';
import { useProductListStore } from '../store/productListStore';
import { Badge } from '@/common/components/Badge';

type ProductProps = {
  /** 렌더링할 상품 */
  product: ProductType;
  /** 검색어 하이라이팅용 */
  searchQuery?: string;
};

export function Product({ product, searchQuery }: ProductProps) {
  const { toggleWishlist, addRecentlyViewed, wishlist } = useProductListStore();
  const isWished = wishlist.includes(product.id);
  const { formattedPrice, formattedOriginal, isFreeShipping, badges } = useProduct(product);

  return (
    <article className="product-card" onClick={() => addRecentlyViewed(product.id)}>
      <div className="image-wrap">
        <img src={product.imageUrl} alt={product.name} loading="lazy" />
        {badges.map((badge) => (
          <Badge key={badge.variant} label={badge.label} variant={badge.variant} />
        ))}
      </div>

      <div className="card-body">
        <h3 className="product-name">
          <>
            {highlightMatch(product.name, searchQuery || '').map((part: string, i: number) =>
              part.toLowerCase() === (searchQuery || '').toLowerCase() ? (
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
