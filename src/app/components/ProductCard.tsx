import Image from 'next/image';
import type { Product } from '@/types/commerce';

type ProductCardProps = {
  /** 카드에 표시할 상품 데이터 */
  product: Product;
  /** 위시리스트/장바구니 버튼 aria-label 조합 기준 문자열 (예: "인기 상품 1번 상품") */
  label: string;
};

export function ProductCard({ product, label }: ProductCardProps) {
  return (
    <article className="week05-product">
      <Image
        className="week05-image"
        src={product.image}
        alt={product.name}
        width={400}
        height={400}
      />
      <p>{product.brand}</p>
      <h3>{product.name}</h3>
      <strong>{product.price.toLocaleString()}원</strong>
      <div>
        <button type="button" aria-label={`${label} 위시리스트`} aria-pressed={false}>
          찜
        </button>
        <button type="button" aria-label={`${label} 담기`} aria-pressed={false}>
          담기
        </button>
      </div>
    </article>
  );
}
