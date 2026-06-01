# DEC-2026-06-01-fecom-004-orphan-edge

> v11.31.0 MINOR release SSOT. dep-graph synthesizer Layer 4 — discovery/behavior 의 spec-level cross_links.to_analysis_artifacts 를 cross_reference edge 로 합성 (F-ECOM-004 graph orphan 해소).

## 맥락 (session 이어서)

직전 finding-system 정합(F-CHA-003/001) 종결 후 사용자 "② 진행 + FE 는 인터넷에서 react 프로젝트 하나 꺼내다 써줘". STATUS ② 잔여 sub-carry 중 **F-ECOM-004**(자율 가능) 착수. ② ecommerce-backend dogfood 가 표면화: graph-integrity FAIL — orphans=5 (analysis-architecture/domain/db-schema/form-validation-spec/error-mapping-spec = edge 0).

## 문제 + 조사 정정 (주장 ≠ 사실 / feedback_senior_fact_check_supplement)

1. **F-ECOM-004 root-cause 불완전**: "discovery/behavior 의 generic `cross_links.to_analysis_artifacts` 가 edge 미합성" 은 사실이나, 실측 결과 5 orphan 중 **3개(domain/error-mapping/form-validation)만** 그 list 에 있음 — **architecture·db-schema 는 어느 to_analysis_artifacts 에도 미참조**(dogfood discovery-spec 이 7대 cross-link coverage 의무 미충족). 즉 Part A(edge 합성)만으론 5→2.
2. **제안 B(chain-coverage filesystem coverage 검사) 폐기**: 코드 실측 — **poc-16 = orphan 0 정상**(db-schema.json 미참조이나 다른 edge 소스로 연결). filesystem coverage 검사 신설 시 poc-16 false-positive. → graph-integrity-validator 가 **이미 orphan=hard-FAIL**(`validator.js:128`) = enforcement 존재. `applyUserDecision` 등 별도 코드 불필요.

## 결정 (A + C / B = 기존 graph-integrity)

### A. graph-synthesizer Layer 4 (additive / breaking 0)
- `ANALYSIS_BASENAME_TO_KIND` const 신설 (basename → kind 역매핑 / 파일명≠kind: api/db-schema/ui-ux + alias openapi.yaml/db-schema.json / ANALYSIS_FILENAMES 정합).
- Layer 3(meta.related_chain_ids) 직후 Layer 4: discovery/behavior/operational-task 의 `cross_links.to_analysis_artifacts` → basename→kind → `analysisLoaded.has(kind)` guard → `analysis-{kind}` → **layer anchor**(정렬 첫 UC/BHV/OP id) cross_reference edge. dangling guard(nodeIds.has anchor) + dedup(기존 cross_reference key Set) + fan-out 회피(anchor 1개 / per-item 정밀 edge 는 Layer 1).
- `ANALYSIS_SUBKINDS`/`ANALYSIS_BASENAME_TO_KIND` export (drift-guard test).

### B. enforcement = 기존 graph-integrity-validator
- orphan=FAIL 이 곧 "미참조 → 강제 실패". Layer 4 가 to_analysis_artifacts 를 edge 통로로 만들어 의미 부여. 신규 filesystem coverage 검사 ❌ (poc-16 false-positive 회피).

### C. ecommerce dogfood 데이터 보정 (corroboration / 외부 repo)
- discovery+behavior `cross_links.to_analysis_artifacts` 를 present analysis 산출물 완전체(architecture/domain/business-rules/schema/antipatterns/openapi/error-mapping/form-validation)로 보정 → 실 그래프 재생성.

## 검증 (no-simulation / 실 CLI·실 git)

- graph-synthesizer **+5 test** (emit/dangling/dedup/anchor부재/basename drift-guard) → traceability-matrix-builder 144→**149**.
- workspace **1042 pass / 0 fail** (v11.30.0 1037 baseline + 5).
- release-readiness **30/30** (graph_integrity #13 poc-05 nodes=18/edges=29/orphan=0 불변 / code_pointer #16 불변).
- skill-citation 0 stale / version 3-way 11.31.0 / CRLF→LF 정규화(Edit 툴 노이즈 제거).
- **★ ecommerce 실 그래프 측정**: orphan **5**(원본) → **2**(Part A 단독 / domain·error-mapping·form-validation 해소) → **0**(Part A + C / architecture·db-schema) / graph-integrity passed:true / cycles 0 / unknown 0. dogfood findings·stats = F-ECOM-004 **resolved** 갱신.

## §8.1 (정직)

synth-class additive infra (read/합성 / 결정론). 단일 ecommerce 도메인 = orphan 해소 mechanism 입증 (graph-integrity 가 enforcement / RealWorld antipatterns 미참조 orphan = 동형 corroboration 후보 별 dogfood). committed poc-05/16 그래프 = snapshot 이라 Layer 4 edge cosmetic lag(orphan 0 유지 / gate 무영향 / regen script 부재 → 원본 command 없이 재생성=위험 → 유지 = 정직 표기).

## 영향 / carry

- breaking 0 = MINOR.
- carry: committed PoC graph Layer4 lag(cosmetic) · F-ECOM-005(skill db-schema source_files 안내) · S2 gate WARN→block · **FE kinds(BE-only repo → FE 3rd 도메인 dogfood 진행 예정 / 본 session 후속)**.

Extends DEC-2026-06-01-db-schema-naming-modern-orm.
