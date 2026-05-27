# DEC-2026-05-27-v11-discovery-spec-cascade-완결

> v11.1.0 MINOR — DEC-2026-05-26-discovery-spec-rename §4 cascade 미완료분 완결 + drift-validator 산출물명 비교 신설. SSOT 상세: [CHANGELOG v11.1.0](../CHANGELOG.md) / [finding-system F-MB-010·011](../methodology-spec/finding-system.md).

**일자**: 2026-05-27 (session 49차 후속)
**카테고리**: corrective cascade + validator capability (naming coherence / 선언↔실상 모순 해소)
**상태**: 승인 — 사용자 결단 "지금 프로젝트의 플로우를 점검 해보고 싶다" → end-to-end 흐름 리뷰 → finding 등록 + plan 작성 → 시행 ("듀얼키 하지말고 교체" / MINOR v11.1.0 / 도구 클러스터 carry)

## 1. Trigger

end-to-end 흐름 점검 (`flows/` + 문서 + runtime 정합). DEC-2026-05-26-discovery-spec-rename 이 hard replace 를 명령했고 CHANGELOG/CLAUDE.md 는 "active doc cascade 완료" 로 기재했으나, 실제로는 다음이 미흡수 — **선언과 실상의 모순**.

## 2. 발견 (F-MB-010 / F-MB-011)

- **flows**: `discovery.phase-flow.mermaid` OUT 노드 + `sdlc-4stage-flow.{json,mermaid}` + `spec.phase-flow.{json,mermaid}` (입력/NEXT) = `planning-spec` 잔존. ★ `discovery.phase-flow.json`(discovery-spec) ↔ `.mermaid`(planning-spec) 산출물명 발산을 **drift-validator 가 0 breaking 통과** = 이중 렌더링 "drift 0 자가 입증" 간판의 실증 반례 (F-MB-011).
- **docs**: `lifecycle-contract.md` / `README.md` / `guides/{chain-harness-guide,first-prompt-cookbook}.md` / `agents/README.md` = `planning-spec` + chain 3 산출물 `plan-spec`(실 = `task-plan`) 잔존.
- **runtime (기능 결함)**: `chain-driver/src/{hooks-bridge,revisit-detect,work-unit}` = 옛 파일명 keying → 신규 `discovery-spec.json` 산출물 dep-graph 노드 인식·revisit 감지·traceability 추출 누락.

## 3. 결단 (시행)

- **flows/docs/runtime hard replace** `planning-spec`→`discovery-spec` + `plan-spec`→`task-plan`. runtime = **dual-key ❌ / 교체** (사용자 결단). PoC artifact = **frozen 보존** (재실행 ❌ / 사용자 결단 "POC 는 그냥 두고 자산만 바꾸자").
- **drift-validator 산출물명 비교 신설** (RED→GREEN) — mermaid 산출물명이 JSON inputs/outputs 계약에 부재 → breaking. 동종 발산 재발 차단.
- **선언↔실상 모순 정정** — CHANGELOG/CLAUDE.md 가 본 release 로 cascade 완결됨을 반영.
- 동반: spec.phase-flow.mermaid NEXT "chain 3 (test)"→"(plan)" / `revisit:planning`→`revisit:discovery` stale 정정 + agents/README plan-agent placeholder→gate #3 본격 표기 + lifecycle-contract plan stage v11 contract 강제 BE/FE prose 보강 + `finding-system.md:934` brace-notation citation fix (regress 2 gate 해소 / 외부 figma finding 산물).

## 4. 잔여 carry (별건 / PoC-bound)

`tools/traceability-matrix-builder/src/builder.js` `derived_from` + `tools/formal-spec-link-validator` (CHAIN_ARTIFACT_BY_NAME + `planning_spec_path` schema 필드) = PoC artifact·behavior-spec 필드명에 bound → 교체 시 PoC 깨짐. discovery-spec = chain 1 (backward link 없음) 이라 실효 영향 ≈ 0. **C-dep-graph-v11-paradigm-cascade carry 와 합치** (PoC 보존 결정 정합 / schema 필드 마이그레이션 = 별건 결단).

## 5. STOP-3

workspace test 전수 pass + release-readiness **22/22 ready** (regress 2 → 0) + skill-citation 0 stale + version 3-way 11.1.0 + drift-validator flows 5/5 0 breaking + chain-layout/state-flow ✅ = **MINOR** (additive validator capability + corrective cascade / breaking 0 — backward-compat shim 불요 / PoC frozen).

## 6. LL 후보

- **LL-v111-01**: "선언↔실상 모순" paradigm — release ceremony 가 "cascade 완료" 기재해도 자동 검증 부재 시 미흡수 잔존 (LL-dep-graph-01 "infra working ≠ paradigm cascade 자동 흡수" 의 flow/doc/runtime 계층 확장 / corpus-frozen 으로 미표면화).
- **LL-v111-02**: validator coverage 공백이 간판 가치 명제의 반례를 통과시킴 (이중 렌더링 drift 0 자가 입증 ↔ outputs[] 미비교) → RED→GREEN 으로 검증 capability 동반 신설이 재발 차단 정공법.
