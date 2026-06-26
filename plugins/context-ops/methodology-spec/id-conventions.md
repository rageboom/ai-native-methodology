# ID 표준 (산출물 간 추적성)

> 산출물 + chain 산출물 (6-stage) ID 명명 규칙. ID 를 통해 산출물 간 교차 참조 가능. 단일 source-of-truth.

### Jira hierarchy 정합 entity matrix

| Jira                 | 본 방법론 ID                               | 정의                                             |
| -------------------- | ------------------------------------------ | ------------------------------------------------ |
| Initiative           | (외부 매핑만)                              | 대형 결단 단위                                   |
| Epic                 | (외부 매핑만 + screen_id/route cross_link) | FE 화면 단위                                     |
| Story                | (외부 매핑만 + story_ref → BHV-_/AC-_)     | 화면 내 사용자 시나리오 (BE+FE cross-cut anchor) |
| Task (Story sibling) | **OP-{도메인}-{3자리 번호}**               | 사용자 가시 없는 작업 (운영/인프라/마이그레이션) |
| Sub-task             | TASK-{도메인}-{3자리 번호}                 | 개발 작업 단위 (1~3 AC 묶음 / layer 분기)        |

---

## ID 체계

```mermaid
flowchart LR
    UC["UC-{도메인}-{번호}\n유스케이스"] -->|operationId 매칭| API["operationId\nAPI"]
    UC -->|참조| ENT["E-{도메인}-{이름}\n엔티티"]
    BR["BR-{도메인}-{이름}-{번호}\n비즈니스 규칙"] -->|검증| API
    ENT -->|영속화| TBL["{snake_case}\nDB 테이블"]
    SCN["SCN-{도메인}-{번호}\n사용자 시나리오"] -->|호출| UC
    PAGE["PAGE-{도메인}-{번호}\n페이지"] -->|구성| SCN
    AP_ID["AP-{카테고리}-{이름}-{번호}\n안티패턴"] -.회피.-> ARCH["아키텍처"]

    UC ==> BHV["BHV-{도메인}-{번호}\nbehavior"]
    BHV ==> AC["AC-{도메인}-{번호}\nacceptance criteria"]
    AC ==> TC["TC-{도메인}-{번호}\ntest case"]
    TC ==> IMPL["IMPL-{도메인}-{번호}\nimpl module"]
```

(굵은 화살표 ==> 는 v2.0 chain forward link / 모든 link 는 backward 도 의무)

---

## ID 형식 표

### 기존 (analysis stage)

| 산출물          | ID 형식                        | 예시                              | schema/source                                  |
| --------------- | ------------------------------ | --------------------------------- | ---------------------------------------------- |
| 엔티티          | `E-{도메인}-{이름}`            | `E-ORDER-Order`, `E-USER-User`    | domain.schema                                  |
| **유스케이스**  | **`UC-{도메인}-{3자리 번호}`** | **`UC-ORDER-001`, `UC-USER-003`** | domain.schema + formal-spec.schema |
| 비즈니스 규칙   | `BR-{도메인}-{이름}-{번호}`    | `BR-ORDER-CANCEL-001`             | rules.schema                                   |
| 안티패턴        | `AP-{카테고리}-{이름}-{번호}`  | `AP-DB-N-PLUS-ONE-001`            | antipatterns.schema                            |
| 페이지          | `PAGE-{도메인}-{번호}`         | `PAGE-ORDER-001`                  | ui-spec.schema                                 |
| 사용자 시나리오 | `SCN-{도메인}-{번호}`          | `SCN-ORDER-001`                   | ui-spec.schema                                 |
| Bounded Context | `BC-{도메인}`                  | `BC-ORDER`, `BC-USER`             | architecture.schema                            |
| 정합성 불일치   | `DRIFT-{번호}`                 | `DRIFT-001`                       | finding system                                 |
| Finding         | `F-{번호}`                     | `F-003` (BE) / `F-FE-001` (FE)    | finding.schema                                 |
| API operationId | `{camelCase 동사+명사}`        | `createOrder`, `getUsers`         | openapi                                        |
| DB 테이블       | `{snake_case}`                 | `orders`, `order_items`           | db-schema.schema                               |

### chain 산출물 (6-stage / plan = task-plan TASK-_·ADR-_)

| 산출물                  | ID 형식                      | 예시             | schema                     |
| ----------------------- | ---------------------------- | ---------------- | -------------------------- |
| **Behavior**            | `BHV-{도메인}-{3자리 번호}`  | `BHV-ORDER-001`  | behavior-spec.schema       |
| **Acceptance Criteria** | `AC-{도메인}-{3자리 번호}`   | `AC-ORDER-001`   | acceptance-criteria.schema |
| **Unit** (TDD/unit 층)  | `UNIT-{도메인}-{3자리 번호}` | `UNIT-ORDER-001` | unit-spec.schema           |
| **Test Case**           | `TC-{도메인}-{3자리 번호}`   | `TC-ORDER-001`   | test-spec.schema           |
| **Impl Module**         | `IMPL-{도메인}-{3자리 번호}` | `IMPL-ORDER-001` | impl-spec.schema           |

> **UNIT-\*** = behavior(BDD) 스레드(UC→BHV→AC→TC→IMPL)와 **나란히 도는 TDD/unit 층**의 1급 노드 = 격리 테스트 단위(클래스/순수함수/컴포넌트) = composition TC 가 조합·mock 하는 빌딩블록. DO-178C 사다리의 **LLR(Low-Level Requirement) rung**. behavior 스레드와의 join = `behavior-spec.behaviors[].unit_refs` / `task-plan.tasks[].unit_refs` / `test-spec.test_cases[].class_ref`(test_layer=unit) / matrix `unit_id`. 상세 = `methodology-spec/policies/test-layering.md`.

> **산출물 파일명 규약 — `-spec` 의 의미**: 접미사 `-spec` 은 "**단계 구조화 산출물(structured stage artifact)**" 을 뜻하며 "요구 명세(requirement spec)" 와 동의어가 **아니다**. 추적성의 권위(SSOT)는 위 표의 **노드 ID prefix**(UC/BHV/AC/UNIT/TASK/TC/IMPL)이고 파일명은 보조 라벨이다.
>
> - **요구·계약 쪽** ("무엇을 검증/만들지"): `discovery-spec`(UC) · `behavior-spec`(BHV) · `acceptance-criteria`(AC) · `unit-spec`(UNIT)
> - **하류 산출물** ("어떻게"): `task-plan`(TASK = 계획) · `test-spec`(TC = **테스트 케이스 명세** / 요구 ❌) · `impl-spec`(IMPL = 구현 모듈 명세)
>
> 즉 `test-spec`·`impl-spec` 의 "spec" 은 "테스트/구현의 명세" 이지 요구가 아니다. 하류를 본질명(`test-cases` / `impl-modules`)으로 풀개명하는 안은 검토했으나 **7개 도구 CLI 플래그 + adopter `.ai-context` codemod 비용 > 명확성 이득** 으로 **보류**(본 규약 명문화로 갈음). `acceptance-criteria` 는 BDD 표준어이므로 개명 ❌. 노드 ID 가 권위이므로 파일명은 안정 유지한다.

### G3 운영 자산 ID

| 산출물         | ID 형식                                                                         | 예시                                            | schema                    |
| -------------- | ------------------------------------------------------------------------------- | ----------------------------------------------- | ------------------------- |
| **Scope slug** | `^[a-z0-9][a-z0-9-]{1,63}$` (kebab-case / ASCII / 2~64 chars / 파일시스템 호환) | `user-registration`, `payment-flow`, `admin-v2` | work-unit-manifest.schema |

scope 는 사용자가 작업 시작 시 자유 명명 (chain-driver init --scope <slug>). 자동 추출 ❌ (사용자 의도 분명).
한국어 / 공백 / path traversal (`../`, `/`) 비허용 — 파일시스템 호환 + state-store `validateScopeSlug` 강제.
한 사용자 프로젝트가 운영 누적 시 scope N 개 — 각 scope 가 chain 사이클 1회 또는 revisit 시 N회. `.ai-context/scopes/<scope>/` 단위 격리 (DEC-2026-06-16 / scopes/ 컨테이너).

discovery-spec 의 use_cases 는 기존 UC-_ 차용 (analysis stage UC-_ 와 동일 namespace / backward link).
BR-INTENT-_ prefix ❌ — rules.schema 의 BR-_ 에 `intent` sub-object 확장 (Senior 권고 / B1 정합).

### inventory `scope_candidate.id` ↔ architecture `module.id` (별개 namespace / 매핑 채널)

> F-DOGFOOD-FE-IDMAP (mis-fe-admin dogfood) — analysis stage 의 두 id 는 **다른 namespace** 이며 1:1 변환식이 **없다**. downstream 이 추측하지 않도록 명문화.

| 산출물            | 필드                    | 형식                          | 성격                                                       |
| ----------------- | ----------------------- | ----------------------------- | ---------------------------------------------------------- |
| inventory.json    | `scope_candidates[].id` | `^[a-z0-9][a-z0-9-]{1,63}$`   | scope 슬러그 / reference-lens / 사용자 절단 결단 산출 (advisory) |
| architecture.json | `modules[].id`          | `^MOD-[A-Z0-9_-]+$`           | 구조 모듈·패키지 단위 (결정론 의존 그래프 노드)            |

- **1:1 아님 — 한 scope 가 N 개 module 관통(Vertical Slice)**: 예) inventory `eam-integration-authority` = architecture `MOD-EAM-PAGES-INTEGRATION-AUTHORITY` + `MOD-EAM-APIS-INTEGRATION-AUTHORITY`.
- **상관 채널 = 문자열 변환 ❌ / 집합 멤버십**: `scope_candidates[].members`(소스 경로) ∩ `modules[].path` 교집합으로 한 scope 가 관통하는 MOD-\* 를 해소한다. id 문자열을 변형·추측하지 말 것 (이 멤버십이 유일한 정식 bridge).
- BC↔module 축(`related_bounded_context`)과 혼동 ❌ — 그건 domain BC ↔ architecture module 축이고, 여기는 scope ↔ module 축으로 별개다.

---

## 규칙

1. **도메인**: 대문자 (ORDER, USER, PRODUCT 등). domain.json `aggregates[].name` 정합.
2. **번호**: 3자리 (001, 002, ...) — 이름 형식 (CANCEL, CREATE 등) 폐기.
3. **카테고리** (안티패턴): DB, ARCH, DOMAIN, API, FE, VALIDATION, CONFIG, SECURITY, PERFORMANCE
4. **이름**: BR-{도메인}-**{이름}**-{번호} 만 이름 형식 유지 (예: BR-ORDER-CANCEL-001 / BR 은 비즈니스 의미 명시 의무 / 산업 BR 표준 정합). schema-level strict pattern `^BR-[A-Z0-9_-]+-[A-Z0-9_-]+-[0-9]+$` / `business-rules.schema.json` + `discovery-spec.schema.json` + `behavior-spec.schema.json` 모두 4토막+ 강제 / 3토막 (`BR-DOMAIN-001`) ❌ schema-validator fail. 5토막+ (`BR-ARTICLE-AUTHOR-EDIT-ONLY-001`) ✅ 자연 허용.
5. **고유성**: 같은 유형 내에서 ID 중복 금지.
6. **chain link 의무**: BHV-_ 가 ≥ 1 UC-_ backward / AC-_ 가 ≥ 1 BHV-_ backward / TC-_ 가 ≥ 1 AC-_ backward / IMPL-_ 가 ≥ 1 TC-_ backward (chain-coverage-validator 강제).

---

## UC 이름→번호 마이그레이션

기존 이름 형식 산출물 (`UC-USER-SIGNUP` / `UC-ORDER-CREATE` 등) 변환:

- 변환 규칙: `UC-{도메인}-{이름}` → `UC-{도메인}-{순차 번호}` + `name: "{이름}"` 필드 보존
- finding 시스템에 migration log 등재 (`F-MIG-UC-001` 등)

## BR 4토막 enforcement 마이그레이션

`business-rules.schema.json` BR pattern 은 3토막 → 4토막+ strict. 3토막 (`BR-DOMAIN-001`) 표기 산출물은 재라벨 필요 (schema-validator fail expected).

**재라벨 규칙** (사용자 결단 위임):

- 도메인 전문가가 description + source 분석 후 카테고리 결정
- 예: `BR-BILLING-005` → `BR-BILLING-{CHARGE|REFUND|...}-005` (카테고리는 도메인 의미 정합)
- 메인 sub-agent 자동 추정 ❌ (F-015 한계 회피 의무)

**재라벨 sprint 절차**:

- 재라벨 미완 산출물의 schema-validator fail 은 sprint 완결 시점까지 carry 허용
- §8.1 strict 검증대 영향 검증 의무 (carry 항목에 명시)
- sprint 종결 후 → fail → pass 전환 확인 + carry resolved

---

## 교차 참조 예시

```yaml
# Analysis stage
- id: BR-ORDER-CANCEL-001
  related_use_cases: [UC-ORDER-002]
  related_entities: [E-ORDER-Order]
  related_apis: [cancelOrder]
  intent: # rules.schema 확장 (B1 Senior 권고)
    reasoning: '...'
    source_grounded_evidence: 'src/order/OrderService.java:45-60'

# chain
- id: BHV-ORDER-001
  use_case_refs: [UC-ORDER-002] # backward
  br_refs: [BR-ORDER-CANCEL-001]
  acceptance_criteria_refs: [AC-ORDER-001, AC-ORDER-002] # forward

- id: AC-ORDER-001
  bhv_ref: BHV-ORDER-001 # backward
  uc_ref: UC-ORDER-002
  test_case_refs: [TC-ORDER-001] # forward
  severity: must # MoSCoW
  verifiable: true # ≥ 1 TC-* forward link 의무 / B2 Senior 권고
  gherkin:
    given: ['주문이 PAID 상태']
    when: '사용자가 취소 요청'
    then: ['주문 상태가 CANCELLED']

- id: TC-ORDER-001
  ac_ref: AC-ORDER-001 # backward
  bhv_ref: BHV-ORDER-001
  type: integration
  framework: junit5
  source_file: src/test/java/order/OrderCancelTest.java
  impl_module_ref: IMPL-ORDER-001 # forward

- id: IMPL-ORDER-001
  tc_refs: [TC-ORDER-001, TC-ORDER-002] # backward
  bhv_refs: [BHV-ORDER-001]
  framework: spring-boot-3
  source_files: [src/main/java/order/OrderCancelService.java]
  test_pass_evidence: # no-simulation 5종 물증 7 필드
    test_runner_version: 'junit-jupiter-5.10.0'
    test_runner_stdout_path: '.ai-context/runtime/runs/2026-05-06T12-00/stdout.log'
    invocation_timestamp: '2026-05-06T12:00:00Z'
    duration_ms: 4523
    pass_count: 12
    fail_count: 0
    skip_count: 0
    reproduction_command: ['./gradlew test --tests OrderCancelTest']
    result_hash: 'sha256:...' # 정규화 (timestamp+duration 제외 / sorted test names)
```

---

## $schema 포인터

산출물 JSON 이 자기 schema 를 가리키는 **정규 키 = `$schema_ref`** (단일 source-of-truth). schema-validator 가 라우팅 시 `$schema_ref` 를 먼저 보고 값에서 basename(`<name>.schema.json`)을 추출해 schema 를 해소한다.

- **값 형식** = 둘 중 하나 (둘 다 basename 해석 가능):
  - 프로젝트-상대: `schemas/<name>.schema.json` (예: `schemas/state.schema.json`)
  - scheme-token: `context-ops:schemas/<name>.schema.json` (이식성 강조 / 플러그인 경계 명시 / verify C1 은 scheme-token 을 skip)
- **이유**:
  - **basename 라우팅** — validator 는 경로 전체가 아닌 끝의 `<name>.schema.json` 만 보고 schema 를 찾으므로, 깊은 디렉토리 위치에 무관하게 안정적으로 해소된다.
  - **이식성** — 프로젝트-상대/scheme-token 형식은 repo 를 어디에 두든, 어느 worktree 에서 열든 동일하게 해석된다.
  - **프로젝트밖 `../` 금지** — `../../../../Study/...` 같은 프로젝트 경계를 벗어나는 상대경로는 다른 머신/클론에서 미해결(파일 부재)이 되므로 금지.
- **레거시 `$schema_origin` = deprecated**. 깊은 상대경로(예: `../../../schemas/state.schema.json`)로 방출돼 프로젝트 밖을 가리키면 미해결된다. validator 는 하위호환을 위해 여전히 `$schema_origin` 을 읽지만(fallback), **신규 산출물에는 절대 방출하지 말 것**. 기존 인스턴스는 `$schema_ref` 로 교체 권장.

---

## 검증

- `tools/drift-validator/` 에서 ID pattern 회귀 검증
- `tools/chain-coverage-validator/` 에서 chain link 의무 검증
- `schemas/{domain,rules,formal-spec,discovery-spec,behavior-spec,acceptance-criteria,test-spec,impl-spec}.schema.json` 에서 pattern enforce

---

## Ticket Binding (외부 일감 시스템 연동)

자세한 정책 = `methodology-spec/ticket-policy.md` / **권고만 / validator 강제 X**.

### 매핑 단위 (R20-prime / ticket = plan stage 단일 cascade)

ticket 생성 = **plan stage(chain 3) 단일** 4-level cascade. analysis/discovery/spec stage = 생성 ❌ (산출물 = "이해"). test(chain 4)/implement(chain 5) stage = Sub-task status 갱신만 (신규 생성 ❌).

| Plugin entity                                       | Ticket 단위 (Jira)            | 시점                             |
| --------------------------------------------------- | ----------------------------- | -------------------------------- |
| 대형 분석 결과 묶음                                 | Initiative (선택 / 외부 매핑) | plan stage (선택)                |
| FE 화면 (route) 또는 BE-domain                      | **Epic**                      | plan stage                       |
| **UC = BHV/AC cross-cut 시나리오**                  | **Story**                     | **plan stage (chain 3 gate 후)** |
| **OP-{도메인}-{번호}** (운영·인프라·마이그레이션)   | **Task** (Story sibling)      | plan stage                       |
| **TASK-{도메인}-{번호}** (1~3 AC 묶음 / layer 분기) | **Sub-task**                  | plan stage                       |
| BHV / AC / TC / IMPL                                | (별도 ticket X — 본문 link)   | —                                |

### 매핑 권장 형식

- **Story summary**: `[UC-{도메인}-{번호}] {use_case.name 또는 description 1줄}` (예: `[UC-CAR-007] 차량 비용 회계연도 prorate + cross-company billing`)
- **Story 본문**: `discovery-spec.json` 의 use_case 본체 + source_grounded_evidence + acceptance_criteria_refs
- **Sub-task summary (TASK-\*)**: `[TASK-{도메인}-{번호}] {1~3 AC 요약}` (layer=be/fe/db/e2e/infra / 예: `[TASK-CAR-001] POST /api/car-billing endpoint (layer=be)`)
- **Task summary (OP-\*)**: `[OP-{도메인}-{번호}] {운영 작업}` (category=migration/cron/health-check/refactor/infra/ops / 예: `[OP-CAR-001] cost column migration`)
- **Traceability matrix**: `schemas/traceability-matrix.schema.json` matrix item 의 `ticket_ref` optional field 에 platform / id / url / level / epic_id / subtask_refs / op_task_refs 기록

### BHV / AC / TC / IMPL 별 별도 ticket 금지 사유

1 UC 당 N BHV × M AC × K TC × L IMPL = ticket 폭증 위험 + chain-coverage-validator 가 이미 backward link 의무 → ticket 시스템과 1:1 중복 = entropy. ID 는 Story description 또는 sub-task acceptance criteria 에 link 만.

### R20 — status_history (MCP delegation 자동화)

Tier 2.5 활성 시 ticket 상태 전이 timeline 자동 기록:

```yaml
# traceability-matrix.json matrix item 예시
- use_case_id: UC-CAR-007
  status: green
  ticket_ref:
    platform: jira
    id: MIG-1234
    level: story
    epic_id: MIG-CAR-100
    initiative_id: MIG-1
    subtask_refs: [MIG-1235, MIG-1236] # TASK-* (1~3 AC / layer 분기)
    op_task_refs: [MIG-1240] # OP-* (Story sibling / 선택)
    status_history: # R20 — ticket 상태 전이 timeline
      - transitioned_at: '2026-05-18T14:30:00+09:00'
        to_status: 'To Do'
        mcp_tool: 'mcp__wiki-jira-assistant__jira_create'
      - transitioned_at: '2026-05-18T15:00:00+09:00'
        from_status: 'To Do'
        to_status: 'In Progress'
        mcp_tool: 'mcp__wiki-jira-assistant__jira_transition'
        evidence_ref: '.ai-context/runtime/evidence/ticket-sync-spec-20260518T150000.json'
      - transitioned_at: '2026-05-18T16:30:00+09:00'
        from_status: 'In Progress'
        to_status: 'Done'
        mcp_tool: 'mcp__wiki-jira-assistant__jira_transition'
```

MCP tool = `mcp__wiki-jira-assistant__*` only (Tier 2.5).

## 인용

### 결단

- chain 산출물 ID / UC-_ 형식 통일 결단: DEC-2026-05-06-v2.0-i-strict-채택
- Jira hierarchy entity matrix / OP-_ entity 근거: DEC-2026-05-26-v11-paradigm-결단
- 규칙 4 (BR 4토막 enforcement) 근거: DEC-2026-05-13-BR-id-4-segment-enforcement
- Ticket Binding (Tier 1 정책) 근거: DEC-2026-05-18-ticket-binding-policy
- R20 (Tier 2.5 MCP ticket sync) 근거: DEC-2026-05-18-r20-mcp-ticket-sync-channel
- R20-prime (ticket = plan stage 단일 cascade / subtask_ids{chain*} → subtask_refs·op_task_refs 폐기·재편 / breaking) 근거: DEC-2026-05-26-ticket-plan-단일
- `$schema_ref` 정규 키 채택 / schema-validator 인식 (vs 레거시 `$schema_origin` deprecated) 근거: DEC-2026-06-06-non-analysis-gate-fail-closed (F4 schema-validator `$schema_ref` 미인식 fix)

### Cross-link

- $schema 포인터 라우팅 구현: `tools/schema-validator/src/cli.js` (`inferSchemaName` — `$schema_ref` → `$schema_origin` → `$schema` → 파일명 순)
- 정책 본문: `methodology-spec/ticket-policy.md`
- Skill: `skills/ticket-sync/SKILL.md` (5 stage matrix + confirmation gate)
- Schema field: `schemas/traceability-matrix.schema.json` matrix.items.ticket_ref (+ status_history)
- Evidence schema: `schemas/ticket-sync-evidence.schema.json` (7-field MCP invocation)
- Charter R20: `methodology-spec/plugin-charter.md` §1+§2
