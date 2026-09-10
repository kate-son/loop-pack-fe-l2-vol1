# 10주차 CI 기록

이 문서는 CI 실행 결과와 판단 근거를 모은다. 실행하지 않은 항목은 완료로 적지 않는다.

## 1단계 — CI 파이프라인 측정·최적화

### 0단계 — Before 측정 조건

| 항목          | 고정 조건                                    |
| ------------- | -------------------------------------------- |
| 이벤트        | `pull_request`                               |
| 기준 commit   | 측정 시작 시 기록                            |
| runner        | `ubuntu-latest`                              |
| Node·pnpm     | `.nvmrc`, `package.json#packageManager`      |
| 검증 순서     | test → lint → typecheck → build              |
| 설치          | `pnpm install --frozen-lockfile`             |
| 브라우저 설치 | 현재 `quality` job의 Chromium 설치 step 포함 |

`pnpm check`를 네 step으로 나눴다. 명령의 순서와 검증 범위는 유지하며, 각 검증의 시간을 Actions 화면에서 구분하기 위한 변경이다. 이 단계에서는 병목을 제거하거나 검증을 생략하지 않는다.

### 표본 분류

- cold: 실행 로그에서 의존성 cache restore가 확인되지 않은 실행이다.
- warm: 실행 로그에서 cache restore가 확인된 실행이다.
- cache 상태를 로그로 확인하지 못한 실행은 cold 또는 warm 표본에 넣지 않는다.

### Before 결과

| 구분   | run URL | commit | 전체 시간 | install | Chromium | test | lint | typecheck | build | cache 상태 |
| ------ | ------- | ------ | --------: | ------: | -------: | ---: | ---: | --------: | ----: | ---------- |
| cold 1 | 미측정  | -      |         - |       - |        - |    - |    - |         - |     - | -          |
| cold 2 | 미측정  | -      |         - |       - |        - |    - |    - |         - |     - | -          |
| cold 3 | 미측정  | -      |         - |       - |        - |    - |    - |         - |     - | -          |
| warm 1 | 미측정  | -      |         - |       - |        - |    - |    - |         - |     - | -          |
| warm 2 | 미측정  | -      |         - |       - |        - |    - |    - |         - |     - | -          |
| warm 3 | 미측정  | -      |         - |       - |        - |    - |    - |         - |     - | -          |

측정 뒤 각 조건의 raw 값·중앙값·범위를 표 아래에 기록한다. 가장 긴 step은 이 결과를 바탕으로 지목한다.

### 이후 순서

1. Before cold/warm 표본을 각각 3회 이상 확보한다.
2. 가장 긴 step만 대상으로 변경한다.
3. cache hit/miss를 별도 실험으로 확인하고 lockfile을 원복한다.
4. 같은 조건에서 After를 측정한다.
