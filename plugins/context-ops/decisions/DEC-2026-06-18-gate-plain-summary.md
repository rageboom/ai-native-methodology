# DEC-2026-06-18-gate-plain-summary

- **일자**: 2026-06-18 (**v0.62.0 MINOR** — gate 결정 근거 평이 요약 레이어 신설 / additive)
- **카테고리**: gate UX — go/stop/revisit 판단 근거를 "영어 약어·jargon 나열" → **결정론 한 줄 평결 + [평이 라벨 — 무슨 뜻 — 권장 행동]**(균형형)
- **상태**: 승인 (사용자[TF Lead] "gate 근거가 영어 약어·줄임말이라 go/stop 확인이 어렵다 / 간략한 섬머리가 알아듣기 쉬우면 좋겠다" → 6 서브시스템 audit 진단 → AskUserQuestion 적용범위=**도구+skill 양쪽** / 스타일=**균형형** 확정 → plan 승인)
- **관계**: `ADR-CHAIN-002`(go/stop gate UX / §1-A 평이 요약 레이어 신설) · `ADR-CHAIN-003`(revisit) · `feedback_chain_driver_deterministic_axis`(reason→라벨 = 고정 lookup = 결정론 / verdict = `HARD_BLOCK_CODES` SSOT 재사용 / LLM inject ❌) · `feedback_diagnose_before_design_check_existing`(기존 평이 자산 부재 실측 후 설계) · `feedback_methodology_body_priority`(본체 격상) · `feedback_answer_questions_before_acting`(질문 먼저 답).

## 맥락 (왜)

각 chain gate(#0~#5)에서 사용자가 go/stop/revisit 을 결단해야 하는데, gate 가 보여주는 "근거"가 `validator_critical` / `coverage 0.62 < threshold 0.85` / `Layer 2 llm_consistency_score 0.61 < 0.7 (NL ↔ GWT semantic ...)` / `s2_outcome_mismatch` / `forward_coverage` / `5종 물증` / `mechanical trio (ii)` 같은 **영어 약어·내부 jargon·ADR 참조의 나열** → "그래서 진행이냐 멈춤이냐"를 사용자가 읽어낼 수 없음.

6 서브시스템 audit(gate skill / chain-driver gate-eval / traceability-matrix / revisit-detector / gate criteria / ADR·DEC) 결과: 근거를 제시하는 장치(ADR-CHAIN-002 §1 prompt + gate-eval reason)는 있으나 **한국어 평이 라벨 / 한 줄 평결 / glossary 자산은 전무**. 노출원은 결정론 도구(gate-eval `reason.detail` / cli.js stderr)와 LLM skill(SKILL.md 프롬프트 템플릿) **양쪽**.

## 결정 (도구+skill 양쪽 / 균형형 — 사용자 AskUserQuestion 확정)

2 레이어. 결정론/LLM 경계 준수 — reason→라벨은 고정 lookup(결정론), 의미적 조립만 skill.

### 결정 1 — 결정론 평이 요약 모듈 (chain-driver)

신규 `tools/chain-driver/src/gate-summary.js`: `REASON_LABELS`(11 code → 한국어 label/meaning/action 고정맵) + `summarizeGate(gateResult)`(verdict `go`/`review`/`stop`/`revisit` 도출 — hard-block 판정은 `gate-eval.HARD_BLOCK_CODES` **SSOT 재사용**, 중복 정의 금지) + `renderGateSummaryText()`(균형형 텍스트). **순수 결정론**(LLM inject ❌) / 출력은 어떤 결정적 gate 에도 inject ❌(display-only / trace-view 동형 신뢰모델). gate-eval `reason.detail` **무변**(영어 원문 = 추적 보존 / 기존 정규식 테스트 무영향).

### 결정 2 — cli.js 모든 gate 출력 경로 평이화

`next`(block/pass/dry-run) + `blockedExit`(persisted block 재호출) + `sync-next` 가 `renderGateSummaryText` 를 stderr 출력 + `--json` 에 `summary` 필드 노출. 영어 라인(`block_reason` / `primary_reason`)은 추적용 보존(평이 라벨을 앞·옆에 병기).

### 결정 3 — skill 프롬프트 평이화

`skills/_base-invoke-go-stop-gate/SKILL.md`: 입력 수집에 chain-driver `summary` 추가 + 프롬프트를 한 줄 평결(도구 `summary.headline` SSOT) + 막는 문제/검토 권장 [라벨—뜻—행동] + 영어 필드명 한국어 병기 + 3선택(go / stop / revisit:<단계>) 평이 설명으로 개정. **verdict 재판단 ❌**(도구가 SSOT).

### 결정 4 — 스타일 = 균형형

한 줄 평결 + [평이 라벨 — 무슨 뜻 — 권장 행동] + 핵심 수치("근거:" 줄 = 영어 원문) + 영어 code 괄호 병기. (초간략/상세 대비 균형형 선택 — glossary 전체 나열은 제외.)

## §8.1 정당화 (면제)

스키마·gate matrix·release check **무변경** / additive(신규 결정론 모듈 + skill 프롬프트 문구 + cli stderr). gate **판정 로직(gate-eval) 무변** — 표현 레이어만 추가. 검증 = chain-driver unit **606**(신규 25 / 회귀 0) + cli subprocess integration(navigate-cli·sync-next) 무회귀. dogfood = self(plugin 자기 gate-summary 경로). 본체 격상 트리거(MANDATORY 등재 등) 무 — gate UX 표현 정렬.

## over-claim 가드 (3항)

1. **"verdict 가 LLM 판단" ❌** — verdict 는 `blocked` + `HARD_BLOCK_CODES` 결정론 규칙. skill 은 문장만 다듬음(판정 불변).
2. **"영어 코드가 사라짐" ❌** — 추적용으로 괄호·"근거:" 줄 병기 보존(평이 라벨이 메인일 뿐 / 디버깅·grep 가능성 유지).
3. **"모든 gate 호출이 평이 요약을 강제" — 도구 stderr/`summary` 는 항상 산출 / skill 프롬프트 평이화는 LLM 이 skill 따를 때**(System B 패러다임 / `summary` 필드가 안전망).

## 시행 (무엇)

- NEW `tools/chain-driver/src/gate-summary.js`(REASON_LABELS·summarizeGate·renderGateSummaryText) · `tools/chain-driver/test/gate-summary.test.js`(25 test).
- EDIT `tools/chain-driver/src/gate-eval.js`(`HARD_BLOCK_CODES` export 만 / detail 무변) · `src/cli.js`(import + next/blockedExit/sync-next 5 출력 지점 + `summary` 필드).
- EDIT `skills/_base-invoke-go-stop-gate/SKILL.md`(입력 수집 + 프롬프트 평이화).
- DOC `docs/adr/ADR-CHAIN-002-go-stop-gate.md`(§1-A) · 본 DEC · `decisions/INDEX.md`.
- VERSION v0.61.0 → v0.62.0 (plugin.json · package.json · CHANGELOG · CLAUDE.md "현재" 줄).

## relates to

- `ADR-CHAIN-002` (§1-A 평이 요약 레이어 / 모).
- `feedback_chain_driver_deterministic_axis` (reason→라벨 = 결정론 lookup / verdict = HARD_BLOCK_CODES SSOT).
- `feedback_diagnose_before_design_check_existing` (기존 평이 자산 부재 실측 후 설계).
- `feedback_methodology_body_priority` (본체 격상 — examples/poc 보다 우선).
