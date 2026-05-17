# Finding System — 명세 빈틈 기록·처리 체계

> **사상**: dogfooding — PoC 가 명세를 따라가다 막히는 모든 지점을 즉시 기록·분류·처리하여 명세 견고화

---

## 1. 목적

본 방법론은 dogfooding 으로 진화한다. PoC 가 명세를 따라가다 막히는 지점 = "명세 빈틈". 이를 즉시 기록·분류·처리하는 체계가 Finding System.

---

## 2. Finding 의 정의

PoC 진행 중 발견되는 **명세 빈틈**. 다음 3 조건 동시 만족 시 finding 등록:

```yaml
finding 등록 조건 (AND):
  1. spec_gap 식별 가능 — 어느 명세의 어떤 절이 비었는지 명확
  2. 재현 가능 — 다음 PoC 에서도 같은 막힘 발생 예상
  3. 우회 결정 기록됨 — decision_made 로 "본 PoC 는 이렇게 갔다" 기록
```

3 조건 미충족 시 finding 이 아니라 **그냥 작업 노트** (plan.md / research.md 에 기록).

---

## 3. Finding 표준 형식

`examples/poc-NN-*/findings/poc-findings.md` 에 누적. 각 finding 은 다음 YAML 블록.

```yaml
finding_id: F-NNN          # PoC 전역 일련번호
phase: 0~6                  # 발견 phase
discovered_at: YYYY-MM-DD
discoverer: <서술>          # PoC 진행 중 / sub-agent / 사용자 등
description: |              # 무슨 일이 있었나
context: |                  # 왜 이 케이스가 나왔나
spec_gap: |                 # 어느 명세의 어느 절이 비었나
decision_made: |            # 본 PoC 는 어떻게 우회했나
severity: low | medium | high
proposed_fix: <서술>        # 어떻게 고치면 좋을까

# 처리 후 추가
resolution:
  status: closed | promoted | rejected | deferred | logged
  resolved_at: YYYY-MM-DD
  resolution_method: |
  followup: []
```

---

## 4. Severity 기준

severity = **영향 범위 × 차단 강도**.

| severity | 기준 | 예시 |
|---|---|---|
| **critical** | 즉시 수정 의무 / production blocker | Auth scope 결여 / API 보안 취약점 |
| **high** | 모든 산출물 또는 복수 phase 영향 / 표준화 시급 / 우회 시 불일치 위험 | F-003 / F-007 / F-016 / F-023 |
| **medium** | 단일 phase 영향 / 우회 가능 / 명세 보강 권장 | F-008 / F-017 / F-022 / F-024 |
| **low** | 환경 의존 / 케이스별 무시 가능 / 옵셔널 | F-001 / F-018 / F-019 / F-026 |
| **★ positive** | **학습 효과 입증 / 모범 사례** — cross-PoC 비재현 | F-161 (Bearer 표준 = NestJS 학습 효과 / PoC #02 F-084 비재현) |

### 4.1 Positive finding 패턴

**정의**: 이전 PoC 의 negative finding 이 본 PoC 에서 **자연 회피된** 경우 등재.

**조건**:
- 이전 PoC 에 동형 negative finding 존재 (cross-PoC 검증 필수)
- 본 PoC 가 framework / 언어 / 팀 학습 효과로 자연 회피
- 시뮬 ❌ — 코드/main.ts/package.json 명시적 evidence 의무

**4 학습 효과 분류** (`positive_finding_meta.learning_effect_type`):

| 분류 | 의미 | 사례 |
|---|---|---|
| **framework_natural_avoidance** | Framework 가 자연 회피 | F-161 — NestJS `addBearerAuth()` 표준 |
| **language_static_block** | 언어가 정적 차단 | F-048 비재현 — TypeScript generic 정적 차단 |
| **platform_difference** | platform 자체 차이 | F-087 비재현 — NestJS 가 `ModelAndView` 미사용 |
| **team_learning** | 동일 팀의 학습 결과 | (PoC #2 → PoC #3 동일 팀 사내 적용 시) |

**처리**:
- status: `logged` (promoted/closed 아닌 별도 분류)
- migration-cautions.md 에 "모범 사례" 섹션 등재 의무
- 본체 격상 후보 표시 (`v13_promotion_candidate: true`)

**ROI**:
- 단일 PoC 과적합 회피 (§8.1) 의 적극적 입증 = "비재현 = 학습 효과" 정량화
- 사내 적용 시 framework / language 선택 가이드

---

## 5. 처리 (Disposition) 5 옵션

finding 처리 = **다음 PoC 에서 어떻게 다룰지 결정**.

| 처분 | 의미 | 명세 영향 | 다음 PoC 효과 |
|---|---|---|---|
| **closed** | 명세 본체/스키마/템플릿/ADR 에 정식 반영 | YES (즉시 갱신) | 재발 차단 |
| **promoted** | "지금은 안 고치지만 v1.2/v1.3 후보" | NO (백로그 등재) | 같은 finding 재발 가능 — 등재만 |
| **rejected** | "이건 명세 책임이 아님" + 사유 명시 | NO (사유 보존) | 다음 PoC 에서 같은 finding 올라와도 무시 근거 |
| **deferred** | "PoC 데이터 더 필요 — revisit_at 명시" | NO (관찰 모드) | 단일 PoC 과적합 회피 |
| **★ logged** | **positive finding (학습 효과) 등재** | YES (migration-cautions.md "모범 사례") | 사내 적용 시 framework/language 선택 가이드 |

### 5.1 closed 의 정식 반영 채널

- **명세 본체**: `methodology-spec/workflow/phase-N-*.md` 또는 `deliverables/NN-*.md` 절 추가
- **스키마**: `schemas/*.schema.json` 필드/enum 보강
- **템플릿**: `templates/*.template.{json,md}` 신설/갱신
- **ADR**: 의사결정 동반 시 `docs/adr/ADR-NNN-*.md` 신설
- **CHANGELOG**: PATCH (v1.1.x) / MINOR (v1.2.0) / MAJOR (v2.0.0) 표기

---

## 6. 처리의 효과

### 6.1 closed 의 효과 (명세 견고화)
- 다음 PoC 에서 동일 케이스 재발 차단
- 신규 사용자 진입장벽 감소 (명세만 보고 결정 가능)
- sub-agent 도 명세 참조로 일관 행동

### 6.2 closed 의 위험 (단일 PoC 과적합)
- 단일 PoC 의 환경 특수성 (예: H2 + ddl-auto=none + Lombok) 이 명세에 박힘
- 다른 도메인 PoC (예: NestJS + TypeORM + Redis) 에서 부적합 가능
- **해결**: high 만 즉시 closed, medium/low 는 PoC 2~3 회 누적 후 패턴 확정 시 closed

### 6.3 promoted/deferred 의 효과
- 명세 진화의 데이터 축적
- 같은 finding 이 PoC #02/#03 에서 재현 → "진짜 빈틈" 증명
- 재현 안 됨 → PoC #01 특수성 → reject 근거

---

## 7. 누적 임계 (F-021 메타 원칙)

```yaml
finding 누적 임계:
  1~4건  : 양호 (명세 안정)
  5~15건 : 건강한 검증 (명세 자가진화 활발)
  16~19건: 임계 근접 (집중 처리 권장)
  20건+  : 명세 자체 부실 의심 (PoC 정지 + 격상 검토)
```

**의미**: finding 은 많을수록 좋은 게 아니다. 누적 = 명세가 PoC 마다 막힌다는 신호. 20+ 도달 시 **PoC 진행보다 명세 격상이 ROI 높음**.

PoC #01 사례: 18건 누적 시 임계 근접 → Option A (PoC 정지 + v1.1.2 격상) → high 4건 closed → 잔여 10건 promote/defer 분류.

---

## 8. 처리 우선순위 결정 프레임

PoC 종료 시점에 잔여 finding 처리 결정:

```
Q1. severity 가 무엇인가?
  ├─ high   → 즉시 closed 시도 (PATCH 릴리스)
  ├─ medium → Q2 로
  └─ low    → 기본 deferred (PoC 2~3회 누적 후 재평가)

Q2. (medium) 단일 PoC 데이터로 임계값/공식 결정 가능한가?
  ├─ YES → closed (단, "v1 한계" 절 명시 + v2 재calibration 예약)
  └─ NO  → deferred (revisit_at 명시) 또는 promoted (다음 MINOR 후보)

Q3. (모든 severity 공통) 명세 책임 범위 안인가?
  ├─ YES → 위 트리 적용
  └─ NO  → rejected (사유 명시)
```

### 8.1 단일 PoC 과적합 회피 휴리스틱

다음 케이스는 **closed 보류** 권장:
- 임계값/공식이 단일 PoC 의 숫자 1개에 의존 (예: LOC 4711, 모듈 11개)
- 특정 기술 스택/프레임워크 가정 (예: Spring Boot only)
- 도메인 특이 패턴 (예: RealWorld 의 @Embeddable 3-level)

→ PoC #02 (다른 스택) / PoC #03 (다른 도메인) 후 패턴 수렴 확인 → closed.

---

## 9. PoC #01 처리 결과 (참고 사례)

```
총 18건:
  closed   8건 — Phase 0 high 2 + Phase 0 low/medium 2 + Phase 1~3 high 4 (v1.1.2)
  open    10건 — high 0, medium 7, low 3

처분 권장 (잔여 10건):
  promoted 4건 → v1.2.0 후보 (F-024, F-025, F-008, F-018)
  deferred 4건 → PoC #02/#03 후 재평가 (F-017, F-019, F-022, F-026)
  분류대기 2건 → reject 가능성 검토 (F-015 메타화, F-021 자체 종결)
```

→ Phase 4 진입과 잔여 finding 처리는 **분리**. 잔여는 백로그 등재 후 PoC #02 누적 데이터로 처리.

---

## Body Finding Ledger (★ methodology 자체 finding / PoC F-NNN 시퀀스와 별개 namespace `F-PA-NNN`)

> 출처: plugin-authoring 4영역 파일별 품질 감사 2026-05-17 (`examples/_audits/2026-05-17-plugin-authoring-file-level-audit.md`).
> 범위: 47 SKILL.md + 9 agents + README + hooks.json + 2 manifests = 60 단위. L1 구조 60/60 PASS / 결함 전부 L2 인용 drift.
> **F-021 band = 5~15 "건강한 검증"** (post-dedupe 10건 / 명세 부실 ❌ — v7.0.0·v8.0.0·v5~6 rename 후속 전파 누락 표면화).
> ※ 감사 위생: 1차 RED 중 `_base-apply-template`(rules.json claim) = XV 적발 false-positive → finding 아님(재등급). F-015 cross-check 가 차단 = LL-audit-01·02 실증.
>
> ★ ★ **수정 cycle 종결 (2026-05-17 / 사용자 "진행")** — 아래 finding 별 Status 는 본 cycle 처분 반영. STOP-3 hard gate 통과: 잔여 grep 0 (rules.json·§6-no-sim·marker 의무·integrate-7대 전부 CLEAN) + skill-citation-validator **0** + release-readiness **13/13 ready:true** (workspace test 395+ 포함 / chain-driver 코드 변경 무회귀). breaking 0 (전부 doc-corrective + schema $id 정합(=$ref 의존 0 / CHANGELOG v7.0.0 미완 보정) + chain-driver additive optional 필드) = PATCH-class.
>
> | F-PA | 처분 | 비고 |
> |---|---|---|
> | 001 | **resolved** | spec-compose:53 → `spec-integrate-deliverables` |
> | 002 | **resolved** | 13 SKILL + 5 workflow SSOT doc(formal-spec 외 business-logic/characterization/quality/sql-inventory 확대) `rules.json`→`business-rules.json` (3-step 안전치환 / 잔여 0) |
> | 003 | **resolved** | 5 chain skill ADR-CHAIN-001 §3/§6 정정 (§3=no-sim / test-type=test pyramid 재귀속) |
> | 004 | **resolved** | analysis-business-rules inline 예제 canonical(`business_rules` required) + step2 중간 DMN form 명시 |
> | 005 | **resolved (옵션 a 심화)** | implement-react/vue: 거부키 react/vue_version 제거 → 실재 schema 필드 `modules[].framework:"react-19"/"vue-3"` redirect (drift-추적 의도 보존 / schema 무변경) |
> | 006 | **resolved** | analysis-architecture desc 산출물 2→1 / analysis-domain-model 3→2 |
> | 007 | **wontfix-document** | skill 인용("매개체 13") 정확 / stale = ADR **파일명**(immutable-history) → 무변경, 본 ledger 기록 유지 |
> | 008 | **resolved** | hooks-bridge buildBlockOutput `hookEventName` 추가(default 'PreToolUse' / 호출부 실 event 전달 / test 무회귀) |
> | 009 | **resolved** | business-rules.schema.json:3 `$id` → business-rules (안전 / $ref 의존 0) |
> | 010 | **wontfix** | design-agent 의도된 placeholder (규칙 무위반) |
>
> ★ scope 확대 사실: F-PA-002 sweep 이 XV 시점(13 skill + formal-spec.md)보다 넓은 **5 workflow SSOT doc**(business-logic/characterization/formal-spec/quality/sql-inventory) 포함 — drift 가 SSOT 근원에 잔존하던 것 동반 해소.

### F-PA-001: spec-compose-behavior-spec 가 v8.0.0 rename 전 skill명 `integrate-7대-deliverables` 호출

- **Phase:** cross-validation
- **Confidence:** verified (XV 독립 재read)
- **Type:** anti-pattern
- **Description:** `skills/spec-compose-behavior-spec/SKILL.md:53` step 5 가 "integrate-7대-deliverables skill 호출"로 지시. v8.0.0 에서 `spec-integrate-deliverables` 로 rename(한글→kebab)되어 pre-rename 디렉토리 부재. chain 2 sub-skill dispatch 가 dead reference.
- **Evidence:**
  - `skills/spec-compose-behavior-spec/SKILL.md:53`
  - `skills/spec-integrate-7대-deliverables/` 부재 / `skills/spec-integrate-deliverables/` 존재 (XV Q3)
- **Action:** step 5 skill명을 `spec-integrate-deliverables` 로 정정 (corrective / dispatch 깨짐 = 우선)
- **Status:** resolved (수정 cycle 2026-05-17 — 상단 F-PA 처분표 SSOT)

### F-PA-002: `rules.json` → `business-rules.json`(v7.0.0) 미전파 — methodology-wide

- **Phase:** cross-validation
- **Confidence:** verified (XV 독립 재read / 정확 카운트)
- **Type:** migration-risk
- **Description:** v7.0.0 artifact rename 이 본문·prereq·실행 CLI 예제에 미전파. 13 active SKILL.md + body doc `methodology-spec/workflow/formal-spec.md` + `schemas/business-rules.schema.json` 내부 `$id`(L3 = rename 전 구 파일명 미반영) 잔존. validator 를 옛 경로로 호출 시 런타임 path 불일치.
- **Evidence:**
  - 13 SKILL.md: analysis-characterization-test(L20,26,29), analysis-form-validation-fe(L3,9,13,28,46), analysis-formal-spec-validation(L13,26,28), analysis-from-swagger(L3,26,34), analysis-openapi(L13), analysis-sql-inventory(L21), planning-extract-from-legacy(L45,49,57), planning-decompose-use-cases(L3,19,39,61), planning-identify-business-intent(L3,18,39,47), spec-compose-behavior-spec(L19), spec-integrate-deliverables(L33), spec-derive-acceptance-criteria(L20), _base-invoke-go-stop-gate(L32)
  - `methodology-spec/workflow/formal-spec.md:4,10,27,30`
  - 실행 CLI: planning-extract-from-legacy:57 `--rules .aimd/output/rules.json` / analysis-characterization-test:29 `cat .aimd/output/rules.json`
- **Action:** repo-wide sweep (13 SKILL + workflow doc + schema $id + CLI 예제) `rules.json`→`business-rules.json`. ★ skill-citation-validator(check#13) 구조적 미탐 사각 → validator class 확장 검토 동반
- **Status:** resolved (수정 cycle 2026-05-17 — 상단 F-PA 처분표 SSOT)

### F-PA-003: chain 3-4 skill 5종 ADR-CHAIN-001 §3/§6 인용 swap

- **Phase:** cross-validation
- **Confidence:** verified (main agent ADR 매핑표 직접 read)
- **Type:** anti-pattern
- **Description:** ADR-CHAIN-001 실제 = §3 no-simulation 강화 / §6 revisit loop (ADR 매핑표 L82-87). 다음 skill 들이 §6 을 "no-simulation"으로, §3 을 "test type 분포"로 오인용: test-generate-test-spec, test-run-test-evidence, implement-generate-impl-spec, implement-verify-test-pass, implement-react.
- **Evidence:**
  - `docs/adr/ADR-CHAIN-001-chain-4-stage-enforcement.md:41,61,84,87`
  - test-generate-test-spec(L51,105), test-run-test-evidence(L121), implement-generate-impl-spec(L183), implement-verify-test-pass(L120), implement-react(L92)
- **Action:** 5 skill 의 ADR-CHAIN-001 §번호 인용 정정 (§3=no-sim / §6=revisit). corrective.
- **Status:** resolved (수정 cycle 2026-05-17 — 상단 F-PA 처분표 SSOT)

### F-PA-004: analysis-business-rules inline schema 예제 pre-v5/v6 stale

- **Phase:** cross-validation
- **Confidence:** verified (XV schema 직접 대조)
- **Type:** gap
- **Description:** `skills/analysis-business-rules/SKILL.md:29-35` inline 예제 top-level 키(decision_tables/rule_categories/fe_validation/meta_confidence)가 현 `business-rules.schema.json`(`required:[business_rules]`+top `additionalProperties:false`) 에서 전부 hard-reject + 필수 키 부재. v5.0.0 alias-kill / v6.0.0 BR-form 2종 단일화 미반영.
- **Evidence:**
  - `schemas/business-rules.schema.json` top `required:["business_rules"]`, `additionalProperties:false`
  - `skills/analysis-business-rules/SKILL.md:29-35` (+ L20-26 DT 형상도 비-canonical)
- **Action:** inline 예제를 현행 canonical schema 형상으로 갱신. corrective.
- **Status:** resolved (수정 cycle 2026-05-17 — 상단 F-PA 처분표 SSOT)

### F-PA-005: implement-react/vue 가 schema 가 hard-reject 하는 키를 "marker 의무"로 지시

- **Phase:** cross-validation
- **Confidence:** verified (XV impl-spec.schema.json 167L 전수)
- **Type:** anti-pattern
- **Description:** `impl-spec.schema.json` 에 `react_version`/`vue_version` 부재 + top·modules.items `additionalProperties:false` → 해당 키 emit 시 schema-validator hard-reject. implement-react(L32,77)·implement-vue(L31,102) 가 이를 "schema marker 의무"로 지시 = skill↔schema 계약 모순.
- **Evidence:**
  - `schemas/impl-spec.schema.json` (react_version/vue_version 부재 / additionalProperties:false)
  - `skills/implement-react/SKILL.md:32,77` / `skills/implement-vue/SKILL.md:31,102`
- **Action:** 결단 필요 — (a) skill 문구에서 marker 의무 제거 또는 (b) impl-spec.schema.json 에 react_version/vue_version 속성 추가. design 결단 동반.
- **Status:** resolved (수정 cycle 2026-05-17 — 상단 F-PA 처분표 SSOT)

### F-PA-006: analysis-architecture/domain-model description 산출물 N off-by-one

- **Phase:** cross-validation
- **Confidence:** verified (XV deliverable 파일번호 대조)
- **Type:** gap
- **Description:** description 이 실제 deliverable 번호와 불일치. analysis-architecture:3 "산출물 2" (실제 `1-architecture.md`), analysis-domain-model:3 "산출물 3" (실제 `2-domain.md`). body 는 올바른 파일 인용 = description-body 내부 모순.
- **Evidence:** `deliverables/1-architecture.md`·`2-domain.md` vs `skills/analysis-architecture/SKILL.md:3`·`skills/analysis-domain-model/SKILL.md:3`
- **Action:** description 산출물 번호 정정. batch corrective (low).
- **Status:** resolved (수정 cycle 2026-05-17 — 상단 F-PA 처분표 SSOT)

### F-PA-007: ADR-FE-005 파일명이 자기 본문(12→13 갱신)과 stale — ★ 1차 오진 정정 (skill 인용은 정확)

- **Phase:** cross-validation
- **Confidence:** verified (수정 cycle ground-truth — ADR 본문 직접 read)
- **Type:** migration-risk
- **Description:** ★ **1차 감사 오진 정정**. ADR-FE-005 본문 title(L1)="권위 매개체 **13** 채택" + L4 "갱신 2026-05-01 (매개체 12→13 / Zod 추가)" = 내용 SSOT = **13**. 따라서 analysis-ui-visual-manifest-fe(L44)·analysis-form-validation-fe(L53) 의 "권위 매개체 13" 인용은 **정확**. stale 한 것은 **ADR 파일명**(`ADR-FE-005-권위-매개체-12-채택.md` = 12 잔존). skill 수정 ❌ (정확한 인용을 깨뜨릴 뻔 = ground-truth-before-edit 가 재작업 차단 / FP-2 위생 적발).
- **Evidence:** `docs/adr/ADR-FE-005-권위-매개체-12-채택.md:1,4` (본문 13 / 파일명 12)
- **Action:** skill 무변경(인용 정확). ADR 파일명 = immutable-history 영역(skill-citation EXCLUDE 대상) → 처분 = **wontfix-document**. 본 finding 은 "ADR 파일명 self-drift (본문 13 / 파일명 12)" 기록용.
- **Status:** wontfix-document (수정 cycle 2026-05-17 — skill 무변경 / ledger 기록 유지)
- **Status:** resolved (수정 cycle 2026-05-17 — 상단 F-PA 처분표 SSOT)

### F-PA-008: hooks-bridge buildBlockOutput 가 hookSpecificOutput.hookEventName 누락

- **Phase:** cross-validation
- **Confidence:** high (Area C 감사 file:line)
- **Type:** gap
- **Description:** `tools/chain-driver/src/hooks-bridge.js:29-40` buildBlockOutput 이 `hookSpecificOutput` 에 `permissionDecision`+`additionalContext` 만 두고 spec 권장 `hookEventName` 미설정. H3 비차단(권장) — 완성도 감소.
- **Evidence:** `tools/chain-driver/src/hooks-bridge.js:29-40`
- **Action:** buildBlockOutput 에 hookEventName 추가 (deferred/batch / 권장 필드).
- **Status:** resolved (수정 cycle 2026-05-17 — 상단 F-PA 처분표 SSOT)

### F-PA-009: business-rules.schema.json 내부 `$id` 가 rename 전 구 명칭 잔존

- **Phase:** cross-validation
- **Confidence:** verified (XV 발견 / 1차 미탐)
- **Type:** migration-risk
- **Description:** v7.0.0 파일 rename 시 `schemas/business-rules.schema.json` 의 내부 `$id`(L3)가 여전히 rename 전 구 파일명(business-rules 미반영). F-PA-002 sweep 동반 처리 대상.
- **Evidence:** `schemas/business-rules.schema.json:3`
- **Action:** `$id` → `business-rules.schema.json` (F-PA-002 sweep 동반).
- **Status:** resolved (수정 cycle 2026-05-17 — 상단 F-PA 처분표 SSOT)

### F-PA-010: design-agent 의도된 빈 placeholder (규칙 위반 아님)

- **Phase:** cross-validation
- **Confidence:** high
- **Type:** validation-result
- **Description:** `agents/design-agent.md` = skills:[] 빈 placeholder / dispatch no-op. A1~A6 위반 ❌. 사용자 결정(DEC-2026-05-17 C-4 옵션 C) 으로 비기능 상태 투명 명시. rejected 처분 권고 (정보성).
- **Evidence:** `agents/design-agent.md` frontmatter skills:[] + body 자기명시
- **Action:** wontfix (의도된 설계 / 사용자 결정 / 규칙 무위반)
- **Status:** wontfix

---

## Body Finding Ledger — F-MB namespace (methodology-body: deliverables/schemas/tools)

> 출처: 확장 감사 2026-05-17 (사용자 "1,2,3 다하자 순서대로" — Area E deliverables 25 + Area F schemas 39 + Area G tools 18 = 82 단위). F-PA(plugin-authoring 4영역)와 별개 namespace.
> overall: GREEN 74 / RED 8(전부 G = README↔code 문서 drift / 기능결함·no-simulation 위반 ❌). post-dedupe 고유 8건 / **F-021 band 5~15 "건강한 검증"**. Area E·F 구조 거의 완벽 — 실 가치 = ① F-PA-002 미완(deliverables/schemas) ② tools README↔cli.js drift.
> ★ ★ **수정 cycle 종결 (2026-05-17 / 사용자 "전체 corrective sweep + 릴리즈")** — 아래 Status = 본 cycle 처분. STOP-3 hard gate: 잔여 grep 0(rules.json safe-tier·★-key·3-seg pattern CLEAN) + skill-citation 0 + release-readiness **13/13 ready:true** (★ analysis_validator_violation = schema-validator 전 11 PoC pass = F-MB-002 패턴 tighten·F-MB-003 ★-key rename 의 PoC 회귀 0 결정적 입증 / workspace 395+ / drift-validator 3-way flows json+mermaid 정합).
>
> | F-MB | 처분 | 비고 |
> |---|---|---|
> | 001 | **resolved (부분 / 활성 DOC 표면)** | flows(json+mermaid)+guides+methodology-spec docs+deliverables 6+schemas 2 안전 3-step sweep / ★ 5-business-rules.md "(구 rules.json)" 의도적 annotation 제외 / cross_links `to_artifact: rules` = logical 자산명(불변·drift 아님 / ground-truth 적발 = FP) → **무변경** / tool src·test·scripts·PHASE-history = F-MB-009 분리 defer |
> | 002 | **resolved** | form-validation-spec:130 + formal-spec:117,198 BR-id 3-seg→canonical 4-seg. PoC 0 consumer 검증 + schema-validator 11 PoC 0-regression 입증 |
> | 003 | **resolved** | legacy-spectrum:192·static-security-spec:90 property 키 `★ ` 제거(+136 desc) / 0 PoC consumer / additionalProperties:false 영향 0 입증 |
> | 004 | **resolved** | chain-driver README exit 표 → cli.js 권위(0=ok/1=blocked-by-gate/2=invariant-violation/3=usage/4=state-corrupt) |
> | 005 | **resolved** | chain-coverage(dry-run=0)·schema-validator(violation=1/usage=2)·test-impl-pass(fail=1/usage=2) README exit 표 → cli.js header 권위 |
> | 006 | **resolved** | decision-table(+baseline/ratchet)·drift-validator(+--check-layout)·sql-inventory(11→12컬럼+migration_priority) README 보강 |
> | 007 | **resolved** | spec-test-link README finding-kind → validator.js emit(underscore)+chain.tc.no_ac_ref 정합 |
> | 008 | **resolved** | test-impl-pass README adapter 경로 src/adapters→src/runners |
> | **009** | **deferred** (★ 신규 / LL-i-55 함정존) | tool src·test·scripts·PHASE/SPIKE-history 의 `rules.json` literal = test fixture / migration script / 역사 측정기록 가능성 → blanket sweep 시 release gate 자해. forensic 파일별 disposition = 별건 (revisit) |
>
> ★ ground-truth-before-edit 가 재작업 1건 추가 차단: cross_links `to_artifact: rules` = lifecycle-contract SSOT logical 자산명(불변) → blanket 변경 시 6 deliverable logical id 파괴 (3번째 위생 적발 / LL-plugin-04 재확인).
>
> 처분(수정)은 별도 결단 (4원칙 §3) — 잔여 F-MB-009 = open/deferred.

### F-MB-001: `rules.json`→`business-rules.json`(v7.0.0) 미전파 — deliverables+schemas 확장

- **Phase:** cross-validation
- **Confidence:** verified (결정적 grep + sub-agent 실파일)
- **Type:** migration-risk
- **Description:** F-PA-002 corrective 가 skills+5 workflow doc 만 sweep → deliverables 11 파일 + schemas 2 파일에 동일 drift 잔존. cross_links `to_artifact: rules` 별칭 변종 포함. (★ 제외: 5-business-rules.md:23 = 의도적 rename 문서화 = drift 아님)
- **Evidence:** deliverables/ — 4-5-formal-spec(176)·14-form-validation-spec(11,23,32,60,71,85,87,90,98,112,125)·15-type-spec(104)·16-error-mapping-spec(96)·17-planning-spec(33,37,58)·18-behavior-spec(76)·23-characterization-spec(12,45,50,180)·24-sql-inventory(12,71) / schemas/ — characterization-spec.schema.json:128·intent-classification.schema.json:5
- **Action:** F-PA-002 동형 안전 3-step sweep 확장 (deliverables 11 + schema 2 / `to_artifact: rules`→`business-rules` 별칭 포함)
- **Status:** resolved (수정 cycle 2026-05-17 — 상단 F-MB 처분표 SSOT)

### F-MB-002: cross-schema BR-id 패턴 SSOT drift (3-seg vs canonical 4-seg)

- **Phase:** cross-validation
- **Confidence:** verified (sub-agent schema 직접 대조)
- **Type:** gap
- **Description:** form-validation-spec.cross_link_to_br + formal-spec.decision_tables.br_id·invariants.related_brs = 3-seg `^BR-[A-Z0-9_-]+-[0-9]+$` vs business-rules canonical 4-seg `^BR-...-...-[0-9]+$`. hard-reject 없음(4-seg id 가 looser 패턴에도 매칭) / 패턴 SSOT 불일치만.
- **Evidence:** schemas/form-validation-spec.schema.json:130 / schemas/formal-spec.schema.json:117,198 vs schemas/business-rules.schema.json:159
- **Action:** 3-seg 패턴을 canonical 4-seg 로 정합 (또는 공유 $defs SSOT 화) — low / 회귀 위험 검토 동반
- **Status:** resolved (수정 cycle 2026-05-17 — 상단 F-MB 처분표 SSOT)

### F-MB-003: JSON property 키에 `★` glyph 내장 (authoring smell)

- **Phase:** cross-validation
- **Confidence:** verified
- **Type:** gap
- **Description:** `legacy-spectrum.schema.json:192`(`★ tier_4_be_fe_split_carry`) + `static-security-spec.schema.json:90`(`★ runtime_check_required`) — 구조 valid JSON 이나 instance author 가 비-ASCII 장식 키를 그대로 emit 해야 함. plugin-authoring-spec schema 저작규칙 gap.
- **Evidence:** schemas/legacy-spectrum.schema.json:192 / schemas/static-security-spec.schema.json:90
- **Action:** 키에서 `★ ` 제거(ASCII 키 + description 에 강조) — 단 instance 계약 변경 = P2′ 검토(소비자 0 확인 시 PATCH)
- **Status:** resolved (수정 cycle 2026-05-17 — 상단 F-MB 처분표 SSOT)

### F-MB-004: chain-driver README exit-code 표가 cli.js 권위와 모순 (consumer-facing)

- **Phase:** cross-validation
- **Confidence:** verified (main agent ground-truth: cli.js header L16-21 + usage L62)
- **Type:** anti-pattern
- **Description:** chain-driver README exit 표 = `3=state migration / 4=interrupted` + 1↔2 의미. cli.js 권위 = `0=ok / 1=blocked-by-gate / 2=invariant-violation / 3=usage-error / 4=state-corrupt`. CI/consumer 가 README 기준 gate 시 exit 2(invariant-violation)를 blocked 로 오인 = 실 오작동 위험.
- **Evidence:** tools/chain-driver/README.md:41-42 vs tools/chain-driver/src/cli.js:16-21,62
- **Action:** README exit 표를 cli.js 권위로 동기화 (+ query/sync command 표 추가)
- **Status:** resolved (수정 cycle 2026-05-17 — 상단 F-MB 처분표 SSOT)

### F-MB-005: README exit-code 표 drift (systemic — 3 tools)

- **Phase:** cross-validation
- **Confidence:** verified (sub-agent cli.js 대조)
- **Type:** gap
- **Description:** chain-coverage-validator(README phantom code 3 / 실제 dry-run=exit 0) + schema-validator(README 1↔2 반전 / 실제 violation=1·usage=2) + test-impl-pass-validator(README fail=2 / 실제 fail=1·usage=2). 각 cli.js header `$comment` 는 정확 = README 표만 stale.
- **Evidence:** tools/chain-coverage-validator/README.md:41 / tools/schema-validator/README.md:34-39 vs cli.js:184,7 / tools/test-impl-pass-validator/README.md:38 vs cli.js:19,322
- **Action:** 3 README exit 표를 각 cli.js header 권위로 동기화
- **Status:** resolved (수정 cycle 2026-05-17 — 상단 F-MB 처분표 SSOT)

### F-MB-006: README 가 구현 표면 미문서화 (systemic — 3 tools)

- **Phase:** cross-validation
- **Confidence:** verified
- **Type:** gap
- **Description:** decision-table-validator(--baseline/--ratchet/--write-baseline ADR-010 옵션 README 부재 + Carry 가 future 로 stale-implies) + drift-validator(--check-layout v1.4.4 3-way mode README 부재) + sql-inventory-extractor(README "11 컬럼" / 실제 12 = migration_priority ADR-CHAIN-009).
- **Evidence:** tools/decision-table-validator/README.md(§Inputs/§Exit/§Carry) vs cli.js:72,77-79,109-129 / tools/drift-validator/README.md vs cli.js:141,205 / tools/sql-inventory-extractor/README.md:4 vs cli.js:19·package.json:4
- **Action:** 3 README 에 구현된 옵션/컬럼 보강
- **Status:** resolved (수정 cycle 2026-05-17 — 상단 F-MB 처분표 SSOT)

### F-MB-007: spec-test-link-validator README finding-`kind` 명이 emit 값과 전면 불일치

- **Phase:** cross-validation
- **Confidence:** verified
- **Type:** anti-pattern
- **Description:** README Outputs kind 가 hyphen 표기(coverage.ac-to-tc.below-threshold 등) / validator.js emit 은 underscore(chain.ac_coverage.below_threshold 등) + 미문서 `chain.tc.no_ac_ref`. consumer 가 kind 로 키하면 finding silently miss.
- **Evidence:** tools/spec-test-link-validator/README.md:28 vs src/validator.js:37 외
- **Action:** README Outputs(+deliverables/20-test-spec.md) kind 명을 validator.js 상수와 일치
- **Status:** resolved (수정 cycle 2026-05-17 — 상단 F-MB 처분표 SSOT)

### F-MB-008: test-impl-pass-validator README 가 dead path `src/adapters/*` 인용

- **Phase:** cross-validation
- **Confidence:** verified
- **Type:** gap
- **Description:** README adapter 표가 `src/adapters/jest.js` 등 인용하나 실제 `src/runners/*` (cli.js:26-30).
- **Evidence:** tools/test-impl-pass-validator/README.md:54 vs src/runners/
- **Action:** README adapter 경로 표를 src/runners/ 로 정정
- **Status:** resolved (수정 cycle 2026-05-17 — 상단 F-MB 처분표 SSOT)

### F-MB-009: tool src·test·scripts·PHASE-history 의 `rules.json` literal (★ LL-i-55 함정존 / deferred)

- **Phase:** cross-validation
- **Confidence:** verified (결정적 grep / 분류 보류)
- **Type:** migration-risk
- **Description:** F-MB-001 활성 DOC sweep 범위 밖 — `tools/**/test/*.test.js` (chain-driver/sync, drift-validator/canonical-single-alias·cross-*, planning-extraction-validator, formal-spec-link, static-runner, chain-coverage), `tools/**/src/*.js` (planning-extraction-validator/validator.js, br-cross-consistency/cli.js), `tools/**/scripts/*.mjs` (migration scripts), `tools/br-cross-consistency-validator/PHASE-*·SPIKE-*·layer-2-results/*` (dated 측정 history) 에 `rules.json` literal 잔존. ★ test fixture / migration script (구 format 대상) / 역사 측정기록 = 의도적일 가능성 — blanket sweep 시 workspace 395+ release gate 자해 (v7.0.0 LL-i-55·57 = post-mv hard gate 가 잡은 hidden test literal class 정확 재현). PHASE/SPIKE/layer-2-results = history immutable (LL-i-52).
- **Evidence:** `grep -rnE 'rules(\.subset)?\.(json|schema\.json)' tools/` minus business-rules (다수 / 위 분류)
- **Action:** **deferred** — 파일별 forensic disposition (각 literal = stale doc vs intentional fixture vs live code path 판정) 별건 audit. blanket ❌ (품질 1순위·재작업 최소화 / LL-i-55 정합). history 부분 = wontfix(immutable).
- **Status:** deferred (revisit — 별건 forensic audit / 본 cycle scope 외 명시)
