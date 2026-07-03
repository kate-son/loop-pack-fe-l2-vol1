# Week 3

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

## 검증

`pnpm dev`로 브라우저 실동작 확인 완료 (2026-07-03):

- 검색어 입력 후 검색 버튼/Enter로 조회 — 정상
- 가격범위 입력 후 적용 버튼으로 조회 — 정상
- 필터 변경 시 "데이터 갱신 중..." 배너 표시 — 정상
- 페이지네이션 클릭 시 페이지 상단 스크롤 — 정상
