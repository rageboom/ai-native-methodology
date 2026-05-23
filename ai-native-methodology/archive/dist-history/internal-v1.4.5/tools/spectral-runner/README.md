# spectral-runner

★ v1.2.4 / Sprint 5 — `@stoplight/spectral-cli` wrapper. Phase 5-1 openapi.yaml 의 진짜 외부 도구 검증.

## ★★★ no-simulation 정합

본 도구는 **진짜 외부 lint 도구** (Stoplight Spectral) wrapper. AI 추론 0%.

## 사용

```bash
# PoC #03 자가 검증
cd tools/spectral-runner
npx spectral lint ../../examples/poc-03/output/api/openapi.yaml \
  --ruleset ./.spectral.yaml \
  --format pretty
```

## ★★ Sprint 5 첫 실현 (2026-05-01)

PoC #03 자가 적용:
- **24 warnings / 0 errors** — exit 0
- 발견 카테고리:
  - `info-contact` (1) — info.contact 부재
  - `operation-description` (≈18) — operation description 부재
  - `operation-tags` (1) — root endpoint tags 부재
  - `oas3-unused-component` (1) — GenericError schema 미사용

→ ★ 신뢰도 80-87% → **85-92% 도달 가능 시점** (★ ADR-009 단계 4 — 진짜 도구 1회 실행).

## ruleset

`.spectral.yaml` — Spectral OpenAPI default ruleset (`spectral:oas`) 확장. 사내 표준 추가 시 본 파일 갱신.

## ADR-010 baseline 통합 (★ 후속 carry-over)

```bash
# baseline 생성
npx spectral lint <openapi.yaml> --format json > baseline.json
# ratchet (CI) — 신규 결함만 차단 (★ wrapper 별도 implementation 필요)
```

→ Sprint 6 carry-over.
