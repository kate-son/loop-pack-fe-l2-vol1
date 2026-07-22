'use client';

import Link from 'next/link';
import '../layout.css';
import { Header } from '@/widgets/header/ui/Header';
import { ProductCard } from '@/widgets/product-card/ui/ProductCard';
import { QueryState } from '@/shared/ui/QueryState';
import { useHomeData } from './model/useHomeData';
import type { Product } from '@/entities/product/model/product';

export default function Home() {
  const homeQuery = useHomeData();

  return (
    <main className="week05-page">
      <Header />
      <QueryState
        query={homeQuery}
        renderLoading={() => <p>불러오는 중입니다…</p>}
        renderError={(error) => <p role="alert">{error.message}</p>}
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
                  <Link key={category.id} href={`/products?category=${category.id}`}>
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
                    {products.map((product, index) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        label={`${title} ${index + 1}번 상품`}
                      />
                    ))}
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
