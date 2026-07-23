# 5주차 판단 근거

### TanStack Query·nuqs·Zustand의 책임을 나눈 기준

원본(Source of Truth)이 어디에 있는지를 기준으로 나눴습니다.

- **서버가 원본을 가진 데이터**(상품 목록/가격, 카테고리 등) → **TanStack Query**. 화면은 이 값의 스냅샷을 보여주고, 데이터의 조회/상태/캐시 수명을 TanStack Query가 관리
- **공유·새로고침·앞뒤 이동으로 복원돼야 하는 조건**(검색어, 카테고리, 정렬, 페이지) → **nuqs(URL 상태)**. 원본이 URL 자체이므로 URL만 있으면 같은 화면을 재현할 수 있어야 함
- **여러 페이지가 함께 써야 하는 비로그인 로컬 상태**(위시리스트, 장바구니) → **Zustand**. 서버도 URL도 원본을 갖지 않는, 이 세션 동안만 유효한 클라이언트 전용 데이터
- **한 화면·컴포넌트 수명에만 머무는 상태**(모달 열림, 검색어 draft 등) → **React 로컬 상태**. 다른 화면, 새로고침에 영향을 주면 안 되는 값

자세한 표는 [상태 · 소유자 · 수명 · 공유 범위 · 선택 이유](#상태--소유자--수명--공유-범위--선택-이유) 참조.

---

### staleTime과 gcTime 정책

- **값**: 상품 관련 쿼리(홈 인기/신상품, 목록)는 `staleTime: 1분`, `gcTime: 5분`을 이름 있는 상수(`PRODUCT_PRICE_STALE_TIME`/`PRODUCT_PRICE_GC_TIME`)로 두고 공유합니다.
- **staleTime을 짧게 잡은 이유**: 타임세일처럼 짧은 주기(실측상 25분 단위로도 도는 경우가 있음)로 가격이 바뀔 수 있습니다.
- **gcTime을 명시한 이유**: 라이브러리 기본값과 같은 5분이지만, "staleTime보다 크거나 같아야 한다"는 의도가 코드에 드러나도록 생략하지 않고 명시적으로 선언했습니다.
- **전역이 아니라 상품 전용 상수로 둔 이유**: 이후 상품과 무관한 쿼리가 추가됐을 때 근거 없이 값을 상속하지 않게 하기 위해서입니다.

자세한 내용은 [TanStack Query](#tanstack-query) 참조.

---

### store 데이터 형태와 selector 경계

- **자료구조**: 위시리스트/장바구니는 `Set<string>`(상품 id 집합)으로 저장합니다. 배열 대신 `Set`을 쓴 이유는 "담겨있는지 아닌지"만 판단하면 되는 멤버십 자료구조라 `has()`로 O(1) 조회가 되고, 토글 시 중복 걱정이 없기 때문입니다.
- **직렬화**: `Set`은 `JSON.stringify`로 직렬화가 안 돼 `createJSONStorage`에 `replacer`/`reviver`를 넣어 배열 ↔ `Set`을 변환합니다.

selector 경계는 명세 8번("Header는 개수만, 상품 버튼은 해당 상품 상태와 필요한 action만 구독")을 그대로 따랐습니다:

- `Header`는 `state => state.productIds.size`만 구독 — 개수를 별도 상태로 저장하지 않고 `Set.size`에서 파생합니다.
- `ProductCard`는 `state => state.productIds.has(product.id)`(자기 상품의 찜/담기 여부)와 토글 action(`setSingleIdInWishlist`/`setSingleIdInCart`)만 구독합니다.

각 컴포넌트가 자신에게 필요한 최소 슬라이스만 구독해서, 위시리스트에 상품이 추가돼도 그 상품과 무관한 `ProductCard`는 리렌더되지 않습니다. 자세한 내용은 [Zustand (위시리스트/장바구니)](#zustand-위시리스트장바구니) 참조.

---

### 전역으로 올리지 않은 상태와 이유

- **로딩/에러 상태**: 전역 store에 별도로 두지 않고 `useQuery()`가 반환하는 `UseQueryResult`(`isPending`/`isError`/`error`) 그대로 각 화면에서 씁니다. TanStack Query가 이미 쿼리별로 관리하는 값을 또 다른 상태로 복사하면 두 값이 어긋날 위험만 생깁니다.
- **검색어 draft**: `ProductFilters` 내부 로컬 상태로만 두고, 폼 제출 시에만 nuqs(URL)에 반영합니다. 타이핑 중인 값까지 전역/URL로 올리면 키 입력마다 URL이 바뀌고 불필요한 API 재조회가 발생합니다.
- **모달/셀렉트 열림 여부**: 해당 컴포넌트 마운트~언마운트 동안만 의미 있는 값이라 React 로컬 상태로 충분하고, 다른 화면이 알 필요가 없습니다.
- **페이지네이션 총 페이지 수 등 파생값**: `totalCount`/`pageSize`로부터 계산 가능한 값이라 별도 상태로 저장하지 않고 렌더링 시점에 계산합니다(`Math.ceil(totalCount / pageSize)`).

---

### 로그인·서버 동기화가 생기면 위시리스트 소유권이 어떻게 달라지는지

**merge 전략**: 로그인 시점에 로컬(익명) 위시리스트와 서버 위시리스트를 합칩니다.

- 서버에 이미 있는 상품 id는 그대로 유지(중복 추가하지 않음)
- 로컬에만 있던 상품 id는 서버 쪽에 새로 추가
- 위시리스트는 "담겨있다/아니다"만 의미 있는 집합이라 겹치는 id는 그대로 두면 되고, 수량 개념이 있는 장바구니로 확장한다면 겹치는 id의 수량을 합산(+1)하는 방식으로 다르게 처리할 수 있습니다.

**Zustand 역할 변화**: 이 시점부터 위시리스트의 원본(Source of Truth)은 더 이상 Zustand가 아니라 서버가 되고, 실제 데이터는 TanStack Query(서버 상태)로 옮겨갑니다. Zustand의 역할은 두 가지 중 하나로 축소됩니다:

- **로그인 전 임시 입력**: 비로그인 상태에서 쌓인 값을 로그인 시 서버로 merge-업로드하기 위한 임시 저장소.
- **로그인 후 UI 상태**: 찜 버튼이 눌려있는지 같은 화면 표시용 상태만 남기고, 실제 목록·값은 서버 응답(TanStack Query 캐시)에서 파생합니다.
- **로그인 하지 않은 사용자를 위한 저장소**: 로그인 하지 않은 사용자들을 위해 임시 저장소의 역할로 사용합니다.

---

### 새로고침·URL 공유·앞뒤 이동·페이지 이동 검증 결과

Playwright(Chromium, 실브라우저)로 직접 재현해 확인했습니다.

- **새로고침**: `/products`에서 찜 버튼 클릭(위시리스트 1) → `page.reload()` → 새로고침 후에도 "위시리스트 1" 그대로 유지됨. `persist`(sessionStorage) + `rehydrate()`가 정상 동작합니다.
- **URL 공유**:
  - 카테고리·정렬·페이지 조건이 전부 URL 쿼리에 있어 그 URL만 다시 열어도 같은 조건으로 복원됩니다.
  - `page=9999`(범위 초과)·`page=000`(파싱은 되지만 API가 거부하는 값) 같은 잘못된 URL도 초기 페이지로 자동 정정됨을 확인했습니다 (자세한 내용은 [Pagination — 잘못된 `page` 값 방어](#pagination--잘못된-page-값-방어) 참조).
  - 그 외 `category=doesnotexist`/`sort=notreal`(nuqs가 조용히 기본값 처리), `page=abc`/`page=1.5`(NaN·소수는 정수 파싱 단계에서 정리됨), `q=<script>...`(React 자동 이스케이프로 실행 안 됨), `page=1&page=2`(중복 파라미터) 등도 점검해 별도 방어 코드 없이 이미 안전하게 처리됨을 확인했습니다.
- **앞뒤 이동**: `/products` → 카테고리를 `casual`로 변경(`?category=casual`) → 정렬을 `price-asc`로 변경(`?category=casual&sort=price-asc`) → 뒤로가기 1번 → `?category=casual`로 복원 → 뒤로가기 1번 더 → 조건 없는 `/products`로 복원 → 앞으로가기 1번 → 다시 `?category=casual`로 복원. `history: 'push'`로 필터 변경마다 히스토리 항목이 쌓여 각 단계가 정확히 복원되는 걸 실측으로 확인했습니다.
- **클라이언트 페이지 이동**: 위시리스트/장바구니는 전역 Zustand store라 Home ↔ Products 이동에도 인스턴스가 유지되어 개수가 그대로 보존됩니다(`ProductCard.test.tsx`에서 같은 화면에 `Header`+`ProductCard`를 함께 렌더링해 store 공유를 검증).

## Advanced 선택 이유·복잡도·검증 결과

### A. 상태 영속화

- **선택 이유**: 새로고침 시 장바구니·위시리스트가 사라지는 건 사용성을 저해하는 부분이라 판단해 추가했습니다.
- **추가된 복잡도**: `persist` 미들웨어 + `skipHydration`/수동 `rehydrate()`, `version`/`migrate`, `onRehydrateStorage` 복구 전략 정도.
- **검증 방법**: 실제 새로고침으로 확인했고, 이번에 Playwright로 다시 재현해 "찜 클릭 → 새로고침 → 값 유지"를 자동화된 형태로도 확인했습니다.

---

### B. App Router 서버 프리패치

- **선택 이유**: `use client`/서버 컴포넌트 경계를 직접 부딪혀보고 싶어서 선택했습니다. Next.js 특유의 구조(요청별 QueryClient, RSC 경계, dehydrate/hydrate)를 체감할 수 있었습니다.
- **중복 요청 확인**: 브라우저 개발자도구(F12) 네트워크 탭으로 클라이언트 쪽 초기 요청이 중복 발생하는지 확인했고, 중복되지 않음을 확인했습니다 — 서버 프리패치와 클라이언트 `useQuery`가 같은 `queryOptions`(같은 query key)를 공유해서 캐시가 그대로 재사용되기 때문입니다.
- **프리패치 대상 선택 근거**: 모든 화면이 아니라 Home·목록처럼 "진입 시 항상 필요한 초기 데이터가 있는 화면"에만 적용했습니다. 위시리스트/장바구니처럼 서버가 원본을 갖지 않는 클라이언트 전용 상태는 애초에 프리패치 대상이 아닙니다.

자세한 근거는 [Advanced B — App Router 서버 프리패치](#advanced-b--app-router-서버-프리패치) 참조.

---

### C. 사용자 경험 개선

- **선택 이유**: 사용성 개선은 당연히 해두는 게 좋다고 판단해 5개 항목(디바운스, 다음 페이지 prefetch, 이동 전 prefetch, 페이지 변경 중 목록 유지, 오류 재시도) 전부 적용했습니다.
- **난이도**: A와 비슷한 수준.
- **검증 결과**: `pnpm test` 46/46 통과, 실제 UI에서 각 UX(디바운스 검색, 페이지 전환 시 깜빡임 없음, 네트워크 끊겼다 재시도 등) 동작을 직접 확인했습니다.

자세한 내용은 [Advanced C — 사용자 경험 개선](#advanced-c--사용자-경험-개선) 참조.

---

### D. 테스트

- **선택 이유**: Playwright를 써보고 싶어서 선택했습니다. 이후 테스트를 Vitest Browser Mode(Playwright)로 한 번 더 확장했습니다.
- **작업 방식**: 최근 테스트 코드를 AI로 작성하는 게 흔해진 만큼, 그대로 받아쓰기보다는 왜 이렇게 짰는지 직접 이해하는 방향으로 진행했습니다.
- **검증 결과**: `pnpm test` 46/46 통과(Zustand action/selector, Header 개수 파생, nuqs URL-query key 일치, 홈·목록 store 동기화 4개 영역).

자세한 내용은 [Advanced D — 테스트](#advanced-d--테스트) 참조.

---

### 상태 · 소유자 · 수명 · 공유 범위 · 선택 이유

**구현 전에 각 데이터를 어떤 상태로 관리할지 먼저 정리했습니다.**

| 데이터                                           | 상태종류             | 소유자         | 수명                                                                                                                                     | 공유범위                                                                 | 선택이유                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------------------------------------ | -------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 상품 목록 데이터 (`Product[]`)                   | 서버 상태            | TanStack Query | query key로 관리, staleTime: 1분, gcTime: 5분 (`PRODUCT_PRICE_STALE_TIME`/`PRODUCT_PRICE_GC_TIME`으로 상수화, home/products 쿼리가 공유) | Home 인기/신상품, 카테고리별 목록                                        | 가격 등은 원본이 서버에 있는 값입니다. 타임세일이 1시간 단위로 돈다는 보장이 없고(실제로는 25분처럼 더 짧게 도는 경우도 있음), 타임세일 종료 시점을 안전하게 반영하려면 짧은 주기로 다시 확인해야 해서 staleTime을 1분으로 잡았습니다. Home의 인기/신상품도 같은 `Product[]` 데이터이고 하나의 응답으로 묶여 있어 필드별로 다른 staleTime을 줄 수 없기 때문에, 더 변동성이 큰 상품 가격 기준에 맞춰 동일한 값을 공유합니다. |
| 카테고리 / 검색어(q) / 정렬(sort) / 페이지(page) | URL 상태             | nuqs           | URL이 참조되는 동안 (특정 URL이 재방문될 때 값이 복원됨)                                                                                 | Home 카테고리 링크, 목록 페이지 필터 UI(검색·카테고리·정렬·페이지네이션) | URL을 공유하거나 새로고침해도 같은 필터 조건이 유지되어야 하기 때문입니다.                                                                                                                                                                                                                                                                                                                                                  |
| 위시리스트(찜)                                   | 전역 클라이언트 상태 | Zustand        | 세션 동안 (sessionStorage)                                                                                                               | Header 개수, 각 상품 카드의 찜 버튼                                      | localStorage로 하면 같은 기기를 쓰는 다른 비회원 사용자의 찜 목록이 섞일 수 있어 sessionStorage를 선택했습니다. 이후 Advanced A(상태 영속화)로 확장할 계획이라 새로고침 시에도 유지되도록 지금부터 저장 방식을 정했습니다.                                                                                                                                                                                                  |
| 장바구니(담기)                                   | 전역 클라이언트 상태 | Zustand        | 세션 동안 (sessionStorage)                                                                                                               | Header 개수, 각 상품 카드의 담기 버튼                                    | 위시리스트와 동일한 이유입니다.                                                                                                                                                                                                                                                                                                                                                                                             |
| 로컬 UI 상태 (모달 열림, 셀렉트 열림 등)         | 로컬 상태            | 각 컴포넌트    | 마운트 ~ 언마운트                                                                                                                        | 단일 컴포넌트, 해당 화면에서만 필요                                      | 화면을 이동하면 초기화되어야 하고, 모달은 그 화면이 떠 있는 동안에만 열리고 닫히면 되기 때문입니다.                                                                                                                                                                                                                                                                                                                         |

---

### TanStack Query

**`queryOptions`는 쿼리마다(홈, 상품 목록) 개별 팩토리로 정의합니다.**

- query key·queryFn·staleTime을 한곳에 모아두면 어디서 `useQuery`로 호출하든 값이 항상 같이 붙어다니고, 나중에 프리패치(Advanced B)에도 같은 팩토리를 재사용할 수 있습니다.
- 쿼리 종류가 늘어나면(예: 상품 상세) `productKeys.list()`/`productKeys.detail()` 같은 query key factory로 묶는 방향을 고려할 수 있지만, 지금은 쿼리가 2개뿐이라 적용하지 않았습니다.

**상품 가격 관련 staleTime/gcTime은 QueryClient 전역 `defaultOptions`가 아니라, 이름 있는 상수(`PRODUCT_PRICE_STALE_TIME`/`PRODUCT_PRICE_GC_TIME`, `src/app/queries/constants.ts`)로 뽑아 홈·상품 목록 쿼리가 공유합니다.**

- 이 값의 근거(타임세일로 인한 가격 변동)는 상품 데이터에 한정된 것이라, 전역 default로 두면 나중에 추가되는 무관한 쿼리(리뷰, 배너 단독 조회 등)에 이유 없이 상속될 위험이 있습니다.
- 반대로 각 쿼리 파일에 숫자를 그대로 중복 기입하면 "의도적으로 같은 값을 공유하는지, 우연히 같은 숫자인지"가 코드만 봐서는 드러나지 않아 이름 있는 상수로 분리했습니다.

**`gcTime: PRODUCT_PRICE_GC_TIME`(5분)은 TanStack Query v5의 기본 gcTime과 값이 같지만, 생략하지 않고 명시적으로 선언합니다.**

- 생략해도 동작은 동일하지만, 그러면 "staleTime(1분)보다 크거나 같아야 한다"는 근거로 의도적으로 고른 값이라는 사실이 코드에서 사라지고 문서에만 남게 됩니다.
- 나중에 staleTime을 조정할 때 gcTime과의 관계를 놓치지 않도록, 그리고 라이브러리 기본값이 향후 바뀌더라도 이 프로젝트의 값은 흔들리지 않도록 명시적으로 선언해두었습니다.

---

### 라우팅

**`/`는 `/home`으로 리다이렉트하고, 실제 Home 화면 코드는 `src/app/home/page.tsx`에 두었습니다.**

`/`를 Home 콘텐츠로 직접 채우는 대신 별도 `/home` 라우트를 만들고 `/`는 `redirect('/home')`만 수행하도록 분리했습니다.

---

### 컴포넌트 & 디렉토리

> services / hooks 실제 분리는 컴포넌트/훅/서비스의 책임 판단을 `component-review` skill 기준으로 했습니다. '
> 이후 실제 파일이 어느 디렉터리(entities/features/widgets/shared)에 위치하는지는 /fsd-review skill 기준으로 다시 정리했습니다.

---

### ProductFilters 검색어 동기화

**검색어 입력은 draft 로컬 상태로 두고 폼 제출 시에만 URL(`onSearch`)에 반영하되, `useEffect` 없이 렌더 중 `prevAppliedQuery` 비교로 draft를 재동기화합니다.**

- 뒤로/앞으로가기, 공유된 링크로 `q`가 `ProductFilters` 외부(URL)에서 바뀌는 경우 draft state가 이를 못 따라가는 문제가 있습니다. `useState`의 초기값은 최초 마운트 시 한 번만 쓰이기 때문입니다.
- 3주차 때 동일한 문제(`FilterSection` draft 상태)를 `useEffect` 동기화 대신 렌더 중 `prevValue` 비교로 해결했던 패턴을 그대로 재사용했습니다.

---

### nuqs

**`useQueryStates`에 `{ history: 'push' }`를 사용합니다.**

nuqs의 기본값은 `replace`라 URL이 바뀌어도 브라우저 히스토리에 새 항목이 안 쌓이는데, 이렇게 되면 검색어를 여러 번 바꾼 뒤 뒤로가기를 눌러도 이전 검색 조건으로 못 돌아갑니다. 검색·카테고리·정렬·페이지를 바꿀 때마다 히스토리에 쌓여서 뒤로가기/앞으로가기로 이전 조건을 복원할 수 있어야 하기 때문에 `push`로 설정했습니다.

**`shallow`(기본값 `true`), `startTransition`, `limitUrlUpdates`(throttle/debounce), `clearOnDefault`(기본값 `true`)는 전부 기본값 그대로 두고 별도 설정하지 않았습니다. `scroll`은 처음엔 기본값(`false`)을 유지했다가, 이후 `true`로 바꿨습니다.**

---

### Zustand (위시리스트/장바구니)

**sessionStorage 접근을 감싸는 `createWebStorage(type)`는 `'sessionStorage' | 'localStorage'` 두 타입을 모두 지원하도록 남겨뒀습니다. 지금은 sessionStorage만 씁니다.**

당장은 sessionStorage 하나만 필요하지만, 나중에 다른 저장소가 필요해질 가능성을 열어두는 선택을 했습니다.

**`Set` 복사+토글 로직(`toggleSetItem`)과 `Set` 직렬화용 `setReplacer`/`setReviver`는 `src/app/utils.ts`에 공용 함수로 두고, 두 store가 그걸 import해서 씁니다.**

- 둘 다 입력이 같으면 항상 같은 결과가 나오는 순수 함수이고, 위시리스트·장바구니 두 곳에서 완전히 동일하게 필요해서 utils에 넣었습니다.

**store의 액션은 범용 setter(`setWishList(nextOrUpdater)`)가 아니라 `setSingleIdInWishlist(id)`/`setSingleIdInCart(id)`처럼 "토글" 하나로 좁혔습니다.**

**찜/담기 상태를 직관적으로 보여지도록 하기 위해 텍스트 색 + 굵기를 다르게 표현하였습니다.**

---

### Advanced A — 상태 영속화 (version / migrate / 복구 전략)

**`onRehydrateStorage`로 저장값이 깨졌을 때의 복구 전략을 추가했습니다. rehydrate 중 에러(예: JSON 파싱 실패)가 나면 `console.warn`으로 남기고 `persist.clearStorage()`로 손상된 값을 지웁니다.**

에러가 난 상태로 두면 다음 접속 때도 같은 손상된 값으로 계속 rehydrate를 시도해 계속 실패할 수 있어서, 한 번 실패하면 저장소를 비워 다음부터는 깨끗한 기본 상태(빈 `Set`)로 다시 시작하도록 했습니다.

---

### Advanced C — 사용자 경험 개선

Round 5 명세는 C 항목 중 1개 이상 선택하면 되는데, 5개(디바운스, 다음 페이지 prefetch, 이동 전 prefetch, 페이지 변경 중 목록 유지, 오류 재시도)를 전부 적용했습니다.

**페이지 변경 중 기존 목록 유지는 `useQuery`의 `placeholderData: keepPreviousData` 옵션 하나로 구현했습니다.**

TanStack Query가 공식으로 제공하는 옵션이라 별도 상태 관리 없이 페이지 전환 시 로딩 화면 대신 이전 목록을 유지하다 새 데이터로 교체됩니다.

**오류 재시도 UI(`ErrorRetry`)는 Home/목록 두 곳에서 완전히 동일해서 `src/shared/ui/ErrorRetry`로 공용 컴포넌트로 뽑았습니다. `QueryState` 자체는 건드리지 않고, 각 페이지의 `renderError` 콜백이 이미 스코프에 있는 `refetch`를 그대로 넘겨줍니다.**

**다음 페이지 prefetch는 검색어(`q`)와 카테고리(`category`)가 둘 다 기본값일 때만 실행합니다. 정렬(`sort`)은 이 조건에서 제외했습니다.**

- 검색어나 카테고리로 필터링된 결과는 전체 개수가 적어서 다음 페이지가 아예 없을 가능성이 높고, 그런 상태에서 미리 요청을 날리면 낭비가 됩니다.
- 반면 정렬은 결과 개수 자체를 줄이지 않고 순서만 바꾸는 거라 다음 페이지 존재 여부에 영향이 없어서 조건에서 뺐습니다.
- 이 로직은 처음엔 `products/page.tsx`에 있었는데, "페이지네이션 데이터를 다루는 로직"으로 보고 `useProductList` 훅 내부로 옮겨서 페이지 컴포넌트는 단순히 훅을 호출하기만 하면 되도록 정리했습니다.

---

### Advanced B — App Router 서버 프리패치

**모든 페이지가 아니라 Home과 목록(Products) 두 화면에만 프리패치를 적용했습니다.**

두 화면 다 진입 시 항상 필요한 초기 데이터(배너/카테고리/상품)가 있고, 이 데이터를 서버에서 미리 준비해두면 로딩 화면 없이 첫 화면을 보여줄 수 있어 적용했습니다.

---

### Advanced D — 테스트

**테스트 대상 4가지와 실제 작성한 테스트 케이스:**

- **Zustand action/selector** — `src/features/wishlist/model/useWishlistStore.test.ts` (컴포넌트 렌더링 없이 `getState()`/`setState()`를 직접 호출)
  - 처음엔 빈 위시리스트로 시작한다
  - `setSingleIdInWishlist`는 없던 id를 추가한다
  - `setSingleIdInWishlist`는 이미 있는 id면 제거한다 (토글)
  - 여러 id를 서로 독립적으로 관리한다
- **Header 개수 파생** — `src/widgets/header/ui/Header.test.tsx` (`<Header />` 렌더링 후 store를 직접 조작)
  - 위시리스트/장바구니가 비어있으면 0을 보여준다
  - 개수를 별도로 저장하지 않고 store로부터 파생해서 보여준다 (`productIds.size` 사용 여부를 실제 렌더링 결과로 검증)
- **nuqs URL 조건과 query key 일치** — `src/features/product-filter/model/useProductListParams.test.tsx` (`nuqs/adapters/testing`의 `NuqsTestingAdapter`로 가짜 URL 주입)
  - URL에 조건이 없으면 기본값으로 해석되고, 그 값이 query key에도 그대로 반영된다
  - URL에 담긴 조건이 그대로 파싱되고, 그 값이 query key에도 동일하게 반영된다 (`useProductListParams()`가 반환한 값과 `productsQueryOptions(...).queryKey`를 직접 비교)
- **홈·목록 store 동기화** — `src/widgets/product-card/ui/ProductCard.test.tsx` (`<Header />`와 `<ProductCard />`를 같은 화면에 함께 렌더링)
  - `ProductCard`에서 찜을 누르면 `Header` 위시리스트 개수도 같이 바뀐다
  - `ProductCard`에서 담기를 누르면 `Header` 장바구니 개수도 같이 바뀐다 (두 컴포넌트가 같은 Zustand store 인스턴스를 공유한다는 걸 실제 클릭 이벤트로 증명)

**결과: `pnpm test` 46/46 통과(기존 36 + 신규 10), `pnpm lint` 0 에러(경고 30개는 전부 기존 테스트 파일의 매직넘버로 무관), `pnpm build` 정상 통과.**

---

### Pagination — 잘못된 `page` 값 방어

**목록 페이지(`ProductView.tsx`)에서 `page`가 유효 범위를 벗어나면 곧장 초기 페이지(1)로 되돌립니다.**

- `page=9999`처럼 존재하지 않는 페이지(API는 정상 응답하지만 결과가 비어있음)와 `page=000`처럼 애초에 API 검증(`/^[1-9]\d*$/`)에 걸려 400이 나는 경우 둘 다, 사용자가 URL을 잘못 조작한 상황이니 "다시 선택하도록 뒤로 보낸다"는 요구사항에서 출발했습니다.
- 처음엔 `useRef`로 "마지막으로 보고 있던 유효 페이지"를 기억해뒀다가 그 페이지로 되돌리는 3단계(마지막 유효 페이지 → 초기 페이지 → 홈)를 시도했는데, 주소창에 직접 새 URL을 입력하는 건 브라우저 풀 리로드라 `useRef`가 초기화돼 "마지막 페이지 기억"이 애초에 살아남지 못하는 경우가 대부분이었습니다.
- 이걸 살리려면 `sessionStorage` 같은 영속 저장소가 필요했지만, 이 정도 예외 상황 하나를 위해 저장 키 스코프(필터 조합별 구분), 탭/새로고침 간 정합성까지 신경 쓰는 건 과한 설계라고 판단해, 메모리 기억 없이 "잘못된 값이면 바로 초기 페이지로"로 단순화했습니다.

**로딩 중(`isFetching`)에는 `Pagination`을 숨깁니다.**

`placeholderData: keepPreviousData` 때문에 `page=999`에서 초기 페이지로 자동 정정되는 동안, 새 응답이 오기 전까지 이전 응답의 `page`(999)가 그대로 남아 `Pagination`에 "999 / 3"처럼 잘못된 값이 잠깐 보이는 문제가 있었습니다. `productListQuery.isFetching`이 true인 동안은 `Pagination` 자체를 렌더링하지 않는 방식으로 해결했습니다.

---

### nuqs — `scroll: true` 추가

**`useQueryStates`에 `scroll: true`를 추가했습니다.** (기존 `### nuqs` 섹션의 `scroll` 관련 결정 갱신 — 위 참조)

페이지네이션으로 페이지를 옮겼을 때 사용자가 스크롤된 위치 그대로 남아 새 목록 맨 위를 놓치는 문제가 있어서, 필터/페이지 변경 시 자동으로 상단으로 스크롤하도록 바꿨습니다.

## 커밋별 변경 기록

| 커밋      | 날짜       | 무엇을 수정했나                                                                                                                                  | 어떤 기준으로                                                                                                                                                              |
| --------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `580b6d0` | 2026-07-22 | entities/features/widgets/shared로 파일 이관, 역할 없는 index.ts 배럴 전부 제거                                                                  | entities→features 참조 방지(위젯 분리), 재-export가 실제 역할을 하는지 여부로 배럴 존치 판단 (**FSD 레이어 이관**, **index.ts(배럴) 정리 원칙** 참조)                      |
| `7c836bb` | 2026-07-22 | `providers.tsx`의 `NuqsAdapter`를 `Suspense`로 감싸 `useSearchParams()` 프리렌더 에러 해결                                                       | 페이지별 View/Suspense 분리 대신 `MainProvider` 한 곳에서 감싸는 방식으로 통합 (**nuqs 사용 페이지의 Suspense 컨벤션** 참조)                                               |
| `df76d43` | 2026-07-22 | 과제 체크리스트(기본 항목) 점검                                                                                                                  | 구현 완료 항목 체크, 별도 설계 판단 없음                                                                                                                                   |
| `1873d23` | 2026-07-22 | 위시리스트/장바구니 store에 `persist`(`version`/`migrate`/`onRehydrateStorage`) 적용                                                             | 새로고침 시 상태가 사라지지 않아야 함 (**Advanced A — 상태 영속화** 참조)                                                                                                  |
| `46f4ba7` | 2026-07-22 | 검색어 디바운스, 다음 페이지·이동 전 prefetch, 페이지 변경 중 목록 유지, 오류 재시도 UI 추가                                                     | Advanced C 5개 항목 전부 적용 (**Advanced C — 사용자 경험 개선** 참조)                                                                                                     |
| `901822f` | 2026-07-22 | 과제 체크리스트(Advanced 항목) 점검                                                                                                              | 구현 완료 항목 체크, 별도 설계 판단 없음                                                                                                                                   |
| `2fefc74` | 2026-07-23 | Home/목록에 Server Component `prefetchQuery` + `dehydrate`/`HydrationBoundary` 적용, `ProductView`/`HomeView`로 분리                             | 요청별 QueryClient, 서버·클라이언트가 동일 `queryOptions` 공유해 중복 요청 방지 (**Advanced B — App Router 서버 프리패치** 참조)                                           |
| `7f563ee` | 2026-07-23 | Zustand/Header/nuqs/ProductCard 테스트 4개 작성, Vitest Browser Mode(Playwright)로 전환                                                          | jsdom 시뮬레이션 대신 실브라우저 검증, `test.projects`로 node/browser 분리 (**Advanced D — 테스트** 참조)                                                                  |
| `9b61c0e` | 2026-07-23 | `ProductView`의 잘못된 `page` 값 방어 로직 단순화(재시도 카운트·홈 리다이렉트 제거), `isFetching` 중 `Pagination` 숨김, nuqs `scroll: true` 추가 | `page`가 1이 되면 더 이상 `setPage`가 호출되지 않아 무한 루프 걱정 없이 단순화 가능함을 확인 (**Pagination — 잘못된 `page` 값 방어**, **nuqs — `scroll: true` 추가** 참조) |
| `5ac1ff7` | 2026-07-24 | `fsd-review` skill 문서(`DOMAINS.md`, `SKILL.md`) 추가                                                                                           | 애플리케이션 설계 결정이 아닌 리뷰 도구 설정                                                                                                                               |
