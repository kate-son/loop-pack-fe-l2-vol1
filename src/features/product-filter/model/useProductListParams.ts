import { parseAsInteger, parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs';
import { CATEGORY_IDS, type CategoryId } from '@/entities/category/model/category';
import { PRODUCT_SORTS, type ProductSort } from '@/entities/product/model/product';

export function useProductListParams() {
  const [param, setParam] = useQueryStates(
    {
      q: parseAsString.withDefault(''),
      category: parseAsStringEnum<CategoryId | 'all'>([...CATEGORY_IDS, 'all']).withDefault('all'),
      page: parseAsInteger.withDefault(1),
      sort: parseAsStringEnum<ProductSort>([...PRODUCT_SORTS]).withDefault('latest'),
    },
    { history: 'push' },
  );

  const setQuery = (q: string) => setParam({ q, page: 1 });
  const setCategory = (category: CategoryId | 'all') => setParam({ category, page: 1 });
  const setSort = (sort: ProductSort) => setParam({ sort, page: 1 });
  const setPage = (page: number) => setParam({ page });

  return { ...param, setQuery, setCategory, setSort, setPage };
}
