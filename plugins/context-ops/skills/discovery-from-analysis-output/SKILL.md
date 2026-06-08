---
name: discovery-from-analysis-output
description: v4.1 chain (discovery) 어댑터 skill (analysis-output 채널). analysis stage 7대 + 8 FE 산출물 + finding + antipatterns + migration-cautions 를 입력으로 discovery-spec.{json,md} 추출 (discovery stage 산출물 / 파일명 reuse). 모든 use_case + business_rules_intent 는 source_grounded_evidence (grep_hit_count > 0) 의무. AI 환각 차단이 1차 목적. v4.0 planning-extract-from-legacy 의 rename (DEC-2026-05-21 정합) — 본문 stage 표기 본격 갱신은 carry.
allowed-tools: Read, Glob, Grep, Bash, Write
---

# discovery-from-analysis-output

chain 1 (discovery) 의 **진입 skill** (analysis-output 채널). 1차 use case = legacy 추출 single-case.

## 언제 사용

- analysis stage 종결 후 chain 1 진입 시 의무.
- 사용자 자연어: "기획 단계 시작" / "discovery-spec 만들어줘" / "legacy 분석 결과로 use case 추출해줘".

## 입력

`<project>/.ai-context/output/` 안:

- 7대 산출물: inventory / domain / rules / architecture / schema / openapi / antipatterns
- 8 FE 산출물 (있으면): ui-spec / state-map / visual-manifest / a11y-spec / i18n-spec / static-security-spec / form-validation-spec / type-spec / legacy-spectrum
- `formal-spec` phase: state-machines / sequences / decision-tables / invariants
- finding-system: findings.json
- migration-cautions.json

## 산출물

- `<project>/.ai-context/output/discovery-spec.json` (schemas/discovery-spec.schema.json 의무 / json 단독 SSOT)

## no-simulation 의무 (source-grounded)

discovery-spec 의 모든 BR-INTENT 와 UC 는 다음 5 필드 중 하나 이상 grep-hit 의무:

- analysis BR-\* match (`source_grounded_evidence.artifact: "rules"`)
- domain entity match (`source_grounded_evidence.artifact: "domain"`)
- API operation match (`source_grounded_evidence.artifact: "api"`)
- code file match (`source_grounded_evidence.file_paths[]`)
- antipattern reference (`source_grounded_evidence.artifact: "antipatterns"`)

`grep_hit_count: 0` 또는 `source_grounded_evidence` 부재 = discovery-extraction-validator 자동 차단 (`discovery.source_grounded.missing` finding).

## 절차

1. **input 확인** — 7대 산출물 + finding 모두 존재? 누락 시 사용자에게 명시 + analysis stage 재진입 권고.

2. **business_intent 추출** — domain.json + business-rules.json 에서 도메인 의도 (e.g., "user authentication" / "article lifecycle") 추출. 자연어 prompt + 사용자 검토 후 채움.

3. **use_cases 분해** — `discovery-decompose-use-cases` skill 호출. 산출 = `UC-{domain}-NNN` 목록.

4. **business_rules_intent 채움** — `discovery-identify-business-intent` skill 호출. 산출 = `business_rules_intent[]` (각 entry `br_id` = analysis business-rules.json BR-_ 1:1 backward link / 별도 BR-INTENT-_ id 없음).

5. **cross_links.to_analysis_artifacts 채움** — analysis 산출물 path 모두 backward link.

6. **`discovery-extraction-validator` 자동 검증**:

   ```bash
   node ${CLAUDE_PLUGIN_ROOT}/tools/discovery-extraction-validator/src/cli.js \
     --discovery .ai-context/output/discovery-spec.json \
     --rules     .ai-context/output/business-rules.json \
     --domain    .ai-context/output/domain.json \
     --json
   ```

   - critical/high finding 0 의무 (source-grounded coverage ≥ 0.80).

7. **schema-validator 자동 검증**:

   ```bash
   node ${CLAUDE_PLUGIN_ROOT}/tools/schema-validator/src/cli.js .ai-context/output/discovery-spec.json
   ```

8. **gate #1 호출** — `_base-invoke-go-stop-gate` skill 호출. 사용자 검토 cluster 5~6:
   1. business_intent 정확성?
   2. 누락 use case 추가?
   3. 의문 BR-INTENT?
   4. cross_links 추가?
   5. pending_decisions[] (사용자 결단 필요) — Auto Mode 미활성 시 본 cluster 에서 user-explicit 결단 받음.
   6. chain 2 (spec) 진입?

## 결단 처리 (Auto Mode 정합)

### 배경

chain 1 진입 시 사용자가 명시적으로 결단하기 어려운 BR-INTENT / use case 가 발생 가능 (예: BR 의 default 값 / state 의 source / pagination 정책 / system-level 첫 옵션 자동 선택 여부 등). Auto Mode 호환 + 후속 chain 2~4 stage 의 traceability 보장을 위해 결단 처리를 정식화한다.

### discovery-spec.json 신설 필드

| 필드                           | 타입    | 의미                                                                                     |
| ------------------------------ | ------- | ---------------------------------------------------------------------------------------- |
| `decisions[]`                  | array   | 결정된 결단 entry                                                                        |
| `decisions[].id`               | string  | `DEC-PLAN-NNN` (discovery-spec 안 local id)                                              |
| `decisions[].topic`            | string  | 결단 주제 (예: "system default value for first option")                                  |
| `decisions[].source`           | enum    | `user-explicit` \| `AI-default` \| `AI-investigation-complete` \| `carry`                |
| `decisions[].rationale`        | string  | 결단 사유 (AI-default 시 1차 default 선택 근거 명시 의무)                                |
| `decisions[].affected_ids`     | array   | 영향받는 `UC-*` / `BR-*` (br_id) ID 목록                                                 |
| `decisions[].revisit_required` | boolean | 후속 stage gate 에서 사용자 confirm 의무 여부 (`AI-default` 시 true 의무)                |
| `pending_decisions[]`          | array   | 미결단 항목 (carry 대상 / Auto Mode 미활성 시 gate #1 에서 user-explicit 으로 전환 의무) |
| `meta.auto_mode_default_count` | integer | Auto Mode 에서 AI-default 적용된 결단 수 (후속 gate 사용자 confirm 부담 sizing)          |

### source enum semantic

- **`user-explicit`** — 사용자가 명시적으로 답한 결단. `revisit_required: false` default. 사용자가 명시 의사를 표시한 path 만 본 enum 사용.
- **`AI-default`** — Auto Mode 에서 AI 가 1차 default 적용 (예: "첫 옵션 자동 선택" / "BE escalate placeholder UI carry"). `revisit_required: true` 의무 + 후속 chain 2/3/4 stage gate 에서 사용자 confirm 의무.
- **`AI-investigation-complete`** — AI 가 legacy code grep / 도메인 분석 / source-grounded evidence 로 결단 추출 (단순 default 가 아닌 본문 근거). `revisit_required: true` 권고 (사용자 검토).
- **`carry`** — 이전 cycle / iter 의 결단 인계. `rationale` 에 evidence path (예: `.ai-context/output/iter-3/discovery-spec.json#decisions[2]`) 인용 의무.

### Auto Mode 흐름

Auto Mode 활성 시 (사용자 명시 위임 — `auto_mode: true` flag 또는 자연어 "Auto Mode 로 진행") — `pending_decisions[]` 가 발생하면:

1. AI 가 1차 default 결단 (`source: AI-default` / `rationale` 에 1차 default 근거 명시)
2. `revisit_required: true` set
3. `discovery-spec.json` 의 `meta.auto_mode_default_count` ++
4. 후속 chain 2 (spec) 진입 시 gate #2 에서 `decisions[].source = AI-default + revisit_required = true` 만 cluster 로 추출 → 사용자 일괄 confirm (cluster 결단 권고)

### Auto Mode 미활성 (default)

`pending_decisions[]` 가 있으면 chain 1 gate #1 의 cluster 5번 (사용자 검토 cluster) 에서 사용자 결단 받음 → `user-explicit` 으로 record. `AI-default` 0 의무. 사용자가 결단을 보류하면 → `pending_decisions[]` 유지 + chain 1 종결 reject (gate stop).

### `discovery-extraction-validator` 검증

- `decisions[].source = AI-default + revisit_required != true` 시 → `discovery.ai-default-revisit-flag-missing` finding emit + critical.
- `pending_decisions[]` non-empty + Auto Mode 미활성 + gate=go 진입 시 → `discovery.pending-decisions-not-resolved` finding emit + critical (gate stop).
- `decisions[].source = carry + rationale 안 evidence path 부재` 시 → `discovery.carry-decision-missing-evidence-path` finding emit + high.

## 70~80% 한계 명시

원칙 + 두 axis → `methodology-spec/policies/automation-boundary.md`.

자동 추출 ≥ 80% / 사용자 검토 ≤ 20%. AI 가 추출한 use_case / BR-INTENT 는 **사용자 검토 의무**.

## 기술 스택 분기

`inventory.stack_signals` 정합 — Spring / NestJS / Django / Rails / Hexagonal 분기는 analysis stage `discovery` phase 차용 / 본 skill 에서는 도메인 추출만 (framework neutral).

## 인용

- ADR: ADR-CHAIN-001 §1 (json 단독 SSOT)
- ADR: ADR-CHAIN-002 (gate UX)
- ADR: ADR-011 (json 단독 deliverable)
- schema: schemas/discovery-spec.schema.json (deliverable 17)
- 결단: DEC-2026-05-06-round-trip-부분-허용 (revisit:analysis 가능)
- 결단: DEC-2026-05-21 (planning→discovery rename)
- 정책: master plan §B chain 1
