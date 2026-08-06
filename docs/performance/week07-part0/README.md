# Part 0 — Before 측정 결과

- **HeroSection 연결 상태**: 과제가 제공한 `HeroSection`(raw `<img>`, 미최적화 원본)은 `PageHeading`으로 통합되어 홈(`/`)·상품목록(`/products`) 양쪽에 이미 연결되어 있고, 원본 이미지도 최적화하지 않은 상태 그대로다
- **commit SHA**: `61214ccabb448fa70910566295958d78036f8e87`(Part 0 측정 시점, Part 1 시작 전)
- **측정 도구**: Lighthouse CLI `13.4.1` (`npx lighthouse --preset=desktop`), Chrome headless(`--headless=new`)
- **throttling**: Lighthouse desktop 프리셋 기본값(`simulate`, RTT 40ms, downlink 10,240Kbps≈1,280KB/s, CPU 배속 없음)
- **브라우저 버전**: Google Chrome `150.0.7871.187` (Lighthouse가 띄운 헤드리스 인스턴스와 동일 바이너리 — `/Applications/Google Chrome.app`)
- **viewport**: `--preset=desktop` → **데스크톱 에뮬레이션**(`1350×940`, `deviceScaleFactor 1`, `mobile: false`)
- **측정 일시**: 데스크톱 재측정 2026-08-05(UTC)
- **실행 방식**: `pnpm build && pnpm start` 이후 `http://localhost:3000/`, `http://localhost:3000/products` 각각 cold load 5회(매 회 새 headless Chrome 인스턴스, 캐시 없음)
- **눈으로 보는 리포트(이 커밋에 포함됨)**: [`./lighthouse/home/run-1.html`](./lighthouse/home/run-1.html), [`./lighthouse/products/run-1.html`](./lighthouse/products/run-1.html) — run-1의 원본 JSON을 Lighthouse 자체 리포트 생성기로 변환한 파일(데스크톱 모드). 인터넷 연결이나 외부 업로드 없이 브라우저로 더블클릭해서 열면 익숙한 점수 화면(성능 점수, filmstrip, opportunities 등)을 그대로 볼 수 있다. run-2–5는 raw 값이 표에 이미 있어 대표로 run-1만 변환함

---

## DevTools에서 볼 것 — 체크리스트

과제 문서가 명시한 4개 확인 항목과 실제로 확인한 방법·근거.

| 도구        | 확인할 것                                           | 상태 | 확인 방법·근거                                                                                                                                                                                                                                                          |
| ----------- | --------------------------------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lighthouse  | LCP element                                         | ✅   | Lighthouse `lcp-breakdown-insight` 오디트로 특정 → [LCP element / waterfall](#lcp-element--waterfall-홈-run-1-기준)                                                                                                                                                     |
| Performance | filmstrip의 표시 순서                               | ✅   | CDP `Page.captureScreenshot`로 홈·상품목록 각 10프레임 실측 → [홈 filmstrip](#홈--filmstrip-데스크톱-throttle), [상품목록 filmstrip](#상품-목록--홈과-같은-데스크톱-throttle-조건으로-filmstripvitals-재확인)                                                           |
| Performance | Layout Shifts                                       | ✅   | Lighthouse CLS 수치(0.000) + CDP `Tracing`으로 뜬 실제 트레이스의 `LayoutShift` 이벤트 수(0건) 이중 확인 → [LCP element / waterfall](#lcp-element--waterfall-홈-run-1-기준)의 "Layout Shifts 트랙 직접 확인" 항목                                                       |
| Network     | document·API·image의 URL, 전송 크기, 요청 시작 시점 | ✅   | Lighthouse `network-requests` 오디트(이미지 `transferSize=7,545,525 bytes`) + Playwright 네트워크 로그(API 요청/응답 타이밍) → [LCP element / waterfall](#lcp-element--waterfall-홈-run-1-기준), [상품 목록 재현 섹션들](#상품-목록--최초-진입데이터-없는-첫-로딩-재현) |

---

## 홈 (`/`) — 5회 raw 값 (데스크톱 모드)

| run        | FCP(ms)   | LCP(ms)     | CLS       |
| ---------- | --------- | ----------- | --------- |
| 1          | 245.8     | 6,745.8     | 0.000     |
| 2          | 244.9     | 6,744.9     | 0.000     |
| 3          | 245.1     | 6,745.1     | 0.000     |
| 4          | 245.6     | 6,745.6     | 0.000     |
| 5          | 245.5     | 6,745.5     | 0.000     |
| **중앙값** | **245.5** | **6,745.5** | **0.000** |
| 최솟값     | 244.9     | 6,744.9     | 0.000     |
| 최댓값     | 245.8     | 6,745.8     | 0.000     |

---

## 상품 목록 (`/products`) — 5회 raw 값 (데스크톱 모드)

| run        | FCP(ms)   | LCP(ms)     | CLS       |
| ---------- | --------- | ----------- | --------- |
| 1          | 246.7     | 6,586.7     | 0.000     |
| 2          | 245.5     | 6,605.5     | 0.000     |
| 3          | 244.6     | 6,604.6     | 0.000     |
| 4          | 246.2     | 6,626.2     | 0.000     |
| 5          | 244.9     | 6,624.9     | 0.000     |
| **중앙값** | **245.5** | **6,605.5** | **0.000** |
| 최솟값     | 244.6     | 6,586.7     | 0.000     |
| 최댓값     | 246.7     | 6,626.2     | 0.000     |

---

## `/products` URL 쿼리 변경별 성능 (category/sort/검색/page, 데스크톱 모드)

`/products`는 검색·카테고리·정렬·페이지 조건에 따라 초기 HTML(SSR prefetch로 채워지는 상품 데이터)이 달라진다. 조건이 바뀌어도 Lighthouse 지표가 달라지는지 각 조건별로 cold load 3회씩 측정했다(기본값인 무조건 `/products`는 위 5회 결과를 기준선으로 사용). 눈으로 보는 HTML 리포트(조건별 run-1 대표, 이 커밋에 포함됨): [`category`](./lighthouse/products-query/category/run-1.html), [`sort`](./lighthouse/products-query/sort/run-1.html), [`search`](./lighthouse/products-query/search/run-1.html), [`page2`](./lighthouse/products-query/page2/run-1.html)

| 쿼리 조건            | URL                         | FCP 중앙값(ms) | LCP 중앙값(ms) | CLS 중앙값 |
| -------------------- | --------------------------- | -------------- | -------------- | ---------- |
| 기준(쿼리 없음, n=5) | `/products`                 | 245.5          | 6,605.5        | 0.000      |
| 카테고리 필터        | `/products?category=casual` | 244.2          | 6,564.2        | 0.000      |
| 정렬                 | `/products?sort=price-desc` | 244.7          | 6,605.6        | 0.000      |
| 검색                 | `/products?q=셔츠`          | 243.4          | 6,543.4        | 0.000      |
| 페이지네이션         | `/products?page=2`          | 244.1          | 6,624.1        | 0.000      |

**결론**: 쿼리 조건을 바꿔도 FCP·LCP·CLS가 사실상 동일하다(차이는 전부 측정 흔들림 수준인 수백ms 이내). **LCP 요소를 확인해보니 조건이 달라져도 항상 같은 `PageHeading`의 hero 이미지**(`body > main.week05-page > section...hero > img...image`)였다 — 상품 그리드나 필터 결과 자체는 LCP 후보가 아니다. 즉 `/products`의 성능 병목은 검색·카테고리·정렬·페이지 로직과 무관하게 **오직 hero 이미지 하나**이며, Part 1에서 그 이미지만 고치면 쿼리 조건에 상관없이 모든 `/products` 변형이 동시에 좋아진다.

---

## LCP element / waterfall (홈, run-1 기준)

- **LCP element**: `body > main.week05-page > section.PageHeading-module__..._hero > img.PageHeading-module__..._image` — `PageHeading`의 raw `<img src="/images/week-07/hero-original.jpg" width="3840" height="2160">`
- **network-requests 오디트에서 해당 이미지**: `transferSize=7,545,525 bytes`(≈7.5MB). 로컬(비throttled) 환경이라 실제 전송 자체는 178ms 만에 끝났다. 하지만 Lighthouse는 이 실측값을 그대로 쓰지 않고 "이 파일 크기를 가상의 회선으로 받았다면 몇 초 걸렸을까"를 계산해서 최종 LCP로 보여준다 — desktop 프리셋의 기본 downlink는 10,240Kbps(≈1,280KB/s)이고, **7.5MB를 1,280KB/s로 나누면 약 5.9초가 나온다. 실측 LCP(중앙값 6.6초)는 여기에 TTFB·연결 수립 등 오버헤드(≈0.7–0.8초)가 더해진 값으로, 계산치와 방향이 일치한다.**
- **document·홈 데이터·Hero 이미지 요청 시작 순서(로컬/비throttled 기준, Lighthouse run-1의 `network-requests` 오디트)**:

  | 순서 | 리소스                           | 시작 시점          | 전송 크기                | 비고                                                                                                                                                                                                                                                                         |
  | ---- | -------------------------------- | ------------------ | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | 1    | `document` (`/`)                 | t=0ms              | 5,469 bytes              | SSR된 HTML 셸 자체. **"홈 데이터"(배너/카테고리/상품)는 별도 API 요청이 아니라 이 문서 안에 이미 포함되어 내려온다** — `(home)/page.tsx`가 서버에서 `prefetchQuery` 후 `HydrationBoundary`로 감싸 내려주기 때문에 브라우저 입장에서 "홈 데이터"만 따로 fetch하는 요청은 없다 |
  | 2    | 폰트·CSS·JS 청크·**Hero 이미지** | t≈45ms             | 이미지는 7,545,525 bytes | document 응답을 파싱한 브라우저의 preload scanner가 한꺼번에 발견해 거의 동시에 요청을 시작함(45.3–45.6ms 사이) — Hero 이미지가 다른 리소스보다 특별히 늦게 발견되는 건 아니었다                                                                                             |
  | —    | Hero 이미지 완료                 | t≈179ms(로컬 기준) | —                        | 발견은 빠르지만(45ms), **크기(7.5MB)가 압도적으로 커서** 데스크톱 시뮬레이션 회선에서는 이 지점부터 6–7초 가까이 걸리는 것                                                                                                                                                   |

  즉 "Hero 이미지 요청이 늦게 시작돼서" 느린 게 아니라, **거의 즉시(45ms) 발견·요청되는데도 파일 자체가 너무 커서 전송에 오래 걸리는 것**이 확정적인 원인이다.

- **CLS 0.000인 이유**: `<img>`에 `width={3840}`/`height={2160}`가 명시돼 있어 로드 전에도 `aspect-ratio`로 공간이 이미 확보됨(레이아웃 이동 자체가 없음) — 이 부분은 이미 잘 되어 있어 Part 4에서 회귀만 확인하면 됨
- **Layout Shifts 트랙 직접 확인(추가 검증)**: Lighthouse의 CLS 수치만이 아니라, DevTools Performance 패널이 쓰는 것과 같은 CDP `Tracing` API로 홈·상품목록 각각 6초짜리 실제 성능 트레이스를 떴다(같은 throttle 조건). 트레이스 안의 `LayoutShift` 이벤트를 세어보니 **둘 다 0건** — Lighthouse 수치와 정확히 일치. 이 `.json` 파일은 Chrome DevTools의 Performance 패널(Load profile) 확인시 "Layout shifts" 트랙을 직접 눈으로 봐도 아무 것도 안 뜬다(이벤트 자체가 없으므로).

---

## 관찰 사실 → 가설 → 반증 방법 → 최소 변경안

| 관찰한 사실                                                        | 원인 가설                                                                                                                 | 반증할 측정                                                                                                                                                                                                                                                           | 가장 작은 변경                                                                                                                                                                                                                                           |
| ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 홈·상품목록 모두 LCP가 6–7초대로 동일하게 나쁨(데스크톱 모드 기준) | `PageHeading`이 두 페이지에 공통으로 내려주는 `hero-original.jpg`(7.5MB, 미최적화)가 LCP 후보이자 병목 그 자체            | "이미지 용량(7.5MB) ÷ 이번 측정의 다운로드 속도"로 계산한 예상 소요 시간이, 실제 관측된 LCP 시간과 비슷한지 비교 → 계산값과 실측값이 거의 같음(가설 확정)                                                                                                             | ① 이미지를 실제 표시 크기(카드 최대 폭)에 맞는 크기·포맷(WebP/AVIF)으로 재인코딩하거나 `next/image`로 반응형 srcset 제공 ② `<link rel="preload">` 또는 `next/image`의 `priority`(`fetchpriority="high"`)로 이 이미지를 더 일찍·우선 요청하도록 힌트 추가 |
| FCP는 245ms 전후(데스크톱 모드)로 낮고 안정적                      | Header·타이틀 텍스트는 이미지와 무관하게 먼저 그려지고 있어, 셸 자체가 막히는 문제(Part 2가 다루는 유형)는 현재 거의 없음 | `(home)/page.tsx`가 `await prefetchQuery`로 셸까지 막는 구조인데도 FCP가 낮은 이유는, prefetch 자체는 500ms(기본 scenario) 정도라 텍스트 렌더링엔 큰 영향이 없기 때문으로 추정 — `scenario=slow`(1.5s)로 강제했을 때도 FCP가 유지되는지 반증 필요(다음 측정에서 확인) | 아직 불필요 — 반증 후 결정                                                                                                                                                                                                                               |
| CLS는 두 페이지 다 0.000                                           | `<img>`에 `width`/`height`가 명시돼 있어 레이아웃 이동이 없음                                                             | 이미지 교체 전후 Layout Shifts track 확인(브라우저 도구 필요)                                                                                                                                                                                                         | 불필요(이미 만족)                                                                                                                                                                                                                                        |

---

## 실제 브라우저(Playwright+Chromium) 확인 — 브라우저 확장 없이 devDependency로 보완, 데스크톱 throttle 조건

CDP `Network.emulateNetworkConditions`로 Lighthouse desktop 프리셋과 동일한 조건(RTT 40ms, downloadThroughput/uploadThroughput 모두 10,240Kbps≈1,280KB/s)을 직접 재현하고, `Page.captureScreenshot`(폰트 대기 없는 CDP 직접 호출)로 filmstrip을, `PerformanceObserver`로 실제 FCP/LCP 항목을 확보했다.

### 홈 — filmstrip (데스크톱 throttle)

| 프레임 | 시점      | 파일 크기 | 내용                                                                                 |
| ------ | --------- | --------- | ------------------------------------------------------------------------------------ |
| 0      | t=30ms    | 22.3KB    | 셸 렌더 시작                                                                         |
| 2      | t=1,153ms | 230.4KB   | **셸 이미 완성**(헤더, hero 텍스트 카드), hero 이미지는 위쪽 일부만 progressive 렌더 |
| 5      | t=4,164ms | 934.2KB   | 이미지 약 70–75% 진행(하단 상품 진열대까지 보이기 시작)                              |
| 8      | t=6,376ms | 1,360.3KB | **이미지 완전히 로드 완료** — Lighthouse LCP 중앙값(6,745.5ms)과 자릿수·시점이 일치  |

**결론**: 셸은 여전히 1초 안에 완성되지만, 데스크톱 대역폭(≈1,280KB/s)에서는 히어로 이미지도 progressive하게 채워지다 6.3–6.4초 무렵 완전히 로드된다 — 모바일 조건(5초에도 10–15%)과 달리 눈으로도 "다 채워지는 지점"이 명확히 보인다.

### 홈 — `PerformanceObserver`로 실측한 FCP/LCP (데스크톱 throttle)

```json
{ "fcp": 216, "lcp": 6352, "lcpElement": "IMG.PageHeading-module__S_BsOq__image" }
```

- **FCP 216ms**: Lighthouse 중앙값(245.5ms)과 같은 자릿수.
- **LCP 6352ms, lcpElement = hero `<img>`**: Lighthouse 중앙값(6,745.5ms)과 오차 ±400ms 이내로 근접 — 시뮬레이션 값과 실제 브라우저 관측값이 방향뿐 아니라 자릿수까지 일치함을 확인.

### 상품 목록 — 홈과 같은 데스크톱 throttle 조건으로 filmstrip·vitals 재확인

| 프레임 | 시점      | 파일 크기 | 내용                                                                                     |
| ------ | --------- | --------- | ---------------------------------------------------------------------------------------- |
| 12     | t=1,678ms | 307.8KB   | 셸·필터·상품 그리드 전부 완성. hero 이미지 자리는 아직 배경색만                          |
| 17     | t=6,700ms | 1,426.0KB | **hero 이미지 완전히 로드 완료** — Lighthouse LCP 중앙값(6,605.5ms)과 자릿수·시점이 일치 |

```json
{ "fcp": 156, "lcp": 6608, "lcpElement": "IMG.PageHeading-module__S_BsOq__image" }
```

**결론**: FCP 156ms, LCP 6608ms(lcpElement = hero `<img>`) — Lighthouse 중앙값(FCP 245.5ms, LCP 6,605.5ms)과 방향·자릿수 모두 일치. `/products`도 홈과 완전히 같은 원인(hero 이미지)·같은 정도로 LCP가 결정된다는 걸 데스크톱 조건 실측으로도 재확인했다.

---

### 상품 목록 — 최초 진입(데이터 없는 첫 로딩) 재현

Playwright의 `page.route()`로 `/api/products` 요청에 `scenario=slow`를 항상 주입해 강제 재현했다.

```json
[
  { "type": "request", "url": ".../api/products?sort=latest&page=2&pageSize=12", "t": 618 },
  {
    "type": "response",
    "url": ".../api/products?...&page=2...&scenario=slow",
    "status": 200,
    "t": 2127
  }
]
```

- `page.route()`로 주입한 응답까지 **2127 − 618 = 1509ms** — 강제 주입한 1.5초 지연이 정확히 재현됨.
- `page.route()`가 가로챈 이 요청은 `page=2`(다음 페이지) 요청이다 — `useProductList`의 "다음 페이지 자동 prefetch"가 초기 진입 직후 바로 발동한 것을 실측으로 확인(5주차 결정대로 정상 동작 중).
- `page.route()`로 지연을 강제 주입한 상태에서 찍은 `products-initial-0–5.png` 6장이 전부 같은 파일 크기(1,208,755 bytes)로 동일 — 로딩 대기 구간 동안 화면이 시각적으로 전혀 안 바뀌고 있다는 뜻(“실제 목록 크기를 예상할 수 있는 pending UI”가 아직 없다는 Part 2 gap과 일치).
- 같은 테스트에서 카테고리 텍스트 링크를 셀렉터로 못 찾음 — `/products` 화면엔 카테고리 이동 링크가 없고(카테고리 이동은 홈에서만), `ProductFilters`는 텍스트 링크가 아닌 `<select name="category">`로 구성돼 있었다. 실제 셀렉터(`select[name="category"]`)를 확인해 재시도했다(아래).

### 상품 목록 — 기존 목록이 있는 갱신(카테고리 변경) 재현

`ProductFilters`의 실제 마크업(`<select name="category">`)을 확인하고 `page.selectOption('select[name="category"]', 'casual')`로 카테고리를 "전체" → "캐주얼"로 바꿔 갱신 구간을 다시 녹화했다(`products-refetch-{before,0..5,after}.png`, `products-refetch-network-log.json`).

```json
{
  "request": {
    "url": ".../api/products?category=casual&sort=latest&page=1&pageSize=12",
    "t": 4773
  },
  "response": { "url": "...&scenario=slow", "status": 200, "t": 6278 }
}
```

- 응답까지 **6278 − 4773 = 1505ms** — 이번에도 강제 주입한 1.5초 지연이 정확히 재현됨.
- **`products-refetch-before.png`**: 카테고리 "전체", 총 30개, 1페이지 그리드가 정상 표시된 상태.
- **`products-refetch-1.png`(응답 도착 전, 갱신 대기 중)**: 카테고리 셀렉트는 이미 "캐주얼"로 바뀌어 있는데, **아래 상품 그리드와 "총 30개" 문구는 여전히 "전체" 카테고리의 기존 11개 그대로**다. 즉 필터 UI는 즉시 반응하지만, 그 아래 목록은 새 응답이 올 때까지 이전 상태를 그대로 보여준다 — 갱신 중이라는 표시가 전혀 없어 "선택은 캐주얼인데 목록은 전체"인 상태로 잠깐 보인다.
- **`products-refetch-after.png`(응답 도착 후)**: "총 6개"로 정확히 캐주얼 카테고리만 반영된 목록으로 교체됨.
- **결론**: 데이터 정합성 자체는 문제없다(최종적으로 정확한 결과로 갱신됨). 다만 1.5초 동안 "필터는 바뀌었는데 목록은 안 바뀐" 눈에 띄는 불일치 구간이 그대로 노출된다 — Part 2가 요구하는 "갱신 중임을 보여주는 표시"가 없다는 gap을 화면으로 직접 확인했다.

### 상품 목록 — 빠른 연속 필터 변경 시 URL/화면 일치, 그리고 "취소된 요청" 관찰

카테고리를 "캐주얼" → "패션" → "홈"으로 200ms 간격으로 빠르게 3번 연속 변경해, (1) 최종 URL·화면이 마지막 선택과 일치하는지 (2) 먼저 보낸(이제는 쓸모없어진) 요청이 늦게 끝나도 화면을 덮지 않는지 관찰했다(`products-race-network-log.json`).

```json
[
  { "category": "casual", "type": "request", "t": 4549 },
  { "category": "fashion", "type": "request", "t": 4755 },
  { "category": "home", "type": "request", "t": 4964 },
  { "category": "casual", "type": "response", "t": 6054 },
  { "category": "fashion", "type": "response", "t": 6260 },
  { "category": "home", "type": "response", "t": 6471 }
]
```

- **최종 상태**: URL `?category=home`, 카테고리 셀렉트 값 `home`, 화면 문구 `총 6개` — 셋 다 마지막으로 선택한 "홈" 카테고리와 정확히 일치. `casual`/`fashion` 응답이 `home` 응답보다 먼저 도착했든 나중이든(실제로는 시작 순서 그대로 casual→fashion→home 순서로 도착) **화면이 잘못된 값으로 되돌아가는 일은 없었다.**
- **왜 안전한가**: `category`가 다르면 TanStack Query의 query key(`['products', {category, ...}]`) 자체가 달라진다. 화면은 항상 "현재 URL 상태의 query key"만 구독하므로, 이제는 관심 대상이 아닌 이전 key(`casual`, `fashion`)의 응답이 늦게 와도 캐시만 채울 뿐 화면을 구독하는 컴포넌트를 다시 그리지 않는다. **query key 기반 구독 덕분에 별도 취소 로직 없이도 정합성은 저절로 지켜지고 있었다.**
- **"취소된 요청" 실제 관찰 결과**: 이 앱은 `AbortSignal`을 안 쓰기 때문에(Part 2 gap, 이미 확인됨) `casual`·`fashion` 요청은 네트워크 레벨에서 진짜로 취소되지 않는다 — 위 로그처럼 **셋 다 끝까지 실행되고 응답도 다 받는다.** 다만 화면 정합성에는 영향이 없으니 "취소된 요청이 오류로 보이는 문제"는 없다. 대신 **불필요한 API 호출 2건이 항상 낭비된다는 게 실측으로 확인된 비효율**이다 — Part 2에서 `AbortSignal` 연결을 검토할 근거.

---

## 사용자 직접 측정 — Slow 4G 실측(DevTools Performance 패널)

위 Lighthouse·Playwright 결과는 전부 시뮬레이션(데스크톱 프리셋 RTT 40ms·≈1,280KB/s) 또는 로컬 비throttled 조건이었다. 사용자가 DevTools Performance 패널로 **실제 Slow 4G**(데스크톱 프리셋보다 훨씬 열악한 RTT·대역폭) 조건에서 직접 재현한 기록을 추가한다. "몇 ms를 주장하는" 타이밍 증거는 사용자가 직접 재는 게 공식이라는 기준(Part 1에서 정한 측정 규칙)에 따른다.

- **측정 시점 코드 상태**: 커밋 `61214ccabb448fa70910566295958d78036f8e87`(Part 0, raw `<img>` 그대로)
- **측정 도구**: DevTools Performance 패널, network throttling **"Slow 4G"**, 실제 디바이스 DPR 1, `localhost:3000`(프로덕션)
- **측정 일시**: 2026-08-06 UTC 11:07(홈 하드 리로드) / 11:08(상품목록 인터랙션)

### 홈(`/`) — 하드 리로드

| 지표      | 값                                                                                       |
| --------- | ---------------------------------------------------------------------------------------- |
| FCP       | 1,351.7ms                                                                                |
| LCP(hero) | **47.6초 녹화 종료 시점까지 `LargestContentfulPaint::Candidate`가 hero로 갱신되지 않음** |

7.5MB 원본 이미지를 진짜 Slow 4G 회선으로 받으면, Lighthouse가 시뮬레이션한 desktop 프리셋(≈6.6초)보다 훨씬 가혹하다. `largestContentfulPaint::Candidate` 이벤트는 텍스트 카드 하나(2,367px²→42,307px² 구간)에서 멈춰 있어 "공식 LCP 후보"로는 hero가 한 번도 잡히지 않았지만, **스크린샷으로 보면 hero는 progressive JPEG로 계속 채워지고 있었다** — 44.9초 시점엔 육안으로 거의 다 채워진 상태였다(완전히 100% 끝났다는 신호는 녹화 종료 전까지 없었음). 즉 "아예 안 보인다"가 아니라 "1분 가까이 서서히 채워지는 중이라 어느 시점에 '완료'라고 부를 수 있는지조차 애매하다"는 게 더 정확한 설명이다 — 시뮬레이션 수치(6.6초)가 오히려 낙관적인 축에 속한다는 뜻은 그대로 유지된다.

#### filmstrip — 홈(`/`, Slow 4G)

| 시점       | 스크린샷                                                           | 내용                                                                                                          |
| ---------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| t=1,344ms  | [`slow4g-user/home/t1344ms.jpg`](./slow4g-user/home/t1344ms.jpg)   | 셸(Header·hero 텍스트 카드) 완성, hero는 아직 배경색만(FCP 시점과 근접)                                       |
| t=3,275ms  | [`slow4g-user/home/t3275ms.jpg`](./slow4g-user/home/t3275ms.jpg)   | hero 최상단에 progressive JPEG 스캔라인이 막 나타나기 시작                                                    |
| t=12,276ms | [`slow4g-user/home/t12276ms.jpg`](./slow4g-user/home/t12276ms.jpg) | hero 위쪽 절반 정도 채워짐                                                                                    |
| t=24,276ms | [`slow4g-user/home/t24276ms.jpg`](./slow4g-user/home/t24276ms.jpg) | hero 대부분 채워짐(디테일은 아직 흐릿)                                                                        |
| t=44,929ms | [`slow4g-user/home/t44929ms.jpg`](./slow4g-user/home/t44929ms.jpg) | 육안으로는 거의 완료된 상태 — 그래도 이 시점까지 `LargestContentfulPaint::Candidate`는 hero로 갱신되지 않았음 |

### 상품 목록(`/products`) — 쿼리 변형 인터랙션(하드 리로드 없음, 클라이언트 사이드 필터 변경)

같은 Slow 4G 조건에서 `/products`의 카테고리·정렬·검색·페이지 조건을 실제로 연속 조작한 기록. 위 표(카테고리/정렬/검색/페이지네이션)와 동일한 쿼리 변형들을 이번엔 Lighthouse 시뮬레이션이 아니라 실제 인터랙션으로 재확인했다.

| 경과 시간    | 요청 URL                                                          | 대응하는 쿼리 조건                 |
| ------------ | ----------------------------------------------------------------- | ---------------------------------- |
| t=0ms        | `/api/products?category=home&sort=latest&page=1&pageSize=12`      | 카테고리(홈)                       |
| t=5,100.6ms  | `/api/products?category=fashion&sort=latest&page=1&pageSize=12`   | 카테고리(패션)                     |
| t=8,624.5ms  | `/api/products?sort=latest&page=1&pageSize=12`                    | 카테고리 초기화                    |
| t=9,234.8ms  | `/api/products?sort=latest&page=2&pageSize=12`                    | 페이지네이션(다음 페이지 prefetch) |
| t=17,494.5ms | `/api/products?category=casual&sort=latest&page=1&pageSize=12`    | 카테고리(캐주얼)                   |
| t=25,512.6ms | `/api/products?category=casual&sort=price-asc&page=1&pageSize=12` | 정렬                               |
| t=30,373.3ms | `/api/products?sort=price-asc&page=1&pageSize=12`                 | 카테고리 초기화                    |
| t=30,973.3ms | `/api/products?sort=price-asc&page=2&pageSize=12`                 | 페이지네이션(prefetch)             |
| t=32,806.1ms | `/api/products?q=tu&sort=price-asc&page=1&pageSize=12`            | 검색(입력 중)                      |
| t=34,222.7ms | `/api/products?q=셔츠&sort=price-asc&page=1&pageSize=12`          | 검색(확정)                         |
| t=47,479.4ms | `/api/products?sort=price-asc&page=3&pageSize=12`                 | 페이지네이션                       |

- **CLS**: `LayoutShift` 이벤트 2건 잡혔으나 둘 다 `had_recent_input: true`(클릭 직후 500ms 이내)이고 점수도 0.0001–0.0008 수준으로 미미하다 — 공식 CLS 점수에는 반영되지 않는 종류이며, Lighthouse가 보고한 CLS 0.000과 결론이 일치한다.
- 카테고리·정렬·검색·페이지 조건을 전부 실제로 조작해봐도 위 Lighthouse 결론("LCP 요소는 항상 hero 이미지, 쿼리 조건과 무관")과 어긋나는 동작은 관찰되지 않았다.

#### filmstrip — 상품 목록(`/products`, Slow 4G)

스크린샷 캡처는 인터랙션 시작 후 31.5초까지만 남아있었다(요청 로그는 47.5초까지 이어짐 — 녹화 툴 쪽 캡처 간격 문제로 보이며 이후 요청들의 화면은 별도 캡처가 없다). 남아있는 구간에서 5장을 뽑았다:

| 시점       | 스크린샷                                                                   | 내용                                                                                |
| ---------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| t=8ms      | [`slow4g-user/products/t8ms.jpg`](./slow4g-user/products/t8ms.jpg)         | 홈 화면에서 카테고리 링크를 막 클릭한 직후(아직 홈 화면, 소프트 내비게이션 전환 전) |
| t=9,232ms  | [`slow4g-user/products/t9232ms.jpg`](./slow4g-user/products/t9232ms.jpg)   | `/products`로 전환 완료, hero·필터·"상품 목록" 타이틀 표시                          |
| t=18,105ms | [`slow4g-user/products/t18105ms.jpg`](./slow4g-user/products/t18105ms.jpg) | 카테고리 "캐주얼" 반영 이후 상태                                                    |
| t=25,535ms | [`slow4g-user/products/t25535ms.jpg`](./slow4g-user/products/t25535ms.jpg) | 정렬 조건 반영 구간                                                                 |
| t=31,516ms | [`slow4g-user/products/t31516ms.jpg`](./slow4g-user/products/t31516ms.jpg) | 캡처가 남아있는 마지막 시점(카테고리 초기화 직후 구간)                              |
