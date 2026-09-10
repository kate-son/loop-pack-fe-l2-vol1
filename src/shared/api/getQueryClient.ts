import { QueryClient } from '@tanstack/react-query';
import { cache } from 'react';

/** Server Component에서 요청마다 새 QueryClient를 만들되, 같은 요청 안에서는 하나만 재사용한다 */
export const getQueryClient = cache(() => new QueryClient());
