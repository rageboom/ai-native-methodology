# DEC-2026-05-26-baseline-delta-operating-model

> v10.0.1 PATCH — DEC-2026-05-21 carry `C-v4.1-baseline-delta-운영-문서화` 종결. "초기 1회 full analysis + 신규 건 delta 갱신" 운영 모델을 `methodology-spec/baseline-delta-operating-model.md` 로 명문화. additive doc / breaking 0.

- **결단 일자**: 2026-05-26 (v10.0.1 PATCH)
- **결단자**: 윤주스 (TF Lead) — "정리해줘 그리고 carry 실행해줘" (폐기된 v4.1 브랜치 개념 점검 → 잔여 carry 실행)
- **범주**: doc / 운영 모델 명문화 (baseline carry 규약)
- **상태**: 승인 / breaking 0 / PATCH

## 컨텍스트

폐기된 v4.1 브랜치 계보(feat/v4.1-*)의 개념이 현 main(v10.0.0)에 적용할 게 있는지 점검한 결과: discovery/plan stage·hooks 정합·plan-agent·traceability 확장은 v9.0.0~v10.0.0 에서 모두 완성됨. **유일하게 미해소된 깨끗한 doc carry = `C-v4.1-baseline-delta-운영-문서화`** (DEC-2026-05-21 carry 표).

기계장치(canonical global `.aimd/output/` · `baseline-<date>.json` ADR-010 · scope work-unit `.aimd/<scope>/` · `work-unit-manifest.related_artifacts` 역인덱스 · `sync_state` M4 · `chain-driver sync`)는 v3.2 G3 이래 실재하나, **이들을 묶은 "운영 모델/cadence" 서술 문서가 부재** (grep 확인). 실 사용자가 레거시를 시간에 걸쳐 점진 적용할 때 핵심인데 코드가 아니라 빠져 있었음.

(점검 부수 발견: poc-재실행 = 무거운 검증/v10.x · input-skill-이관 = `analysis-from-*` + `discovery-from-*` 공존 처분 결단 필요 → 본 PATCH 제외 / 별도 carry.)

## 결정

`methodology-spec/baseline-delta-operating-model.md` 신설 (additive). 내용:

### §1. 두 baseline axis 구분
- **분석 baseline** = canonical global `.aimd/output/` (사실 스냅샷)
- **품질 baseline** = `.aimd/baseline-<date>.json` (ADR-010 ratchet 기준선)
- 혼동 금지 (axis 다름).

### §2~§4. 운영 cadence 3 단계 + baseline carry 규약
1. **초기 1회**: full analysis → canonical global + baseline-<date>.json (반복 ❌).
2. **신규 건마다**: `chain-driver init --scope <slug>` → `related_artifacts` 역인덱스 + scope-local subset 로 baseline 상속(재분석 ❌) → chain 1~5 scope slice.
3. **레거시 변경 시**: 변경 영역만 재분석 → canonical global 부분 갱신 → M4 `sync_state.drift_detected` → `chain-driver sync --scope` 통제된 cascade (전체 재분석 ❌).
- carry 규약: 단일 baseline source(참조 ❌복제) / drift 자동감지·cascade 수동 / 품질 baseline 단조(ratchet up only) / iter-N carry (`inherited_from.carry_artifacts`).

### §5. axis 정합
운영 모델 = process cadence 효율 규약 / chain harness 70~80% axis + §3-A axis metric 불변.

## STOP-3

workspace test pass (보존) + release-readiness (v10.0.1 target) + skill-citation 0 stale + version 3-way 10.0.1 + breaking 0 = PATCH.

## carry (본 PATCH 외 / 점검 중 식별)

- **C-v4.1-poc-재실행** — 기존 PoC 에 plan stage(plan-spec/task-plan) 산출물 추가 재실행. plan-agent(v10.0.0) 검증 성격 / 무거움 / v10.x+.
- **C-v4.1-input-skill-이관** — `analysis-from-{prompt,swagger,plan-doc,figma}` 와 `discovery-from-{analysis-output,swagger,figma,nl-md}` 공존. 중복 처분(deprecate/흡수/관계 명문화) = 사용자 결단 필요.
- **(부수 발견)** v10.0.0 lifecycle-contract.md 자산 매핑 매트릭스가 plan 을 아직 "PLACEHOLDER / gate deferred" 로 서술 = v10.0.0 axis A 구현과 prose drift 가능성 (별도 점검 carry).

## 인용

- DEC-2026-05-21-chain-discovery-plan-stage-도입 (carry 모 결단 / 본 DEC 가 `C-v4.1-baseline-delta-운영-문서화` Resolves)
- ADR-010 (baseline + ratchet / quality baseline axis)
- `schemas/work-unit-manifest.schema.json` (related_artifacts / sync_state M4)
