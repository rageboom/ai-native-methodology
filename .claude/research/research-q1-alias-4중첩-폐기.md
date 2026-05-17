# research-q1-alias-4중첩-폐기.md

> ★ 4원칙 2단계 — 3-에이전트 병렬 research + 코드 착수 전 STOP-1 실측.
> session 25차 / 2026-05-17 / plan = `plan-q1-alias-4중첩-폐기.md`

---

## §1. Senior (_base-senior-engineer) — VERDICT: CONCERN + STOP-1(blocking) + STOP-2(cooling-off)

- **Q1 `rules_auto_extracted_reference`** → ★ **(b) `auto_extracted_br_refs` rename / 단 ① scope 외 → 별도 carry (Q-①-followup)**. provenance pointer (source/auto_registered_br/note) = BR array 와 구조·의미 disjoint. (c)흡수=정보손실 거절. semantic-rename 을 "alias 폐기" sprint 에 묶으면 scope creep — plan §2.1 분리 본능이 정답 (LL 정합).
- **Q2 deprecation** → ★ **(A) hard kill**. 본 레포 = 일방 추출 dogfooding / 외부 consumer 부재 (paradigm 자체 입증 / skill·doc·template ref=0 grep 검증). (B)deprecation period = consumer 보호 장치인데 보호 대상 부재 → validator WARN 기계 + 차기 MAJOR debt = zero benefit. (A) + 2 PoC in-commit migration.
- **Q3 version** → ★ **v5.0.0 MAJOR (확정 / 사용자 선택지 아님)**. anyOf 축소 + property 제거 = 기존 valid 문서 reject = textbook breaking. 외부 consumer 0 ≠ semver 면제 (semver = artifact contract). MINOR 호칭 = 방법론 integrity drift → 비방어적. v4.2.0 MINOR 선택지 제거 권고.
- **Q4 poc-04 가시화** → improvement (NOT regression) — ★ 단 **STOP-1 (blocking)**: release-readiness.js 가 전 PoC br-cross-consistency critical/high=0 의무. poc-04 현재 extractRules `[]` = vacuous pass. 가시화 시 critical/high emit 가능 → release-readiness 11/11 hard block 위험. 코드 착수 전 dry-run 의무 / critical·high = in-scope data fix.
- **Q5 STOP-2 (cooling-off)** → 본 plan 이미 인지 (시행 = cooling-off 후). ★ 사용자 결단 = 정식 DEC gate (schema edit 전) / v5.0.0 MAJOR = 24h cooling-off 가중. ②-순서 STOP 없음 (① 단독 먼저 = 정답).
- confidence 88% (Q4 severity = dry-run 실행 의존 / 본 research §4 에서 해소).

## §2. official-docs (_base-official-docs-checker) — F-015 독립 fetch / 전 항목 VERIFIED

- **Q1 `deprecated` keyword** → ★ VERIFIED — JSON Schema draft 2020-12 §9.3 Meta-Data vocabulary annotation (assertion 아님 / validation pass/fail 무영향 / `deprecated:true` 도 valid). [json-schema.org/draft/2020-12/json-schema-validation]
- **Q2 anyOf branch 제거** → ★ VERIFIED — 제거 branch 에서만 valid 하던 인스턴스 = invalid 필연 (validation outcome 변경 = backward incompatible). [json-schema.org/understanding-json-schema/reference/combining]
- **Q3 semver MAJOR** → ★ VERIFIED — "MAJOR MUST be incremented if any backward incompatible changes" / FAQ "아무리 작은 backward incompatible 도 MAJOR". 필드 제거로 valid→invalid = MAJOR 필수. [semver.org]
- 본 plan 가정과 CONTRADICTS = 0.

## §3. industry-case (_base-industry-case-researcher) — 5 사례

- **우세 패턴 = deprecation period + migration 도구** (ESLint @eslint/eslintrc shim / TypeScript `ignoreDeprecations`+ts5to6 / Kubernetes 9개월 grace + 3중 계측 / Babel RFC 2-phase).
- **순수 즉시 제거** = OpenAPI 3.0→3.1 `nullable` (단 명확한 목적 = JSON Schema 완전 정렬 / 생태계 도구 회귀 단기 비용 감수).
- ★ **Q4 latent-bug-fix precedent EXISTS** — OpenAPI 3.1 더 엄격한 validation 이 3.0 에서 비가시였던 undocumented 3 필드 노출 ("schema drift detection caught three undocumented fields invisible under less-strict 3.0"). breaking = 결함 수정 기회 precedent 문서화 (poc-04 가시화 framing 정당화).
- 함의 — 산업 우세는 deprecation period 이나, 그 근거(외부 consumer 보호)가 본 레포에 부재 → context-specific (A) hard kill 방어 가능 + OpenAPI nullable (명확 목적=canonical SSOT 정렬 시 즉시 제거) precedent.

## §4. ★ ★ ★ 코드 착수 전 STOP-1 실측 (Senior blocking 해소)

```
poc-04 rules_manual_authored 3 BR → business_rules canonical 변환 → br-cross-consistency-validator:
  findings = 3 / severity 분포 = { low: 3 } / critical·high = 0
  gate_status = pass / overall_score 0.85 (= threshold)
  BR: BR-FE-AUTH-REQUIRED-001 / BR-FE-AUTH-OWNERSHIP-001 / BR-FE-FLOW-DELETE-REDIRECT-001
```

- **STOP-1 해소** — poc-04 가시화 = critical/high 0 → release-readiness 11/11 hard block ❌ / 잠재 결함 수정 = 회귀 아닌 **개선 실측 확정** (Senior Q4 입증 / no-simulation).

## §5. ★ 종합 결론

- 설계 = **(A) hard kill** + canonical 단일 `business_rules` + **v5.0.0 MAJOR** (Q3 사실 확정 / 선택지 아님) + poc-01·poc-04 in-commit migration.
- `rules_auto_extracted_reference` = ★ **① scope 외 / 별도 carry** (Senior Q1 / semantic-rename ≠ alias 폐기 / LL 정합).
- summary aliases (`rule_summary`/`rules_summary`) = ① 동반 가능 (순수 alias / poc-02·poc-04 2곳 / scope 내 정합) — 사용자 결단.
- ★ cooling-off — v5.0.0 MAJOR + breaking = CLAUDE.md cadence 24h 권고 / 사용자 결단 = 정식 DEC gate (코드 착수 전).
- STOP-1 실측 해소 → 시행 시 release-readiness 11/11 안전 (poc-04 low only).
