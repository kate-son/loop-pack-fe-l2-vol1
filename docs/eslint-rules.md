# ESLint 규칙

`eslint.config.mjs`가 가져오는 `eslint-config-next/core-web-vitals`(nextVitals)와 `eslint-config-next/typescript`(nextTs)에 어떤 규칙이 있는지, 이 프로젝트(App Router, GA 미사용)에서 기본값을 유지할지/override할지 내 판단을 정리한다.

기준: `eslint-config-next@16.2.10`

- `pnpm exec eslint --print-config <file>` 통해 최신 확인 가능
- "기본값 유지 or override" / "내 판단 근거"가 비어있는 행은 아직 판단 전.

## nextVitals (`eslint-config-next/core-web-vitals`)

### `@next/next/*`

| 규칙                                            | 기본값  | 기본값 유지 or override | 내 판단 근거                                                                                   |
| ----------------------------------------------- | ------- | ----------------------- | ---------------------------------------------------------------------------------------------- |
| `google-font-display`                           | `warn`  | 유지                    | `next/font` 쓰면 이 규칙 대상(수동 Google Fonts `<link>`) 자체가 아니라서 error로 볼 필요 없음 |
| `google-font-preconnect`                        | `warn`  | 유지                    | 지연 정도가 네트워크 환경마다 달라서 error로 단정하기 어려움                                   |
| `next-script-for-ga`                            | `warn`  | 유지                    | GA 미사용이라 걸릴 코드 자체가 없어 무관                                                       |
| `no-async-client-component`                     | `warn`  | **error로 override**    | `"use client"` 컴포넌트를 async로 선언하면 항상 깨지는 케이스라 warn으로 둘 이유가 없음        |
| `no-before-interactive-script-outside-document` | `warn`  | **error로 override**    | 루트 레이아웃이 아닌 곳에 두는 비정상 케이스만 잡는 규칙 — 정상적인 루트 사용은 안 걸림        |
| `no-css-tags`                                   | `warn`  | 유지                    | 개발자 스타일 차이 영역                                                                        |
| `no-head-element`                               | `warn`  | 유지                    | App Router라 `_document` 자체가 없어 해당 코드 없음 — 굳이 안 건드림                           |
| `no-html-link-for-pages`                        | `error` | 유지                    | 내부 라우팅에 `<a>` 쓰면 항상 풀 리로드되는 확정적 버그                                        |
| `no-img-element`                                | `warn`  | 유지                    | 지금 프로젝트에 무관하다고 판단                                                                |
| `no-page-custom-font`                           | `warn`  | 유지                    | 지금 프로젝트에 무관하다고 판단                                                                |
| `no-styled-jsx-in-document`                     | `warn`  | 유지                    | Pages Router 전용이라 해당 코드 없음                                                           |
| `no-sync-scripts`                               | `error` | 유지                    | 동기 스크립트는 항상 렌더링을 막는 확정적 문제                                                 |
| `no-title-in-document-head`                     | `warn`  | 유지                    | 크리티컬하지 않다고 판단                                                                       |
| `no-typos`                                      | `warn`  | **error로 override**    | Next 예약 함수명 오타는 조용히 무시돼서 버그를 숨기는 셈 — warn으로는 놓치기 쉬움              |
| `no-unwanted-polyfillio`                        | `warn`  | **error로 override**    | Next가 이미 자동 처리하는 폴리필을 실수로 중복 추가하는 걸 확실히 막기 위함                    |
| `inline-script-id`                              | `error` | 유지                    | XSS 방지 목적이라 error 유지                                                                   |
| `no-assign-module-variable`                     | `error` | 유지                    | 예약된 `module` 변수를 덮어쓰면 webpack이 깨지는 필수 규칙                                     |
| `no-document-import-in-page`                    | `error` | 유지                    | 현재 프로젝트에 맞다고 판단 (Pages Router 전용이라 실제로는 걸릴 코드 없음)                    |
| `no-duplicate-head`                             | `error` | 유지                    | error가 맞다고 판단                                                                            |
| `no-head-import-in-document`                    | `error` | 유지                    | error가 맞다고 판단                                                                            |
| `no-script-component-in-head`                   | `error` | 유지                    | error가 맞다고 판단                                                                            |

### `react/*`

기본값이 `error`인 규칙 대부분은 이미 리액트 필수 패턴(명확한 버그/레거시 API)이라 default가 error인 게 맞다고 판단 — 그대로 유지.

| 규칙                       | 기본값  | 기본값 유지 or override | 내 판단 근거                                                                                                                      |
| -------------------------- | ------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `display-name`             | `error` | 유지                    |                                                                                                                                   |
| `jsx-key`                  | `error` | 유지                    |                                                                                                                                   |
| `jsx-no-comment-textnodes` | `error` | 유지                    |                                                                                                                                   |
| `jsx-no-duplicate-props`   | `error` | 유지                    |                                                                                                                                   |
| `jsx-no-target-blank`      | `off`   | **error로 override**    | `target="_blank"`에 `rel="noopener noreferrer"` 없으면 새 탭이 `window.opener`로 원래 탭을 조작 가능한 보안 취약점(리버스 탭내빙) |
| `jsx-no-undef`             | `error` | 유지                    |                                                                                                                                   |
| `jsx-uses-react`           | `error` | 유지                    |                                                                                                                                   |
| `jsx-uses-vars`            | `error` | 유지                    |                                                                                                                                   |
| `no-children-prop`         | `error` | 유지                    |                                                                                                                                   |
| `no-danger-with-children`  | `error` | 유지                    |                                                                                                                                   |
| `no-deprecated`            | `error` | 유지                    |                                                                                                                                   |
| `no-direct-mutation-state` | `error` | 유지                    |                                                                                                                                   |
| `no-find-dom-node`         | `error` | 유지                    |                                                                                                                                   |
| `no-is-mounted`            | `error` | 유지                    |                                                                                                                                   |
| `no-render-return-value`   | `error` | 유지                    |                                                                                                                                   |
| `no-string-refs`           | `error` | 유지                    |                                                                                                                                   |
| `no-unescaped-entities`    | `error` | 유지                    |                                                                                                                                   |
| `no-unknown-property`      | `off`   | 유지                    | 커스텀 속성/라이브러리와 충돌 가능성이 있어 error로 강제하면 불편함이 생김                                                        |
| `no-unsafe`                | `off`   | 유지                    | 클래스 컴포넌트를 안 쓸 예정이라 무관                                                                                             |
| `prop-types`               | `off`   | 유지                    | TypeScript가 이미 타입 체크를 해주므로 중복                                                                                       |
| `react-in-jsx-scope`       | `off`   | 유지 (재선언)           | React 17+ 자동 JSX 변환 이후로는 파일마다 `import React`를 강제할 필요가 없어짐                                                   |
| `require-render-return`    | `error` | 유지                    |                                                                                                                                   |

### `react-hooks/*`

React Compiler 안전성 확보를 위한 필수 패턴이라 기본값이 `error`인 규칙들은 그대로 유지.

| 규칙                          | 기본값  | 기본값 유지 or override | 내 판단 근거                                                                                           |
| ----------------------------- | ------- | ----------------------- | ------------------------------------------------------------------------------------------------------ |
| `rules-of-hooks`              | `error` | 유지 (재선언)           | hook을 잘못된 위치(조건문)에서 호출하면 렌더링 호출 순서가 달라져 버그 유발 가능                       |
| `exhaustive-deps`             | `warn`  | **error로 override**    | 변경될 값을 deps에서 빠뜨리면 stale closure로 버그가 발생하는데 놓치기 쉬워서                          |
| `static-components`           | `error` | 유지                    |                                                                                                        |
| `use-memo`                    | `error` | 유지                    |                                                                                                        |
| `preserve-manual-memoization` | `error` | 유지                    |                                                                                                        |
| `incompatible-library`        | `warn`  | 유지                    | 안 쓰는 라이브러리라 무관                                                                              |
| `immutability`                | `error` | 유지                    |                                                                                                        |
| `globals`                     | `error` | 유지                    |                                                                                                        |
| `refs`                        | `error` | 유지                    |                                                                                                        |
| `set-state-in-effect`         | `error` | 유지                    |                                                                                                        |
| `error-boundaries`            | `error` | 유지                    |                                                                                                        |
| `purity`                      | `error` | 유지                    |                                                                                                        |
| `set-state-in-render`         | `error` | 유지                    |                                                                                                        |
| `unsupported-syntax`          | `warn`  | 유지                    | 개발자가 컴파일러에 의지하지 않고 직접 최적화를 커스텀할 수도 있는 상황이 있어서 error로 강제하지 않음 |
| `config`                      | `error` | 유지                    |                                                                                                        |
| `gating`                      | `error` | 유지                    |                                                                                                        |

### `jsx-a11y/*`

| 규칙                           | 기본값                                                                  | 기본값 유지 or override | 내 판단 근거                                                              |
| ------------------------------ | ----------------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------- |
| `alt-text`                     | `warn` (옵션에 `img: ['Image']` 포함 — next/image도 기본으로 검사 대상) | **error로 override**    | 접근성(a11y) 초기부터 강제. 나중에 추가 시 공수가 크므로                  |
| `aria-props`                   | `warn`                                                                  | **error로 override**    | 개발자의 접근성을 넣었다는 착각을 일으키기 때문에 오류 방치 가능성이 높음 |
| `aria-proptypes`               | `warn`                                                                  | **error로 override**    | 태그를 쓰는 순간 개발자의 실수를 잡아줘야 함 — 접근성은 명확함이 중요     |
| `aria-unsupported-elements`    | `warn`                                                                  | **error로 override**    | 태그를 쓰는 순간 개발자의 실수를 잡아줘야 함 — 접근성은 명확함이 중요     |
| `role-has-required-aria-props` | `warn`                                                                  | **error로 override**    | 태그를 쓰는 순간 개발자의 실수를 잡아줘야 함 — 접근성은 명확함이 중요     |
| `role-supports-aria-props`     | `warn`                                                                  | **error로 override**    | 태그를 쓰는 순간 개발자의 실수를 잡아줘야 함 — 접근성은 명확함이 중요     |

### 기타

| 규칙                                 | 기본값 | 기본값 유지 or override | 내 판단 근거                                              |
| ------------------------------------ | ------ | ----------------------- | --------------------------------------------------------- |
| `import/no-anonymous-default-export` | `warn` | 유지                    | 스타일 권장 규칙이라 강제(error)까지는 안 해도 될 것 같음 |

---

## nextTs (`eslint-config-next/typescript`)

`.ts`/`.tsx`/`.mts`/`.cts` 대상. 전부 AST(문법 구조)만으로 판단 가능한 규칙들 — 타입 추론이 필요한 규칙(`no-floating-promises` 등)은 없음. `parserOptions.project`/`projectService`가 꺼져 있어 타입 정보 자체를 못 보기 때문.

### JS 코어 규칙

TypeScript 컴파일러가 애초에 컴파일 에러로 막아주는 문법 오류들이라 ESLint에서 중복 검사할 필요 없음 — off 21개 전부 유지.

| 규칙                           | 기본값  | 기본값 유지 or override | 내 판단 근거                                                                |
| ------------------------------ | ------- | ----------------------- | --------------------------------------------------------------------------- |
| `constructor-super`            | `off`   | 유지                    |                                                                             |
| `getter-return`                | `off`   | 유지                    |                                                                             |
| `no-class-assign`              | `off`   | 유지                    |                                                                             |
| `no-const-assign`              | `off`   | 유지                    |                                                                             |
| `no-dupe-args`                 | `off`   | 유지                    |                                                                             |
| `no-dupe-class-members`        | `off`   | 유지                    |                                                                             |
| `no-dupe-keys`                 | `off`   | 유지                    |                                                                             |
| `no-func-assign`               | `off`   | 유지                    |                                                                             |
| `no-import-assign`             | `off`   | 유지                    |                                                                             |
| `no-new-native-nonconstructor` | `off`   | 유지                    |                                                                             |
| `no-new-symbol`                | `off`   | 유지                    |                                                                             |
| `no-obj-calls`                 | `off`   | 유지                    |                                                                             |
| `no-redeclare`                 | `off`   | 유지                    |                                                                             |
| `no-setter-return`             | `off`   | 유지                    |                                                                             |
| `no-this-before-super`         | `off`   | 유지                    |                                                                             |
| `no-undef`                     | `off`   | 유지                    |                                                                             |
| `no-unreachable`               | `off`   | 유지                    |                                                                             |
| `no-unsafe-negation`           | `off`   | 유지                    |                                                                             |
| `no-with`                      | `off`   | 유지                    |                                                                             |
| `no-var`                       | `error` | 유지 (재선언)           | var 사용 금지, const/let 사용 강제                                          |
| `prefer-const`                 | `error` | 유지                    | `let`으로 선언하고 재할당을 안 하면 "어디서 할당하는 거지" 헷갈릴 수 있어서 |
| `prefer-rest-params`           | `error` | **off로 override**      | 스타일에 따른 차이라 `arguments` 사용을 굳이 강제로 막을 필요는 없다고 판단 |
| `prefer-spread`                | `error` | 유지                    | 스프레드 문법(`...args`)을 선호해서 강제해도 무방                           |

### `@typescript-eslint/*`

`no-unused-expressions` 제외 대부분 TS 오용/오타를 잡는 명확한 규칙들이라 기본값(주로 `error`) 유지.

| 규칙                                  | 기본값  | 기본값 유지 or override | 내 판단 근거                                                                                                  |
| ------------------------------------- | ------- | ----------------------- | ------------------------------------------------------------------------------------------------------------- |
| `ban-ts-comment`                      | `error` | 유지 (재선언)           | ts-ignore, ts-nocheck 같은 주석으로 TypeScript 에러를 숨기는 것 방지                                          |
| `no-array-constructor`                | `error` | 유지                    |                                                                                                               |
| `no-duplicate-enum-values`            | `error` | 유지                    |                                                                                                               |
| `no-empty-object-type`                | `error` | 유지                    |                                                                                                               |
| `no-explicit-any`                     | `error` | 유지 (재선언)           | any 사용 시 타입 검사가 없어 확인 불가능 — 타입 확인을 강제하기 위해                                          |
| `no-extra-non-null-assertion`         | `error` | 유지                    |                                                                                                               |
| `no-misused-new`                      | `error` | 유지                    |                                                                                                               |
| `no-namespace`                        | `error` | 유지                    |                                                                                                               |
| `no-non-null-asserted-optional-chain` | `error` | 유지                    |                                                                                                               |
| `no-require-imports`                  | `error` | 유지                    |                                                                                                               |
| `no-this-alias`                       | `error` | 유지                    |                                                                                                               |
| `no-unnecessary-type-constraint`      | `error` | 유지                    |                                                                                                               |
| `no-unsafe-declaration-merging`       | `error` | 유지                    |                                                                                                               |
| `no-unsafe-function-type`             | `error` | 유지                    |                                                                                                               |
| `no-unused-expressions`               | `warn`  | **error로 override**    | 결과를 안 쓰더라도 어쨌든 연산은 실행되는 것이므로, 대부분 `if`/`return`/`=`를 빼먹은 실수라 명확히 잡아야 함 |
| `no-unused-vars`                      | `warn`  | 유지 (재선언)           | 개발 중 임시로 변수를 선언하는 경우가 많아 warn으로 처리                                                      |
| `no-wrapper-object-types`             | `error` | 유지                    |                                                                                                               |
| `prefer-as-const`                     | `error` | 유지                    |                                                                                                               |
| `prefer-namespace-keyword`            | `error` | 유지                    |                                                                                                               |
| `triple-slash-reference`              | `error` | 유지                    |                                                                                                               |

---

## 프로젝트 전용 추가 규칙 (nextVitals/nextTs에 없는, 직접 추가한 규칙)

| 규칙                                         | 기본값 유지 or override                           | 내 판단 근거                                                                                |
| -------------------------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `@typescript-eslint/consistent-type-imports` | 신규 추가 (`error`)                               | 타입을 런타임에 값처럼 가져오면 번들 사이즈가 커지므로 `type Foo`로 import하도록 강제       |
| `react/no-danger`                            | 신규 추가 (`error`)                               | `dangerouslySetInnerHTML` 사용 시 악성 스크립트 실행(XSS) 방지                              |
| `no-eval`                                    | 신규 추가 (`error`)                               | `eval()` 사용 시 악성 스크립트 실행(XSS) 위험 방지                                          |
| `no-console`                                 | 신규 추가 (`warn`)                                | 개발 중 디버깅용으로 흔히 쓰여 warn 처리. CI/CD 도입 시 error로 분기 검토                   |
| `no-magic-numbers`                           | 신규 추가 (`error`, `0,1,-1,24,60,100,1000` 제외) | 고정값은 상수로 관리하도록 강제. 단 시간 단위 변환값·퍼센트처럼 의미가 자명한 단위값은 예외 |
| `no-nested-ternary`                          | 신규 추가 (`error`)                               | 삼항 연산자 중첩은 가독성이 떨어져서                                                        |
| `no-empty`                                   | 신규 추가 (`error`)                               | 빈 블록으로 에러를 무시하는 패턴 방지                                                       |
