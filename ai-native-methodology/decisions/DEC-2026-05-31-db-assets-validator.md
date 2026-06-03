# DEC-2026-05-31-db-assets-validator

> v11.16.0 MINOR (P1) SSOT. DB 자산 always-on 정책 자동 validator 신설 — `tools/db-assets-validator` (25번째). carry `C-db-autoval` / finding `F-DB-AUTOVAL-001` ✅ 해소.
> 상태: **승인 + 시행 완료** (2026-05-31). 사용자 `잔여 작업 남은거 있나?` → 91-item carry audit(workflow) → actionable 4종 → 우선순위 진행 결단 + P1 gate 위치 batch 질문 "추천(release-readiness #23 + standalone)" 선택.

## 배경

`db-assets-always-on.md` §8.4 = K 정책이 매뉴얼 체크리스트 + `_manifest.yml` 사람 눈 검증뿐 / **자동 validator 부재**(F-DB-AUTOVAL-001). `work-unit-manifest.schema.json` 의 `analysis_refs` 는 이미 DB 자산 4 필드(db_tables/db_procedures/db_functions/db_views / db_procedures = {id, sp_conversion_class?, external?})를 v11.3.0 에 정의했으나 검사 도구 없음.

## 결단 — 신규 standalone validator + release-readiness #23 (gate-eval inject ❌)

gate 위치 = **release-readiness #23 + standalone** (batch 질문 추천안). 근거: DB 완성도 = manifest **입력 품질** 게이트(chain 출력 아님) → chain-driver gate-eval per-stage inject 는 결정론 axis 오염·layer 혼선. 사용자가 per-stage 강제 원하면 chain `--next` 전 standalone(`--strict`).

검사 (finding 6종):

- `sp_missing_id`(critical) / `sp_invalid_class`(critical / enum {alpha,beta,gamma,delta}) / `sp_unclassified_at_plan`(critical — plan stage 이후 hard-gate / discovery 까지 nullable, db-assets §3 chain 3).
- `external_class_mismatch`(high — external=true ↔ class≠gamma) / `gamma_external_unset`(medium — class=gamma ↔ external≠true).
- `db_assets_absent`(medium — 비-DB 자산만 있고 DB 0 / **greenfield 면제** paradigm-aware / scope 에 DB layer 부재면 무시).

결정론 axis (feedback_chain_driver_deterministic_axis): manifest **완성도** only / canonical global cross-resolution = drift-validator 영역. exit 0/1/2 (no-simulation).

release-readiness **#23** = golden fixture 판별 (content-aware / file presence ❌): `test/fixtures/compliant-plan.json`→PASS(critical/high 0) + `violations-plan.json`→FAIL(`sp_unclassified_at_plan`+`external_class_mismatch`). 커밋된 PoC 에 `analysis_refs.db_*` manifest 부재(poc-17 외부 격리) → validator discrimination 입증으로 대체.

## STOP-3

workspace 879→**903 (+24 / db-assets 17 포함)** + release-readiness 22→**23/23** + test:release 14/14(self-test 22→23) + skill-citation 0 stale + version 3-way 11.16.0 + breaking 0 = **MINOR**.

## carry

- `C-db-autoval` ✅ 종결 / `F-DB-AUTOVAL-001` ✅ 해소.
- `C-db-autoval-corpus-extension` (신규) — 커밋된 PoC 에 `analysis_refs.db_*` manifest 가 생기면 #23 을 golden fixture 판별 → 실 corpus scan(no CRITICAL) 으로 확장.

## paradigm 정합

- 결정론 도구 = LLM inject ❌ / no-simulation exit code.
- content-aware criterion (file presence 단독 검사 0개 의무 보존).
- §8.1 과적합 회피: 검사 규칙(enum / γ↔external / stage hard-gate)은 paradigm-agnostic. greenfield 면제로 zero-DB scope false-positive 회피.

## 인용

- `methodology-spec/db-assets-always-on.md` §8.4 (F-DB-AUTOVAL-001 / 해소 반영)
- `methodology-spec/sp-conversion-policy.md` §2 (α/β/γ/δ)
- `schemas/work-unit-manifest.schema.json` `analysis_refs` (DB 자산 4 필드)
- `tools/db-assets-validator/` (src + test + fixtures + README)
- `scripts/release-readiness.js` check23 + `scripts/test/release-readiness.test.js` (22→23)
- memory `feedback_db_always_on_policy` + `feedback_chain_driver_deterministic_axis`
