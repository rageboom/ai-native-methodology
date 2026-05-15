# formal-spec phase: formal-spec (형식 명세)

> **명령어**: `/analyze-formal-spec` · **사상**: 이중 렌더링 (ADR-008) + 자연어 빈약성 보완 (60% → 90%) + 진짜 도구 의무 (ADR-009)
> **핵심 책임**: rules.json 자연어 한계를 형식 명세로 보완 / AI 코드 생성 정확도 향상

---

## 1. 목적

`business-logic` phase (domain + rules) 의 자연어 명세에서 **암묵 가정 / 빈약 표현** 으로 인해 AI 코드 생성이 막히는 빈틈을 형식화로 보완한다.

**답하는 질문**:
- Aggregate Root 의 생애주기 (state) 는?
- Use Case 의 오케스트레이션 (sequence) 은?
- BR 의 의사결정 분기 (decision table) 은?
- 도메인 invariant 는 실행 가능한가?
- 자연어가 빈약한 영역 (예: 트리거 / 액션 / 거부 방식 / 검증 위치) 은 어디인가?

---

## 2. 입력

| 입력 | 출처 | 신뢰도 기여 |
|---|---|---|
| domain.json | `business-logic` phase 산출물 | 60% |
| rules.json | `business-logic` phase 산출물 | +20%p |
| 코드 evidence (Aggregate Root / Service) | 소스 코드 | +15%p |
| Cross-validation (Senior + Static tool) | sub-agent / 진짜 도구 | +5%p |

→ `business-logic` phase 미완료 시 `formal-spec` phase 진입 차단. domain.json + rules.json 모두 의무.

---

## 3. 처리 — 5 산출물 동시 생성

| 산출물 | AI 눈 | 사람 눈 |
|---|---|---|
| State Machine | `state-machines/<AggregateRoot>.json` (XState) | `.mermaid` (stateDiagram-v2) |
| Sequence | `sequence-diagrams/UC-<UseCase>.json` | `.mermaid` (sequenceDiagram) |
| Decision Table | `decision-tables/BR-<RuleId>.json` | `.md` (markdown 표) |
| Invariants | `invariants/<AggregateRoot>.ts` (실행 가능) | (공용) |
| Property Test | `property-tests/<AggregateRoot>.spec.ts` (실행 가능) | (공용) |

### 3.1 State Machine — Aggregate Root 생애주기

각 Aggregate Root 의 상태/전이/이벤트/가드를 XState 호환 JSON + Mermaid stateDiagram-v2 로 산출.

**예시**:
- User-Account: anonymous → registered → authenticated → updated_profile
- User-Following: not_following → following / followed_by

### 3.2 Sequence — Use Case 오케스트레이션

각 핵심 UC 의 호출 흐름 (actor / message / sync / guard) 을 JSON + Mermaid sequenceDiagram 로 산출.

**예시**:
- UC-USER-SIGNUP: Controller → Service → Repository → JWT
- UC-USER-FOLLOW: Controller → RelationshipService → UserFollowJpaRepository

### 3.3 Decision Table — BR 의사결정 (★ 자연어 빈약성 보완 핵심)

각 BR 의 조건/액션 매트릭스. 9 항목 필수:
1. 트리거 (언제)
2. 조건 (입력)
3. 액션 (수행)
4. 기대 결과 (출력)
5. **거부 방식** (예외/리턴/throw — 자연어 누락 빈번)
6. **검증 위치** (Domain/Service/Adapter — 자연어 누락 빈번)
7. **HTTP status / 에러 코드** (API 영역)
8. **에러 메시지** (사용자 노출)
9. **현재 상태** (코드 부재/부분/완전)

#### 3.3.1 BR 분류 (`br_type` enum)

API 영역 외 BR 도 형식화 가능. `br_type` 으로 분류하면 항목 5/7/8 의 `null` 의도 부재가 자동 인정.

| `br_type` | 의미 | null 허용 필드 | 예시 |
|---|---|---|---|
| **api** | HTTP endpoint 트리거 BR | (없음 — 모두 의무) | BR-USER-DELETE-AUTH / BR-USER-LOGIN-VERIFY |
| **lifecycle** | Entity lifecycle hook (@BeforeInsert 등) | rejection_method, http_status, error_message | BR-USER-PASSWORD-HASH-001 |
| **domain_invariant** | Aggregate Root 생성자 / setter invariant | http_status, error_message | BR-FOLLOWS-NO-SELF-001 |
| **performance** | EAGER / N+1 / 캐시 정책 | rejection_method, http_status, error_message | BR-ARTICLE-COMMENT-EAGER-001 |
| **security** | 보안 정책 (rate limit / brute force 방어) | http_status (다양함) | BR-USER-LOGIN-RATE-LIMIT |

**항목 9 (현재 상태) 정직 표기**:
- `current_state` enum: `complete` / `partial` / `absent` / `needs_review` 만
- 부가 설명은 `current_state_note` 별도 필드 사용 (한국어 prefix enum 위반 회피)

### 3.4 Invariants — 도메인 불변식

Aggregate Root 의 invariant 를 TypeScript 로 산출 (실행 가능 명세).

**구조**:
- 타입 정의 (ADT — sum type / product type)
- 생성자 검증 (input → invariant 만족 확인)
- 상태 전이 검증 (precondition → postcondition)

### 3.5 Property Test — 실행 가능 명세

invariants 가 모든 입력에 대해 성립함을 fast-check 등 property-based test 로 검증.

옵션 — Java 환경: `<AggregateRoot>PropertyTest.java` (jqwik).

---

## 4. Cross-validation 의무

5 산출물 작성 후 **반드시** cross-validation:

| 검증 주체 | 역할 | 시간 cap |
|---|---|---|
| Senior Engineer (sub-agent) | drift 검출 / 산출물 정합성 | 12분 |
| Static Analyzer (★ 진짜 도구) | 코드 ↔ 명세 정합 / 실제 위반 탐지 | 환경 의존 |
| **drift-validator (자동)** | `.json ↔ .mermaid` 의미 동일성 자동 비교 | <10초 |
| **decision-table-validator (자동)** | dmn-check 5종 (duplicate/conflict/gap/overlap/type) | <10초 |

### 4.1 자동 검증 step (의무)

5 산출물 작성 직후, Cross-validation 의 **선행 step** 으로 다음 명령 실행 의무:

```bash
# state-machine + sequence drift validator
node ai-native-methodology/tools/drift-validator/src/cli.js \
  examples/<poc-id>/output/formal-spec/

# decision-table dmn-check 5종
node ai-native-methodology/tools/decision-table-validator/src/cli.js \
  examples/<poc-id>/output/formal-spec/decision-tables/
```

**해석 / 처리**:
- `breaking` — structural drift. 즉시 finding 등록 (severity = high). 산출물 재작성 또는 정합 보정.
- `non-breaking` — interpretive drift / 추상화 layer 차이. finding 등록 (severity = medium / low) — 자연어 ambiguity 노출 = `formal-spec` phase 본질적 가치.
- `info` — 한쪽이 더 자세 (mermaid 가 sub-state 까지). 의도된 패턴 — finding 미등록.

수동 ad-hoc 검증 **금지** — "drift 0" 보고가 7+3 자동 검출로 한계 노출 사례 있음. 자동 도구 미실행 시 신뢰도 -5%p 패널티.

### 4.2 Static Analyzer 정합 — DEC-static-tool-실행-의무화 (★★★)

- ❌ AI persona 시뮬레이션 절대 금지
- ✅ 진짜 외부 도구 실행 의무 (Semgrep / PMD / SpotBugs / Daikon / CodeQL)
- ✅ 환경 부재 시 사용자 위임 명시 + 신뢰도 -5%p 패널티
- ✅ `tools/static-runner/` + `lint-no-simulation.sh` enforcement 자동화

`real_tool: true` 표기 시 **5종 물증 의무** (`schemas/formal-spec.schema.json` `cross_validation.validators[]` if/then 강제):

| # | 필드 | 의미 |
|---|---|---|
| 1 | `tool_version` | semgrep --version 등 |
| 2 | `tool_stdout_path` | raw stdout 로그 |
| 3 | `tool_stderr_path` | raw stderr 로그 |
| 4 | `invocation_timestamp` + `duration_ms` | ISO timestamp + 소요시간 |
| 5 | `result_hash` | SARIF SHA256 (위조 차단) |
| 6 | `reproduction_command` | 재현 가능 명령 |

`real_tool: false` 시 `simulation_reason` 필드 의무.

**양쪽 발견 (double_hit)** 시:
- 정식 finding 등급 (★★)
- finding-system.schema.json `cross_validation.double_hit: true`

**단독 발견 시**:
- candidate finding 등급
- 추가 검증 후 promotion 결정

---

## 5. 출력

```
output/formal-spec/
├── state-machines/
│   ├── <AggregateRoot>.json     # AI 눈 (XState)
│   └── <AggregateRoot>.mermaid  # 사람 눈 (stateDiagram-v2)
├── sequence-diagrams/
│   ├── UC-<UseCase>.json        # AI 눈
│   └── UC-<UseCase>.mermaid     # 사람 눈 (sequenceDiagram)
├── decision-tables/
│   ├── BR-<RuleId>.json         # AI 눈
│   └── BR-<RuleId>.md           # 사람 눈 (markdown 표)
├── invariants/
│   └── <AggregateRoot>.ts       # 실행 가능 (AI + 사람 공용)
├── property-tests/
│   └── <AggregateRoot>.spec.ts  # 실행 가능 (AI + 사람 공용)
└── _manifest.yml                # meta-confidence
```

ADR-008 정합: 모든 영역에 AI 눈 + 사람 눈 동시 산출 의무.

---

## 6. 신뢰도 (ADR-009 정합)

| 단계 | raw confidence |
|---|---|
| 자연어 단독 (`business-logic` phase 까지) | 60-70% |
| + `formal-spec` phase 5 산출물 작성 | 70-80% |
| + drift-validator + decision-table-validator 자동 실행 | 78-85% |
| + Cross-validation 의무 (Senior + 시뮬 static) | 80-87% (시뮬 패널티 시) |
| + 진짜 static tool 실행 + 5종 물증 (게이트 통과) | 90-95% |

**정직 표기 의무**:
- 시뮬레이션 사용 시 -5%p 패널티 + `cross_validation.simulation_reason` 명시
- 자동 도구 미실행 시 -5%p
- 사용자 검증 미완 시 -3%p

---

## 7. 종료 조건

- 5 산출물 모두 작성 (이중 렌더링 정합 100%)
- **drift-validator + decision-table-validator 자동 실행 완료** (breaking 0 또는 finding 등록 / non-breaking + interpretive drift 모두 finding 등록)
- Cross-validation 완료 — Senior + 진짜 static tool (또는 환경 부재 명시 보고). **시뮬 결과 사용 금지**
- `cross_validation.real_tool: true` 시 5종 물증 schema 검증 통과 / `false` 시 `simulation_reason` 명시
- `lint-no-simulation.sh` 통과 (CI 게이트)
- _manifest.yml 신뢰도 정직 표기
- `api` phase 진입 가능 (병행 가능)

---

## 8. 자연어 빈약성 정량

자연어 명세는 **44%** 만 표현 가능 (4 / 9 항목):
- 자연어 표현: 트리거 / 액션 / 기대 결과 / 현재 상태
- **자연어 누락 (형식화 필수)**: 거부 방식 / 검증 위치 / HTTP status / 에러 메시지 / unfollow 일관성

→ `formal-spec` phase 형식화 시 100% 표현.
