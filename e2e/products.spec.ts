import { expect, test, type Locator, type Page } from '@playwright/test';

async function expectSearchParam(page: Page, name: string, value: string | null) {
  await expect.poll(() => new URL(page.url()).searchParams.get(name)).toBe(value);
}

async function visibleProductNames(page: Page) {
  const results = page.getByRole('region', { name: '상품 검색 결과' });
  await expect(results.getByRole('heading', { level: 3 }).first()).toBeVisible();
  return results.getByRole('heading', { level: 3 }).allTextContents();
}

async function expectProductNames(page: Page, expectedNames: string[]) {
  await expect
    .poll(() =>
      page
        .getByRole('region', { name: '상품 검색 결과' })
        .getByRole('heading', { level: 3 })
        .allTextContents(),
    )
    .toEqual(expectedNames);
}

async function expectFilters(
  page: Page,
  filters: { q?: string; category?: string; sort?: string },
) {
  if (filters.q !== undefined) {
    await expect(page.getByRole('textbox', { name: '검색' })).toHaveValue(filters.q);
  }
  if (filters.category !== undefined) {
    await expect(page.getByLabel('카테고리')).toHaveValue(filters.category);
  }
  if (filters.sort !== undefined) {
    await expect(page.getByLabel('정렬')).toHaveValue(filters.sort);
  }
}

async function selectAndWaitForRequest(
  page: Page,
  select: Locator,
  option: string,
  expectedParam: [string, string],
) {
  const response = page.waitForResponse((candidate) => {
    const url = new URL(candidate.url());
    return (
      url.pathname === '/api/products' &&
      url.searchParams.get(expectedParam[0]) === expectedParam[1]
    );
  });
  await select.selectOption(option);
  await response;
}

// Week 08 Step 2 추가 — 목록 로딩 → 성공 정상: production route 최초 진입
test('기존 목록 없이 상품 라우트에 진입하면 production 로딩 화면을 거쳐 상품 목록을 표시한다', async ({
  page,
}) => {
  await page.goto('/products', { waitUntil: 'commit' });

  await expect(page.getByRole('region', { name: '상품 목록을 불러오는 중입니다' })).toBeVisible();
  await expect(page.getByRole('region', { name: '상품 검색 결과' })).toBeVisible();
  await expect(page.getByRole('region', { name: '상품 목록을 불러오는 중입니다' })).toBeHidden();
  expect((await visibleProductNames(page)).length).toBeGreaterThan(0);
});

// Week 08 Step 2 추가 — 조작이 URL에 반영 / URL 재진입 정상/경계
test('검색/카테고리/정렬/페이지 조작을 URL에 기록하고 같은 URL로 재진입하면 조건과 목록을 복원한다', async ({
  page,
}) => {
  await page.goto('/products');
  await expect(page.getByRole('region', { name: '상품 검색 결과' })).toBeVisible();

  await selectAndWaitForRequest(page, page.getByLabel('카테고리'), 'casual', [
    'category',
    'casual',
  ]);
  await selectAndWaitForRequest(page, page.getByLabel('정렬'), 'price-asc', ['sort', 'price-asc']);
  const searchResponse = page.waitForResponse((candidate) => {
    const url = new URL(candidate.url());
    return url.pathname === '/api/products' && url.searchParams.get('q') === '케이블 울';
  });
  await page.getByRole('textbox', { name: '검색' }).fill('케이블 울');
  await searchResponse;
  await expectSearchParam(page, 'q', '케이블 울');
  await expectSearchParam(page, 'category', 'casual');
  await expectSearchParam(page, 'sort', 'price-asc');
  const filteredUrl = page.url();
  const filteredNames = await visibleProductNames(page);

  await page.goto('/');
  await page.goto(filteredUrl);
  await expectFilters(page, { q: '케이블 울', category: 'casual', sort: 'price-asc' });
  await expectProductNames(page, filteredNames);

  await page.goto('/products');
  await expect(page.getByRole('region', { name: '상품 검색 결과' })).toBeVisible();
  const secondPageResponse = page.waitForResponse((candidate) => {
    const url = new URL(candidate.url());
    return url.pathname === '/api/products' && url.searchParams.get('page') === '2';
  });
  await page.getByRole('button', { name: '다음' }).click();
  await secondPageResponse;
  await expectSearchParam(page, 'page', '2');
  const secondPageUrl = page.url();
  const secondPageNames = await visibleProductNames(page);

  await page.goto('/');
  await page.goto(secondPageUrl);
  await expect(page.getByText(/^2 \/ \d+$/)).toBeVisible();
  await expectProductNames(page, secondPageNames);
});

// Week 08 Step 2 추가 — 뒤로/앞으로 가기로 필터 복원 정상/경계
test('여러 필터 history에서 뒤로/앞으로 이동하면 각 시점의 URL과 필터 및 목록을 복원한다', async ({
  page,
}) => {
  await page.goto('/products?category=casual');
  const casualLatestNames = await visibleProductNames(page);

  await selectAndWaitForRequest(page, page.getByLabel('정렬'), 'price-asc', ['sort', 'price-asc']);
  const casualPriceNames = await visibleProductNames(page);
  await selectAndWaitForRequest(page, page.getByLabel('카테고리'), 'fashion', [
    'category',
    'fashion',
  ]);
  const fashionPriceNames = await visibleProductNames(page);

  await page.goBack();
  await expectSearchParam(page, 'category', 'casual');
  await expectSearchParam(page, 'sort', 'price-asc');
  await expectFilters(page, { category: 'casual', sort: 'price-asc' });
  await expectProductNames(page, casualPriceNames);

  await page.goBack();
  await expectSearchParam(page, 'category', 'casual');
  await expectSearchParam(page, 'sort', null);
  await expectFilters(page, { category: 'casual', sort: 'latest' });
  await expectProductNames(page, casualLatestNames);

  await page.goForward();
  await expectSearchParam(page, 'sort', 'price-asc');
  await expectFilters(page, { category: 'casual', sort: 'price-asc' });
  await expectProductNames(page, casualPriceNames);

  await page.goForward();
  await expectSearchParam(page, 'category', 'fashion');
  await expectFilters(page, { category: 'fashion', sort: 'price-asc' });
  await expectProductNames(page, fashionPriceNames);
});

// Week 08 Step 2 추가 — 새로고침 후 필터 상태 유지 정상/경계
test('필터와 페이지가 적용된 화면을 새로고침하면 현재 조건을 유지하고 기본 URL은 기본 상태를 유지한다', async ({
  page,
}) => {
  await page.goto('/products?q=Loopers%20Select&sort=price-desc&page=2');
  const filteredPageNames = await visibleProductNames(page);
  await expectFilters(page, { q: 'Loopers Select', category: 'all', sort: 'price-desc' });
  await expect(page.getByText(/^2 \/ \d+$/)).toBeVisible();

  await page.reload();
  await expectSearchParam(page, 'q', 'Loopers Select');
  await expectSearchParam(page, 'sort', 'price-desc');
  await expectSearchParam(page, 'page', '2');
  await expectFilters(page, { q: 'Loopers Select', category: 'all', sort: 'price-desc' });
  await expect(page.getByText(/^2 \/ \d+$/)).toBeVisible();
  await expectProductNames(page, filteredPageNames);

  await page.goto('/products');
  const defaultNames = await visibleProductNames(page);
  await page.reload();
  await expectFilters(page, { q: '', category: 'all', sort: 'latest' });
  await expectSearchParam(page, 'q', null);
  await expectSearchParam(page, 'category', null);
  await expectSearchParam(page, 'sort', null);
  await expectSearchParam(page, 'page', null);
  await expectProductNames(page, defaultNames);
});

// Week 08 Step 2 추가 — 목록 진입 → 담기 → Header 확인 정상/경계
test('개수가 0인 상품 목록에서 장바구니와 위시리스트에 첫 상품을 담으면 Header에 각각 1을 표시한다', async ({
  page,
}) => {
  await page.goto('/products');
  await expect(page.getByRole('region', { name: '상품 검색 결과' })).toBeVisible();
  const mainNavigation = page.getByRole('navigation', { name: '주요 메뉴' });
  await expect(mainNavigation.getByText('장바구니 0')).toBeVisible();
  await expect(mainNavigation.getByText('위시리스트 0')).toBeVisible();

  const firstCartButton = page.getByRole('button', { name: '1번 상품 담기', exact: true });
  await firstCartButton.click();
  await expect(mainNavigation.getByText('장바구니 1')).toBeVisible();
  await expect(firstCartButton).toHaveAttribute('aria-pressed', 'true');

  const firstWishlistButton = page.getByRole('button', {
    name: '1번 상품 위시리스트',
    exact: true,
  });
  await firstWishlistButton.click();
  await expect(mainNavigation.getByText('위시리스트 1')).toBeVisible();
  await expect(firstWishlistButton).toHaveAttribute('aria-pressed', 'true');
});
