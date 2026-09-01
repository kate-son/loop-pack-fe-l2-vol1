'use client';

import { Suspense, useEffect, useState } from 'react';
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { useRouter } from 'next/navigation';
import { useWishlistStore } from '@/entities/wishlist/model/useWishlistStore';
import { useCartStore } from '@/entities/cart/model/useCartStore';
import { SESSION_QUERY_KEY } from '@/entities/session/api/sessionQueryOptions';
import { isUnauthorizedError } from '@/shared/api/response';
import { buildLoginPath } from '@/shared/lib/safeRedirectPath';

/**
 * 세션 만료를 처리하는 단 한 곳.
 *
 * 화면마다 401을 다루면 나중에 어디를 고쳐야 할지 알 수 없어진다. 모든 클라이언트 조회가
 * `apiResponseResult`를 지나고 그 함수가 상태 코드를 담은 ApiError를 던지므로, 캐시 단위의
 * onError 두 개로 전부 받을 수 있다.
 *
 * 만료로 볼 요청 범위는 좁힌다 —
 * - 조회(QueryCache): 보호 경로 데이터. 세션 조회는 401을 null로 바꿔 돌려주므로 여기로 오지 않는다
 * - 변경(MutationCache): `meta.authRequired`를 붙인 것만. 로그인 요청의 401은 자격 불일치라 제외한다
 *
 * 만료인지 미로그인인지는 직전 캐시 값으로 가른다. 로그인 상태였는데 401이 왔다면 그 세션이
 * 더는 유효하지 않은 것이고, 처음부터 null이었다면 그냥 로그인하지 않은 상태다.
 */
export function MainProvider({
  children,
}: {
  /** QueryClient·URL 상태 어댑터가 적용될 하위 트리 */
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [queryClient] = useState(() => createQueryClient(router));

  useEffect(() => {
    useWishlistStore.persist.rehydrate();
    useCartStore.persist.rehydrate();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {/* NuqsAdapter가 내부적으로 useSearchParams()를 호출해 정적 프리렌더 시 Suspense 경계가 필요하다 */}
      <Suspense fallback={<div>불러오는 중입니다…</div>}>
        <NuqsAdapter>{children}</NuqsAdapter>
      </Suspense>
    </QueryClientProvider>
  );
}

type AppRouter = ReturnType<typeof useRouter>;

/**
 * 401 처리기를 붙인 QueryClient를 만든다.
 *
 * 콜백이 자기가 속한 client를 참조해야 해서 지역 변수에 담아 넘긴다. 콜백은 요청이 실패한
 * 뒤에만 도므로 그 시점엔 할당이 끝나 있다. router는 App Router에서 렌더 사이에 바뀌지 않고,
 * `replace`는 부르는 시점의 주소를 기준으로 동작한다.
 */
export function createQueryClient(router: AppRouter): QueryClient {
  const handleUnauthorized = () => {
    const hadSession = client.getQueryData(SESSION_QUERY_KEY) != null;
    client.setQueryData(SESSION_QUERY_KEY, null);

    // 훅 대신 location을 읽는다 — 이 콜백은 사용자 조작 뒤에만 도는 클라이언트 코드라
    // useSearchParams를 쓰면 정적 프리렌더에 Suspense 경계만 더 요구하게 된다
    const currentPath = `${window.location.pathname}${window.location.search}`;
    router.replace(buildLoginPath(currentPath, hadSession));
  };

  const client = new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (isUnauthorizedError(error) && query.meta?.authRequired === true) {
          handleUnauthorized();
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        if (isUnauthorizedError(error) && mutation.meta?.authRequired === true) {
          handleUnauthorized();
        }
      },
    }),
  });

  return client;
}
