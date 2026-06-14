# DEC-2026-06-15-matrix-schema-builder-align

**본체 PATCH v0.46.6 — traceability-matrix schema ↔ builder contract 정렬 (full-chain pilot dogfood-found / 결정론 산출물 정확성)**

## 맥락 (dogfood 발견)

ep-be-gea full-chain 캠페인 pilot(BC-RESV-BASE chain 2~5 / `wf_f8bd124e-c67`)의 gate#5 적대검증이, `chain5 implement` 산출 `matrix.json` 을 **canonical schema 로 explicit 검증**(auto-route 가 아닌)했을 때 폭로한 결함. strict 검증이 latent drift 노출 ([[feedback_strict_exposes_drift]]).

## 결함 (2건 / systemic)

### F-BODY-1 (medium / builder ↔ schema contract 분기)
- `traceability-matrix-builder/src/builder.js` (≈L230-262) 는 top-level header 로 **`{derived_from, do_not_edit_manually, matrix, coverage_summary}`** 를 emit (S5 provenance header / DO-178C·IEC 62304 bidirectional traceability 규약 / `_base-build-traceability-matrix` SKILL 명세).
- `traceability-matrix.schema.json` 은 `required:["meta","matrix","coverage_summary"]` + `additionalProperties:false`.
- → 빌더가 emit 하는 `derived_from`·`do_not_edit_manually` 는 additionalProperties 위반, `meta` 는 미emit → **빌더 산출물이 자기 canonical schema 를 항상 FAIL**.
- **systemic**: golf 포함 기존 9 full-chain BC + 신규 BC-RESV-BASE = **matrix 10/10 전부 동일**. 이전 full-chain run 이 explicit schema 검증을 안 해 잠복(auto-route 는 파일명 미스매치로 skip — F-BODY-2).
- **SSOT 판정**: builder 출력이 정답 — `builder.test.js` 가 `do_not_edit_manually===true` + `derived_from.includes(...)` 를 **고정**(테스트된 의도). schema 가 stale.

### F-BODY-2 (low / auto-route false-green skip)
- 산출 파일명 `matrix.json` → `schema-validator` 의 `inferSchemaName` 이 `matrix.schema.json`(미존재)으로 라우팅 → **silent skip(exit 0)** = false-green. canonical schema 명 = `traceability-matrix.schema.json`. matrix 산출물엔 `$schema_ref` 부재 → 키 기반 라우팅도 미발동.

## 결정 (사용자 확정 2026-06-15)

**(1) 캠페인 25 BC 더 돌기 전 지금 fix** (본체 우선 / [[feedback_methodology_body_priority]] — 미수정 시 25회 재발).
**(2) 방향 = schema 를 builder 에 정렬** (builder 출력 contract 불변 / 기존 10 BC matrix 무수정으로 valid화).

### 수정
- **`traceability-matrix.schema.json`**: `required` 에서 `meta` 제거(→ optional) + properties 에 `derived_from`(array<string>)·`do_not_edit_manually`(boolean) 추가 + `$schema_ref`/`$schema_origin`/`$comment` optional 허용(자기기술 라우팅 키 future-proof). `additionalProperties:false` 유지. matrix cell·coverage_summary 정의 무변(이미 valid — synthetic-meta probe 입증).
- **`schema-validator/src/cli.js` `inferSchemaName`**: `FILENAME_ALIASES = { matrix: 'traceability-matrix' }` 별칭 추가 → `matrix.json` auto-route 가 `traceability-matrix.schema.json` 해소(false-green skip 제거). `$schema_ref` 보유 산출물은 기존 1)단계에서 이미 처리되므로 무영향.
- **builder 무변경** (방향 결정 정합).

## 검증
- 기존 9 full-chain BC + BASE = **matrix 10/10 auto-route GREEN** (→ traceability-matrix.schema.json).
- 도구 테스트 무회귀: `traceability-matrix-builder` **179/179** · `schema-validator` **111/111** (0 fail).
- workspace test 1716/1718 pass / 0 fail. **release-readiness 42/42** (criteria_total 무변 — 신 check 없음).

## §8.1 (단일 PoC 과적합 회피)
correctness 수정(빌더↔스키마 contract 분기 / data 정확성) + **10 datapoint corroboration**(golf 포함 전 full-chain BC) → HARD-gate/정량 ceiling 아님 → 단일 결정론 정렬 + 기존 도구 test 회귀로 충분. 신 검증기·신 게이트 없음 → criteria_total 불변(count-coupling 무).

## Relates
- DEC-2026-06-12-golf-chain-validator-wiring (golf full-chain 검증기 wiring 모) · DEC-2026-05-06-v2.0-i-strict-채택 (traceability-matrix 도입) · [[feedback_strict_exposes_drift]] · [[feedback_methodology_body_priority]] · [[feedback_self_recorded_fact_validation]] (gate=arbiter / agent self-report 액면수용 ❌).
