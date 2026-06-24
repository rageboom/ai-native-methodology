---
name: discovery-converge-inputs
description: chain (discovery) 공통 sub-skill. 멀티 입력(어댑터 4종 discovery-from-* 출력)을 토론 거쳐 단일 discovery-spec 으로 수렴 — UC 중복 병합 + business_rules_intent 통합 + 충돌 4분류(Conflict Surface) 표면화. discovery-spec.json = 단일 SSOT("우리 합의 PRD"). gather-first/draft-second. 사용자 (자연어 직접 호출 시): "입력 수렴" / "PRD 합치기" / "충돌 정리". S3 (MIS-373).
allowed-tools: Read, Glob, Grep
---

# discovery-converge-inputs

여러 입력 어댑터(`discovery-from-analysis-output` / `-swagger` / `-figma` / `-nl-md`)의 출력을 **하나의 합의된 discovery-spec** 으로 수렴하는 sub-skill. discovery-agent 호출 절차 step 4(Merge + 충돌 해소)의 정식 책임자.

> **단일 SSOT = discovery-spec.json**. 사용자가 보는 "PRD 문서"는 이 spec 의 plan-review-server HTML 렌더 뷰일 뿐 — 별도 PRD 마크다운 산출 ❌ (json 단독 SSOT / two-eyes SUPERSEDED).

## 언제 사용

- 입력이 **2종 이상**일 때 (어댑터 병렬 dispatch 후 use-cases-decompose·br-intent-extract 정규화 다음, discovery-spec-compose phase).
- 입력이 1종이어도 호출 가능 (이 경우 `conflicts` = 빈 배열 / 단순 pass-through).

## 입력

- 각 어댑터의 use_cases / business_rules_intent / nfr / io_contracts 부분 산출 (정규화 후).
- 각 항목의 `source_grounded_evidence` (출처 채널 식별 — 어느 입력에서 왔나).

## 수렴 원칙 (gather-first / draft-second — 패턴 C)

1. **먼저 전부 수집·정규화** 한 뒤 단일 draft 를 만든다. 입력별로 따로 spec 을 만들지 않는다.
2. **UC 중복 병합** — 같은 actor + 같은 domain outcome 의 UC 는 1개로 병합, `source_grounded_evidence` 는 기여한 모든 입력의 ref 를 합집합으로 보존(출처 손실 ❌).
3. **business_rules_intent 통합** — 같은 `br_id` 는 1개로, reasoning 은 가장 강한 출처(observed > inferred-consequence) 우선.
4. **충돌·간극은 삭제하지 말고 표면화** — 임의 해소 ❌. `conflicts[]` 로 올리고 해소는 사람 gate.

## 충돌 4분류 (Conflict Surface / 패턴 D)

수렴 중 입력 간 불일치를 `conflicts[]` 에 등재. 각 충돌은 `classification` 으로 분류:

| classification | 뜻 | 예 |
| --- | --- | --- |
| `common-theme` | 여러 입력이 같은 방향 (중복/보강) | swagger + nl-md 가 같은 endpoint 의도 |
| `requirement-conflict` | 요구가 서로 모순 | figma "삭제 즉시" vs nl-md "soft-delete 후 30일" |
| `political-vs-real` | 표면 포지션 vs 진짜 우려 분리 필요 | "모든 필드 필수" 주장 ↔ 실제 핵심 3개 |
| `technical-tradeoff` | 기술 선택 트레이드오프 | sync vs async 처리 |

- `resolution_candidate` = 다수 만족 가능 타협 후보(제안만 / **AI 단독 확정 ❌**).
- 해소되면 `resolved: true` + `resolution_ref` 로 `decisions[]` 또는 DEC 에 backward link.
- 미해소 충돌은 `pending_decisions[]` 에도 등재 → gate#1 user-explicit 전환(D4).

## 산출

수렴된 단일 `discovery-spec` 의 `use_cases[]` / `business_rules_intent[]` / `nfr[]` + 신규 `conflicts[]`. 모든 항목 `source_grounded_evidence` 의무(수렴 과정에서도 환각 ❌ / no-simulation).

## source-grounded 의무

병합·수렴은 **출처를 합치는 것**이지 새 사실을 만드는 것이 아니다. 병합된 UC/intent 의 evidence 합집합이 비면 등록 ❌. 충돌의 `sources[]` 는 실제 입력 ref 여야 한다.

## 인용

- master plan §B chain 1
- discovery-spec.schema.json `conflicts[]` / `use_cases[]` / `pending_decisions[]` 정합
- ADR-CHAIN-001 §1 (json 단독 SSOT)
- DEC-2026-05-21-chain-discovery-plan-stage-도입 (discovery stage 책임)
- DEC-2026-05-26-discovery-input-bodies (입력 어댑터 4종 paradigm)
