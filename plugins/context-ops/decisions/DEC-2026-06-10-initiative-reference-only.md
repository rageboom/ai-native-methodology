# DEC-2026-06-10-initiative-reference-only

> **Initiative = 실 프로젝트명 → ticket-sync 는 참조만, 생성 ❌.** cascade 실 생성 시작점 = Epic. parent_initiative 미상 시 자동 생성 금지 → 사용자에게 기존 키 질문.

**일자**: 2026-06-10
**카테고리**: 정정 (canonical / ticket lifecycle) — Initiative 생성 행위 제거
**상태**: 승인 — 사용자 결단 ("시작이 Initiative 는 아니다. Initiative 는 실제 프로젝트명이라 여기서는 참조는 가능하지만 만드는 행위는 하지 않는 게 맞다" → 전체 반영)
**Trigger**: "타깃 모를 때 물어보나" 논의 → 현 설계가 parent_initiative 미상 시 `[Migration] {scope} initiative` **자동 생성**하던 것 표면화 → Initiative=실 프로젝트명이라 생성 ❌ 가 맞음

---

## 1. 문제

cascade-builder Step 1 + ticket-sync 가 `parent_initiative` 미상 시 **Initiative 를 신규 생성**(`[Migration] {scope} initiative`). 그러나 **Initiative = 실 프로젝트(앱/제품)명** = 조직이 관리하는 최상위 단위 → 개발 cycle 도구가 만들 대상 아님. 참조(기존 키 사용)는 가능, **생성은 금지**가 맞음.

## 2. 결단

- **Initiative = 참조 전용.** ticket-sync / cascade-builder 는 Initiative 를 **절대 생성하지 않음**.
- `parent_initiative` (config/param/discovery) = 기존 Initiative 키 **참조** → Epic 의 최상위 부모.
- `parent_initiative` 미상 시 → cascade-plan `initiative_required=true` 신호 → **신규 생성 ❌**, 스킬이 사용자에게 질문(① 기존 키 지정 / ② jira_search 후보 선택 / ③ Initiative 없이 Epic top-level). 키 확보 후 재실행.
- **cascade 실 생성 시작점 = Epic** (참조 Initiative 하위 또는 top-level).

## 3. 변경 자산

| 자산 | 변경 |
| --- | --- |
| `tools/ticket-cascade-builder/src/builder.js` | Step 1 — Initiative create 구간 제거 / parent_initiative 있으면 참조(skip_prebound) / 없으면 `initiative_required=true` (생성 ❌) |
| `schemas/cascade-plan.schema.json` | `initiative_required` boolean 추가 |
| `tools/.../test/builder.test.js` | 순서 테스트 갱신(미상 시 Initiative call 0) + 참조 테스트 |
| `skills/ticket-sync/SKILL.md` | parent_initiative param + §단계 5(참조 전용 / 미상 시 질문) + phase=exit 선결 가드(initiative_required → 질문) |
| `methodology-spec/ticket-policy.md` | Layer 매핑·diagram·§5 summary — Initiative 생성 ❌ / 참조만 + Epic = 생성 시작점 |

## 4. 무영향 (불변)

- canonical 6종 유형 자체 불변 (Initiative 는 여전히 유형 / 단 "생성 대상"에서 제외).
- Epic/Story/Task/Sub-task 생성·델타·conformance (불변).
- breaking 0 (parent_initiative 제공 흐름 동일 / 미제공 흐름만 create→질문으로 변경 = 더 안전).

## 5. 엣지

- **greenfield (Initiative 자체 부재)**: 그래도 생성 ❌ — Epic top-level 또는 사용자가 Initiative 먼저 수동 생성 후 키 참조.
- **verification mode**: parent_epic 기반 (Initiative 무관 / 영향 없음).

## 인용

- 모: `DEC-2026-06-10-ticket-canonical-types` (canonical 6종) + `DEC-2026-06-10-ticket-cascade-builder`
- 운영: `tools/ticket-cascade-builder/src/builder.js` Step 1 + `skills/ticket-sync/SKILL.md` §단계 5 + `methodology-spec/ticket-policy.md`
