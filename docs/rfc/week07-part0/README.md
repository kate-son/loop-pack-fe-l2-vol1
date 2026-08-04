# Part 0 — Before 측정 결과

> **파일 안내**: 이 폴더(`docs/rfc/week07-part0/`) 안의 상대경로(`./lighthouse/...`)는 이 커밋에 실제로 포함된 파일이다. 반면 `docs/local/week7/...`로 시작하는 경로는 **로컬 전용 참고자료**(raw JSON 전체, 스크린샷, Chrome 성능 트레이스 등 총 55MB)로, 저장소 크기 부담 때문에 이번 커밋에는 포함하지 않았다. 이 문서에 정리된 표·수치·결론은 그 로컬 자료를 분석해서 옮겨 적은 것이라 로컬 파일이 없어도 읽는 데 지장은 없다. 재현하려면 같은 명령(`pnpm build && pnpm start` 후 `npx lighthouse ...`, Playwright/CDP 스크립트)을 다시 실행하면 된다.

- **HeroSection 연결 상태**: 과제가 제공한 `HeroSection`(raw `<img>`, 미최적화 원본)은 `PageHeading`으로 통합되어 홈(`/`)·상품목록(`/products`) 양쪽에 이미 연결되어 있고, 원본 이미지도 최적화하지 않은 상태 그대로다
- **commit SHA**: `61214ccabb448fa70910566295958d78036f8e87`
- **측정 도구**: Lighthouse CLI `13.4.1` (`npx lighthouse`), Chrome headless(`--headless=new`), 기본 throttling(`simulate`, RTT 150ms, downlink ≈1.47Mbps, CPU 4x slowdown) — Lighthouse 기본 모바일 시뮬레이션 조건
- **브라우저 버전**: Google Chrome `150.0.7871.187` (Lighthouse가 띄운 헤드리스 인스턴스와 동일 바이너리 — `/Applications/Google Chrome.app`)
- **viewport**: Lighthouse는 `--form-factor`를 따로 안 줘서 기본값인 **모바일 에뮬레이션**(`412×823`, `deviceScaleFactor 1.75`)으로 측정됨(각 run JSON의 `configSettings.screenEmulation` 확인). 참고: 아래 "실제 브라우저(Playwright)" 섹션의 보조 확인들은 이와 별개로 데스크톱 뷰포트(`1280×800`)를 사용했다 — Lighthouse 수치와 Playwright 보조 확인은 서로 다른 뷰포트 조건이니 직접 비교하지 말고 각자 독립된 증거로 참고할 것
- **측정 일시**: 2026-08-04T13:34–13:37Z
- **실행 방식**: `pnpm build && pnpm start` 이후 `http://localhost:3000/`, `http://localhost:3000/products` 각각 cold load 5회(매 회 새 headless Chrome 인스턴스, 캐시 없음)
- **raw JSON(로컬 전용)**: `docs/local/week7/part0/lighthouse/{home,products}/run-{1..5}.json`
- **눈으로 보는 리포트(이 커밋에 포함됨)**: [`./lighthouse/home/run-1.html`](./lighthouse/home/run-1.html), [`./lighthouse/products/run-1.html`](./lighthouse/products/run-1.html) — run-1의 원본 JSON을 Lighthouse 자체 리포트 생성기로 변환한 파일. 인터넷 연결이나 외부 업로드 없이 브라우저로 더블클릭해서 열면 익숙한 점수 화면(성능 점수, filmstrip, opportunities 등)을 그대로 볼 수 있다. run-2~5는 raw 값이 표에 이미 있어 대표로 run-1만 변환함

---

## DevTools에서 볼 것 — 체크리스트

과제 문서가 명시한 4개 확인 항목과 실제로 확인한 방법·근거.

| 도구        | 확인할 것                                           | 상태 | 확인 방법·근거                                                                                                                                                                                                                                                          |
| ----------- | --------------------------------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Lighthouse  | LCP element                                         | ✅   | Lighthouse `lcp-breakdown-insight` 오디트로 특정 → [LCP element / waterfall](#lcp-element--waterfall-홈-run-1-기준)                                                                                                                                                     |
| Performance | filmstrip의 표시 순서                               | ✅   | CDP `Page.captureScreenshot`로 홈·상품목록 각 10프레임 실측 → [홈 filmstrip](#홈--filmstrip-cdp-pagecapturescreenshot-직접-호출로-완성), [상품목록 filmstrip](#상품-목록--홈과-같은-cdp-조건으로-filmstripvitals-재확인)                                                |
| Performance | Layout Shifts                                       | ✅   | Lighthouse CLS 수치(0.000) + CDP `Tracing`으로 뜬 실제 트레이스의 `LayoutShift` 이벤트 수(0건) 이중 확인 → [LCP element / waterfall](#lcp-element--waterfall-홈-run-1-기준)의 "Layout Shifts 트랙 직접 확인" 항목                                                       |
| Network     | document·API·image의 URL, 전송 크기, 요청 시작 시점 | ✅   | Lighthouse `network-requests` 오디트(이미지 `transferSize=7,545,525 bytes`) + Playwright 네트워크 로그(API 요청/응답 타이밍) → [LCP element / waterfall](#lcp-element--waterfall-홈-run-1-기준), [상품 목록 재현 섹션들](#상품-목록--최초-진입데이터-없는-첫-로딩-재현) |

---

## 홈 (`/`) — 5회 raw 값

| run        | FCP(ms) | LCP(ms)    | CLS       |
| ---------- | ------- | ---------- | --------- |
| 1          | 922     | 41,047     | 0.000     |
| 2          | 906     | 40,806     | 0.000     |
| 3          | 905     | 40,805     | 0.000     |
| 4          | 905     | 40,805     | 0.000     |
| 5          | 904     | 40,804     | 0.000     |
| **중앙값** | **905** | **40,805** | **0.000** |
| 최솟값     | 904     | 40,804     | 0.000     |
| 최댓값     | 922     | 41,047     | 0.000     |

---

## 상품 목록 (`/products`) — 5회 raw 값

| run        | FCP(ms) | LCP(ms)    | CLS       |
| ---------- | ------- | ---------- | --------- |
| 1          | 905     | 40,430     | 0.000     |
| 2          | 905     | 40,430     | 0.000     |
| 3          | 906     | 40,431     | 0.000     |
| 4          | 906     | 40,431     | 0.000     |
| 5          | 905     | 40,430     | 0.000     |
| **중앙값** | **905** | **40,430** | **0.000** |
| 최솟값     | 905     | 40,430     | 0.000     |
| 최댓값     | 906     | 40,431     | 0.000     |

---

## `/products` URL 쿼리 변경별 성능 (category/sort/검색/page)

`/products`는 검색·카테고리·정렬·페이지 조건에 따라 초기 HTML(SSR prefetch로 채워지는 상품 데이터)이 달라진다. 조건이 바뀌어도 Lighthouse 지표가 달라지는지 각 조건별로 cold load 3회씩 측정했다(기본값인 무조건 `/products`는 위 5회 결과를 기준선으로 사용). raw JSON은 로컬 전용(`docs/local/week7/part0/lighthouse/products-query/{category,sort,search,page2}/run-{1..3}.json`), 눈으로 보는 HTML 리포트(조건별 run-1 대표, 이 커밋에 포함됨): [`category`](./lighthouse/products-query/category/run-1.html), [`sort`](./lighthouse/products-query/sort/run-1.html), [`search`](./lighthouse/products-query/search/run-1.html), [`page2`](./lighthouse/products-query/page2/run-1.html)

| 쿼리 조건            | URL                         | FCP 중앙값(ms) | LCP 중앙값(ms) | CLS 중앙값 |
| -------------------- | --------------------------- | -------------- | -------------- | ---------- |
| 기준(쿼리 없음, n=5) | `/products`                 | 905            | 40,430         | 0.000      |
| 카테고리 필터        | `/products?category=casual` | 905            | 40,279         | 0.000      |
| 정렬                 | `/products?sort=price-desc` | 906            | 40,356         | 0.000      |
| 검색                 | `/products?q=셔츠`          | 904            | 40,054         | 0.000      |
| 페이지네이션         | `/products?page=2`          | 905            | 40,355         | 0.000      |

**결론**: 쿼리 조건을 바꿔도 FCP·LCP·CLS가 사실상 동일하다(차이는 전부 측정 흔들림 수준인 수백ms 이내). **LCP 요소를 확인해보니 조건이 달라져도 항상 같은 `PageHeading`의 hero 이미지**(`body > main.week05-page > section...hero > img...image`)였다 — 상품 그리드나 필터 결과 자체는 LCP 후보가 아니다. 즉 `/products`의 성능 병목은 검색·카테고리·정렬·페이지 로직과 무관하게 **오직 hero 이미지 하나**이며, Part 1에서 그 이미지만 고치면 쿼리 조건에 상관없이 모든 `/products` 변형이 동시에 좋아진다.

---

## LCP element / waterfall (홈, run-1 기준)

- **LCP element**: `body > main.week05-page > section.PageHeading-module__..._hero > img.PageHeading-module__..._image` — `PageHeading`의 raw `<img src="/images/week-07/hero-original.jpg" width="3840" height="2160">`
- **network-requests 오디트에서 해당 이미지**: `transferSize=7,545,525 bytes`(≈7.5MB). 로컬(비throttled) 환경이라 실제 전송 자체는 178ms 만에 끝났다. 하지만 Lighthouse는 이 실측값을 그대로 쓰지 않고 "이 파일 크기를 가상의 느린 회선(≈1.47Mbps ≈ 184KB/s)으로 받았다면 몇 초 걸렸을까"를 계산해서 최종 LCP로 보여준다 — **7.5MB를 184KB/s로 나누면 약 40.9초가 나오고, 이게 리포트에 찍힌 LCP(≈40.8초)와 거의 정확히 같다.**
- **document·홈 데이터·Hero 이미지 요청 시작 순서(로컬/비throttled 기준, Lighthouse run-1의 `network-requests` 오디트)**:

  | 순서 | 리소스                           | 시작 시점          | 전송 크기                | 비고                                                                                                                                                                                                                                                                         |
  | ---- | -------------------------------- | ------------------ | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | 1    | `document` (`/`)                 | t=0ms              | 5,469 bytes              | SSR된 HTML 셸 자체. **"홈 데이터"(배너/카테고리/상품)는 별도 API 요청이 아니라 이 문서 안에 이미 포함되어 내려온다** — `(home)/page.tsx`가 서버에서 `prefetchQuery` 후 `HydrationBoundary`로 감싸 내려주기 때문에 브라우저 입장에서 "홈 데이터"만 따로 fetch하는 요청은 없다 |
  | 2    | 폰트·CSS·JS 청크·**Hero 이미지** | t≈45ms             | 이미지는 7,545,525 bytes | document 응답을 파싱한 브라우저의 preload scanner가 한꺼번에 발견해 거의 동시에 요청을 시작함(45.3~45.6ms 사이) — Hero 이미지가 다른 리소스보다 특별히 늦게 발견되는 건 아니었다                                                                                             |
  | —    | Hero 이미지 완료                 | t≈179ms(로컬 기준) | —                        | 발견은 빠르지만(45ms), **크기(7.5MB)가 압도적으로 커서** 느린 회선에서는 이 지점부터 40초 가까이 걸리는 것                                                                                                                                                                   |

  즉 "Hero 이미지 요청이 늦게 시작돼서" 느린 게 아니라, **거의 즉시(45ms) 발견·요청되는데도 파일 자체가 너무 커서 전송에 오래 걸리는 것**이 확정적인 원인이다.

- **CLS 0.000인 이유**: `<img>`에 `width={3840}`/`height={2160}`가 명시돼 있어 로드 전에도 `aspect-ratio`로 공간이 이미 확보됨(레이아웃 이동 자체가 없음) — 이 부분은 이미 잘 되어 있어 Part 4에서 회귀만 확인하면 됨
- **Layout Shifts 트랙 직접 확인(추가 검증)**: Lighthouse의 CLS 수치만이 아니라, DevTools Performance 패널이 쓰는 것과 같은 CDP `Tracing` API로 홈·상품목록 각각 6초짜리 실제 성능 트레이스를 떴다(같은 throttle 조건, `docs/local/week7/part0/traces/{home,products}-trace.json`). 트레이스 안의 `LayoutShift` 이벤트를 세어보니 **둘 다 0건** — Lighthouse 수치와 정확히 일치. 이 `.json` 파일은 Chrome DevTools의 Performance 패널(Load profile) 확인시 "Layout shifts" 트랙을 직접 눈으로 봐도 아무 것도 안 뜬다(이벤트 자체가 없으므로).

---

## 관찰 사실 → 가설 → 반증 방법 → 최소 변경안

| 관찰한 사실                                   | 원인 가설                                                                                                                 | 반증할 측정                                                                                                                                                                                                                                                           | 가장 작은 변경                                                                                                                                                                                                                                           |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 홈·상품목록 모두 LCP가 40초대로 동일하게 나쁨 | `PageHeading`이 두 페이지에 공통으로 내려주는 `hero-original.jpg`(7.5MB, 미최적화)가 LCP 후보이자 병목 그 자체            | "이미지 용량(7.5MB) ÷ 이번 측정의 다운로드 속도"로 계산한 예상 소요 시간이, 실제 관측된 LCP 시간과 비슷한지 비교 → 계산값과 실측값이 거의 같음(가설 확정)                                                                                                             | ① 이미지를 실제 표시 크기(카드 최대 폭)에 맞는 크기·포맷(WebP/AVIF)으로 재인코딩하거나 `next/image`로 반응형 srcset 제공 ② `<link rel="preload">` 또는 `next/image`의 `priority`(`fetchpriority="high"`)로 이 이미지를 더 일찍·우선 요청하도록 힌트 추가 |
| FCP는 905ms 전후로 낮고 안정적                | Header·타이틀 텍스트는 이미지와 무관하게 먼저 그려지고 있어, 셸 자체가 막히는 문제(Part 2가 다루는 유형)는 현재 거의 없음 | `(home)/page.tsx`가 `await prefetchQuery`로 셸까지 막는 구조인데도 FCP가 낮은 이유는, prefetch 자체는 500ms(기본 scenario) 정도라 텍스트 렌더링엔 큰 영향이 없기 때문으로 추정 — `scenario=slow`(1.5s)로 강제했을 때도 FCP가 유지되는지 반증 필요(다음 측정에서 확인) | 아직 불필요 — 반증 후 결정                                                                                                                                                                                                                               |
| CLS는 두 페이지 다 0.000                      | `<img>`에 `width`/`height`가 명시돼 있어 레이아웃 이동이 없음                                                             | 이미지 교체 전후 Layout Shifts track 확인(브라우저 도구 필요)                                                                                                                                                                                                         | 불필요(이미 만족)                                                                                                                                                                                                                                        |

---

## 실제 브라우저(Playwright+Chromium) 확인 — 브라우저 확장 없이 devDependency로 보완

이 세션엔 claude-in-chrome 확장이 연결돼 있지 않지만, 프로젝트에 이미 있는 `playwright`(devDependency, `@vitest/browser-playwright`가 사용)로 실제 Chromium을 직접 띄워 Lighthouse 시뮬레이션 값을 실측으로 한 번 더 검증했다. 스크린샷·로그는 `docs/local/week7/part0/recording/`에 저장.

### 홈 — filmstrip (CDP `Page.captureScreenshot` 직접 호출로 완성)

`page.screenshot()`(Playwright 고수준 API)는 캡처 전 `document.fonts.ready`를 기다리는데, 네트워크 스로틀 중엔 히어로 이미지가 대역폭을 독점해 폰트 요청이 밀려 타임아웃났다. CDP의 `Page.captureScreenshot`을 직접 호출(폰트 대기 없음)해서 해결하고, 같은 throttle 조건에서 500ms 간격으로 10프레임을 확보했다(`docs/local/week7/part0/recording/home-cdp-filmstrip-*.png`).

| 프레임 | 시점      | 파일 크기            | 내용                                                                                                                                                                                                                           |
| ------ | --------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 0      | t=31ms    | 4.7KB                | 완전 빈 화면(흰 배경)                                                                                                                                                                                                          |
| 2      | t=1,067ms | 25.7KB               | **셸이 이미 완성**: 헤더(Commerce/상품/위시리스트/장바구니), hero 텍스트 카드("매일 새롭게 발견하는 취향")까지 전부 보임. 다만 hero 이미지 자리는 여전히 배경색(`#d8cebf`, `PageHeading.module.css`의 placeholder 색)만 채워짐 |
| 9      | t=4,748ms | 93.9KB(계속 증가 중) | 4.7초가 지나도 이미지는 **맨 위 얇은 띠(progressive JPEG의 첫 스캔 레이어)만** 보이고 나머지는 여전히 배경색. 프레임마다 파일 크기가 꾸준히 커지는 것도 이미지가 위에서 아래로 점진적으로 채워지는 중임을 보여줌               |

**결론**: 셸(헤더+텍스트)은 1초 안에 완성되지만, 히어로 이미지는 5초가 지나도 10~15%도 채 안 그려진다 — Lighthouse의 "LCP ≈ 40초" 시뮬레이션과 방향이 완전히 일치하는 실제 filmstrip 증거.

### 홈 — CDP로 Lighthouse와 동일한 네트워크 조건(RTT 150ms, ≈1.47Mbps) 재현, 4초 시점 관찰

```json
{ "fcp": 540, "lcp": null, "lcpElement": null }
```

- **FCP 540ms**: 실측치도 Lighthouse(중앙값 905ms)와 같은 자릿수 — 셸이 빠르게 뜬다는 결론을 재확인.
- **LCP가 아직 `null`**: 스크립트가 관찰을 종료한 4초 시점까지 LCP 후보(hero 이미지)가 아직 로드 중이라 Performance API에 LCP entry 자체가 안 잡힘. Lighthouse의 "40초대" 시뮬레이션 값과 방향이 정확히 일치(4초는커녕 훨씬 더 걸린다는 뜻).
- **부수 발견**: 같은 throttle 조건에서 `home-filmstrip-1~7.png` 스크린샷 시도가 전부 `waiting for fonts to load` 타임아웃으로 실패했다. CDP의 대역폭 제한은 연결 전체에 걸리므로, 7.5MB 이미지가 좁은 대역폭을 독점하는 동안 훨씬 작은 폰트 파일 요청까지 큐에 밀려 `document.fonts.ready`조차 오래 걸린다.

### 상품 목록 — 홈과 같은 CDP 조건으로 filmstrip·vitals 재확인

홈에서 확인한 "hero 이미지가 LCP 병목"이라는 결론이 `/products`에도 그대로 적용되는지, 같은 방법(CDP 네트워크 스로틀 + `Page.captureScreenshot`)으로 직접 재현해 확인했다(`docs/local/week7/part0/recording/products-cdp-filmstrip-*.png`).

```json
{ "fcp": 488, "lcp": null }
```

| 프레임 | 시점      | 파일 크기            | 내용                                                                                                 |
| ------ | --------- | -------------------- | ---------------------------------------------------------------------------------------------------- |
| 0      | t=26ms    | 4.7KB                | 완전 빈 화면                                                                                         |
| 2      | t=1,064ms | 22.7KB               | 홈과 동일하게 **셸이 1초 안에 완성**(헤더+제목+설명+필터 라벨). hero 이미지 자리는 여전히 배경색만   |
| 9      | t=4,715ms | 76.1KB(계속 증가 중) | 4.7초가 지나도 이미지는 맨 위 얇은 띠만 보임 — 홈의 t=4,748ms 프레임(93.9KB)과 사실상 같은 진행 상태 |

**결론**: FCP 488ms(홈 540ms와 같은 자릿수), LCP는 4.7초 시점에도 `null`(아직 미확정) — 홈에서 관찰한 패턴과 동일하다. 즉 `/products`도 홈과 **완전히 같은 원인, 같은 정도로** LCP가 나쁘다는 걸 실제 화면으로도 재확인했다. 위 Lighthouse 쿼리 변형 표에서 이미 "LCP 요소가 항상 같은 hero 이미지"라는 걸 수치로 확인했는데, 이번엔 그걸 실제 filmstrip으로도 증명한 것.

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
- `page.route()`로 지연을 강제 주입한 상태에서 찍은 `products-initial-0~5.png` 6장이 전부 같은 파일 크기(1,208,755 bytes)로 동일 — 로딩 대기 구간 동안 화면이 시각적으로 전혀 안 바뀌고 있다는 뜻(“실제 목록 크기를 예상할 수 있는 pending UI”가 아직 없다는 Part 2 gap과 일치).
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
