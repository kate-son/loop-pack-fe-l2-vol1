---
name: fsd-review
description: FSD(Feature-Sliced Design) 레이어 배치와 import 방향을 검토하고, 신규 파일의 위치를 제안한다. 도메인 판단은 DOMAINS.md를 참조한다.
---

### 레이어 정의

상위 → 하위 순. 상위 레이어는 하위 레이어를 import 할 수 있고, 역방향은 금지한다.

1. `app` — 전역 설정, 라우팅 진입점. Next.js App Router의 `src/app`는 라우팅 전용으로만 쓴다 (비즈니스 로직 두지 않음)
2. `pages` — 라우트 단위 화면. widgets/features/entities를 조립만 한다
3. `widgets` — 여러 feature/entity를 묶은 독립적인 UI 블록
4. `features` — 사용자 행위 단위 (예: 장바구니에 담기, 필터 적용)
5. `entities` — 도메인 모델 단위 (예: 상품, 주문, 유저)
6. `shared` — 도메인과 무관한 재사용 자원 (공통 ui 컴포넌트, utils, api 클라이언트)

---

### import 방향 규칙

- ✅ 상위 레이어 → 하위 레이어 import
- ❌ 하위 레이어 → 상위 레이어 import (예: `entities`가 `features`를 import)
- ❌ 같은 레이어의 다른 슬라이스 간 직접 import (예: `features/cart`가 `features/checkout`을 직접 import) — 필요하면 `pages`/`widgets`에서 조립

---

### 분석 순서

1. 파일이 어느 레이어에 속하는지 판단한다
2. 같은 레이어 안에서 어느 도메인(슬라이스)에 속하는지 판단한다 — `DOMAINS.md` 참조
3. import 방향이 규칙을 위반하는지 확인한다
4. 오버 엔지니어링 여부를 확인한다 (feature 하나에서만 쓰는 로직을 entities로 끌어올리는 등)

---

### 신규 파일 배치 제안 형식

```text
파일: useAddToCart.ts
레이어: features
도메인: cart (DOMAINS.md 참조)
경로 제안: src/features/cart/model/useAddToCart.ts
이유: 장바구니 담기라는 사용자 행위 단위이므로 features, cart 도메인 소유
```

---

### 리뷰 결과 형식

```text
파일명 | 위반 내용 | 제안
CartWidget.tsx | features/cart가 features/order를 직접 import | order 관련 로직은 상위(widgets/pages)에서 조립하도록 변경
```

---

### 안티패턴 체크

**오버 추상화**

```text
// ❌ feature 하나에서만 쓰는데 entities로 끌어올림
src/entities/cart-badge-count/

// ✅ 해당 feature 안에 둔다
src/features/cart/ui/CartBadge.tsx
```

**같은 레이어 슬라이스 간 직접 참조**

```text
// ❌
// src/features/cart/model/useCart.ts
import { useCheckout } from '@/features/checkout/model/useCheckout';

// ✅ 상위(pages/widgets)에서 조립
// src/widgets/cart-summary/CartSummaryWidget.tsx
import { useCart } from '@/features/cart';
import { useCheckout } from '@/features/checkout';
```

**app 레이어에 비즈니스 로직**

```text
// ❌
// src/app/products/page.tsx 안에서 필터링/정렬 로직 직접 계산

// ✅ features에서 가져와 조립만
// src/app/products/page.tsx
import { ProductFilterWidget } from '@/widgets/product-filter';
```

---

### 도메인 정보

레이어는 정해졌는데 어느 도메인 슬라이스에 속하는지 애매하면 `DOMAINS.md`를 참조한다. 새 도메인이 생기면 `DOMAINS.md`에 템플릿을 복사해 항목을 추가한다.
