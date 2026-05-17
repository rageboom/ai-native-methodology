---
name: analysis-quality-antipattern
description: Use after all `api` + `ui` phase outputs to consolidate antipatterns.json + migration-cautions.md (산출물 6 + 7). Final SDLC analysis stage step. Composite View 패턴 거절 (PoC #02 정착). Stage = analysis.
allowed-tools: Read, Glob, Grep, Bash, Write
---

# analysis-quality-antipattern — Quality 통합 (Antipatterns + Migration-cautions)

분석 stage 의 마지막. 누적 finding / cross-validation 결과 → antipatterns + migration-cautions 통합.

## 사전 조건

- `api` + `ui` phase 산출물 모두 존재 (BE/DB/FE 트랙별 해당)
- finding 누적 존재 (`<user-project>/.aimd/findings.md`)

## 절차

1. **Anti-pattern 분류** — finding 중 패턴 단위 추상화 가능한 것. ★ `id-conventions.md` §3 카테고리 9종 (DB·ARCH·DOMAIN·API·FE·VALIDATION·CONFIG·SECURITY·PERFORMANCE) 정합 + 실 PoC #04 사용 패턴 (`AP-FE-{SUB}-NNN`):
   - AP-API-XXX (BE)
   - AP-DB-XXX (DB)
   - AP-DOMAIN-XXX (도메인 모델 위반)
   - AP-ARCH-XXX (아키텍처 위반)
   - AP-FE-RENDER-XXX / AP-FE-STATE-XXX / AP-FE-FETCH-XXX (FE / 실 사용 `AP-FE-SEC-EVAL` 패턴 정합)
   - AP-FE-A11Y-XXX (FE / 접근성)
   - AP-FE-I18N-XXX (FE / 다국어)
   - AP-VALIDATION-XXX / AP-CONFIG-XXX / AP-SECURITY-XXX / AP-PERFORMANCE-XXX (cross-cutting)
2. **★ Composite View 패턴 거절** — 복합 AP 등록 거절. 단일 패턴별로만 등재. (memory `feedback_composite_view_pattern.md`)
3. **migration_advice 의무** — 각 anti-pattern 마다 `migration-cautions.md` 의 회피 방법 명시 (DEC-2026-04-29-안티패턴-마이그레이션-가이드)
4. **antipatterns.json 작성** — `schemas/antipatterns.schema.json`
5. **migration-cautions.md 작성** — 사람이 읽는 회피 가이드
6. **§8.1 단일 PoC 과적합 회피** — 격상 / 처분 / 순서 결정 시 ≥2 PoC corroboration 의무 (CLAUDE.md ★★★)

## 산출물

- `<user-project>/.aimd/output/antipatterns.json`
- `<user-project>/.aimd/output/migration-cautions.md`

## 본체 명세

- `methodology-spec/workflow/quality.md`
- `methodology-spec/deliverables/6-antipatterns.md`
- `schemas/antipatterns.schema.json`
- DEC-2026-04-29-안티패턴-마이그레이션-가이드
