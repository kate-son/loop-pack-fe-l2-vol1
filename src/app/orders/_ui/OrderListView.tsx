'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Header } from '@/widgets/header/ui/Header';
import { PageHeading } from '@/shared/ui/PageHeading/PageHeading';
import { QueryState } from '@/shared/ui/QueryState';
import { ErrorRetry } from '@/shared/ui/ErrorRetry/ErrorRetry';
import { ordersQueryOptions } from '@/entities/order/api/ordersQueryOptions';

/** 주문 하나에 담긴 수량을 합쳐 요약 한 줄을 만든다 */
function summarizeItems(items: { productId: string; quantity: number }[]): string {
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  return `상품 ${items.length}종 · 수량 ${totalQuantity}개`;
}

export function OrderListView() {
  const ordersQuery = useQuery(ordersQueryOptions());

  return (
    <div className="week05-page">
      <Header />
      <main>
        <PageHeading title="주문 내역" description="지금까지 주문한 내역입니다." compact />
        <section className="week05-section" aria-label="주문 내역">
          <QueryState
            query={ordersQuery}
            renderError={(error) => (
              <ErrorRetry message={error.message} onRetry={() => ordersQuery.refetch()} />
            )}
          >
            {({ orders }) =>
              orders.length === 0 ? (
                <p>
                  아직 주문한 내역이 없습니다. <Link href="/products">상품을 둘러보세요.</Link>
                </p>
              ) : (
                <ul>
                  {orders.map((order) => (
                    <li key={order.id}>
                      <span>{order.id}</span>
                      <span>{summarizeItems(order.items)}</span>
                      <time dateTime={order.createdAt}>{order.createdAt}</time>
                    </li>
                  ))}
                </ul>
              )
            }
          </QueryState>
        </section>
      </main>
    </div>
  );
}
