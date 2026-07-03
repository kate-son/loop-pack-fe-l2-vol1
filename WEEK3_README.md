# Week 3

## 과제 작업 방향

1. `ProductListPage`라인 수가 많아 화면 기준으로 기능과 함께 Section(`FilterSection`/`ProductSection`/`PaginationSection`)으로 분리했습니다.
2. 각 Section 내에서 hooks로 분리될 수 있는 로직을 찾아 분리하였고, `ProductListPage`에는 목적인 상품 조회 hook(`useProductList`)만 남기고 나머지는 각 도메인 훅(`useProduct`, `useWishList`, `useRecentlyViewed`)으로 옮겼습니다.
3. 서버 상태는 `useState`+`useEffect` 수동 fetch 대신 `useQuery`로 전환해 로딩/에러/재조회 관리를 위임했습니다.
4. wishlist/recentlyViewed가 3단계 props drilling을 유발해 Zustand(+persist)로 전역 상태화했습니다.
5. `/component-review` 기준으로 재검토하며 `FilterSection`의 검색/가격 로직, `PaginationSection`의 페이지 번호 계산 등 남은 관심사 분리를 마무리했습니다.

## 레이어 분리 근거 요약

| 로직                                              | 위치                                         | 비고                                                 |
| ------------------------------------------------- | -------------------------------------------- | ---------------------------------------------------- |
| 상품 목록 조회 (로딩/에러/재조회)                 | `hooks/useProductList.ts`                    | `useQuery` 기반, 컴포넌트는 결과값만 소비            |
| 배지 계산, 할인율, 가격 포맷                      | `hooks/useProduct.ts`                        | 계산, 검증이 있는 실제 비즈니스 로직이라 훅으로 분리 |
| 페이지 번호 윈도우 계산                           | `common/utils/utils.ts`(`getPageNumbers`)    | 도메인 무관 순수 함수                                |
| 가격 포맷 / 검색어 하이라이트 / localStorage 헬퍼 | `common/utils/utils.ts`                      | 순수 함수, 중복 사용                                 |
| API 응답 unwrap                                   | `common/utils/apiUtils.ts`(`unwrapResponse`) | 공통 에러 변환                                       |

---

### 관심사 분리 — "비즈니스 로직이 Custom Hook으로 분리되었는가"

**① `FilterSection`의 draft 상태(`draftSearchQuery`/`draftMinPrice`/`draftMaxPrice`)와 적용/검색 클릭시의 로직**

- 계산, 검증 없이 입력값을 그대로 `onFilterChange`에 전달할 뿐이고, `FilterSection` 한 곳에서만 쓰이기에 화면을 제어하는 상태로 보고 컴포넌트 내부에 유지.

**② `PaginationSection`의 페이지 번호 계산**

- 훅이 아니라 utils 순수 함수(`getPageNumbers`)로 분리.
- 상태, 부수효과가 없는 순수 계산으로 hook 보다는 util로 빼는게 더 맞다고 판단함.

### 관심사 분리 — "컴포넌트는 UI 렌더링에만 집중하는가"

**`ProductListPage`의 `buildSearchParams`(필터 데이터 URL 쿼리 변환)**

- 컴포넌트 파일 안에 함수로 처리
- `FilterSection`에 두려고 했을 때 URLSearchParams를 리스트 조회 request로 사용하고 있었음
- 어떻게 보면 상품 리스트 조회를 위한 URLSearchParams이기에 `FilterSection`에 넣게 되면 필터 재사용면이 낮아질거라 판단함

### API 레이어 — "endpoint와 request/response 형태가 한 곳에 모여 있는가"

**쿼리 파라미터 조립(`FilterValues → URLSearchParams`)이 `productService.ts`가 아니라 `hooks/useProductList.ts`에 있음**

- `productService.getProductList`는 완성된 `URLSearchParams`만 받아 `fetch` + `unwrapResponse`만 수행.
- 파라미터 조립은 `filter` 상태 구조(`FilterValues`)에 의존하는 도메인 지식이라, 상태를 이미 들고 있는 훅 쪽에 두는 것이 자연스럽다고 판단.

### 전역 상태 관리 — Zustand 도입 이유

- `wishlist` / `onWishlistToggle` / `onProductClick`이 `ProductListPage → ProductSection → ProductCard` 3단계를 타고 내려가는 props drilling 발생.
- 3단계의 drilling으로 Context 검토하였음.

**Context를 선택하지 않은 이유**

wishlist 토글은 상품 카드를 클릭할 때마다 발생하는 잦은 변경. Context는 값이 바뀌면 구독 중인 컴포넌트 전체가 리렌더되므로, product-grid 전체가 들썩이는 문제가 생김.

**localStorage 직접 공유를 고려했으나 (→ 사용하지 않음)**

localStorage는 React 상태가 아니므로 값이 바뀌어도 리렌더가 일어나지 않음.

**Zustand + persist 미들웨어 채택**

- 전역 상태(리렌더 트리거) + localStorage(영속성)를 동시에 해결
- 구독한 컴포넌트만 리렌더되어 Context의 성능 문제가 없음
- 기존 `useWishList` / `useRecentlyViewed` 훅을 제거하고 store로 대체, `Product.tsx`에서 store를 직접 참조해 props 5개 → 2개(`product`, `searchQuery`)로 축소

---

## 사용성 개선

### 검색어/가격범위 결과는 버튼(또는 Enter)으로만 반영

기존에는 검색어·가격범위를 입력할 때마다 즉시 재조회가 일어났는데, "검색"/"적용" 버튼(또는 Enter)을 눌러야 조회되도록 변경.

**판단 근거**

- 가격범위처럼 숫자를 한 자리씩 입력하는 필드는 입력할 때마다(디바운스 없이) 조회하면 자릿수마다 요청이 나가 비효율적 — 버튼으로 명시적 커밋하면 이 문제가 사라짐
- 사용자가 "언제 조회될지"를 직접 통제할 수 있어 의도치 않은 재조회로 인한 결과 깜빡임이 없음

**트레이드오프**

- 입력값을 즉시 반영하지 않고 커밋 전까지 들고 있어야 해서 `FilterSection`에 draft 상태(`draftSearchQuery`/`draftMinPrice`/`draftMaxPrice`) 3개가 추가로 필요해졌고, 이게 `useFilterForm` 추출/되돌림, `prevFilter` 동기화 버그로 이어지는 복잡도의 근원이 됨 (`WEEK3_DECISIONS.md` 고민 #1, #2)
- 검색어만 놓고 보면 디바운스 기반 즉시 검색이 더 가벼운 대안일 수 있으나, 가격범위는 어차피 버튼이 필요해 "검색어는 디바운스, 가격은 버튼"으로 나누기보다 하나의 적용 액션으로 통일하는 쪽이 UX 일관성 면에서 낫다고 판단

### "재고 있는 것만" 검색 오류

`_mockApi.ts` 수정

```text
  //재고 있는 것만 검색 누락 추가
  const inStock = params.get('inStock');
  if (inStock) list = list.filter((p) => p.stock > 0);
```

---

## AI 생성 코드 (`/* AI-generated */`)

- `FilterSection`의 draft 상태를 외부 `filter` 변경과 동기화하는 `prevFilter` 비교 로직은 AI로 생성한 뒤 직접 검토, 수정했습니다.
- `productListStore`의 Zustand 스토어(`wishlist`/`recentlyViewed` 상태 및 액션)는 AI로 생성한 뒤 직접 검토, 수정했습니다.

## 검증

`pnpm dev`로 브라우저 실동작 확인 완료 (2026-07-03):

- 검색어 입력 후 검색 버튼/Enter로 조회 — 정상
- 가격범위 입력 후 적용 버튼으로 조회 — 정상
- 필터 변경 시 "데이터 갱신 중..." 배너 표시 — 정상
- 페이지네이션 클릭 시 페이지 상단 스크롤 — 정상
