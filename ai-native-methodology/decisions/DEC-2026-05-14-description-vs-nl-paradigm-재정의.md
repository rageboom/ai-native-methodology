# DEC-2026-05-14-description-vs-nl-paradigm-재정의

- 일자: 2026-05-13~14 (★ session 10차 / Phase A 시행)
- 카테고리: methodology / paradigm decision / ADR-CHAIN-011 §5 patch v3 / v2.5.0 Phase A
- 결정자: 윤주스 (TF Lead)
- 상태: 승인 (★ ★ ★ ★ ★ paradigm 사상 결단 + 시행 / no version bump / no release / SESSION-WRAPUP commit / Phase B = 다음 session)
- 관련: ADR-CHAIN-011 §5 patch v3, DEC-2026-05-13-threshold-spike-revisit-paradigm (★ session 9차 origin), Plan P `~/.claude/plans/p-v2.5.0-paradigm-본격-도입.md`

---

## §1. trigger — C-description-vs-nl-paradigm-define carry 흡수

★ session 9차 결단 4 신규 carry 중 ★ Q2 영역:
- C-description-vs-nl-paradigm-define (★ v2.5.0 paradigm 결단 / 3 agent 충돌 영역)

★ session 9차 sub-agent 3 결단 충돌:
- Agent 1 (a) — description = AI 눈 / NL = 사람 눈 (paradigm 분리 보존)
- Agent 2 (b) — description = NL alias / NL field deprecate
- Agent 3 (c) — description = optional metadata / NL = mandatory BR statement / cross-validation 대상 = NL ↔ GWT only

## §2. 결단 (★ Agent 3 (c) hybrid 강 옵션 채택)

### §2.1. paradigm 정의

```
description    = ★ optional metadata
                 (★ BR statement + rationale + caveat + DRIFT 격상 자유 metadata)
                 (★ 사람 눈 친화 / characterization context 보존)
                 (★ cross-validation 대상 ❌)

natural_language = ★ ★ ★ v2.5.0 권장 표준
                   (★ pure BR statement / 1~2 문장 / GWT 동치 의미)
                   (★ cross-validation 대상 / Layer 2 LLM mandatory v2.5.0 Phase C)
                   (★ rationale/caveat 제외)

cross-validation 대상 = ★ natural_language ↔ given/when/then ONLY
                       (★ description 제외 / ★ Layer 1 keyword overlap 한계 회피)
```

### §2.2. 결단 근거

A. ★ session 9차 SPIKE v2 결정적 사실 — description 안 rationale/caveat 안 GWT 매칭 keyword 존재 (★ BR-AUTH-STATELESS-001 stripping 후 overlap -0.133 / BR-COMMENT-DELETE-001 stripping 후 -0.108) = ★ description ≠ "pure BR statement" 입증.

B. ★ Agent 3 (c) paradigm 정면 입증 (★ session 9차 자료 + 본 SPIKE v2).

C. ★ ★ Adzic 10년 폐기 회피 도구 자격 강화 — cross-validation 대상 명확화 (NL ↔ GWT only) → Layer 2 LLM mandatory paradigm prerequisite 자격.

D. ★ v2.5.0 paradigm 본격 도입 step 1 정합 (★ Phase A scope).

### §2.3. backward-compat paradigm (★ safe 마이그레이션)

★ ★ schema breaking change ❌ / anyOf 보존:
- ★ description-only BR = ★ schema valid (★ 11 PoC 호환 보존)
- ★ ★ 단 cross-validation 미시행 / description_only_fallback low finding 발생 (★ Phase B 마이그레이션 carry)
- ★ ★ ★ ★ schema description 강화만 — paradigm 명세 명확 / breaking change ❌

## §3. Phase A 시행 산출 (★ session 10차 = 본 DEC)

### §3.1. schema 변경 (`schemas/rules.schema.json`)

- ★ allOf.anyOf description 강화 — "description fallback (★ v2.5.0 Phase A — backward-compat / Phase B 마이그레이션 carry)" 명세
- ★ ★ ★ ★ item description 강화 — "cross-validation 대상 = natural_language ↔ given/when/then **ONLY** (★ description 제외)" 명세
- ★ ★ natural_language field description 강화 — "pure BR statement" 명세 + Layer 2 LLM cross-validation 대상 명세
- ★ ★ ★ description field description 강화 — "optional metadata 격상" 명세 (★ deprecated alias 격하 ❌)

### §3.2. validator 변경 (`tools/br-cross-consistency-validator/src/deterministic.js`)

- ★ ★ description ↔ natural_language alias 처리 ★ 제거 (★ nlText = NL field only)
- ★ ★ hasDescription 신규 boolean (★ cross-validation 대상 ❌ / fallback 추적)
- ★ ★ ★ description_only_fallback low finding 신설 (★ Phase B 마이그레이션 carry)
- ★ representation_missing 조건 갱신 (★ description fallback 인정)
- ★ return value 안 has_description 신규 (★ validator.js stats 정합)

### §3.3. validator.js 변경

- ★ ★ withDescriptionOnly stat 신규 (★ Phase B 마이그레이션 carry 가시화)
- ★ stats.with_description_only 신규 출력

### §3.4. unit test 갱신

- ★ ★ 신규 test 3건:
  - "★ v2.5.0 Phase A: description-only BR — description_only_fallback low finding"
  - "★ v2.5.0 Phase A: description + GWT — cross-validation 미시행 (★ description 제외)"
  - "★ v2.5.0 Phase A: NL + description + GWT — cross-validation = NL ↔ GWT only"
- ★ ★ ★ 22 + 3 = 25/25 pass ✅

### §3.5. PoC #01 자동 마이그레이션

- ★ `tools/br-cross-consistency-validator/scripts/migrate-description-to-natural-language.mjs` 신설
- ★ 3 step stripping (첫 ". " + 괄호 제거 + em dash 이후 제거 + trailing " ." → "." 정리)
- ★ ★ 13/13 BR 모두 마이그레이션 적용 ✅ (★ description 보존 + natural_language 신규 추출)
- ★ ★ ★ 사람 검토 carry 13건 (★ 자동 추출 정확 보장 ❌ / Phase B 안 일괄 검토 의무)

### §3.6. PoC #01 cross-validation 결과

```
stats: with_natural_language=13 / with_gwt=13 / with_both=13 / with_description_only=0 / with_finding=13
overlap: mean=0.173 / median=0.105 / max=0.500 (★ session 9차 SPIKE v2 stripped 결과 ★ 그대로 실현)
score: 0.608 / gate: fail (★ 13 keyword_mismatch findings × medium 0.4 penalty)
```

★ ★ ★ ★ ★ ★ ★ 본 결과 = Q2 paradigm 정합 — Layer 1 keyword overlap = "structural sanity check" 격하 사실 그대로 / ★ Layer 2 LLM (v2.5.0 Phase C) 에서 ★ 실제 semantic 검증 의무 / ★ ★ session 9차 결단 paradigm 시행 자격 ★ 입증.

### §3.7. workspace 전수 test 회귀 검증

★ 302/0 pass (★ +3 신규 paradigm test / 회귀 ❌).

## §4. resolved + 신규 carry

### §4.1. resolved by 본 DEC

- ★ ★ ★ **C-description-vs-nl-paradigm-define** (★ session 9차 carry) → ★ ★ **resolved** (★ Q2 paradigm 재정의 본격 시행 + PoC #01 마이그레이션 ✅)

### §4.2. 신규 carry

- ★ ★ ★ **C-poc-01-13-br-nl-human-review** (★ ★ session 10차 신규 / Phase B carry — PoC #01 13 BR 안 ★ 자동 추출된 natural_language 인 사람 검토 의무 / 정확 보장 ❌ 영역)
- ★ ★ ★ **C-poc-02-11-description-to-nl-migration** (★ Phase B carry — PoC #02~#11 안 description 보유 BR 마이그레이션 의무 / ≥ 2 PoC corroboration 정합 (PoC #03 + PoC #05 우선))

## §5. ★ Lessons Learned (★ 본 DEC 직접 정합)

### §5.1. ★ ★ ★ ★ LL-i-31 (★ "schema breaking change ❌ + validator paradigm 갱신 = safe 마이그레이션 paradigm")

- **Why**: schema anyOf 보존 (★ 11 PoC 호환) + validator paradigm 갱신 + description field description 강화 = ★ ★ ★ "safe 마이그레이션" — breaking change 0 + paradigm 명세 명확 + 마이그레이션 carry 분리 가능
- **How to apply**:
  - paradigm 재정의 시 ★ ★ schema breaking change 회피 + validator 영역만 변경 paradigm 우선 검토 의무
  - schema = backward-compat anyOf 보존 + description 강화 의무
  - 마이그레이션 = ★ 자동 script 자산화 + 사람 검토 carry 분리 의무
  - ★ ★ ★ "Phase A scope 안 schema + validator + pilot PoC 만 / 다른 PoC = Phase B 분리" paradigm 정합

### §5.2. ★ ★ LL-i-32 (★ "description ↔ natural_language paradigm 명세 = paradigm 결단 결정적 사실")

- **Why**: 본 session 시행 결과 = ★ description 자체가 ★ "BR statement + rationale + caveat 복합 자산" 사실 입증 / ★ ★ alias 인정 paradigm (★ session 9차 이전 paradigm) = ★ semantic 차이 신호 → data quality 신호 ★ 오해
- **How to apply**:
  - paradigm 명세 명확 의무 = ★ ★ 본 방법론 안 모든 dual representation 영역 정합
  - ADR-008 이중 렌더링 사상 확장 = ★ "단일 진실 + 두 렌더링" vs "두 표현 + cross-validation" 본질 차이 명확화 의무
  - ★ ★ 외부 인용 시 = "Layer 1 결정적 + Layer 2 LLM mandatory + paradigm 명세 명확" 3 layer corroboration 의무

## §6. Phase B 시행 prerequisite (★ ★ ★ 다음 session)

★ ★ Phase B = ★ ★ PoC #03 + PoC #05 dual representation 마이그레이션 (★ ≥ 2 PoC corroboration / Senior STOP-1 흡수 정합) + Layer 1 keyword threshold 0.5 → 0.15 floor advisory 격하.

★ ★ Phase B 시행 prerequisite (★ session 10차 충족):
- ✅ schema paradigm 명세 명확 (★ Phase A)
- ✅ validator paradigm 갱신 (★ Phase A)
- ✅ PoC #01 마이그레이션 pilot 입증 (★ Phase A)
- ✅ 자동 마이그레이션 script 자산화 (★ Phase A / PoC #03 + PoC #05 재사용 의무)

## §7. ★ ★ 시행 산출 (★ session 10차 commit 자산)

- ★ `schemas/rules.schema.json` (★ Phase A paradigm 명세 강화)
- ★ ★ `tools/br-cross-consistency-validator/src/deterministic.js` (★ description alias 제거 + description_only_fallback finding 신설)
- ★ ★ `tools/br-cross-consistency-validator/src/validator.js` (★ with_description_only stat 신규)
- ★ `tools/br-cross-consistency-validator/test/validator.test.js` (★ +3 신규 paradigm test)
- ★ `tools/br-cross-consistency-validator/scripts/migrate-description-to-natural-language.mjs` (★ 신설 / Phase B 재사용 의무)
- ★ ★ ★ ★ `examples/poc-01-realworld-spring/output/rules/rules.json` (★ 13 BR 마이그레이션 적용)
- ★ `decisions/DEC-2026-05-14-description-vs-nl-paradigm-재정의.md` (★ 본 DEC 신설)
- ★ ★ `docs/adr/ADR-CHAIN-011-BR-dual-representation-paradigm.md` §5 patch v3 + §9 LL-i-31~32 + §11 후속 (★ session 10차 갱신)
- ★ `decisions/STATUS.md` + `CLAUDE.md` + `CHANGELOG.md` + `decisions/INDEX.md` (★ session 10차 entry)
- ★ `~/.claude/plans/p-v2.5.0-paradigm-본격-도입.md` (★ 4원칙 1단계 plan)

## §8. ★ ★ chain harness 5 요소 변경 ❌ (★ ADR-CHAIN-001~005 정합)

본 DEC = ★ schema paradigm + validator + pilot PoC 마이그레이션 / ★ chain harness 5 요소 (chain-driver 5 요소) ★ 변경 ❌.

## §9. version handling

- ★ ★ no version bump / no release / no tag (★ Phase A paradigm 시행 commit / SESSION-WRAPUP)
- ★ v2.4.0 MINOR FINAL 라벨 = ★ 보존 + carry 명시 (★ session 9차 결단 정합)
- ★ ★ ★ ★ v2.5.0 MINOR = Phase A+B+C+D 종결 후 본격 release (★ Plan P scope)
