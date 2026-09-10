import { createLoader } from 'nuqs/server';
import { productSearchParams } from './productSearchParams';

/** Server Component의 searchParams(Promise)를 클라이언트 훅과 동일한 규칙으로 파싱한다 */
export const loadProductSearchParams = createLoader(productSearchParams);
