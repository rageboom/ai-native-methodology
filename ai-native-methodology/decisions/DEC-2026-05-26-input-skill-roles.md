# DEC-2026-05-26-input-skill-roles

> v10.0.4 PATCH — C-v4.1-input-skill-이관 결단 종결. `analysis-from-*` ↔ `discovery-from-*` 입력 어댑터 두 set 의 **timing+책임 분리** paradigm 명문화 (option α light). additive doc / breaking 0.

- **결단 일자**: 2026-05-26 (v10.0.4 PATCH)
- **결단자**: 윤주스 (TF Lead) — "최초에 분석은 analysis 에서 하는데 한번 분석이 끝난 프로젝트는 그냥 다양한 input 을 받도록 하고 싶다"
- **범주**: paradigm / input 어댑터 axis 분리 (baseline ↔ scope 진입)
- **상태**: 승인 / breaking 0 / PATCH

## 컨텍스트

DEC-2026-05-21 carry `C-v4.1-input-skill-이관` 의 결단:
- v9.0.0 신설 `discovery-from-*` 4종 (analysis-output / figma / swagger / nl-md) 중 3종(figma/swagger/nl-md)이 PLACEHOLDER 그대로 (v9.0.0/v10.0.0 동안 본격 구현 안 됨).
- analysis stage 의 `analysis-from-*` 4종 (figma / swagger / prompt / plan-doc) = 본격 구현 (MCP figma-desktop / openapi-parser 등).
- figma / swagger 2종 = 양쪽 stage 에 동일 source 입력 어댑터 = **실 중복**.

원 carry 의도: "discovery 신설 / analysis-from-* 흡수 여부는 본격 검토 후 결단" — 흡수 vs 평행 vs 양쪽 유지 vs 폐기 의 4 옵션 결단 의무.

사용자 결단 paradigm: **"최초 분석 = analysis stage / 이후 = 다양한 input 으로 chain 진입"** = baseline-delta 운영 모델 (v10.0.1 DEC-2026-05-26-baseline-delta-operating-model) 의 입력 측면.

## 결정 — option α light

### §1. 두 set 평행 유지 + timing/책임 분리

| set | timing | 책임 | skill |
|---|---|---|---|
| `analysis-from-*` (4) | **최초 1회** (legacy baseline 수립) | analysis 산출물 (visual-manifest / ui-state-map / inventory / domain 등 canonical global `.aimd/output/`) | `analysis-from-{figma, swagger, prompt, plan-doc}` ★ 모두 본격 구현 |
| `discovery-from-*` (4) | **신규 건마다** (scope 진입 trigger) | UC + intent + flow 추출 → planning-spec (discovery 산출) | `discovery-from-{analysis-output(★본격), figma(light placeholder), swagger(light placeholder), nl-md(light placeholder)}` |

**같은 source(figma/swagger/NL md) 라도 다른 timing/다른 책임**:
- baseline 시 figma → `analysis-from-figma` → visual-manifest / ui-state-map / design tokens 등 **analysis 산출물**.
- 신규 scope 진입 시 figma → `discovery-from-figma` → **UC + interaction flow + intent** → planning-spec.

중복 ❌ / 다른 axis ✅. baseline-delta 운영 모델의 입력 측면 정합.

### §2. light 본격 구현 deferred (use case 트리거 carry)

`discovery-from-{figma, swagger, nl-md}` 본격 구현(figma→UC 추출 알고리즘 등 substantive skill logic) = **실 use case 트리거 carry**:
- 해당 채널로 scope 진입하는 사용자 등장 시 본격 구현.
- 현 사내 배포 전 단계 (`project_pre_deployment_stage` memory 정합) ROI 낮음 = light placeholder 로 paradigm 만 확정.
- carry deadline 없음 (use case 트리거 의존).

### §3. 시행 (additive doc / breaking 0)

- 3 placeholder description 갱신: `skills/discovery-from-{figma, swagger, nl-md}/SKILL.md` first-line description = paradigm 반영 + analysis-from-* timing 분리 명시 + use case 트리거 carry 표기.
- `methodology-spec/lifecycle-contract.md` §자산 매핑 매트릭스 다음에 **§Input 어댑터 timing 분리** 신설 (두 set 평행 표 + 같은 source 다른 timing 설명).
- `guides/first-prompt-cookbook.md` §2.1 timing 분리 note.
- `decisions/DEC-2026-05-21-chain-discovery-plan-stage-도입.md` carry 표 `C-v4.1-input-skill-이관` ✅ 종결 표기.

## STOP-3

- release-readiness 20/20 ready (보존)
- skill-citation 0 stale + version 3-way 10.0.4 + breaking 0 = PATCH

## carry (본 PATCH 외 / use case 트리거 의존)

- `discovery-from-figma` 본격 구현 (figma → UC + flow 추출 / Track=FE)
- `discovery-from-swagger` 본격 구현 (openapi → UC + I/O contract 추출)
- `discovery-from-nl-md` 본격 구현 (NL md → UC + intent + NFR 추출 / NFR 1차 채널)

각각 실 use case 사용자 등장 시 별도 PATCH/MINOR 로 본격 구현.

## 인용

- DEC-2026-05-21-chain-discovery-plan-stage-도입 (C-v4.1-input-skill-이관 carry 모 결단)
- DEC-2026-05-26-baseline-delta-operating-model (v10.0.1 / baseline ↔ scope delta 운영 모델 = 본 결단 의 paradigm 출처)
- `methodology-spec/baseline-delta-operating-model.md` (운영 모델 spec)
