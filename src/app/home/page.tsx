import Link from 'next/link';
import '../layout.css';
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import type { Product } from '@/types/commerce';

const POPULAR_PRODUCT_PLACEHOLDER: Product = {
  id: 'p1',
  brand: 'Loopers Select',
  name: '[11월 20일 예약배송] Winter Rocky Pants 2color 윈터 로키팬츠 OG',
  category: 'casual',
  price: 79000,
  originalPrice: null,
  image: '/images/products/p1.jpg',
  freeShipping: true,
  sizes: [],
  rating: 4.8,
  reviewCount: 312,
  createdAt: '2026-07-09T09:00:00.000Z',
};

const NEW_PRODUCT_PLACEHOLDER: Product = {
  id: 'p6',
  brand: 'Loopers Select',
  name: 'WOMAN GNRL 케이블 풀오버 [IVORY] / WBC3L05502',
  category: 'fashion',
  price: 69000,
  originalPrice: null,
  image: '/images/products/p6.jpg',
  freeShipping: true,
  sizes: [],
  rating: 4.7,
  reviewCount: 520,
  createdAt: '2026-07-10T09:00:00.000Z',
};

const PRODUCT_SECTIONS = [
  { title: '인기 상품', product: POPULAR_PRODUCT_PLACEHOLDER },
  { title: '신상품', product: NEW_PRODUCT_PLACEHOLDER },
];

export default function Home() {
  return (
    <main className="week05-page">
      <Header />
      <section className="week05-hero">
        <p>배너 설명</p>
        <h1>홈 배너 제목</h1>
      </section>
      <section className="week05-section">
        <h2>카테고리</h2>
        <div className="week05-categories">
          {['캐주얼', '패션', '뷰티·잡화', '홈', '디지털'].map((category) => (
            <Link key={category} href="/products">
              {category}
            </Link>
          ))}
        </div>
      </section>
      {PRODUCT_SECTIONS.map(({ title, product }) => (
        <section className="week05-section" key={title}>
          <h2>{title}</h2>
          <div className="week05-grid">
            {Array.from({ length: 4 }, (_, index) => (
              <ProductCard
                key={`${title}-${index}`}
                product={product}
                label={`${title} ${index + 1}번 상품`}
              />
            ))}
          </div>
        </section>
      ))}
    </main>
  );
}
