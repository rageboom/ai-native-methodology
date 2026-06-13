# DEC-2026-06-13 — BC-ISSUE-ACM dogfood 잔여 findings(F2b~F5) triage: F3 fix / F2b·c carry / F2d·F4·F5 dissolve

- **일자**: 2026-06-13 (F3 = PATCH v0.46.3 동반[char-spec description additive] / 나머지 = 무코드 triage 기록)
- **카테고리**: dogfood finding triage (diagnose-before-design / self-recorded-fact-validation) — 재조사 방지 + by-design 근거 보존
- **상태**: 승인·시행 (사용자 "a, b 같이 진행" / 병렬 검증 패널 `wf_ef3688c0-926` 7-agent)
- **관련**: `DEC-2026-06-13-sql-inventory-cte-exclusion`(b = §8) · `DEC-2026-06-12-artifact-zone`(F2d·F4 by-design 근거) · `DEC-2026-06-07-subset-retire` · memory `feedback_diagnose_before_design_check_existing`·`feedback_self_recorded_fact_validation`·`feedback_quality_priority`

---

## 1. 배경

BC-ISSUE-ACM(출입통제) analysis dogfood 가 보고한 plugin findings 5건 중 F1(CTE / v0.46.1)·b(sql-inventory noise / v0.46.2·v0.46.3) 처리 후 잔여 F2b~F5. **agent 자기보고 액면 수용 ❌** → 7-agent 병렬 검증(`wf_ef3688c0-926`)으로 real/covered/by-design + §8.1 판정. F2a 가 측정 아티팩트였던 전례(같은 캠페인)로 검증 필수.

## 2. 판정 결과

| finding | 판정 | 근거 |
|---|---|---|
| **F3** char-spec field traps (when=string / behavior_likely_bug=array / ambiguous_carry=구조체) | **fix (doc-only / v0.46.3)** | 3 field type 전부 by-design + poc-03(Modern)·poc-16(Legacy) 2 paradigm 이 현 type 으로 author·validate clean → **rename ❌**(breaking). `description` 에만 명료화 추가(non-validating → 검증결과 불변·무회귀). 잔존 실신호 = when 의 G/W/T string-vs-object 비대칭(가독성). |
| **F2b/F2c** migration-cautions enum gap (affected_scope service/data·detection_method tool_output_review) | **carry** | enum 추가 = 기계적 additive-safe 이나 **need 미입증**: §8.1 1 datapoint(ep-be-gea=DEC §4 상 1) + 기존값 흡수(service→api·`bc_scope`·`location_hints` / data→database / tool_output_review≈manual_review). 투기적 gold-plating 회피. 2nd distinct 프로젝트가 표현불가 caution 내면 그때 additive 추가. |
| **F2d** shared schema.json per-BC provenance 부재 | **dissolve** | **BY-DESIGN**: schema.json = canonical-global 단일 table set(`DEC-2026-06-12-artifact-zone` 공통 zone / read model ⊥ storage). 링크는 **BC→table 역방향**(business-rules.bounded_context+related_db_tables / sql-inventory per-BC+dependent_tables)으로 이미 존재. shared table 에 BC tag = N:M 중복 drift source = 의도적 회피. 실 harm 0 datapoint. |
| **F4** bc-accumulator-rollup 가 schema/antipatterns 미커버 | **dissolve** | **BY-DESIGN**: rollup = 지정 4 카탈로그(BR-index/migration/findings/domain)만. schema.json=shared analysis-once(per-BC fragment 부재 → roll 대상 아님 / =F2d). antipatterns 물리 split = 명시 deferred(F14 / bc_scope 0-datapoint). hand-upsert "friction"=가설/1-domain(실측 recurring cost ❌). AP rollup 확장 = F14 trigger(≥2 도메인) 후 deferred-carry. |
| **F5** antipatterns id pattern `^AP-[A-Z]+-\d+$` multi-segment 금지 | **dissolve** | **BY-DESIGN + 오해**: 중간 세그먼트=**category**(closed enum: ARCH/DB/…/MAINTAINABILITY), BC 아님. BC 귀속은 별도 `bc_scope` 필드(v0.41.0 / multi-segment 허용). 단일토큰 관용(AP-ISSUEACM/AP-RESVGOLF)은 이미 출하·34 id 전부 pass. pattern 완화 = category/scope 분리(F14) 역행 → 컨벤션 문서화로 해소(스키마 무변경). |

## 3. §8.1 / 처분 원칙

- **dissolve 3건(F2d·F4·F5)** = 전부 paradigm misread(artifact-zone canonical-global / category≠BC) → 무코드. by-design 근거 본 DEC 보존 = 재조사 방지.
- **carry 1건(F2b/c)** = additive-safe 이나 1-datapoint·기존값 흡수 → 2nd 프로젝트 실 need 후. (label-lint·CTE SOFT ratchet 동형)
- **fix 1건(F3)** = description-only additive(검증 불변·rename❌) = v0.46.3 동반.

## 4. 검증

- 7-agent 병렬 검증 `wf_ef3688c0-926`(각 finding 실 schema/tool 재현 + 기존자산/by-design 대조 + §8.1).
- F3: char-spec schema 파싱 OK / description 3곳 additive(when 비대칭 명시·behavior_likely_bug=ARRAY·ambiguous_carry=구조체+enum) / 검증 불변(ajv description 무시) / RR 42/42.

> **보안**: 본 DEC = 본체/스키마 기술만 / 사내 식별자 0(BC codename·schema 용어). 노출 컨텍스트 산출물 = ep-be-gea GHE only.
