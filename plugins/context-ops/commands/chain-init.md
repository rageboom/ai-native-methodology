---
description: chain harness 초기화 — grounding floor 점검 후 state.json + 첫 scope 생성, discovery 진입 준비 (1회성 부트스트랩 / 사용자 명시 결단 entry / DEC-2026-06-06-analysis-exit-gate 정합)
argument-hint: "<scope-slug> [S1|S2|S3|greenfield]"
---

# /chain-init — chain harness 초기화 (state + scope 부트스트랩)

분석(analysis) 산출물이 깔린 프로젝트에서 chain harness 를 켜고 첫 작업 scope 를 생성한다. init 전까지는 chain 단계추적·게이트가 **비활성**(orphan 산출물 쓰기만 차단)이며, 이 명령이 그 스위치다. **사용자 명시 결단 entry** (LLM auto-invoke ❌ / ADR-CHAIN-005 D21' 정합).

## 입력

- `$ARGUMENTS`: `<scope-slug> [scenario]`.
  - `scope-slug` **필수** — kebab-case (`^[a-z0-9][a-z0-9-]{1,63}$`). 첫 작업 단위 이름(예: `event-registration`).
  - `scenario` 선택 — `S1`(재생성) | `S2`(AX전환 / 주 타깃) | `S3`(특성화) | `greenfield`. 생략 시 chain-driver seed 추론.

## 절차

1. `<project>` = 현재 작업 디렉토리 절대경로.
2. **grounding floor 점검** (DEC-2026-06-29 draft-first / `minimalSubsetPresent` 정의): `<project>/.ai-context/base/`(read-alias: `output/`) 에 **architecture·domain·business-rules** 가 있어야 한다 — `base/shared/architecture.json` · `base/shared/domain.json` · `base/business-rules.json`. 하나라도 없으면 analysis 가 먼저라고 안내하고 **중단**:
   > 핵심 grounding floor(architecture·domain·business-rules)부터 분석(draft-first / 전체 ~21종 아님) 후 다시 `/chain-init`. 진입 스킬: 레거시 = `analysis-input-collection` / greenfield(PRD·디자인·계약) = `analysis-greenfield-bootstrap` / 멀티소스 = `analysis-input-orchestrate`.
3. `scope-slug` 가 비었으면 사용법(`/chain-init <scope-slug> [scenario]`)을 안내하고 중단.
4. **init 실행** (결정론 SSOT):
   ```
   node ${CLAUDE_PLUGIN_ROOT}/tools/chain-driver/src/cli.js init <project> --scope <slug> [--scenario <s>]
   ```
   exit code 해석:
   - `0` = 생성/추가 성공. 출력 state JSON 의 `current_scope` 를 확인한다.
   - `3` = state.json 이 이미 있고 동일 scope 거나 usage 오류 — 이미 초기화면 `/chain-next` 로 유도하고, slug 누락이면 (3) 안내.
5. 생성물(`state.json` / `scopes/<slug>/`)을 평이하게 요약하고 **discovery 진입을 안내**한다 — `/chain-next go`(게이트 평가 후 discovery 로 전이) 또는 discovery-agent dispatch.

## 주의

- init = 프로젝트당 사실상 1회 부트스트랩 (idempotent — 파일 부재 시만 생성 / 재호출 안전 / 기존 scope 보존).
- **grounding floor 전제** — analysis floor 없이 init 하면 discovery 가 참조할 baseline 이 없다(2번 게이트 이유). analysis 만 할 거면 init 자체가 불필요.
- 새 작업 단위 추가도 동일 — 이미 init 된 프로젝트에 `/chain-init <새-slug>` 면 scope 만 추가된다.
- chain 진입 후 stage 작업은 해당 stage sub-agent 에 위임 — main agent 가 직접 산출물을 쓰지 않는다.
- 되돌리기/명시 stage 진입은 `/chain-stage <name>`, 다음 stage 전진은 `/chain-next`.
