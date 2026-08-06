import type { Metadata } from 'next';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import ProductView from '@/app/products/_ui/ProductView';
import { getQueryClient } from '@/shared/api/getQueryClient';
import { productsQueryOptions } from '@/entities/product/api/productsQueryOptions';
import type { ProductListQuery, ProductListResponse } from '@/entities/product/model/product';
import type { SearchParams } from 'nuqs';
import { loadProductSearchParams } from '@/features/product-filter/model/loadProductSearchParams';
import { COMMON_OPEN_GRAPH, OG_FALLBACK_IMAGE } from '@/app/layout';

type PageProps = {
  searchParams: Promise<SearchParams>;
};

const BASE_TITLE = '상품 목록';
const FIRST_PAGE = 1;

const SORT_LABELS: Record<string, string> = {
  latest: '최신순',
  popular: '인기순',
  'price-asc': '가격 낮은순',
  'price-desc': '가격 높은순',
};

/** 응답의 categories에서 이름을 찾는다 — 라벨을 페이지에 하드코딩하지 않기 위해 */
function findCategoryName(data: ProductListResponse, categoryId: string): string | null {
  if (categoryId === 'all') return null;
  return data.categories.find((category) => category.id === categoryId)?.name ?? null;
}

/** 검색어를 먼저 반영하고, 2페이지 이상이면 페이지 번호를 덧붙인다 */
function buildTitle(query: ProductListQuery): string {
  const base = query.q ? `'${query.q}' 검색 결과` : BASE_TITLE;
  const page = query.page ?? FIRST_PAGE;
  return page > FIRST_PAGE ? `${base} (${page}페이지)` : base;
}

/** category·sort 조건과 결과 개수를 설명한다. 0건이면 그 사실을 분명히 밝힌다 */
function buildDescription(query: ProductListQuery, data: ProductListResponse): string {
  const conditions = [
    findCategoryName(data, query.category ?? 'all'),
    SORT_LABELS[query.sort ?? 'latest'],
  ].filter(Boolean);
  const prefix = conditions.length > 0 ? `${conditions.join(', ')} · ` : '';

  return data.totalCount === 0
    ? `${prefix}조건에 맞는 상품이 0개입니다. 다른 조건으로 찾아보세요.`
    : `${prefix}전체 ${data.totalCount}개의 상품을 만나보세요.`;
}

/* AI-generated : Week 7 Part 3 — 본문과 "같은 URL 정규화(loadProductSearchParams) + 같은 query factory
   (productsQueryOptions)"로 조회해 같은 GET URL·options가 되게 한다. 그래야 같은 render/request 안에서
   fetch memoization이 걸려 Route Handler 호출이 1회로 유지된다.
   검색어는 title에 먼저, category·sort는 description에, 2페이지 이상은 title에 페이지 번호를 반영한다.
   0건이어도 OG fallback image는 유지하고, 조회 실패 시에는 페이지별 빈 값을 만들지 않고 빈 객체를 반환해
   루트 공통 metadata를 상속시킨다 — 이 둘이 서로 다른 fallback이다 */
export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  try {
    const query = await loadProductSearchParams(searchParams);
    const queryClient = getQueryClient();
    const data = await queryClient.fetchQuery(productsQueryOptions(query));

    const title = buildTitle(query);
    const description = buildDescription(query, data);
    const firstProductImage = data.products[0]?.image;

    return {
      title,
      description,
      openGraph: {
        ...COMMON_OPEN_GRAPH,
        title,
        description,
        images: [firstProductImage || OG_FALLBACK_IMAGE.url],
      },
    };
  } catch {
    return {};
  }
}

export default async function ProductListPage({ searchParams }: PageProps) {
  const { q, category, sort, page } = await loadProductSearchParams(searchParams);
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery(productsQueryOptions({ q, category, sort, page }));
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProductView />
    </HydrationBoundary>
  );
}
