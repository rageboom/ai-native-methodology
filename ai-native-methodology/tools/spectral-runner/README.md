# spectral-runner/ — Spectral OpenAPI lint wrapper (진짜 외부 도구 / no-simulation 1호)

## Purpose

`@stoplight/spectral-cli` wrapper. Phase 5-1 openapi.yaml 의 **진짜 외부 도구 lint** (Stoplight Spectral). no-simulation 정책 1호 실현 (DEC-2026-05-01 v1.3.0 release).

## When to call

- **trigger**: Phase 5-1 (api) openapi.yaml 산출 후
- **호출자**: **사용자 또는 orchestrate 명시 호출** (no-simulation 정합 / auto-invoke ❌ / G2 LL-G2-06 정합 / 2026-05-15 carry 정정)
- **방식**: `npx spectral lint ...` (CLI passthrough / wrapper Node 진입 함수 부재)
- **carry** (v3.x): skill `analysis-openapi` 의 auto-invoke 통합은 chain-driver hooks-bridge 정합 결단 후 별도 시행. 현재 = LLM 양심 의존 auto-invoke ❌ / 사용자 명시 호출 의무 ([[feedback_no_static_tool_simulation]] 정합)

## Inputs

```bash
cd tools/spectral-runner
npx spectral lint <openapi.yaml> \
  --ruleset ./.spectral.yaml \
  --format pretty
```

npm install 의존성 (package-lock.json 128KB) — Spectral 공식 도구 정합. plugin install 후 wrapper 사용 시 `npm install` 필요.

## Outputs

- stdout: lint result (pretty / json / sarif format 선택)
- exit code: lint severity 기반

### v1.3.0 첫 실 실행 결과 (PoC #03)

- **24 warnings / 0 errors** — exit 0
- 발견 카테고리:
  - `info-contact` (1) — info.contact 부재
  - `operation-description` (≈18) — operation description 부재
  - `operation-tags` (1) — root endpoint tags 부재
  - `oas3-unused-component` (1) — GenericError schema 미사용

→ 신뢰도 80-87% → **85-92% 도달** (ADR-009 단계 4 — 진짜 도구 1회 실행).

## Exit codes

| code | 의미                      |
| ---- | ------------------------- |
| 0    | no errors (warnings 가능) |
| 1    | errors ≥ 1                |

## ruleset

`.spectral.yaml` — Spectral OpenAPI default ruleset (`spectral:oas`) 확장. 사내 표준 추가 시 본 파일 갱신.

## Sibling tools

- [`../static-runner/`](../static-runner/) — 진짜 외부 도구 #2 (R19 Tier 1 = Semgrep / Tier 2 = SARIF import for PMD·SpotBugs·CodeQL·Daikon)
- [`../formal-spec-link-validator/`](../formal-spec-link-validator/) — Phase 4.5 cross-link (api-extension.json formal_spec_links 검증)

## 참조

- [`../../methodology-spec/deliverables/3-api.md`](../../methodology-spec/deliverables/3-api.md)
- DEC-2026-05-01-v1.3.0-release — 첫 실 실행 record
- DEC-2026-04-29-static-tool-실행-의무화 — no-simulation 정책

## ADR-010 baseline 통합 (carry)

```bash
# baseline 생성
npx spectral lint <openapi.yaml> --format json > baseline.json
# ratchet (CI) — 신규 결함만 차단 (wrapper 별도 implementation 필요 / sub-plan 후속 carry)
```

## no-simulation 정합

본 도구는 진짜 외부 lint 도구 (Stoplight Spectral) wrapper. AI 추론 0%.
