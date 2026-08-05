'use client';

import Link from 'next/link';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import '../../layout.css';
import { Header } from '@/widgets/header/ui/Header';
import { ProductListSection } from '@/widgets/product-list-section/ui/ProductListSection';
import { PageHeading } from '@/shared/ui/PageHeading/PageHeading';
import { QueryState } from '@/shared/ui/QueryState';
import { ErrorRetry } from '@/shared/ui/ErrorRetry/ErrorRetry';
import { homeQueryOptions } from '../_api/homeQueryOptions';
import type { Product } from '@/entities/product/model/product';
import { DEFAULT_PRODUCT_LIST_QUERY } from '@/entities/product/model/product';
import { popularProductsMapper } from '@/entities/product/model/popularProductsMapper';
import { newProductsMapper } from '@/entities/product/model/newProductsMapper';
import { categoriesMapper } from '@/entities/category/model/categoriesMapper';
import type { CategoryId } from '@/entities/category/model/category';
import { productsQueryOptions } from '@/entities/product/api/productsQueryOptions';

/* AI-generated : Week 7 Part 1 — PageHeading을 QueryState 밖으로 빼서 Header처럼 homeQuery pending 여부와 무관하게 즉시 렌더. 배너 데이터 도착 전엔 고정 fallback 문구를 보여주다가 도착하면 실제 title/description으로 교체 */
export function HomeView() {
  const homeQuery = useQuery(homeQueryOptions());
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
      <PageHeading
        title={homeQuery.data?.banner.title ?? '다양한 상품을 만나보세요'}
        description={homeQuery.data?.banner.description ?? '지금 준비된 상품을 확인해보세요.'}
      />
      <QueryState
        query={homeQuery}
        renderError={(error) => (
          <ErrorRetry message={error.message} onRetry={() => homeQuery.refetch()} />
        )}
      >
        {(data) => {
          // 배너는 PageHeading이 QueryState 밖에서 이미 소유하므로 여기서는 카테고리/인기·신상품만 각 entity의 mapper로 projection한다.
          const categories = categoriesMapper(data);
          const popularProducts = popularProductsMapper(data);
          const newProducts = newProductsMapper(data);

          return (
            <>
              <section className="week05-section">
                <h2>카테고리</h2>
                <div className="week05-categories">
                  {categories.map((category) => (
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
                  { title: '인기 상품', products: popularProducts },
                  { title: '신상품', products: newProducts },
                ] satisfies { title: string; products: Product[] }[]
              ).map(({ title, products }) => (
                <ProductListSection
                  key={title}
                  products={products}
                  emptyMessage="상품이 없습니다."
                  labelPrefix={title}
                >
                  <h2>{title}</h2>
                </ProductListSection>
              ))}
            </>
          );
        }}
      </QueryState>
    </main>
  );
}
