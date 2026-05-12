# 14개 검증 도구 역할표

> 플러그인이 어떻게 품질을 지키는지 알고 싶은 분께. 워크스페이스의 `tools/` 안에 있는 14 개 도구가 각각 무엇을 막아내는지 정리했습니다.

## 한눈에 보는 분류

```
┌────────────────────────────────────────────────────┐
│ 분석 단계 검증 (5종)                                  │
│   · drift-validator                                 │
│   · schema-validator                                │
│   · spectral-runner                                 │
│   · static-runner                                   │
│   · sql-inventory-extractor (v2.2 신규)             │
├────────────────────────────────────────────────────┤
│ 형식화 단계 검증 (3종)                                │
│   · decision-table-validator                        │
│   · formal-spec-link-validator                      │
│   · characterization-coverage-validator (v2.1 신규) │
├────────────────────────────────────────────────────┤
│ 체인 하네스 검증 (5종)                                │
│   · chain-driver                                    │
│   · planning-extraction-validator                   │
│   · chain-coverage-validator                        │
│   · spec-test-link-validator                        │
│   · test-impl-pass-validator                        │
├────────────────────────────────────────────────────┤
│ 추적성 (1종)                                          │
│   · traceability-matrix-builder                     │
└────────────────────────────────────────────────────┘
```

## 분석 단계 검증

### 1. `drift-validator`

- **하는 일**: 산출물(JSON/YAML) 과 실제 코드의 정합성을 자동 비교.
- **막는 것**: 코드는 바뀌었는데 명세는 그대로인 "표류(drift)" 상태.
- **실패 시**: 어느 필드가 어디서 어긋났는지 라인 단위로 출력.
- **언제 호출**: 모든 분석 phase 종료 직후.

### 2. `schema-validator`

- **하는 일**: 31 종 JSON Schema 에 산출물이 맞는지 Ajv 8 으로 검증.
- **막는 것**: 형식만 맞는 척하는 빈 산출물, 누락 필드, 잘못된 타입.
- **실패 시**: violation 목록 + 어느 schema 의 어느 path 가 깨졌는지.

### 3. `spectral-runner`

- **하는 일**: OpenAPI 명세를 Stoplight Spectral 로 검증.
- **막는 것**: 잘못된 status code 매핑, 누락된 schema 참조, 응답 일관성 깨짐.
- **실패 시**: Spectral 표준 에러 출력 + 사내 룰셋 추가 violation.

### 4. `static-runner`

- **하는 일**: Semgrep / PMD / SpotBugs 같은 진짜 정적 분석 도구를 통합 실행.
- **막는 것**: AI 에게 "Semgrep 처럼 행동해" 라는 페르소나 시뮬레이션 (★ §8.1 절대 금지).
- **실패 시**: 도구 미설치 시 사용자에게 환경 준비 요청 + 신뢰도 -5%p 패널티 표시.

### 5. `sql-inventory-extractor` (v2.2 신규)

- **하는 일**: 매퍼 XML 에서 SQL 을 11 개 컬럼으로 추출.
- **막는 것**: SQL 단위 누락 — "어떤 화면이 어떤 테이블을 건드리는가" 추적 불가 상태.
- **실패 시**: 자동화율이 50% 미만이면 high finding 등록.

## 형식화 단계 검증

### 6. `decision-table-validator`

- **하는 일**: 의사결정 표(Decision Table)의 완전성과 일관성 검증.
- **막는 것**: 조건 조합 누락, 모순되는 행동, 중복 행.

### 7. `formal-spec-link-validator`

- **하는 일**: 형식 명세(FSM/Decision Table/ADT) 와 자연어 명세의 양방향 링크 무결성.
- **막는 것**: 형식 명세에는 있지만 자연어에는 없는 규칙 (또는 그 반대).

### 8. `characterization-coverage-validator` (v2.1 신규)

- **하는 일**: 레거시 동작 스냅샷의 커버리지를 측정 + ratchet (단조 비감소) 검증.
- **막는 것**: 다음 측정에서 커버리지가 떨어지는 회귀.
- **실패 시**: `coverage.trend_negative_ratchet` finding (high) 자동 등록.

## 체인 하네스 검증

### 9. `chain-driver`

- **하는 일**: 체인 하네스 5 요소(state.json + cli exit + PreToolUse + suppressOutput + release-readiness) 를 통합 enforce.
- **막는 것**: 게이트를 우회한 자동 코드 생성. AI 가 "양심"에 의존하는 모든 회피 경로.

### 10. `planning-extraction-validator`

- **하는 일**: 분석 산출물에서 기획 명세를 뽑을 때, 입력 → 출력 무결성 검증.
- **막는 것**: 비즈니스 의도가 임의로 변형되어 추출되는 것.

### 11. `chain-coverage-validator`

- **하는 일**: UC → BHV → AC → TC → IMPL 단계 간 커버리지 ≥ 0.85 강제.
- **막는 것**: "기획에는 있는데 테스트에는 없는" 식의 단계 누락.

### 12. `spec-test-link-validator`

- **하는 일**: 인수 기준(AC) ↔ 테스트 케이스(TC) 양방향 링크 + RED 상태 검증.
- **막는 것**: 구현이 먼저 있고 테스트가 나중에 붙는 역순.

### 13. `test-impl-pass-validator`

- **하는 일**: 게이트 #4 진입 시 테스트가 100% 통과하는지 강제 검사.
- **막는 것**: "거의 다 통과하면 됐다" 식의 부분 통과로 GREEN 선언.

## 추적성

### 14. `traceability-matrix-builder`

- **하는 일**: UC → BHV → AC → TC → IMPL + commit hash 까지 forward + backward 양방향 매트릭스 자동 생성.
- **막는 것**: 어떤 결정이 어느 코드 줄로 흘러갔는지 모르는 상태.
- **출력 형식**: JSON + Markdown + Mermaid (이중 렌더링 사상).

---

## 모두 합쳐서 — 단위 테스트 280 개

이 14 개 도구가 각자 **자기 자신을 검증하는 단위 테스트** 를 가지고 있습니다.

| 워크스페이스 | 테스트 수 |
|---|---|
| chain-driver | 약 30 |
| drift-validator | 약 25 |
| schema-validator | 약 20 |
| sql-inventory-extractor | 10 |
| ... 외 10 개 도구 | 합계 약 145 |
| _shared (공통) | 약 50 |
| **총합** | **280 개 / 0 실패 의무** |

릴리스를 만드는 `npm run build` 명령은 280 개가 모두 통과하지 않으면 **빌드 자체가 중단** 됩니다.
