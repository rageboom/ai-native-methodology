---
name: discovery-clarify
description: chain (discovery) 공통 sub-skill. discovery-spec 의 커버리지 갭(모호/엣지케이스/누락정보/미해소충돌/암묵가정)을 스캔해 open_questions[]([NEEDS CLARIFICATION] 마커)로 누적 → gate#1 HTML 에서 일괄 Q&A. Spec Kit clarify(패턴 A) + known-mistake taxonomy(패턴 B). 비블로킹 기본(Auto Mode 안전). 사용자 (자연어 직접 호출 시): "clarify" / "확인 질문" / "빠진 거 물어봐". S5 (MIS-373).
allowed-tools: Read, Glob, Grep
---

# discovery-clarify

discovery-spec 를 훑어 **사용자에게 물어야 할 미해결 질문**을 `open_questions[]` 로 누적하는 sub-skill. "잦은 질의"를 턴마다 막는 대신 **한 세션(gate#1 HTML)에 모아** 던지는 것이 핵심 — Auto Mode·결정론 흐름을 깨지 않으면서 논의를 discovery 안에서 거의 끝낸다(shift-left).

> **비블로킹 기본** — open_questions 는 진행을 막지 않는다. `blocking:true` 인 것만 gate#1 stop 의무(pending_decisions 승격). 나머지는 HTML 에서 답하면 좋고, 미답이어도 carry(정직). mid-stage 블로킹 턴 ❌.

## 언제 사용

- discovery-spec-compose + dep-consult 직후, gate#1 직전 (질문 누적 마지막 단계).
- 사용자 직접 호출 (검토 전 "빠진 것" 점검).

## 커버리지 기반 질문 생성 (패턴 A/B — 자유 질의 ❌)

discovery-spec 전체를 읽고 아래 유형(taxonomy)별로 갭을 **체계적으로** 점검 → 각 갭을 1 질문으로. 자유 발상이 아니라 커버리지 체크(핵심 질문이 늦게 나오는 것 방지 / ReqElicitGym).

| category | 점검 |
| --- | --- |
| `ambiguity` | UC name/description 이 둘 이상으로 해석되나 |
| `edge-case` | 경계/실패/빈입력/동시성 시나리오가 UC·AC 에 없나 |
| `missing-info` | NFR(성능/보안/가용성) 미명시 / actor·precondition 공백 |
| `conflict-resolution` | `conflicts[]` 미해소(resolved=false) 항목 → 결정 질문 |
| `assumption` | source 없이 추론한 의도(intent_certainty=inferred/unverified) 확인 |

## 산출

discovery-spec 의 `open_questions[]` (각 entry: id `Q-NNN` / question / category / status=open / blocking(기본 false) / source). 결정 사안은 답변 후 `decisions[]`·`pending_decisions[]` 로 승격(`promoted_ref`).

## gate#1 HTML 일괄 Q&A

`_base-invoke-go-stop-gate` 가 plan-review-server 를 띄우면 open_questions 가 discovery 검토 화면에 노출된다. 사용자는 항목별로 클릭→답을 입력(plan-review-server prompt→`<phase>-revisions.json` 닫힌 루프)하고, 한 세션에 모아 답한다. answered 항목은 status=answered + answer 기록.

## 인용

- discovery-spec.schema.json `open_questions[]` / `pending_decisions[]` 정합
- DEC-2026-05-26-discovery-input-bodies (discovery 입력·gate paradigm)
- ADR-CHAIN-002 (go/stop gate UX)
