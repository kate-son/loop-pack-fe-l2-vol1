import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { ProductCard } from './ProductCard';
import { Header } from '@/widgets/header/ui/Header';
import { useWishlistStore } from '@/features/wishlist/model/useWishlistStore';
import { useCartStore } from '@/features/cart/model/useCartStore';
import type { Product } from '@/entities/product/model/product';

const PRODUCT: Product = {
  id: 'p1',
  brand: 'Loopers Select',
  name: '테스트 상품',
  category: 'casual',
  price: 10000,
  originalPrice: null,
  image: '/images/products/p1.jpg',
  freeShipping: true,
  sizes: [],
  rating: 4.5,
  reviewCount: 10,
  createdAt: '2026-01-01T00:00:00.000Z',
};

function renderHomeAndProductTogether() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <Header />
      <ProductCard product={PRODUCT} label="테스트 상품" />
    </QueryClientProvider>,
  );
}

describe('Header/ProductCard의 store 동기화 (홈·목록이 공유하는 store 검증)', () => {
  beforeEach(() => {
    useWishlistStore.setState({ productIds: new Set() });
    useCartStore.setState({ productIds: new Set() });
  });

  it('ProductCard에서 찜을 누르면 Header 위시리스트 개수도 같이 바뀐다', () => {
    renderHomeAndProductTogether();
    expect(screen.getByText('위시리스트 0')).toBeTruthy();

    fireEvent.click(screen.getByLabelText('테스트 상품 위시리스트'));

    expect(screen.getByText('위시리스트 1')).toBeTruthy();
  });

  it('ProductCard에서 담기를 누르면 Header 장바구니 개수도 같이 바뀐다', () => {
    renderHomeAndProductTogether();
    expect(screen.getByText('장바구니 0')).toBeTruthy();

    fireEvent.click(screen.getByLabelText('테스트 상품 담기'));

    expect(screen.getByText('장바구니 1')).toBeTruthy();
  });
});
