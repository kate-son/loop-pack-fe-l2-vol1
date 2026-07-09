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

- Compound: 암시적 상태 공유가 필요한 경우에만
- Headless: 같은 로직에 다른 UI가 필요한 경우에만
- 패턴이 불필요한 곳에 적용되면 복잡도만 증가

| 패턴                    | 적용 조건                                                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| Compound                | 하위 컴포넌트끼리 암시적 상태 공유가 필요한 경우에만 (예: Tabs.Trigger ↔ Tabs.Content)                                                |
| Headless                | 같은 로직에 다른 UI가 2곳 이상 필요한 경우에만 (예: 드롭다운 vs 바텀시트)                                                             |
| Controlled/Uncontrolled | open·value를 컴포넌트 안에서도, 부모가 밖에서도 다뤄야 하는 경우 (open prop 유무로 분기)                                              |
| Provider vs Singleton   | 전역에서 어디서든 소환해야 하는 경우 → 컴포넌트 트리 밖(.ts 파일 등)에서도 호출해야 하면 Singleton, React 트리 안에서만 쓰면 Provider |

기준은 항상 "이걸 쓰면 사용처 코드가 더 단순해지나?"

### 안티패턴 체크

- Button, Badge처럼 상태 공유가 필요 없는 단순 컴포넌트에 Compound를 붙이지 않았는가
- Headless 훅이 JSX나 특정 DOM 구조를 직접 리턴하지 않는가 (UI 결정권을 사용처에 완전히 넘겼는가)
- selected/value 상태가 문자열 id만이 아니라 옵션 객체 전체인가 (가격, 배송 계산 등에 필요한 값에 바로 접근 가능한가)
- 선택 여부 비교를 객체 참조(===)가 아니라 고유 id 기준으로 하는가
- Dialog/Modal의 Content, Overlay가 Portal로 렌더되는가 (부모 CSS 제약 회피)
- controlled/uncontrolled 판별이 `open !== undefined` 같은 명확한 기준으로 되어 있는가
- `aria-expanded={open}`처럼 로직 계층이 가진 상태값을 그대로 반영하거나, `role="listbox"`처럼 그 컴포넌트라면 항상 고정인 의미만 로직 계층에 있고, `className`/구체적 DOM 구조 같은 진짜 UI 결정은 사용처로 넘겼는가
- 이벤트 핸들러와 관련 aria 속성을 각각 따로 리턴/전달해서 사용처가 하나씩 누락할 여지를 남기지 않고, `getTriggerProps()` 같은 Prop Getter(또는 Compound 서브컴포넌트 내부 캡슐화)로 묶어 처리하는가

### 로직 계층의 a11y 경계

"UI 결정권이 없어야 한다"는 원칙과 "`aria-*`/`role`은 어디서든 필요하다"는 현실이 충돌하는 지점이라 별도로 짚는다. 이 경계는 Headless 훅뿐 아니라, Compound의 개별 서브컴포넌트(`Trigger`, `Close` 등 상태를 Context에서 꺼내 쓰는 쪽)에도 동일하게 적용된다 — 상태와 로직을 쥔 쪽이 어디든(훅이든 Context를 구독하는 서브컴포넌트든) 같은 기준으로 판단한다.

- **동작 원리**: 개발자가 DOM에 `aria-*` 값만 정확히 반영하면, 브라우저가 접근성 트리를 자동 갱신해 스크린리더에 전달한다. 별도 API 호출이 필요 없다.
- **로직 계층에 있어도 되는 것** (컴포넌트 종류에 따라 값만 바뀔 뿐, UI 형태와 무관하게 항상 고정된 의미):
  - `aria-expanded={open}`, `aria-selected`, `aria-checked`, `aria-disabled`, `aria-hidden` — 이미 가진 상태값을 그대로 옮기는 것
  - `role="listbox"`/`"option"`/`"dialog"`, `aria-haspopup`, `aria-controls`, `aria-activedescendant`, `aria-labelledby`/`aria-describedby` — "이 컴포넌트라면 항상 이 의미"라서 UI 형태와 무관
  - 예) Headless: `useSelect`가 `getTriggerProps()`로 `aria-expanded`/`role` 반환 · Compound: `Dialog.Trigger`가 Context의 `open`을 읽어 `aria-haspopup="dialog"`/`aria-expanded`를 자체적으로 붙임 — 둘 다 같은 원칙의 다른 구현체일 뿐
- **로직 계층에 있으면 안 되는 것**: `className`, 구체적 DOM 구조/태그 선택 등 — 이건 진짜 UI 결정이라 사용처의 몫 (단, `asChild` 패턴처럼 태그 자체의 선택권을 사용처에 넘기는 것은 허용)
- **Prop Getter / 캡슐화 패턴**: 이벤트 핸들러 + 관련 aria 속성을 묶어서 반환·전달하면, 사용처가 개별 prop을 하나씩 스프레드하다 실수로 빠뜨리는 걸 방지한다.

  ```js
  // Headless 예시
  function useSelect(items) {
    const [open, setOpen] = useState(false);
    const getTriggerProps = () => ({
      onClick: toggle,
      'aria-expanded': open,
      role: 'button',
      'aria-haspopup': 'listbox',
    });
    return { open, highlight, getTriggerProps };
  }
  ```

  ```jsx
  // Compound 예시 - 캡슐화 방식은 다르지만 같은 원칙
  function Trigger({ children }) {
    const { open, setOpen } = useContext(DialogContext);
    return (
      <button onClick={() => setOpen(true)} aria-haspopup="dialog" aria-expanded={open}>
        {children}
      </button>
    );
  }
  ```

- `item.disabled` 같은 옵션별 데이터도 로직 계층이 새로 계산하지 않고, 이미 넘어온 데이터를 그대로 읽어서 옵션별 props(`aria-disabled` 등)에 반영한다.

### 개선안 제시 형식

- 현재 구조의 장점: ...
- 개선 포인트: ...
- 대안: ...
