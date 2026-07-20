'use client';

import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { useWishlistStore } from './store/useWishlistStore';
import { useCartStore } from './store/useCartStore';

export function MainProvider({
  children,
}: {
  /** QueryClient·URL 상태 어댑터가 적용될 하위 트리 */
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  useEffect(() => {
    useWishlistStore.persist.rehydrate();
    useCartStore.persist.rehydrate();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>{children}</NuqsAdapter>
    </QueryClientProvider>
  );
}
