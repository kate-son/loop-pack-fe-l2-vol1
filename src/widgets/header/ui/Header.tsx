'use client';

import Link from 'next/link';
import { useWishlistStore } from '@/features/wishlist/model/useWishlistStore';
import { useCartStore } from '@/features/cart/model/useCartStore';

export function Header() {
  const wishlistCount = useWishlistStore((state) => state.productIds.size);
  const cartCount = useCartStore((state) => state.productIds.size);

  return (
    <header className="week05-header">
      <Link href="/home">Commerce</Link>
      <nav aria-label="주요 메뉴">
        <Link href="/products">상품</Link>
        <span>위시리스트 {wishlistCount}</span>
        <span>장바구니 {cartCount}</span>
      </nav>
    </header>
  );
}
