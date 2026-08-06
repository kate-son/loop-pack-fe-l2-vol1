# 7주차 제출 체크리스트 점검

각 단계 체크 항목을 **저장된 문서·캡처·실측**과 대조한 기록이다. 충족하지 못했거나 조건을 바꿔 해석한 항목은 숨기지 않고 이유와 함께 남긴다.

| 표기 | 뜻                                                    |
| ---- | ----------------------------------------------------- |
| ✅   | 충족                                                  |
| ⚠️   | 조건을 바꿔 해석했거나 한계가 남음 — 근거를 함께 기록 |
| ❌   | 미충족                                                |

---

## 0단계 / Before

| 항목                                                                               | 결과 | 근거                                                                                                                                               |
| ---------------------------------------------------------------------------------- | ---- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| production build에서 같은 조건으로 Before/After 측정                               | ✅   | 전 라운드 `pnpm build && pnpm start`                                                                                                               |
| Before/After SHA 기록, SHA 외 조건 동일                                            | ⚠️   | SHA는 [Part 0](./week07-part0/README.md)·[Part 1](./week07-part1/README.md)에 기록. 다만 **조건을 완전히 같게 두지 못한 구간이 있었다**(아래 참고) |
| FCP·LCP·CLS 5회 raw + 중앙값·최솟값·최댓값                                         | ✅   | Part 0–2의 모든 라운드 표                                                                                                                          |
| URL·행동·viewport·throttling·브라우저/LH 버전·load 조건·브라우저 프로필 동일       | ⚠️   | 위와 같은 사유                                                                                                                                     |
| LCP element·waterfall·filmstrip 확인                                               | ✅   | Part 1 `lcp-discovery-insight`·`network-requests`, Part 0–2 filmstrip                                                                              |
| DevTools에서 LayoutShifts와 document·API·image의 URL·전송 크기·요청 시작 시점 확인 | ✅   | Part 2의 `LayoutShift` `impacted_nodes` 분석, 요청 타임라인 표                                                                                     |
| 측정 흔들림보다 큰 변화인지 설명 가능                                              | ✅   | 라운드마다 "오차범위 내"인지 명시                                                                                                                  |

### ⚠️ 조건을 완전히 통제하지 못한 두 가지 (기록 유지)

1. **측정 URL이 라운드마다 달랐다** — Round 0은 `/products`, Round 1은 `?category=fashion`, Round 2는 `?page=2`였다. 같은 URL끼리만 비교 가능하다는 점을 [Part 2](./week07-part2/README.md) Round 7 절에 명시했다.
2. **이미지 변환 캐시 상태를 통제 항목에 넣지 않았다** — `next/image` 변환은 캐시 히트 여부에 따라 232ms vs 1.6ms로 갈리는데(실측), 이를 고정하지 않아 라운드 간 LCP 비교가 오염됐다. 이 때문에 한 번은 **"스켈레톤이 432ms 악화"라는 잘못된 결론을 냈다가 철회**했다. 경위는 Part 2 Round 7 절에 그대로 남겼다.

---

## 1단계 / Hero LCP

| 항목                                                    | 결과 | 근거                                                                                                               |
| ------------------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------ |
| 고용량 Hero 원본을 쓴 Before를 먼저 남김                | ✅   | 원본 `hero-original.jpg` 7.5MB 기준 Before                                                                         |
| 표시 크기·전송 크기·요청 시작 시점과 LCP 구간 확인      | ✅   | Part 1 "전송 크기 변화" 표, `lcp-breakdown-insight` 4구간                                                          |
| 시각적 역할·품질을 유지하며 실제 병목 감소              | ✅   | 최종적으로 **quality는 75 유지**. 크롭·치수 정리로만 절감                                                          |
| `next/image` 사용 여부가 아니라 실제 요청·LCP 결과 확인 | ✅   | 매 라운드 `network-requests`의 실제 `w=` 값과 transferSize로 판정                                                  |
| Header·`h1`·페이지 설명이 느린 Hero와 함께 막히지 않음  | ⚠️   | **막히지 않는다는 조건은 충족**(`PageHeading`을 `QueryState` 밖으로 이동). 다만 **`h1`이 아니라 `h2`** — 아래 참고 |
| fallback 교체가 눈에 띄는 layout shift를 만들지 않음    | ✅   | 스켈레톤과 실제 콘텐츠의 그리드 시작 y좌표가 **1px 차이**, CLS 0.000                                               |

### ⚠️ `h1` 대신 `h2`를 쓴 이유

`PageHeading`은 홈·상품목록이 공유하는 히어로 컴포넌트이고, 그 제목은 **페이지 전체의 이름이 아니라 히어로라는 한 구획의 제목**이다. 여기에 `h1`을 붙이면 "이 페이지의 주제는 배너"라고 말하는 마크업이 된다. 또 공통 컴포넌트에 heading level prop을 넣는 것은 "공통 컴포넌트는 페이지 사정을 모른다"는 이 프로젝트의 설계 원칙과 충돌한다.

대신 **"하나의 명확한 페이지 제목"이라는 의도는 충족**시켰다 — 페이지당 `h2`가 정확히 하나이고(홈의 섹션 제목은 `h3`로 내림), 그 아래로 `h3`가 이어진다. 자세한 판단 근거는 [Part 3](./week07-part3/README.md) "결정" 절에 있다.

---

## 2단계 / 목록과 CLS

| 항목                                                              | 결과 | 근거                                                                                                                    |
| ----------------------------------------------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------- |
| 6개 화면을 구분                                                   | ✅   | 데이터 없는 최초 진입(스켈레톤)·갱신 중(pending 오버레이)·0건·최초 실패·갱신 실패(목록 유지+인라인 에러)·취소 모두 캡처 |
| 현재 URL의 active query와 화면 일치, 늦은 완료가 화면을 덮지 않음 | ✅   | 카테고리 3연속 변경 후 URL·`<select>`·개수 모두 마지막 선택과 일치                                                      |
| 취소된 요청을 별도 관찰, 오류로 보이지 않게 함                    | ✅   | `AbortSignal` 연결 후 Network 탭에서 `(canceled)` 확인. `AbortError`는 에러 문구로 변환하지 않도록 회귀 테스트로 고정   |
| 서버 응답을 Zustand·로컬 상태에 복사하지 않음                     | ✅   | zustand store는 `productIds: Set<string>`(사용자의 찜·장바구니 선택)만 보유. 서버 응답은 React Query 캐시가 단일 출처   |
| fallback과 실제 콘텐츠 교체에서 CLS 없음                          | ✅   | cold load CLS **0.000**(5회 전부). 스켈레톤 → 실제 목록 교체 시 그리드·Pagination 좌표 1px 차이                         |

> 검색 시나리오 CLS는 두 조건(스크롤 맨 위 / 스크롤 유지) 모두 `LayoutShift` 0건을 확인했다. 주된 이유가 "화면 밖이라 채점 안 됨"이 아니라 **카드 리키잉으로 이동 자체가 발생하지 않기 때문**임을 Round 5에서 분리 확인했다.

---

## 3단계 / metadata와 Open Graph

| 항목                                                                                          | 결과 | 근거                                                                                                                                                                         |
| --------------------------------------------------------------------------------------------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 서버 metadata 경로 확인                                                                       | ⚠️   | 경로가 다르다 — 과제 문서는 `src/app/(commerce)/…`, 이 리포지토리는 **`src/app/layout.tsx`·`src/app/(home)/page.tsx`·`src/app/products/page.tsx`**. 세 파일 모두 확인·수정함 |
| JS 실행 전에도 제목·설명·주요 링크·구조 확인 가능                                             | ✅   | `curl`로 받은 document Response에 `<title>`·`description`·`href` 4개·`<main>`·`h2` 포함                                                                                      |
| 콘텐츠·탐색·상품 영역 역할이 마크업에 드러남, `href` 링크·의미 있는 대체 텍스트               | ✅   | `<main>`·`<header>`·`<nav aria-label>`·`<section aria-label>`, `<Link href>`, 상품 `alt={product.name}`·장식 히어로 `alt=""`                                                 |
| 루트 title template·공통 OG와 페이지 metadata 합성                                            | ✅   | `%s \| Commerce` 적용 확인                                                                                                                                                   |
| shallow merge에도 `siteName`·`locale`·`type` 유지                                             | ✅   | 4개 시나리오 전부 `Commerce / ko_KR / website` 유지(`COMMON_OPEN_GRAPH`를 명시적으로 펼쳐 사용)                                                                              |
| 홈·목록 metadata가 본문 prefetch와 같은 query factory 응답 사용                               | ✅   | `homeQueryOptions()` / `loadProductSearchParams` + `productsQueryOptions` 공유                                                                                               |
| 검색어 우선 title, category·sort description, 2페이지 이상 page 번호                          | ✅   | `'셔츠' 검색 결과`, `패션, 가격 낮은순 · 전체 6개…`, `상품 목록 (2페이지)`                                                                                                   |
| 정상 empty는 조건·0개 설명 + fallback image 유지, query failure는 root 상속                   | ✅   | ②는 `조건에 맞는 상품이 0개입니다` + `og-default.jpg` / ③은 페이지 metadata 미생성 → 루트 상속                                                                               |
| metadata와 본문이 같은 query factory·GET URL·options 사용                                     | ✅   | 서버 계수 **요청당 1회**가 그 증거                                                                                                                                           |
| `getQueryClient()`가 호출마다 새 인스턴스, 동일 native fetch만 memoization 대상임을 설명      | ✅   | `cache(() => new QueryClient())` 유지(요청 단위, singleton 아님). memoization 조건은 Part 3 "성능 개선 방향"에 설명                                                          |
| 모든 페이지가 기본 색인 가능 상태 유지                                                        | ✅   | `robots` 메타 없음                                                                                                                                                           |
| Browser Network만으로 판정하지 않고 서버 측 계수로 확인 후 계측 되돌림                        | ✅   | Route Handler 임시 로그로 계수 → 소스·빌드 산출물 양쪽에서 제거 확인                                                                                                         |
| normal·정상 empty·metadata query failure의 document 증거                                      | ✅   | [`week07-part3/captures/`](./week07-part3/captures/) 5건                                                                                                                     |
| `APP_ORIGIN`을 build·runtime에 같은 값으로 두고, localhost OG URL을 **배포 증거로 쓰지 않음** | ✅   | 아래 참고                                                                                                                                                                    |
| 일반 document 요청과 `facebookexternalhit`의 metadata 응답 시점 비교                          | ✅   | TTFB **0.007s vs 0.514s**                                                                                                                                                    |

### `APP_ORIGIN`과 localhost URL에 대한 명시

- **build와 runtime에 같은 값**을 넣었다. 정상 관찰은 `APP_ORIGIN=http://localhost:3000`, 실패 재현은 `APP_ORIGIN=http://127.0.0.1:9`로 **양쪽 명령 모두** 동일하게 지정했다.
- 저장된 document의 `og:url`·`og:image`에는 `http://localhost:3000/…`가 찍혀 있다. 이는 **로컬 재현 증거**이며 **배포된 서비스의 Open Graph URL이 아니다.** 실제 배포 시에는 `APP_ORIGIN`에 배포 origin을 넣어야 `metadataBase`가 그 값으로 확장된다.
- 서버 전용 값이므로 `NEXT_PUBLIC_` 접두사를 떼어 **클라이언트 번들에 값이 실리지 않게** 했다.

### 계측을 되돌린 기록

Route Handler에 넣은 임시 로그(`console.error('[CNT-…]')`)는 관찰 후 제거했고, **소스와 `.next` 빌드 산출물 양쪽에서 해당 문자열이 없음**을 확인했다.

> 계측 중 걸린 점: `next.config.ts`의 `removeConsole`이 프로덕션 빌드에서 `console.*`를 제거하되 `error`만 남기도록 돼 있어, 처음 쓴 `console.warn`은 빌드에서 사라져 아무것도 세지 못했다. `console.error`로 바꿔야 계수가 잡혔다.

---

## 종합

| 단계              | ✅  | ⚠️  | ❌  |
| ----------------- | --- | --- | --- |
| 0단계 Before      | 5   | 2   | 0   |
| 1단계 Hero LCP    | 5   | 1   | 0   |
| 2단계 목록·CLS    | 5   | 0   | 0   |
| 3단계 metadata·OG | 14  | 1   | 0   |

**미충족(❌)은 없다.** ⚠️ 4건은 모두 "조건을 바꿔 해석했거나 한계가 남은" 항목이며, 각각의 이유를 위에 기록했다.

- 0단계 ⚠️ 2건 — 측정 URL과 이미지 캐시 상태를 통제하지 못한 구간이 있었고, 그로 인해 한 번 잘못된 결론을 냈다가 철회한 경위까지 남겼다.
- 1단계 ⚠️ 1건 — `h1` 대신 `h2`. 회피가 아니라 이 레이아웃에서 더 정확한 마크업을 선택한 결과이며, "하나의 명확한 페이지 제목"이라는 의도는 충족했다.
- 3단계 ⚠️ 1건 — 과제 문서의 경로(`(commerce)`)와 이 리포지토리의 경로가 다르다. 대응되는 세 파일을 모두 확인·수정했다.
