# review SKILL

## 목적

코드를 목적에 맞게 분리 했는지 검토 요청시 다음 skill 기준으로 판별한다.

## 리뷰 결과 형태

파일명 | 내용

```text
orderHeader.tsx | 검색 로직이 UI단에 있어 분리 필요
```

## 대전제

아래의 경우는 오버 추상화로 지양한다.

- 한 컴포넌트에서만 쓰이는 경우
- 분리 했을 때 추적 비용이 더 커지는 경우
- useState 하나 감싸기 위한 레이어 생성

## components

- ✅ components 레이어만 보면 화면이 그려져야 한다.
- ✅ JSX 렌더링, 이벤트 바인딩
- ✅ 화면을 제어하는 상태 존재 가능

```text
//화면을 제어하는 상태 존재 가능 예시 - 모달 오픈
const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
```

- ✅ prop으로 받은 값을 그대로 커밋하지 않고 임시로 들고 있다가 사용자 액션(제출/Enter 등)으로 반영하는 draft 상태는 계산·검증이 없다면 화면 제어 상태로 본다.
  - 이 draft를 외부에서 바뀐 prop과 동기화해야 할 때는 `useEffect` 대신 렌더 중 이전 prop과 비교해 재설정하는 패턴을 쓴다 (React 공식 "Adjusting state when a prop changes" 패턴).
  - 계산·검증이 없고 단일 컴포넌트에서만 쓰인다면 대전제에 따라 훅으로 분리하지 않는다.

```text
// ✅ draft 상태 + prop 변경 시 렌더 중 재동기화 (useEffect 아님)
const [draftValue, setDraftValue] = useState(value);

const [prevValue, setPrevValue] = useState(value);
if (value !== prevValue) {
  setPrevValue(value);
  setDraftValue(value);
}
```

- ❌ axios, fetch 직접 호출하면 안된다.
- ❌ 비즈니스 로직이 존재하면 안된다.
  - 비즈니스 로직이란 : 필터 계산, 검색, 페이지네이션 로직 등...을 의미한다

## hooks

- ✅ hooks 레이어만 보면 기능이 이해되어야 한다.
- ✅ use 키워드로 파일명 시작
- ✅ 화면에서 반복되는 조합을 작성한다.
- ✅ JSX와 무관한 로직을 작성한다.
- ✅ 하나의 비즈니스 로직으로 구성되어야 한다.
- ✅ axios, fetch를 직접 호출하지 않고, 추상화된 레이어를 통해 호출한다.
- ✅ 비즈니스 로직을 포함한다. (필터 계산, 검색, 페이지네이션 로직 등...)
- ✅ 유효성 검증을 한다.
- ✅ loading, error, orders(정렬), 캐싱, 재요청, 중복 요청 제거, stale 상태 관리를 위임한다.
- ✅ props나 state로부터 계산 가능한 값을 정의한다.
- ✅ `useState` + `useEffect` 동기화 대신 파생값으로 처리한다.

```text
// ❌
const [fullName, setFullName] = useState('');
useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);

// ✅
const fullName = `${firstName} ${lastName}`;
```

- ❌ JSX 반환하면 안된다.
- ❌ axios, fetch 호출하면 안된다.

## services

- ✅ services 레이어만 보면 서버 통신이 파악되어야 한다.
- ✅ API 호출 함수
- ✅ 요청/응답 형태 변환을 한다.
- ✅ 공통 에러를 변환한다.
- ❌ useState, useEffect 등 Hook 사용하면 안된다.

## utils

- ✅ 순수 함수로 구성되어 있어야 한다.
- ✅ 중복되는 곳이 2번 이상인 경우 작성한다.
- ✅ export function `함수명`(){} 으로 작성한다.
- ❌ JSX 반환하면 안된다.
- ❌ useState, useEffect 등 Hook 사용하면 안된다.
- ❌ 외부 상태에 의존하면 안된다. (같은 입력인데 다른 출력이 나오는 것)

### 순수 함수 판별 기준

React Hook 사용 여부(useState, useEffect)가 아니라 **같은 입력에 항상 같은 출력이 보장되는가**로 판단한다.

```text
// ❌ 순수 함수가 아님 — new Date()로 인해 호출 시점마다 결과가 달라짐
const isNew = (createdAt: string) => {
  const days = (new Date().getTime() - new Date(createdAt).getTime()) / MS_PER_DAY;
  return days <= NEW_PRODUCT_DAYS;
};

// ✅ 순수 함수 — 같은 입력이면 항상 같은 출력
const formatPrice = (price: number) => price.toLocaleString() + '원';
```
