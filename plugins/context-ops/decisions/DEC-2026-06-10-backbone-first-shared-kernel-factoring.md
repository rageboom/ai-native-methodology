# DEC-2026-06-10-backbone-first-shared-kernel-factoring

**결단**: 대형 코드베이스 analysis 의 **backbone-first 절차 + shared-kernel factoring 규칙**을 본체 명문화. ADR-CHAIN-016 에 시퀀스는 있었으나 ⓐ shared-kernel(비-DB 공통코드) factoring 누락(DB backbone 만) ⓑ skill 미operationalize(LLM 이 skill 따라 실행 안 됨) ⓒ scope/backbone 구분 schema 표식 없음 = 갭. 규칙: **scope 를 끊기 전 DB + shared-kernel(Martin afferent-hub)을 `role=backbone` 으로 먼저 분리 → 1회 분석 → hub 제거로 feature 간 결합 급감 → 남은 feature = role=scope.** scope id = 알아듣기 쉬운 의미 명칭.

**작성일**: 2026-06-10 (사용자: "이 방법론이 플러그인에 녹아있나? + 나눌때 명칭 알아듣기 쉽게" → codify-first 결단 A).

**version**: plugin.json 0.27.0 → 0.28.0 (MINOR — additive schema(role) + 절차 operationalize / 무파괴).

**배경 (정직 diagnose)**: ep-be-gea 적용 중 발견 — 원칙(scope=응집·scope-carve·DB backbone)은 codified 됐으나 **end-to-end backbone-first 절차 + shared-kernel factoring 은 내 ad-hoc** 이었음. grep ③ 0건. codify-first 로 ad-hoc→methodology 전환(재작업 최소 / 품질 우선).

**relates to**:
- ADR-CHAIN-016 (§적용 절차 확장 + shared-kernel factoring 규칙 신설)
- ADR-CHAIN-014 db-assets-always-on (DB backbone 선례 — 본 결단이 shared-kernel 로 확장)
- DEC-2026-06-09-scope-carve-3signal-reference-lens(Martin hub_warning) + DEC-2026-06-10-scope-carve-promotion + DEC-2026-06-10-scope-carve-candidates-dedup
- `schemas/inventory.schema.json`(scope_candidates.role enum) · `skills/analysis-source-inventory`(backbone-first 단계) · `skills/analysis-scope-carve`(hub→backbone) · `methodology-spec/workflow/discovery.md`
- memory `feedback_diagnose_before_design_check_existing`(ad-hoc vs codified 구분) · `feedback_quality_priority`(§8.1 / codify-first)

---

## 1. 결정 내용

### 1.1 backbone-first 절차 (ADR-CHAIN-016 §적용 절차 확장)
`[0] inventory → [1] codegraph/scope-carve 측정 → [2] backbone 분리(ⓐDB ⓑshared-kernel) → [3] feature=scope full 분석`. backbone = scope 아님 / 1회 / 모든 scope 참조.

### 1.2 shared-kernel factoring 규칙
afferent-hub(Martin Ca 최상위 공통 유틸/코드) + DB-adjacent 공통코드 = `scope_candidates[].role=backbone`. **paradigm 근거**: Martin "hub 쪼개면 파편화" + DDD shared-kernel + db-assets-always-on 동형. backbone 제거 → feature external coupling 급감 → 깨끗한 scope 분리(Vertical Slice).

### 1.3 schema — scope_candidates.role enum [scope, backbone] (additive / default scope)

### 1.4 scope 명명 = 의미 명칭 (패키지 약칭 ❌)
scope slug = 사용자 자유 명명(id-conventions §scope 정합)이되 **알아듣기 쉬운 의미 명칭**(예: resve→reservation / wlfr→welfare). 도메인 오너 확정.

## 2. §8.1 정직 carry
- **규칙(hub→backbone)** = paradigm-grounded → 즉시 codify.
- **"external coupling 의 kernel 비중 %"** = ep-be-gea 1-PoC 실측(81~88%) → **일반 임계 수치 미주장** / ≥2 distinct 도메인 corroboration 후. (scope-carve promotion 과 동일 carry 패턴.)

## 3. 변경 (additive / 무파괴)
- ADR-CHAIN-016 §적용 절차 확장 + factoring 규칙 / inventory.schema role enum / 2 skill 단계 / discovery.md. 기존 필드·동작 무변경.

## 인용
- ADR-CHAIN-016 · ADR-CHAIN-014 · DEC-2026-06-10-scope-carve-promotion · DEC-2026-06-10-scope-carve-candidates-dedup
- memory: feedback_diagnose_before_design_check_existing · feedback_quality_priority
