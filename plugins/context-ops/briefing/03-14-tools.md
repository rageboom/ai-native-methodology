# 검증 도구 역할표

> 플러그인이 어떻게 품질을 지키는지 알고 싶은 분께. 워크스페이스 `tools/` 안의 검증 도구들이 각각 무엇을 막아내는지 정리했습니다.
>
> **갱신 이력**: 2026-05-08 작성 (14 도구 / v2.2.0) → 2026-05-14 갱신 (16 도구 / v2.5.1) → **2026-06-09 v0.24.0 정합 재작성**. 도구 개수는 계속 늘어나므로(현재 30여 패키지) 제목·본문에 숫자를 박지 않습니다. 정확한 인벤토리는 `tools/` 폴더 또는 `CHANGELOG.md` 참조.

## 한눈에 보는 분류

```
┌────────────────────────────────────────────────────────┐
│ 분석 검증 — analysis 산출물의 정합/형식/의미             │
│   · drift-validator              산출물 ↔ 코드 정합     │
│   · schema-validator             JSON Schema (Ajv 8)    │
│   · decision-table-validator     DMN 5-check            │
│   · br-cross-consistency-validator  BR 이중 표현 의미   │
│   · characterization-coverage / sql-inventory / formal-spec-link │
├────────────────────────────────────────────────────────┤
│ 진짜 외부 도구 러너 — 시뮬레이션 금지 (Tier 1 실행)      │
│   · static-runner    Semgrep / PMD ...                  │
│   · spectral-runner  OpenAPI lint                       │
│   · codegraph-runner CodeGraph (코드↔코드 reference)    │
├────────────────────────────────────────────────────────┤
│ 체인 게이트 검증 — chain 1~5 통과 자격                   │
│   · chain-driver               상태머신 + gate enforce  │
│   · discovery-extraction-validator    게이트 #1         │
│   · chain-coverage-validator   UC→BHV→AC 커버리지        │
│   · plan-coverage-validator    NFR allocation hard gate │
│   · spec-test-link-validator   AC↔TC 링크 + RED         │
│   · test-impl-pass-validator   RED(4) / GREEN(5) 강제   │
├────────────────────────────────────────────────────────┤
│ 그래프·추적성·집계                                       │
│   · traceability-matrix-builder  UC→...→IMPL+commit     │
│   · context-federator            dep × code federation  │
│   · graph-integrity-validator    artifact-graph 무결성  │
│   · findings-aggregator          finding 단일 stream    │
└────────────────────────────────────────────────────────┘
```

## 분석 검증

### `drift-validator`
- **하는 일**: 산출물(JSON)과 실제 코드의 정합을 자동 비교. v12 json 단독 SSOT 정합 검사 포함.
- **막는 것**: 코드는 바뀌었는데 명세는 그대로인 "표류(drift)".

### `schema-validator`
- **하는 일**: 산출물이 JSON Schema 에 맞는지 Ajv 8 로 검증 (top-level strict).
- **막는 것**: 형식만 맞는 척하는 빈 산출물, 누락 필드, 잘못된 타입.

### `decision-table-validator`
- **하는 일**: 의사결정 표(Decision Table)의 DMN 5-check (중복/모순/누락/중첩/타입).
- **막는 것**: 조건 조합 누락, 모순되는 행동, 중복 행.

### `br-cross-consistency-validator` — 업계 원조
- **하는 일**: 비즈니스 규칙(BR)의 **이중 표현** (natural_language 자연어 ↔ given/when/then GWT)의 의미 일관성 검증.
- **막는 것**: **Adzic SBE 10년 폐기 함정** — 자연어 명세와 실행 가능 명세가 시간 지나며 갈라지는 결함.
- **2 단계**:
  - **Layer 1 (결정적)**: 두 표현 ≥ 1 의무 / 구조 검증 / BR id strict.
  - **Layer 2 (Claude Code sub-agent / Sonnet 4.6)**: NL ↔ GWT 의미 등가성 평가 (semantic_score ≥ 0.7 / confidence ≤ 0.85 cap).
- **industry-first**: Spec Kit / AWS Q / DMN / Spectral 모두 cross-consistency rule 부재 — 본 도구가 원조.

### 그 외 분석 검증
- `characterization-coverage-validator` — 레거시 동작 스냅샷 커버리지 + ratchet (단조 비감소).
- `sql-inventory-validator` — SQL 12 컬럼 스키마 + migration_priority(P0~P3).
- `formal-spec-link-validator` — 형식 명세 ↔ 자연어 양방향 링크 무결성.

## 진짜 외부 도구 러너 (Tier 1 실행 / 시뮬레이션 금지)

> **절대 원칙**: AI 에게 "Semgrep 처럼 행동해" 라는 페르소나 시뮬레이션은 영구 reject 입니다 (신뢰도 -5%p + "진짜 도구 미실행" 명시 의무). 도구는 **실행 확인된 것만** "실행"으로 표기합니다.

### `static-runner`
- **하는 일**: Semgrep / PMD 같은 진짜 정적 분석 도구를 직접 실행 (in-plugin = Tier 1). PMD 는 Java 감지 시 자동 설치까지.
- **환경 부재 시**: 시뮬레이션으로 메우지 않고 정직하게 carry — 환경 준비 / CI 위임을 명시. (SpotBugs·CodeQL·Daikon·SonarQube 는 실행 이력 0 이라 allowlist 에서 제거됨. 사용자가 자기 CI 에서 돌린 SARIF 는 Tier 2 import 로 수용.)

### `spectral-runner`
- **하는 일**: OpenAPI 명세를 Stoplight Spectral 로 검증.
- **막는 것**: 잘못된 status code 매핑, 누락 schema 참조, 응답 일관성 깨짐.

### `codegraph-runner`
- **하는 일**: CodeGraph OSS 로 코드베이스를 인덱싱 (코드↔코드 구조 reference-lens).
- **trust 모델**: 출력은 **reference-lens / finding 으로만** 수용 — 어떤 결정적 gate 에도 inject 하지 않습니다.

## 체인 게이트 검증

### `chain-driver`
- **하는 일**: 체인 하네스 상태머신 + 게이트 enforcement (state.json + atomic write + 기계적 gate 3종). discovery~implement 의 모든 게이트를 통합 구동.
- **막는 것**: 게이트를 우회한 자동 코드 생성. AI 가 "양심"에 의존하는 모든 회피 경로.
- **결정론 axis**: chain-driver 안에는 LLM 판단을 넣지 않습니다 — 도구 = 결정론 / skill = LLM 의미.

### 게이트별 검증
- `discovery-extraction-validator` (게이트 #1) — analysis → discovery 추출 시 source-grounded 무결성 (의도 임의 변형 차단).
- `chain-coverage-validator` — UC → BHV → AC 단계 간 커버리지 ≥ 0.85 강제 ("기획엔 있는데 테스트엔 없는" 누락 차단).
- `plan-coverage-validator` (게이트 #3) — NFR allocation + SP 분류 hard gate.
- `spec-test-link-validator` — AC ↔ TC 양방향 링크 + RED 상태 (구현이 먼저 붙는 역순 차단).
- `test-impl-pass-validator` — 게이트 #4 RED / 게이트 #5 GREEN(테스트 100% 통과) 강제. "거의 다 통과" 식 부분 GREEN 차단.

## 그래프·추적성·집계

### `traceability-matrix-builder`
- **하는 일**: UC → BHV → AC → TC → IMPL + commit hash 까지 forward + backward 양방향 매트릭스를 자동 생성.
- **막는 것**: 어떤 결정이 어느 코드 줄로 흘러갔는지 모르는 상태.
- **출력**: json 단독 (DO-178C / IEC 62304 식 양방향 추적성 차용).

### `context-federator`
- **하는 일**: dep-graph × codegraph 를 code_pointers 로 federation. modern 스택은 codegraph, legacy 스택은 sql-inventory 가 데이터 차원을 채움.

### `graph-integrity-validator`
- **하는 일**: artifact-graph.json 무결성 (DFS 사이클 + orphan + unknown edge 탐지).

### `findings-aggregator`
- **하는 일**: 모든 단계 finding (drift / schema / spectral / static / br-cross-consistency / coverage 등)을 단일 stream 으로 통합 + chain-driver 가 다음 게이트에 자동 주입.
- **막는 것**: "각 도구가 찾은 issue 를 사람이 수작업으로 모아 다음 단계로 전달" 하는 양심 의존 패턴.

---

## 두 층의 검증 — 결정적 + LLM 의미

대부분의 도구는 **결정적(deterministic)** 입니다. 정해진 규칙 / 정해진 입력 → 정해진 출력. 결정론 도구 안에는 LLM 판단을 넣지 않습니다.

단, BR 의미 일관성처럼 **사람만 보던 영역**에는 Layer 2 LLM 을 의무로 둡니다:

- **Anthropic / OpenAI API 호출 ❌** — 본 plugin 본질과 다릅니다.
- **Claude Code sub-agent (Task tool) invocation ✅** — plugin 안에서 Sonnet 4.6 sub-agent 가 BR 의미 등가성을 평가.
- **시뮬레이션 금지 정합** — sub-agent persona 시뮬 ❌ / 진짜 sub-agent 호출만.

이 두 층 덕분에, 업계 표준 도구가 모두 놓치는 "자연어 ↔ 실행 가능 명세 의미 격차" 를 자동으로 잡아냅니다 — ≥ 2 PoC 에서 Layer 1 + Layer 2 양쪽 통과로 입증.

> 각 도구는 자기 자신을 검증하는 단위 테스트를 가지며, 릴리스 게이트(`npm run release:check` / §8.1 strict)에서 전수 통과(0 실패)가 강제됩니다. 정확한 테스트 수는 릴리스마다 바뀌므로 CHANGELOG 최신 entry 를 참조하세요.
