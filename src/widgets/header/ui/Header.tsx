'use client';

import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { useWishlistStore } from '@/features/wishlist/model/useWishlistStore';
import { useCartStore } from '@/features/cart/model/useCartStore';
import { useProductList } from '@/entities/product/api/useProductList';
import { DEFAULT_PRODUCT_LIST_QUERY } from '@/entities/product/model/product';

export function Header() {
  const wishlistCount = useWishlistStore((state) => state.productIds.size);
  const cartCount = useCartStore((state) => state.productIds.size);
  const queryClient = useQueryClient();

  return (
    <header className="week05-header">
      <Link href="/home">Commerce</Link>
      <nav aria-label="주요 메뉴">
        <Link
          href="/products"
          onMouseEnter={() =>
            queryClient.prefetchQuery(useProductList.queryOptions(DEFAULT_PRODUCT_LIST_QUERY))
          }
        >
          상품
        </Link>
        <span>위시리스트 {wishlistCount}</span>
        <span>장바구니 {cartCount}</span>
      </nav>
    </header>
  );
}
