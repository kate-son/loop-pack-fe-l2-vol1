import '../layout.css';
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import type { Product } from '@/types/commerce';

const PRODUCT_A_PLACEHOLDER: Product = {
  id: 'p11',
  brand: '인스테드',
  name: '하이드레이팅 나이트 립 마스크 25g + 소프트 글로우 결 토너 210ml',
  category: 'goods',
  price: 48000,
  originalPrice: 58000,
  image: '/images/products/p11.jpg',
  freeShipping: false,
  sizes: [],
  rating: 4.9,
  reviewCount: 990,
  createdAt: '2026-07-07T09:00:00.000Z',
};

const PRODUCT_B_PLACEHOLDER: Product = {
  id: 'p16',
  brand: '스탠리',
  name: '스탠리 클래식 런치박스',
  category: 'home',
  price: 75000,
  originalPrice: 89000,
  image: '/images/products/p16.jpg',
  freeShipping: true,
  sizes: [],
  rating: 4.8,
  reviewCount: 418,
  createdAt: '2026-07-04T09:00:00.000Z',
};

export default function ProductListPage() {
  return (
    <main className="week05-page">
      <Header />
      <section className="week05-section">
        <h1>상품 목록</h1>
        <form className="week05-filters">
          <label>
            검색
            <input name="q" placeholder="상품명 또는 브랜드" />
          </label>
          <label>
            카테고리
            <select name="category" defaultValue="all">
              <option value="all">전체</option>
              <option value="casual">캐주얼</option>
              <option value="fashion">패션</option>
              <option value="goods">뷰티·잡화</option>
              <option value="home">홈</option>
              <option value="digital">디지털</option>
            </select>
          </label>
          <label>
            정렬
            <select name="sort" defaultValue="latest">
              <option value="latest">최신순</option>
            </select>
          </label>
        </form>
      </section>
      <section className="week05-section" aria-label="상품 검색 결과">
        <p>총 0개</p>
        <div className="week05-grid">
          {Array.from({ length: 8 }, (_, index) => (
            <ProductCard
              key={index}
              product={index % 2 === 0 ? PRODUCT_A_PLACEHOLDER : PRODUCT_B_PLACEHOLDER}
              label={`${index + 1}번 상품`}
            />
          ))}
        </div>
        <nav className="week05-pagination" aria-label="페이지 이동">
          <button type="button">이전</button>
          <span>1 / 1</span>
          <button type="button">다음</button>
        </nav>
      </section>
    </main>
  );
}
