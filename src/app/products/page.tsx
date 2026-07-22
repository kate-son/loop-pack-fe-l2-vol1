'use client';

import '../layout.css';
import { Header } from '@/widgets/header/ui/Header';
import { ProductCard } from '@/widgets/product-card/ui/ProductCard';
import { ProductFilters } from '@/features/product-filter/ui/ProductFilters';
import { useProductListParams } from '@/features/product-filter/model/useProductListParams';
import { Pagination } from '@/shared/ui/Pagination/Pagination';
import { QueryState } from '@/shared/ui/QueryState';
import { ErrorRetry } from '@/shared/ui/ErrorRetry/ErrorRetry';
import { useProductList } from '@/entities/product/api/useProductList';

export default function ProductListPage() {
  const { q, category, sort, page, setQuery, setCategory, setSort, setPage } =
    useProductListParams();
  const productListQuery = useProductList({ q, category, sort, page });

  return (
    <main className="week05-page">
      <Header />
      <section className="week05-section">
        <h1>상품 목록</h1>
        <ProductFilters
          filters={{ q, category, sort }}
          onSearch={setQuery}
          onCategoryChange={setCategory}
          onSortChange={setSort}
        />
      </section>
      <QueryState
        query={productListQuery}
        renderLoading={() => <p>불러오는 중입니다…</p>}
        renderError={(error) => (
          <ErrorRetry message={error.message} onRetry={() => productListQuery.refetch()} />
        )}
      >
        {(data) => (
          <section className="week05-section" aria-label="상품 검색 결과">
            <p>총 {data.totalCount}개</p>
            {data.products.length === 0 ? (
              <p>검색 결과가 없습니다.</p>
            ) : (
              <div className="week05-grid">
                {data.products.map((product, index) => (
                  <ProductCard key={product.id} product={product} label={`${index + 1}번 상품`} />
                ))}
              </div>
            )}
            <Pagination
              page={data.page}
              pageSize={data.pageSize}
              totalCount={data.totalCount}
              onPageChange={setPage}
            />
          </section>
        )}
      </QueryState>
    </main>
  );
}
