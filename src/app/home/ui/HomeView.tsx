'use client';

import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import '../../layout.css';
import { Header } from '@/widgets/header/ui/Header';
import { ProductCard } from '@/entities/product/ui/ProductCard';
import { ToggleWishlistButton } from '@/features/toggle-wishlist/ui/ToggleWishlistButton';
import { AddToCartButton } from '@/features/add-to-cart/ui/AddToCartButton';
import { QueryState } from '@/shared/ui/QueryState';
import { ErrorRetry } from '@/shared/ui/ErrorRetry/ErrorRetry';
import { useHomeData } from '../model/useHomeData';
import type { Product } from '@/entities/product/model/product';
import { DEFAULT_PRODUCT_LIST_QUERY } from '@/entities/product/model/product';
import type { CategoryId } from '@/entities/category/model/category';
import { productsQueryOptions } from '@/entities/product/api/productsQueryOptions';

export function HomeView() {
  const homeQuery = useHomeData();
  const queryClient = useQueryClient();

  const prefetchProductList = (categoryId: CategoryId | 'all') => {
    queryClient.prefetchQuery(
      productsQueryOptions({
        ...DEFAULT_PRODUCT_LIST_QUERY,
        category: categoryId,
      }),
    );
  };

  return (
    <main className="week05-page">
      <Header />
      <QueryState
        query={homeQuery}
        renderLoading={() => <p>불러오는 중입니다…</p>}
        renderError={(error) => (
          <ErrorRetry message={error.message} onRetry={() => homeQuery.refetch()} />
        )}
      >
        {(data) => (
          <>
            <section className="week05-hero">
              <p>{data.banner.description}</p>
              <h1>{data.banner.title}</h1>
            </section>
            <section className="week05-section">
              <h2>카테고리</h2>
              <div className="week05-categories">
                {data.categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/products?category=${category.id}`}
                    onMouseEnter={() => prefetchProductList(category.id)}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </section>
            {(
              [
                { title: '인기 상품', products: data.popularProducts },
                { title: '신상품', products: data.newProducts },
              ] satisfies { title: string; products: Product[] }[]
            ).map(({ title, products }) => (
              <section className="week05-section" key={title}>
                <h2>{title}</h2>
                {products.length === 0 ? (
                  <p>상품이 없습니다.</p>
                ) : (
                  <div className="week05-grid">
                    {products.map((product, index) => {
                      const label = `${title} ${index + 1}번 상품`;
                      return (
                        <ProductCard key={product.id} product={product}>
                          <ToggleWishlistButton productId={product.id} label={label} />
                          <AddToCartButton productId={product.id} label={label} />
                        </ProductCard>
                      );
                    })}
                  </div>
                )}
              </section>
            ))}
          </>
        )}
      </QueryState>
    </main>
  );
}
