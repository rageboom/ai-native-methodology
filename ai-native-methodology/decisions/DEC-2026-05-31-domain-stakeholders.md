# DEC-2026-05-31-domain-stakeholders

> v11.16.0 MINOR (P3) SSOT. `domain.schema.json` 에 `stakeholders` + `business_intent_summary` optional 추가 + analysis-domain-model skill 본문 강제. carry `C-domain-schema-stakeholders`.
> 상태: **승인 + 시행 완료** (2026-05-31). 사용자 batch 질문 "P3 'mandatory' 해석" → "추천(schema optional + skill 본문 강제)" 선택.

## 배경

carry 명칭 = "C-domain-schema-stakeholders-**mandatory**" 이나 `domain.schema.json` = strict(`additionalProperties:false`) + required `[meta, bounded_contexts]`. 신규 필드를 **required** 로 넣으면 기존 PoC domain.json 11종(poc-01/02/03/08/09/10/11/16 등)이 schema-invalid → breaking(MAJOR). 단 그 PoC domain.json 들은 이미 pre-existing 사유($comment/$schema_ref/missing meta 등)로 prelim/non-strict 상태.

## 결단 — schema optional + skill 본문 강제 (additive / breaking 0)

'mandatory' = schema-required 가 아니라 **skill 본문 산출 의무 + validator WARN** 으로 해석 (v11.6.0 intent_certainty 선례 동형):

- `schemas/domain.schema.json` — `stakeholders`(string array / discovery-spec `business_intent.stakeholders` 동형) + `business_intent_summary`(string) **optional** 추가. required 미추가.
- `skills/analysis-domain-model/SKILL.md` — 절차에 비즈니스 컨텍스트 추출 **의무 step**(신규 산출 시 두 필드 작성 / source 신호 부재 시 hallucination ❌·생략) + 예시 JSON 반영.
- `templates/analysis/domain.template.md` — 비즈니스 컨텍스트 절 신설.
- `discovery-extraction-validator` — domain 제공 시 두 필드 부재 = `discovery.domain.missing_business_context`(low / non-blocking) WARN (+4 test).

SSOT 경계: 전체 비즈니스 이해관계자 + 성공 기준 = discovery-spec `business_intent` (success_criteria 는 domain 에 미추가 / feature creep 회피). domain = **도메인 actor 초점**.

## backward-compat 실측

기존 domain.json 에 2 필드 추가 전후 schema-validator 에러 집합 **동일**(BEFORE=AFTER / 새 에러 미추가) — optional additive 안전 입증. domain.json 은 release-readiness check8 schema sweep 대상 아님(영향 0).

## STOP-3

workspace 903/903(discovery-extraction +4 포함) + release-readiness 23/23 + skill-citation 0 stale + version 3-way 11.16.0 + breaking 0 = **MINOR**.

## carry

`C-domain-schema-stakeholders` ✅ 종결 (schema optional + skill 강제 + validator WARN 시행 / mandatory=skill-layer 해석).

## paradigm 정합

- intent_certainty(v11.6.0) optional + skill 강제 + validator low-WARN 선례 동형 (강제 = AI instruction layer / schema 는 backward-compat optional).
- §8.1: 기존 PoC 보존 / SSOT 중복(discovery-spec) 회피 (summary/actor 초점 분리).

## 인용

- `schemas/domain.schema.json` (stakeholders + business_intent_summary optional)
- `schemas/discovery-spec.schema.json` `business_intent` (SSOT / stakeholders 동형 mirror)
- `skills/analysis-domain-model/SKILL.md` + `templates/analysis/domain.template.md`
- `tools/discovery-extraction-validator/src/validator.js` (`discovery.domain.missing_business_context`)
- DEC-2026-05-30-fdogfood-003-intent-certainty (선례)
