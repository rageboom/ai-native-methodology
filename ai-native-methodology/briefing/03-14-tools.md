# 16개 검증 도구 역할표

> 플러그인이 어떻게 품질을 지키는지 알고 싶은 분께. 워크스페이스의 `tools/` 안에 있는 16 개 도구가 각각 무엇을 막아내는지 정리했습니다.
>
> **갱신 이력**: 2026-05-08 작성 (14 도구 / v2.2.0) → 2026-05-14 갱신 (★ findings-aggregator + br-cross-consistency-validator 추가 / 총 16 도구 / v2.5.1).

## 한눈에 보는 분류

```
┌──────────────────────────────────────────────────────┐
│ 분석 단계 검증 (5종)                                    │
│   · drift-validator                                   │
│   · schema-validator                                  │
│   · spectral-runner                                   │
│   · static-runner                                     │
│   · sql-inventory-extractor (v2.2 신규)               │
├──────────────────────────────────────────────────────┤
│ 형식화 + 의미 일관성 검증 (4종)                            │
│   · decision-table-validator                          │
│   · formal-spec-link-validator                        │
│   · characterization-coverage-validator (v2.1 신규)   │
│   · br-cross-consistency-validator (★ v2.4 신규)      │
├──────────────────────────────────────────────────────┤
│ 체인 하네스 검증 (6종)                                   │
│   · chain-driver                                      │
│   · planning-extraction-validator                     │
│   · chain-coverage-validator                          │
│   · spec-test-link-validator                          │
│   · test-impl-pass-validator                          │
│   · findings-aggregator (★ v2.3.6 신규)               │
├──────────────────────────────────────────────────────┤
│ 추적성 (1종)                                            │
│   · traceability-matrix-builder                       │
└──────────────────────────────────────────────────────┘
```

## 분석 단계 검증

### 1. `drift-validator`

- **하는 일**: 산출물(JSON/YAML) 과 실제 코드의 정합성을 자동 비교.
- **막는 것**: 코드는 바뀌었는데 명세는 그대로인 "표류(drift)" 상태.
- **실패 시**: 어느 필드가 어디서 어긋났는지 라인 단위로 출력.
- **언제 호출**: 모든 분석 phase 종료 직후.
- **★ v2.5.1 갱신**: `check-phase-skills` + `chain stage layout` 검증이 1-depth + category prefix paradigm 정합 (skills/<category>-<name>/ 구조 자동 인식).

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

- **하는 일**: 매퍼 XML 에서 SQL 을 12 개 컬럼으로 추출 (★ v2.3.0-rc1 에서 `migration_priority` P0~P3 12번째 컬럼 추가 / Gartner TIME 4분면 매핑 사상).
- **막는 것**: SQL 단위 누락 — "어떤 화면이 어떤 테이블을 건드리는가" 추적 불가 상태.
- **실패 시**: 자동화율이 50% 미만이면 high finding 등록.

## 형식화 + 의미 일관성 검증

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

### 9. `br-cross-consistency-validator` (★ v2.4 신규 / v2.5 Layer 2 paradigm)

- **하는 일**: 비즈니스 규칙(BR)의 **이중 표현** (natural_language 자연어 ↔ given/when/then GWT) 의 의미 일관성 검증.
- **막는 것**: ★ ★ ★ **Adzic SBE 10년 폐기 함정** — 자연어 명세와 실행 가능 명세가 시간 지나면서 갈라지는 결함 (industry 표준 도구가 모두 놓치는 영역).
- **2 단계 검증**:
  - **Layer 1 (결정적)**: 두 표현 ≥ 1 의무 / 구조 검증 (given 안 결과 키워드 ❌ / when 안 전제 키워드 ❌) / BR id 4토막 strict.
  - **Layer 2 (★ Claude Code sub-agent invocation)**: Sonnet 4.6 sub-agent 가 NL ↔ GWT 의미 등가성 평가 (semantic_score ≥ 0.7 의무 / confidence ≤ 0.85 cap).
- **실패 시**: `semantic_drift_detected` (medium) + `confidence_cap_exceeded` (low) finding 등록.
- **★ industry-first 자격**: Spec Kit (GitHub 90K star) / AWS Q / DMN / Spectral 모두 cross-consistency rule 부재 — 본 도구가 원조.

## 체인 하네스 검증

### 10. `chain-driver`

- **하는 일**: 체인 하네스 5 요소(state.json + cli exit + PreToolUse + suppressOutput + release-readiness) 를 통합 enforce.
- **막는 것**: 게이트를 우회한 자동 코드 생성. AI 가 "양심"에 의존하는 모든 회피 경로.
- **★ v2.5 갱신**: chain 1 gate 가 Layer 2 LLM 의무 통합 (br-cross-consistency-validator 와 연계 / layer2_threshold block reason 신설).

### 11. `planning-extraction-validator`

- **하는 일**: 분석 산출물에서 기획 명세를 뽑을 때, 입력 → 출력 무결성 검증.
- **막는 것**: 비즈니스 의도가 임의로 변형되어 추출되는 것.

### 12. `chain-coverage-validator`

- **하는 일**: UC → BHV → AC → TC → IMPL 단계 간 커버리지 ≥ 0.85 강제.
- **막는 것**: "기획에는 있는데 테스트에는 없는" 식의 단계 누락.

### 13. `spec-test-link-validator`

- **하는 일**: 인수 기준(AC) ↔ 테스트 케이스(TC) 양방향 링크 + RED 상태 검증.
- **막는 것**: 구현이 먼저 있고 테스트가 나중에 붙는 역순.

### 14. `test-impl-pass-validator`

- **하는 일**: 게이트 #4 진입 시 테스트가 100% 통과하는지 강제 검사.
- **막는 것**: "거의 다 통과하면 됐다" 식의 부분 통과로 GREEN 선언.

### 15. `findings-aggregator` (★ v2.3.6 신규)

- **하는 일**: 모든 단계의 finding (drift / schema / spectral / static / br-cross-consistency / coverage 등) 을 단일 stream 으로 통합 + chain-driver `next --findings` 자동 입력.
- **막는 것**: "각 도구가 찾은 issue 를 사람이 수작업 모아 다음 단계로 전달" 패턴 — 누락 / 양심 의존.
- **★ 양심 의존 차단 정책 완성**: v2.3.6 PATCH 의 핵심. chain-driver 가 자동으로 directly downstream gate 에 findings 를 주입.

## 추적성

### 16. `traceability-matrix-builder`

- **하는 일**: UC → BHV → AC → TC → IMPL + commit hash 까지 forward + backward 양방향 매트릭스 자동 생성.
- **막는 것**: 어떤 결정이 어느 코드 줄로 흘러갔는지 모르는 상태.
- **출력 형식**: JSON + Markdown + Mermaid (이중 렌더링 사상).

---

## 모두 합쳐서 — 단위 테스트 312 개

이 16 개 도구가 각자 **자기 자신을 검증하는 단위 테스트** 를 가지고 있습니다.

| 워크스페이스 | 테스트 수 |
|---|---|
| chain-driver | 72 |
| drift-validator | 47 |
| schema-validator | 약 26 |
| sql-inventory-extractor | 약 18 |
| br-cross-consistency-validator (★ v2.4 신규) | 31 |
| findings-aggregator (★ v2.3.6 신규) | 약 11 |
| ... 외 10 개 도구 + _shared (공통) | 합계 약 107 |
| **총합 (workspace)** | **312 개 / 0 실패 의무** |
| + scripts/test (release-readiness self-test) | 10 |
| **★ 총합 (전체)** | **322 개 / 0 실패** |

릴리스를 만드는 `npm run build` 명령은 312 개가 모두 통과하지 않으면 **빌드 자체가 중단** 됩니다. release-readiness self-test 10 개도 별도로 검증.

---

## v2.5 paradigm 본격 도입 — Layer 2 LLM (Claude Code sub-agent invocation)

v2.4 까지의 도구는 모두 **결정적 (deterministic)** 이었습니다. 정해진 규칙 / 정해진 입력 → 정해진 출력. **v2.5 부터 br-cross-consistency-validator + chain 1 gate** 가 ★ ★ Layer 2 LLM 의무 통합을 본격 도입:

- **Anthropic API / OpenAI API 영역 ❌** (★ session 11차 정정 — 본 plugin 본질 정합)
- **Claude Code sub-agent (Task tool) invocation paradigm ✅** — 본 plugin 안 Sonnet 4.6 sub-agent 가 BR 의미 등가성 평가
- **Static Tool 시뮬레이션 금지 정합** — sub-agent persona 시뮬레이션 ❌ / 진짜 sub-agent 호출만
- **Adzic SBE 10년 폐기 함정 회피** — industry 표준 도구가 모두 놓치는 영역을 본 plugin 이 본격 해소

> ★ ★ ★ ≥ 2 PoC corroboration L1 + L2 양쪽 본격 통과 (PoC #01 13 BR + PoC #03 18 BR + PoC #05 sample / 3 PoC 모두 gate pass).
