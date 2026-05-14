---
name: planning-extract-from-legacy
description: ★ ★ v2.0 chain 1 진입 skill (1차 single-case). analysis stage 7대 + 8 FE 산출물 + finding + antipatterns + migration-cautions 를 입력으로 planning-spec.{json,md} 추출. 모든 use_case + business_rules_intent 는 source_grounded_evidence (grep_hit_count > 0) 의무. AI 환각 차단이 1차 목적.
allowed-tools: Read, Glob, Grep, Bash, Write
---

# extract-from-legacy

★ ★ v2.0 chain 1 (planning) 의 **진입 skill**. 사용자 답변 1번 정합 — 1차 use case = legacy 추출 single-case (use case 4종 분기 = v2.1+ carry K-1).

## 언제 사용

- analysis stage 종결 후 chain 1 진입 시 의무.
- 사용자 자연어: "기획 단계 시작" / "planning-spec 만들어줘" / "legacy 분석 결과로 use case 추출해줘".

## 입력

`<project>/.aimd/output/` 안:
- 7대 산출물: inventory / domain / rules / architecture / schema / openapi / antipatterns
- 8 FE 산출물 (있으면): ui-spec / state-map / visual-manifest / a11y-spec / i18n-spec / static-security-spec / form-validation-spec / type-spec / legacy-spectrum
- Phase 4.5: state-machines / sequences / decision-tables / invariants
- finding-system: findings.json
- migration-cautions.md

## 산출물

- `<project>/.aimd/output/planning-spec.json` (★ schemas/planning-spec.schema.json 의무)
- `<project>/.aimd/output/planning-spec.md` (★ 사람 눈 / ADR-008 v2)

## ★ ★ ★ no-simulation 의무 (source-grounded)

planning-spec 의 모든 BR-INTENT 와 UC 는 다음 5 필드 중 하나 이상 grep-hit 의무:
- analysis BR-* match (`source_grounded_evidence.artifact: "rules"`)
- domain entity match (`source_grounded_evidence.artifact: "domain"`)
- API operation match (`source_grounded_evidence.artifact: "api"`)
- code file match (`source_grounded_evidence.file_paths[]`)
- antipattern reference (`source_grounded_evidence.artifact: "antipatterns"`)

`grep_hit_count: 0` 또는 `source_grounded_evidence` 부재 = ★ planning-extraction-validator 자동 차단 (`planning.no-source-grounded-evidence` / `planning.grep-hit-zero` finding).

## 절차

1. **input 확인** — 7대 산출물 + finding 모두 존재? 누락 시 사용자에게 명시 + analysis stage 재진입 권고.

2. **business_intent 추출** — domain.json + rules.json 에서 도메인 의도 (e.g., "user authentication" / "article lifecycle") 추출. 자연어 prompt + 사용자 검토 후 채움.

3. **use_cases 분해** — `decompose-use-cases` skill 호출. 산출 = `UC-{domain}-NNN` 목록.

4. **business_rules_intent 채움** — `identify-business-intent` skill 호출. 산출 = `BR-INTENT-NNN` 목록 + br_refs (rules.json 매핑).

5. **cross_links.to_analysis_artifacts 채움** — analysis 산출물 path 모두 backward link.

6. **`planning-extraction-validator` 자동 검증**:
   ```bash
   node tools/planning-extraction-validator/src/cli.js \
     --planning .aimd/output/planning-spec.json \
     --rules    .aimd/output/rules.json \
     --domain   .aimd/output/domain.json \
     --json
   ```
   - critical/high finding 0 의무 (source-grounded coverage ≥ 0.80).

7. **schema-validator 자동 검증**:
   ```bash
   node tools/schema-validator/src/cli.js .aimd/output/planning-spec.json
   ```

8. **planning-spec.md 렌더링** — json 의 use_cases / business_intent / business_rules_intent 를 markdown 으로 변환 (★ ADR-008 v2 이중 렌더링).

9. **gate #1 호출** — `_base/invoke-go-stop-gate` skill 호출. 사용자 검토 cluster 5~6:
   1. business_intent 정확성?
   2. 누락 use case 추가?
   3. 의문 BR-INTENT?
   4. cross_links 추가?
   5. chain 2 (spec) 진입?

## 70~80% 한계 명시

자동 추출 ≥ 80% / 사용자 검토 ≤ 20%. AI 가 추출한 use_case / BR-INTENT 는 **사용자 검토 의무**. 100% 자동화 ❌ (DEC-2026-05-06-v2.0-i-strict-채택 §70~80% 한계 정합).

## 인용

- ADR-CHAIN-001 §1 (이중 렌더링 chain 1)
- ADR-CHAIN-002 (gate UX)
- planning-spec.schema.json (deliverable 17)
- master plan §B chain 1
- DEC-2026-05-06-round-trip-부분-허용 (revisit:analysis 가능)

## 기술 스택 분기

`inventory.stack_signals` 정합 — Spring / NestJS / Django / Rails / Hexagonal 분기는 ★ analysis stage `phase-1-inventory` 차용 / 본 skill 에서는 도메인 추출만 (framework neutral).
