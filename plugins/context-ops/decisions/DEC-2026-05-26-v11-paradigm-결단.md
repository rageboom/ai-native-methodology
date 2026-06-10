# DEC-2026-05-26-v11-paradigm-결단

> ⚠️ **부분 정정 (2026-06-10)**: 본 문서 §결단 #7 의 "Task = Story sibling (**BE only** 운영/인프라/마이그레이션 / OP-*)" 프레이밍은 **과소 스코핑 오류**로 정정됨. OP-* 를 가르는 축 = **사용자 가시 가치 변화 부재 (layer 무관)**, BE/FE 레이어 아님. inline "BE only" 표기는 역사 기록으로 보존 / 정식 정의 = [DEC-2026-06-10-op-task-layer-agnostic](DEC-2026-06-10-op-task-layer-agnostic.md).

>      **v11.0.0 MAJOR paradigm SSOT** — 본 세션 (2026-05-26) 사용자 8 결단 SSOT. 4 동반 결단 file 의 진입점. Phase 0 = 본 결단 문서화만 / 본격 시행 = 차기 세션 cascade.

**일자**: 2026-05-26 (session 48차)
**카테고리**: paradigm / v11.0.0 MAJOR 본격 진입 — chain harness 산출물 polymorphism + ticket paradigm retract + Epic 재정의 + contract 강제 양 axis
**상태**: 승인 — 사용자 결단 (8종 / 본 세션 안 본격 acknowledge)
**Trigger**: 사용자 "template body carry 5종 처리하자" → 단순 carry 의제 → 본격 paradigm drift 8종 표면화 → v11.0.0 MAJOR 결단

## 1. 본 결단의 본격 발견 paradigm

원래 carry **"5 template body 채움"** = 단순 asset 완료 작업으로 시작. plan + research + 사용자 깊은 결단 안:

- **stage 이름과 산출물 이름 비대칭** = chain harness 본격 evolution gap
- **BE/FE 분리 부재 + Story cross-cut paradigm** = lifecycle-contract 깊이 결함
- **ticket paradigm R20 paradigm 재해석** = "ticket = 작업 항목 = plan 한 곳"
- **Epic = 화면 단위** = discovery ≠ Epic / 본 방법론 본격 재정의
- **Jira hierarchy Task level 누락** = 본 방법론 본격 entity matrix 갭
- **BE swagger / FE state-map+DTCG contract 강제** = quality 1순위 paradigm 정합

→ **단순 carry → v11.0.0 MAJOR paradigm 의제**. 본격 발견의 quality 정합 (memory `feedback_self_referential_corrective_drift.md` 회피 paradigm — 본 진화는 self-referential corrective ❌ / 사용자 직관 trigger paradigm-defining moment).

## 2. 8 결단 SSOT

| #   | 결단                                                                                 | 출처 (사용자 발화)                           | 영향                                                                  | 동반 결단 file                                                                  |
| --- | ------------------------------------------------------------------------------------ | -------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| 1   | `planning-spec.{json,md}` → `discovery-spec.{json,md}` rename                        | "이름이 이런데 이게 맞나?"                   | breaking — schema $ref / cross_links / 5 PoC artifact                 | [DEC-2026-05-26-discovery-spec-rename](DEC-2026-05-26-discovery-spec-rename.md) |
| 2   | BE/FE 산출물 분리 paradigm (stage 별 적용 axis 다름)                                 | "서로 바라보는게 다르다"                     | schema / skill body / template body / **Story cross-cut anchor 정합** | [DEC-2026-05-26-be-fe-산출물-분리](DEC-2026-05-26-be-fe-산출물-분리.md)         |
| 3   | ticket 생성 = plan stage 한 곳 (R20 stage-별 paradigm retract)                       | "plan 에서 다 처리되는게 안 맞나?"           | ticket-sync skill 본격 재설계 / R20 v8.6.x phase enum 폐기            | [DEC-2026-05-26-ticket-plan-단일](DEC-2026-05-26-ticket-plan-단일.md)           |
| 4   | User Story 추가 부재 (UC 유지 / schema 확장 ❌ / 별도 산출물 ❌)                     | "기존 UC 보다 뭐가 나은가" 답 내포           | 변경 ❌ — 본격 retract paradigm                                       | (별도 file ❌ / 본 SSOT 안 내장)                                                |
| 5   | Epic = FE 화면 단위 (UI screen / route)                                              | "discovery 는 일의 시작점 / Epic 은 화면"    | ticket hierarchy 재매핑 / discovery ≠ Epic 본격                       | [DEC-2026-05-26-ticket-plan-단일](DEC-2026-05-26-ticket-plan-단일.md)           |
| 6   | Story = cross-cut anchor (BE/FE/DB/E2E 가로지름)                                     | "Story 안 BE 도 가능"                        | discovery/spec stage cross-cut 단일 산출물 paradigm 정합              | [DEC-2026-05-26-be-fe-산출물-분리](DEC-2026-05-26-be-fe-산출물-분리.md)         |
| 7   | Jira Task level (Story sibling / BE only 운영) entity 매핑                           | "Story 하위 Task-Sub-task"                   | 본 방법론 schema 신설 + 명명 정정 (TASK-_ = Sub-task / OP-_ = Task)   | [DEC-2026-05-26-ticket-plan-단일](DEC-2026-05-26-ticket-plan-단일.md)           |
| 8   | contract 강제 양 axis (BE = swagger / FE = state-map + visual-manifest + DTCG token) | "backend test 에 swagger 를 강제할 수 있나?" | schema 필수 필드 + test framework enum 본격 + validator matching      | [DEC-2026-05-26-contract-강제-양-axis](DEC-2026-05-26-contract-강제-양-axis.md) |

## 3. paradigm 정합 그림

### chain harness × ticket hierarchy 재매핑

```
analysis stage         → (산출물만 / ticket ❌)
discovery stage        → discovery-spec.{json,md} (UC = 사용자 의도 / cross-cut)
spec stage             → behavior-spec.{json,md} + acceptance-criteria.{json,md} (BHV/AC = cross-cut anchor)
plan stage             →  ticket 본격 생성 시점:
                           Epic = FE 화면 단위
                           Story = 사용자 시나리오 (BHV/AC 묶음 / BE+FE cross-cut)
                           Task = Story sibling (BE only 운영/인프라/마이그레이션 / OP-*)
                           Sub-task = TASK-* (1~3 AC 묶음 / layer 분기)
test stage             → test-spec.* (framework 별 분리 본격)
implement stage        → impl-spec.* (stack 별 분리 본격)
```

### 산출물 분리 paradigm (stage 별 다름)

| Stage         | 산출물 분리 axis                                        | 근거                                                     |
| ------------- | ------------------------------------------------------- | -------------------------------------------------------- |
| analysis      | 본격 분리 (BE 7대 + FE 8 / 이미)                        | 기술 자산 (technology-anchored)                          |
| **discovery** | **cross-cut 단일**                                      | UC = 사용자 의도 anchor                                  |
| **spec**      | **cross-cut 단일**                                      | BHV/AC = 사용자 시나리오 anchor (Gherkin 자연 cross-cut) |
| plan          | layer 분기 본격 (TASK-\* + layer 필드 또는 산출물 분리) | TASK = 개발 작업 단위 (BE/FE 본격 다름)                  |
| test          | framework 별 분리 본격                                  | framework diversity                                      |
| implement     | stack 별 분리 본격                                      | stack diversity                                          |

### contract 강제 양 axis ( #8)

```
BE 트랙:
  analysis        → openapi.yaml (산출물 5-a / 이미)
  discovery       → discovery-spec (UC + swagger 어댑터)
  spec            → behavior-spec.be + AC.be ( openapi_path + operationId ref 의무)
  plan            → task-plan.be ( TASK ↔ endpoint 1:1)
  test            → test-spec.be ( schemathesis / dredd / pact 본격 실행 의무)
  implement       → impl-spec.be (springdoc-openapi 등 drift 차단)

FE 트랙 (대칭):
  analysis        → state-map / visual-manifest / form-validation
  discovery       → discovery-spec (figma 어댑터)
  spec            → behavior-spec.fe + AC.fe ( state-map + DTCG token + visual-manifest ref 의무)
  plan            → task-plan.fe ( TASK ↔ component 1:1)
  test            → test-spec.fe ( vitest + playwright + axe-core 본격 실행)
  implement       → impl-spec.fe (drift 차단)
```

## 4. 미결단 항목 (default + alternative 명시 / 차기 세션 확정)

| 항목                         | default (본 SSOT 채택)                                                              | alternative                                              |
| ---------------------------- | ----------------------------------------------------------------------------------- | -------------------------------------------------------- |
| a. TASK 명명 정정            | TASK-\* 유지 + Jira 매핑 시 "Sub-task" 명시화 + 별도 **OP-\*** (Story sibling) 신설 | TASK → SUBTASK rename + 별도 TASK-\* 신설 / 3-level 분리 |
| b. BE only Epic 매핑         | Epic = 화면 only / BE only = Jira "Task" (Epic 부재) 매핑 / OP-\* 본격 entity       | BE 도메인 Epic 신설 / 기술 작업 Epic 신설                |
| c. plan TASK layer 분기 방식 | **논리 분리** (task-plan 1개 + tasks[].layer 필드)                                  | 물리 분리 (task-plan.be + task-plan.fe)                  |
| d. e2e 산출물 위치           | test-spec.playwright 안 (test stage / framework 분리)                               | spec/behavior-spec.e2e 별도                              |
| e. 결단 시행 시점            | **본 세션 = paradigm 문서화만 / 차기 세션 = 본격 시행** (LL-v930-02 cap 정합)       | 본 세션 즉시 v11 시행 (LL-v930-02 위반 risk)             |

→ default 채택 시 breaking 면적 최소화 + paradigm 정합 양립. 차기 세션 시행 시 사용자 추가 검토 가능.

## 5. 시행 cascade (Phase 0~5)

| Phase       | 시점                 | 범위                                                                                                                                |
| ----------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Phase 0** | 본 세션 (2026-05-26) | paradigm 결단 문서화 (4 동반 결단 file + INDEX.md + plugin-charter + skills-axis + lifecycle-contract + id-conventions + CLAUDE.md) |
| Phase 1     | 차기 세션            | schema 본격 진화 (discovery-spec rename + operational-task 신설 + acceptance-criteria/task-plan/test-spec 필드 확장)                |
| Phase 2     | 차기 세션            | skill / agent body 갱신 (discovery-_ / spec-_ / plan-_ / test-_ / implement-\* / ticket-sync 재설계)                                |
| Phase 3     | 차기 세션            | template body 본격 채움 (12 신규 파일 / discovery + spec dir + plan/test/implement 신규)                                            |
| Phase 4     | 차기 세션            | 5 PoC sweep + cross_links 정합                                                                                                      |
| Phase 5     | 차기 세션            | v11.0.0 MAJOR release                                                                                                               |

## 6. STOP-3 (본 세션 Phase 0 만)

- workspace test 영향 ❌ (paradigm 문서화 only / schema/skill/template/tools 변경 ❌)
- skill-citation-validator 0 stale 유지 의무
- release-readiness 20/20 유지 (criterion 신설 ❌)
- version 3-way 10.1.1 유지 (Phase 0 = 결단 문서화만 / release 없음)
- breaking 0 (Phase 0 만)
- Phase 1+ 시점 = MAJOR breaking 본격 발생 / 별 STOP-3 본격 수립

## 7. Lessons Learned (자산화 후보 / 차기 세션 확정)

- **LL-v110-01**: paradigm-drift discovery via carry processing — 단순 carry ("5 template body 채움") 처리 의제가 본격 paradigm drift 8종 표면화. carry 명세 자체에 paradigm 정합 점검 의무. Adzic Specification by Example 의 "what is not yet known" sub-axis 본격 정합.

- **LL-v110-02**: stage 이름 vs 산출물 이름 비대칭 = drift attractor — DEC-2026-05-21 §3 backward-compat 의도가 v9.0.0 stage rename 안에서 drift 로 전환. backward-compat 결단 = 시한 명시 + ratchet 의무 sub-rule (release-readiness criterion 후보).

- **LL-v110-03**: 사용자 직관 = paradigm-defining moment — "discovery 는 에픽이 아니다" / "Epic 은 화면" / "Story 안 BE 가능" / "왜 Task 가 없나" / "swagger 를 강제할 수 있나" = 본 방법론 본격 진화 trigger. 사용자 직관 응답 시 명명 정합 본격 점검 의무.

- **LL-v110-04**: contract 강제 양 axis paradigm = quality 1순위 본격 정합 — BE swagger + FE state-map/DTCG token 강제 = AI 자동 생성 안 ground truth anchor → AI 환각 차단 본격 작동. no-simulation 정책 (R15) + R19 Tier 1/2/3 + R18 plugin-authoring-spec 정합. industry case (Stripe / Twilio API-first / Pact / Schemathesis) corroboration.

## 8. cross-link

- 동반 결단 4종: discovery-spec-rename, be-fe-산출물-분리, ticket-plan-단일, contract-강제-양-axis
- carry trigger: DEC-2026-05-21-chain-discovery-plan-stage-도입 §3 backward-compat (planning-spec name keep) → 본 결단 안 본격 retract
- R20 (charter §1) = v8.6.x phase enum 폐기 / **R20-prime (신설)** = ticket = plan stage 단일 paradigm
- R14 (BE/FE split) = 본 결단 #2 안 본격 evolved (axis 분리 → stage 별 paradigm 다름)
- R8 (analysis-input 5종) = 영향 ❌
- chain harness paradigm = v10.0.0 (chain N = gate #N 1:1) → v11.0.0 (Epic/Story/OP/SUBTASK 4-level matrix 추가 / paradigm 본격 확장)
