# Part 3 — 동적 metadata와 Open Graph의 비용

## 요약

JavaScript가 실행되기 전에도 제목·설명·이동 경로가 보이게 만들고, 그 대가로 **metadata가 데이터를 기다리며 응답이 늦어지는 비용**을 함께 측정하는 작업이다. 현재는 **페이지별 metadata가 전혀 없는 상태**이고, 반대로 그것을 만들기 위한 기반(query factory·URL 정규화·요청 단위 QueryClient)은 이미 갖춰져 있다.

| 항목          | 내용                                                                                                                                  |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Before 코드   | Part 2 종료 시점(커밋 `a1c06c28` 이후, Round 11까지 적용)                                                                             |
| 현재 코드     | **아직 변경 없음** — 이 문서는 Before 관찰과 계획까지만 다룬다                                                                        |
| 대상 경로     | 과제 문서는 `src/app/(commerce)/…`로 안내하지만, 이 리포지토리는 **`src/app/(home)/page.tsx`**·**`src/app/products/page.tsx`** 구조다 |
| 측정 프로토콜 | Part 1·2와 동일 — 타이밍 수치는 사용자가 직접 측정, AI가 CLI로 잰 값은 참고용으로만 표기                                              |
| 자료          | (측정 후 `./captures/`, `./lighthouse/`에 추가 예정)                                                                                  |

### 문서 구성

**1부 Before**(현재 상태·이미 갖춰진 것·관찰 표) → **2부 재현·측정 계획**(normal / 정상 empty / metadata query failure / 서버 호출 계수 / UA 비교) → **3부 정리**(완료조건 점검·성능 개선 방향)

---

## Before 성능 지표 — Part 2 최종 측정 승계

Part 3는 metadata를 **추가**하는 작업이라 응답이 느려지는 쪽이다. 그 비용을 재려면 기준선이 필요하므로, **Part 2의 마지막 사용자 측정을 그대로 Before로 삼는다**(Part 1 → Part 2에서 했던 것과 같은 방식).

- **측정 URL**: `/products` · **도구**: Lighthouse `--preset=desktop` 5회, 포트 3000 · **측정 일시**: 2026-08-07 UTC 01:51–01:54

| 지표                  | 중앙값                   | 비고                                                    |
| --------------------- | ------------------------ | ------------------------------------------------------- |
| **Performance score** | **0.76**                 | 감점은 전부 이미지 로딩                                 |
| FCP                   | 1,399ms                  | 이 측정 환경 고유의 이례적 관측치(Part 1부터 동일 패턴) |
| LCP                   | 2,738ms                  | hero 네트워크 구간 2,623ms가 대부분                     |
| Speed Index           | 2,453ms                  |                                                         |
| **CLS**               | **0.000**                | Part 2가 다룬 영역 — 만점                               |
| TBT                   | 0ms                      | 만점                                                    |
| hero 전송량           | 132KB (`21x9`, `w=2400`) |                                                         |

상세 raw 값과 해석은 [Part 2 문서](../week07-part2/README.md)의 "사용자 직접 측정 — Round 11" 절에 있다.

> **⚠️ 이 기준선에 반영되지 않은 변경이 하나 있다.** Part 2 Round 11의 `sizes` 수정(`(min-width: 1232px) 1170px, calc(100vw - 32px)`)은 위 측정 **이후에** 적용됐다. 이 수정으로 hero가 `w=2400`(135,568 bytes) 대신 `w=2048`(112,773 bytes)을 고르므로, **실제 Before는 위 표보다 약간 나을 가능성이 있다.** Part 3의 metadata 비용을 잴 때는 이 점을 감안하거나, 코드 변경 전에 한 번 더 재서 기준선을 갱신하는 편이 정확하다.

---

## 1부. Before — 지금 어떤 상태인가

## 루트 metadata — 최소한만 있고 title template·Open Graph가 없다

`src/app/layout.tsx`:

```ts
export const metadata: Metadata = {
  title: 'Commerce',
  description: 'Loopers 커머스 - 4주차부터 여기에 쌓아갑니다.',
};
```

- **`title.template`이 없다.** 페이지가 title을 주면 루트 title을 통째로 대체하며, `"… | Commerce"` 같은 공통 접미사가 붙지 않는다.
- **`openGraph`가 아예 없다.** 따라서 공유 시 크롤러가 쓸 `siteName`·`locale`·`type`·대표 이미지가 전혀 제공되지 않는다.
- **`metadataBase`가 없다.** Open Graph 이미지에 상대경로를 쓰면 절대 URL로 확장되지 않는다.

## 페이지 metadata — `generateMetadata`가 한 곳도 없다

`generateMetadata`·`openGraph`를 리포지토리 전체에서 검색해도 **결과가 0건**이다. 즉 `/`와 `/products`는 어떤 조건(검색어·카테고리·정렬·페이지)으로 들어와도 **동일한 title·description**을 반환한다. 과제가 요구하는 다음 항목이 모두 미충족이다.

| 요구                                                | 현재                                  |
| --------------------------------------------------- | ------------------------------------- |
| 홈: 응답의 title·description·image 사용             | ❌ 고정값                             |
| 상품 목록: 카테고리명·전체 개수·첫 상품 이미지 사용 | ❌ 고정값                             |
| 검색어를 title에 우선 반영                          | ❌                                    |
| category·sort를 description에 반영                  | ❌                                    |
| 2페이지 이상은 title에 페이지 번호                  | ❌                                    |
| 정상 empty의 0건 설명 + OG fallback image           | ❌                                    |
| metadata 조회 실패 시 root 공통 metadata 상속       | ❌ (상속할 공통 metadata 자체가 빈약) |

## 이미 갖춰져 있는 것 — 새로 만들 필요가 없는 기반

과제가 "metadata와 본문이 같은 URL 정규화·query factory를 쓸 것"을 요구하는데, **그 구조는 Part 0–2를 거치며 이미 완성돼 있다.**

- **URL 정규화 단일 출처**: `productSearchParams`(파서 정의)를 클라이언트 훅 `useProductListParams`와 서버 로더 `loadProductSearchParams`가 **공유**한다. `page=0`/음수 하한 보정, 알 수 없는 `category`의 `'all'` 보정도 여기 한 곳에 있다.
- **query factory 단일 출처**: `productsQueryOptions(query)` / `homeQueryOptions()`가 queryKey·queryFn·캐시 정책을 모두 소유한다. 본문 prefetch가 이미 이걸 쓰므로, `generateMetadata`도 **같은 함수를 호출하면 같은 GET URL·options가 보장**된다.
- **요청 단위 QueryClient**: `getQueryClient = cache(() => new QueryClient())` — React `cache`로 감싸 **같은 요청 안에서는 하나를 재사용하고 요청이 끝나면 버린다.** 과제가 금지한 "singleton이나 영속 캐시"가 아니며, 이 구조를 바꿀 이유가 없다.

즉 Part 3에서 할 일은 **새 데이터 경로를 만드는 게 아니라, 이미 있는 factory를 `generateMetadata`에서 한 번 더 호출하고 그 비용을 측정하는 것**이다.

## 초기 HTML·접근성 — 랜드마크는 있고 `h1`이 없다

| 항목                                                   | 현재                                                                                |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------- |
| `<main>` / `<header>` / `<nav aria-label="주요 메뉴">` | ✅ 있음                                                                             |
| 목록 영역 `<section aria-label>`                       | ✅ 있음(`ProductListSection`)                                                       |
| 주요 이동이 `href` 링크인지                            | ✅ `next/link`의 `<Link href>` 사용                                                 |
| 상품 이미지 대체 텍스트                                | ✅ `alt={product.name}`                                                             |
| 장식용 히어로 이미지                                   | ✅ `alt=""`(적절한 처리)                                                            |
| **하나의 명확한 `h1`**                                 | ⚠️ `/`·`/products` 렌더 트리에 `h1`이 없다 — **`h2` 유지로 결정**(아래 "결정" 참고) |

`PageHeading`이 `<h2 id="week07-hero-title">`를 쓰고, 홈의 "카테고리"·"인기 상품" 섹션 제목도 `<h2>`다. `h1`은 `/examples`·`/performance-lab` 같은 실습 페이지에만 있다.

**이건 Part 1에서 의도적으로 미뤄둔 항목이고, 이번에 결론을 냈다.** Part 1 "`<h2>` 유지 결정" 절에서 *"`PageHeading`은 홈·상품 목록이 공유하는 컴포넌트라 페이지마다 heading level을 분기시키지 않고, 페이지별 `h1`은 layout 쪽에서 갖는 구조를 염두에 둔다 — Part 3에서 layout 구조와 함께 다시 판단한다"*고 기록했다. 그 "다시 판단할 시점"이 지금이고, **`h2`를 유지하기로 결정**했다(3부 "결정" 절).

---

## 관찰 사실 → 원인 가설 → 반증 방법 → 가장 작은 변경

| 관찰한 사실                                                              | 원인 가설                                                                                                              | 반증할 방법                                                                                           | 가장 작은 변경                                                                                                                       |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| 어떤 검색·필터 조건으로 들어와도 document의 title·description이 동일하다 | 페이지에 `generateMetadata`가 없어 루트 metadata가 그대로 쓰이기 때문이다                                              | 조건이 다른 두 URL의 document를 받아 `<title>`을 비교 — 같으면 가설 확정                              | `/`와 `/products`에 `generateMetadata`를 추가하고, 본문 prefetch와 **같은 query factory**로 조회한 값으로 title·description을 만든다 |
| 공유 시 크롤러가 쓸 Open Graph 정보가 전혀 없다                          | 루트에 `openGraph`가 없고 페이지도 만들지 않기 때문이다                                                                | document HTML에서 `og:` 메타 태그를 검색 — 0건이면 확정                                               | 루트에 공통 `openGraph`(`siteName`·`locale`·`type`·fallback image)와 `title.template`, `metadataBase`를 둔다                         |
| 페이지에서 `openGraph`를 지정하면 루트 설정이 사라질 위험이 있다         | Next.js의 metadata 병합이 **shallow merge**라 페이지 `openGraph` 객체가 루트 것을 통째로 대체하기 때문이다             | 페이지에 `openGraph: { title }`만 넣고 document에서 `og:site_name`이 남는지 확인 — 사라지면 확정      | 공통 openGraph 객체를 **명시적으로 펼쳐 재사용**하거나, 페이지에서 필요한 공통 필드를 함께 완성한다                                  |
| metadata 조회가 실패하면 어떻게 되는지 정의돼 있지 않다                  | 실패 경로를 다뤄본 적이 없기 때문이다(`generateMetadata` 자체가 없음)                                                  | `APP_ORIGIN`을 닿지 않는 origin으로 두고 document의 title을 확인                                      | `generateMetadata`에서 조회 실패 시 **페이지별 빈 값을 만들지 말고** 그대로 루트 metadata를 상속시킨다(빈 객체 반환)                 |
| `/`·`/products` 초기 HTML에 `h1`이 없다                                  | `PageHeading`을 공용으로 쓰면서 heading level을 `h2`로 고정했고, 페이지별 `h1`을 둘 자리를 아직 만들지 않았기 때문이다 | 렌더 트리에서 `h1` 검색 — 0건이면 확정(이미 확인됨)                                                   | **결정 완료** — 이 레이아웃에서는 히어로 제목이 문서 최상위 제목이 아니므로 `h2`를 유지한다(3부 "결정" 참고)                         |
| metadata가 본문과 같은 데이터를 쓰면 요청이 2배가 될 수 있다             | `generateMetadata`와 페이지 본문이 각각 prefetch를 호출하기 때문이다                                                   | **서버 측 계수**(Route Handler 임시 로그)로 실제 호출 횟수를 센다 — Browser Network만으로는 판정 불가 | 같은 render/request에서 **URL·options가 완전히 같은 native fetch**만 memoization 대상임을 이용하고, 실제 횟수를 측정해 기록한다      |

---

## 2부. 재현·측정 계획

> 아직 **어느 것도 실행하지 않았다.** 코드 변경 후 아래 순서로 진행한다.

## 공통 준비

```bash
APP_ORIGIN=http://localhost:3000 pnpm build
APP_ORIGIN=http://localhost:3000 pnpm start
```

`APP_ORIGIN`은 현재 코드에 없는 환경변수다. `src/shared/api/response.ts`의 `resolveUrl`이 서버에서 `NEXT_PUBLIC_SITE_URL`을 쓰고 있으므로, **둘을 어떻게 통합할지 결정이 필요하다**(아래 "판단이 필요한 것").

## ① normal — 정상 응답의 document 증거

- production 빌드로 `/`와 `/products`의 **document 응답**을 받아 초기 HTML을 남긴다.
- 확인: `<title>`, `<meta name="description">`, `og:*` 태그, 하나의 `h1`, 페이지 설명, 주요 링크(`href`)와 구조.
- 초기 HTML은 **document Response / View Source / JS 끈 새 요청** 중 하나 이상으로 확인한다(JS 실행 전 상태임을 보이기 위함).

## ② 정상 empty — 결과 0건

- 결과가 0건이 되는 실제 URL 조건으로 접근(예: 결과 없는 검색어).
- 확인: title·description이 **URL 조건과 0건임을 설명**하는지, Open Graph **fallback image가 유지**되는지.

## ③ metadata query failure — 조회 실패

```bash
APP_ORIGIN=http://127.0.0.1:9 pnpm build
APP_ORIGIN=http://127.0.0.1:9 pnpm start
```

- build와 runtime에 **같은 값**을 넣어야 한다.
- 확인: 페이지별 빈 metadata가 아니라 **root 공통 metadata가 그대로 유지**되는지. ②와 **서로 다른 fallback**을 보여야 한다.
- 빌드 자체가 실패하면 우회하지 말고 실행 환경·오류 로그를 남긴다.

## ④ 서버 호출 계수 — Route Handler 실제 호출 횟수

- `/api/products`(또는 `/api/home`) Route Handler에 **임시 서버 로그**를 넣어 요청당 호출 횟수를 센다.
- **Browser Network만 보고 판정하지 않는다** — document/RSC 경계 때문에 브라우저에서 안 보이는 서버 내부 호출이 있다.
- 관찰이 끝나면 **계측을 반드시 제거**하고, 제거했다는 사실을 문서에 남긴다.

## ⑤ 일반 UA vs `facebookexternalhit` 응답 시점

```bash
curl -s -o /dev/null -w 'normal   start=%{time_starttransfer} total=%{time_total}\n' "$APP_ORIGIN/products"
curl -A 'facebookexternalhit/1.1' -s -o /dev/null -w 'facebook start=%{time_starttransfer} total=%{time_total}\n' "$APP_ORIGIN/products"
```

- 같은 slow URL에 대해 `time_starttransfer`·`time_total`을 비교하고, **User-Agent에 따라 metadata 응답 시점이 어떻게 달라지는지** 기록한다.

---

## 3부. 정리

## 완료조건 점검 (현재 전부 미충족)

| 완료조건                                                      | 현재                   |
| ------------------------------------------------------------- | ---------------------- |
| normal의 document 증거                                        | ❌ 미실행              |
| 정상 empty의 document 증거                                    | ❌ 미실행              |
| metadata query failure의 document 증거                        | ❌ 미실행              |
| 정상 empty와 query failure가 **서로 다른 fallback**을 보일 것 | ❌ 두 경로 모두 미구현 |
| 서버 호출 계수와 **제거 여부**                                | ❌ 미실행              |
| 일반 UA vs `facebookexternalhit` 응답 시점 비교               | ❌ 미실행              |
| document 응답에서 metadata·초기 구조·최종 URL 확인 가능       | ❌ metadata 미구현     |

## 판단이 필요한 것 (코드 변경 전 결정)

1. **`APP_ORIGIN`과 기존 `NEXT_PUBLIC_SITE_URL`의 관계** — 과제는 `APP_ORIGIN`을 쓰라고 하고, 코드에는 `NEXT_PUBLIC_SITE_URL`이 이미 있다. 하나로 통합할지, `APP_ORIGIN`을 서버 전용으로 새로 둘지 정해야 한다. `NEXT_PUBLIC_` 접두사는 클라이언트 번들에도 값이 들어가므로, **서버에서만 쓰는 origin이라면 접두사 없는 이름이 더 맞다.**
2. **Open Graph fallback image를 무엇으로 할 것인가** — 히어로 원본(`hero-original.jpg`)을 쓰면 7.5MB라 크롤러 응답에 부담이다. Part 2에서 만든 21:9 크롭본이나 별도 OG 규격(1200×630) 이미지를 준비할지 판단이 필요하다.

## 결정 — `h2`를 유지한다 (Part 1 결정 승계)

Part 1에서 Part 3로 미뤄뒀던 heading level 판단을, **`PageHeading`을 `h2`로 그대로 두는 것**으로 직접 결정했다.

**근거 — 이 레이아웃에서는 히어로 제목이 문서의 최상위 제목이 아니다.** `PageHeading`은 홈과 상품 목록이 공유하는 히어로 영역이고, 그 안의 제목("이번 주의 발견 / 상품 목록")은 페이지 전체를 대표하는 이름이라기보다 **히어로라는 한 구획의 제목**이다. 여기에 `h1`을 붙이면 마크업이 "이 페이지의 주제는 히어로 배너다"라고 말하게 되는데, 실제 페이지의 주제는 그 아래의 상품 목록이다.

또한 `PageHeading`은 두 페이지가 공유하는 공통 컴포넌트라, 페이지마다 heading level을 prop으로 분기시키면 **"공통 컴포넌트는 도메인·페이지 사정을 모른다"는 이 프로젝트의 설계 원칙과 충돌**한다.

**대신 남는 것**: 과제 문서의 "초기 응답에 하나의 명확한 `h1`" 요구는 이 구조에서 충족되지 않는다. 이는 회피가 아니라 **레이아웃 특성상 `h2`가 더 정확한 마크업이라고 판단해 의도적으로 선택한 결과**이며, 그 판단 근거를 여기 남긴다. 향후 홈·상품목록을 감싸는 layout이 생겨 페이지 이름을 소유하게 되면, 그때 layout이 `h1`을 갖고 `PageHeading`은 `h2`로 남는 구조가 자연스럽다.

## 경계 — 어디에 코드를 둘 것인가

- `generateMetadata`는 **app 레이어(`page.tsx`)에만** 둔다. entities·shared가 metadata를 알 필요가 없다.
- metadata가 쓰는 데이터는 **entities의 query factory를 그대로 재사용**한다(`productsQueryOptions`·`homeQueryOptions`). metadata 전용 fetch 경로를 새로 만들지 않는다 — 그러면 "같은 GET URL·options" 요구가 깨진다.
- 응답에서 metadata 문자열을 만드는 매핑 로직은 **호출부(page.tsx)의 책임**이다. View는 그리기만 한다는 기존 원칙과 같은 맥락이다.
- `getQueryClient`는 **건드리지 않는다.** 요청 단위로 새로 만드는 현재 구조가 과제 요구와 일치한다.

---

## 성능 개선 방향

Part 3는 metadata를 **추가**하는 작업이라 기본적으로 응답이 느려지는 쪽이다. 따라서 "얼마나 느려지는지"를 측정하는 것 자체가 과제의 일부다. 그 위에서 취할 수 있는 개선은 세 갈래다.

### 1. metadata가 만드는 추가 비용을 0에 가깝게 유지

`generateMetadata`와 본문이 **같은 render/request에서 URL·options가 완전히 같은 fetch**를 하면 Next.js의 fetch memoization으로 실제 네트워크 호출이 한 번만 일어난다. 이 조건이 깨지는 흔한 원인은 (a) query string 순서가 다름, (b) 한쪽만 헤더·옵션을 추가함, (c) 서로 다른 함수로 URL을 조립함이다. **`productsQueryOptions`를 양쪽에서 똑같이 호출하면 세 가지 모두 자동으로 예방된다** — 이게 "같은 query factory를 쓰라"는 요구의 실질적 이유다.

측정으로 확인할 것: ④의 서버 호출 계수가 **1회**인지. 2회면 위 조건 중 하나가 깨진 것이다.

### 2. Part 2에서 확인된 실제 병목 — hero와 동시 출발하는 리소스

Part 2 Round 11 측정에서 hero(132KB)의 네트워크 구간이 **2,623ms**였다. 시뮬레이션 대역폭(1,280KB/s)이면 약 103ms면 될 양이므로, 나머지는 **같은 시점(616ms)에 출발하는 다른 리소스와의 대역폭 경쟁**이다.

| 시작     | 크기     | priority | 리소스          |
| -------- | -------- | -------- | --------------- |
| 616ms    | 22.9KB   | High     | Geist 폰트      |
| 616ms    | 28.9KB   | High     | Geist Mono 폰트 |
| 616ms    | 132KB    | High     | **hero**        |
| 616ms    | 4.6KB    | VeryHigh | CSS ×2          |
| 1,286ms~ | 약 138KB | Low      | JS 청크         |

**hero와 정면으로 경쟁하는 유일한 High 우선순위 리소스가 폰트 2종(52KB)이다.** 개선 후보:

- **폰트를 1종으로 줄이기** — `Geist_Mono`가 실제로 쓰이는 곳이 있는지 확인하고, 없으면 제거한다. 52KB → 23KB.
- **`preload: false`** — `next/font`는 기본으로 폰트를 preload한다. 본문 폰트가 아닌 보조 폰트는 preload를 끄면 hero와의 경쟁에서 빠진다.
- **subset 축소** — 현재 `subsets: ['latin']`인데 한글 콘텐츠가 대부분이므로, 실제로 latin 글리프가 얼마나 쓰이는지 확인할 여지가 있다.

### 3. hero 자체를 더 줄이기 (Part 2에서 이어짐)

Part 2 Round 11까지 167,195 → 112,773 bytes(−32.5%)를 화질 손실 없이 달성했다. 더 줄이려면 화질을 대가로 내야 한다.

| 폭         | bytes   | DPR 1.75 업스케일       |
| ---------- | ------- | ----------------------- |
| 2048(현재) | 112,773 | 1.03배                  |
| 1920       | 104,630 | 1.09배                  |
| 1800       | 98,299  | 1.17배                  |
| 1200       | 57,025  | 1.75배(육안으로 흐려짐) |

1800까지는 업스케일이 1.17배라 사진에서 눈에 띄지 않을 가능성이 높지만, **측정으로 얻는 이득(약 14KB)이 작아** 우선순위는 낮다. 위 2번(폰트)이 같은 노력 대비 효과가 크다.

### 판단 기준

세 갈래 모두 **Part 3의 완료조건과는 무관하다.** 완료조건은 "document 증거·서버 호출 계수·UA별 응답 시점"이지 점수가 아니다. Part 2에서 정리했듯 **성능 점수는 이 과제들에서 개선 지표가 아니라 회귀 확인용**이므로, metadata 추가로 응답이 느려지는 것을 정확히 측정해 기록하는 쪽이 우선이다.
