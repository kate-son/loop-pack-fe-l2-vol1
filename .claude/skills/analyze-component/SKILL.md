---
name: analyze-component
description: 컴포넌트의 리렌더 경로·책임 범위·패턴 적합성(Compound/Headless/Controlled-Uncontrolled/Provider-Singleton)을 점검한다. 새 공통 컴포넌트를 설계하거나 기존 컴포넌트에 패턴을 적용할 때, 혹은 패턴 적용이 과한지 판단이 필요할 때 사용한다.
---

### 분석 순서

1. Props / State / Context 의존성을 나열한다
2. 부모 리렌더 시 이 컴포넌트가 리렌더되는 경로를 추적한다
3. 적용된 패턴(Compound / Headless / Controlled-Uncontrolled / Provider-Singleton)이 적합한지 평가한다
4. 개선안은 "현재 구조의 장점 / 개선 포인트 / 대안" 형태로 제시한다

### 판단 기준

- 패턴이 불필요한 곳에 적용되면 복잡도만 증가
- 기준은 항상 "이걸 쓰면 사용처 코드가 더 단순해지나?"

| 패턴                    | 적용 조건                                                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Compound                | 하위 컴포넌트끼리 암시적 상태 공유가 필요한 경우에만 (예: Tabs.Trigger ↔ Tabs.Content)                                                |
| Headless                | 같은 로직에 다른 UI가 2곳 이상 필요한 경우에만 (예: 드롭다운 vs 바텀시트)                                                             |
| Controlled/Uncontrolled | open·value를 컴포넌트 안에서도, 부모가 밖에서도 다뤄야 하는 경우 (open prop 유무로 분기)                                              |
| Provider vs Singleton   | 전역에서 어디서든 소환해야 하는 경우 → 컴포넌트 트리 밖(.ts 파일 등)에서도 호출해야 하면 Singleton, React 트리 안에서만 쓰면 Provider |

### 안티패턴 체크

- Button, Badge처럼 상태 공유가 필요 없는 단순 컴포넌트에 Compound를 붙이지 않았는가
- Headless 훅이 JSX나 특정 DOM 구조를 직접 리턴하지 않는가 (UI 결정권을 사용처에 완전히 넘겼는가)
- selected/value 상태가 문자열 id만이 아니라 옵션 객체 전체인가 (가격, 배송 계산 등에 필요한 값에 바로 접근 가능한가)
- 선택 여부 비교를 객체 참조(===)가 아니라 고유 id 기준으로 하는가
- Dialog/Modal의 Content, Overlay가 Portal로 렌더되는가 (부모 CSS 제약 회피)
- controlled/uncontrolled 판별이 `open !== undefined` 같은 명확한 기준으로 되어 있는가

### 개선안 제시 형식

- 현재 구조의 장점: ...
- 개선 포인트: ...
- 대안: ...
