---
name: analysis-phase-5-error-mapping
description: Use when project is BE (Spring / NestJS / Express) AND has REST API endpoints that throw domain exceptions OR uses status code decorators (@Post / @ApiResponse). Generates error-mapping-spec.json (산출물 16). ★ AP-API-001 negative-space corroboration evidence 자동 추출. Real Semgrep custom rule execution mandatory (no-simulation policy / ADR-009 단계 5). Stage = analysis, manifest phase = 5-1 (api).
allowed-tools: Read, Glob, Grep, Bash, Write
---

# phase-5-error-mapping — BE Error Mapping Contract 분석

★ ★ ★ ADR-BE-001 negative-space corroboration 정식화 정합. ★ ★ AP-API-001 의 ★ 자동 회귀 도구 + ★ 신규 시스템 설계 시 contract 의무 명시.

## ★★★ no-simulation 절대 금지 (CLAUDE.md)

- ❌ AI sub-agent 에 "Spring docs / NestJS docs persona" 부여 시뮬레이션 금지 (★ ADR-009 단계 4 = -5%p 패널티)
- ✅ 진짜 Semgrep custom rule 실행 의무 (`tools/static-runner/rules/error-mapping-missing.yml`)
- ✅ 환경 부재 시 사용자 위임 (CI / drift-check.yml) 명시
- ✅ 5종 물증 의무 (`tool_version` / `stdout_path` / `stderr_path` / `invocation_timestamp` + `duration_ms` / `result_hash`)

## 사전 조건

- BE framework 식별 완료 (★ inventory.json / stack-detection.md → spring / spring-hexagonal / nestjs / express / fastapi 등)
- 진짜 Semgrep 환경 (★ pip 채널 / Python 3.10+ / v1.4.1 입증)

## 절차

1. **Framework detection** — `inventory.json.tech_stack.backend.framework` 분기:
   - `spring` / `spring-hexagonal` → Java rule 발동 (`internal.be.api.error-mapping-generic-exception-in-service`)
   - `nestjs` → TypeScript rule 발동 (`internal.be.api.error-mapping-nestjs-delete-201-decorator-drift`)
   - 기타 → ★ ★ carry / 사용자 명시 결단 (★ Express / FastAPI / Ktor 등 향후 sub-rule 신규 의무)

2. **Exception handler scan** — Spring `@ControllerAdvice` / `@RestControllerAdvice` / `@ExceptionHandler` 또는 NestJS `@Catch` / `@UseFilters` / global filter:
   ```bash
   # Spring side
   grep -rn "@ControllerAdvice\|@RestControllerAdvice\|@ExceptionHandler" <src>/ 

   # NestJS side
   grep -rn "@Catch\|@UseFilters\|app.useGlobalFilters" <src>/
   ```
   - ★ ★ 0 hit = ★ ★ ★ negative-space evidence (AP-API-001 trigger).

3. **★ Semgrep custom rule 실행** — `tools/static-runner/` 의 rules/error-mapping-missing.yml:
   ```bash
   PYTHONUTF8=1 node tools/static-runner/src/cli.js \
     --plugin semgrep \
     --target <src>/ \
     --output <output>/ \
     --ruleset p/owasp-top-ten \
     --extra-rules tools/static-runner/rules/error-mapping-missing.yml
   ```
   - Spring rule = `error-mapping-generic-exception-in-service` (★ throw_unmapped mechanism)
   - NestJS rule = `error-mapping-nestjs-delete-201-decorator-drift` (★ decorator-drift mechanism)

4. **★ ADR-010 baseline + ratchet 통합 의무** — legacy 진입 시 첫 분석 = baseline 등재 / 신규 결함만 차단:
   ```bash
   # 첫 run — baseline 작성
   node tools/static-runner/src/cli.js ... --write-baseline <output>/error-mapping-baseline.json
   # CI run — ratchet
   node tools/static-runner/src/cli.js ... --baseline <output>/error-mapping-baseline.json --ratchet
   ```
   - ★ critical/high severity = baseline 등재 ❌ (★ ADR-010 §2.3 = production blocker)

5. **HTTP status mapping 표 작성** — `error-mapping-spec.json` 의 `http_status_mapping` 배열:
   - 각 exception class × HTTP status × mapping mechanism (enum: response_status_annotation / exception_handler_method / exception_filter / default_resolver / response_entity_status / implicit_default / **throw_unmapped**)
   - `throw_unmapped` = ★ ★ ★ AP-API-001 trigger
   - RFC compliance 평가 (RFC 7231 / 9110 / OWASP API 매핑)

6. **NestJS decorator drift 분기** (★ NestJS framework 만):
   - `@Post('login')` without `@HttpCode(200)` → `post_default_201_for_login`
   - `@Delete + @ApiResponse({status: 201})` → `apiresponse_201_for_delete` (★ Semgrep 자동 detect)
   - `@Put + @ApiResponse({status: 201})` → `apiresponse_201_for_update`
   - `@HttpCode` 명시 0 → `missing_httpcode_explicit`
   - ★ ts-morph semantic 분석 = ★ ★ v1.5.1+ carry (★ Semgrep pattern-not-inside 한계)

7. **negative_evidence 4종 작성** (★ ★ ★ ADR-BE-001 정식 evidence):
   ```yaml
   negative_evidence:
     contract_absent:
       evidence_type: grep_zero_hit | ast_zero_match | ts_morph_zero_decorator | manual_review
       details: "예: 'grep -r @ControllerAdvice → 0 hit / Spring 2.5'"
     negative_effect: "예: '도메인 예외 → 500 leak / spec/runtime drift'"
     industry_standard:
       - "RFC 7231 §4.2.2"
       - "RFC 9110 §15.3"
       - "Spring docs / NestJS docs"
     automatic_regression_capable:
       tool: semgrep_custom_rule
       rule_path: tools/static-runner/rules/error-mapping-missing.yml
       rule_id: internal.be.api.error-mapping-generic-exception-in-service
   ```

8. **AP 등재** — anti-pattern 통합 (Phase 6):
   - `throw_unmapped` ≥ 1 + `exception_handlers` 빈 배열 → AP-API-001 critical 등재 의무
   - `decorator_drift` ≥ 1 → AP-API-001 high 등재 의무
   - cross_poc_isomorphic_count ≥ 2 BE PoC = ★ ★ ADR-BE-001 정합 (★ 본체 antipattern 카탈로그 격상 자격 자연 충족)

9. **error-mapping-spec.json 작성** — `schemas/error-mapping-spec.schema.json` 정합. framework_neutrality_score = ★ exception_class / http_status / mapping_mechanism axis 로 framework 무관 표준 → 1.0 목표.

## 산출물

- `<user-project>/.aimd/output/error-mapping-spec.json` (★ 산출물 16)
- raw Semgrep 출력 (`<user-project>/.aimd/output/tool-runs/error-mapping-*.sarif`)
- baseline 파일 (`<user-project>/.aimd/baseline/error-mapping-baseline.json`) — ADR-010

## CI 통합 (drift-check.yml 정합)

`.github/workflows/drift-check.yml` 의 body scan step + custom rule extra-rules 자동 통합. ★ jwt-rsa-custom-rule 패턴 정합 (★ a144b5a + b87cec5 + 4dcace9 commit cadence 입증).

## 본체 명세

- `methodology-spec/deliverables/16-error-mapping-spec.md` (★ ★ v1.5.1+ carry — full deliverable)
- `schemas/error-mapping-spec.schema.json` (v1.5.0 신설)
- `tools/static-runner/rules/error-mapping-missing.yml` (★ Spring + NestJS sub-rule 2종)
- `tools/static-runner/rules/error-mapping-missing.java` (★ Spring fixture)
- `tools/static-runner/rules/error-mapping-missing.ts` (★ NestJS fixture)
- ★ ★ ★ ADR-BE-001 (★ negative-space corroboration 정식화 / 본 skill 의 사상 origin)
- ★ ★ ADR-FE-007 (★ positive-space sister ADR)
- ADR-009 (5단계 신뢰도 모델)
- ADR-010 (baseline + ratchet)
- DEC-2026-04-29-static-tool-실행-의무화
- DEC-2026-05-02-jwt-rsa-custom-rule (★ negative-space rule 패턴 origin)
