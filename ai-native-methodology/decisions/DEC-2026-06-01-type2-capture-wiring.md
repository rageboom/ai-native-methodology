# DEC-2026-06-01-type2-capture-wiring

> Type 2 adopter corroboration 캡처 배선 (schema + packager 도구 + check30 + suggest 트리거). v11.29.0 MINOR.

## 맥락

session 63차 — 사용자 "잔여 이어서" → STATUS 핸드오프 의제 ②③ 확인 → AskUserQuestion: ② = 2nd distinct 도메인 dogfood 대상 = `alvaromrveiga/ecommerce-backend`(NestJS+Prisma 전자상거래) 확정(후속) / ③ = **캡처 배선만 이번 세션 빌드**. 근거 = `plan-type2-external-adoption.md` §Phase 1 감사 — capture readiness **0.08**(최대 공백) = 외부 adopter(Type 2)가 chain harness 1 cycle 완주해도 결과 담을 schema·트리거·익명화·수집경로 전무 (EXT-CAPTURE-01/03/04/05).

## 결정 (additive / breaking 0 / 결정론)

1. **C1 schema** `schemas/adopter-corroboration.schema.json`(47번째): plugin_version / adopter{opaque adopter_id, org_type enum} / project{opaque project_hash, stack_signals, scenario(work-unit-manifest 재사용), loc_bucket enum 고정) / chain_run{gates #1~#5 = state.last_gate shape 재사용} / findings_summary / coverage(opt) / user_feedback(opt) / anonymization{applied, redaction_count, method}. top-level `additionalProperties:false`.
2. **C2 도구** `tools/adopter-evidence-packager`(26번째): state+manifest+findings+matrix → 익명화 corroboration → ajv → leak guard → `.aimd/output/adopter-corroboration.json`. opaque ID = sha256(salt+id)(가명화 관행). PII best-effort redaction(email/절대경로/private-key/IP/사내host) + post-redaction leak guard(잔존 PII → exit 1 + 위반 필드 경로). AI 0%.
3. **C3 트리거 (suggest-not-autofire)**: chain-driver `cmdNext` gate #5(terminal/`!next`) stderr suggest + `implement-verify-test-pass` skill step 9. 자동 file-write ❌ = adopter 데이터 주권 / consent (ticket-sync R20 confirmation gate 동질).
4. **C4 게이트 check30 `adopter_corroboration_capture`**(release-readiness 29→30): schema draft-2020-12+strict + packager bin + golden round-trip(exit 0) + leak-guard discrimination(poisoned → exit 1) = content-aware.

## 근거 (4원칙)

- §1 plan = `.claude/plans/plan-type2-capture-wiring.md`. 기존 자산 전수 숙지(state.schema last_gate / work-unit-manifest scenario / chain-driver cmdNext / db-assets 도구 템플릿 / release-readiness check·self-test / check27 PII regex).
- §2 2-agent lightweight research: official-docs(salt+sha256 가명화=VERIFIED / **opt-in 권장=CONTRADICTS**(Next.js·.NET=opt-out → consent 재프레이밍) / draft-2020-12=VERIFIED / regex redaction=best-effort VERIFIED) + Senior **GO_WITH_REVISE@0.82**(REVISE 1~5 흡수 / §8.1 forward-looking 확인 + inflation 경고).
- §3 사용자 "진행 — suggest 모델" + 4 컴포넌트 + REVISE 5종.
- **REVISE 5종 흡수**: ① terminal-only 트리거(ticket-sync 충돌 회피) ② **PII regex SSOT** `tools/_shared/pii-patterns.js`(check27 import / 복사 ❌ drift attractor) ③ leak-guard 필드 경로 보고(silent wall ❌) ④ loc_bucket enum 고정 ⑤ negative fixture(leak guard exit 1).

## 검증 (no-simulation / 실 CLI)

- packager 14 test(round-trip/redaction/leak-guard/결정론/write/usage) + schema-validator +5(valid/required/pattern/enum/strict) + release self-test 14→15(check30 discrimination) + chain-driver 268 무회귀 / workspace **1037** / release-readiness **30/30** / version 3-way 11.29.0 / skill-citation 0 stale / breaking 0 = MINOR.
- **F-EXT-CAPTURE-001 RESOLVED** (캡처 schema·트리거·익명화 배선 신설).

## §8.1 (정직 / Senior 확인)

forward-looking capability — corrective drift ❌ (외부 adopter 가 필요로 하는 missing rail 신설 / "우리 도구 우리가 고치기" 아님). ★ **green check30 ≠ "Type 2 corroboration 달성": 배선 출하 / Type 2 측정 = 0 / 실 외부 adopter 실행 대기**(no-simulation). gate-class 아님(write-class·opt-in·consent·결정론).

## 잔여 carry

- ② ≥2 distinct 도메인 dogfood (확정: `alvaromrveiga/ecommerce-backend`) — 진짜 측정 / §8.1 2nd distinct domain.
- ③ public-OSS 공개(조직 결정) + preflight codegraph/gradle(EXT-PREFLIGHT) + `${CLAUDE_PLUGIN_ROOT}` 경로 치환(EXT-PATH) + ledger 산입 자동화(EXT-CAPTURE-04 — 현 .aimd/output 생성까지 / 수집 경로는 adopter 명시 공유).
- F-EXT-PREFLIGHT-001 / F-EXT-PATH-001 / F-EXT-PUBLIC-OSS-001 = carry (③ 착수 시).

Extends DEC-2026-06-01-readme-sync. plan `.claude/plans/plan-type2-capture-wiring.md` + `plan-type2-external-adoption.md`.
