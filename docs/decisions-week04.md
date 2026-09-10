# 4주차 판단 근거

### Next.js 세팅 / 하네스

**기존 3주차 React(Vite) 프로젝트의 하네스(ESLint/husky)를 그대로 가져와 이식했습니다.**

Next.js가 기본으로 세팅해주는 ESLint와 비교해서 중복되는 규칙은 구분해서 뺐습니다.
Next 기본 룰 중 일부는 warn을 error로 올렸습니다. 규칙별 판단 근거는 `docs/eslint-rules.md`에 정리했습니다.

**(번외) CLAUDE.md와 skills도 3주차에서 그대로 가져왔는데, 이번 4주차를 진행하면서 CLAUDE.md에 컴포넌트 규칙 같은 skill성 내용이 계속 추가되고 있는 걸 발견해서 그 부분을 기존 skill에 추가 및 기존 skill 정리 했습니다.**

### Select

**Select는 Headless(`useSelect` 훅)와 Compound 두 가지 방식 모두로 구현했습니다.**

Headless로 구현하는 건 UI의 자유도를 위한 것이지만, 기본 디자인으로 SelectBox를 써야 하는 상황도 있을 것 같아서 default 구현을 위해 Compound로도 쓸 수 있게 했습니다.
Radix UI도 Compound로 구현돼 있길래, SelectBox를 Compound로 하면 어떤 모습일지 궁금하기도 했습니다.

**Select의 로직은 `useSelect` 훅 + Prop Getter(`getTriggerProps`/`getListboxProps`/`getOptionProps`) 방식으로 구현했습니다.**

같은 로직으로 텍스트형, 사이즈형, 썸네일형 등 서로 다른 옵션 UI를 렌더해야 했기 때문입니다.

**Select의 `value`는 문자열(id)이 아니라 옵션 객체 전체로 다뤘습니다.**

단일 id만 가져오면, 나중에 선택된 데이터로 파생 로직을 수행할 때마다 전체 `options`를 `map`/`forEach`로 돌려서 다시 찾아야 하는 단점이 있습니다.
그래서 객체 자체를 그대로 받아 바로 데이터를 활용할 수 있게 구현했습니다.

**a11y 속성(`role`/`aria-*`)은 UI가 아니라 `useSelect` 훅 안에서 관리해 주입하도록 했습니다.**

이번 과제 요구사항에는 없는 항목이지만, 멘토링 때 접근성 관련 질문을 드려 반영하고자 적용했습니다.
Headless 패턴은 UI를 자유롭게 커스텀할 수 있으니 "그럼 태그에 직접 props로 지정하면 되지 않나" 싶을 수 있지만, a11y 속성은 hook이 가진 상태에 의해 값이 결정되는 경우가 있고 UI 형태와 무관하게 잘 변하지 않는 값이라, UI가 아니라 hook 쪽에 두기로 했습니다.
접근성을 적용한 디자인 패턴을 잘 구현하고 있는지 확인하기 위해 skill에 a11y 관련된 내용을 추가했습니다.

### Dialog

**Dialog는 Context 기반 Compound component로 구현했습니다.**

Dialog는 UI 레이어가 명확합니다(header, content, bottom) -> 그 안의 내용물만 갈아끼우면 되는 구조라 Compound로 구현했습니다.

**Dialog의 controlled/uncontrolled는 `open` prop 유무로 판별합니다.**

`open`이 넘어왔다는 건 부모 컴포넌트가 값을 넘겼다는 뜻이므로, `open`과 `setOpen`(부모로부터 오는 `onOpenChange`) 둘 다 넘어와야 controlled로 보기로 정했습니다.
`Title`/`Description`도 안에 내용이 없으면 `null`을 반환해서 렌더를 막도록 했습니다.

**Dialog의 `Overlay`/`Content`는 Portal로 렌더했습니다.**

부모 요소의 overflow나 stacking context에 영향받지 않고 항상 최상단에 뜨게 하려고 했습니다.

**`Dialog.Overlay`는 prop이 아니라 별도 Compound 조각으로 유지했습니다.**

처음엔 prop으로 유지하려 했습니다. "다이얼로그가 뜬다는 건 Dim이 무조건 뜬다"는 취지로 구현했었고, Compound 조각으로 두면 사용자가 빠뜨릴 수 있지 않을까 싶어 강제한 것이었습니다.
그런데 과제에 Overlay를 Compound 조각으로 두라는 부분이 있었고, Radix UI를 확인해보니 Overlay가 사용자에 의해 누락되는 것도 강제하지 않는다는 걸 알게 되어 방향을 바꿨습니다.

**Esc/오버레이 클릭 닫기는 `onEscapeKeyDown`/`onOverlayClick` 콜백으로 폭넓게 열어뒀습니다.**

디자인 패턴이다 보니 특정 key 값에 대해 커스텀하고 싶은 경우도 있을 것 같았고, 특정 버튼에 의해 닫히는 경우도 있을 것 같아 넓게 잡았습니다.
단, 아무것도 정의하지 않으면 기본값으로 Esc/오버레이 클릭 둘 다로 닫힙니다.

**`closeOnOutsideInteraction`을 추가로 뒀습니다.**

Esc만으로 닫고 싶으면 오버레이 클릭 콜백에 `e.preventDefault()`를 추가하면 되고 반대도 마찬가지지만, 둘 다 막고 싶을 때 두 콜백에 각각 `e.preventDefault()`를 넣는 건 가독성이 안 좋다고 판단했습니다.
그래서 Esc/오버레이 클릭을 한 번에 막는 prop을 추가했습니다.

**Dialog는 Select와 다른 a11y로 구성되어 있는 것 같아 시간 관계상 이번 주차에 적용하지 않았습니다.**

### 공통

**`useDialog`/`useSelectRoot`처럼 각 컴포넌트의 로직을 별도 훅으로 분리하여 각 디자인 패턴의 로직 부분과 View와 구분 했습니다.**
