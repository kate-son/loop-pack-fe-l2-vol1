# Week 06 RFC — FSD로 변경 반경을 설계한다

> 이 문서는 `docs/assignments/week-06.md`의 RADIO 양식을 따른다.
> "직접 작성"으로 표시된 항목은 아직 결정하지 않은 부분이다.

## 0단계 — 동작 기준선

폴더 이동 전, 현재 코드(`feat/week-06`, `pnpm dev` 기준)에서 아래 항목을 직접 확인했다.

| 항목                         | 결과                                                                                                                                                                                                                                                                                                                                                                                                              |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm check`                 | 통과 — test 46/46, lint 에러 0 · warning 30(전부 mock 데이터의 `no-magic-numbers`, 구조 변경과 무관한 기존 경고), typecheck 통과, build 성공                                                                                                                                                                                                                                                                      |
| 홈 화면 정상 상태            | 배너 · 카테고리 · 인기 상품 · 신상품 정상 렌더링                                                                                                                                                                                                                                                                                                                                                                  |
| 상품 목록 정상 상태          | 총 30개, 페이지네이션 1/3 정상                                                                                                                                                                                                                                                                                                                                                                                    |
| 검색                         | `q=셔츠` → 서버가 `총 1개`로 정확히 필터링, 새로고침해도 결과 유지                                                                                                                                                                                                                                                                                                                                                |
| 카테고리 필터                | `category=digital` → 총 6개로 정상 필터링                                                                                                                                                                                                                                                                                                                                                                         |
| 정렬                         | `sort=price-asc` 등 URL에 정상 반영                                                                                                                                                                                                                                                                                                                                                                               |
| URL 공유 · 새로고침          | 쿼리 파라미터 포함 URL 새로고침 시 동일한 필터 결과 유지                                                                                                                                                                                                                                                                                                                                                          |
| 뒤로/앞으로 가기             | products → home 이동 후 뒤로 가기 시 검색 상태 복원, 앞으로 가기 정상                                                                                                                                                                                                                                                                                                                                             |
| 장바구니 · 위시리스트 동기화 | 상품 목록에서 찜 · 담기 토글 → 헤더에 "위시리스트 1 / 장바구니 1" 반영, 홈으로 이동해도 카운트 유지(Zustand 정상 공유)                                                                                                                                                                                                                                                                                            |
| 로딩 상태                    | 0단계에서는 강제로 검증하지 않음. 현재 `QueryState`의 `renderLoading`으로만 처리되고 있어 범위(route `loading.tsx`/Suspense vs `isPending`)가 정해지지 않음 → 4단계에서 구조와 함께 정의                                                                                                                                                                                                                          |
| 빈 상태 / 에러 상태          | 0단계에서는 강제로 검증하지 않음. `?scenario=empty`, `?scenario=error`로 URL을 조작해도 화면은 정상 데이터를 그대로 보여줌 — `scenario`가 `ProductListQuery`/`productSearchParams`에 없어(과제 지침에 따라 의도적으로 제외) 클라이언트가 API로 전달하지 않기 때문. `error.tsx`도 프로젝트 전체에 존재하지 않음. 버그가 아니라 4단계(에러 처리 경계)가 아직 구현되지 않아 생기는 공백 → 4단계에서 구조와 함께 정의 |

### 발견한 기존 버그

직접 작성 (있다면 `재현 방법 · 원인 · 수정 위치 · 검증 결과`를 구조 변경 커밋과 분리해서 기록)

---

## R — Requirements

- **5주차까지의 기능 요구사항**: 직접 작성
- **비기능 요구사항**: 직접 작성
- **이번 주에 반드시 보존할 동작**: 위 0단계 표 참고
- **이번 주에 하지 않을 것과 그 이유**: 직접 작성

## A — Architecture

### 현재 겪는 문제 (3개 이상)

직접 작성

### Before — 현재 폴더 구조 (화면 기준)

```
src/
├── app/                          # Next.js 라우팅 디렉터리
│   ├── home/
│   │   ├── page.tsx              # 서버 컴포넌트, prefetch만 담당
│   │   ├── api/
│   │   │   └── homeService.ts    # fetchHome() — /api/home 호출
│   │   ├── model/
│   │   │   ├── types.ts          # HomeResponse (배너+카테고리+인기+신상품 조합 타입)
│   │   │   ├── homeQueryOptions.ts
│   │   │   └── useHomeData.ts
│   │   └── ui/
│   │       └── HomeView.tsx      # 실제 화면 렌더링 ('use client')
│   │
│   ├── products/
│   │   ├── page.tsx              # 서버 컴포넌트, prefetch만 담당
│   │   └── ui/
│   │       └── ProductView.tsx   # 실제 화면 렌더링 ('use client')
│   │                              # ※ products는 api/model 없이 entities/features를 바로 소비
│   │
│   ├── layout.tsx / providers.tsx / globals.css
│   └── api/{home,products}/route.ts   # mock 백엔드 (Route Handler)
│
├── components/ui/                # FSD 밖 — 아직 안 옮겨진 공용 UI
│   ├── dialog/                   # compound component
│   └── select/                   # compound component
│
├── entities/
│   ├── product/
│   │   ├── model/product.ts      # Product, ProductListQuery, 정렬/기본값 상수
│   │   ├── model/constants.ts    # staleTime/gcTime
│   │   └── api/{productsService, productsQueryOptions, useProductList}.ts
│   └── category/model/category.ts
│
├── features/
│   ├── cart/model/useCartStore.ts
│   ├── wishlist/model/useWishlistStore.ts
│   └── product-filter/
│       ├── model/{productSearchParams, loadProductSearchParams, useProductListParams}.ts
│       └── ui/ProductFilters.tsx
│
├── widgets/
│   ├── header/ui/Header.tsx            # wishlist·cart 카운트 표시, 상품 prefetch
│   └── product-card/ui/ProductCard.tsx # wishlist·cart 토글 버튼 포함
│
└── shared/
    ├── api/{getQueryClient, response}.ts
    ├── lib/{set, webStorage}.ts
    └── ui/{ErrorRetry, Pagination, QueryState}/
```

화면이 실제로 조합하는 관계:

- **`/home`**: `page.tsx`(prefetch) → `HomeView`(app/home/ui) → `Header`(widget) + `ProductCard`(widget, 카테고리별 반복) + `productsQueryOptions`(entities, hover prefetch용) 직접 조합
- **`/products`**: `page.tsx`(prefetch) → `ProductView`(app/products/ui) → `Header` + `ProductFilters`(feature) + `useProductListParams`(feature) + `useProductList`(entities) + `ProductCard`(widget) + `Pagination`(shared)

관찰: `home`은 자기 전용 `api/model`을 갖고 있는데 `products`는 없어서 두 화면의 구조가 서로 다르다. `HomeView`/`ProductView` 자체도 아직 FSD 세그먼트 밖(라우팅 디렉터리 안)에 있다.

### After — 목표 폴더 구조

직접 작성

### 사용할 레이어만 선택한 근거

직접 작성

### 허용/금지 import 예시

직접 작성

### 단계별 마이그레이션 계획과 검증 방법

직접 작성

## D — Data Model

### 상태 분류표

| 상태                | Source of Truth     | 소유 슬라이스/레이어 | 소비하는 곳        | 이동 후에도 중복 저장하지 않는 방법 |
| ------------------- | ------------------- | -------------------- | ------------------ | ----------------------------------- |
| 상품 조회 결과      | 서버/TanStack Query | 직접 작성            | 홈, 상품 목록      | 직접 작성                           |
| 검색·정렬·페이지    | URL/nuqs            | 직접 작성            | 상품 목록          | 직접 작성                           |
| 장바구니·위시리스트 | Zustand             | 직접 작성            | 헤더, 상품 행위 UI | 직접 작성                           |
| Dialog 열림 여부    | React 로컬 상태     | 직접 작성            | 해당 UI            | 직접 작성                           |

## I — Interface

- **각 슬라이스가 공개할 값과 숨길 구현 세부**: 직접 작성
- **`ProductCard`와 장바구니·위시리스트 행위의 조합 방법**: 직접 작성
- **Public API 사용 여부와 방식**: 직접 작성

## O — Optimization

- **TanStack Query 캐시 정책 유지/변경 근거**: 직접 작성
- **로딩·에러 경계 범위**: 직접 작성
- **이번 주에 하지 않을 최적화와 이유**: 직접 작성

---

## 파일 매핑표 (이동하는 파일 + 그 자리에 남기는 파일)

| 현재 위치 | 목표 위치 | 레이어 / 슬라이스 / 세그먼트 | 이동 또는 유지하는 이유 |
| --------- | --------- | ---------------------------- | ----------------------- |
| 직접 작성 | 직접 작성 | 직접 작성                    | 직접 작성               |

## 애매한 파일 5개 이상 결정표

| 대상                                | 후보 A                   | 후보 B                          | 최종 결정 | 기준      |
| ----------------------------------- | ------------------------ | ------------------------------- | --------- | --------- |
| `ProductCard`                       | `entities/product/ui`    | `widgets/product-card`          | 직접 작성 | 직접 작성 |
| 상품 목록 queryOptions              | `entities/product/api`   | 상품 목록 페이지의 `api`        | 직접 작성 | 직접 작성 |
| 장바구니 store                      | `entities/cart/model`    | 장바구니 행위 feature의 `model` | 직접 작성 | 직접 작성 |
| `Product` 타입                      | `entities/product/model` | `shared/types` 유지             | 직접 작성 | 직접 작성 |
| `HomeResponse` / `homeQueryOptions` | 직접 작성                | 직접 작성                       | 직접 작성 | 직접 작성 |

## 4단계 — 에러 처리 경계 설계

| 실패 유형                     | 처리 위치 | Error Boundary로 전파하는가 | 사용자 UI | 재시도 방법 | 이 경계를 선택한 이유 |
| ----------------------------- | --------- | --------------------------- | --------- | ----------- | --------------------- |
| 상품 목록 조회 실패           | 직접 작성 | 직접 작성                   | 직접 작성 | 직접 작성   | 직접 작성             |
| 잘못된 검색 조건(4xx)         | 직접 작성 | 직접 작성                   | 직접 작성 | 직접 작성   | 직접 작성             |
| 예상하지 못한 렌더링 오류     | 직접 작성 | 직접 작성                   | 직접 작성 | 직접 작성   | 직접 작성             |
| 장바구니 행위의 비즈니스 오류 | 직접 작성 | 직접 작성                   | 직접 작성 | 직접 작성   | 직접 작성             |

## 5단계 — 삭제 시나리오 자가 검증

- **위시리스트 기능을 통째로 제거한다면**: 직접 작성
- **신상품 뱃지를 상품 카드에 추가한다면**: 직접 작성

## Advanced (선택)

직접 작성

## FSD 이해 확인 질문

1. 직접 작성
2. 직접 작성
3. 직접 작성
4. 직접 작성
5. 직접 작성
6. 직접 작성
