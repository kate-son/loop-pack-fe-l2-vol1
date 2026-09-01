'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { SESSION_QUERY_KEY } from '@/entities/session/api/sessionQueryOptions';
import { ApiError } from '@/shared/api/response';
import type { LoginRequest, SessionResponse } from '@/entities/session/model/session';

const LOGIN_FAILED_MESSAGE = '로그인하지 못했습니다. 잠시 후 다시 시도해 주세요.';

/**
 * 로그인하고 원래 가려던 경로로 되돌린다.
 *
 * 이 mutation의 401은 자격 증명 불일치이지 세션 만료가 아니다. 그래서 `meta.authRequired`를
 * 붙이지 않는다 — providers의 전역 처리기는 그 표시가 있는 요청의 401만 만료로 다룬다.
 * 표시를 붙이면 비밀번호를 틀렸을 뿐인데 "세션이 만료되었습니다"가 뜬다.
 */
export function useLoginMutation(redirectPath: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (credentials: LoginRequest): Promise<SessionResponse> => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new ApiError(response.status, body?.message ?? LOGIN_FAILED_MESSAGE);
      }

      return (await response.json()) as SessionResponse;
    },
    onSuccess: ({ user }) => {
      queryClient.setQueryData(SESSION_QUERY_KEY, user);
      router.replace(redirectPath);
      // 보호 경로는 서버가 세션을 읽어 그리므로, 이동 후 서버 렌더를 다시 받아야 내용이 채워진다
      router.refresh();
    },
  });
}
