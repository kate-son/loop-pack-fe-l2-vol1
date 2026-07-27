import { parseAsInteger, parseAsString, parseAsStringEnum } from 'nuqs/server';
import { CATEGORY_IDS, type CategoryId } from '@/entities/category/model/category';
import { PRODUCT_SORTS, type ProductSort } from '@/entities/product/model/product';

/** 클라이언트 훅(useProductListParams)과 서버 로더(loadProductSearchParams)가 공유하는 parser 정의 */
export const productSearchParams = {
  q: parseAsString.withDefault(''),
  category: parseAsStringEnum<CategoryId | 'all'>([...CATEGORY_IDS, 'all']).withDefault('all'),
  page: parseAsInteger.withDefault(1),
  sort: parseAsStringEnum<ProductSort>([...PRODUCT_SORTS]).withDefault('latest'),
};
