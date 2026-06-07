# DEC-2026-06-07-bounded-context-mandatory

**결단**: business-rules 산출물의 각 BR `bounded_context` 필드를 **optional → required** 승격. writer(`analysis-business-rules`)가 `domain.json` 의 bounded_contexts 에 매핑해 의무 채움. BR↔모듈 경계 추적성 확보 + 향후 BC별 산출물 분할(BR-split 순차안 STEP 3)의 분할 키 토대.

**작성일**: 2026-06-07 (사용자: "bounded_context 이게 뭔데? 분할을 해야 되는데 안 되어 있으면 이걸 먼저 잡고 분할하면 되는 거 아님?" — 토대 선결 추론).

**version**: plugin.json 0.2.0 → 0.3.0 (breaking — 기존 BR 산출물이 BC 없으면 schema-invalid).

**relates to**:
- `DEC-2026-06-07-subset-retire` (BR-split 순차안 STEP 0 / 본 결단 = STEP 1)
- `schemas/business-rules.schema.json` ($defs.businessRule required) · `skills/analysis-business-rules/SKILL.md` (writer)
- `feedback_senior_fact_check_supplement` (Senior 가 bounded_context 7/8 PoC=0% 실측 → "무조건 분할 now" 반증 / 토대 먼저)

---

## 1. 배경

BR-split(business-rules 를 BC별 파일로 분할) 검토 중 Senior 가 실측: **bounded_context 채움률 8 PoC 중 7개 = 0%**(poc-01 만 13/13). writer SKILL 이 채우기를 지시조차 안 함. BC 가 비면 분할 시 전부 `_uncategorized` 로 몰려 분할 무의미. → 분할(STEP 3) 전에 **BC 를 먼저 의무화(STEP 1)** 하는 순차안 채택.

## 2. 결정 내용

- **schema** (`business-rules.schema.json`): `$defs.businessRule.required` = `["id"]` → `["id","bounded_context"]` + `bounded_context.minLength:1` + description(분할 키 / domain.json 매핑).
- **writer** (`analysis-business-rules/SKILL.md`): 각 BR 을 domain.json bounded_contexts 에 매핑 의무 채움 지시(단일 도메인이면 그 1개 BC / 누락 = domain 모델 재점검 신호).
- **예제 백필**: release-readiness `analysis_validator_violation` 이 예제 business-rules.json 을 전수 schema 검증 → 0% 14 PoC 백필 의무. BR id `<DOMAIN>` 토큰 → `BC-<DOMAIN>` 결정적 derive(poc-01·16 = 기존 domain-informed BC 보존). 14 파일 / 113 rule.

## 3. 검증

- schema-validator 108/108(픽스처에 BC 추가 / VALID 기대 + INVALID 기대 모두 의도한 이유로). poc-05 valid · poc-02(백필 전) bounded_context RED 입증 후 백필.
- 예제 14 파일 백필 후 전수 schema-valid. release-readiness analysis_validator 통과.

## 4. Non-goal / carry

- **분할(STEP 3) 아님** — 본 결단 = BC 의무화(토대)만. 분할은 STEP 2(경로통일+loader) 후 BC 채움률 실측 재판단.
- 예제 BC = id-prefix derive(시점 기록물 / 정밀 domain 매핑은 STEP 3 재생성 시).
- domain/antipatterns 등 타 산출물 BC = scope-out.
