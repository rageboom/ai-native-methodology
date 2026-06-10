# DEC-2026-06-10-op-task-layer-agnostic

> **OP-* (Operational Task) = layer 무관 정정**. ticket cascade 의 Task(OP-*) 정의를 "BE only 운영" → "**사용자 가시 없는 운영 작업 (layer 무관)**" 으로 정정. 자산 전반 "BE only" 표기 제거.

**일자**: 2026-06-10
**카테고리**: 정정 (definition fix / drift correction) — ticket lifecycle OP-* 정의
**상태**: 승인 — 사용자 지적 ("이거 BE only 아니다" / "BE only 정정 진행")
**Trigger**: 티켓 최초 생성 stage 확인 세션 → Task(OP-*) 요약 시 "BE 전용" 표기 → 사용자 정정 요구

---

## 1. 문제 (drift)

v11.0.0 ticket paradigm 도입 시 OP-* 를 "**Story sibling / BE only 운영**" 으로 프레이밍 ([DEC-2026-05-26-ticket-plan-단일](DEC-2026-05-26-ticket-plan-단일.md) §7 / [DEC-2026-05-26-v11-paradigm-결단](DEC-2026-05-26-v11-paradigm-결단.md) §결단 #7). 그러나:

- `operational-task.schema.json` 의 `category` enum = `migration / cron / health-check / refactor / infra / ops / monitoring / security-patch / dependency-upgrade` — 이 중 **`refactor` · `dependency-upgrade` 등은 FE 도 해당** (BE 전속 아님).
- `methodology-spec/id-conventions.md` 의 정식 정의 = "**사용자 가시 없는 작업** (운영/인프라/마이그레이션)" — layer 언급 없음.
- `operational-task.schema.json` **top-level description** 도 이미 "사용자 가시 없는 운영/인프라/마이그레이션 작업 anchor" (= layer 무관) 로 올바름.

→ 즉 동일 자산 내부에서도 "BE only" 와 "사용자 가시 없는 작업" 이 **공존(자기 모순)**. "BE only" 가 과소 스코핑 오류 (insertion drift).

## 2. 결단

OP-* 를 **가르는 단일 축 = "사용자 가시 가치 변화 부재"** (no user-facing value change). **레이어(BE/FE/DB/infra)는 분류 축이 아님.**

- OP-* = Story / Sub-task(TASK-*) 의 **사용자 시나리오 axis 와 분리**된 운영 작업 anchor (AC 부재).
- FE 리팩터링 · FE 의존성 업그레이드 · FE 모니터링 등도 OP-* 대상.
- Story sibling / Jira `Task` level 매핑 (Epic 부재 가능) = 불변.

## 3. 정정 범위 (active body — "BE only" → "사용자 가시 없는 / layer 무관")

| 자산 | 위치 | 처리 |
| --- | --- | --- |
| `schemas/operational-task.schema.json` | `op_tasks[].description` | ✅ 정정 |
| `schemas/ticket-sync-evidence.schema.json` | ticket_cascade desc + op_tasks desc | ✅ 정정 |
| `templates/plan/task-plan.template.json` | OP 예시 title | ✅ 정정 |
| `skills/ticket-sync/SKILL.md` | frontmatter desc + paradigm 표 + Level 3 preview + Step 4 | ✅ 정정 (4곳) |
| `skills/plan-decompose-and-sequence/SKILL.md` | Task 행 | ✅ 정정 |
| `methodology-spec/ticket-policy.md` | 하위 단위 행 | ✅ 정정 |
| `methodology-spec/id-conventions.md` | — | 이미 올바름 (정정 불필요 / 본 정의의 reference) |

## 4. 결정 이력 처리

[DEC-2026-05-26-ticket-plan-단일](DEC-2026-05-26-ticket-plan-단일.md) + [DEC-2026-05-26-v11-paradigm-결단](DEC-2026-05-26-v11-paradigm-결단.md) = 역사 기록. inline "BE only" 표기는 **원문 보존** + 상단 정정 배너로 본 DEC 연결 (rewrite ❌ / 무엇을 결정했었나 보존).

## 5. 무영향 (불변)

- ticket 생성 시점 = plan stage 단일 (불변).
- 4-level cascade (Epic / Story / OP-* Task / TASK-* Sub-task) 구조 (불변).
- OP-* schema 구조 · category enum · ID 패턴 (불변 / 정의 텍스트만 정정).

## 인용

- 과소 스코핑 원본: DEC-2026-05-26-ticket-plan-단일 §7 / DEC-2026-05-26-v11-paradigm-결단 §결단 #7
- 정식 정의 reference: methodology-spec/id-conventions.md (Task / OP-*)
- schema: schemas/operational-task.schema.json (category enum = refactor·dependency-upgrade 등 FE 포함 근거)
