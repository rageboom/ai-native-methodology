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
- **Evidence:** tools/decision-table-validator/README.md(§Inputs/§Exit/§Carry) vs cli.js:72,77-79,109-129 / tools/drift-validator/README.md vs cli.js:141,205 / tools/sql-inventory-validator/README.md(★ v8.7 rename — 옛 sql-inventory-extractor) vs cli.js·package.json
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

---

## Body Finding Ledger — F-SIM namespace (chain-harness e2e simulation walkthrough audit)

> 출처: 데스크 워크스루 감사 2026-05-17 (사용자 "시뮬레이션을 해보고 싶다 — 분석부터 구현까지 모든 단계에서 플러그인의 목표에 맞게 모두 적용되는지 비효율·개선점" / 본 cycle = audit + log + P0 plan 단계 / 시행 ❌). F-PA(plugin-authoring 4영역) / F-MB(deliverables·schemas·tools) 와 별개 namespace.
> 범위: SDLC chain harness 4-stage e2e (analysis → planning → spec → test → impl + traceability) — `examples/poc-05-sample-user-register`(reference cycle / sub-plan-6 / §8.1 strict 7/7 #7) + `examples/poc-03-realworld-nestjs`(retrofit corroboration #2) **2 PoC cross-validation**. stack·scale 모두 상이(pure-node·micro vs NestJS·RealWorld) → 재현 시 방법론 레벨 확정.
> overall: 11 finding / 교차 가능한 7개 전부 **2 PoC 동형 재현 + 4개 RealWorld 에서 악화**. 단일 PoC 특이 = 0 → **방법론 구조 결함 확정** (§8.1 단일 PoC 과적합 회피 휴리스틱 통과).
> ★ ★ ★ **D9 §8.1 자기정합 ≥3 PoC pre-sweep 결과 (2026-05-18)**: chain 산출물 가용 = poc-05(BE micro) + poc-03(BE RealWorld) + poc-04-mini(FE) = 3 PoC. **F-SIM-002/004 = 3 PoC 모두 재현** (severity all-critical / BR축 부재) → methodology-level **★★★ 확정** (BE+FE 횡단). **F-SIM-003 = BE 2 PoC 만 재현** (poc-04-mini FE = all paths exist / v7.0.0 `rules.json` rename collateral = BE-track 특이) → validator path-resolve assert 는 universal good 이나 prevalence claim 정합 (BE 전용). **F-SIM-011 본질 잔존** = 오직 poc-05 만 chain 4 GREEN 도달 (corroboration #2 = poc-03 placeholder / poc-04-mini chain 3 종결). LL-fsim-04 자산화 의무 해소.
> F-021 band = 5~15 "건강한 검증"(11건 / 명세 부실 의심 ❌ — chain harness 자산 자체가 활발히 측정 중인 신호).
> **공통 뿌리 1개**: "본 방법론은 *링크 존재*는 결정적으로 강제하나 *링크가 비즈니스 사실을 보존하는가*는 강제하지 않는다" — F-SIM-001/002/003/004/005가 모두 이 한 뿌리.
> ★ ★ ★ **본 cycle Status = open / proposed_fix 명시 / 4원칙 §3 묶음 go/stop 대기** — F-PA/F-MB 와 달리 본 ledger 등재 시점 = 시행 전. P0 plan 별도 산출(`.claude/plans/plan-fsim-p0.md`) + 3-에이전트 research 후 묶음 결단.
>
> | F-SIM | severity | 처분 (제안) | 비고 |
> |---|---|---|---|
> | 001 | **high** | closed (MINOR 후보) | AP→BR→AC coverage lane 신설 + critical 이탈 시 gate 강제 경고 |
> | 002 | **high** | closed (PATCH~MINOR) | `tools/traceability-matrix-builder/src/builder.js:56` severity = max(BR·AP·AC.MoSCoW) source-grounded 전파 |
> | 003 | **high** | closed (PATCH) | `tools/chain-coverage-validator/src/validator.js` cross-ref 경로 resolve assert (dead-link 결정적 차단 / skill-citation-validator 선례 동형) |
> | 004 | **medium** | closed (MINOR / 002 동반) | matrix BR 축 추가 — schema + builder + by_business_rule 정합 |
> | 005 | **high** | closed (MINOR) | RED 규약: 실 runner 실행 의무화 (dry-run placeholder 금지) + assertion-fail RED + per-TC 물증 granularity |
> | 006 | **high** | closed (PATCH) | gate #4 = `test-impl-pass-validator --allow-execute` 경유 의무화 (수동 사이드채널 차단 / release-readiness criterion 후보) |
> | 007 | **medium** | deferred | chain 산출물 `meta` 단일화 / source_grounded_evidence 참조화 — scale 의존 / PoC 2~3회 누적 후 closed |
> | 008 | **medium** | closed (PATCH) | 산출물 meta 의 방법론 서사(phase_b/phase_d note) 분리 → decisions/ 이전 (이식성 5종 원칙 정합) |
> | 009 | **medium** | closed (PATCH) | 4 gate 공통 `chain-intervention-log.jsonl` 영속 강제 (flow gate-1 outputs 이미 명세) |
> | 010 | **medium** | closed (PATCH) | 기준 PoC README/run-log content-aware sync + release-readiness #14 후보 (PoC 문서 drift) |
> | 011 | **high** | closed (MINOR) | release_eligibility #2/#6/#7 = "≥2 PoC 모두 chain 4 GREEN 도달" 강화 또는 poc-03 chain 4 실행 / corroboration 명시 제외 (§8.1 자기정합) |
> | 012 | medium | **closed v8.14.4** | severity_distinct_count gauge = F-SIM-002 로 schema+builder 에 이미 존재 (audit signal) / 단일 PoC false-positive (distinct==1 = AC.MoSCoW must 분포 정상값) / hard sentinel scope-out (paradigm 한계 수용) / DEC-2026-05-23-fsim-012-014-close §1 |
> | 013 | medium | **closed v8.14.0** | Type 1 시뮬레이션 한계 (hook + agent fire 0 / Claude self-run paradigm) — v8.14.0 Type 분류 3계층화 paradigm 본격 흡수 (Type 1 정식 분류 + Type 2 carry 정직 표기 / DEC-2026-05-23-fsim-005-corroboration-2-genuine §1) |
> | 014 | low | **closed v8.14.4** | analysis-form-validation-fe 의도적 FE 전용 유지 (name -fe / track=FE / Zod·Yup·RHF 대상) + BE schema validation (Pydantic/dataclass/Joi-BE) 별도 future skill 후보 / F-SIM-016 선례 동형 / DEC-2026-05-23-fsim-012-014-close §2 |
> | 015 | **high** | **closed v8.14.0** | test-spec.fail_mode schema 미허용 / F-SIM-005 P1 carry 즉시 영향 — v8.14.0 fail_mode enum 4종 (compile_import_fail/assertion_fail/dry_run_placeholder/pending) 추가 + chain-coverage-validator validateFailModeDistribution 7번째 export (warn-only / boolean 강제) 본격 흡수 / DEC-2026-05-23-fsim-005-corroboration-2-genuine §3 |
> | 016 | low | **closed v8.14.3** | static-runner Semgrep wrapper deprecated / Windows MSYS2 환경 fire ❌ — v8.14.3 본격 흡수 (R19 Tier 2 안 environment-dependent risk sub-axis 본격 명시 / Tier 3 격상 ❌ paradigm 정합 / memory `feedback_environment_dependent_tools_scope_out` 본격 신설 / DEC-2026-05-23-fsim-016-environment-dependent-scope-out §1) |
>
> ★ P0 = F-SIM-001 / 002 / 003 / 011 (high + 공통 뿌리 핵심 4종). 나머지는 P0 시행 후 P1/P2. ★ v8.14.0 본격 흡수 = F-SIM-005 (P1 carry 본격 해소) + F-SIM-013 (Type 분류 3계층화 paradigm 안 흡수) + F-SIM-015 (test-spec.fail_mode schema 본격 추가). 잔존 carry = **0** (F-SIM-016 closed v8.14.3 scope-out / F-SIM-012 closed v8.14.4 gauge-sufficient / F-SIM-014 closed v8.14.4 FE scope-out).

### F-SIM-001: critical antipattern 이 chain 을 무경고로 관통 + matrix 가 "critical/green" 보고

- **Phase:** chain harness e2e (cross-validation 2 PoC)
- **Confidence:** verified (poc-05 + poc-03 동형 재현)
- **Type:** anti-pattern (false assurance)
- **Description:** chain 은 "AC가 된 것"만 검증. AP(antipattern) 가 BR→AC 로 매핑되지 않으면 chain validator 도 matrix 도 침묵. poc-05 = AP-USER-003(critical / plaintext 비교) 가 `scope OUT` → BR/AC/TC 부재 → IMPL-USER-002 가 legacy 결함을 **그대로 재구현** (`if (user.password !== password)`) → matrix 는 `UC-USER-002 / status:green / severity:critical / 100% pass`. poc-03 = AP-AUTH-NEST-001 + AP-DB-001(critical 2건) 가 AC 어디에도 없음(`included:false`/2) — 무선언으로 chain 이탈. **AP→BR→AC enforced lane 부재** (antipattern 은 "avoid-list 자료"로만 소비 / gate validator 목록에 antipattern coverage 없음).
- **Evidence:** `examples/poc-05-sample-user-register/input/antipatterns.json` AP-USER-003 + `.aimd/output/impl-spec.json` IMPL-USER-002.source_evidence + `.aimd/output/matrix.json` row 2. `examples/poc-03-realworld-nestjs/output/antipatterns/antipatterns.json` critical 2건 vs `.aimd/output/acceptance-criteria.json` (언급 0).
- **Spec gap:** `flows/sdlc-4stage-flow.json` gate validators / `flows/spec.phase-flow.json` 에 AP coverage lane 부재. `methodology-spec/workflow/phase-N-*.md` AP→AC 매핑 강제 절 부재.
- **Decision made:** poc-05 가 AP-003 explicit scope-out 으로 우회(carry_to v2.x). poc-03 은 silent omit.
- **Severity:** **high** — 모든 chain 영향 / 우회 시 critical 결함 ship / 표준화 시급.
- **Proposed fix:** (a) `tools/chain-coverage-validator` 에 antipattern-coverage 신 lane 추가 (severity≥high AP 가 AC.test_case_refs 로 도달하지 못하면 finding emit) (b) scope-out 시 명시 `excluded:{reason, decision_ref}` field 의무 (c) matrix 에 `unaddressed_critical_aps` 컬럼 추가. MINOR(validator+schema+flow 추가 / breaking ❌).

### F-SIM-002: matrix severity 가 source-grounded 아님 (AC.MoSCoW 단일 축 / BR·AP severity 전파 부재)

- **Phase:** chain harness e2e (cross-validation 2 PoC)
- **Confidence:** verified (코드 ground-truth — `tools/traceability-matrix-builder/src/builder.js:56`)
- **Type:** anti-pattern (source-grounded 원칙 위배)
- **Description:** matrix-builder 가 cell severity 를 오직 `ac.severity` MoSCoW 로 매핑 — `must→critical / should→medium / could→low`. BR.severity (high/medium/low/critical) 도 AP.severity 도 전혀 전파 안 됨. 2 PoC 모두 모든 AC = `severity:"must"` → 결과적으로 **all-critical matrix**. `severity_floor.critical:1.0` ratchet 이 trivially 충족(가짜 critical 100% green) — 진짜 critical(AP-USER-003) 은 matrix 밖. 본 방법론 1순위 원칙(source-grounded / 환각 차단)과 정면 충돌.
- **Evidence:** `tools/traceability-matrix-builder/src/builder.js:56,67,77` (`severity: ac.severity === 'must' ? 'critical' : ac.severity === 'should' ? 'medium' : 'low'`). poc-05 matrix severity distinct = `['critical']`. poc-03 matrix severity distinct = `['critical']` (동일 패턴 / stack 무관).
- **Spec gap:** `schemas/traceability-matrix.schema.json` cell.severity 산정 규칙 부재. `methodology-spec/deliverables/22-traceability-matrix.md` severity 의미축 정의 부재.
- **Decision made:** N/A (의도된 동작 아님 — 단일 축 누락).
- **Severity:** **high** — 모든 PoC matrix 영향 / ratchet 자체 무력화 / 단일 지점 fix (builder.js:56,67,77 + schema).
- **Proposed fix:** `severity = max(BR.severity, AP.severity ∈ AC.related_aps, AC.MoSCoW→severity)` source-grounded 전파. AC schema 에 `related_aps[]` + `related_brs[]` 명시. PATCH~MINOR (단일 도구 + schema 추가 / 11 PoC 회귀 검증 필수 / F-PA-009 선례 동형).

### F-SIM-003: chain-coverage-validator 가 cross-ref 경로 resolve 미검증 (broken cross-ref silent)

- **Phase:** chain harness e2e (cross-validation 2 PoC)
- **Confidence:** verified (코드 + 2 PoC dead-link 실측)
- **Type:** gap
- **Description:** `tools/chain-coverage-validator/src/validator.js:98-103` 는 `behavior.cross_links.to_analysis_artifacts` 가 **비어있지 않음만** 확인 — 경로 resolve / existsSync assert 부재. v7.0.0 `rules.json → business-rules.json` rename 이 docs는 sweep (F-MB-001) 했으나 chain 산출물의 `derivation_source.source_artifacts` 와 `cross_links.to_analysis_artifacts` 는 미동기화 → 두 PoC 모두 dead-link 보유. poc-03 은 추가로 derivation_source(상대 `output/rules/rules.json`)와 cross_links(repo-absolute `examples/.../output/rules/rules.json`) **경로 컨벤션 불일치**.
- **Evidence:** poc-05 `planning-spec.json` derivation_source.source_artifacts = `["input/rules.json", ...]` (MISSING). poc-03 동일 + 컨벤션 불일치. validator.js:98 코드 직접 검증.
- **Spec gap:** chain-coverage-validator 명세에 path-resolve assert 부재. `schemas/discovery-spec.schema.json` + `schemas/behavior-spec.schema.json` cross_links/derivation_source 항목에 path format / resolution rule 부재.
- **Decision made:** N/A (rename 후속 전파 누락).
- **Severity:** **high** — dead-link 결정적 차단 부재 = F-MB-001 / skill-citation-validator(v8.1.0 #13) 선례와 동일 class 가 chain stage 잔존.
- **Proposed fix:** chain-coverage-validator 에 `pathExistsAssert(cross_links + derivation_source)` 추가 + 경로 컨벤션 단일화(repo-relative). PATCH (additive assert / validator 단일 지점 / skill-citation-validator paradigm 재활용).

### F-SIM-004: BR 이 traceability-matrix 의 1급 축에서 누락

- **Phase:** chain harness e2e (cross-validation 2 PoC)
- **Confidence:** verified
- **Type:** gap
- **Description:** matrix 행 = UC→BHV→AC→TC→IMPL. **BR 컬럼 없음**. `coverage_summary.by_business_rule:1.0` 는 별도 계산되나 사람이 읽는 matrix 에서 "어느 BR 이 어디서 검증됐는가" 추적 불가. poc-05 BR-USER-VALIDATION-001 은 전용 AC 없이 TC it-block 만 존재 → matrix 상 보이지 않음. BR 은 환각 차단의 핵심 anchor 인데 최종 추적표에서 증발.
- **Evidence:** poc-05/03 `matrix.json.matrix[]` row schema = `{use_case_id, behavior_id, acceptance_id, test_id, impl_id, status, severity}` — `business_rule_id` 부재. `has BR axis: false` (poc-03 검증 출력 직접).
- **Spec gap:** `schemas/traceability-matrix.schema.json` cell schema 에 br 축 부재. DO-178C bidirectional 차용 시 BR(요구사항) 누락은 비정합.
- **Decision made:** N/A.
- **Severity:** **medium** — matrix 가독성·완전성 (구조적 무결성보다 사람 추적 가능성).
- **Proposed fix:** matrix row 에 `business_rule_ids[]` 추가 (BHV.br_refs 경유). F-SIM-002 와 동반 시 MINOR. schema + builder + md/mermaid 렌더 갱신.

### F-SIM-005: RED granularity 결여 + dry-run placeholder (★ 표현 수정 2026-05-18 / F-015 Claim C CONTRADICTS 반영)

- **Phase:** chain harness e2e (cross-validation 2 PoC)
- **Confidence:** verified
- **Type:** anti-pattern (RED 의무 의미 누수 / per-TC granularity)
- **Description:** **★ 수정 2026-05-18** — 기존 "약한 RED(import 부재)" 표현은 Kent Beck "TDD by Example" 원저 *"Red — Write a little test that doesn't work, **and perhaps doesn't even compile at first**"* + Uncle Bob 3 Laws *"compilation failures are failures"* 기준 **틀림**. 정확한 RED 강도 3계층:
  - **Strongest** = assertion-fail (SUT 존재 + 단언 실패)
  - **Valid (Beck-canonical)** = compile/import-fail (Beck 원저 명시 RED 포함)
  - **Weak / Non-RED** = dry-run placeholder / `pending()` / TODO (Cucumber 기준 assertion 미실행 = 노란색)

  본 finding 본질 (수정 후):
  - poc-05 RED 물증 = `"Failed to load url ./user.service.js"` (suite load 실패 / module not found) = **Beck-canonical valid RED** (격하 무효 / 인용 정확). 다만 두 TC가 **동일 result_hash·동일 stdout·동일 timestamp** 공유 → per-TC 물증이 실제로는 suite-level 1건 복제. `fail_count:1`×2 는 "2개 TC 가 단언 실패"로 오인 유발 — **per-TC granularity 결여**가 본 finding 잔존 본질.
  - poc-03 = `"(not run / retrofit dry-run)"`, `duration_ms:0` → **테스트 자체 미실행** = invalid placeholder (corroboration #2 가 진짜 RED 없이 등재 / F-SIM-011 본질 직결).
- **Evidence:** poc-05 `.aimd/output/test-spec.json` TC-USER-001/002 test_run_evidence 동일 hash. poc-03 동 file 의 placeholder 문자열. ★ F-015 출처: Kent Beck "TDD by Example" via stanislaw.github.io / Uncle Bob 3 Laws / Cucumber docs (research-fsim-p0.md §2 Claim C).
- **Evidence:** poc-05 `.aimd/output/test-spec.json` TC-USER-001/002 test_run_evidence 동일 hash. poc-03 동 file 의 placeholder 문자열.
- **Spec gap:** `flows/test.phase-flow.json` "expected_outcome: all_fail" 표현만 — RED 강도 3계층 (assertion-fail / compile-import-fail / dry_run_placeholder) 규약 부재. `schemas/test-spec.schema.json` 에 per-TC granular evidence 의무 + fail_mode enum 부재.
- **Decision made:** poc-05 implicit (compile-import-fail = Beck-canonical valid RED 수용 / 단 per-TC granularity 결여). poc-03 explicit (retrofit 환경 부재 dry_run_placeholder = invalid RED).
- **Severity:** **high** — per-TC granularity 결여 + dry_run_placeholder 가 "진짜 runner 5종 물증" claim 을 실제로 corroborate 안 함 (F-SIM-011 와 직결). compile-import-fail 자체는 RED 자격 유효 (Beck-canonical).
- **Proposed fix:** RED 규약 강도 3계층화 — `expected_outcome:fail` 시 `test_run_evidence.fail_mode ∈ {assertion, compile_import, dry_run_placeholder}` enum 강제 + per-TC granular invocation 의무 (suite-level 복제 ❌) + `dry_run_placeholder` 는 corroboration count 제외. **★ Beck-canonical 정합**: compile_import 도 valid RED 인정 / strongest 아님 명시. MINOR.

### F-SIM-006: no-simulation 강제 도구가 gate 에서 우회됨 (--dry-run + 수동 사이드채널)

- **Phase:** chain harness e2e (poc-05 run-log 실측)
- **Confidence:** verified (run-log + flow 대조)
- **Type:** anti-pattern (양심 의존 회귀)
- **Description:** gate #4 cross_cutting.no_simulation.enforcement 가 명시한 경로 = `test-impl-pass-validator --allow-execute`. poc-05 run-log 실제: `test-impl-pass-validator --dry-run` (config 검증만) + 실제 실행은 수동 `npx vitest run` 사이드채널. 강제 게이트가 강제하지 않고 manual 물증을 신뢰. trio enforcement (state.blocked + cli exit 2 + PreToolUse deny) + D21' suppressOutput=true 의 "양심 의존 차단" paradigm 자기 위배.
- **Evidence:** `examples/poc-05-sample-user-register/.aimd/output/run-log.md` chain 4 절 "test-impl-pass-validator (--dry-run) → exit 0 / config 검증 ✅" vs `flows/sdlc-4stage-flow.json` cross_cutting.no_simulation.enforcement `test-impl-pass-validator --allow-execute`.
- **Spec gap:** release-readiness 에 gate validator 가 `--allow-execute` 경로로 실행됐는지 결정적 assert 부재.
- **Decision made:** poc-05 implicit — 사용자 manual side-channel.
- **Severity:** **high** — chain harness "harness-validated" status 핵심 claim 의 실 enforcement 누수.
- **Proposed fix:** release-readiness criterion 신설 — chain 4 진입 PoC 는 `test-impl-pass-validator --allow-execute` 실 invocation evidence(stderr 마커 / state.json 마커) 필수. PATCH.

### F-SIM-007: chain 산출물 ceremony-to-payload 비대 + meta 중복

- **Phase:** chain harness e2e (2 PoC)
- **Confidence:** verified
- **Type:** smell (efficiency)
- **Description:** UC 2종·test 6개 전달에 chain JSON ~423줄(poc-05) + md/mermaid 3중 렌더. `meta` 블록(generated_at/methodology_version/confidence/formula_version) **chain 4~5 단계 verbatim 중복**, source_grounded_evidence 3~4회 재기술, UC description 이 planning→behavior→AC 에서 거의 동일 재진술. RealWorld scale 에서 선형 증폭 + 검증·drift 표면 증가 → ≥85% 자동화 목표의 숨은 비용.
- **Evidence:** poc-05 meta 블록 5× verbatim / poc-03 4× (+ source_commit_sha 추가). chain 산출물 라인 수: planning 81 + behavior 69 + AC 59 + test 87 + impl 82 = 378 + matrix 45.
- **Spec gap:** schema 에 meta 단일화 / 참조화 규약 부재.
- **Decision made:** N/A.
- **Severity:** **medium** — 효율 / scale 의존 / 단일 PoC 임계 결정 불가 (F-021 §8.1 휴리스틱: PoC 2~3 회 누적 후 closed).
- **Proposed fix:** meta 단일화 (chain-meta.json 1개 + 각 spec 참조) + source_grounded_evidence 첫 등재 후 ref 만. deferred (PoC 누적 후).

### F-SIM-008: 산출물 meta 에 방법론 진화 서사(phase_b/phase_d note) 혼입

- **Phase:** chain harness e2e (2 PoC)
- **Confidence:** verified
- **Type:** anti-pattern (산출물 이식성 원칙 위배)
- **Description:** poc-05 `business-rules.json.meta` = `phase_b_migration_note` (session 11차) + `phase_d_meta_recovery_note` (session 15차). poc-03 = `phase_d_meta_recovery_note` Sprint 1-J 서사 + `methodology_version` skew (rules=v1.2.2 vs chain artifacts=v2.0.0 한 PoC 내 불일치). PoC 산출물이 방법론 진화 이력을 inline 운반 → `decisions/` 에 있어야 할 내용. 산출물 이식성 5종 원칙(언어/환경 100% 무관) 과 상충 (이식 시 노이즈 + 버전 skew).
- **Evidence:** 직접 인용 가능 (poc-05/03 business-rules.json.meta).
- **Spec gap:** `schemas/business-rules.schema.json` meta 에 `migration_note` enum 부재 / `methodology-spec/deliverables/4-business-rules.md` meta 절 형식 미규정.
- **Decision made:** N/A (점진 누적).
- **Severity:** **medium** — 단일 phase / 이식성 영향 / 우회 가능.
- **Proposed fix:** meta 진화 서사 → `decisions/DEC-*.md` 이전 + business-rules.json meta 는 `generated_at/confidence/inputs_used/methodology_version` core 만 유지 + version skew 결정적 차단. PATCH.

### F-SIM-009: gate 감사 추적 비일관 (intervention_log 영속 불일치)

- **Phase:** chain harness e2e (poc-05)
- **Confidence:** verified
- **Type:** gap
- **Description:** intervention_log 가 impl-spec(gate #4) `human_review.intervention_log` 에만 존재. gate #1~#3 은 run-log.md 서사로만. README 가 약속한 `intervention-log.jsonl` 파일 부재. 4 gate 의 결단 영속 방식 불일치 → gate UX/audit 신뢰성 비대칭. flow `gate-1.outputs` 에 `chain-intervention-log.jsonl` 이미 명세 (planning.phase-flow.json) 인데 poc-05 미시행.
- **Evidence:** poc-05 `impl-spec.json` human_review.intervention_log (단일) vs `flows/discovery.phase-flow.json` gate-1.outputs (스펙). `find .aimd -name "intervention-log.jsonl"` = empty.
- **Spec gap:** chain-driver / hooks 가 gate decision 을 통일 형식으로 jsonl append 하는 강제 부재.
- **Decision made:** N/A.
- **Severity:** **medium** — gate UX·audit 신뢰성.
- **Proposed fix:** chain-driver `state` mutation 시 `intervention-log.jsonl` append 강제 (gate #1~#4 공통). PATCH.

### F-SIM-010: 기준 PoC README/run-log 가 자기 산출물과 drift

- **Phase:** chain harness e2e (poc-05)
- **Confidence:** verified
- **Type:** gap (consumer-facing)
- **Description:** poc-05 README 가 `password-comparator.ts` / `vitest.config.ts` / `.aimd/state.json` / `traceability-matrix.{json,md,mermaid}` 등 약속 — 실제 `matrix.{json,md,mermaid}` 외 다수 부재. run-log 는 `input/rules.json` 명령 예시 (실제 `output/rules/business-rules.json`). 기준 레퍼런스 PoC 의 문서가 자기 산출물과 불일치 → 신규 사용자 first-prompt-cookbook 경로 오염. F-MB-001 (v7.0.0 rename) 후속 전파 누락 class.
- **Evidence:** poc-05 README 의 `## 산출` 트리 vs `find examples/poc-05-sample-user-register`.
- **Spec gap:** PoC 문서 ↔ 실 산출물 결정적 일치 검증 도구 부재.
- **Decision made:** N/A.
- **Severity:** **medium** — consumer-facing 이나 단일 PoC 한정.
- **Proposed fix:** release-readiness #14 후보 — PoC README 가 인용한 파일 경로의 실재 결정적 assert (skill-citation-validator repo-wide 확장 paradigm 재활용). PATCH.

### F-SIM-011: §8.1 "≥2 PoC corroboration" 이 최강 claim 에서 사실상 n=1 (release_eligibility 자기정합 위배)

- **Phase:** chain harness e2e (cross-validation 발견)
- **Confidence:** verified (poc-03 실측)
- **Type:** anti-pattern (자기정합 위배)
- **Description:** §8.1 strict 7/7 release_eligibility 의 명목 corroboration = poc-05 + poc-03 retrofit. 실측: poc-03 test-spec = `"(not run / retrofit dry-run)"`, `duration_ms:0` → **테스트 미실행**. matrix = 전 행 `yellow`, `green_count:0`, `forward_coverage:0`, impl-spec 부재 → **chain 4 (GREEN) 미도달**. 따라서: (#2 진짜 도구 5종 물증) corroborated by poc-05 only / (#6 matrix 100% green) poc-05 only / (#7 e2e 1 cycle pass) poc-05 only. **본 방법론이 §8.1 에서 경계하는 단일 PoC 과적합이 본 방법론 자신의 검증대(§8.1 strict 7/7) 에 실재.** F-SIM-001~010 이 두 PoC 에서 모두 통과한 이유 = 검증 골격이 의미 안 보고 링크만 봐서(공통 뿌리) + 두 번째 PoC 가 후반 chain 비어서.
- **Evidence:** `examples/poc-03-realworld-nestjs/.aimd/output/test-spec.json` test_run_evidence (placeholder 문자열) + matrix.json `green_count:0`. `flows/sdlc-4stage-flow.json` release_eligibility.items[1,5,6].data_source 명목.
- **Spec gap:** release_eligibility 의 "≥2 PoC corroboration" 정의에 "각 PoC 가 어느 chain stage 까지 도달했는지" 강도 차이 미구분.
- **Decision made:** N/A (구조적 누락).
- **Severity:** **high** — release 자격 자체 흔들림 / §8.1 자기정합 위배.
- **Proposed fix:** 옵션 둘 중 — (A) poc-03 chain 4 실제 실행 후 GREEN 도달 (PoC 보강 / 시간 비용 ↑) / (B) release_eligibility #2/#6/#7 에 "각 PoC 가 chain 4 GREEN 도달" 명시 + poc-03 = analysis~chain-3 corroboration 으로 격하 + 신규 PoC(예: poc-12/13) 를 chain 4 GREEN corroboration #2 후보로 명시. MINOR. ★ F-SIM-005 와 직결 (RED placeholder 가 §8.1 #2 빈약 corroboration 본질).

### F-SIM-012: severity_distinct_count=1 mask (모든 AC must → cell critical / SSOT mapping 한계)

- **Phase:** chain harness e2e (v8.4.0 시뮬레이션 dogfood / poc-14)
- **Confidence:** verified (poc-14 시뮬레이션 실측)
- **Type:** anti-pattern (SSOT mapping 단일축 / F-SIM-002 propagation 가시화 한계)
- **Description:** v8.4.0 시뮬레이션 (poc-14) chain harness 안 traceability-matrix 의 severity distinct count = 1 (모든 cell = "critical"). F-SIM-002 가 severity max-propagation 본격 흡수했으나, 모든 AC = MoSCoW must → cell 전부 critical 도달 = severity_distinct_count 본질 mask. propagation 본격 가시화 ❌ (BR/AP 단계 별 severity 차이 보존 ❌).
- **Evidence:** poc-14 matrix.json `severity distinct = ['critical']`. v8.4.0 시뮬레이션 산출물 `.aimd/simulation/invocation-log.md` 안 본격 표면화.
- **Spec gap:** ~~gauge 부재~~ → `severity_distinct_count` gauge 는 F-SIM-002 로 `schemas/traceability-matrix.schema.json` + builder.js 에 **이미 존재** (audit signal). `methodology-spec/deliverables/22-traceability-matrix.md` severity propagation 단일축 = 알려진 paradigm 한계 (수용 / AC MoSCoW 분포 다양화는 권고 수준).
- **Decision made:** v8.4.0 표면화 → v8.14.0 ledger 등재 → **v8.14.4 close** (gauge 충분 / 하드 sentinel scope-out / 2026-05-23).
- **Severity:** medium — F-SIM-002 본격 흡수 후 부분 잔존 / paradigm-level 한계 표면화 / single-PoC carry.
- **Proposed fix:** ★ 해소됨 — `severity_distinct_count` gauge 이미 존재 (audit signal 충분). 하드 release-gate sentinel 은 **scope-out**: distinct==1 은 작은 all-must PoC(poc-14)에서 정상값 → gate 화 시 §8.1 단일 PoC false-positive. schema 설명의 미구현 "#14 sentinel" 문구 제거.
- **Status:** ★ ★ **closed v8.14.4 (gauge 충분 / sentinel scope-out)** (DEC-2026-05-23-fsim-012-014-close).

### F-SIM-013: Type 1 시뮬레이션 한계 (hook + agent fire 0 / Claude self-run paradigm)

- **Phase:** chain harness e2e (v8.4.0 시뮬레이션 dogfood / poc-14)
- **Confidence:** verified (poc-14 시뮬레이션 실측 + v8.14.0 Type 분류 3계층화 paradigm 본격 흡수)
- **Type:** paradigm-level (Type 1 self-run 한계)
- **Description:** v8.4.0 시뮬레이션 = main agent (Claude) self-run paradigm = SKILL.md 매뉴얼 읽고 직접 따라 실행. hooks (SessionStart / UserPromptSubmit / PreToolUse) + 5 stage agent (analysis/planning/spec/test/implement) dispatch 모두 fire 0 (실제 Claude Code session 안에서만 측정 가능). Plugin 의 자동화 paradigm 본격 측정 불가 / 자동변속기를 손으로 페달 밟아 시뮬레이션 본질.
- **Evidence:** poc-14 `.aimd/simulation/invocation-log.md` (63 entry / 47 skill × 9 hook × 17 agent × 3 매트릭스 안 hook fire=0 / agent dispatch=0). v8.14.0 Type 분류 3계층화 paradigm 본격 흡수 (Type 1 = Claude self-run / Type 1.5 = user dogfood / Type 2 = external user).
- **Spec gap:** v8.4.0 시점 = paradigm-level 분류 부재. v8.14.0 = `flows/sdlc-4stage-flow.json` `release_eligibility.corroboration_type_levels` 3계층 신설로 본격 해소.
- **Decision made:** v8.14.0 (2026-05-23 / DEC-2026-05-23-fsim-005-corroboration-2-genuine §1) — Type 분류 3계층화 paradigm 진화 + Type 1 정식 분류 + Type 2 carry 정직 표기.
- **Severity:** medium — paradigm-level 한계 / v8.14.0 본격 흡수 완료.
- **Proposed fix:** ★ 본격 적용됨 (v8.14.0 / Type 분류 3계층화 + self_consistency_note 정직 표기 + carry 명시).
- **Status:** ★ ★ **closed v8.14.0** (DEC-2026-05-23-fsim-005-corroboration-2-genuine §1 / Type 분류 3계층화 paradigm 본격 흡수).

### F-SIM-014: analysis-form-validation-fe description "FE-only" → Pydantic BE schema validation cover ❌

- **Phase:** chain harness e2e (v8.4.0 시뮬레이션 dogfood / poc-14)
- **Confidence:** verified (poc-14 = Python FastAPI + Pydantic BE / analysis-form-validation-fe skill non-fire 본격 표면)
- **Type:** gap (skill description scope mismatch)
- **Description:** `skills/analysis-form-validation-fe/SKILL.md` description = "FE-only" 명시 → Pydantic BE schema validation (FastAPI request body validation 본격 표면) cover ❌ / poc-14 BE stack 안 본격 fire 누락. Pydantic BE validation = schema-validation paradigm 정합 = FE Zod/Yup 와 동형 / description scope 확장 후보.
- **Evidence:** poc-14 `.aimd/simulation/element-frequency.json` 안 analysis-form-validation-fe = non-fire (track-mismatch 분류). Pydantic schema = `examples/poc-14-fsim-corroboration/source/app/schemas.py` 안 본격 표면.
- **Spec gap:** skill description scope 정의에 "BE schema validation framework (Pydantic / dataclass / Joi-BE 등)" 본격 cover 정책 부재.
- **Decision made:** v8.4.0 표면화 → v8.14.0 ledger 등재 → **v8.14.4 close (scope-out)** (2026-05-23).
- **Severity:** low — single skill scope / 우회 가능 (analysis-source-inventory 가 Pydantic 표면 cover).
- **Proposed fix:** ★ scope-out — `analysis-form-validation-fe` 는 의도적 FE 전용 (name `-fe` / track=FE / Zod·Yup·RHF 대상) 유지. BE schema validation (Pydantic / dataclass / Joi-BE) = 별도 future skill 후보로 문서화 (skill 정체성 보존 + breaking 0). poc-14 BE 검증 표면은 analysis-source-inventory 가 우회 cover. F-SIM-016 환경-의존 scope-out 선례 동형.
- **Status:** ★ ★ **closed v8.14.4 (scope-out / FE 전용 유지)** (DEC-2026-05-23-fsim-012-014-close / BE schema validation skill = future 후보).

### F-SIM-015: test-spec.fail_mode schema 미허용 (F-SIM-005 P1 carry 즉시 영향)

- **Phase:** chain harness e2e (v8.4.0 시뮬레이션 dogfood / poc-14 chain 3 단계)
- **Confidence:** verified (poc-14 시뮬레이션 chain 3 안 schema reject 본격 표면 + v8.14.0 본격 흡수)
- **Type:** gap (schema 강화 미시행 / F-SIM-005 P1 carry 즉시 영향)
- **Description:** v8.4.0 시뮬레이션 chain 3 단계 안 test-spec.json 생성 시 `tests[].fail_mode` 필드 본격 추가 시도 → `schemas/test-spec.schema.json` 안 fail_mode enum 미허용 → schema-validator reject → 우회 (fail_mode 필드 제거 후 진행). 본 시점 = F-SIM-005 의 "P1 carry" 결단 (v8.3.0 deadline 2026-06-01) 의 즉시 영향 = **P1 미룬 결단이 1 session 뒤 즉시 영향 = 결단 cadence dogfood 입증**.
- **Evidence:** v8.4.0 시뮬레이션 `.aimd/simulation/invocation-log.md` 안 schema-validator reject 본격 표면 (entry 38~42). v8.14.0 schema 본격 진화 = `schemas/test-spec.schema.json` `test_cases.items.properties.fail_mode` enum 4종 (compile_import_fail / assertion_fail / dry_run_placeholder / pending) 추가 (additive optional / DEC-2026-05-23-fsim-005-corroboration-2-genuine §3).
- **Spec gap:** v8.4.0 시점 = F-SIM-005 P1 carry 결단의 즉시 영향 표면화. v8.14.0 = schema 본격 진화로 본격 해소.
- **Decision made:** v8.14.0 (2026-05-23) — test-spec.schema.json fail_mode enum 4종 추가 + chain-coverage-validator validateFailModeDistribution 7번째 export 본격 신설 + poc-05/poc-14 test-spec fail_mode=assertion_fail 표기.
- **Severity:** high — schema 강화 미시행이 chain 단계 본격 차단 / F-SIM-005 P1 즉시 영향 표면.
- **Proposed fix:** ★ 본격 적용됨 (v8.14.0 / schema enum 4종 + validator 7번째 export + 2 PoC test-spec 본격 표기).
- **Status:** ★ ★ **closed v8.14.0** (DEC-2026-05-23-fsim-005-corroboration-2-genuine §3 / fail_mode enum 본격 추가 + Adzic SBE 함정 직접 회피 boolean 강제).

### F-SIM-016: static-runner Semgrep wrapper deprecated / Windows MSYS2 환경 fire ❌

- **Phase:** chain harness e2e (v8.4.0 시뮬레이션 dogfood / poc-14)
- **Confidence:** verified (poc-14 시뮬레이션 환경 fire 본격 absent)
- **Type:** environment-dependent (R19 Tier 2 / Windows MSYS2 환경 의존)
- **Description:** `tools/static-runner/` 의 Semgrep wrapper (R19 Tier 2 = 사용자 환경 SARIF import) 가 Windows MSYS2 환경 안 본격 fire ❌. v8.4.0 시뮬레이션 환경 (Windows + MSYS2) 안 semgrep 자체 absent → static-runner skill non-fire / cross-cutting aspect (analysis-aspect-static-security) cover ❌.
- **Evidence:** v8.4.0 시뮬레이션 `.aimd/simulation/non-use-rationale.md` 안 static-runner = "환경 부재" 분류. preflight-check.js `semgrep absent` 본격 표면.
- **Spec gap:** R19 Tier 2 (사용자 환경 SARIF import) paradigm 안 Windows MSYS2 환경 본격 cover 미명시. `memory environment-dependent-tools-scope-out` 정합 = 환경 의존 도구 (Stryker / textlint / PIT / osv-scanner) 영구 scope-out 후보 / Semgrep 도 동일 후보.
- **Decision made:** v8.4.0 표면화 / 본격 처분 carry → 본 ledger 정식 등재 v8.14.0 후속 점검 (2026-05-23).
- **Severity:** low — 환경 의존 / R19 Tier 2 paradigm 정합 / pipx 또는 Docker 우회 가능.
- **Proposed fix:** (a) Semgrep deprecated wrapper 영구 scope-out 결단 (memory environment-dependent-tools-scope-out 정합 / R19 Tier 3 영구 reject 격상) 또는 (b) Tier 1 (in-plugin) ESLint-based AST scan 대체 후보 (v8.13.0 xmllint → fast-xml-parser Tier 1 격상 paradigm 동형) — cooling-off 후 별 결단.
- **Resolved fix (v8.14.3)**: (a)+(b) 변형 = **R19 Tier 2 안 environment-dependent risk sub-axis 본격 명시** (Tier 3 격상 ❌ / simulated paradigm 정합 ❌). charter R19 patch 본격 시행 + memory `feedback_environment_dependent_tools_scope_out.md` 본격 신설. DEC-2026-05-23-fsim-016-environment-dependent-scope-out §1.
- **Status:** ★ ★ **closed v8.14.3** (R19 Tier 2 sub-axis 본격 명시 / paradigm 정합 carry 정직 표기 / Tier 3 격상 ❌ / simulated 와 본질 구분 본격 명시).

---

## Body Finding Ledger — F-SKILL namespace (47 SKILL.md L3 품질 감사)

> 출처: 2026-05-18 L3 skill audit (사용자 "나의 스킬들을 분석해 보고 싶다" → 축 "품질 감사 (citations / drift / SSOT)" → 깊이 "L3 + 산업 비교"). 6 sub-agent 병렬 dispatch (B-shard 1~4 / `_base-official-docs-checker` F-015 / `_base-industry-case-researcher` N=3) + `_base-senior-engineer` D7 synthesis. 산출: `.claude/plans/audit-skill-l3-report.md` (사용자 검토 entry-point).
> 범위: `ai-native-methodology/skills/` 47 SKILL.md × 7 axis (B-1 description↔body / B-2 trigger keyword 품질 / B-3 단일 책임 / B-4 imperative voice / B-5 progressive disclosure / B-6 family consistency / B-7 citation semantic accuracy) = 329 cell 검증 + 산업 비교 (Anthropic 공식 docs F-015 + N=3 OSS).
> overall: 31 sub-agent CAND → **24 unified F-SKILL** (3 demoted NOT-A-FINDING) + 1 Senior gap-find (F-SKILL-024 meta). severity 분포 (recalibrated): medium 4 / low 11 / info 9. 8 finding ≥ 2 독립 shard corroboration ✓ / 8 within-shard multi-site / 7 single-source spec-authority. Senior verdict: **GO @ 0.86**.
> F-021 band = **24 ≥ 20 = unhealthy** (단 9 info/cosmetic 격하 후 actionable=15 = upper-caution band / Phase reset ❌ / plugin-authoring-spec S1~S8 maturity signal → v9.0 charter review carry).
> ★ ★ ★ **공통 뿌리 2개**: ① skill-citation-validator coverage gap (anchor §X.Y 의미 drift / `_base-` prefix bare-name mask / slash↔dash form 모호) — 3 finding (F-SKILL-001+004+005) 공통 root + validator 자기 motivation 의 class 가 자기 표면에서 재발 (recursive drift) / ② `_base-*` documented-exception 이 drift attractor (3 finding F-SKILL-004+005+015 의 root cause = §8-2 frozen allowlist convention).
>
> **시행 cadence**:
> - **v8.4.1 (본 cycle)** = P0 3 finding 즉시 fix (F-SKILL-002 + F-SKILL-004 + F-SKILL-005) + F-SKILL namespace 등재 + scope 확장 (analysis-quality-antipattern + analysis-aspect-a11y AP-FE-* 정규화).
> - **v8.5.0 (P1 carry)** = MINOR (F-SKILL-001 + 003 + 007 + 010 + 013 + 016 + 017 + 018 + 020) — digest recompute + methodology body change.
> - **P2 12 finding (별도 cooling-off 24h)** = 각 별건 plan.
>
> | F-SKILL | severity | corroboration | priority | 처분 |
> |---|---|---|---|---|
> | 001 | medium | within-shard 2-site | P1 | ★ **closed v8.5.0** — analysis-domain-model:41 + analysis-business-rules:52 business-logic.md anchor 정정 Option A (§5 4영역 병렬 + 실 매핑 명시) |
> | 002 | medium | ≥ 2 shard ✓ | **P0** | **closed v8.4.1** — `_base-log-finding` ghost AP prefix → `id-conventions.md` §3 canonical 9 + scope 확장 (analysis-quality-antipattern + analysis-aspect-a11y AP-FE-* 정규화) |
> | 003 | low | within-shard 4-site | P1 | ★ **closed v8.5.0** — 4 analysis-* (architecture+domain-model+source-inventory+business-rules) descriptions Korean trigger keywords 추가 |
> | 004 | medium | spec-authority (validator mask) | **P0** | **closed v8.4.1** — `analysis-input-collection` `apply-baseline-ratchet` → `_base-apply-baseline-ratchet` (2 sites) |
> | 005 | medium | ≥ 2 shard ✓ | **P0** | **closed v8.4.1** — `_base/<name>` slash → `_base-<name>` dash (9 sites / 7 files) |
> | 006 | low | within-shard 2-site | P2 | open (`_base-*` family heading EN/KO drift / cooling-off) |
> | 007 | low | ≥ 2 shard ✓ | P1 | ★ **closed v8.5.0** — `_base-apply-template:20` "19 templates" → "21 templates" + drift recurrence carry note (LL-v85-01 / templates/analysis/ enumerated count = drift attractor / P2 sub-rule 후보) |
> | 008 | low | single-shard | P2 | open (`rules.template.md` → `business-rules.template.md` / v7.0.0 followup / minor breaking) |
> | 009 | info | ≥ 2 shard ✓ | P2 | open (★-decoration density `analysis-br-cross-consistency-check` + chain skills) |
> | 010 | low | ≥ 2 shard ✓ | P1 | ★ **closed v8.5.0** — analysis-quality-antipattern + 4 sub-skills (planning-decompose + planning-identify + spec-derive-AC + spec-integrate) NL trigger phrase 추가 |
> | 011 | info | ≥ 2 shard ✓ | P2 | open (composite-orchestrator borderline — 4 chain-entry skills / ADR cite callout 보강) |
> | 012 | low | within-shard 3-site | P2 | open (body-size narrative density `sql-inventory` 210 / `characterization-test` 196 / `error-mapping` 120) |
> | 013 | low | single-shard | P1 | ★ **closed v8.5.0** — `analysis-db-schema-erd` 사전조건 inventory.json 추가 |
> | 014 | low | single-shard | P2 | open (`analysis-type-spec-fe` `-fe` suffix vs BE+FE scope) |
> | 015 | info | single-shard | P2 | open (sub-skill citation form 일관성) |
> | 016 | low | spec-authority | P1 | ★ ★ **ABORT v8.5.0 → P2 carry** — F-015 cross-check (research-v85-p1-batch.md §1) = `disable-model-invocation: true` Claude 모든 invoke 경로 차단 ("Claude can invoke: No") → chain harness body 호출 차단 가능성 높음. 안전한 대안 `user-invocable: false` REVISE-2 carry (plugin runtime smoke test 의무) |
> | 017 | low | spec-authority | P1 | ★ **closed v8.5.0** — plugin-authoring-spec §2 S2 per-field description ≤ 1,024 char cap 추가 + §6 digest 반영 |
> | 018 | low | spec-authority | P1 | ★ **closed v8.5.0** — §6 skills + plugins pinned_guidance_digest 갱신 (DELTA-1 `${CLAUDE_EFFORT}` + DELTA-3 1024c + DELTA-4 third-person + DELTA-5 one-level + DELTA-2 root-level SKILL.md) + digest_sha 재계산 (skills `b8b2376312b0`→`e2b44d9d0e53` plugins `b0e11058b05e`→`4498207cc547`) |
> | 019 | info | spec-authority | P2 | open (v2.1.142 root-level SKILL.md 패키징 relaxation 명시) — ★ partial: §6 plugins digest 안 DELTA-2 흡수 = v8.5.0 시점 anchor sync / 본 finding 핵심 (P1 rule 본문 wording) carry |
> | 020 | low | ≥ 2 shard ✓ | P1 | ★ **partial-closed v8.5.0** — A (S2 third-person POV sub-rule 추가) closed / B (~25 skill descriptions audit) = P2 carry (별도 cooling-off / wording 변경 자연 breaking risk) |
> | 021 | low | industry N=3 | P2 | open (SKIP-in-description for env-restricted skills) |
> | 022 | low | industry N=3 | P2 | open (`model:` frontmatter for compute-intensity-differentiated skills) |
> | 023 | info | industry N=3 | P2 | open (per-skill eval framework — v9.x feature) |
> | 024 | info | meta (3 finding root) | P2 | open — ★ ★ **v9.0 charter review** — `_base-*` documented-exception drift-attractor 해소 (rename canonical OR validator-level normalization) |
>
> **★ v8.5.0 release 결과**: P1 9 finding 중 **8 closed + 1 ABORT (F-SKILL-016)**. closed = 001/003/007/010/013/017/018/020-A. F-SKILL-019 partial (digest anchor sync / 본 finding 핵심 wording carry). F-SKILL-020-B = audit 25 skills wording P2 carry.
>
> 본 ledger 등재 시점 = P0 3 finding 시행 후 v8.4.1 release. P1/P2 = open carry.

### F-SKILL-001: skill-citation-validator coverage gap — anchor §X.Y 의미 drift (L2 semantic mismatch)

- **Phase:** L3 skill audit (B-shard-1 within-shard 2-site)
- **Confidence:** verified (Senior live cross-check)
- **Type:** gap (validator scope)
- **Description:** `analysis-domain-model/SKILL.md` 가 "business-logic.md §5.B domain" 인용 but §5.B 실제 = "FE 코드 영역". `analysis-business-rules/SKILL.md` 가 "§5.A rules" 인용 but §5.A 실제 = "DB 영역". L1 dead-link (skill-citation-validator v8.1.0 가 잡는 class) ❌ / L2 anchor 의미 drift = ★ ★ ★ validator 자기 motivation 의 class 가 본체 active 표면 안에서 재발 (recursive drift).
- **Evidence:** `methodology-spec/workflow/business-logic.md` §5.A `## 5.A: AP-DB-XXX` / §5.B `## 5.B: AP-FE-XXX`. `skills/analysis-domain-model/SKILL.md` 인용 ↔ skills/analysis-business-rules/SKILL.md 인용.
- **Spec gap:** skill-citation-validator 가 file 존재 + anchor 존재까지만 검증. anchor 의 의미 mapping (cite 가 "domain" claim 인데 anchor = "FE") 부재.
- **Decision made:** v8.5.0 P1 carry.
- **Severity:** **medium** — 2 production skills affected / validator 의 motivation class 자기 표면 재발 = recursive drift / v9.0 charter validator scope 확장 의제.
- **Proposed fix:** (a) anchor 의미 drift fix (2 skill cite anchor 정정 / additive) + (b) skill-citation-validator anchor-level semantic check 추가 (v9.0 검토). MINOR.
- **Status:** open (v8.5.0 P1)

### F-SKILL-002: `_base-log-finding` ghost AP prefix (taxonomy 0 actual use) — P0 closed v8.4.1

- **Phase:** L3 skill audit (B-shard-1 + Senior live grep)
- **Confidence:** verified
- **Type:** gap (citation semantic / id-conventions drift)
- **Description:** `_base-log-finding/SKILL.md:15` 가 AP-RENDER / AP-FETCH / AP-A11Y / AP-i18n / AP-STATE 인용 — 실 examples/ 안 occurrences = 0. `id-conventions.md` §3 canonical 카테고리 9종 (DB·ARCH·DOMAIN·API·FE·VALIDATION·CONFIG·SECURITY·PERFORMANCE) 정합 ❌. 실 PoC #04 사용 패턴 = `AP-FE-{SUB}-NNN` (44 occurrence). scope 확장 corroboration: `analysis-quality-antipattern` step 1 (5 ghost prefix) + `analysis-aspect-a11y` step 3 (1 ghost prefix) = 3 skill drift.
- **Evidence:** `grep -rn "AP-(RENDER|FETCH|A11Y|i18n|STATE)" examples/` = 0 / `grep -rn "AP-FE-[A-Z]" examples/poc-04-full-realworld-react/` = 44 occurrence.
- **Spec gap:** id-conventions.md §3 카테고리 9종 단일 SSOT 인데 3 skill 이 sub-namespace 를 top-level prefix 로 격상 사용.
- **Decision made:** v8.4.1 P0 즉시 fix.
- **Severity:** medium (recalibrated) — 3 skill 표면.
- **Proposed fix:** ghost prefix → canonical 9 + AP-FE-{SUB}-NNN 패턴 (실 PoC #04 정합). additive / breaking 0.
- **Status:** ★ ★ **resolved v8.4.1** — `_base-log-finding/SKILL.md:15` + `analysis-quality-antipattern/SKILL.md:18` + `analysis-aspect-a11y/SKILL.md:27` 모두 canonical 정합.

### F-SKILL-004: `analysis-input-collection` `_base-` prefix 누락 (`apply-baseline-ratchet` bare) — P0 closed v8.4.1

- **Phase:** L3 skill audit (B-shard-2)
- **Confidence:** verified
- **Type:** citation-drift (`_base-` documented-exception § 8-2 정합 누락)
- **Description:** `analysis-input-collection/SKILL.md` line 14 + 55 가 bare `apply-baseline-ratchet` 인용 (실 skill name = `_base-apply-baseline-ratchet` per v8.2.1 §8-2 documented-exception). skill-citation-validator v8.1.1 가 bare-name resolver 로 통과시킴 (sub-agent 가 표면화한 validator 사각).
- **Evidence:** `grep -n "apply-baseline-ratchet" skills/analysis-input-collection/SKILL.md` = lines 14, 55.
- **Spec gap:** skill-citation-validator 가 `_base-` prefix 부재 bare name 을 dead-link 으로 잡지 못함.
- **Decision made:** v8.4.1 P0 즉시 fix.
- **Severity:** medium — single-shard but validator-mask class.
- **Proposed fix:** 2 site replace_all bare → `_base-` prefix 정합.
- **Status:** ★ ★ **resolved v8.4.1**.

### F-SKILL-005: `_base/<name>` slash → `_base-<name>` dash citation 정규화 — P0 closed v8.4.1

- **Phase:** L3 skill audit (B-shard-4 + Senior live grep 5 file 확인)
- **Confidence:** verified
- **Type:** citation-form-inconsistency (slash vs dash ambiguity)
- **Description:** 7 file × 9 site 가 `_base/<name>` slash form 으로 다른 `_base-*` skill 인용 (normative = `_base-<name>` dash form / skill name 정합). chain-entry skills (planning-extract / spec-compose / test-generate / impl-generate / impl-verify) + 2 `_base-*` self-cite.
- **Evidence:** `grep -rn "_base/" skills/` = 9 sites / 7 files (Senior 가 5 chain skills 만 보고 / 실측 2 `_base-*` self-cite 추가 확인).
- **Spec gap:** plugin-authoring-spec S6 / skill-citation-validator 가 slash-vs-dash form 모호성 미강제.
- **Decision made:** v8.4.1 P0 즉시 fix.
- **Severity:** medium — 7 files / 9 sites / slash-vs-dash 의미적 모호.
- **Proposed fix:** `_base/<name>` → `_base-<name>` 정규화 (9 sites).
- **Status:** ★ ★ **resolved v8.4.1**.

### F-SKILL-024 (meta — Senior gap-find): `_base-*` documented-exception drift-attractor

- **Phase:** L3 skill audit (D-senior-conscience T4 blind-spot)
- **Confidence:** high (3 finding root cause analysis)
- **Type:** anti-pattern (charter-level convention drift attractor)
- **Description:** F-SKILL-004 + F-SKILL-005 + F-SKILL-015 의 공통 root cause = `_base-*` documented-exception (ADR-PLUGIN-001 §8-2 frozen allowlist v8.2.1). 매 release 마다 같은 drift class 재발 — exception 자체가 drift attractor. v9.0 charter-level 결단 필요: (a) canonical convention rename (`_base-` → 그 외 prefix / MAJOR / LL-i-55 cautious-cooling-off), OR (b) validator-level normalization (additive / breaking 0).
- **Evidence:** F-SKILL-004 + 005 + 015 모두 root cause = `_base-` prefix convention.
- **Spec gap:** charter §8-2 frozen allowlist 가 exception 으로 grandfather 했으나 향후 drift 재발 방지 mechanism 부재.
- **Decision made:** P2 carry / v9.0 charter review 의제 추가 후보.
- **Severity:** info — meta finding (no immediate functional defect).
- **Proposed fix:** v9.0 charter review — 위 (a) 또는 (b) 결단.
- **Status:** open (v9.0 charter review carry / 사용자 결단 의무).

### F-SKILL-003, 006~023 — 본 ledger 표 (위) 의 1-line summary 참조

- 상세 (per-finding spec gap + proposed fix + evidence) = `.claude/plans/audit-skill-l3-report.md` §3 canonical list + `.claude/plans/D-senior-conscience.md` T5 (full table).
- 본 ledger 위 표 = SSOT 인덱스. 시행 시 각 finding 별 본 ledger 에 정식 block 추가 (resolved/deferred 처분 시).

---

## Body Finding Ledger — F-CHA namespace (chain-harness structural deep-dive audit)

> 출처: 2026-05-25 session 45차 chain harness deep-dive 점검 (사용자 "현재 플로우를 점검해 보고 싶다 — 처음부터 끝까지 어떤 플로우인지 간단히 설명해줘" → "chain harness 가 뭔가. 이거 게이트가 1 4 밖에 없나?" → "다 깊게 봐봐" → ★ ★ ★ ★ ★ "plan 도 게이트 있어야 되는 거 아냐?"). 3 Explore sub-agent 병렬 dispatch (gate validator deep-dive / revisit edges deep-dive / plan stage placeholder deep-dive). plan 파일 SSOT = `.claude/plans/recursive-nibbling-mango.md`.
> 범위: v9.0 6-stage chain harness 구조 정합 점검 — gate 4종 wiring + revisit 8 edges + plan stage placeholder 자격. 코드 변경 ❌ / read-only / file:line citation 기반.
> overall: 6 finding 발견 / **3 finding 등재** (F-CHA-001/002/003) + 3 informational (등재 ❌). F-021 band 5~15 "건강한 검증" 잔존 (등재 후 ledger total 10→13).
> ★ ★ ★ ★ ★ **공통 paradigm signal**: 본 namespace 의 3 finding = 모두 **양심 의존 → 코드 enforcement 전환** 본 방법론 절대 우선순위와 부분 부정합. 단 ★ ★ ★ ★ ★ ★ 본 cycle 시행 ❌ — **self-referential corrective drift 회피** (memory `feedback_self_referential_corrective_drift.md` / session 43차 4 release 동형 재발 경계 / session 44차 carry "본격 prod 가치 진전" 의제 우선). δ Type 2 외부 사용자 dogfood 안 자연 close 채널 의무 명시.
>
> | F-CHA | severity | 처분 | 비고 |
> |---|---|---|---|
> | 001 | low~medium | **deferred** (Type 2 dogfood channel) | gate #4 Auto Mode 차단 = `gate-eval.js` 코드 부재 / `_base-invoke-go-stop-gate/SKILL.md:62-67` skill body Korean prose 만 인코딩 (양심 의존 잔존) |
> | 002 | low | **deferred** (Type 2 dogfood channel) | implement→analysis revisit "rare / 가장 큰 cycle" friction 코드 부재 / retry_cap=3 = ADR-CHAIN-003 §4 PoC-only / sp5-c5 carry |
> | ★ 003 | **★ ★ ★ ★ ★ paradigm-level** | **deferred** (Type 2 dogfood channel / 1순위 표면화 대상) | plan stage = stage 자격 미달 / methodology paradigm 위배 (gate `null` + `gate_deferred` / AI macro HOW 양심 결정 / traceability TASK·ADR·NFR·RISK layer 부재 / DEC-2026-05-21 진단 자기모순). ★ ★ ★ ★ ★ 사용자 직관 채널 발견 (2026-05-25) |
>
> ★ ★ ★ 모두 `Status: deferred` (★ self-referential corrective fix ❌ / δ Type 2 외부 사용자 channel close 의무 명시). ζ-1 (plan + gate #plan 동시 신설) / ζ-2 (plan retract) / ζ-3 (informal 표기) 모두 본 cycle 시행 ❌ — 자기 결단으로 paradigm fix = `feedback_self_referential_corrective_drift.md` 위배.
>
> ★ ★ **본 deferred 자체 = paradigm 정합 입증** — session 43차 4 release (v9.0.3/4/5/6) 동형 self-referential corrective cycle 회피. 본 plugin 의 self-bootstrap proof 진정성.

### F-CHA-001: gate #4 Auto Mode 차단 = `gate-eval.js` 코드 부재 / skill body 만 인코딩

- **Phase:** chain harness structural deep-dive (session 45차 / Explore agent #1)
- **Confidence:** verified (gate-eval.js 직접 read + skill SKILL.md 직접 read + ADR-CHAIN-002 직접 read)
- **Type:** anti-pattern (양심 의존 잔존 / ADR ↔ code drift)
- **Description:** ADR-CHAIN-002 §2 (line 52) = "gate #4 (impl → done) = Auto Mode 위임 ❌ — 사용자 명시 결단 의무 (★ 70~80% 한계 + 재검토 정합)". 하지만 `tools/chain-driver/src/gate-eval.js:17-127` 안 stage-specific Auto Mode 차단 코드 **부재**. enforcement 위치 = `skills/_base-invoke-go-stop-gate/SKILL.md:62-67` skill body Korean prose 만:
  ```
  "단 ★★★ critical 임계 위반 (red_count > 0 / fail_count > 0) 은
   **Auto Mode 도 차단**"
  ```
  → gate #4 `fail_count=0` hard requirement (gate-eval.js:86-92) 자체는 GREEN 강제이긴 함. 하지만 `fail_count=0` 인 상태에서 사용자가 "go" 결단 자동 위임을 **코드가 직접 차단하지 않음** — SKILL.md body 가 LLM 에 prompt 로 들어와야 작동 (양심 의존).
- **Evidence:**
  - `docs/adr/ADR-CHAIN-002-go-stop-gate.md:52` (정책 명시)
  - `tools/chain-driver/src/gate-eval.js:17-127` (stage-specific Auto Mode 차단 부재)
  - `skills/_base-invoke-go-stop-gate/SKILL.md:62-67` (skill body 만 인코딩)
- **Spec gap:** ADR-CHAIN-002 §2 정책의 코드 enforcement 부재. `mechanical trio` (state.blocked + CLI exit 2 + PreToolUse deny) 외 ★ skill-level prose 가 enforcement 채널인 단일 case.
- **Decision made:** N/A (구조적 누락 / ADR 시행 시 skill-level 채널로 우회 채택 / sub-plan-5 종결 시점 carry).
- **Severity:** **low~medium** — `fail_count=0` 강제로 실질 GREEN 입증 후에만 도달 = 위험 제한적. 단 ★ 양심 의존 → 코드 enforcement 본 방법론 절대 우선순위와 부분 부정합 / drift 잔존 신호.
- **Proposed fix:** (a) `gate-eval.js` 에 stage='implement' AND `userDecision==='go'` AND `autoMode===true` 시 reject 추가 (additive / breaking 0). (b) ADR-CHAIN-002 §2 갱신 — code enforcement 명시. PATCH. ★ ★ ★ 단 ★ 본 cycle 시행 ❌ — δ Type 2 외부 사용자 dogfood 안 자연 표면화 채널 의무.
- **Status:** **deferred** (Type 2 dogfood channel / 차기 session δ 의제 의존 / self-referential corrective drift 회피 paradigm 정합)

### F-CHA-002: implement→analysis revisit "rare / 가장 큰 cycle" friction 코드 부재 / retry_cap=3 PoC-only carry

- **Phase:** chain harness structural deep-dive (session 45차 / Explore agent #2)
- **Confidence:** verified (revisit-detect.js 직접 read + ADR-CHAIN-003 직접 read + sdlc-4stage-flow.json 직접 read)
- **Type:** gap (friction policy ↔ code drift)
- **Description:** `flows/sdlc-4stage-flow.json:110` 가 implement→analysis 를 "rare / 가장 큰 cycle" 표기 — paradigm 의도 = 가장 큰 cycle 에 추가 friction. 하지만 `tools/chain-driver/src/revisit-detect.js:100-107` = 모든 upstream stage 동등 처리 (LOC 만 비교) — analysis 라고 추가 friction 없음. ADR-CHAIN-003 §4 의 `retry_cap=3` 정책 = ★ ★ PoC-only / sp5-c5 carry / 코드 enforcement ❌. 현 friction = 간접 (LOC threshold 5 라인 / 사용자 명시 결단 의무 / critical/high finding 시 gate revalidation) 만.
- **Evidence:**
  - `flows/sdlc-4stage-flow.json:110` (rare / 가장 큰 cycle 표기)
  - `tools/chain-driver/src/revisit-detect.js:100-107` (upstream stage 동등 처리)
  - `docs/adr/ADR-CHAIN-003-revisit-loop.md` §4 (retry_cap=3 정책 / PoC-only)
- **Spec gap:** ADR-CHAIN-003 §4 의 retry_cap 정책 code enforcement 부재. cycle 거리 (1-hop vs 4-hop) 별 friction 차등 부재.
- **Decision made:** sub-plan-5 (chain harness 5 요소 완성) 종결 시점 carry / PoC ROI 우선 / 코드 enforcement 후순위.
- **Severity:** **low** — 직접 코드 enforcement 부재이지만 process 친화적 / 자동 implement→analysis 발생 가능성 낮음 (실 PoC 14종 0건).
- **Proposed fix:** (a) `revisit-detect.js` 에 cycle 거리 별 confidence threshold 차등 (1-hop 5 LOC / 4-hop 50 LOC). (b) `chain-driver state.attempts` 카운터 + retry_cap=3 enforcement / chain abort 트리거 추가. state.schema.json 갱신 / breaking 가능. ★ ★ ★ 단 ★ 본 cycle 시행 ❌ — δ Type 2 외부 사용자 dogfood 안 자연 표면화 채널 의무.
- **Status:** **deferred** (Type 2 dogfood channel / 차기 session δ 의제 의존 / sp5-c5 carry 본격 청산은 외부 사용자 channel)

### F-CHA-003: ★ ★ ★ ★ ★ plan stage = stage 자격 미달 / methodology paradigm 위배 (paradigm-level)

- **Phase:** chain harness structural deep-dive (session 45차 / Explore agent #3 + ★ ★ ★ ★ ★ 사용자 직관 채널)
- **Confidence:** verified (plan-agent.md + plan.phase-flow.json + 3 plan-* SKILL.md + lifecycle-contract.md + DEC-2026-05-21 직접 read / Glob `examples/poc-*/plan-spec.json` 0건 실측)
- **Type:** anti-pattern (★ ★ ★ ★ ★ paradigm-level / methodology 정합 위배)
- **Description:** ★ ★ ★ ★ ★ 본 namespace 의 ★ ★ ★ 진짜 본격 finding. 2026-05-25 session 45차 사용자 직관 발화 "plan 도 게이트 있어야 되는 거 아냐?" 가 ★ ★ ★ ★ paradigm-level finding 채널로 발현. 사실:
  - stage 의 본질 = "AI 자동 ≥ 85% + 사람 검토 (gate) ≤ 15%" (`sdlc-4stage-flow.json` `user_review_pct`)
  - stage 자격 = gate 보유 (analysis 자연 예외 — 입력 stage / discovery·spec·test·implement 모두 gate)
  - plan 현 상태 = gate `null` + `gate_deferred` → ★ ★ stage 자격 미달 / chain 4 stage methodology 위장
  - 운영 시 ★ 완전 skip — `agents/plan-agent.md:5` `skills:[]` 빈 배열 (dispatch ❌) / 3 plan-* SKILL.md PLACEHOLDER / 모든 PoC 14종에 `plan-spec.json` 부재
  
  paradigm-level 위배 **3건**:
  1. methodology 검토 채널 부재 → AI 가 macro HOW (task decompose / ADR / NFR / risk) 양심 결정 / 사용자 검토 ❌
  2. traceability UC → BHV → AC → ★ ★ ★ (TASK / ADR / NFR / RISK 모두 검토 부재) → TC → IMPL forward link 깨짐
  3. DEC-2026-05-21 본 진단 ("macro HOW implicit in LLM" 문제) → plan stage 신설 → ★ ★ ★ ★ gate 없으면 implicit 그대로 / **문제 해결 ❌ / 자기모순**
- **Evidence:**
  - `agents/plan-agent.md:5` (`skills: []` 빈 배열)
  - `flows/plan.phase-flow.json:4` (`"placeholder": true`) + `:45` (gate_deferred)
  - `skills/plan-{decompose-and-sequence,architect-decisions,risk-and-nfr}/SKILL.md` (모두 description 첫 문구 = "PLACEHOLDER 2026-05-21 (v4.1 paradigm 가시화만)")
  - `methodology-spec/lifecycle-contract.md:153-171` ("plan-agent = PLACEHOLDER (`skills: []` / dispatch 무의미)")
  - `decisions/DEC-2026-05-21-chain-discovery-plan-stage-도입.md` (진단 + 신설 결정 + 진단 자기모순 본질)
  - Glob `ai-native-methodology/examples/poc-*/plan-spec.json` = 0건 (실 PoC 14종 plan stage 산출물 부재)
- **Spec gap:** v9.0 chain harness 가 6-stage 라 외부 표기하지만 실질 4-stage harness + 1 input stage + 1 ★ ★ ★ ghost stage (plan). stage 자격 미달. 본 plugin 의 "AI 자동 ≥ 85% + 사람 검토 ≤ 15%" 정합 양보.
- **Decision made:** v9.0.0 MAJOR (2026-05-23) 시점 plan-agent body + gate #plan 모두 deferred 채택 — DEC-2026-05-23-discovery-stage-v9. 본 finding 발견 시점 = 2026-05-25 (2일 후 사용자 직관 채널 발현).
- **Severity:** **★ ★ ★ ★ ★ paradigm-level** — methodology 정합 위배 / 단일 finding 이 아닌 paradigm decision 재점검 의제.
- **Proposed fix:** ★ ★ ★ 3 옵션 모두 본 cycle 시행 ❌:
  - **ζ-1**: plan stage 본격 구현 + gate #plan 동시 (plan-agent body + 3 skill 본격 + gate-eval.js stage='plan' 분기 + plan-coverage-validator + adr-link-validator + nfr-allocation-validator carry + sdlc-4stage-flow.json gates[] = 4 → 5 + traceability TASK·ADR·NFR·RISK layer 신설). ★ ★ paradigm 정합 / 가장 정직한 답.
  - **ζ-2**: plan stage 폐기 (v9.0 paradigm retract / DEC-2026-05-21 진단 재검증 / spec → test 직접 회귀 / macro HOW = spec 흡수 vs test 흡수 결단 / v9.x MAJOR breaking).
  - **ζ-3**: plan stage = gate 없는 informal stage 로 정합 표기 (외부 표기 변경 / paradigm 정합 양보 / 5-stage harness + informal plan helper).
  ★ ★ ★ ★ ★ ★ 본 cycle 시행 ❌ — δ Type 2 외부 사용자 dogfood 안 ★ 1순위 자연 표면화 대상. 자기 결단으로 paradigm fix = `feedback_self_referential_corrective_drift.md` 위배.
- **Status:** **deferred** (Type 2 dogfood channel / 차기 session δ 의제 의존 / ★ ★ ★ ★ ★ 1순위 표면화 대상 / paradigm-level finding 자격 외부 사용자 channel 의무)
