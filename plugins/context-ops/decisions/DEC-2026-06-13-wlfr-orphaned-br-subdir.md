# DEC-2026-06-13 — F2a 재정의: "cross-BC 어휘 drift" = WLFR orphaned stale BR 서브디렉토리 (측정 아티팩트) / 문서화-only

- **일자**: 2026-06-13 (버전 bump 없음 — governance 교정 + 컨벤션 문서 + ep-be-gea 데이터 정리 / plugin 동작·schema 무변경)
- **카테고리**: 본체 finding 재정의(self-recorded-fact-validation) + 컨벤션 명문화 + §8.1 SOFT-감지기 carry
- **상태**: 승인·시행 (사용자 "gogo" / carry ④ BC-ISSUE-ACM dogfood 후속 F2a diagnose)
- **관련**: STATUS carry ④ F2a(원 보고) · `DEC-2026-06-13-sql-inventory-cte-exclusion`(F1 자매) · BR-split(v0.24.0)·2-zone(`DEC-2026-06-12-artifact-zone`) · memory `feedback_self_recorded_fact_validation`·`feedback_diagnose_before_design_check_existing`·`feedback_quality_priority`·`feedback_chain_driver_deterministic_axis`

---

## 1. 원 보고 (F2a) 와 그 오류

BC-ISSUE-ACM analysis-agent + 후속 STATUS 노트가 **"leaf schema(`business-rules-bc.schema.json`)가 `source_evidence.type` enum 미강제 → full schema 17-enum 과 비대칭 → WLFR 이 calc/state/validation 사용 = cross-BC 어휘 drift"** 로 보고. → "schema 통일 + 전 leaf 마이그레이션"(대형 작업)으로 흐를 뻔함.

## 2. diagnose-before-design 실측 (전수 조사)

- **전 19 BC** 를 canonical 소비 경로(index → `bc_files[].file` / `loadBusinessRules`)로 읽으면 **전부 17-enum conformant**(509 rule). off-enum 값은 **WLFR `business-rules/` 서브디렉토리에서만** 관측.
- **index→WLFR = `domains/BC-WLFR/business-rules.json`(flat, 125 rule, conformant)**. `business-rules/` 서브디렉토리(cafe-copn/grpins/inloan/lcadn/taxi-point)는 **index 미참조 = 비소비/inert**. 소비 도구 어느 것도 서브디렉토리를 index 우회 글롭 안 함(전부 index 경로).
- flat ↔ 서브디렉토리 = **동일 125 rule id · 동일 281 source_evidence** (flat-only 0 / leaf-only 0 / evidence 손실 0) — 서브디렉토리는 **vocab 정정 전 stale 복사본**.
- rule 객체엔 **별도 `category` 필드**(validation/workflow/calculation/policy/integration/authorization) = 규칙-범주 축의 정당한 home → `source_evidence.type` 는 **증거 위치**(17-enum)가 canonical 의미 확정.

→ **"cross-BC 어휘 drift" 는 측정 아티팩트** — agent/STATUS 가 inert·stale 서브디렉토리를 직접 읽어 오보고. schema 비대칭·마이그레이션은 **불필요**.

## 3. 결정 (최소 표면)

1. **기록 교정**(self-recorded-fact-validation): STATUS F2a 서술을 본 재정의로 정정.
2. **ep-be-gea 정리**: WLFR orphaned stale `business-rules/` 서브디렉토리 삭제(flat 이 SSOT·evidence 손실 0 / ep-be-gea `9ca871108b` GHE pending).
3. **컨벤션 명문화**: BR 은 **index→`bc_files[].file` 경로(`loadBusinessRules`)로만 소비** / per-BC 내부 sub-domain breakdown 서브디렉토리는 **indexed 파일과 consistent 하거나 부재**(divergent 잔존 ❌). `load-business-rules.js` doc 주석.

## 4. §8.1 — SOFT 감지기는 carry (1 datapoint)

dual 표현(indexed flat + non-indexed 서브디렉토리) silent divergence 갭 = **WLFR 1 datapoint·전이기 아티팩트**(aggregate 에 vocab 정정 적용·breakdown 미적용). divergence 는 **inert**(소비 경로 무영향 / 해악=사람·agent 직접 글롭 오독). → validator 하드닝 **금지**(단일 datapoint 과적합 회피 / label-lint SOFT→HARD ratchet 동형). **2nd 도메인 재발 시** orphaned-서브디렉토리 SOFT 감지기 별도 DEC.

## 5. 검증

- 전수 조사: 19 BC / 509 rule canonical 경로 conformant. WLFR flat 125 rule·281 SE = 서브디렉토리 동일(손실 0). 소비자 index-우회 글롭 0건.
- 본 변경 = governance·문서·외부 데이터만 / plugin 동작·schema·exit-code 무변경 → **버전 bump 없음**.

## 6. carry / 비범위

- orphaned-BR-서브디렉토리 SOFT 감지기(2nd datapoint 후).
- ISSUE-ACM 도 dual 구조(flat+서브디렉토리)이나 **둘 다 conformant·consistent**(갓 생성) = divergent 아님 → 정리 불요.
- 잔여 dogfood findings(F2b~F5 / sql-inventory TVF·키워드 noise) = 별개.

> **보안**: 본 DEC = 본체/컨벤션 기술만 / 사내 식별자 0(BC-WLFR·codename / source_evidence.type=일반 schema 용어). 노출 컨텍스트 산출물 = ep-be-gea GHE only.
