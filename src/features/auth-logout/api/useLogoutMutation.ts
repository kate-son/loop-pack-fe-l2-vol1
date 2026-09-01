'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { SESSION_QUERY_KEY } from '@/entities/session/api/sessionQueryOptions';
import { useCartStore } from '@/entities/cart/model/useCartStore';
import { useWishlistStore } from '@/entities/wishlist/model/useWishlistStore';
import { DEFAULT_REDIRECT_PATH } from '@/shared/lib/safeRedirectPath';

/**
 * 로그아웃하고 클라이언트에 남은 사용자 흔적을 정리한다.
 *
 * 장바구니와 위시리스트를 함께 비운다. 둘 다 sessionStorage에 담기므로 탭을 닫으면
 * 사라지지만, 로그아웃은 탭을 닫는 행동이 아니다. 정리하지 않으면 같은 탭을 이어 쓰는
 * 다음 사람에게 이전 사용자가 담은 목록이 그대로 보인다.
 *
 * 대가는 잠깐 로그아웃했다 돌아온 사용자도 목록을 잃는다는 것이다. 세션과 무관한
 * 브라우저 로컬 상태로 볼 수도 있지만, 노출 쪽을 더 무겁게 봤다.
 */
export function useLogoutMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      await fetch('/api/auth/logout', { method: 'POST' });
    },
    onSuccess: () => {
      clearUserScopedState();
      queryClient.setQueryData(SESSION_QUERY_KEY, null);
      router.replace(DEFAULT_REDIRECT_PATH);
      // 보호 경로에 서버가 그려둔 화면이 남아 있을 수 있어 서버 렌더를 다시 받는다
      router.refresh();
    },
  });
}

/** 로그인한 사람에게 매인 클라이언트 상태를 초기 상태로 되돌린다 */
function clearUserScopedState(): void {
  useCartStore.setState({ productIds: new Set<string>() });
  useCartStore.persist.clearStorage();
  useWishlistStore.setState({ productIds: new Set<string>() });
  useWishlistStore.persist.clearStorage();
}
