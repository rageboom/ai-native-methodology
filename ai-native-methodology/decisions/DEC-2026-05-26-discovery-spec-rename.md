# DEC-2026-05-26-discovery-spec-rename

> ★ v11.0.0 #1 결단 — `planning-spec.{json,md}` → `discovery-spec.{json,md}` rename. SSOT: [DEC-2026-05-26-v11-paradigm-결단](DEC-2026-05-26-v11-paradigm-결단.md).

**일자**: 2026-05-26 (session 48차)
**카테고리**: paradigm / naming coherence — stage 이름 vs 산출물 이름 비대칭 drift 해소
**상태**: 승인 — 사용자 결단 "이름이 이런데 이게 맞나?" (#1)
**Trigger**: 사용자 직관 = "discovery stage 의 산출물이 planning-spec 인 것이 맞나?"

## 1. 현재 상태 (drift 본격 표면화)

| 자산 | 명명 | stage 명명 정합 |
|---|---|---|
| skills/ | `discovery-*` 6종 | discovery ✅ |
| agents/ | `discovery-agent.md` | discovery ✅ |
| flows/ | `discovery.phase-flow.json` | discovery ✅ |
| **산출물** | **`planning-spec.{json,md}`** | discovery ❌ ★ ★ ★ |
| **schema** | **`planning-spec.schema.json`** | discovery ❌ |
| **tool** | **`tools/planning-extraction-validator`** | discovery ❌ |

★ 산출물 이름이 stage 이름과 비대칭 = chain harness 6-stage paradigm (v9.0.0) 진화 안 누락된 sub-task. DEC-2026-05-21 §3 backward-compat 결단으로 의도된 미루어짐 / v9.0.0 안 schema reuse 의무 정합 / 그러나 본격 drift attractor 로 확인됨.

## 2. 결단 본격

`planning-spec.{json,md}` → `discovery-spec.{json,md}` **본격 rename** (v11.0.0 MAJOR breaking).

### 명명 정합 대안 비교

| 후보 | 정합성 | 비고 |
|---|---|---|
| **discovery-spec** ★ 채택 | stage 명명 정합 (다른 stage 와 동형 / spec/plan/test/implement) | 자연 선택 |
| use-case-spec | 핵심 entity 정합 (UC-* 명시) | 미채택 — UC 는 entity 일 뿐 / spec 산출물은 UC + business_intent + source_grounded_evidence 종합 |
| requirements-spec | 전통 SE 정합 | 미채택 — Adzic Specification by Example paradigm 안 "requirements" 용어 본격 retract (Gojko Adzic 의 BDD 사상 정합) |

## 3. 영향 면적 (breaking change scope)

### 직접 영향
- `schemas/planning-spec.schema.json` → `schemas/discovery-spec.schema.json` (git mv)
- 산출물 file path `planning-spec.{json,md}` → `discovery-spec.{json,md}` (`.aimd/<scope>/discovery/`)
- `tools/planning-extraction-validator` → `tools/discovery-extraction-validator` (workspace rename)
- `id-conventions.md` `planning-spec` 인용 모두 갱신
- `skills/discovery-*` 6종 SKILL.md 본문 산출물명 갱신
- `agents/discovery-agent.md` 산출물명 갱신
- `methodology-spec/deliverables/17-planning-spec.md` → `17-discovery-spec.md` (git mv + 본문)

### 간접 영향 (cross_links)
- 5 PoC artifact (poc-04-mini / poc-05 / poc-03 / poc-14 / poc-11) `planning-spec.json` 모두 rename + cross_links 갱신
- traceability-matrix entries (`source_artifact_ref` 산출물명) 본격 갱신
- ADR-CHAIN-001 §1 (이중 렌더링) 본문 인용 갱신
- `flows/discovery.phase-flow.json` `outputs` 필드 갱신
- `tools/chain-driver` REQUIRED_VALIDATORS_PER_STAGE.discovery 갱신
- `tools/chain-coverage-validator` discovery stage 산출물명 갱신

### CLAUDE.md / charter 인용
- CLAUDE.md "산출물 5종 이식성" 표 (`rules.json`, `domain.json`, `openapi.yaml`, `schema.json`, `antipatterns.json`) — discovery-spec 본격 추가 ❌ (이식성은 analysis 자산만)
- CLAUDE.md "v2.0 신규 chain 산출물 6종" 표 `planning-spec` → `discovery-spec` rename
- `methodology-spec/lifecycle-contract.md` 본문 인용 갱신
- `methodology-spec/skills-axis.md` §4 chain stage axis 표 갱신

### backward-compat 결단

DEC-2026-05-21 §3 "산출물명 reuse keep" = **본격 retract**. v11.0.0 MAJOR breaking 자격으로 본격 rename. 이유:
1. v9.0.0 의 산출물명 reuse 의도 (schema reuse minimize) 가 실제 사용자 진입 시 cognitive load 증가
2. 1 release 안 본격 rename = 한번에 본격 일관 / 단계적 rename = drift attractor 본격 증가 risk
3. v11.0.0 MAJOR 다른 결단 (BE/FE 분리 / Epic 재정의 등) 와 함께 시행 = 사용자 학습 곡선 한 번에 흡수

## 4. 시행 cascade (Phase 1)

### Phase 1 안 git mv + 갱신 묶음

```
1. git mv schemas/planning-spec.schema.json schemas/discovery-spec.schema.json
2. git mv methodology-spec/deliverables/17-planning-spec.md methodology-spec/deliverables/17-discovery-spec.md
3. git mv tools/planning-extraction-validator tools/discovery-extraction-validator (workspace rename)
4. Edit replace_all planning-spec → discovery-spec across:
   - 6 discovery-* SKILL.md
   - discovery-agent.md
   - flows/discovery.phase-flow.json
   - chain-driver src 8
   - chain-coverage-validator src
   - schemas/discovery-spec.schema.json (자체 metadata)
   - CLAUDE.md
   - methodology-spec/lifecycle-contract.md
   - methodology-spec/skills-axis.md
   - methodology-spec/id-conventions.md
   - methodology-spec/plugin-charter.md
   - README.md
   - guides/*
5. 5 PoC artifact rename + cross_links 갱신
   - .aimd/<poc-XX>/discovery/planning-spec.{json,md} → discovery-spec.{json,md}
   - cross_links 안 source_artifact_ref 갱신
6. drift-validator 통과 확인
7. workspace test 100% pass 의무
```

### test cascade
- chain-driver REQUIRED_VALIDATORS_PER_STAGE.discovery 안 validator 명 갱신 (planning-extraction-validator → discovery-extraction-validator)
- 모든 test 안 산출물명 reference 갱신
- traceability-matrix-builder source_artifact_ref 갱신
- planning-extraction-validator 자체 workspace rename (npm package + bin name)

## 5. ratchet (legacy carry 대응)

기존 PoC 산출물 (`planning-spec.{json,md}`) 의 backward-compat:
- v11.0.0 = ★ ★ ★ 의도적 breaking. legacy file 본격 rename 의무. backward-compat shim ❌.
- 5 PoC sweep = Phase 4 안 본격 시행. v11.0.0 release 안 본격 종결.
- 차후 외부 사용자 (Type 2) = v11.0.0 release note 안 본격 명시. legacy 산출물 보유 사용자는 v10.x 호환 layer 없이 본격 rename 의무 (1-shot migration script 제공 가능).

## 6. 검증 (Phase 1 STOP-3)

- workspace test 100% pass (≈ 737/737)
- release-readiness 20/20 ready 유지
- skill-citation 0 stale 의무 (모든 인용 갱신 완료)
- drift-validator 3-way pass
- version 3-way sync = 11.0.0
- 5 PoC artifact rename 완료 (planning-spec 0 occurrence 확인)

## 7. cross-link

- SSOT: [DEC-2026-05-26-v11-paradigm-결단](DEC-2026-05-26-v11-paradigm-결단.md) §2 #1
- 폐기 결단: DEC-2026-05-21-chain-discovery-plan-stage-도입 §3 backward-compat (산출물명 reuse keep) 본격 retract
- 동반 결단: be-fe-산출물-분리 (#2 / discovery stage = cross-cut 단일 산출물 정합 / discovery-spec 안에서 BE/FE 모두 흡수)
- LL-v110-02 (stage 이름 vs 산출물 이름 비대칭 drift attractor) 자산화 trigger
